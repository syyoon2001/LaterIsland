import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 서비스 계정 키 파일 경로 상수 지정 (app 폴더 내)
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../../app/LaterIsland_private_key.json');

// --format=json|csv|xlsx|md (기본값 json)
const formatArg = process.argv.find((arg) => arg.startsWith('--format='));
const FORMAT = formatArg ? formatArg.split('=')[1] : 'json';
if (!['json', 'csv', 'xlsx', 'md'].includes(FORMAT)) {
  console.error(`알 수 없는 --format 값: "${FORMAT}". json | csv | xlsx | md 중 하나를 사용하세요.`);
  process.exit(1);
}

// --uid=특정사용자UID (미지정 시 전체 사용자 순회)
const uidArg = process.argv.find((arg) => arg.startsWith('--uid='));
const TARGET_UID = uidArg ? uidArg.split('=')[1] : null;

console.log('사용법:');
console.log('  전체 사용자 백업: node scripts/backup-all-users.js --format=json|csv|xlsx|md');
console.log('  특정 사용자만 백업: node scripts/backup-all-users.js --uid=사용자UID --format=xlsx');
console.log('');

console.log(`[DEBUG] __dirname: ${__dirname}`);
console.log(`[DEBUG] Resolved SERVICE_ACCOUNT_PATH: ${SERVICE_ACCOUNT_PATH}`);
console.log(`[DEBUG] 출력 형식: ${FORMAT}`);
console.log(`[DEBUG] 대상 사용자: ${TARGET_UID ?? '전체'}`);

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`에러: 서비스 계정 키 파일을 찾을 수 없습니다. 경로: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}

// Admin SDK 초기화
console.log('[DEBUG] 서비스 계정 로드 성공');
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// --- Firestore 타임스탬프 -> ISO 문자열 변환 (admin SDK Timestamp 대응) ---
function toIsoString(value) {
  if (!value) return '';
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number') return new Date(value).toISOString();
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000).toISOString();
  return '';
}

// --- items/categories/tags 원본 배열을 스프레드시트 행(row)으로 변환 ---
// xlsx, csv 두 형식이 동일한 표 구조를 공유하므로 여기서 한 번만 구현한다.
function buildItemRows(items, categories, tags) {
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const tagNameById = new Map(tags.map((t) => [t.id, t.name]));
  return items.map((item) => ({
    '제목': item.title ?? '',
    '링크': item.link ?? '',
    '요약': item.summary ?? '',
    '카테고리': categoryNameById.get(item.categoryId) ?? '',
    '태그': (item.tagIds || []).map((id) => tagNameById.get(id)).filter(Boolean).join(', '),
    '완료 여부': item.isDone ? '완료' : '미완료',
    '생성일': toIsoString(item.createdAt),
  }));
}

function buildCategoryRows(categories) {
  return categories.map((c) => ({ '이름': c.name ?? '', 'ID': c.id }));
}

function buildTagRows(tags) {
  return tags.map((t) => ({ '이름': t.name ?? '', 'ID': t.id }));
}

// --- 형식별 writer ---

function writeJsonBackup(filePath, uid, items, categories, tags) {
  const backupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    userId: uid,
    categories,
    tags,
    items,
  };
  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');
  return [filePath];
}

function writeXlsxBackup(filePath, items, categories, tags) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(buildItemRows(items, categories, tags)), 'Items');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(buildCategoryRows(categories)), 'Categories');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(buildTagRows(tags)), 'Tags');
  XLSX.writeFile(workbook, filePath);
  return [filePath];
}

// 표준 CSV 이스케이프: 쉼표/큰따옴표/개행이 포함된 필드는 큰따옴표로 감싸고,
// 내부의 큰따옴표는 두 번 반복해 이스케이프한다.
function csvEscape(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function rowsToCsv(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(','));
  }
  return lines.join('\n');
}

function writeCsvBackup(basePath, items, categories, tags) {
  const itemsPath = `${basePath}-items.csv`;
  const categoriesPath = `${basePath}-categories.csv`;
  const tagsPath = `${basePath}-tags.csv`;
  fs.writeFileSync(itemsPath, rowsToCsv(buildItemRows(items, categories, tags)), 'utf8');
  fs.writeFileSync(categoriesPath, rowsToCsv(buildCategoryRows(categories)), 'utf8');
  fs.writeFileSync(tagsPath, rowsToCsv(buildTagRows(tags)), 'utf8');
  return [itemsPath, categoriesPath, tagsPath];
}

// 카테고리별 소제목(## 카테고리명) 아래 항목을 목록으로 정리. 카테고리가 없거나
// 매칭되는 카테고리 문서를 찾지 못한 항목은 "미분류" 섹션으로 묶는다.
function formatMarkdownItem(item, tagNameById) {
  const title = item.title ?? '';
  const bits = [];
  if (item.summary) bits.push(item.summary);
  const tagNames = (item.tagIds || []).map((id) => tagNameById.get(id)).filter(Boolean);
  if (tagNames.length > 0) bits.push(`태그: ${tagNames.map((t) => `#${t}`).join(' ')}`);
  if (item.link) bits.push(`[링크](${item.link})`);
  bits.push(item.isDone ? '완료' : '미완료');
  return `- **${title}** — ${bits.join(', ')}`;
}

function writeMarkdownBackup(filePath, uid, items, categories, tags) {
  const tagNameById = new Map(tags.map((t) => [t.id, t.name]));
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const UNCATEGORIZED = '미분류';

  const itemsByCategory = new Map();
  for (const item of items) {
    const categoryName =
      item.categoryId && categoryNameById.has(item.categoryId) ? categoryNameById.get(item.categoryId) : UNCATEGORIZED;
    if (!itemsByCategory.has(categoryName)) itemsByCategory.set(categoryName, []);
    itemsByCategory.get(categoryName).push(item);
  }

  // 카테고리 문서 등록 순서를 따르고, 미분류는 항상 마지막에 배치한다.
  const orderedCategoryNames = categories.map((c) => c.name).filter((name) => itemsByCategory.has(name));
  if (itemsByCategory.has(UNCATEGORIZED)) orderedCategoryNames.push(UNCATEGORIZED);

  const lines = [`# ${uid} 백업`, '', `내보낸 시각: ${new Date().toISOString()}`, ''];
  for (const categoryName of orderedCategoryNames) {
    lines.push(`## ${categoryName}`, '');
    for (const item of itemsByCategory.get(categoryName)) {
      lines.push(formatMarkdownItem(item, tagNameById));
    }
    lines.push('');
  }

  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  return [filePath];
}

async function backupAllUsers() {
  const startTime = Date.now();
  console.log('백업 스크립트를 시작합니다...');

  // 백업 폴더 경로 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  // 루트(또는 app 폴더) 기준 backups/YYYY-MM-DD 폴더 생성
  const backupDir = path.resolve(__dirname, `../../backups/${today}`);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  let processedCount = 0;

  try {
    console.log('[DEBUG] users 컬렉션 목록 조회 중...');
    // get() 대신 listDocuments()를 사용하면 데이터(필드)가 없는 빈 부모 문서(subcollection만 있는 문서)도 가져올 수 있습니다.
    const allUserRefs = await db.collection('users').listDocuments();

    console.log(`[DEBUG] 조회된 사용자 문서 수 (phantom 문서 포함): ${allUserRefs.length}`);

    let userRefs = allUserRefs;
    if (TARGET_UID) {
      const targetRef = allUserRefs.find((ref) => ref.id === TARGET_UID);
      if (!targetRef) {
        console.error('해당 사용자를 찾을 수 없습니다.');
        process.exit(1);
      }
      userRefs = [targetRef];
    }

    if (userRefs.length === 0) {
      console.log('저장된 사용자가 없습니다.');
      return;
    }

    console.log(`총 ${userRefs.length}명의 사용자 데이터를 백업합니다.\n`);

    for (const userRef of userRefs) {
      const uid = userRef.id;
      console.log(`[${uid}] 데이터 추출 중...`);

      // 하위 컬렉션 가져오기 (형식과 무관하게 한 번만 조회)
      const itemsSnapshot = await userRef.collection('items').get();
      const categoriesSnapshot = await userRef.collection('categories').get();
      const tagsSnapshot = await userRef.collection('tags').get();

      console.log(`[DEBUG] [${uid}] items: ${itemsSnapshot.size}개, categories: ${categoriesSnapshot.size}개, tags: ${tagsSnapshot.size}개 조회됨`);

      const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const tags = tagsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      let writtenPaths;
      if (FORMAT === 'xlsx') {
        writtenPaths = writeXlsxBackup(path.join(backupDir, `${uid}.xlsx`), items, categories, tags);
      } else if (FORMAT === 'csv') {
        writtenPaths = writeCsvBackup(path.join(backupDir, uid), items, categories, tags);
      } else if (FORMAT === 'md') {
        writtenPaths = writeMarkdownBackup(path.join(backupDir, `${uid}.md`), uid, items, categories, tags);
      } else {
        writtenPaths = writeJsonBackup(path.join(backupDir, `${uid}.json`), uid, items, categories, tags);
      }

      console.log(`[${uid}] 완료 -> ${writtenPaths.join(', ')}`);
      processedCount++;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n========================================');
    console.log(`백업 완료 요약`);
    console.log(`형식: ${FORMAT}`);
    console.log(`처리된 사용자 수: ${processedCount}명`);
    console.log(`총 소요 시간: ${elapsed}초`);
    console.log(`백업 경로: ${backupDir}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('백업 중 오류가 발생했습니다:', error);
  }
}

backupAllUsers();
