/**
 * Popup UI 로직
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎨 Popup UI 초기화');

  // UI 요소
  const translateBtn = document.getElementById('translate-btn');
  const restoreBtn = document.getElementById('restore-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const apiKeyIndicator = document.getElementById('api-key-indicator');
  const pageStatusIndicator = document.getElementById('page-status-indicator');
  const errorSection = document.getElementById('error-section');
  const errorText = document.getElementById('error-text');
  const infoSection = document.getElementById('info-section');
  const infoText = document.getElementById('info-text');

  // 초기 상태 확인
  await checkStatus();

  // 이벤트 리스너
  translateBtn.addEventListener('click', handleTranslate);
  restoreBtn.addEventListener('click', handleRestore);
  settingsBtn.addEventListener('click', openSettings);

  /**
   * 상태 확인
   */
  async function checkStatus() {
    try {
      // API Key 확인
      const apiKeyResult = await chrome.runtime.sendMessage({
        type: 'CHECK_API_KEY'
      });

      if (apiKeyResult.success && apiKeyResult.hasApiKey) {
        apiKeyIndicator.textContent = '설정됨';
        apiKeyIndicator.className = 'status-value ok';
        translateBtn.disabled = false;
      } else {
        apiKeyIndicator.textContent = '미설정';
        apiKeyIndicator.className = 'status-value error';
        showError('API Key가 설정되지 않았습니다. 설정 페이지에서 입력해주세요.');
      }

      // 현재 탭의 번역 상태 확인
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab) {
        try {
          const statusResult = await chrome.tabs.sendMessage(tab.id, {
            type: 'CHECK_TRANSLATION_STATUS'
          });

          if (statusResult.isTranslated) {
            pageStatusIndicator.textContent = '번역됨';
            pageStatusIndicator.className = 'status-value translated';
            translateBtn.disabled = true;
            restoreBtn.disabled = false;
          } else {
            pageStatusIndicator.textContent = '원본';
            pageStatusIndicator.className = 'status-value';
            restoreBtn.disabled = true;
          }
        } catch (error) {
          pageStatusIndicator.textContent = '확인 불가';
          pageStatusIndicator.className = 'status-value warning';
        }
      }

    } catch (error) {
      console.error('상태 확인 실패:', error);
      showError('상태 확인 중 오류가 발생했습니다.');
    }
  }

  /**
   * 번역 처리
   */
  async function handleTranslate() {
    try {
      hideMessages();
      translateBtn.disabled = true;
      translateBtn.classList.add('loading');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        throw new Error('활성 탭을 찾을 수 없습니다.');
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'START_TRANSLATION'
      });

      if (response.success) {
        showInfo('번역이 완료되었습니다!');
        await checkStatus();
      } else {
        throw new Error(response.error || '번역 실패');
      }

    } catch (error) {
      console.error('번역 실패:', error);
      showError(`번역 실패: ${error.message}`);
      translateBtn.disabled = false;
    } finally {
      translateBtn.classList.remove('loading');
    }
  }

  /**
   * 복원 처리
   */
  async function handleRestore() {
    try {
      hideMessages();
      restoreBtn.disabled = true;

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        throw new Error('활성 탭을 찾을 수 없습니다.');
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'RESTORE_ORIGINAL'
      });

      if (response.success) {
        showInfo('원본 페이지로 복원되었습니다.');
        await checkStatus();
      } else {
        throw new Error(response.error || '복원 실패');
      }

    } catch (error) {
      console.error('복원 실패:', error);
      showError(`복원 실패: ${error.message}`);
      restoreBtn.disabled = false;
    }
  }

  /**
   * 설정 페이지 열기
   */
  function openSettings() {
    chrome.runtime.openOptionsPage();
  }

  /**
   * 에러 메시지 표시
   */
  function showError(message) {
    errorText.textContent = message;
    errorSection.style.display = 'block';
    infoSection.style.display = 'none';
  }

  /**
   * 정보 메시지 표시
   */
  function showInfo(message) {
    infoText.textContent = message;
    infoSection.style.display = 'block';
    errorSection.style.display = 'none';

    // 3초 후 자동 숨김
    setTimeout(hideMessages, 3000);
  }

  /**
   * 메시지 숨기기
   */
  function hideMessages() {
    errorSection.style.display = 'none';
    infoSection.style.display = 'none';
  }
});
