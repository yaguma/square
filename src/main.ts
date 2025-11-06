import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';
import { LocalStorageRankingRepository } from '@infrastructure/repositories/LocalStorageRankingRepository';
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { LayoutCalculationService } from '@application/services/LayoutCalculationService';
import { RankingService } from '@application/services/RankingService';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { UIRenderer } from '@presentation/renderers/UIRenderer';
import { RankingDialogRenderer } from '@presentation/renderers/RankingDialogRenderer';
import { GameController } from '@presentation/controllers/GameController';
import { ViewportSize } from '@application/value-objects/ViewportSize';

/**
 * デバウンス処理
 *
 * @param func - 実行する関数
 * @param wait - 待機時間（ミリ秒）
 * @returns デバウンスされた関数
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 現在のビューポートサイズを取得
 *
 * @returns ViewportSize
 */
function getCurrentViewportSize(): ViewportSize {
  return ViewportSize.create(window.innerWidth, window.innerHeight);
}

/**
 * アプリケーションのエントリーポイント
 */
function main() {
  // DOM要素を取得
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const touchControlsContainer = document.getElementById('touch-controls-container');

  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  // 依存関係の組み立て
  const gameRepository = new InMemoryGameRepository();
  const rankingRepository = new LocalStorageRankingRepository();
  const gameApplicationService = new GameApplicationService(gameRepository);
  const inputHandlerService = new InputHandlerService(gameApplicationService);
  const layoutCalculationService = new LayoutCalculationService();
  const rankingService = new RankingService(rankingRepository);

  // 初期ビューポートサイズを取得
  const initialViewport = getCurrentViewportSize();

  // ブロックサイズとCanvasサイズを計算
  const blockSize = layoutCalculationService.calculateBlockSize(initialViewport);
  const canvasSize = layoutCalculationService.calculateCanvasSize(blockSize);

  // Canvasサイズを設定
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;

  // レンダラーの作成
  const canvasRenderer = new CanvasRenderer(canvas, blockSize.size);
  const uiRenderer = new UIRenderer();
  const rankingDialogRenderer = new RankingDialogRenderer();

  // ゲームコントローラーの作成
  const gameController = new GameController(
    gameApplicationService,
    inputHandlerService,
    canvasRenderer,
    uiRenderer,
    rankingService,
    rankingDialogRenderer,
    touchControlsContainer,
    layoutCalculationService
  );

  // ゲームを開始
  gameController.start();

  // リサイズイベントリスナーを設定（デバウンス250ms）
  const debouncedResize = debounce(() => {
    const viewport = getCurrentViewportSize();
    gameController.handleResize(viewport);
  }, 250);

  window.addEventListener('resize', debouncedResize);

  // クリーンアップ関数（ページアンロード時）
  const cleanup = () => {
    window.removeEventListener('resize', debouncedResize);
    gameController.stop();
  };

  window.addEventListener('beforeunload', cleanup);

  console.log('Square game started with mobile support!');
}

// DOMContentLoadedイベントで実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
