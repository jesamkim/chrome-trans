/**
 * Translation Manager
 * 번역 요청 관리 및 텍스트 분할 처리
 */

class TranslationManager {
  constructor(bedrockClient) {
    this.bedrockClient = bedrockClient;
    this.maxChunkSize = 3000; // 한 번에 번역할 최대 문자 수
    this.maxConcurrency = 3; // 동시 처리할 최대 청크 수
    this.cache = new Map(); // 번역 캐시
  }

  /**
   * 텍스트 배열을 번역
   * @param {Array<{id: string, text: string}>} textItems - 번역할 텍스트 항목들
   * @param {string} targetLanguage - 목표 언어
   * @returns {Promise<Array<{id: string, translated: string}>>}
   */
  async translateTexts(textItems, targetLanguage = '한국어') {
    console.log(`🔄 번역 시작: ${textItems.length}개 항목`);

    // 사용자 설정에서 동시성 값 로드
    try {
      const result = await chrome.storage.sync.get(['maxConcurrency']);
      if (result.maxConcurrency) {
        this.maxConcurrency = result.maxConcurrency;
        console.log(`⚙️ 동시성 설정 로드: ${this.maxConcurrency}`);
      }
    } catch (error) {
      console.warn('동시성 설정 로드 실패, 기본값 사용:', this.maxConcurrency);
    }

    // 청크로 분할
    const chunks = this._splitIntoChunks(textItems);
    console.log(`📦 ${chunks.length}개 청크로 분할됨 (동시성: ${this.maxConcurrency})`);

    // 병렬 처리를 위한 결과 맵 (순서 보장)
    const resultsMap = new Map();
    let completedCount = 0;

    // 제한된 동시성으로 청크 병렬 처리
    await this._processChunksWithConcurrency(
      chunks,
      targetLanguage,
      (chunkIndex, translatedChunk) => {
        // 성공 콜백
        resultsMap.set(chunkIndex, translatedChunk);
        completedCount++;

        // 진행률 업데이트
        const progress = Math.round((completedCount / chunks.length) * 100);
        chrome.runtime.sendMessage({
          type: 'TRANSLATION_PROGRESS',
          progress: progress
        }).catch(() => {});

        console.log(`✅ 청크 ${chunkIndex + 1}/${chunks.length} 완료 (${progress}%)`);
      },
      (chunkIndex, chunk, error) => {
        // 실패 콜백
        console.error(`❌ 청크 ${chunkIndex + 1} 번역 실패:`, error);
        resultsMap.set(chunkIndex, chunk.map(item => ({
          id: item.id,
          translated: item.text
        })));
        completedCount++;

        const progress = Math.round((completedCount / chunks.length) * 100);
        chrome.runtime.sendMessage({
          type: 'TRANSLATION_PROGRESS',
          progress: progress
        }).catch(() => {});
      }
    );

    // 순서대로 결과 조합
    const results = [];
    for (let i = 0; i < chunks.length; i++) {
      if (resultsMap.has(i)) {
        results.push(...resultsMap.get(i));
      }
    }

    console.log(`✅ 번역 완료: ${results.length}개 항목 (병렬 처리)`);
    return results;
  }

  /**
   * 제한된 동시성으로 청크 병렬 처리
   * @param {Array} chunks - 처리할 청크 배열
   * @param {string} targetLanguage - 목표 언어
   * @param {Function} onSuccess - 성공 콜백 (chunkIndex, result)
   * @param {Function} onError - 실패 콜백 (chunkIndex, chunk, error)
   */
  async _processChunksWithConcurrency(chunks, targetLanguage, onSuccess, onError) {
    const queue = chunks.map((chunk, index) => ({ chunk, index }));
    const activePromises = new Set();

    // 워커 함수
    const processNext = async () => {
      if (queue.length === 0) return;

      const { chunk, index } = queue.shift();

      try {
        const translatedChunk = await this._translateChunk(chunk, targetLanguage);
        onSuccess(index, translatedChunk);
      } catch (error) {
        onError(index, chunk, error);
      }

      // 다음 작업 처리
      if (queue.length > 0) {
        await processNext();
      }
    };

    // 동시성 제한만큼 워커 시작
    const workers = [];
    for (let i = 0; i < Math.min(this.maxConcurrency, chunks.length); i++) {
      workers.push(processNext());
    }

    // 모든 워커 완료 대기
    await Promise.all(workers);
  }

  /**
   * 텍스트 항목들을 청크로 분할
   */
  _splitIntoChunks(textItems) {
    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;

    for (const item of textItems) {
      const itemSize = item.text.length;

      // 현재 청크에 추가하면 크기 초과 시 새 청크 시작
      if (currentSize + itemSize > this.maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentSize = 0;
      }

      currentChunk.push(item);
      currentSize += itemSize;
    }

    // 마지막 청크 추가
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * 단일 청크 번역
   */
  async _translateChunk(chunk, targetLanguage) {
    // 캐시 확인
    const cacheKey = this._getCacheKey(chunk, targetLanguage);
    if (this.cache.has(cacheKey)) {
      console.log('💾 캐시에서 번역 결과 반환');
      return this.cache.get(cacheKey);
    }

    // 청크를 하나의 텍스트로 결합 (ID와 함께)
    const combinedText = chunk.map(item => `[ID:${item.id}]${item.text}[/ID:${item.id}]`).join('\n\n');

    // 번역 요청
    const translatedText = await this.bedrockClient.translate(combinedText, targetLanguage);

    // 번역된 텍스트를 다시 분할
    const results = this._parseTranslatedChunk(translatedText, chunk);

    // 캐시에 저장
    this.cache.set(cacheKey, results);

    return results;
  }

  /**
   * 번역된 청크를 파싱하여 개별 항목으로 분할
   */
  _parseTranslatedChunk(translatedText, originalChunk) {
    const results = [];

    for (const item of originalChunk) {
      const regex = new RegExp(`\\[ID:${item.id}\\]([\\s\\S]*?)\\[/ID:${item.id}\\]`, 'i');
      const match = translatedText.match(regex);

      if (match && match[1]) {
        results.push({
          id: item.id,
          translated: match[1].trim()
        });
      } else {
        // 매칭 실패 시 원본 반환
        console.warn(`⚠️ ID ${item.id} 번역 결과 파싱 실패, 원본 사용`);
        results.push({
          id: item.id,
          translated: item.text
        });
      }
    }

    return results;
  }

  /**
   * 캐시 키 생성
   */
  _getCacheKey(chunk, targetLanguage) {
    const text = chunk.map(item => item.text).join('|');
    return `${targetLanguage}:${this._hashString(text)}`;
  }

  /**
   * 간단한 문자열 해시
   */
  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ 번역 캐시 초기화됨');
  }
}
