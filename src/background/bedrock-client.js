/**
 * Amazon Bedrock Client for Translation
 * Bearer API Key 인증 방식 사용
 * Claude Haiku 4.5 모델을 사용한 번역 API 클라이언트
 */

class BedrockClient {
  constructor() {
    this.region = 'us-west-2';
    this.modelId = 'global.anthropic.claude-haiku-4-5-20251001-v1:0';
    this.baseUrl = `https://bedrock-runtime.${this.region}.amazonaws.com`;
    this.authManager = new AWSAuthManager();
    this.isInitialized = false;
  }

  /**
   * 클라이언트 초기화
   */
  async initialize() {
    try {
      console.log('🔧 Bedrock 클라이언트 초기화 시작');

      // AWS 인증 관리자 초기화
      const authSuccess = await this.authManager.initialize();

      if (!authSuccess) {
        throw new Error('Bearer API Key가 설정되지 않았습니다. 설정 페이지에서 API Key를 입력해주세요.');
      }

      this.isInitialized = true;

      console.log('✅ Bedrock 클라이언트 초기화 완료:', {
        region: this.region,
        modelId: this.modelId
      });

      return true;

    } catch (error) {
      console.error('❌ Bedrock 클라이언트 초기화 실패:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * 텍스트 번역
   * @param {string} text - 번역할 텍스트
   * @param {string} targetLanguage - 목표 언어 (기본: 한국어)
   * @returns {Promise<string>} 번역된 텍스트
   */
  async translate(text, targetLanguage = '한국어') {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const payload = this._buildTranslationPayload(text, targetLanguage);

    try {
      const response = await this._invokeModel(payload);
      return this._extractTranslation(response);
    } catch (error) {
      console.error('❌ Translation failed:', error);
      throw error;
    }
  }

  /**
   * 번역 페이로드 생성
   */
  _buildTranslationPayload(text, targetLanguage) {
    return {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 8000,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: `You are a professional translator. Translate the following text to ${targetLanguage}.

IMPORTANT RULES:
- Maintain the original HTML structure and formatting
- Preserve all HTML tags (do NOT translate tag names)
- Translate only the text content
- Keep technical terms and proper nouns appropriate
- Maintain the tone and style of the original text
- Do NOT add any explanations or comments
- Return ONLY the translated text

Text to translate:
${text}`
        }
      ]
    };
  }

  /**
   * Bedrock 모델 호출 (Bearer Token 인증)
   */
  async _invokeModel(payload) {
    const url = `${this.baseUrl}/model/${this.modelId}/invoke`;

    // Bearer Token 인증 헤더 가져오기
    const authHeaders = this.authManager.getAuthHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bedrock API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * 응답에서 번역 텍스트 추출
   */
  _extractTranslation(response) {
    if (response.content && response.content.length > 0) {
      return response.content[0].text;
    }
    throw new Error('Invalid response format from Bedrock');
  }

  /**
   * 클라이언트 재초기화
   */
  async reinitialize() {
    this.isInitialized = false;
    await this.authManager.reinitialize();
    return await this.initialize();
  }
}

// Service Worker 환경에서 전역으로 등록
if (typeof globalThis !== 'undefined' && globalThis.chrome?.runtime) {
  globalThis.BedrockClient = BedrockClient;
}
