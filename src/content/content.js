/**
 * Content Script
 * 페이지 번역 및 복원 기능
 */

console.log('✅ AWS Translation Content Script 로드됨');

// 번역 상태
let isTranslating = false;

/**
 * 메시지 리스너
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Content Script 메시지 수신:', request.type);

  switch (request.type) {
    case 'START_TRANSLATION':
      handleStartTranslation(sendResponse);
      return true; // 비동기 응답

    case 'RESTORE_ORIGINAL':
      handleRestoreOriginal(sendResponse);
      return true;

    case 'CHECK_TRANSLATION_STATUS':
      sendResponse({ isTranslated: domManager.isPageTranslated() });
      return false;

    case 'TRANSLATION_PROGRESS':
      updateTranslationOverlay(`번역 중... ${request.progress}%`);
      return false;

    default:
      sendResponse({ success: false, error: '알 수 없는 메시지 타입' });
      return false;
  }
});

/**
 * 번역 시작 처리
 */
async function handleStartTranslation(sendResponse) {
  if (isTranslating) {
    sendResponse({ success: false, error: '이미 번역 중입니다.' });
    return;
  }

  if (domManager.isPageTranslated()) {
    sendResponse({ success: false, error: '이미 번역된 페이지입니다.' });
    return;
  }

  try {
    isTranslating = true;

    // 진행 상태 표시
    showTranslationOverlay('번역 준비 중...');

    // 텍스트 노드 추출
    updateTranslationOverlay('텍스트 추출 중...');
    const textNodes = domManager.extractTextNodes();

    if (textNodes.length === 0) {
      throw new Error('번역할 텍스트가 없습니다.');
    }

    // 텍스트 항목 준비 (node 제외, id와 text만)
    const textItems = textNodes.map(({ id, text }) => ({ id, text }));

    // Background로 번역 요청
    updateTranslationOverlay(`번역 중... (${textItems.length}개 항목)`);

    const response = await chrome.runtime.sendMessage({
      type: 'TRANSLATE_PAGE',
      textItems: textItems
    });

    if (!response.success) {
      throw new Error(response.error || '번역 실패');
    }

    // 번역 결과 적용
    updateTranslationOverlay('번역 적용 중...');
    domManager.applyTranslation(response.translatedItems);

    // 성공 메시지 표시
    updateTranslationOverlay('✅ 번역 완료!');
    setTimeout(hideTranslationOverlay, 1000);

    sendResponse({ success: true });

  } catch (error) {
    console.error('❌ 번역 실패:', error);
    updateTranslationOverlay(`❌ 오류: ${error.message}`);
    setTimeout(hideTranslationOverlay, 3000);

    sendResponse({ success: false, error: error.message });
  } finally {
    isTranslating = false;
  }
}

/**
 * 원본 복원 처리
 */
function handleRestoreOriginal(sendResponse) {
  try {
    if (!domManager.isPageTranslated()) {
      sendResponse({ success: false, error: '번역된 페이지가 아닙니다.' });
      return;
    }

    showTranslationOverlay('원본 복원 중...');

    domManager.restoreOriginalDOM();

    updateTranslationOverlay('✅ 원본 복원 완료!');
    setTimeout(hideTranslationOverlay, 1000);

    sendResponse({ success: true });

  } catch (error) {
    console.error('❌ 복원 실패:', error);
    updateTranslationOverlay(`❌ 오류: ${error.message}`);
    setTimeout(hideTranslationOverlay, 3000);

    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 번역 진행 오버레이 표시
 */
function showTranslationOverlay(message) {
  let overlay = document.getElementById('translation-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'translation-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 18px;
    `;

    // 스피너 컨테이너
    const spinnerContainer = document.createElement('div');
    spinnerContainer.style.textAlign = 'center';

    // 스피너
    const spinner = document.createElement('div');
    spinner.className = 'translation-spinner';
    spinner.style.cssText = `
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    `;

    // 메시지
    const messageDiv = document.createElement('div');
    messageDiv.className = 'translation-message';
    messageDiv.textContent = message;

    spinnerContainer.appendChild(spinner);
    spinnerContainer.appendChild(messageDiv);
    overlay.appendChild(spinnerContainer);
    document.body.appendChild(overlay);

    // 스피너 애니메이션 추가
    if (!document.getElementById('translation-overlay-style')) {
      const style = document.createElement('style');
      style.id = 'translation-overlay-style';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  overlay.style.display = 'flex';
}

/**
 * 오버레이 메시지 업데이트
 */
function updateTranslationOverlay(message) {
  const overlay = document.getElementById('translation-overlay');
  if (overlay) {
    const messageDiv = overlay.querySelector('.translation-message');
    if (messageDiv) {
      messageDiv.textContent = message;
    }
  }
}

/**
 * 오버레이 숨기기
 */
function hideTranslationOverlay() {
  const overlay = document.getElementById('translation-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}
