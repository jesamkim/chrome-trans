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

    case 'TRANSLATE_SELECTION':
      handleTranslateSelection(request, sendResponse);
      return true; // 비동기 응답

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

/**
 * 선택 영역 번역 처리
 */
async function handleTranslateSelection(request, sendResponse) {
  try {
    const { text } = request;
    console.log('🔄 선택 영역 번역 시작:', text.substring(0, 50) + '...');

    // 선택 영역 위치 가져오기
    const selection = window.getSelection();
    if (!selection.rangeCount) {
      throw new Error('선택 영역을 찾을 수 없습니다.');
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // 번역 요청
    const response = await chrome.runtime.sendMessage({
      type: 'TRANSLATE_SELECTION',
      text: text
    });

    if (response.success) {
      // 인라인 툴팁 표시
      showTranslationTooltip(response.translatedText, rect);
      sendResponse({ success: true });
    } else {
      throw new Error(response.error || '번역 실패');
    }

  } catch (error) {
    console.error('❌ 선택 영역 번역 실패:', error);
    showTranslationTooltip(`오류: ${error.message}`, null, true);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 인라인 번역 툴팁 표시
 */
function showTranslationTooltip(translatedText, rect, isError = false) {
  // 기존 툴팁 제거
  hideTranslationTooltip();

  const tooltip = document.createElement('div');
  tooltip.id = 'translation-tooltip';
  tooltip.className = 'translation-tooltip';

  // 스타일 설정
  tooltip.style.cssText = `
    position: absolute;
    background: ${isError ? '#fee2e2' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    color: ${isError ? '#991b1b' : 'white'};
    padding: 12px 16px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 999999;
    animation: fadeIn 0.2s ease-in;
    word-wrap: break-word;
    ${isError ? 'border: 2px solid #fecaca;' : ''}
  `;

  // 위치 설정
  if (rect) {
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    let top = rect.bottom + scrollY + 10;
    let left = rect.left + scrollX;

    // 화면 밖으로 나가지 않도록 조정
    const tooltipMaxWidth = 400;
    if (left + tooltipMaxWidth > window.innerWidth) {
      left = window.innerWidth - tooltipMaxWidth - 20;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  } else {
    // rect가 없으면 화면 중앙에 표시
    tooltip.style.top = '50%';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translate(-50%, -50%)';
  }

  // 내용 설정
  tooltip.textContent = translatedText;

  // 닫기 버튼 추가
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = `
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: ${isError ? '#991b1b' : 'white'};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  `;
  closeBtn.onmouseover = () => {
    closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
  };
  closeBtn.onmouseout = () => {
    closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
  };
  closeBtn.onclick = hideTranslationTooltip;

  tooltip.appendChild(closeBtn);

  // 애니메이션 스타일 추가
  if (!document.getElementById('translation-tooltip-style')) {
    const style = document.createElement('style');
    style.id = 'translation-tooltip-style';
    style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(tooltip);

  // 5초 후 자동 숨김 (에러가 아닐 경우)
  if (!isError) {
    setTimeout(hideTranslationTooltip, 5000);
  }

  // 클릭 시 툴팁 외부 클릭하면 닫기
  setTimeout(() => {
    document.addEventListener('click', handleOutsideClick);
  }, 100);
}

/**
 * 툴팁 외부 클릭 핸들러
 */
function handleOutsideClick(event) {
  const tooltip = document.getElementById('translation-tooltip');
  if (tooltip && !tooltip.contains(event.target)) {
    hideTranslationTooltip();
    document.removeEventListener('click', handleOutsideClick);
  }
}

/**
 * 인라인 번역 툴팁 숨기기
 */
function hideTranslationTooltip() {
  const tooltip = document.getElementById('translation-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
  document.removeEventListener('click', handleOutsideClick);
}
