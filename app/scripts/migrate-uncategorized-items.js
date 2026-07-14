// 1회성 마이그레이션: categoryId가 없는(=구 "미분류") 항목을 사용자별 "기타"
// 카테고리로 옮긴다. "기타" 카테고리가 없는 사용자는 새로 생성한다.
// 이미 categoryId가 있는 항목은 절대 건드리지 않는다.
//
// 실행: npm run migrate:uncategorized  (app 폴더 기준)
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../LaterIsland_private_key.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`에러: 서비스 계정 키 파일을 찾을 수 없습니다. 경로: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const OTHER_NAMES = ['기타', 'other'];
const isOtherCategory = (name) => OTHER_NAMES.includes(String(name ?? '').trim().toLowerCase());

// 사용자의 "기타" 카테고리 ID를 반환. 이미 있으면 재사용(soft-delete된 것은
// 제외), 없으면 새로 생성한다. 기존 카테고리 생성/편집/삭제 로직(app 쪽
// addCategory)과 동일한 문서 형태로 만든다.
async function findOrCreateOtherCategoryId(userRef, categories) {
  const existing = categories.find((c) => !c.isDeleted && isOtherCategory(c.name));
  if (existing) return existing.id;

  const ref = await userRef.collection('categories').add({
    name: '기타',
    isDeleted: false,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

// Firestore 배치는 최대 500건까지만 허용되므로 청크 단위로 커밋한다.
async function commitInChunks(writes) {
  const CHUNK_SIZE = 450;
  for (let i = 0; i < writes.length; i += CHUNK_SIZE) {
    const batch = db.batch();
    for (const { ref, data } of writes.slice(i, i + CHUNK_SIZE)) {
      batch.update(ref, data);
    }
    await batch.commit();
  }
}

async function migrate() {
  console.log('미분류 항목 마이그레이션을 시작합니다...\n');

  const allUserRefs = await db.collection('users').listDocuments();
  console.log(`조회된 사용자 문서 수: ${allUserRefs.length}\n`);

  let usersAffected = 0;
  let itemsMigrated = 0;

  for (const userRef of allUserRefs) {
    const uid = userRef.id;

    const [itemsSnapshot, categoriesSnapshot] = await Promise.all([
      userRef.collection('items').get(),
      userRef.collection('categories').get(),
    ]);

    // 이미 categoryId가 있는 항목은 절대 건드리지 않는다.
    const uncategorizedDocs = itemsSnapshot.docs.filter((doc) => !doc.data().categoryId);
    if (uncategorizedDocs.length === 0) continue;

    const categories = categoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const otherCategoryId = await findOrCreateOtherCategoryId(userRef, categories);

    const writes = uncategorizedDocs.map((doc) => ({
      ref: doc.ref,
      data: { categoryId: otherCategoryId, updatedAt: FieldValue.serverTimestamp() },
    }));
    await commitInChunks(writes);

    usersAffected += 1;
    itemsMigrated += uncategorizedDocs.length;
    console.log(`[${uid}] ${uncategorizedDocs.length}개 항목 -> "기타"(${otherCategoryId})로 이전`);
  }

  console.log('\n========================================');
  console.log('마이그레이션 완료 요약');
  console.log(`영향받은 사용자 수: ${usersAffected}명`);
  console.log(`이전된 항목 수: ${itemsMigrated}개`);
  console.log('========================================\n');
}

migrate().catch((error) => {
  console.error('마이그레이션 중 오류가 발생했습니다:', error);
  process.exit(1);
});
