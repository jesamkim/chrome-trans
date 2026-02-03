#!/bin/bash
# Chrome Web Store 패키징 스크립트

echo "🎁 Chrome Extension 패키징 시작..."

# 기존 zip 파일 삭제
if [ -f "chrome-trans-webstore.zip" ]; then
    rm chrome-trans-webstore.zip
    echo "✅ 기존 zip 파일 삭제"
fi

# 필요한 파일만 포함하여 zip 생성
zip -r chrome-trans-webstore.zip . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x "tests/*" \
  -x ".DS_Store" \
  -x "*.md" \
  -x "LICENSE" \
  -x "package*.json" \
  -x "*.sh" \
  -x ".claude/*" \
  -x "*.log"

echo ""
echo "✅ 패키징 완료!"
echo ""
echo "📦 생성된 파일: chrome-trans-webstore.zip"
echo ""
echo "다음 단계:"
echo "1. https://chrome.google.com/webstore/devconsole 접속"
echo "2. 개발자 계정 등록 ($5 일회성)"
echo "3. 'New Item' 클릭"
echo "4. chrome-trans-webstore.zip 업로드"
echo "5. Store Listing 정보 입력 (STORE_LISTING.md 참고)"
echo "6. Privacy Policy URL 입력 (GitHub Pages 등에 PRIVACY_POLICY.md 호스팅 필요)"
echo ""
echo "🔗 Privacy Policy 호스팅 옵션:"
echo "   - GitHub Pages: https://jesamkim.github.io/chrome-trans/PRIVACY_POLICY"
echo "   - GitHub Raw: https://raw.githubusercontent.com/jesamkim/chrome-trans/main/PRIVACY_POLICY.md"
echo ""
