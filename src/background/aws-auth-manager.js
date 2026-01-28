/**
 * AWS 인증 관리자
 * Bearer API Key 인증을 관리
 */

class AWSAuthManager {
  constructor() {
    this.authType = 'api-key';
    this.credentials = null;
    this.region = 'us-west-2';
    this.isInitialized = false;
  }

  /**
   * AWS 인증 초기화 (Bearer API Key 전용)
   */
  async initialize() {
    try {
      console.log('🔐 AWS 인증 초기화 시작 (Bearer API Key 전용)');

      // API Key 인증 확인
      const apiKeyAuth = await this.checkAPIKeyAuth();

      if (apiKeyAuth.available) {
        this.authType = 'api-key';
        this.credentials = { apiKey: apiKeyAuth.apiKey };
        console.log('✅ Bearer API Key 인증 사용');
        this.isInitialized = true;
        return true;
      }

      console.log('❌ API Key가 설정되지 않았습니다');
      this.isInitialized = false;
      return false;

    } catch (error) {
      console.error('❌ AWS 인증 초기화 실패:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * API Key 인증 확인
   */
  async checkAPIKeyAuth() {
    try {
      const result = await chrome.storage.sync.get(['bedrockApiKey']);

      if (result.bedrockApiKey) {
        console.log('✅ Bearer API Key 발견');
        return {
          available: true,
          apiKey: result.bedrockApiKey
        };
      }

      console.log('ℹ️ Bearer API Key 없음');
      return { available: false };

    } catch (error) {
      console.debug('API Key 확인 실패:', error.message);
      return { available: false };
    }
  }

  /**
   * Bearer Token 인증 헤더 생성
   */
  getAuthHeaders() {
    if (!this.isInitialized) {
      throw new Error('AWS 인증이 초기화되지 않았습니다.');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.credentials.apiKey}`,
      'Accept': 'application/json'
    };
  }

  /**
   * 인증 상태 정보 반환
   */
  getAuthInfo() {
    return {
      isInitialized: this.isInitialized,
      authType: this.authType,
      region: this.region,
      hasCredentials: !!this.credentials
    };
  }

  /**
   * 인증 재초기화
   */
  async reinitialize() {
    this.isInitialized = false;
    this.credentials = null;
    return await this.initialize();
  }
}

// Service Worker 환경에서 전역으로 등록
if (typeof globalThis !== 'undefined' && globalThis.chrome?.runtime) {
  globalThis.AWSAuthManager = AWSAuthManager;
}
