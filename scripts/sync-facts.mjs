import fs from 'fs';
import path from 'path';

const DOCS_DIR = './public/docs';
const DATA_FILE = './data/inquiry-facts.json';

/**
 * 이 스크립트는 새로운 PDF 파일이 업로드되었을 때 
 * Antigravity AI 에이전트에게 분석 요청을 보내기 위한 가이드입니다.
 */
async function syncFacts() {
    console.log("🔍 Scanning public/docs for new PDF files...");
    const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.pdf'));

    console.log(`📂 Found ${files.length} PDF files:`, files);

    console.log("\n---------------------------------------------------------");
    console.log("🤖 [AI 자동화 가이드]");
    console.log("Antigravity 에이전트에게 아래와 같이 요청하세요:");
    console.log("---------------------------------------------------------");
    console.log(`"public/docs/ 에 있는 파일들을 분석해서 data/inquiry-facts.json을 업데이트해줘. 
각 파일의 핵심 팩트를 추출해서 적절한 탭에 넣고, 새로운 탭이 필요하면 추가해줘. 
답변은 반드시 'fact'와 'detail'로 구분해서 팩트 위주로만 작성해."`);
    console.log("---------------------------------------------------------");
}

syncFacts();
