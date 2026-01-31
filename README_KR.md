# 디지털엠파이어 II 스마트 도우미 (Empire Helper)

디지털엠파이어 II 입주민을 위한 공식 지원 에이전트 웹 애플리케이션입니다.

👉 **[상세 운영 가이드 (EMPIRE_HELPER_FINAL_GUIDE_KR.md)](./EMPIRE_HELPER_FINAL_GUIDE_KR.md)**


## 주요 기능
- **스마트 챗봇**: 2025 관리규약 및 2026 주차 규정 기반의 시스템 프롬프트 적용.
- **주차 요금 계산기**: 2026년 개정된 주차 요금 로직을 실시간으로 계산.
  - 최초 30분 무료.
  - 일일권(12시간, 10,000원) 및 시간권(1시간, 1,000원) 적용.
  - 할인권 중복 사용 (Stacking) 지원 및 최대 매수 제한 적용.
  - 파스텔 테마의 친근한 UI 제공.
- **퀵 메뉴**: 시설 예약, 공지사항, 관리규약 열람 기능.

## 시작하기

1. 의존성 패키지 설치:
   ```bash
   npm install
   ```

2. 개발 서버 실행:
   ```bash
   npm run dev
   ```

3. 브라우저에서 확인: [http://localhost:3000](http://localhost:3000)

## 기술 스택
- Next.js 14+ (App Router)
- Tailwind CSS (Pastel Theme)
- Lucide React (Icons)



배포 동기화 문제 해결 (Deployment Sync)
배포 시 스타일이 깨지는 현상의 원인인 '경로 설정'을 수정했습니다. basePath를 적용하고 GitHub Actions 워크플로우를 동기화하여 푸시를 완료했습니다. 사용자에게 GitHub 설정 확인 사항을 안내합니다.

Files Edited
Walkthrough
Task
ci.yml
next.config.ts
Progress Updates
1
GitHub Actions 및 빌드 설정 확인 중

2
next.config.ts의 basePath 설정 및 빌드 경로 최적화 중

3
GitHub Actions 워크플로우(ci.yml) 경로 수정 중

4
로컬 빌드 검증 및 GitHub 푸시 중

5
GitHub에 변경 사항 푸시 및 자동 배포 트리거 중

6
최종 조치 사항 보고 및 설정 안내 중

배포 환경의 스타일 깨짐 현상을 해결하기 위한 긴급 조치를 완료했습니다.

원인 분석: GitHub Pages는 username.github.io/repo-name/ 형태의 주소를 사용합니다. 이전 설정에서는 스타일(CSS) 파일이 / (루트) 경로에서 파일을 찾으려 했기 때문에 디자인이 적용되지 않은 생 HTML 상태로 보였던 것입니다.

조치 사항:

경로 수정: next.config.ts에 저장소 이름(/digital-empire-2-managing-system)을 인식하도록 basePath 설정을 추가했습니다.
배포 방식 현대화: 수동으로 관리하던 docs 폴더를 제거하고, 전문적인 GitHub Actions 방식으로 배포 프로세스를 일원화했습니다.
동기화 완료: 모든 수정 사항을 GitHub에 푸시했습니다.

