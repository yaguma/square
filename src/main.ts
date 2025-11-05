import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { UIRenderer } from '@presentation/renderers/UIRenderer';
import { GameController } from '@presentation/controllers/GameController';

/**
 * アプリケーションのエントリーポイント
 */
function main() {
  // DOM要素を取得
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  // 依存関係の組み立て
  const gameRepository = new InMemoryGameRepository();
  const gameApplicationService = new GameApplicationService(gameRepository);
  const inputHandlerService = new InputHandlerService(gameApplicationService);

  // レンダラーの作成
  const blockSize = 30;
  const canvasRenderer = new CanvasRenderer(canvas, blockSize);
  const uiRenderer = new UIRenderer();

  // ゲームコントローラーの作成
  const gameController = new GameController(
    gameApplicationService,
    inputHandlerService,
    canvasRenderer,
    uiRenderer
  );

  // ゲームを開始
  gameController.start();

  console.log('Square game started!');
}

// DOMContentLoadedイベントで実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
