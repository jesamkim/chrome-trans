/**
 * Options 페이지 로직
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('⚙️ Options 페이지 초기화');

  // UI 요소
  const apiKeyInput = document.getElementById('api-key');
  const toggleApiKeyBtn = document.getElementById('toggle-api-key');
  const targetLanguageSelect = document.getElementById('target-language');
  const saveBtn = document.getElementById('save-btn');
  const statusMessage = document.getElementById('status-message');
  const statusText = document.getElementById('status-text');

  // 저장된 설정 로드
  await loadSettings();

  // 이벤트 리스너
  toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
  saveBtn.addEventListener('click', saveSettings);

  /**
   * 저장된 설정 로드
   */
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'bedrockApiKey',
        'targetLanguage'
      ]);

      if (result.bedrockApiKey) {
        apiKeyInput.value = result.bedrockApiKey;
      }

      if (result.targetLanguage) {
        targetLanguageSelect.value = result.targetLanguage;
      }

      console.log('✅ 설정 로드 완료');
    } catch (error) {
      console.error('설정 로드 실패:', error);
      showStatus('설정 로드 중 오류가 발생했습니다.', 'error');
    }
  }

  /**
   * 설정 저장
   */
  async function saveSettings() {
    try {
      const apiKey = apiKeyInput.value.trim();
      const targetLanguage = targetLanguageSelect.value;

      if (!apiKey) {
        showStatus('Bearer API Key를 입력해주세요.', 'error');
        return;
      }

      // 저장 시작
      saveBtn.disabled = true;
      saveBtn.classList.add('loading');

      await chrome.storage.sync.set({
        bedrockApiKey: apiKey,
        targetLanguage: targetLanguage
      });

      // Background 재초기화
      const response = await chrome.runtime.sendMessage({
        type: 'REINITIALIZE'
      });

      if (response.success) {
        showStatus('✅ 설정이 저장되었습니다!', 'success');
      } else {
        showStatus('⚠️ 설정은 저장되었으나 초기화에 실패했습니다.', 'error');
      }

      console.log('✅ 설정 저장 완료');

    } catch (error) {
      console.error('설정 저장 실패:', error);
      showStatus('설정 저장 중 오류가 발생했습니다.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.classList.remove('loading');
    }
  }

  /**
   * API Key 표시/숨김 토글
   */
  function toggleApiKeyVisibility() {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleApiKeyBtn.textContent = '숨김';
    } else {
      apiKeyInput.type = 'password';
      toggleApiKeyBtn.textContent = '표시';
    }
  }

  /**
   * 상태 메시지 표시
   */
  function showStatus(message, type) {
    statusText.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';

    // 성공 메시지는 3초 후 자동 숨김
    if (type === 'success') {
      setTimeout(() => {
        statusMessage.style.display = 'none';
      }, 3000);
    }
  }
});
