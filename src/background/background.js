/**
 * Chrome Extension Background Service Worker
 * 번역 요청 처리 및 Bedrock API 연동
 */

// Service Worker에서 다른 스크립트들을 로드
importScripts('aws-auth-manager.js');
importScripts('bedrock-client.js');
importScripts('translation-manager.js');

// 전역 변수
let bedrockClient = null;
let translationManager = null;

/**
 * Extension 설치/업데이트 시 초기화
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('🚀 AWS Translation Assistant 설치됨:', details.reason);

  // 기본 설정 초기화
  await initializeDefaultSettings();

  // Context Menu 생성
  createContextMenu();
});

/**
 * Extension 시작 시 초기화
 */
chrome.runtime.onStartup.addListener(async () => {
  console.log('🔄 AWS Translation Assistant 시작됨');

  // API Key가 있는지 확인 후 클라이언트 초기화
  try {
    const result = await chrome.storage.sync.get(['bedrockApiKey']);
    if (result.bedrockApiKey) {
      console.log('🔑 Bearer API Key 발견, Bedrock 클라이언트 초기화 시도...');
      await initializeClients();
    } else {
      console.log('⚠️ Bearer API Key가 없음, 설정 페이지에서 API Key를 입력해주세요.');
    }
  } catch (error) {
    console.warn('⚠️ 시작 시 초기화 실패:', error.message);
  }
});

/**
 * Context Menu 생성
 */
function createContextMenu() {
  chrome.contextMenus.create({
    id: 'translate-selection',
    title: '선택 영역 번역',
    contexts: ['selection']
  });
  console.log('✅ Context Menu 생성 완료');
}

/**
 * Context Menu 클릭 핸들러
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'translate-selection' && info.selectionText) {
    console.log('🔄 선택 영역 번역 시작:', info.selectionText.substring(0, 50) + '...');

    // Content Script로 번역 요청 전송
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'TRANSLATE_SELECTION',
        text: info.selectionText
      });
    } catch (error) {
      console.error('❌ 선택 영역 번역 실패:', error);
    }
  }
});

/**
 * 기본 설정 초기화
 */
async function initializeDefaultSettings() {
  const settings = await chrome.storage.sync.get([
    'bedrockApiKey',
    'targetLanguage'
  ]);

  // 기본값 설정
  const defaultSettings = {
    targetLanguage: settings.targetLanguage || '한국어'
  };

  await chrome.storage.sync.set(defaultSettings);
  console.log('✅ 기본 설정 초기화 완료:', defaultSettings);
}

/**
 * Bedrock 클라이언트 및 번역 매니저 초기화
 */
async function initializeClients() {
  try {
    bedrockClient = new BedrockClient();
    await bedrockClient.initialize();
    console.log('✅ Bedrock 클라이언트 초기화 성공');

    translationManager = new TranslationManager(bedrockClient);
    console.log('✅ Translation Manager 초기화 성공');

    return true;
  } catch (error) {
    console.warn('⚠️ 클라이언트 초기화 실패:', error.message);
    bedrockClient = null;
    translationManager = null;
    return false;
  }
}

/**
 * 메시지 핸들러
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 메시지 수신:', request.type);

  // 비동기 처리를 위해 즉시 true 반환
  handleMessage(request, sender, sendResponse);
  return true;
});

/**
 * 메시지 처리
 */
async function handleMessage(request, sender, sendResponse) {
  try {
    switch (request.type) {
      case 'TRANSLATE_PAGE':
        await handleTranslateRequest(request, sendResponse);
        break;

      case 'TRANSLATE_SELECTION':
        await handleTranslateSelection(request, sendResponse);
        break;

      case 'CHECK_API_KEY':
        await handleCheckApiKey(sendResponse);
        break;

      case 'REINITIALIZE':
        await handleReinitialize(sendResponse);
        break;

      default:
        sendResponse({ success: false, error: '알 수 없는 메시지 타입' });
    }
  } catch (error) {
    console.error('❌ 메시지 처리 실패:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 번역 요청 처리
 */
async function handleTranslateRequest(request, sendResponse) {
  try {
    console.log('🔄 번역 요청 처리 시작');

    // 클라이언트 초기화 확인
    if (!bedrockClient || !translationManager) {
      const initialized = await initializeClients();
      if (!initialized) {
        throw new Error('Bedrock 클라이언트 초기화 실패. API Key를 확인해주세요.');
      }
    }

    // 설정에서 목표 언어 가져오기
    const settings = await chrome.storage.sync.get(['targetLanguage']);
    const targetLanguage = settings.targetLanguage || '한국어';

    // 번역 실행
    const { textItems } = request;
    console.log(`📝 번역할 항목 수: ${textItems.length}`);

    const translatedItems = await translationManager.translateTexts(
      textItems,
      targetLanguage
    );

    console.log('✅ 번역 완료');

    sendResponse({
      success: true,
      translatedItems: translatedItems
    });

  } catch (error) {
    console.error('❌ 번역 실패:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * 선택 영역 번역 처리
 */
async function handleTranslateSelection(request, sendResponse) {
  try {
    console.log('🔄 선택 영역 번역 처리 시작');

    // 클라이언트 초기화 확인
    if (!bedrockClient || !translationManager) {
      const initialized = await initializeClients();
      if (!initialized) {
        throw new Error('Bedrock 클라이언트 초기화 실패. API Key를 확인해주세요.');
      }
    }

    // 설정에서 목표 언어 가져오기
    const settings = await chrome.storage.sync.get(['targetLanguage']);
    const targetLanguage = settings.targetLanguage || '한국어';

    // 선택된 텍스트 번역
    const { text } = request;
    console.log(`📝 선택 영역 번역: ${text.substring(0, 50)}...`);

    const translatedText = await bedrockClient.translate(text, targetLanguage);

    console.log('✅ 선택 영역 번역 완료');

    sendResponse({
      success: true,
      translatedText: translatedText
    });

  } catch (error) {
    console.error('❌ 선택 영역 번역 실패:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * API Key 확인
 */
async function handleCheckApiKey(sendResponse) {
  try {
    const result = await chrome.storage.sync.get(['bedrockApiKey']);
    const hasApiKey = !!result.bedrockApiKey;

    sendResponse({
      success: true,
      hasApiKey: hasApiKey
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * 클라이언트 재초기화
 */
async function handleReinitialize(sendResponse) {
  try {
    console.log('🔄 클라이언트 재초기화 시작');

    bedrockClient = null;
    translationManager = null;

    const initialized = await initializeClients();

    sendResponse({
      success: initialized,
      message: initialized ? '재초기화 성공' : '재초기화 실패'
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

console.log('🎉 Background Service Worker 로드 완료');
