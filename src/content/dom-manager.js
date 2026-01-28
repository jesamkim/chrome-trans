/**
 * DOM Manager
 * 웹 페이지 DOM 추출, 백업, 복원 관리
 */

class DOMManager {
  constructor() {
    this.originalTextContents = new Map(); // 원본 텍스트 저장
    this.textNodesMap = new Map();
    this.isTranslated = false;
    this.nodeIdCounter = 0;
  }

  /**
   * 페이지의 텍스트 노드 추출
   * @returns {Array<{id: string, text: string, node: Node}>}
   */
  extractTextNodes() {
    console.log('📄 텍스트 노드 추출 시작');

    this.textNodesMap.clear();
    this.originalTextContents.clear();
    this.nodeIdCounter = 0;

    const textNodes = [];
    const excludedTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'];

    // TreeWalker로 모든 텍스트 노드 탐색
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // 부모 요소 확인
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          // 제외할 태그 확인
          if (excludedTags.includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          // 빈 텍스트 제외
          const text = node.textContent.trim();
          if (!text || text.length < 2) {
            return NodeFilter.FILTER_REJECT;
          }

          // 숫자만 있는 텍스트 제외
          if (/^\d+$/.test(text)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let currentNode;
    while (currentNode = walker.nextNode()) {
      const nodeId = `node_${this.nodeIdCounter++}`;
      const text = currentNode.textContent.trim();

      textNodes.push({
        id: nodeId,
        text: text,
        node: currentNode
      });

      this.textNodesMap.set(nodeId, currentNode);
      this.originalTextContents.set(nodeId, currentNode.textContent);
    }

    console.log(`✅ ${textNodes.length}개 텍스트 노드 추출 완료`);

    return textNodes;
  }

  /**
   * 번역 결과를 DOM에 적용
   * @param {Array<{id: string, translated: string}>} translatedItems
   */
  applyTranslation(translatedItems) {
    console.log('✏️ 번역 결과 DOM 적용 시작');

    let appliedCount = 0;

    for (const item of translatedItems) {
      const node = this.textNodesMap.get(item.id);

      if (node && node.parentElement) {
        try {
          node.textContent = item.translated;
          appliedCount++;
        } catch (error) {
          console.warn(`⚠️ 노드 ${item.id} 업데이트 실패:`, error);
        }
      }
    }

    this.isTranslated = true;

    console.log(`✅ ${appliedCount}개 노드에 번역 적용 완료`);
  }

  /**
   * 원본 텍스트로 복원
   */
  restoreOriginalDOM() {
    console.log('🔄 원본 텍스트 복원');

    let restoredCount = 0;

    for (const [nodeId, originalText] of this.originalTextContents.entries()) {
      const node = this.textNodesMap.get(nodeId);

      if (node && node.parentElement) {
        try {
          node.textContent = originalText;
          restoredCount++;
        } catch (error) {
          console.warn(`⚠️ 노드 ${nodeId} 복원 실패:`, error);
        }
      }
    }

    this.isTranslated = false;

    console.log(`✅ ${restoredCount}개 노드 원본으로 복원 완료`);
  }

  /**
   * 번역 상태 확인
   */
  isPageTranslated() {
    return this.isTranslated;
  }

  /**
   * 초기화
   */
  reset() {
    this.originalTextContents.clear();
    this.textNodesMap.clear();
    this.isTranslated = false;
    this.nodeIdCounter = 0;
  }
}

// 전역 인스턴스 생성
const domManager = new DOMManager();
