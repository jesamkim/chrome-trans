# Chrome Web Store Listing

## Extension Name
Translation Assistant

## Tagline (132 characters max)
Fast AI translation powered by Amazon Bedrock Claude. Full page & quick selection translation without subscriptions.

## Category
Productivity

## Language
- Primary: English
- Additional: 한국어 (Korean)

---

## Detailed Description (English)

### Translation Assistant - Amazon Bedrock Powered

Fast, secure, and intelligent web page translation using Amazon Bedrock Claude Haiku 4.5.

**Perfect for professionals who:**
- Cannot use Google Translate due to corporate security policies
- Want high-quality AI translation without monthly subscriptions
- Need both full page and quick selection translation
- Value privacy and data security

### Key Features

✨ **Full Page Translation**
- Translate entire web pages with one click
- Maintains original layout and formatting
- Real-time progress tracking
- 2.5x faster with parallel processing technology

🎯 **Quick Selection Translation**
- Right-click on selected text to translate
- Beautiful inline tooltip display
- No page reload required
- Perfect for quick lookups

⚡ **Performance Optimized**
- Worker pool pattern for parallel chunk processing
- Typically 2-3x faster than sequential translation
- Dynamic content script injection
- Works on already-open pages

🔒 **Privacy & Security**
- Your API Key stays local (Chrome Storage)
- No data stored on external servers
- Direct connection to Amazon Bedrock
- Open source code on GitHub

### How It Works

1. Get your Amazon Bedrock API Key (us-west-2 region)
2. Install the extension
3. Enter your API Key in settings
4. Start translating!

**Full Page Translation:**
- Click extension icon → "Translate" button
- Watch real-time progress
- Click "Original Page" to restore

**Selection Translation:**
- Highlight any text
- Right-click → "Translate Selection"
- See translation in a tooltip

### Technical Highlights

- Chrome Extension Manifest V3
- Amazon Bedrock Claude Haiku 4.5 model
- Worker Pool pattern for concurrency control
- Dynamic content script injection
- Real-time progress tracking

### Requirements

- Amazon Bedrock API Key (us-west-2 region)
- Active AWS account with Bedrock access
- Chrome browser (version 88+)

### Open Source

This extension is MIT licensed and available on GitHub:
https://github.com/jesamkim/chrome-trans

Review the code, contribute, or fork for your own use!

### Support

- Report issues: https://github.com/jesamkim/chrome-trans/issues
- View documentation: https://github.com/jesamkim/chrome-trans

---

## 상세 설명 (한국어)

### Translation Assistant - Amazon Bedrock 기반

Amazon Bedrock Claude Haiku 4.5를 사용한 빠르고 안전하며 지능적인 웹페이지 번역 확장 프로그램입니다.

**이런 분들에게 완벽합니다:**
- 회사 보안 정책으로 Google Translate를 사용할 수 없는 경우
- 월 구독료 없이 고품질 AI 번역이 필요한 경우
- 전체 페이지와 선택 영역 번역이 모두 필요한 경우
- 개인정보와 데이터 보안을 중요하게 생각하는 경우

### 주요 기능

✨ **전체 페이지 번역**
- 클릭 한 번으로 웹페이지 전체 번역
- 원본 레이아웃과 서식 유지
- 실시간 진행률 표시
- 병렬 처리로 2.5배 빠른 속도

🎯 **선택 영역 빠른 번역**
- 선택한 텍스트에서 오른쪽 클릭으로 즉시 번역
- 아름다운 인라인 툴팁 표시
- 페이지 새로고침 불필요
- 빠른 단어/문장 찾아보기에 완벽

⚡ **성능 최적화**
- Worker Pool 패턴으로 병렬 청크 처리
- 순차 처리 대비 2-3배 빠른 속도
- 동적 콘텐츠 스크립트 주입
- 이미 열린 페이지에서도 즉시 작동

🔒 **개인정보 보호 & 보안**
- API Key는 로컬에만 저장 (Chrome Storage)
- 외부 서버에 데이터 저장 안 함
- Amazon Bedrock 직접 연결
- GitHub에 오픈소스 코드 공개

### 사용 방법

1. Amazon Bedrock API Key 발급 (us-west-2 리전)
2. 확장 프로그램 설치
3. 설정에서 API Key 입력
4. 번역 시작!

**전체 페이지 번역:**
- 확장 프로그램 아이콘 클릭 → "번역" 버튼
- 실시간 진행률 확인
- "Original Page" 버튼으로 원본 복원

**선택 영역 번역:**
- 텍스트 선택
- 오른쪽 클릭 → "선택 영역 번역"
- 툴팁으로 번역 결과 확인

### 기술적 특징

- Chrome Extension Manifest V3
- Amazon Bedrock Claude Haiku 4.5 모델
- 동시성 제어를 위한 Worker Pool 패턴
- 동적 콘텐츠 스크립트 주입
- 실시간 진행률 추적

### 요구사항

- Amazon Bedrock API Key (us-west-2 리전)
- Bedrock 액세스 권한이 있는 AWS 계정
- Chrome 브라우저 (버전 88 이상)

### 오픈소스

이 확장 프로그램은 MIT 라이선스로 GitHub에 공개되어 있습니다:
https://github.com/jesamkim/chrome-trans

코드를 검토하거나, 기여하거나, 포크하여 사용하세요!

### 지원

- 이슈 리포트: https://github.com/jesamkim/chrome-trans/issues
- 문서 보기: https://github.com/jesamkim/chrome-trans

---

## Screenshots

Use these images from the repository:
1. img/feature01.png - Context menu selection translation
2. img/feature02.png - Inline translation tooltip
3. img/feature03.png - Full page translation in progress
4. img/feature04.png - Translated page result

---

## Promotional Images (Optional)

### Small Tile (440x280)
Create a simple image with:
- Extension icon
- "Translation Assistant"
- "Powered by Amazon Bedrock"
- Clean purple gradient background

### Large Tile (920x680)
Create a feature showcase with:
- Split screen: Original vs Translated
- Extension icon and branding
- Key features listed

---

## Single Purpose Description (Required by Chrome)

This extension provides web page translation services using Amazon Bedrock Claude Haiku 4.5 API. It allows users to translate full web pages or selected text with their own API credentials.

---

## Permission Justifications

**activeTab**: Required to access and translate content on the current tab

**storage**: Required to securely store the user's Amazon Bedrock API Key and extension settings

**scripting**: Required to inject translation functionality into web pages

**contextMenus**: Required to add "Translate Selection" option to the right-click context menu

**host permissions (<all_urls>)**: Required to enable translation functionality on any website the user visits
