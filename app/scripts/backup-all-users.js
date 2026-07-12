import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 서비스 계정 키 파일 경로 상수 지정 (app 폴더 내)
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../LaterIsland_private_key.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`에러: 서비스 계정 키 파일을 찾을 수 없습니다. 경로: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}

// Admin SDK 초기화
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

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
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('저장된 사용자가 없습니다.');
      return;
    }

    console.log(`총 ${usersSnapshot.size}명의 사용자 데이터를 백업합니다.\n`);

    for (const userDoc of usersSnapshot.docs) {
      const uid = userDoc.id;
      console.log(`[${uid}] 데이터 추출 중...`);

      // 하위 컬렉션 가져오기
      const itemsSnapshot = await db.collection('users').doc(uid).collection('items').get();
      const categoriesSnapshot = await db.collection('users').doc(uid).collection('categories').get();
      const tagsSnapshot = await db.collection('users').doc(uid).collection('tags').get();

      const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const tags = tagsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const backupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        userId: uid,
        categories,
        tags,
        items
      };

      const filePath = path.join(backupDir, `${uid}.json`);
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');
      
      console.log(`[${uid}] 완료 -> ${filePath}`);
      processedCount++;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n========================================');
    console.log(`백업 완료 요약`);
    console.log(`처리된 사용자 수: ${processedCount}명`);
    console.log(`총 소요 시간: ${elapsed}초`);
    console.log(`백업 경로: ${backupDir}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('백업 중 오류가 발생했습니다:', error);
  }
}

backupAllUsers();
