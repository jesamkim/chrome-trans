# Chrome Web Store 등록 체크리스트

## 준비 단계

### ✅ 완료된 사항
- [x] Extension 기능 구현 완료
- [x] Manifest V3 준수
- [x] 아이콘 3종 (16x16, 48x48, 128x128)
- [x] README 문서화
- [x] MIT 라이선스
- [x] GitHub 저장소 공개
- [x] Privacy Policy 작성 (PRIVACY_POLICY.md)
- [x] Store Listing 설명 작성 (STORE_LISTING.md)
- [x] 패키징 스크립트 (package-extension.sh)

### 📝 해야 할 사항

#### 1. Privacy Policy 호스팅 ⚠️ 필수
Chrome Web Store는 Privacy Policy URL이 필수입니다.

**옵션 A: GitHub Pages (추천)**
```bash
# GitHub Pages 활성화
# 1. GitHub 저장소 → Settings → Pages
# 2. Source: Deploy from a branch
# 3. Branch: main, 폴더: / (root)
# 4. Save

# Privacy Policy URL:
# https://jesamkim.github.io/chrome-trans/PRIVACY_POLICY
```

**옵션 B: GitHub Raw (간단)**
```
https://raw.githubusercontent.com/jesamkim/chrome-trans/main/PRIVACY_POLICY.md
```

**옵션 C: 개인 블로그/웹사이트**
- PRIVACY_POLICY.md 내용을 복사하여 호스팅

#### 2. Chrome Web Store 개발자 계정 등록
- URL: https://chrome.google.com/webstore/devconsole
- 비용: $5 (일회성, 카드 결제)
- Google 계정 필요

#### 3. AWS/Amazon 브랜드 사용 확인 (선택사항)
⚠️ Amazon 직원인 경우:
- "Translation Assistant" (현재 이름) - 문제 없음
- "Powered by Amazon Bedrock" - 일반적으로 괜찮음
- 필요 시 Legal/Brand 팀 확인 권장

---

## 등록 프로세스

### Step 1: 패키징
```bash
cd /Users/jesamkim/QCLI/chrome-trans
./package-extension.sh
```
생성 파일: `chrome-trans-webstore.zip`

### Step 2: Developer Dashboard 접속
1. https://chrome.google.com/webstore/devconsole
2. "New Item" 클릭
3. `chrome-trans-webstore.zip` 업로드

### Step 3: Store Listing 작성

#### Basic Info
- **Extension name**: Translation Assistant
- **Summary** (132자 이하):
  ```
  Fast AI translation powered by Amazon Bedrock Claude. Full page & selection translation without subscriptions.
  ```

#### Detailed Description
`STORE_LISTING.md` 파일의 "Detailed Description (English)" 섹션 복사

#### Category
- Primary: **Productivity**
- Secondary: (없음)

#### Language
- Primary: English
- Additional: 한국어

### Step 4: Graphic Assets

#### Icon (Required)
- File: `src/assets/icons/icon128.png`
- Size: 128x128 pixels

#### Screenshots (Required, 최소 1개)
다음 이미지 사용:
1. `img/feature01.png` - Context menu
2. `img/feature02.png` - Translation tooltip
3. `img/feature03.png` - Translation in progress
4. `img/feature04.png` - Translated result

크기 조정 필요 시:
- 1280x800 (권장)
- 또는 640x400

#### Promotional Images (Optional)
- Small tile: 440x280
- Large tile: 920x680
- (나중에 추가 가능)

### Step 5: Privacy & Compliance

#### Privacy Policy URL ⚠️ 필수
```
https://jesamkim.github.io/chrome-trans/PRIVACY_POLICY
또는
https://raw.githubusercontent.com/jesamkim/chrome-trans/main/PRIVACY_POLICY.md
```

#### Single Purpose
```
This extension provides web page translation services using Amazon Bedrock Claude Haiku 4.5 API.
```

#### Permission Justifications
`STORE_LISTING.md` 파일의 "Permission Justifications" 섹션 복사

#### Host Permission Justification
```
Required to enable translation functionality on any website the user visits.
```

#### Remote Code
- **Does this item use remote code?** NO

#### Data Usage
- **Does this item collect or transmit personal data?** YES
  - What: API credentials, text content for translation
  - Why: To authenticate with Amazon Bedrock and provide translation
  - Where: Sent to Amazon Bedrock API only

### Step 6: Distribution

#### Visibility
- **Public**: 누구나 검색 가능
- **Unlisted**: URL로만 접근 가능
- **Private**: 특정 사용자만 (Google Workspace 도메인)

추천: **Public** (일반 공개)

#### Regions
- **All regions**: 모든 국가에서 사용 가능

### Step 7: Review & Submit

#### Pre-submission Checklist
- [ ] Privacy Policy URL 확인
- [ ] 모든 스크린샷 업로드 확인
- [ ] Description 검토
- [ ] Permission 설명 작성
- [ ] 테스트 계정 정보 (필요 시)

#### Submit for Review
- 검토 기간: 1-3일 (보통 24시간 내)
- 이메일 알림 수신

---

## 검토 후

### 승인된 경우
- 자동으로 Chrome Web Store에 게시됨
- URL: `https://chrome.google.com/webstore/detail/[extension-id]`
- 사용자가 검색 및 설치 가능

### 거절된 경우
- 거절 사유 확인
- 수정 후 재제출

### 일반적인 거절 사유
1. Privacy Policy URL 없음 또는 접근 불가
2. 권한 설명 부족
3. 스크린샷 누락 또는 품질 문제
4. Description에 금지된 키워드 사용
5. 기능이 설명과 일치하지 않음

---

## 업데이트

### 새 버전 배포
1. `manifest.json`의 `version` 업데이트 (예: 1.0.0 → 1.0.1)
2. 변경 사항 구현
3. 다시 패키징
4. Developer Dashboard에서 업로드
5. "Submit for Review"

### 자동 업데이트
- 사용자가 자동으로 새 버전 받음
- 강제 업데이트 가능

---

## 유용한 링크

- Developer Dashboard: https://chrome.google.com/webstore/devconsole
- Developer Program Policies: https://developer.chrome.com/docs/webstore/program-policies/
- Best Practices: https://developer.chrome.com/docs/webstore/best-practices/
- Branding Guidelines: https://developer.chrome.com/docs/webstore/branding/

---

## 문제 해결

### Q: Privacy Policy를 어디에 호스팅해야 하나요?
A: GitHub Pages가 가장 쉽습니다. 저장소 Settings → Pages에서 활성화하세요.

### Q: 스크린샷 크기가 안 맞아요
A: https://www.iloveimg.com/resize-image 에서 크기 조정

### Q: 검토가 너무 오래 걸려요
A: 보통 24시간 내 완료. 48시간 이상이면 지원팀 문의

### Q: API Key를 사용자가 입력해야 하는데 괜찮나요?
A: 네, 많은 Extension이 사용자 API Key를 요구합니다. 명확히 설명만 하면 됩니다.

### Q: 무료인가요?
A: 개발자 등록비 $5만 있으면 됩니다. Extension 자체는 무료 배포 가능.

---

## 다음 단계

1. Privacy Policy 호스팅 (GitHub Pages 추천)
2. `./package-extension.sh` 실행
3. Developer Console에서 등록
4. 검토 대기 (1-3일)
5. 승인 후 게시! 🎉
