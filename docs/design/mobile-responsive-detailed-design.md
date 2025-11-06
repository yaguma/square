# Square モバイル対応 - 詳細設計書

**作成日**: 2025-11-06
**バージョン**: 1.0
**対象**: モバイルレスポンシブUI機能追加
**基盤**: DDD仕様書 v1.1
**実装フレームワーク**: TypeScript + Vite + Vitest

---

## 目次

1. [概要と前提](#1-概要と前提)
2. [ファイル構成とディレクトリ設計](#2-ファイル構成とディレクトリ設計)
3. [値オブジェクトの詳細設計](#3-値オブジェクトの詳細設計)
4. [Application層サービスの詳細設計](#4-application層サービスの詳細設計)
5. [Presentation層コンポーネントの詳細設計](#5-presentation層コンポーネントの詳細設計)
6. [TypeScript型定義とインターフェース](#6-typescript型定義とインターフェース)
7. [エラーハンドリング戦略](#7-エラーハンドリング戦略)
8. [パフォーマンス最適化設計](#8-パフォーマンス最適化設計)
9. [CSS設計](#9-css設計)
10. [テスト設計詳細](#10-テスト設計詳細)
11. [実装手順とマイルストーン](#11-実装手順とマイルストーン)
12. [移行計画とリスク管理](#12-移行計画とリスク管理)

---

## 1. 概要と前提

### 1.1 対象範囲

本詳細設計書は、DDD仕様書v1.1で定義されたモバイル対応機能の実装レベルの設計を記述します。

**実装対象**:
- 値オブジェクト（4種類）
- Application層サービス（2種類新規 + 1種類変更）
- Presentation層コンポーネント（1種類新規 + 2種類変更）
- CSS設計
- ユニットテスト・統合テスト

**実装対象外**:
- Domain層（変更なし）
- Infrastructure層（変更なし）
- E2Eテスト（別途実施）

### 1.2 参照ドキュメント

- `docs/design/mobile-responsive-ddd-specification.md` (v1.1)
- 既存コードベース（`src/`配下）

### 1.3 技術スタック

| 項目 | 技術 | バージョン |
|------|------|-----------|
| 言語 | TypeScript | 5.3.3 |
| ビルドツール | Vite | 5.0.8 |
| テストフレームワーク | Vitest | 1.0.4 |
| DOM環境（テスト） | jsdom / happy-dom | - |
| リンター | ESLint | 8.56.0 |
| フォーマッター | Prettier | 3.1.1 |

### 1.4 設計原則の確認

- ✅ Domain層は変更しない
- ✅ 既存の型定義スタイルに準拠
- ✅ 既存のテスト構造に準拠
- ✅ エラーハンドリングを全箇所に実装
- ✅ メモリリーク対策を徹底

---

## 2. ファイル構成とディレクトリ設計

### 2.1 新規作成ファイル一覧

#### Application層

```
src/application/
├── value-objects/
│   ├── ViewportSize.ts          # 新規
│   ├── BlockSize.ts             # 新規
│   ├── CanvasSize.ts            # 新規
│   └── InputCommand.ts          # 新規（enum）
├── services/
│   ├── LayoutCalculationService.ts    # 新規
│   └── CooldownManager.ts             # 新規
```

#### Presentation層

```
src/presentation/
├── renderers/
│   └── TouchControlRenderer.ts  # 新規
└── types/
    └── EventListenerRecord.ts   # 新規
```

#### CSS

```
public/
└── styles.css                   # 変更（タッチコントロール用スタイル追加）
```

#### テストファイル

```
tests/application/
├── value-objects/
│   ├── ViewportSize.test.ts     # 新規
│   ├── BlockSize.test.ts        # 新規
│   ├── CanvasSize.test.ts       # 新規
│   └── InputCommand.test.ts     # 新規
├── services/
│   ├── LayoutCalculationService.test.ts  # 新規
│   ├── CooldownManager.test.ts           # 新規
│   └── InputHandlerService.test.ts       # 変更

tests/presentation/
└── renderers/
    ├── TouchControlRenderer.test.ts      # 新規
    ├── CanvasRenderer.test.ts            # 変更
    └── GameController.test.ts            # 変更（新規作成の可能性）

tests/integration/
├── touch-input-flow.test.ts              # 新規
└── responsive-layout.test.ts             # 新規
```

### 2.2 変更対象ファイル一覧

| ファイルパス | 変更内容 | 影響度 |
|-------------|---------|-------|
| `src/application/services/InputHandlerService.ts` | クールダウン管理の統合、`handleInput()`追加 | 中 |
| `src/presentation/renderers/CanvasRenderer.ts` | 動的blockSize対応、`updateBlockSize()`追加 | 小 |
| `src/presentation/controllers/GameController.ts` | リサイズ処理、タッチコントロール統合 | 大 |
| `public/styles.css` | タッチコントロール用スタイル追加 | 小 |
| `tests/application/services/InputHandlerService.test.ts` | 新機能のテスト追加 | 中 |

### 2.3 最終的なディレクトリツリー

```
src/
├── application/
│   ├── dto/
│   │   └── GameDto.ts
│   ├── services/
│   │   ├── GameApplicationService.ts
│   │   ├── InputHandlerService.ts        (変更)
│   │   ├── LayoutCalculationService.ts   (新規)
│   │   └── CooldownManager.ts            (新規)
│   └── value-objects/
│       ├── ViewportSize.ts               (新規)
│       ├── BlockSize.ts                  (新規)
│       ├── CanvasSize.ts                 (新規)
│       └── InputCommand.ts               (新規)
├── domain/
│   └── ...（変更なし）
├── infrastructure/
│   └── ...（変更なし）
├── presentation/
│   ├── controllers/
│   │   └── GameController.ts             (変更)
│   ├── renderers/
│   │   ├── CanvasRenderer.ts             (変更)
│   │   ├── UIRenderer.ts
│   │   └── TouchControlRenderer.ts       (新規)
│   └── types/
│       └── EventListenerRecord.ts        (新規)
└── main.ts
```

---

## 3. 値オブジェクトの詳細設計

### 3.1 InputCommand (enum)

#### 3.1.1 ファイル情報

**パス**: `src/application/value-objects/InputCommand.ts`

#### 3.1.2 責務

ユーザー入力を抽象化した操作指示を表現する列挙型。キーボード、タッチ、将来的にはゲームパッドなど、入力デバイスに依存しない統一的なコマンドインターフェースを提供します。

#### 3.1.3 TypeScript定義

```typescript
/**
 * InputCommand - 入力コマンドの列挙型
 *
 * @remarks
 * 入力デバイスに依存しない統一的なコマンド体系
 * キーボード、タッチ、ゲームパッド等から生成される
 */
export enum InputCommand {
  /** ブロックを左に移動 */
  MOVE_LEFT = 'MOVE_LEFT',

  /** ブロックを右に移動 */
  MOVE_RIGHT = 'MOVE_RIGHT',

  /** ブロックを下に移動（高速落下） */
  MOVE_DOWN = 'MOVE_DOWN',

  /** ブロックを時計回りに回転 */
  ROTATE_CLOCKWISE = 'ROTATE_CW',

  /** ブロックを反時計回りに回転 */
  ROTATE_COUNTER_CLOCKWISE = 'ROTATE_CCW',

  /** ブロックを即座に落下 */
  INSTANT_DROP = 'INSTANT_DROP',

  /** ゲームを一時停止/再開 */
  PAUSE = 'PAUSE',

  /** ゲームをリセット */
  RESET = 'RESET'
}
```

#### 3.1.4 使用例

```typescript
// キーボードからの変換
function keyToCommand(key: string): InputCommand | null {
  switch (key) {
    case 'ArrowLeft': return InputCommand.MOVE_LEFT;
    case 'ArrowRight': return InputCommand.MOVE_RIGHT;
    case 'ArrowDown': return InputCommand.MOVE_DOWN;
    case 'ArrowUp':
    case 'z': return InputCommand.ROTATE_CLOCKWISE;
    case 'x':
    case 'Control': return InputCommand.ROTATE_COUNTER_CLOCKWISE;
    case ' ': return InputCommand.INSTANT_DROP;
    case 'p': return InputCommand.PAUSE;
    case 'r': return InputCommand.RESET;
    default: return null;
  }
}

// タッチアクションからの変換
function touchActionToCommand(action: string): InputCommand {
  switch (action) {
    case 'left': return InputCommand.MOVE_LEFT;
    case 'right': return InputCommand.MOVE_RIGHT;
    case 'down': return InputCommand.MOVE_DOWN;
    case 'rotate-cw': return InputCommand.ROTATE_CLOCKWISE;
    case 'rotate-ccw': return InputCommand.ROTATE_COUNTER_CLOCKWISE;
    case 'instant-drop': return InputCommand.INSTANT_DROP;
    default: throw new Error(`Unknown touch action: ${action}`);
  }
}
```

#### 3.1.5 テストケース

**ファイル**: `tests/application/value-objects/InputCommand.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { InputCommand } from '@application/value-objects/InputCommand';

describe('InputCommand', () => {
  it('全てのコマンドが定義されている', () => {
    expect(InputCommand.MOVE_LEFT).toBe('MOVE_LEFT');
    expect(InputCommand.MOVE_RIGHT).toBe('MOVE_RIGHT');
    expect(InputCommand.MOVE_DOWN).toBe('MOVE_DOWN');
    expect(InputCommand.ROTATE_CLOCKWISE).toBe('ROTATE_CW');
    expect(InputCommand.ROTATE_COUNTER_CLOCKWISE).toBe('ROTATE_CCW');
    expect(InputCommand.INSTANT_DROP).toBe('INSTANT_DROP');
    expect(InputCommand.PAUSE).toBe('PAUSE');
    expect(InputCommand.RESET).toBe('RESET');
  });

  it('enumの値が重複していない', () => {
    const values = Object.values(InputCommand);
    const uniqueValues = new Set(values);
    expect(values.length).toBe(uniqueValues.size);
  });
});
```

---

### 3.2 ViewportSize

#### 3.2.1 ファイル情報

**パス**: `src/application/value-objects/ViewportSize.ts`

#### 3.2.2 責務

ブラウザの表示領域サイズを表現する値オブジェクト。モバイル/デスクトップの判定機能を提供します。

#### 3.2.3 TypeScript定義

```typescript
/**
 * ViewportSize - ビューポートサイズを表現する値オブジェクト
 *
 * @remarks
 * ブラウザの表示領域のサイズを表現
 * モバイル/デスクトップの判定機能を持つ
 */
export class ViewportSize {
  /** ブレークポイント: モバイル/デスクトップの境界（ピクセル） */
  private static readonly MOBILE_BREAKPOINT = 768;

  /**
   * コンストラクタ
   * @param width - ビューポート幅（ピクセル）
   * @param height - ビューポート高さ（ピクセル）
   * @throws {Error} width, heightが0未満の場合
   */
  constructor(
    public readonly width: number,
    public readonly height: number
  ) {
    if (width < 0 || height < 0) {
      throw new Error(
        `ViewportSize must have non-negative dimensions. Got: ${width}x${height}`
      );
    }

    if (!Number.isInteger(width) || !Number.isInteger(height)) {
      throw new Error(
        `ViewportSize dimensions must be integers. Got: ${width}x${height}`
      );
    }
  }

  /**
   * モバイルサイズか判定
   * @returns width < 768px の場合 true
   */
  isMobile(): boolean {
    return this.width < ViewportSize.MOBILE_BREAKPOINT;
  }

  /**
   * デスクトップサイズか判定
   * @returns width >= 768px の場合 true
   */
  isDesktop(): boolean {
    return this.width >= ViewportSize.MOBILE_BREAKPOINT;
  }

  /**
   * 他のViewportSizeと等しいか判定
   * @param other - 比較対象のViewportSize
   * @returns 幅と高さが等しい場合 true
   */
  equals(other: ViewportSize): boolean {
    return this.width === other.width && this.height === other.height;
  }

  /**
   * 文字列表現を返す
   * @returns "幅x高さ" の形式
   */
  toString(): string {
    return `${this.width}x${this.height}`;
  }

  /**
   * 現在のwindowサイズからViewportSizeを生成
   * @returns 現在のビューポートサイズ
   */
  static fromWindow(): ViewportSize {
    return new ViewportSize(
      window.innerWidth,
      window.innerHeight
    );
  }
}
```

#### 3.2.4 バリデーション仕様

| 項目 | 条件 | エラーメッセージ |
|------|------|----------------|
| width | >= 0 | "ViewportSize must have non-negative dimensions. Got: {width}x{height}" |
| height | >= 0 | 同上 |
| width | 整数 | "ViewportSize dimensions must be integers. Got: {width}x{height}" |
| height | 整数 | 同上 |

#### 3.2.5 テストケース

**ファイル**: `tests/application/value-objects/ViewportSize.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { ViewportSize } from '@application/value-objects/ViewportSize';

describe('ViewportSize', () => {
  describe('コンストラクタ', () => {
    it('正常な値で生成できる', () => {
      const viewport = new ViewportSize(1024, 768);
      expect(viewport.width).toBe(1024);
      expect(viewport.height).toBe(768);
    });

    it('0x0のサイズを生成できる', () => {
      const viewport = new ViewportSize(0, 0);
      expect(viewport.width).toBe(0);
      expect(viewport.height).toBe(0);
    });

    it('負の幅でエラーをスロー', () => {
      expect(() => new ViewportSize(-1, 768)).toThrow(
        'ViewportSize must have non-negative dimensions'
      );
    });

    it('負の高さでエラーをスロー', () => {
      expect(() => new ViewportSize(1024, -1)).toThrow(
        'ViewportSize must have non-negative dimensions'
      );
    });

    it('小数の幅でエラーをスロー', () => {
      expect(() => new ViewportSize(1024.5, 768)).toThrow(
        'ViewportSize dimensions must be integers'
      );
    });

    it('小数の高さでエラーをスロー', () => {
      expect(() => new ViewportSize(1024, 768.5)).toThrow(
        'ViewportSize dimensions must be integers'
      );
    });
  });

  describe('isMobile()', () => {
    it('幅767pxはモバイル', () => {
      const viewport = new ViewportSize(767, 600);
      expect(viewport.isMobile()).toBe(true);
    });

    it('幅768pxはモバイルではない', () => {
      const viewport = new ViewportSize(768, 600);
      expect(viewport.isMobile()).toBe(false);
    });

    it('幅320pxはモバイル', () => {
      const viewport = new ViewportSize(320, 568);
      expect(viewport.isMobile()).toBe(true);
    });

    it('幅0pxはモバイル', () => {
      const viewport = new ViewportSize(0, 0);
      expect(viewport.isMobile()).toBe(true);
    });
  });

  describe('isDesktop()', () => {
    it('幅768pxはデスクトップ', () => {
      const viewport = new ViewportSize(768, 600);
      expect(viewport.isDesktop()).toBe(true);
    });

    it('幅1024pxはデスクトップ', () => {
      const viewport = new ViewportSize(1024, 768);
      expect(viewport.isDesktop()).toBe(true);
    });

    it('幅767pxはデスクトップではない', () => {
      const viewport = new ViewportSize(767, 600);
      expect(viewport.isDesktop()).toBe(false);
    });
  });

  describe('equals()', () => {
    it('同じサイズは等しい', () => {
      const viewport1 = new ViewportSize(1024, 768);
      const viewport2 = new ViewportSize(1024, 768);
      expect(viewport1.equals(viewport2)).toBe(true);
    });

    it('幅が異なる場合は等しくない', () => {
      const viewport1 = new ViewportSize(1024, 768);
      const viewport2 = new ViewportSize(800, 768);
      expect(viewport1.equals(viewport2)).toBe(false);
    });

    it('高さが異なる場合は等しくない', () => {
      const viewport1 = new ViewportSize(1024, 768);
      const viewport2 = new ViewportSize(1024, 600);
      expect(viewport1.equals(viewport2)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('正しいフォーマットで文字列化', () => {
      const viewport = new ViewportSize(1024, 768);
      expect(viewport.toString()).toBe('1024x768');
    });
  });

  describe('fromWindow()', () => {
    it('windowサイズからViewportSizeを生成', () => {
      // jsdomではwindow.innerWidth/heightが設定されている前提
      const viewport = ViewportSize.fromWindow();
      expect(viewport.width).toBeGreaterThanOrEqual(0);
      expect(viewport.height).toBeGreaterThanOrEqual(0);
    });
  });
});
```

---

### 3.3 BlockSize

#### 3.3.1 ファイル情報

**パス**: `src/application/value-objects/BlockSize.ts`

#### 3.3.2 責務

1ブロック分のピクセル数を表現する値オブジェクト。有効範囲のバリデーションとCanvas全体サイズの計算機能を提供します。

#### 3.3.3 定数定義

```typescript
/** フィールドの幅（マス数） */
const FIELD_WIDTH = 8;

/** フィールドの高さ（マス数） */
const FIELD_HEIGHT = 20;

/** ブロックサイズの最小値（デスクトップ） */
const MIN_BLOCK_SIZE_DESKTOP = 20;

/** ブロックサイズの最大値（デスクトップ） */
const MAX_BLOCK_SIZE_DESKTOP = 40;

/** ブロックサイズの最小値（モバイル） */
const MIN_BLOCK_SIZE_MOBILE = 15;

/** ブロックサイズの最大値（モバイル） */
const MAX_BLOCK_SIZE_MOBILE = 30;
```

#### 3.3.4 TypeScript定義

```typescript
import { CanvasSize } from './CanvasSize';

/**
 * BlockSize - ブロックサイズを表現する値オブジェクト
 *
 * @remarks
 * 1ブロック分のピクセル数を表現
 * 有効範囲のバリデーションを行う
 */
export class BlockSize {
  /** フィールドの幅（マス数） */
  private static readonly FIELD_WIDTH = 8;

  /** フィールドの高さ（マス数） */
  private static readonly FIELD_HEIGHT = 20;

  /** ブロックサイズの最小値（デスクトップ） */
  private static readonly MIN_SIZE_DESKTOP = 20;

  /** ブロックサイズの最大値（デスクトップ） */
  private static readonly MAX_SIZE_DESKTOP = 40;

  /** ブロックサイズの最小値（モバイル） */
  private static readonly MIN_SIZE_MOBILE = 15;

  /** ブロックサイズの最大値（モバイル） */
  private static readonly MAX_SIZE_MOBILE = 30;

  /**
   * コンストラクタ
   * @param size - ブロック1マスのピクセル数
   * @param isMobile - モバイルデバイスか（デフォルト: false）
   * @throws {Error} サイズが有効範囲外の場合
   */
  constructor(
    public readonly size: number,
    private readonly isMobile: boolean = false
  ) {
    if (!Number.isInteger(size)) {
      throw new Error(`BlockSize must be an integer. Got: ${size}`);
    }

    if (!this.isValid()) {
      const range = isMobile
        ? `${BlockSize.MIN_SIZE_MOBILE}-${BlockSize.MAX_SIZE_MOBILE}`
        : `${BlockSize.MIN_SIZE_DESKTOP}-${BlockSize.MAX_SIZE_DESKTOP}`;
      throw new Error(
        `BlockSize must be in range ${range}px. Got: ${size}px`
      );
    }
  }

  /**
   * 有効な範囲内か判定
   * @returns サイズが有効範囲内の場合 true
   */
  isValid(): boolean {
    const minSize = this.isMobile
      ? BlockSize.MIN_SIZE_MOBILE
      : BlockSize.MIN_SIZE_DESKTOP;
    const maxSize = this.isMobile
      ? BlockSize.MAX_SIZE_MOBILE
      : BlockSize.MAX_SIZE_DESKTOP;

    return this.size >= minSize && this.size <= maxSize;
  }

  /**
   * Canvas全体のサイズを計算
   * @returns Canvas全体のサイズ
   */
  toCanvasSize(): CanvasSize {
    const width = this.size * BlockSize.FIELD_WIDTH;
    const height = this.size * BlockSize.FIELD_HEIGHT;
    return new CanvasSize(width, height);
  }

  /**
   * 他のBlockSizeと等しいか判定
   * @param other - 比較対象のBlockSize
   * @returns サイズが等しい場合 true
   */
  equals(other: BlockSize): boolean {
    return this.size === other.size;
  }

  /**
   * 文字列表現を返す
   * @returns "サイズpx" の形式
   */
  toString(): string {
    return `${this.size}px`;
  }
}
```

#### 3.3.5 バリデーション仕様

| 項目 | 条件 | エラーメッセージ |
|------|------|----------------|
| size | 整数 | "BlockSize must be an integer. Got: {size}" |
| size (デスクトップ) | 20 <= size <= 40 | "BlockSize must be in range 20-40px. Got: {size}px" |
| size (モバイル) | 15 <= size <= 30 | "BlockSize must be in range 15-30px. Got: {size}px" |

#### 3.3.6 テストケース

**ファイル**: `tests/application/value-objects/BlockSize.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { BlockSize } from '@application/value-objects/BlockSize';

describe('BlockSize', () => {
  describe('コンストラクタ（デスクトップ）', () => {
    it('有効なサイズで生成できる', () => {
      const blockSize = new BlockSize(30, false);
      expect(blockSize.size).toBe(30);
    });

    it('最小サイズ（20px）で生成できる', () => {
      const blockSize = new BlockSize(20, false);
      expect(blockSize.size).toBe(20);
    });

    it('最大サイズ（40px）で生成できる', () => {
      const blockSize = new BlockSize(40, false);
      expect(blockSize.size).toBe(40);
    });

    it('最小値未満でエラーをスロー', () => {
      expect(() => new BlockSize(19, false)).toThrow(
        'BlockSize must be in range 20-40px'
      );
    });

    it('最大値超過でエラーをスロー', () => {
      expect(() => new BlockSize(41, false)).toThrow(
        'BlockSize must be in range 20-40px'
      );
    });

    it('小数でエラーをスロー', () => {
      expect(() => new BlockSize(30.5, false)).toThrow(
        'BlockSize must be an integer'
      );
    });
  });

  describe('コンストラクタ（モバイル）', () => {
    it('有効なサイズで生成できる', () => {
      const blockSize = new BlockSize(20, true);
      expect(blockSize.size).toBe(20);
    });

    it('最小サイズ（15px）で生成できる', () => {
      const blockSize = new BlockSize(15, true);
      expect(blockSize.size).toBe(15);
    });

    it('最大サイズ（30px）で生成できる', () => {
      const blockSize = new BlockSize(30, true);
      expect(blockSize.size).toBe(30);
    });

    it('最小値未満でエラーをスロー', () => {
      expect(() => new BlockSize(14, true)).toThrow(
        'BlockSize must be in range 15-30px'
      );
    });

    it('最大値超過でエラーをスロー', () => {
      expect(() => new BlockSize(31, true)).toThrow(
        'BlockSize must be in range 15-30px'
      );
    });
  });

  describe('isValid()', () => {
    it('デスクトップの有効範囲内はtrue', () => {
      const blockSize = new BlockSize(30, false);
      expect(blockSize.isValid()).toBe(true);
    });

    it('モバイルの有効範囲内はtrue', () => {
      const blockSize = new BlockSize(20, true);
      expect(blockSize.isValid()).toBe(true);
    });
  });

  describe('toCanvasSize()', () => {
    it('ブロックサイズ30pxでCanvas 240x600pxを返す', () => {
      const blockSize = new BlockSize(30, false);
      const canvasSize = blockSize.toCanvasSize();
      expect(canvasSize.width).toBe(240); // 30 * 8
      expect(canvasSize.height).toBe(600); // 30 * 20
    });

    it('ブロックサイズ20pxでCanvas 160x400pxを返す', () => {
      const blockSize = new BlockSize(20, true);
      const canvasSize = blockSize.toCanvasSize();
      expect(canvasSize.width).toBe(160); // 20 * 8
      expect(canvasSize.height).toBe(400); // 20 * 20
    });
  });

  describe('equals()', () => {
    it('同じサイズは等しい', () => {
      const blockSize1 = new BlockSize(30, false);
      const blockSize2 = new BlockSize(30, false);
      expect(blockSize1.equals(blockSize2)).toBe(true);
    });

    it('異なるサイズは等しくない', () => {
      const blockSize1 = new BlockSize(30, false);
      const blockSize2 = new BlockSize(25, false);
      expect(blockSize1.equals(blockSize2)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('正しいフォーマットで文字列化', () => {
      const blockSize = new BlockSize(30, false);
      expect(blockSize.toString()).toBe('30px');
    });
  });
});
```

---

### 3.4 CanvasSize

#### 3.4.1 ファイル情報

**パス**: `src/application/value-objects/CanvasSize.ts`

#### 3.4.2 責務

Canvasの幅と高さを表現する値オブジェクト。サイズの制約をバリデーションします。

#### 3.4.3 TypeScript定義

```typescript
/**
 * CanvasSize - Canvasサイズを表現する値オブジェクト
 *
 * @remarks
 * Canvas要素の幅と高さを表現
 * 最小・最大サイズの制約を持つ
 */
export class CanvasSize {
  /** Canvas幅の最小値（ピクセル） */
  private static readonly MIN_WIDTH = 120; // 15px * 8マス

  /** Canvas幅の最大値（ピクセル） */
  private static readonly MAX_WIDTH = 320; // 40px * 8マス

  /** Canvas高さの最小値（ピクセル） */
  private static readonly MIN_HEIGHT = 300; // 15px * 20マス

  /** Canvas高さの最大値（ピクセル） */
  private static readonly MAX_HEIGHT = 800; // 40px * 20マス

  /**
   * コンストラクタ
   * @param width - Canvas幅（ピクセル）
   * @param height - Canvas高さ（ピクセル）
   * @throws {Error} サイズが有効範囲外の場合
   */
  constructor(
    public readonly width: number,
    public readonly height: number
  ) {
    if (!Number.isInteger(width) || !Number.isInteger(height)) {
      throw new Error(
        `CanvasSize dimensions must be integers. Got: ${width}x${height}`
      );
    }

    if (width < CanvasSize.MIN_WIDTH || width > CanvasSize.MAX_WIDTH) {
      throw new Error(
        `Canvas width must be in range ${CanvasSize.MIN_WIDTH}-${CanvasSize.MAX_WIDTH}px. Got: ${width}px`
      );
    }

    if (height < CanvasSize.MIN_HEIGHT || height > CanvasSize.MAX_HEIGHT) {
      throw new Error(
        `Canvas height must be in range ${CanvasSize.MIN_HEIGHT}-${CanvasSize.MAX_HEIGHT}px. Got: ${height}px`
      );
    }
  }

  /**
   * 他のCanvasSizeと等しいか判定
   * @param other - 比較対象のCanvasSize
   * @returns 幅と高さが等しい場合 true
   */
  equals(other: CanvasSize): boolean {
    return this.width === other.width && this.height === other.height;
  }

  /**
   * 文字列表現を返す
   * @returns "幅x高さ" の形式
   */
  toString(): string {
    return `${this.width}x${this.height}`;
  }

  /**
   * アスペクト比を計算
   * @returns アスペクト比（幅/高さ）
   */
  getAspectRatio(): number {
    return this.width / this.height;
  }
}
```

#### 3.4.4 バリデーション仕様

| 項目 | 条件 | エラーメッセージ |
|------|------|----------------|
| width, height | 整数 | "CanvasSize dimensions must be integers. Got: {width}x{height}" |
| width | 120 <= width <= 320 | "Canvas width must be in range 120-320px. Got: {width}px" |
| height | 300 <= height <= 800 | "Canvas height must be in range 300-800px. Got: {height}px" |

#### 3.4.5 テストケース

**ファイル**: `tests/application/value-objects/CanvasSize.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { CanvasSize } from '@application/value-objects/CanvasSize';

describe('CanvasSize', () => {
  describe('コンストラクタ', () => {
    it('有効なサイズで生成できる', () => {
      const canvasSize = new CanvasSize(240, 600);
      expect(canvasSize.width).toBe(240);
      expect(canvasSize.height).toBe(600);
    });

    it('最小サイズで生成できる', () => {
      const canvasSize = new CanvasSize(120, 300);
      expect(canvasSize.width).toBe(120);
      expect(canvasSize.height).toBe(300);
    });

    it('最大サイズで生成できる', () => {
      const canvasSize = new CanvasSize(320, 800);
      expect(canvasSize.width).toBe(320);
      expect(canvasSize.height).toBe(800);
    });

    it('幅が最小値未満でエラーをスロー', () => {
      expect(() => new CanvasSize(119, 600)).toThrow(
        'Canvas width must be in range 120-320px'
      );
    });

    it('幅が最大値超過でエラーをスロー', () => {
      expect(() => new CanvasSize(321, 600)).toThrow(
        'Canvas width must be in range 120-320px'
      );
    });

    it('高さが最小値未満でエラーをスロー', () => {
      expect(() => new CanvasSize(240, 299)).toThrow(
        'Canvas height must be in range 300-800px'
      );
    });

    it('高さが最大値超過でエラーをスロー', () => {
      expect(() => new CanvasSize(240, 801)).toThrow(
        'Canvas height must be in range 300-800px'
      );
    });

    it('小数の幅でエラーをスロー', () => {
      expect(() => new CanvasSize(240.5, 600)).toThrow(
        'CanvasSize dimensions must be integers'
      );
    });

    it('小数の高さでエラーをスロー', () => {
      expect(() => new CanvasSize(240, 600.5)).toThrow(
        'CanvasSize dimensions must be integers'
      );
    });
  });

  describe('equals()', () => {
    it('同じサイズは等しい', () => {
      const canvasSize1 = new CanvasSize(240, 600);
      const canvasSize2 = new CanvasSize(240, 600);
      expect(canvasSize1.equals(canvasSize2)).toBe(true);
    });

    it('幅が異なる場合は等しくない', () => {
      const canvasSize1 = new CanvasSize(240, 600);
      const canvasSize2 = new CanvasSize(200, 600);
      expect(canvasSize1.equals(canvasSize2)).toBe(false);
    });

    it('高さが異なる場合は等しくない', () => {
      const canvasSize1 = new CanvasSize(240, 600);
      const canvasSize2 = new CanvasSize(240, 500);
      expect(canvasSize1.equals(canvasSize2)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('正しいフォーマットで文字列化', () => {
      const canvasSize = new CanvasSize(240, 600);
      expect(canvasSize.toString()).toBe('240x600');
    });
  });

  describe('getAspectRatio()', () => {
    it('アスペクト比を正しく計算', () => {
      const canvasSize = new CanvasSize(240, 600);
      expect(canvasSize.getAspectRatio()).toBe(0.4); // 240 / 600
    });
  });
});
```

---

## 4. Application層サービスの詳細設計

### 4.1 LayoutCalculationService

#### 4.1.1 ファイル情報

**パス**: `src/application/services/LayoutCalculationService.ts`

#### 4.1.2 責務

画面サイズに応じた最適なレイアウト計算のビジネスルールを提供します。ブロックサイズの計算、Canvas全体サイズの計算、タッチコントロール表示判定を行います。

#### 4.1.3 依存関係

```typescript
import { ViewportSize } from '@application/value-objects/ViewportSize';
import { BlockSize } from '@application/value-objects/BlockSize';
import { CanvasSize } from '@application/value-objects/CanvasSize';
```

#### 4.1.4 TypeScript定義

```typescript
/**
 * LayoutCalculationService - レイアウト計算サービス
 *
 * @remarks
 * 画面サイズに応じた最適なレイアウト計算のビジネスルールを提供
 * Application層に配置（レイアウト計算ルールはビジネスロジック）
 */
export class LayoutCalculationService {
  /** フィールドの幅（マス数） */
  private static readonly FIELD_WIDTH = 8;

  /** フィールドの高さ（マス数） */
  private static readonly FIELD_HEIGHT = 20;

  /** モバイル時のCanvas幅の画面幅に対する割合 */
  private static readonly MOBILE_WIDTH_RATIO = 0.9;

  /** デスクトップ時のCanvas最大幅（ピクセル） */
  private static readonly DESKTOP_MAX_CANVAS_WIDTH = 320; // 40px * 8

  /** デスクトップ時のCanvas幅の画面幅に対する割合 */
  private static readonly DESKTOP_WIDTH_RATIO = 0.4;

  /**
   * ビューポートサイズからブロックサイズを計算
   *
   * @param viewport - ビューポートサイズ
   * @returns 計算されたブロックサイズ
   *
   * @remarks
   * アルゴリズム:
   * 1. モバイル/デスクトップを判定
   * 2. 画面幅から最大Canvas幅を計算
   * 3. フィールド幅で割ってブロックサイズを算出
   * 4. デバイスごとの最小・最大値で制約
   */
  calculateBlockSize(viewport: ViewportSize): BlockSize {
    const isMobile = viewport.isMobile();

    // 最大Canvas幅を計算
    const maxCanvasWidth = isMobile
      ? viewport.width * LayoutCalculationService.MOBILE_WIDTH_RATIO
      : Math.min(
          LayoutCalculationService.DESKTOP_MAX_CANVAS_WIDTH,
          viewport.width * LayoutCalculationService.DESKTOP_WIDTH_RATIO
        );

    // ブロックサイズを計算（切り捨て）
    const rawBlockSize = Math.floor(
      maxCanvasWidth / LayoutCalculationService.FIELD_WIDTH
    );

    // デバイスごとの最小・最大値で制約
    const minSize = isMobile ? 15 : 20;
    const maxSize = isMobile ? 30 : 40;
    const constrainedSize = Math.max(minSize, Math.min(maxSize, rawBlockSize));

    return new BlockSize(constrainedSize, isMobile);
  }

  /**
   * ブロックサイズからCanvas全体のサイズを計算
   *
   * @param blockSize - ブロックサイズ
   * @returns Canvas全体のサイズ
   *
   * @remarks
   * フィールドサイズ（8x20）にブロックサイズを掛けて計算
   */
  calculateCanvasSize(blockSize: BlockSize): CanvasSize {
    const width = blockSize.size * LayoutCalculationService.FIELD_WIDTH;
    const height = blockSize.size * LayoutCalculationService.FIELD_HEIGHT;

    return new CanvasSize(width, height);
  }

  /**
   * タッチコントロールを表示すべきか判定
   *
   * @param viewport - ビューポートサイズ
   * @returns モバイルサイズの場合 true
   *
   * @remarks
   * モバイル（width < 768px）の場合のみタッチコントロールを表示
   */
  shouldShowTouchControls(viewport: ViewportSize): boolean {
    return viewport.isMobile();
  }
}
```

#### 4.1.5 アルゴリズム詳細

##### calculateBlockSize() のアルゴリズム

```
入力: viewport (ViewportSize)
出力: blockSize (BlockSize)

1. isMobile = viewport.isMobile()

2. maxCanvasWidth を計算:
   if isMobile:
     maxCanvasWidth = viewport.width * 0.9
   else:
     maxCanvasWidth = min(320, viewport.width * 0.4)

3. rawBlockSize = floor(maxCanvasWidth / 8)

4. 制約を適用:
   if isMobile:
     minSize = 15, maxSize = 30
   else:
     minSize = 20, maxSize = 40

   constrainedSize = max(minSize, min(maxSize, rawBlockSize))

5. return new BlockSize(constrainedSize, isMobile)
```

**計算例**:

| デバイス | viewport.width | maxCanvasWidth | rawBlockSize | 制約後 | 最終値 |
|---------|---------------|----------------|--------------|--------|--------|
| iPhone SE | 375px | 337.5px | 42px | 15-30px | 30px |
| iPad | 768px | 307.2px | 38px | 20-40px | 38px |
| Desktop | 1024px | 320px | 40px | 20-40px | 40px |
| Desktop (wide) | 1920px | 320px | 40px | 20-40px | 40px |

#### 4.1.6 エラーハンドリング

このサービスはエラーをスローしません。値オブジェクトのコンストラクタでバリデーションエラーが発生する可能性がありますが、ビジネスルールにより有効な値のみが生成されます。

#### 4.1.7 テストケース

**ファイル**: `tests/application/services/LayoutCalculationService.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { LayoutCalculationService } from '@application/services/LayoutCalculationService';
import { ViewportSize } from '@application/value-objects/ViewportSize';

describe('LayoutCalculationService', () => {
  let service: LayoutCalculationService;

  beforeEach(() => {
    service = new LayoutCalculationService();
  });

  describe('calculateBlockSize()', () => {
    describe('モバイルサイズ', () => {
      it('iPhone SE (375x667) で適切なブロックサイズを返す', () => {
        const viewport = new ViewportSize(375, 667);
        const blockSize = service.calculateBlockSize(viewport);

        // 375 * 0.9 = 337.5, 337.5 / 8 = 42.1875 → 42 → 制約: 30
        expect(blockSize.size).toBe(30);
      });

      it('iPhone 12/13 (390x844) で適切なブロックサイズを返す', () => {
        const viewport = new ViewportSize(390, 844);
        const blockSize = service.calculateBlockSize(viewport);

        // 390 * 0.9 = 351, 351 / 8 = 43.875 → 43 → 制約: 30
        expect(blockSize.size).toBe(30);
      });

      it('小さい画面 (320x568) で最小サイズを返す', () => {
        const viewport = new ViewportSize(320, 568);
        const blockSize = service.calculateBlockSize(viewport);

        // 320 * 0.9 = 288, 288 / 8 = 36 → 制約: 30
        expect(blockSize.size).toBe(30);
      });

      it('ブレークポイント直前 (767x600) でモバイルサイズを返す', () => {
        const viewport = new ViewportSize(767, 600);
        const blockSize = service.calculateBlockSize(viewport);

        expect(blockSize.size).toBeGreaterThanOrEqual(15);
        expect(blockSize.size).toBeLessThanOrEqual(30);
      });
    });

    describe('デスクトップサイズ', () => {
      it('iPad (768x1024) で適切なブロックサイズを返す', () => {
        const viewport = new ViewportSize(768, 1024);
        const blockSize = service.calculateBlockSize(viewport);

        // min(320, 768 * 0.4) = min(320, 307.2) = 307.2
        // 307.2 / 8 = 38.4 → 38
        expect(blockSize.size).toBe(38);
      });

      it('標準デスクトップ (1024x768) で適切なブロックサイズを返す', () => {
        const viewport = new ViewportSize(1024, 768);
        const blockSize = service.calculateBlockSize(viewport);

        // min(320, 1024 * 0.4) = min(320, 409.6) = 320
        // 320 / 8 = 40
        expect(blockSize.size).toBe(40);
      });

      it('大きい画面 (1920x1080) で最大サイズを返す', () => {
        const viewport = new ViewportSize(1920, 1080);
        const blockSize = service.calculateBlockSize(viewport);

        // min(320, 1920 * 0.4) = min(320, 768) = 320
        // 320 / 8 = 40
        expect(blockSize.size).toBe(40);
      });

      it('小さいデスクトップ (800x600) で制約内のサイズを返す', () => {
        const viewport = new ViewportSize(800, 600);
        const blockSize = service.calculateBlockSize(viewport);

        // min(320, 800 * 0.4) = min(320, 320) = 320
        // 320 / 8 = 40
        expect(blockSize.size).toBe(40);
      });
    });
  });

  describe('calculateCanvasSize()', () => {
    it('ブロックサイズ30pxでCanvas 240x600pxを返す', () => {
      const blockSize = new BlockSize(30, true);
      const canvasSize = service.calculateCanvasSize(blockSize);

      expect(canvasSize.width).toBe(240); // 30 * 8
      expect(canvasSize.height).toBe(600); // 30 * 20
    });

    it('ブロックサイズ20pxでCanvas 160x400pxを返す', () => {
      const blockSize = new BlockSize(20, false);
      const canvasSize = service.calculateCanvasSize(blockSize);

      expect(canvasSize.width).toBe(160); // 20 * 8
      expect(canvasSize.height).toBe(400); // 20 * 20
    });

    it('ブロックサイズ40pxでCanvas 320x800pxを返す', () => {
      const blockSize = new BlockSize(40, false);
      const canvasSize = service.calculateCanvasSize(blockSize);

      expect(canvasSize.width).toBe(320); // 40 * 8
      expect(canvasSize.height).toBe(800); // 40 * 20
    });
  });

  describe('shouldShowTouchControls()', () => {
    it('モバイルサイズ (375x667) でtrueを返す', () => {
      const viewport = new ViewportSize(375, 667);
      expect(service.shouldShowTouchControls(viewport)).toBe(true);
    });

    it('ブレークポイント直前 (767x600) でtrueを返す', () => {
      const viewport = new ViewportSize(767, 600);
      expect(service.shouldShowTouchControls(viewport)).toBe(true);
    });

    it('ブレークポイント (768x1024) でfalseを返す', () => {
      const viewport = new ViewportSize(768, 1024);
      expect(service.shouldShowTouchControls(viewport)).toBe(false);
    });

    it('デスクトップサイズ (1024x768) でfalseを返す', () => {
      const viewport = new ViewportSize(1024, 768);
      expect(service.shouldShowTouchControls(viewport)).toBe(false);
    });
  });

  describe('統合テスト', () => {
    it('モバイルサイズから一貫したレイアウトを計算', () => {
      const viewport = new ViewportSize(375, 667);

      const blockSize = service.calculateBlockSize(viewport);
      const canvasSize = service.calculateCanvasSize(blockSize);
      const shouldShowTouch = service.shouldShowTouchControls(viewport);

      expect(blockSize.size).toBe(30);
      expect(canvasSize.width).toBe(240);
      expect(canvasSize.height).toBe(600);
      expect(shouldShowTouch).toBe(true);
    });

    it('デスクトップサイズから一貫したレイアウトを計算', () => {
      const viewport = new ViewportSize(1024, 768);

      const blockSize = service.calculateBlockSize(viewport);
      const canvasSize = service.calculateCanvasSize(blockSize);
      const shouldShowTouch = service.shouldShowTouchControls(viewport);

      expect(blockSize.size).toBe(40);
      expect(canvasSize.width).toBe(320);
      expect(canvasSize.height).toBe(800);
      expect(shouldShowTouch).toBe(false);
    });
  });
});
```

---

### 4.2 CooldownManager

#### 4.2.1 ファイル情報

**パス**: `src/application/services/CooldownManager.ts`

#### 4.2.2 責務

入力のクールダウン制御（連続入力防止）のビジネスルールを提供します。各コマンドごとに最終実行時刻を記録し、クールダウン時間内の連続実行を防ぎます。

#### 4.2.3 依存関係

```typescript
import { InputCommand } from '@application/value-objects/InputCommand';
```

#### 4.2.4 クールダウン設定

```typescript
/** 各コマンドのクールダウン時間（ミリ秒） */
const COOLDOWN_DURATIONS: Record<InputCommand, number> = {
  [InputCommand.MOVE_LEFT]: 133,        // 4フレーム @ 30fps
  [InputCommand.MOVE_RIGHT]: 133,       // 4フレーム @ 30fps
  [InputCommand.ROTATE_CLOCKWISE]: 200, // 6フレーム @ 30fps
  [InputCommand.ROTATE_COUNTER_CLOCKWISE]: 200, // 6フレーム @ 30fps
  [InputCommand.INSTANT_DROP]: 0,       // クールダウンなし
  [InputCommand.MOVE_DOWN]: 0,          // クールダウンなし（押し続け対応）
  [InputCommand.PAUSE]: 300,            // 誤操作防止
  [InputCommand.RESET]: 500,            // 誤操作防止
};
```

#### 4.2.5 TypeScript定義

```typescript
/**
 * CooldownManager - クールダウン管理サービス
 *
 * @remarks
 * 入力のクールダウン制御（連続入力防止）のビジネスルールを提供
 * Application層に配置（クールダウン時間はゲームバランスのビジネスルール）
 */
export class CooldownManager {
  /** 各コマンドの最終実行時刻（ミリ秒） */
  private cooldowns: Map<InputCommand, number>;

  /** 各コマンドのクールダウン時間（ミリ秒） */
  private readonly cooldownDurations: ReadonlyMap<InputCommand, number>;

  /**
   * コンストラクタ
   * @param customDurations - カスタムクールダウン時間（オプション、テスト用）
   */
  constructor(customDurations?: Partial<Record<InputCommand, number>>) {
    this.cooldowns = new Map<InputCommand, number>();

    // デフォルトのクールダウン時間
    const defaultDurations: Record<InputCommand, number> = {
      [InputCommand.MOVE_LEFT]: 133,
      [InputCommand.MOVE_RIGHT]: 133,
      [InputCommand.ROTATE_CLOCKWISE]: 200,
      [InputCommand.ROTATE_COUNTER_CLOCKWISE]: 200,
      [InputCommand.INSTANT_DROP]: 0,
      [InputCommand.MOVE_DOWN]: 0,
      [InputCommand.PAUSE]: 300,
      [InputCommand.RESET]: 500,
    };

    // カスタム設定でオーバーライド
    const finalDurations = { ...defaultDurations, ...customDurations };
    this.cooldownDurations = new Map(Object.entries(finalDurations)) as ReadonlyMap<InputCommand, number>;
  }

  /**
   * 指定コマンドを実行可能か判定
   *
   * @param command - 入力コマンド
   * @param currentTime - 現在時刻（ミリ秒）
   * @returns 実行可能な場合 true
   *
   * @remarks
   * クールダウン時間が0の場合は常にtrueを返す
   */
  canExecute(command: InputCommand, currentTime: number): boolean {
    const duration = this.cooldownDurations.get(command) ?? 0;

    // クールダウンなしの場合は常に実行可能
    if (duration === 0) {
      return true;
    }

    const lastExecutionTime = this.cooldowns.get(command) ?? 0;
    return currentTime - lastExecutionTime >= duration;
  }

  /**
   * コマンドの実行を記録
   *
   * @param command - 入力コマンド
   * @param currentTime - 現在時刻（ミリ秒）
   *
   * @remarks
   * canExecute()がtrueを返した後に呼び出すべき
   */
  markExecuted(command: InputCommand, currentTime: number): void {
    this.cooldowns.set(command, currentTime);
  }

  /**
   * すべてのクールダウンをリセット
   *
   * @remarks
   * ゲームの一時停止/再開時などに使用
   */
  reset(): void {
    this.cooldowns.clear();
  }

  /**
   * 特定のコマンドのクールダウンをリセット
   *
   * @param command - リセット対象のコマンド
   */
  resetCommand(command: InputCommand): void {
    this.cooldowns.delete(command);
  }

  /**
   * 指定コマンドの残りクールダウン時間を取得
   *
   * @param command - 入力コマンド
   * @param currentTime - 現在時刻（ミリ秒）
   * @returns 残りクールダウン時間（ミリ秒）、0以下の場合は実行可能
   */
  getRemainingCooldown(command: InputCommand, currentTime: number): number {
    const duration = this.cooldownDurations.get(command) ?? 0;
    const lastExecutionTime = this.cooldowns.get(command) ?? 0;
    const elapsed = currentTime - lastExecutionTime;

    return Math.max(0, duration - elapsed);
  }
}
```

#### 4.2.6 状態遷移

```
[初期状態]
  cooldowns = {}

[MOVE_LEFTコマンド実行] (t=0)
  canExecute(MOVE_LEFT, 0) → true
  markExecuted(MOVE_LEFT, 0)
  cooldowns = { MOVE_LEFT: 0 }

[MOVE_LEFTコマンド再実行試行] (t=100)
  canExecute(MOVE_LEFT, 100) → false
  (100 - 0 = 100 < 133)

[MOVE_LEFTコマンド再実行試行] (t=133)
  canExecute(MOVE_LEFT, 133) → true
  (133 - 0 = 133 >= 133)
  markExecuted(MOVE_LEFT, 133)
  cooldowns = { MOVE_LEFT: 133 }

[reset()]
  cooldowns = {}
```

#### 4.2.7 エラーハンドリング

このサービスはエラーをスローしません。不明なコマンドの場合はクールダウン時間0として扱います。

#### 4.2.8 テストケース

**ファイル**: `tests/application/services/CooldownManager.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { CooldownManager } from '@application/services/CooldownManager';
import { InputCommand } from '@application/value-objects/InputCommand';

describe('CooldownManager', () => {
  let manager: CooldownManager;

  beforeEach(() => {
    manager = new CooldownManager();
  });

  describe('canExecute()', () => {
    it('初回実行は常に可能', () => {
      const now = Date.now();
      expect(manager.canExecute(InputCommand.MOVE_LEFT, now)).toBe(true);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, now)).toBe(true);
    });

    it('MOVE_LEFTの133ms以内の連続実行を防ぐ', () => {
      const now = 1000;

      expect(manager.canExecute(InputCommand.MOVE_LEFT, now)).toBe(true);
      manager.markExecuted(InputCommand.MOVE_LEFT, now);

      expect(manager.canExecute(InputCommand.MOVE_LEFT, now + 100)).toBe(false);
      expect(manager.canExecute(InputCommand.MOVE_LEFT, now + 132)).toBe(false);
      expect(manager.canExecute(InputCommand.MOVE_LEFT, now + 133)).toBe(true);
    });

    it('MOVE_RIGHTの133ms以内の連続実行を防ぐ', () => {
      const now = 1000;

      expect(manager.canExecute(InputCommand.MOVE_RIGHT, now)).toBe(true);
      manager.markExecuted(InputCommand.MOVE_RIGHT, now);

      expect(manager.canExecute(InputCommand.MOVE_RIGHT, now + 100)).toBe(false);
      expect(manager.canExecute(InputCommand.MOVE_RIGHT, now + 133)).toBe(true);
    });

    it('ROTATE_CLOCKWISEの200ms以内の連続実行を防ぐ', () => {
      const now = 1000;

      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, now)).toBe(true);
      manager.markExecuted(InputCommand.ROTATE_CLOCKWISE, now);

      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, now + 100)).toBe(false);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, now + 199)).toBe(false);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, now + 200)).toBe(true);
    });

    it('INSTANT_DROPはクールダウンなし', () => {
      const now = 1000;

      expect(manager.canExecute(InputCommand.INSTANT_DROP, now)).toBe(true);
      manager.markExecuted(InputCommand.INSTANT_DROP, now);

      expect(manager.canExecute(InputCommand.INSTANT_DROP, now)).toBe(true);
      expect(manager.canExecute(InputCommand.INSTANT_DROP, now + 1)).toBe(true);
    });

    it('MOVE_DOWNはクールダウンなし', () => {
      const now = 1000;

      expect(manager.canExecute(InputCommand.MOVE_DOWN, now)).toBe(true);
      manager.markExecuted(InputCommand.MOVE_DOWN, now);

      expect(manager.canExecute(InputCommand.MOVE_DOWN, now)).toBe(true);
    });

    it('異なるコマンドは独立して実行可能', () => {
      const now = 1000;

      manager.markExecuted(InputCommand.MOVE_LEFT, now);

      expect(manager.canExecute(InputCommand.MOVE_RIGHT, now)).toBe(true);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, now)).toBe(true);
      expect(manager.canExecute(InputCommand.INSTANT_DROP, now)).toBe(true);
    });
  });

  describe('markExecuted()', () => {
    it('実行時刻を正しく記録', () => {
      const now = 1000;

      manager.markExecuted(InputCommand.MOVE_LEFT, now);

      expect(manager.canExecute(InputCommand.MOVE_LEFT, now)).toBe(false);
      expect(manager.canExecute(InputCommand.MOVE_LEFT, now + 133)).toBe(true);
    });

    it('複数のコマンドの実行時刻を個別に記録', () => {
      manager.markExecuted(InputCommand.MOVE_LEFT, 1000);
      manager.markExecuted(InputCommand.ROTATE_CLOCKWISE, 1050);

      expect(manager.canExecute(InputCommand.MOVE_LEFT, 1100)).toBe(false);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, 1100)).toBe(false);

      expect(manager.canExecute(InputCommand.MOVE_LEFT, 1133)).toBe(true);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, 1250)).toBe(true);
    });
  });

  describe('reset()', () => {
    it('全てのクールダウンをリセット', () => {
      const now = 1000;

      manager.markExecuted(InputCommand.MOVE_LEFT, now);
      manager.markExecuted(InputCommand.ROTATE_CLOCKWISE, now);

      expect(manager.canExecute(InputCommand.MOVE_LEFT, now)).toBe(false);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, now)).toBe(false);

      manager.reset();

      expect(manager.canExecute(InputCommand.MOVE_LEFT, now)).toBe(true);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, now)).toBe(true);
    });
  });

  describe('resetCommand()', () => {
    it('特定のコマンドのクールダウンのみリセット', () => {
      const now = 1000;

      manager.markExecuted(InputCommand.MOVE_LEFT, now);
      manager.markExecuted(InputCommand.ROTATE_CLOCKWISE, now);

      manager.resetCommand(InputCommand.MOVE_LEFT);

      expect(manager.canExecute(InputCommand.MOVE_LEFT, now)).toBe(true);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, now)).toBe(false);
    });
  });

  describe('getRemainingCooldown()', () => {
    it('残りクールダウン時間を正しく計算', () => {
      const now = 1000;

      manager.markExecuted(InputCommand.MOVE_LEFT, now);

      expect(manager.getRemainingCooldown(InputCommand.MOVE_LEFT, now + 50)).toBe(83);
      expect(manager.getRemainingCooldown(InputCommand.MOVE_LEFT, now + 100)).toBe(33);
      expect(manager.getRemainingCooldown(InputCommand.MOVE_LEFT, now + 133)).toBe(0);
      expect(manager.getRemainingCooldown(InputCommand.MOVE_LEFT, now + 200)).toBe(0);
    });

    it('未実行のコマンドは0を返す', () => {
      const now = 1000;
      expect(manager.getRemainingCooldown(InputCommand.MOVE_LEFT, now)).toBe(0);
    });

    it('クールダウンなしのコマンドは常に0を返す', () => {
      const now = 1000;
      manager.markExecuted(InputCommand.INSTANT_DROP, now);
      expect(manager.getRemainingCooldown(InputCommand.INSTANT_DROP, now)).toBe(0);
    });
  });

  describe('カスタムクールダウン時間', () => {
    it('カスタム時間で初期化できる', () => {
      const customManager = new CooldownManager({
        [InputCommand.MOVE_LEFT]: 50,
      });

      const now = 1000;
      customManager.markExecuted(InputCommand.MOVE_LEFT, now);

      expect(customManager.canExecute(InputCommand.MOVE_LEFT, now + 49)).toBe(false);
      expect(customManager.canExecute(InputCommand.MOVE_LEFT, now + 50)).toBe(true);
    });
  });
});
```

---

### 4.3 InputHandlerService（変更）

#### 4.3.1 ファイル情報

**パス**: `src/application/services/InputHandlerService.ts`

#### 4.3.2 変更内容サマリー

| 項目 | 変更前 | 変更後 |
|------|-------|-------|
| クールダウン管理 | 独自実装 (`lastInputTime: Map`) | `CooldownManager`に委譲 |
| 入力処理 | `handleKeyDown()`, `handleKeyUp()` のみ | `handleInput()` を追加（統一インターフェース） |
| 対応入力 | キーボードのみ | キーボード + タッチ（InputCommand経由） |

#### 4.3.3 変更後のTypeScript定義

```typescript
import { GameApplicationService } from './GameApplicationService';
import { CooldownManager } from './CooldownManager';
import { InputCommand } from '@application/value-objects/InputCommand';

/**
 * InputHandlerService - ユーザー入力の処理サービス
 *
 * @remarks
 * キーボード入力およびタッチ入力を受け取り、適切なゲームアクションを実行する
 * クールダウン管理はCooldownManagerに委譲
 */
export class InputHandlerService {
  private cooldownManager: CooldownManager;

  constructor(
    private gameApplicationService: GameApplicationService,
    cooldownManager?: CooldownManager
  ) {
    this.cooldownManager = cooldownManager ?? new CooldownManager();
  }

  /**
   * 統一的な入力処理メソッド（キーボードとタッチ共通）
   *
   * @param command - 入力コマンド
   * @param gameId - ゲームID
   *
   * @remarks
   * クールダウンチェック → コマンド実行 → クールダウン記録の順で処理
   */
  handleInput(command: InputCommand, gameId: string): void {
    try {
      // 1. クールダウンチェック
      const currentTime = Date.now();
      if (!this.cooldownManager.canExecute(command, currentTime)) {
        return; // クールダウン中は無視
      }

      // 2. ゲーム操作を実行
      this.executeCommand(command, gameId);

      // 3. クールダウンを記録
      this.cooldownManager.markExecuted(command, currentTime);
    } catch (error) {
      console.error(`Failed to handle input command ${command}:`, error);
      // エラーでもゲームを継続
    }
  }

  /**
   * InputCommandに応じたゲーム操作を実行
   *
   * @param command - 入力コマンド
   * @param gameId - ゲームID
   */
  private executeCommand(command: InputCommand, gameId: string): void {
    switch (command) {
      case InputCommand.MOVE_LEFT:
        this.gameApplicationService.moveBlockLeft(gameId);
        break;

      case InputCommand.MOVE_RIGHT:
        this.gameApplicationService.moveBlockRight(gameId);
        break;

      case InputCommand.MOVE_DOWN:
        this.gameApplicationService.accelerateFall(gameId);
        break;

      case InputCommand.ROTATE_CLOCKWISE:
        this.gameApplicationService.rotateBlockClockwise(gameId);
        break;

      case InputCommand.ROTATE_COUNTER_CLOCKWISE:
        this.gameApplicationService.rotateBlockCounterClockwise(gameId);
        break;

      case InputCommand.INSTANT_DROP:
        this.gameApplicationService.dropInstantly(gameId);
        break;

      case InputCommand.PAUSE:
        this.handlePauseToggle(gameId);
        break;

      case InputCommand.RESET:
        this.gameApplicationService.restartGame(gameId);
        break;

      default:
        console.warn(`Unknown input command: ${command}`);
    }
  }

  /**
   * 一時停止のトグル処理
   *
   * @param gameId - ゲームID
   */
  private handlePauseToggle(gameId: string): void {
    const gameState = this.gameApplicationService.getGameState(gameId);
    if (gameState.state === 'playing') {
      this.gameApplicationService.pauseGame(gameId);
    } else if (gameState.state === 'paused') {
      this.gameApplicationService.resumeGame(gameId);
    }
  }

  /**
   * キー押下イベントを処理（既存メソッド、handleInput()を内部で使用）
   *
   * @param key - 押下されたキー
   * @param gameId - ゲームID
   */
  handleKeyDown(key: string, gameId: string): void {
    const command = this.keyToCommand(key);
    if (command) {
      this.handleInput(command, gameId);
    }
  }

  /**
   * キー解放イベントを処理（既存メソッド）
   *
   * @param key - 解放されたキー
   * @param gameId - ゲームID
   */
  handleKeyUp(key: string, gameId: string): void {
    switch (key) {
      case 'ArrowDown':
        this.gameApplicationService.disableFastFall(gameId);
        break;
    }
  }

  /**
   * キーをInputCommandに変換
   *
   * @param key - キー文字列
   * @returns InputCommand、または null（未対応のキー）
   */
  private keyToCommand(key: string): InputCommand | null {
    switch (key) {
      case 'ArrowLeft':
        return InputCommand.MOVE_LEFT;
      case 'ArrowRight':
        return InputCommand.MOVE_RIGHT;
      case 'ArrowDown':
        return InputCommand.MOVE_DOWN;
      case 'ArrowUp':
      case 'z':
        return InputCommand.ROTATE_CLOCKWISE;
      case 'x':
      case 'Control':
        return InputCommand.ROTATE_COUNTER_CLOCKWISE;
      case ' ':
        return InputCommand.INSTANT_DROP;
      case 'p':
        return InputCommand.PAUSE;
      case 'r':
        return InputCommand.RESET;
      default:
        return null;
    }
  }

  /**
   * クールダウンをリセット
   *
   * @remarks
   * ゲームの再開時などに使用
   */
  resetCooldowns(): void {
    this.cooldownManager.reset();
  }
}
```

#### 4.3.4 変更箇所の詳細

**削除するコード**:
```typescript
// 削除
private lastInputTime: Map<string, number> = new Map();
private inputCooldownMs: number = INPUT_COOLDOWN_MS;

// 削除
canAcceptInput(key: string, currentTime: number = Date.now()): boolean {
  // ...
}

// 削除
private updateLastInputTime(key: string, currentTime: number): void {
  // ...
}
```

**追加するコード**:
```typescript
// 追加
import { CooldownManager } from './CooldownManager';
import { InputCommand } from '@application/value-objects/InputCommand';

// 追加
private cooldownManager: CooldownManager;

// 追加
constructor(
  private gameApplicationService: GameApplicationService,
  cooldownManager?: CooldownManager
) {
  this.cooldownManager = cooldownManager ?? new CooldownManager();
}

// 追加
handleInput(command: InputCommand, gameId: string): void {
  // ...
}

// 追加
private executeCommand(command: InputCommand, gameId: string): void {
  // ...
}

// 追加
private keyToCommand(key: string): InputCommand | null {
  // ...
}

// 追加
resetCooldowns(): void {
  // ...
}
```

**変更するコード**:
```typescript
// 変更前
handleKeyDown(key: string, gameId: string): void {
  switch (key) {
    case 'ArrowLeft':
      if (this.canAcceptInput('left')) {
        this.gameApplicationService.moveBlockLeft(gameId);
      }
      break;
    // ...
  }
}

// 変更後
handleKeyDown(key: string, gameId: string): void {
  const command = this.keyToCommand(key);
  if (command) {
    this.handleInput(command, gameId);
  }
}
```

#### 4.3.5 後方互換性

既存の`handleKeyDown()`と`handleKeyUp()`メソッドは変更後も同じシグネチャで使用可能です。内部実装のみ変更されます。

#### 4.3.6 テストケースの追加

**ファイル**: `tests/application/services/InputHandlerService.test.ts`（既存ファイルに追加）

```typescript
// 既存のテストは維持

describe('InputHandlerService - 新機能', () => {
  let service: InputHandlerService;
  let mockGameService: MockGameApplicationService;
  let cooldownManager: CooldownManager;

  beforeEach(() => {
    mockGameService = createMockGameApplicationService();
    cooldownManager = new CooldownManager();
    service = new InputHandlerService(mockGameService, cooldownManager);
  });

  describe('handleInput()', () => {
    it('InputCommandを正しく実行する', () => {
      service.handleInput(InputCommand.MOVE_LEFT, 'game-1');
      expect(mockGameService.moveBlockLeft).toHaveBeenCalledWith('game-1');
    });

    it('クールダウン中のコマンドを無視する', () => {
      service.handleInput(InputCommand.MOVE_LEFT, 'game-1');
      service.handleInput(InputCommand.MOVE_LEFT, 'game-1'); // すぐに再実行

      expect(mockGameService.moveBlockLeft).toHaveBeenCalledTimes(1);
    });

    it('異なるコマンドは独立して実行できる', () => {
      service.handleInput(InputCommand.MOVE_LEFT, 'game-1');
      service.handleInput(InputCommand.ROTATE_CLOCKWISE, 'game-1');

      expect(mockGameService.moveBlockLeft).toHaveBeenCalledTimes(1);
      expect(mockGameService.rotateBlockClockwise).toHaveBeenCalledTimes(1);
    });

    it('エラーが発生してもゲームを継続', () => {
      mockGameService.moveBlockLeft.mockImplementation(() => {
        throw new Error('Test error');
      });

      expect(() => {
        service.handleInput(InputCommand.MOVE_LEFT, 'game-1');
      }).not.toThrow();
    });
  });

  describe('keyToCommand()', () => {
    it('ArrowLeftをMOVE_LEFTに変換', () => {
      service.handleKeyDown('ArrowLeft', 'game-1');
      expect(mockGameService.moveBlockLeft).toHaveBeenCalled();
    });

    it('スペースキーをINSTANT_DROPに変換', () => {
      service.handleKeyDown(' ', 'game-1');
      expect(mockGameService.dropInstantly).toHaveBeenCalled();
    });

    it('未対応のキーは無視', () => {
      service.handleKeyDown('Q', 'game-1');
      // どのメソッドも呼ばれない
      expect(mockGameService.moveBlockLeft).not.toHaveBeenCalled();
    });
  });

  describe('既存機能との統合', () => {
    it('handleKeyDown()でクールダウンが機能する', () => {
      service.handleKeyDown('ArrowLeft', 'game-1');
      service.handleKeyDown('ArrowLeft', 'game-1'); // すぐに再実行

      expect(mockGameService.moveBlockLeft).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetCooldowns()', () => {
    it('全てのクールダウンをリセット', () => {
      service.handleInput(InputCommand.MOVE_LEFT, 'game-1');

      // リセット前は実行できない
      service.handleInput(InputCommand.MOVE_LEFT, 'game-1');
      expect(mockGameService.moveBlockLeft).toHaveBeenCalledTimes(1);

      // リセット後は実行できる
      service.resetCooldowns();
      service.handleInput(InputCommand.MOVE_LEFT, 'game-1');
      expect(mockGameService.moveBlockLeft).toHaveBeenCalledTimes(2);
    });
  });
});
```

---

## 5. Presentation層コンポーネントの詳細設計

### 5.1 TouchControlRenderer

#### 5.1.1 ファイル情報

**パス**: `src/presentation/renderers/TouchControlRenderer.ts`

#### 5.1.2 責務

タッチ操作用UIコントロールの描画とイベントハンドリングを担当します。DOM要素の生成、イベントリスナーの登録、メモリリーク対策を行います。

#### 5.1.3 依存関係

```typescript
import { InputHandlerService } from '@application/services/InputHandlerService';
import { InputCommand } from '@application/value-objects/InputCommand';
import { EventListenerRecord } from '@presentation/types/EventListenerRecord';
```

#### 5.1.4 TypeScript定義

```typescript
/**
 * TouchControlRenderer - タッチコントロールUIのレンダラー
 *
 * @remarks
 * タッチ操作用のUIコントロールを生成し、イベント処理を行う
 * メモリリーク対策としてイベントリスナーを自動管理
 */
export class TouchControlRenderer {
  private container: HTMLElement;
  private buttons: Map<string, HTMLButtonElement>;
  private eventListeners: EventListenerRecord[];

  /**
   * コンストラクタ
   *
   * @param containerElement - コントロールを配置する親要素
   * @param inputHandlerService - 入力処理サービス
   * @param gameId - ゲームID
   * @throws {Error} containerElementがnullの場合
   */
  constructor(
    containerElement: HTMLElement | null,
    private inputHandlerService: InputHandlerService,
    private gameId: string
  ) {
    if (!containerElement) {
      throw new Error('TouchControlRenderer: containerElement is required');
    }

    this.container = containerElement;
    this.buttons = new Map<string, HTMLButtonElement>();
    this.eventListeners = [];
  }

  /**
   * タッチコントロールUIを生成してDOMに追加
   *
   * @remarks
   * UIの構造:
   * - 回転ボタン（左上）
   * - 方向ボタン（中央）
   * - 即落下ボタン（右下）
   */
  render(): void {
    try {
      // コンテナをクリア
      this.container.innerHTML = '';
      this.buttons.clear();

      // タッチコントロールのルート要素を作成
      const touchControls = this.createTouchControlsElement();

      // コンテナに追加
      this.container.appendChild(touchControls);

      // イベントリスナーを設定
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to render touch controls:', error);
      throw error;
    }
  }

  /**
   * タッチコントロールのDOM構造を作成
   *
   * @returns タッチコントロールのルート要素
   */
  private createTouchControlsElement(): HTMLElement {
    const touchControls = document.createElement('div');
    touchControls.className = 'touch-controls';
    touchControls.setAttribute('data-testid', 'touch-controls');

    // 回転ボタン
    const rotationButtons = this.createRotationButtons();
    touchControls.appendChild(rotationButtons);

    // 方向ボタン
    const directionButtons = this.createDirectionButtons();
    touchControls.appendChild(directionButtons);

    // 即落下ボタン
    const dropButton = this.createDropButton();
    touchControls.appendChild(dropButton);

    return touchControls;
  }

  /**
   * 回転ボタンを作成
   *
   * @returns 回転ボタンのコンテナ
   */
  private createRotationButtons(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'rotation-buttons';

    // 反時計回りボタン
    const ccwButton = this.createButton('rotate-ccw', '↺', 'rotation-ccw-btn');
    container.appendChild(ccwButton);

    // 時計回りボタン
    const cwButton = this.createButton('rotate-cw', '↻', 'rotation-cw-btn');
    container.appendChild(cwButton);

    return container;
  }

  /**
   * 方向ボタンを作成
   *
   * @returns 方向ボタンのコンテナ
   */
  private createDirectionButtons(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'direction-buttons';

    // 左ボタン
    const leftButton = this.createButton('left', '←', 'direction-left-btn');
    container.appendChild(leftButton);

    // 下ボタン
    const downButton = this.createButton('down', '↓', 'direction-down-btn');
    container.appendChild(downButton);

    // 右ボタン
    const rightButton = this.createButton('right', '→', 'direction-right-btn');
    container.appendChild(rightButton);

    return container;
  }

  /**
   * 即落下ボタンを作成
   *
   * @returns 即落下ボタンのコンテナ
   */
  private createDropButton(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'drop-button';

    const button = this.createButton('instant-drop', '▼ 即落下', 'drop-btn');
    container.appendChild(button);

    return container;
  }

  /**
   * ボタン要素を作成
   *
   * @param action - data-action属性の値
   * @param label - ボタンのラベル
   * @param testId - data-testid属性の値
   * @returns ボタン要素
   */
  private createButton(action: string, label: string, testId: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'touch-btn';
    button.setAttribute('data-action', action);
    button.setAttribute('data-testid', testId);
    button.textContent = label;
    button.type = 'button';

    // ボタンをマップに保存
    this.buttons.set(action, button);

    return button;
  }

  /**
   * 各ボタンにタッチイベントリスナーを設定
   *
   * @remarks
   * メモリリーク対策としてリスナーを記録
   */
  private setupEventListeners(): void {
    this.buttons.forEach((button, action) => {
      // touchstart: タッチ開始時
      const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault(); // スクロール防止
        try {
          button.classList.add('active'); // 視覚フィードバック
          this.handleTouchInput(action);
        } catch (error) {
          console.error(`Touch start error for ${action}:`, error);
        }
      };

      // touchend: タッチ終了時
      const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        button.classList.remove('active'); // 視覚フィードバック解除
      };

      // touchcancel: タッチキャンセル時
      const handleTouchCancel = (e: TouchEvent) => {
        button.classList.remove('active'); // キャンセル時も解除
      };

      // マウスイベントもサポート（デバッグ用）
      const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        button.classList.add('active');
        this.handleTouchInput(action);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        button.classList.remove('active');
      };

      // イベントリスナーを登録（メモリリーク対策付き）
      this.addEventListener(button, 'touchstart', handleTouchStart as EventListener);
      this.addEventListener(button, 'touchend', handleTouchEnd as EventListener);
      this.addEventListener(button, 'touchcancel', handleTouchCancel as EventListener);
      this.addEventListener(button, 'mousedown', handleMouseDown as EventListener);
      this.addEventListener(button, 'mouseup', handleMouseUp as EventListener);
    });
  }

  /**
   * タッチ操作をInputCommandに変換してInputHandlerServiceに送信
   *
   * @param action - data-action属性の値
   */
  private handleTouchInput(action: string): void {
    try {
      const command = this.convertToInputCommand(action);
      this.inputHandlerService.handleInput(command, this.gameId);
    } catch (error) {
      console.error(`Failed to handle touch input for ${action}:`, error);
      // エラーでもゲームを継続（入力だけ無視）
    }
  }

  /**
   * タッチアクションをInputCommandに変換
   *
   * @param action - data-action属性の値
   * @returns InputCommand
   * @throws {Error} 未知のアクションの場合
   */
  private convertToInputCommand(action: string): InputCommand {
    switch (action) {
      case 'left':
        return InputCommand.MOVE_LEFT;
      case 'right':
        return InputCommand.MOVE_RIGHT;
      case 'down':
        return InputCommand.MOVE_DOWN;
      case 'rotate-cw':
        return InputCommand.ROTATE_CLOCKWISE;
      case 'rotate-ccw':
        return InputCommand.ROTATE_COUNTER_CLOCKWISE;
      case 'instant-drop':
        return InputCommand.INSTANT_DROP;
      default:
        throw new Error(`Unknown touch action: ${action}`);
    }
  }

  /**
   * イベントリスナーを登録し、メモリリーク対策のために記録
   *
   * @param element - 要素
   * @param event - イベント名
   * @param handler - ハンドラ
   */
  private addEventListener(
    element: HTMLElement,
    event: string,
    handler: EventListener
  ): void {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  /**
   * タッチコントロールを表示
   */
  show(): void {
    this.container.style.display = 'flex';
  }

  /**
   * タッチコントロールを非表示
   */
  hide(): void {
    this.container.style.display = 'none';
  }

  /**
   * イベントリスナーを全て解除し、DOM要素を削除
   *
   * @remarks
   * メモリリーク対策として必ずコンポーネント破棄時に呼び出すこと
   */
  destroy(): void {
    try {
      // 全イベントリスナーを自動解放
      this.eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.eventListeners = [];

      // ボタンマップをクリア
      this.buttons.clear();

      // DOM要素を削除
      this.container.innerHTML = '';
    } catch (error) {
      console.error('Failed to destroy touch controls:', error);
    }
  }
}
```

#### 5.1.5 DOM構造

```html
<div class="touch-controls" data-testid="touch-controls">
  <!-- 回転ボタン -->
  <div class="rotation-buttons">
    <button
      class="touch-btn"
      data-action="rotate-ccw"
      data-testid="rotation-ccw-btn"
      type="button">
      ↺
    </button>
    <button
      class="touch-btn"
      data-action="rotate-cw"
      data-testid="rotation-cw-btn"
      type="button">
      ↻
    </button>
  </div>

  <!-- 方向ボタン -->
  <div class="direction-buttons">
    <button
      class="touch-btn"
      data-action="left"
      data-testid="direction-left-btn"
      type="button">
      ←
    </button>
    <button
      class="touch-btn"
      data-action="down"
      data-testid="direction-down-btn"
      type="button">
      ↓
    </button>
    <button
      class="touch-btn"
      data-action="right"
      data-testid="direction-right-btn"
      type="button">
      →
    </button>
  </div>

  <!-- 即落下ボタン -->
  <div class="drop-button">
    <button
      class="touch-btn"
      data-action="instant-drop"
      data-testid="drop-btn"
      type="button">
      ▼ 即落下
    </button>
  </div>
</div>
```

#### 5.1.6 ライフサイクル

```
[生成]
  new TouchControlRenderer(container, inputHandlerService, gameId)
  ↓
[初期化]
  render()
  - DOM要素を生成
  - イベントリスナーを登録
  ↓
[使用中]
  show() / hide()
  - 表示/非表示の切り替え
  ↓
[破棄]
  destroy()
  - イベントリスナーを全て解除
  - DOM要素を削除
```

#### 5.1.7 エラーハンドリング戦略

| エラー発生箇所 | 処理 | 影響 |
|--------------|------|------|
| constructor() | throw | インスタンス化失敗 |
| render() | throw | UI生成失敗 |
| handleTouchInput() | catch & log | タッチ入力1回分を無視、ゲーム継続 |
| convertToInputCommand() | throw | handleTouchInput()でcatch |
| destroy() | catch & log | メモリリークの可能性、ログに記録 |

#### 5.1.8 テストケース

**ファイル**: `tests/presentation/renderers/TouchControlRenderer.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TouchControlRenderer } from '@presentation/renderers/TouchControlRenderer';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { InputCommand } from '@application/value-objects/InputCommand';

describe('TouchControlRenderer', () => {
  let container: HTMLElement;
  let mockInputHandler: InputHandlerService;
  let renderer: TouchControlRenderer;

  beforeEach(() => {
    // コンテナ要素を作成
    container = document.createElement('div');
    container.id = 'touch-controls-container';
    document.body.appendChild(container);

    // モックInputHandlerServiceを作成
    mockInputHandler = {
      handleInput: vi.fn(),
    } as any;

    renderer = new TouchControlRenderer(container, mockInputHandler, 'game-1');
  });

  afterEach(() => {
    renderer.destroy();
    document.body.removeChild(container);
  });

  describe('コンストラクタ', () => {
    it('正常に初期化できる', () => {
      expect(renderer).toBeDefined();
    });

    it('containerElementがnullの場合エラーをスロー', () => {
      expect(() => {
        new TouchControlRenderer(null, mockInputHandler, 'game-1');
      }).toThrow('TouchControlRenderer: containerElement is required');
    });
  });

  describe('render()', () => {
    it('タッチコントロールUIを生成する', () => {
      renderer.render();

      const touchControls = container.querySelector('.touch-controls');
      expect(touchControls).toBeTruthy();
    });

    it('全てのボタンが生成される', () => {
      renderer.render();

      expect(container.querySelector('[data-action="left"]')).toBeTruthy();
      expect(container.querySelector('[data-action="right"]')).toBeTruthy();
      expect(container.querySelector('[data-action="down"]')).toBeTruthy();
      expect(container.querySelector('[data-action="rotate-cw"]')).toBeTruthy();
      expect(container.querySelector('[data-action="rotate-ccw"]')).toBeTruthy();
      expect(container.querySelector('[data-action="instant-drop"]')).toBeTruthy();
    });

    it('ボタンにdata-testid属性が設定される', () => {
      renderer.render();

      expect(container.querySelector('[data-testid="direction-left-btn"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="direction-right-btn"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="drop-btn"]')).toBeTruthy();
    });

    it('複数回呼び出しても正常に動作', () => {
      renderer.render();
      renderer.render();

      const buttons = container.querySelectorAll('.touch-btn');
      expect(buttons.length).toBe(6);
    });
  });

  describe('イベント処理', () => {
    beforeEach(() => {
      renderer.render();
    });

    it('左ボタンのタッチでMOVE_LEFTコマンドを送信', () => {
      const leftButton = container.querySelector('[data-action="left"]') as HTMLElement;
      const touchEvent = new TouchEvent('touchstart', { bubbles: true });

      leftButton.dispatchEvent(touchEvent);

      expect(mockInputHandler.handleInput).toHaveBeenCalledWith(
        InputCommand.MOVE_LEFT,
        'game-1'
      );
    });

    it('右ボタンのタッチでMOVE_RIGHTコマンドを送信', () => {
      const rightButton = container.querySelector('[data-action="right"]') as HTMLElement;
      const touchEvent = new TouchEvent('touchstart', { bubbles: true });

      rightButton.dispatchEvent(touchEvent);

      expect(mockInputHandler.handleInput).toHaveBeenCalledWith(
        InputCommand.MOVE_RIGHT,
        'game-1'
      );
    });

    it('即落下ボタンのタッチでINSTANT_DROPコマンドを送信', () => {
      const dropButton = container.querySelector('[data-action="instant-drop"]') as HTMLElement;
      const touchEvent = new TouchEvent('touchstart', { bubbles: true });

      dropButton.dispatchEvent(touchEvent);

      expect(mockInputHandler.handleInput).toHaveBeenCalledWith(
        InputCommand.INSTANT_DROP,
        'game-1'
      );
    });

    it('タッチ開始時にactiveクラスが追加される', () => {
      const leftButton = container.querySelector('[data-action="left"]') as HTMLElement;
      const touchStartEvent = new TouchEvent('touchstart', { bubbles: true });

      leftButton.dispatchEvent(touchStartEvent);

      expect(leftButton.classList.contains('active')).toBe(true);
    });

    it('タッチ終了時にactiveクラスが削除される', () => {
      const leftButton = container.querySelector('[data-action="left"]') as HTMLElement;
      const touchStartEvent = new TouchEvent('touchstart', { bubbles: true });
      const touchEndEvent = new TouchEvent('touchend', { bubbles: true });

      leftButton.dispatchEvent(touchStartEvent);
      expect(leftButton.classList.contains('active')).toBe(true);

      leftButton.dispatchEvent(touchEndEvent);
      expect(leftButton.classList.contains('active')).toBe(false);
    });

    it('マウスイベントもサポート（デバッグ用）', () => {
      const leftButton = container.querySelector('[data-action="left"]') as HTMLElement;
      const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });

      leftButton.dispatchEvent(mouseDownEvent);

      expect(mockInputHandler.handleInput).toHaveBeenCalledWith(
        InputCommand.MOVE_LEFT,
        'game-1'
      );
    });
  });

  describe('show() / hide()', () => {
    beforeEach(() => {
      renderer.render();
    });

    it('show()でコンテナが表示される', () => {
      renderer.hide();
      renderer.show();

      expect(container.style.display).toBe('flex');
    });

    it('hide()でコンテナが非表示になる', () => {
      renderer.show();
      renderer.hide();

      expect(container.style.display).toBe('none');
    });
  });

  describe('destroy()', () => {
    beforeEach(() => {
      renderer.render();
    });

    it('イベントリスナーが全て解除される', () => {
      const leftButton = container.querySelector('[data-action="left"]') as HTMLElement;

      renderer.destroy();

      // destroy後はイベントが発火しない
      const touchEvent = new TouchEvent('touchstart', { bubbles: true });
      leftButton.dispatchEvent(touchEvent);

      // handleInputが呼ばれないことを確認
      // （destroy前に呼ばれた回数と変わらない）
      const callCountBeforeDestroy = mockInputHandler.handleInput.mock.calls.length;
      expect(mockInputHandler.handleInput).toHaveBeenCalledTimes(callCountBeforeDestroy);
    });

    it('DOM要素が削除される', () => {
      renderer.destroy();

      const touchControls = container.querySelector('.touch-controls');
      expect(touchControls).toBeFalsy();
    });

    it('複数回呼び出しても安全', () => {
      expect(() => {
        renderer.destroy();
        renderer.destroy();
      }).not.toThrow();
    });
  });

  describe('エラーハンドリング', () => {
    it('未知のアクションでもエラーをスローしない', () => {
      renderer.render();
      const button = document.createElement('button');
      button.setAttribute('data-action', 'unknown');
      container.appendChild(button);

      expect(() => {
        button.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
      }).not.toThrow();
    });

    it('InputHandlerServiceのエラーを適切に処理', () => {
      mockInputHandler.handleInput = vi.fn(() => {
        throw new Error('Test error');
      });

      renderer.render();
      const leftButton = container.querySelector('[data-action="left"]') as HTMLElement;

      expect(() => {
        leftButton.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
      }).not.toThrow();
    });
  });
});
```

---

### 5.2 CanvasRenderer（変更）

#### 5.2.1 ファイル情報

**パス**: `src/presentation/renderers/CanvasRenderer.ts`

#### 5.2.2 変更内容サマリー

| 項目 | 変更前 | 変更後 |
|------|-------|-------|
| ブロックサイズ | 固定値（30px） | 動的に変更可能 |
| Canvas初期化 | コンストラクタで固定サイズ設定 | コンストラクタで可変サイズ設定 |
| サイズ更新 | 不可 | `updateBlockSize()` メソッドで更新可能 |

#### 5.2.3 変更後のTypeScript定義

```typescript
import { GameDto } from '@application/dto/GameDto';

const BACKGROUND_COLOR = '#2c3e50';
const GRID_COLOR = '#34495e';

/**
 * CanvasRenderer
 *
 * ゲームフィールドとブロックの描画を担当するクラス
 */
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;

  /**
   * コンストラクタ
   * @param canvas - 描画対象のHTMLCanvasElement
   * @param blockSize - 1ブロックのサイズ（ピクセル）、デフォルト30px
   * @throws {Error} canvasのcontextが取得できない場合
   */
  constructor(
    private canvas: HTMLCanvasElement,
    private blockSize: number = 30
  ) {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    this.ctx = ctx;

    // キャンバスサイズを設定（8x20マス）
    this.updateCanvasSize();
  }

  /**
   * ブロックサイズを更新
   *
   * @param newBlockSize - 新しいブロックサイズ（ピクセル）
   *
   * @remarks
   * リサイズ時に呼び出される
   * Canvas全体のサイズも自動的に更新される
   */
  updateBlockSize(newBlockSize: number): void {
    if (newBlockSize <= 0) {
      console.warn(`Invalid block size: ${newBlockSize}. Ignoring update.`);
      return;
    }

    this.blockSize = newBlockSize;
    this.updateCanvasSize();
  }

  /**
   * Canvas全体のサイズを更新
   *
   * @remarks
   * blockSizeに基づいてCanvas全体のサイズを再計算
   */
  private updateCanvasSize(): void {
    this.canvas.width = this.blockSize * 8;
    this.canvas.height = this.blockSize * 20;
  }

  /**
   * 現在のブロックサイズを取得
   *
   * @returns 現在のブロックサイズ（ピクセル）
   */
  getBlockSize(): number {
    return this.blockSize;
  }

  /**
   * ゲーム状態を描画
   * @param gameDto - ゲームの状態
   */
  render(gameDto: GameDto): void {
    this.clear();
    this.drawGrid();
    this.drawField(gameDto.field);

    if (gameDto.fallingBlock) {
      this.drawFallingBlock(gameDto.fallingBlock);
    }

    // ゲームオーバー時のオーバーレイ
    if (gameDto.state === 'gameOver') {
      this.drawGameOverOverlay();
    }

    // 一時停止時のオーバーレイ
    if (gameDto.state === 'paused') {
      this.drawPausedOverlay();
    }
  }

  /**
   * キャンバスをクリア
   */
  private clear(): void {
    this.ctx.fillStyle = BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * グリッド線を描画
   */
  private drawGrid(): void {
    this.ctx.strokeStyle = GRID_COLOR;
    this.ctx.lineWidth = 1;

    // 縦線
    for (let x = 0; x <= 8; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.blockSize, 0);
      this.ctx.lineTo(x * this.blockSize, this.canvas.height);
      this.ctx.stroke();
    }

    // 横線
    for (let y = 0; y <= 20; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.blockSize);
      this.ctx.lineTo(this.canvas.width, y * this.blockSize);
      this.ctx.stroke();
    }
  }

  /**
   * フィールドのブロックを描画
   * @param field - フィールドの状態
   */
  private drawField(field: (string | null)[][]): void {
    for (let y = 0; y < field.length; y++) {
      for (let x = 0; x < field[y].length; x++) {
        const colorType = field[y][x];

        if (colorType) {
          this.drawBlock(x, y, this.getColorHex(colorType));
        }
      }
    }
  }

  /**
   * 落下ブロックを描画
   * @param fallingBlock - 落下中のブロック情報
   */
  private drawFallingBlock(fallingBlock: {
    pattern: string[][];
    position: { x: number; y: number };
    rotation: number;
  }): void {
    const { pattern, position } = fallingBlock;

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        const colorType = pattern[y][x];

        if (colorType && colorType !== 'empty') {
          const absX = position.x + x;
          const absY = position.y + y;

          this.drawBlock(absX, absY, this.getColorHex(colorType));
        }
      }
    }
  }

  /**
   * 単一のブロックを描画
   * @param x - X座標（マス目）
   * @param y - Y座標（マス目）
   * @param color - ブロックの色
   */
  private drawBlock(x: number, y: number, color: string): void {
    const pixelX = x * this.blockSize;
    const pixelY = y * this.blockSize;

    // ブロックの塗りつぶし
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      pixelX + 1,
      pixelY + 1,
      this.blockSize - 2,
      this.blockSize - 2
    );

    // ブロックの枠線（立体感）
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      pixelX + 1,
      pixelY + 1,
      this.blockSize - 2,
      this.blockSize - 2
    );

    // ハイライト
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fillRect(
      pixelX + 2,
      pixelY + 2,
      this.blockSize - 4,
      (this.blockSize - 4) / 3
    );
  }

  /**
   * ゲームオーバーのオーバーレイを描画
   */
  private drawGameOverOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      'GAME OVER',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  /**
   * 一時停止のオーバーレイを描画
   */
  private drawPausedOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      'PAUSED',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  /**
   * 色文字列をHEXコードに変換
   * @param colorType - 色のタイプ（'blue', 'red', 'yellow'）
   * @returns HEXカラーコード
   */
  private getColorHex(colorType: string): string {
    const colors: { [key: string]: string } = {
      blue: '#3498db',
      red: '#e74c3c',
      yellow: '#f1c40f'
    };

    return colors[colorType] || '#000';
  }
}
```

#### 5.2.4 変更箇所の詳細

**変更1: ブロックサイズをprivateフィールドに変更**

```typescript
// 変更前
private readonly BLOCK_SIZE = 30; // 固定値

// 変更後
private blockSize: number = 30; // 可変
```

**変更2: Canvas初期化処理を分離**

```typescript
// 変更前
constructor(
  private canvas: HTMLCanvasElement,
  private blockSize: number = 30
) {
  // ...
  this.canvas.width = blockSize * 8;
  this.canvas.height = blockSize * 20;
}

// 変更後
constructor(
  private canvas: HTMLCanvasElement,
  private blockSize: number = 30
) {
  // ...
  this.updateCanvasSize();
}

private updateCanvasSize(): void {
  this.canvas.width = this.blockSize * 8;
  this.canvas.height = this.blockSize * 20;
}
```

**追加3: updateBlockSize() メソッド**

```typescript
// 新規追加
updateBlockSize(newBlockSize: number): void {
  if (newBlockSize <= 0) {
    console.warn(`Invalid block size: ${newBlockSize}. Ignoring update.`);
    return;
  }

  this.blockSize = newBlockSize;
  this.updateCanvasSize();
}
```

**追加4: getBlockSize() メソッド**

```typescript
// 新規追加
getBlockSize(): number {
  return this.blockSize;
}
```

**変更5: 全ての描画メソッドでBLOCK_SIZE → this.blockSizeに変更**

```typescript
// 変更前
const pixelX = x * this.BLOCK_SIZE;

// 変更後
const pixelX = x * this.blockSize;
```

#### 5.2.5 後方互換性

既存の呼び出しコードは変更不要です：

```typescript
// 既存コード（そのまま動作）
const renderer = new CanvasRenderer(canvas);

// 新機能（ブロックサイズ指定）
const renderer = new CanvasRenderer(canvas, 25);

// 動的サイズ変更
renderer.updateBlockSize(30);
```

#### 5.2.6 エラーハンドリング

| エラー発生箇所 | 処理 | 影響 |
|--------------|------|------|
| constructor() - context取得失敗 | throw | インスタンス化失敗 |
| updateBlockSize() - 無効な値 | warn & return | サイズ更新をスキップ、現在のサイズを維持 |

#### 5.2.7 テストケースの追加

**ファイル**: `tests/presentation/renderers/CanvasRenderer.test.ts`（新規作成）

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { GameDto } from '@application/dto/GameDto';

describe('CanvasRenderer', () => {
  let canvas: HTMLCanvasElement;
  let renderer: CanvasRenderer;

  beforeEach(() => {
    // Canvas要素を作成
    canvas = document.createElement('canvas');
  });

  describe('コンストラクタ', () => {
    it('デフォルトのブロックサイズ（30px）で初期化できる', () => {
      renderer = new CanvasRenderer(canvas);

      expect(canvas.width).toBe(240); // 30 * 8
      expect(canvas.height).toBe(600); // 30 * 20
      expect(renderer.getBlockSize()).toBe(30);
    });

    it('カスタムブロックサイズで初期化できる', () => {
      renderer = new CanvasRenderer(canvas, 20);

      expect(canvas.width).toBe(160); // 20 * 8
      expect(canvas.height).toBe(400); // 20 * 20
      expect(renderer.getBlockSize()).toBe(20);
    });

    it('contextが取得できない場合エラーをスロー', () => {
      const mockCanvas = {
        getContext: vi.fn(() => null)
      } as any;

      expect(() => {
        new CanvasRenderer(mockCanvas);
      }).toThrow('Failed to get canvas context');
    });
  });

  describe('updateBlockSize()', () => {
    beforeEach(() => {
      renderer = new CanvasRenderer(canvas, 30);
    });

    it('ブロックサイズを正しく更新', () => {
      renderer.updateBlockSize(25);

      expect(renderer.getBlockSize()).toBe(25);
      expect(canvas.width).toBe(200); // 25 * 8
      expect(canvas.height).toBe(500); // 25 * 20
    });

    it('ブロックサイズを小さく変更', () => {
      renderer.updateBlockSize(15);

      expect(renderer.getBlockSize()).toBe(15);
      expect(canvas.width).toBe(120); // 15 * 8
      expect(canvas.height).toBe(300); // 15 * 20
    });

    it('ブロックサイズを大きく変更', () => {
      renderer.updateBlockSize(40);

      expect(renderer.getBlockSize()).toBe(40);
      expect(canvas.width).toBe(320); // 40 * 8
      expect(canvas.height).toBe(800); // 40 * 20
    });

    it('無効な値（0）では更新しない', () => {
      const consoleSpy = vi.spyOn(console, 'warn');

      renderer.updateBlockSize(0);

      expect(renderer.getBlockSize()).toBe(30); // 変更されない
      expect(consoleSpy).toHaveBeenCalledWith('Invalid block size: 0. Ignoring update.');
    });

    it('無効な値（負数）では更新しない', () => {
      const consoleSpy = vi.spyOn(console, 'warn');

      renderer.updateBlockSize(-10);

      expect(renderer.getBlockSize()).toBe(30); // 変更されない
      expect(consoleSpy).toHaveBeenCalledWith('Invalid block size: -10. Ignoring update.');
    });

    it('複数回の更新が正常に動作', () => {
      renderer.updateBlockSize(20);
      expect(renderer.getBlockSize()).toBe(20);

      renderer.updateBlockSize(35);
      expect(renderer.getBlockSize()).toBe(35);

      renderer.updateBlockSize(25);
      expect(renderer.getBlockSize()).toBe(25);
    });
  });

  describe('render()', () => {
    beforeEach(() => {
      renderer = new CanvasRenderer(canvas, 30);
    });

    it('GameDtoを正常に描画', () => {
      const gameDto: GameDto = createMockGameDto();

      expect(() => {
        renderer.render(gameDto);
      }).not.toThrow();
    });

    it('異なるブロックサイズで描画が正常に動作', () => {
      renderer.updateBlockSize(20);
      const gameDto: GameDto = createMockGameDto();

      expect(() => {
        renderer.render(gameDto);
      }).not.toThrow();
    });

    it('ゲームオーバー状態を正しく描画', () => {
      const gameDto: GameDto = {
        ...createMockGameDto(),
        state: 'gameOver'
      };

      expect(() => {
        renderer.render(gameDto);
      }).not.toThrow();
    });

    it('一時停止状態を正しく描画', () => {
      const gameDto: GameDto = {
        ...createMockGameDto(),
        state: 'paused'
      };

      expect(() => {
        renderer.render(gameDto);
      }).not.toThrow();
    });
  });

  describe('統合テスト', () => {
    it('リサイズ後も描画が正常に動作', () => {
      renderer = new CanvasRenderer(canvas, 30);
      const gameDto: GameDto = createMockGameDto();

      // 初回描画
      renderer.render(gameDto);

      // リサイズ
      renderer.updateBlockSize(20);

      // 再描画
      expect(() => {
        renderer.render(gameDto);
      }).not.toThrow();

      expect(canvas.width).toBe(160);
      expect(canvas.height).toBe(400);
    });
  });
});

function createMockGameDto(): GameDto {
  return {
    gameId: 'test-game',
    state: 'playing',
    field: Array(20).fill(null).map(() => Array(8).fill(null)),
    fallingBlock: {
      pattern: [['blue', 'blue'], ['blue', 'blue']],
      position: { x: 3, y: 0 },
      rotation: 0
    },
    score: 0,
    level: 1,
    linesCleared: 0
  };
}
```

---

### 5.3 GameController（変更）

#### 5.3.1 ファイル情報

**パス**: `src/presentation/controllers/GameController.ts`

#### 5.3.2 変更内容サマリー

| 項目 | 変更前 | 変更後 |
|------|-------|-------|
| レスポンシブ対応 | なし | リサイズイベント処理を追加 |
| タッチコントロール | なし | TouchControlRendererを統合 |
| レイアウト計算 | なし | LayoutCalculationServiceを使用 |
| 初期化処理 | start()のみ | setupResponsiveLayout()を追加 |
| 依存サービス | 4個 | 6個（+2: LayoutCalculationService, TouchControlRenderer） |

#### 5.3.3 追加する依存関係

```typescript
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { LayoutCalculationService } from '@application/services/LayoutCalculationService';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { UIRenderer } from '@presentation/renderers/UIRenderer';
import { TouchControlRenderer } from '@presentation/renderers/TouchControlRenderer';
import { FrameTimer } from '@infrastructure/timer/FrameTimer';
import { GameDto } from '@application/dto/GameDto';
import { ViewportSize } from '@application/value-objects/ViewportSize';
```

#### 5.3.4 変更後のTypeScript定義

```typescript
/**
 * GameController
 *
 * ゲーム全体を制御するコントローラー
 */
export class GameController {
  private frameTimer: FrameTimer;
  private currentGameId: string | null = null;
  private touchControlRenderer: TouchControlRenderer | null = null;
  private currentViewportSize: ViewportSize | null = null;
  private resizeTimeoutId: number | null = null;

  // イベントハンドラーを保持（削除時に必要）
  private keydownHandler?: (event: KeyboardEvent) => void;
  private keyupHandler?: (event: KeyboardEvent) => void;
  private pauseBtnHandler?: () => void;
  private resetBtnHandler?: () => void;
  private restartBtnHandler?: () => void;
  private resizeHandler?: () => void;

  constructor(
    private gameApplicationService: GameApplicationService,
    private inputHandlerService: InputHandlerService,
    private layoutCalculationService: LayoutCalculationService,
    private canvasRenderer: CanvasRenderer,
    private uiRenderer: UIRenderer,
    private canvas: HTMLCanvasElement
  ) {
    this.frameTimer = new FrameTimer();
  }

  /**
   * ゲームを開始
   */
  start(): void {
    try {
      // レスポンシブレイアウトを初期化
      this.setupResponsiveLayout();

      // 新しいゲームを開始
      const gameDto = this.gameApplicationService.startNewGame();
      this.currentGameId = gameDto.gameId;

      // タッチコントロールを初期化
      this.initializeTouchControls();

      // イベントリスナーを設定
      this.setupEventListeners();

      // 初回描画
      this.render(gameDto);

      // ゲームループを開始
      this.frameTimer.start(() => {
        this.gameLoop();
      }, 30);
    } catch (error) {
      console.error('Failed to start game:', error);
      this.showError('ゲームの開始に失敗しました。');
    }
  }

  /**
   * ゲームを停止
   */
  stop(): void {
    this.frameTimer.stop();
    this.removeEventListeners();

    // タッチコントロールを破棄
    if (this.touchControlRenderer) {
      this.touchControlRenderer.destroy();
      this.touchControlRenderer = null;
    }
  }

  /**
   * レスポンシブレイアウトの初期設定
   *
   * @remarks
   * ブラウザの画面サイズに応じてCanvasサイズとブロックサイズを調整
   */
  private setupResponsiveLayout(): void {
    try {
      // 1. 初期ビューポートサイズを取得
      const viewport = ViewportSize.fromWindow();
      this.currentViewportSize = viewport;

      // 2. レイアウト計算（Application層のサービスを使用）
      const blockSize = this.layoutCalculationService.calculateBlockSize(viewport);
      const canvasSize = this.layoutCalculationService.calculateCanvasSize(blockSize);

      // 3. CanvasRendererを更新
      this.canvasRenderer.updateBlockSize(blockSize.size);
      this.canvas.width = canvasSize.width;
      this.canvas.height = canvasSize.height;
    } catch (error) {
      console.error('Failed to setup responsive layout:', error);
      // フォールバック: デフォルトサイズを使用
      this.useDefaultLayout();
    }
  }

  /**
   * デフォルトレイアウトを使用（フォールバック）
   */
  private useDefaultLayout(): void {
    console.warn('Using default layout due to error in responsive setup');
    this.canvasRenderer.updateBlockSize(30);
    this.canvas.width = 240;
    this.canvas.height = 600;
  }

  /**
   * タッチコントロールを初期化
   */
  private initializeTouchControls(): void {
    try {
      if (!this.currentGameId) {
        throw new Error('Cannot initialize touch controls: gameId is null');
      }

      // タッチコントロール用のコンテナ要素を取得
      const container = document.getElementById('touch-controls-container');
      if (!container) {
        console.warn('Touch controls container not found. Skipping touch controls initialization.');
        return;
      }

      // TouchControlRendererインスタンスを作成
      this.touchControlRenderer = new TouchControlRenderer(
        container,
        this.inputHandlerService,
        this.currentGameId
      );

      // UIを描画
      this.touchControlRenderer.render();

      // 初期表示/非表示を設定
      if (this.currentViewportSize) {
        const shouldShow = this.layoutCalculationService.shouldShowTouchControls(
          this.currentViewportSize
        );
        shouldShow ? this.touchControlRenderer.show() : this.touchControlRenderer.hide();
      }
    } catch (error) {
      console.error('Failed to initialize touch controls:', error);
      // タッチコントロールが失敗してもゲームは継続
      this.touchControlRenderer = null;
    }
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    // 既存のイベントリスナーを削除（重複登録を防ぐ）
    this.removeEventListeners();

    // キーボードイベント
    this.keydownHandler = (event: KeyboardEvent) => {
      if (!this.currentGameId) return;
      this.inputHandlerService.handleKeyDown(event.key, this.currentGameId);
    };

    this.keyupHandler = (event: KeyboardEvent) => {
      if (!this.currentGameId) return;
      this.inputHandlerService.handleKeyUp(event.key, this.currentGameId);
    };

    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);

    // リサイズイベント
    this.resizeHandler = () => {
      this.handleResizeWithDebounce();
    };
    window.addEventListener('resize', this.resizeHandler);

    // ボタンイベント
    this.pauseBtnHandler = () => {
      if (!this.currentGameId) return;

      const gameState = this.gameApplicationService.getGameState(
        this.currentGameId
      );
      if (gameState.state === 'playing') {
        this.gameApplicationService.pauseGame(this.currentGameId);
      } else if (gameState.state === 'paused') {
        this.gameApplicationService.resumeGame(this.currentGameId);
      }
    };

    this.resetBtnHandler = () => {
      if (!this.currentGameId) return;
      this.gameApplicationService.restartGame(this.currentGameId);
    };

    this.restartBtnHandler = () => {
      if (!this.currentGameId) return;
      this.gameApplicationService.restartGame(this.currentGameId);
    };

    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const restartBtn = document.getElementById('restart-btn');

    if (pauseBtn) {
      pauseBtn.addEventListener('click', this.pauseBtnHandler);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', this.resetBtnHandler);
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', this.restartBtnHandler);
    }
  }

  /**
   * イベントリスナーを削除
   */
  private removeEventListeners(): void {
    // キーボードイベントリスナーを削除
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = undefined;
    }

    if (this.keyupHandler) {
      window.removeEventListener('keyup', this.keyupHandler);
      this.keyupHandler = undefined;
    }

    // リサイズイベントリスナーを削除
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = undefined;
    }

    // デバウンスタイマーをクリア
    if (this.resizeTimeoutId !== null) {
      clearTimeout(this.resizeTimeoutId);
      this.resizeTimeoutId = null;
    }

    // ボタンイベントリスナーを削除
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const restartBtn = document.getElementById('restart-btn');

    if (pauseBtn && this.pauseBtnHandler) {
      pauseBtn.removeEventListener('click', this.pauseBtnHandler);
      this.pauseBtnHandler = undefined;
    }

    if (resetBtn && this.resetBtnHandler) {
      resetBtn.removeEventListener('click', this.resetBtnHandler);
      this.resetBtnHandler = undefined;
    }

    if (restartBtn && this.restartBtnHandler) {
      restartBtn.removeEventListener('click', this.restartBtnHandler);
      this.restartBtnHandler = undefined;
    }
  }

  /**
   * リサイズ処理（デバウンス付き）
   *
   * @remarks
   * 連続したリサイズイベントをデバウンスして、250ms後に実行
   */
  private handleResizeWithDebounce(): void {
    // 既存のタイマーをクリア
    if (this.resizeTimeoutId !== null) {
      clearTimeout(this.resizeTimeoutId);
    }

    // 新しいタイマーを設定
    this.resizeTimeoutId = window.setTimeout(() => {
      this.handleResize();
      this.resizeTimeoutId = null;
    }, 250);
  }

  /**
   * ウィンドウリサイズ時の処理
   *
   * @remarks
   * ビューポートサイズの変化に応じてCanvasサイズとタッチコントロールを更新
   */
  private handleResize(): void {
    try {
      // 1. 新しいビューポートサイズを取得
      const newViewport = ViewportSize.fromWindow();

      // 2. サイズが変わらなければスキップ
      if (this.currentViewportSize?.equals(newViewport)) {
        return;
      }

      this.currentViewportSize = newViewport;

      // 3. 再計算と更新
      const blockSize = this.layoutCalculationService.calculateBlockSize(newViewport);
      const canvasSize = this.layoutCalculationService.calculateCanvasSize(blockSize);

      this.canvasRenderer.updateBlockSize(blockSize.size);
      this.canvas.width = canvasSize.width;
      this.canvas.height = canvasSize.height;

      // 4. タッチコントロールの表示切り替え
      const shouldShowTouch = this.layoutCalculationService.shouldShowTouchControls(newViewport);
      if (this.touchControlRenderer) {
        shouldShowTouch ? this.touchControlRenderer.show() : this.touchControlRenderer.hide();
      }

      // 5. 再描画
      if (this.currentGameId) {
        const gameDto = this.gameApplicationService.getGameState(this.currentGameId);
        this.render(gameDto);
      }
    } catch (error) {
      console.error('Failed to handle resize:', error);
      // エラーでもゲームは継続
    }
  }

  /**
   * ゲームループ
   */
  private gameLoop(): void {
    if (!this.currentGameId) return;

    try {
      // ゲーム状態を更新
      const gameDto = this.gameApplicationService.updateFrame(
        this.currentGameId
      );

      // 描画
      this.render(gameDto);
    } catch (error) {
      console.error('Game loop error:', error);
      this.stop();
      this.showError('ゲームループでエラーが発生しました。ゲームを停止します。');
    }
  }

  /**
   * 描画
   */
  private render(gameDto: GameDto): void {
    try {
      this.canvasRenderer.render(gameDto);
      this.uiRenderer.render(gameDto);
    } catch (error) {
      console.error('Render error:', error);
      throw error; // gameLoop()でキャッチされる
    }
  }

  /**
   * エラーメッセージを表示
   */
  private showError(message: string): void {
    // シンプルなエラー表示（将来的にはUIを改善する）
    alert(message);
  }
}
```

#### 5.3.5 変更箇所の詳細

**追加1: 新しいフィールド**

```typescript
// 追加
private touchControlRenderer: TouchControlRenderer | null = null;
private currentViewportSize: ViewportSize | null = null;
private resizeTimeoutId: number | null = null;
private resizeHandler?: () => void;
private canvas: HTMLCanvasElement; // コンストラクタ引数として追加
```

**追加2: LayoutCalculationServiceの依存注入**

```typescript
// 変更前
constructor(
  private gameApplicationService: GameApplicationService,
  private inputHandlerService: InputHandlerService,
  private canvasRenderer: CanvasRenderer,
  private uiRenderer: UIRenderer
) {
  // ...
}

// 変更後
constructor(
  private gameApplicationService: GameApplicationService,
  private inputHandlerService: InputHandlerService,
  private layoutCalculationService: LayoutCalculationService,
  private canvasRenderer: CanvasRenderer,
  private uiRenderer: UIRenderer,
  private canvas: HTMLCanvasElement
) {
  // ...
}
```

**変更3: start() メソッドの拡張**

```typescript
// 変更前
start(): void {
  const gameDto = this.gameApplicationService.startNewGame();
  this.currentGameId = gameDto.gameId;
  this.setupEventListeners();
  this.render(gameDto);
  this.frameTimer.start(() => {
    this.gameLoop();
  }, 30);
}

// 変更後
start(): void {
  try {
    // レスポンシブレイアウトを初期化（追加）
    this.setupResponsiveLayout();

    const gameDto = this.gameApplicationService.startNewGame();
    this.currentGameId = gameDto.gameId;

    // タッチコントロールを初期化（追加）
    this.initializeTouchControls();

    this.setupEventListeners();
    this.render(gameDto);
    this.frameTimer.start(() => {
      this.gameLoop();
    }, 30);
  } catch (error) {
    console.error('Failed to start game:', error);
    this.showError('ゲームの開始に失敗しました。');
  }
}
```

**追加4: 新しいメソッド群**

- `setupResponsiveLayout()`: レスポンシブレイアウトの初期化
- `useDefaultLayout()`: フォールバック処理
- `initializeTouchControls()`: タッチコントロールの初期化
- `handleResizeWithDebounce()`: デバウンス付きリサイズ処理
- `handleResize()`: リサイズ処理本体

**変更5: setupEventListeners() にリサイズイベントを追加**

```typescript
// 追加
this.resizeHandler = () => {
  this.handleResizeWithDebounce();
};
window.addEventListener('resize', this.resizeHandler);
```

**変更6: removeEventListeners() にリサイズイベント削除を追加**

```typescript
// 追加
if (this.resizeHandler) {
  window.removeEventListener('resize', this.resizeHandler);
  this.resizeHandler = undefined;
}

if (this.resizeTimeoutId !== null) {
  clearTimeout(this.resizeTimeoutId);
  this.resizeTimeoutId = null;
}
```

**変更7: stop() メソッドにタッチコントロール破棄を追加**

```typescript
// 追加
if (this.touchControlRenderer) {
  this.touchControlRenderer.destroy();
  this.touchControlRenderer = null;
}
```

#### 5.3.6 処理フロー

```
[ゲーム開始]
  start()
  ↓
[レスポンシブレイアウト初期化]
  setupResponsiveLayout()
  - ViewportSize取得
  - BlockSize計算
  - CanvasSize計算
  - CanvasRenderer更新
  ↓
[タッチコントロール初期化]
  initializeTouchControls()
  - TouchControlRenderer生成
  - DOM要素生成
  - 表示/非表示判定
  ↓
[イベントリスナー登録]
  setupEventListeners()
  - キーボード
  - リサイズ（デバウンス付き）
  - ボタン
  ↓
[ゲームループ開始]
  ↓
[リサイズイベント発生]
  handleResizeWithDebounce()
  ↓ (250ms後)
  handleResize()
  - 新ViewportSize取得
  - サイズ変化チェック
  - レイアウト再計算
  - Canvas更新
  - タッチコントロール表示切替
  - 再描画
```

#### 5.3.7 エラーハンドリング戦略

| エラー発生箇所 | 処理 | 影響 |
|--------------|------|------|
| start() | catch & showError | ゲーム開始失敗 |
| setupResponsiveLayout() | catch & useDefaultLayout | デフォルトサイズで継続 |
| initializeTouchControls() | catch & log | タッチコントロールなしで継続 |
| handleResize() | catch & log | リサイズ処理スキップ、現在のサイズを維持 |
| gameLoop() | catch & stop | ゲーム停止 |

#### 5.3.8 テストケースの追加

**ファイル**: `tests/presentation/controllers/GameController.test.ts`（新規作成）

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameController } from '@presentation/controllers/GameController';
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { LayoutCalculationService } from '@application/services/LayoutCalculationService';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { UIRenderer } from '@presentation/renderers/UIRenderer';

describe('GameController', () => {
  let controller: GameController;
  let mockGameService: GameApplicationService;
  let mockInputHandler: InputHandlerService;
  let mockLayoutService: LayoutCalculationService;
  let mockCanvasRenderer: CanvasRenderer;
  let mockUIRenderer: UIRenderer;
  let canvas: HTMLCanvasElement;
  let touchControlsContainer: HTMLElement;

  beforeEach(() => {
    // DOM要素を作成
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    touchControlsContainer = document.createElement('div');
    touchControlsContainer.id = 'touch-controls-container';
    document.body.appendChild(touchControlsContainer);

    // モックサービスを作成
    mockGameService = {
      startNewGame: vi.fn(() => ({
        gameId: 'test-game',
        state: 'playing',
        field: Array(20).fill(null).map(() => Array(8).fill(null)),
        fallingBlock: null,
        score: 0,
        level: 1,
        linesCleared: 0
      })),
      updateFrame: vi.fn(() => ({})),
      getGameState: vi.fn(() => ({ state: 'playing' })),
      pauseGame: vi.fn(),
      resumeGame: vi.fn(),
      restartGame: vi.fn(),
    } as any;

    mockInputHandler = {} as any;

    mockLayoutService = {
      calculateBlockSize: vi.fn(() => ({ size: 30 })),
      calculateCanvasSize: vi.fn(() => ({ width: 240, height: 600 })),
      shouldShowTouchControls: vi.fn(() => false),
    } as any;

    mockCanvasRenderer = {
      updateBlockSize: vi.fn(),
      render: vi.fn(),
    } as any;

    mockUIRenderer = {
      render: vi.fn(),
    } as any;

    controller = new GameController(
      mockGameService,
      mockInputHandler,
      mockLayoutService,
      mockCanvasRenderer,
      mockUIRenderer,
      canvas
    );
  });

  afterEach(() => {
    controller.stop();
    document.body.removeChild(canvas);
    document.body.removeChild(touchControlsContainer);
  });

  describe('start()', () => {
    it('ゲームを正常に開始できる', () => {
      controller.start();

      expect(mockGameService.startNewGame).toHaveBeenCalled();
      expect(mockLayoutService.calculateBlockSize).toHaveBeenCalled();
      expect(mockCanvasRenderer.updateBlockSize).toHaveBeenCalled();
    });

    it('レスポンシブレイアウトを初期化', () => {
      controller.start();

      expect(mockLayoutService.calculateBlockSize).toHaveBeenCalled();
      expect(mockLayoutService.calculateCanvasSize).toHaveBeenCalled();
      expect(mockCanvasRenderer.updateBlockSize).toHaveBeenCalledWith(30);
    });

    it('タッチコントロールを初期化', () => {
      controller.start();

      const touchControls = touchControlsContainer.querySelector('.touch-controls');
      expect(touchControls).toBeTruthy();
    });

    it('エラー時にデフォルトレイアウトを使用', () => {
      mockLayoutService.calculateBlockSize = vi.fn(() => {
        throw new Error('Test error');
      });

      controller.start();

      // デフォルトレイアウトが適用される
      expect(mockCanvasRenderer.updateBlockSize).toHaveBeenCalledWith(30);
    });
  });

  describe('handleResize()', () => {
    beforeEach(() => {
      controller.start();
    });

    it('リサイズイベントでレイアウトを再計算', () => {
      // リサイズイベントをトリガー
      window.dispatchEvent(new Event('resize'));

      // デバウンス待ち
      vi.advanceTimersByTime(250);

      expect(mockLayoutService.calculateBlockSize).toHaveBeenCalled();
    });

    it('サイズが変わらない場合は処理をスキップ', () => {
      const initialCallCount = mockLayoutService.calculateBlockSize.mock.calls.length;

      // 同じサイズでリサイズイベント
      window.dispatchEvent(new Event('resize'));
      vi.advanceTimersByTime(250);

      // サイズが同じなので再計算されない
      expect(mockLayoutService.calculateBlockSize.mock.calls.length).toBe(initialCallCount);
    });

    it('デバウンス処理が正常に動作', () => {
      // 連続してリサイズイベントを発火
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));

      // 250ms未満では処理されない
      vi.advanceTimersByTime(200);
      const callCountBefore = mockLayoutService.calculateBlockSize.mock.calls.length;

      // 250ms経過で1回だけ処理
      vi.advanceTimersByTime(50);
      expect(mockLayoutService.calculateBlockSize.mock.calls.length).toBeGreaterThan(callCountBefore);
    });

    it('エラーが発生してもゲームは継続', () => {
      mockLayoutService.calculateBlockSize = vi.fn(() => {
        throw new Error('Resize error');
      });

      expect(() => {
        window.dispatchEvent(new Event('resize'));
        vi.advanceTimersByTime(250);
      }).not.toThrow();
    });
  });

  describe('stop()', () => {
    beforeEach(() => {
      controller.start();
    });

    it('ゲームを正常に停止できる', () => {
      expect(() => {
        controller.stop();
      }).not.toThrow();
    });

    it('タッチコントロールを破棄', () => {
      controller.stop();

      const touchControls = touchControlsContainer.querySelector('.touch-controls');
      expect(touchControls).toBeFalsy();
    });

    it('リサイズイベントリスナーを削除', () => {
      controller.stop();

      // リサイズイベントを発火しても処理されない
      const callCountBefore = mockLayoutService.calculateBlockSize.mock.calls.length;
      window.dispatchEvent(new Event('resize'));
      vi.advanceTimersByTime(250);

      expect(mockLayoutService.calculateBlockSize.mock.calls.length).toBe(callCountBefore);
    });
  });

  describe('統合テスト', () => {
    it('モバイルサイズでタッチコントロールが表示される', () => {
      mockLayoutService.shouldShowTouchControls = vi.fn(() => true);

      controller.start();

      const container = touchControlsContainer.querySelector('.touch-controls') as HTMLElement;
      expect(container).toBeTruthy();
      expect(container.style.display).not.toBe('none');
    });

    it('デスクトップサイズでタッチコントロールが非表示', () => {
      mockLayoutService.shouldShowTouchControls = vi.fn(() => false);

      controller.start();

      const container = touchControlsContainer.querySelector('.touch-controls') as HTMLElement;
      expect(container).toBeTruthy();
      expect(container.style.display).toBe('none');
    });

    it('リサイズでタッチコントロールの表示が切り替わる', () => {
      mockLayoutService.shouldShowTouchControls = vi.fn(() => false);
      controller.start();

      // 非表示確認
      let container = touchControlsContainer.querySelector('.touch-controls') as HTMLElement;
      expect(container.style.display).toBe('none');

      // モバイルサイズに変更
      mockLayoutService.shouldShowTouchControls = vi.fn(() => true);
      window.dispatchEvent(new Event('resize'));
      vi.advanceTimersByTime(250);

      // 表示確認
      container = touchControlsContainer.querySelector('.touch-controls') as HTMLElement;
      expect(container.style.display).toBe('flex');
    });
  });
});
```

---

## 6. TypeScript型定義とインターフェース

### 6.1 EventListenerRecord

#### 6.1.1 ファイル情報

**パス**: `src/presentation/types/EventListenerRecord.ts`

#### 6.1.2 責務

イベントリスナーの登録情報を記録する型定義。メモリリーク対策として、登録したイベントリスナーを確実に解除するために使用します。

#### 6.1.3 TypeScript定義

```typescript
/**
 * EventListenerRecord - イベントリスナーの登録記録
 *
 * @remarks
 * メモリリーク対策としてイベントリスナーの登録情報を保持
 * destroy時に確実にリスナーを解除するために使用
 */
export interface EventListenerRecord {
  /** イベントリスナーが登録されている要素 */
  element: HTMLElement;

  /** イベント名（'click', 'touchstart'等） */
  event: string;

  /** イベントハンドラ関数 */
  handler: EventListener;
}
```

#### 6.1.4 使用例

```typescript
import { EventListenerRecord } from '@presentation/types/EventListenerRecord';

class SomeRenderer {
  private eventListeners: EventListenerRecord[] = [];

  private addEventListener(
    element: HTMLElement,
    event: string,
    handler: EventListener
  ): void {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  destroy(): void {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
}
```

---

### 6.2 その他の型定義

#### 6.2.1 TouchAction型

タッチボタンのアクション種別を表す型（TouchControlRenderer内で使用）

```typescript
/**
 * TouchAction - タッチボタンのアクション種別
 */
export type TouchAction =
  | 'left'
  | 'right'
  | 'down'
  | 'rotate-cw'
  | 'rotate-ccw'
  | 'instant-drop';
```

#### 6.2.2 DeviceType型

デバイスタイプを表す型

```typescript
/**
 * DeviceType - デバイスタイプ
 */
export type DeviceType = 'mobile' | 'desktop';
```

---

## 7. エラーハンドリング戦略

### 7.1 エラー分類

| エラー種別 | 例 | 処理方針 |
|-----------|----|---------| 初期化エラー | コンストラクタでの失敗 | throw でエラーを伝播、呼び出し側で対処 |
| 実行時エラー | 処理中の予期しないエラー | catch & log、処理をスキップして継続 |
| バリデーションエラー | 不正な値の検出 | 警告ログ、デフォルト値で継続 |
| ネットワークエラー | API通信失敗（該当なし） | N/A |
| 致命的エラー | ゲームループの停止 | catch & stop、ユーザーに通知 |

### 7.2 層ごとのエラーハンドリング方針

#### 7.2.1 Application層

**方針**: エラーをキャッチし、適切にログ出力。ビジネスロジックの一貫性を保つ。

**実装例**:
```typescript
// LayoutCalculationService
calculateBlockSize(viewport: ViewportSize): BlockSize {
  try {
    // 計算処理
    const blockSize = /* ... */;
    return new BlockSize(blockSize, viewport.isMobile());
  } catch (error) {
    console.error('Failed to calculate block size:', error);
    // フォールバック: デフォルトサイズを返す
    return new BlockSize(30, false);
  }
}
```

**ガイドライン**:
- 値オブジェクトのバリデーションエラーはそのままthrow
- サービスレベルでは適切なフォールバック値を返す
- エラーログには十分なコンテキスト情報を含める

#### 7.2.2 Presentation層

**方針**: エラーをキャッチし、ユーザー体験を損なわないよう処理。UIの状態を一貫性のある状態に保つ。

**実装例**:
```typescript
// GameController
private setupResponsiveLayout(): void {
  try {
    // レイアウト処理
  } catch (error) {
    console.error('Failed to setup responsive layout:', error);
    this.useDefaultLayout(); // フォールバック
  }
}
```

**ガイドライン**:
- 致命的エラー以外はユーザーにアラートを表示しない
- エラーでもゲームを継続できるようフォールバック処理を実装
- 重要な操作（ゲーム開始等）の失敗のみユーザーに通知

#### 7.2.3 値オブジェクト

**方針**: バリデーションエラーは即座にthrow。呼び出し側で対処。

**実装例**:
```typescript
// ViewportSize
constructor(width: number, height: number) {
  if (width < 0 || height < 0) {
    throw new Error(
      `ViewportSize must have non-negative dimensions. Got: ${width}x${height}`
    );
  }
  // ...
}
```

**ガイドライン**:
- 不正な値では絶対にインスタンスを生成しない
- エラーメッセージには具体的な値を含める
- ドキュメントコメントで前提条件を明記

### 7.3 エラーメッセージのフォーマット

```typescript
// 良い例: 具体的で actionable
throw new Error(
  `ViewportSize must have non-negative dimensions. Got: ${width}x${height}`
);

// 悪い例: 情報不足
throw new Error('Invalid viewport size');
```

**フォーマット規則**:
- 何が問題か明確に記述
- 実際の値を含める
- 期待される値を含める（可能な場合）

### 7.4 エラー伝播ルール

```
[Presentation層]
  - UIエラー → catch & log & フォールバック
  - リサイズエラー → catch & log & スキップ
  ↓ throw（致命的エラーのみ）
  
[Application層]
  - ビジネスロジックエラー → catch & log & デフォルト値
  - バリデーションエラー → throw（値オブジェクトから）
  ↓ throw（バリデーションエラー）
  
[値オブジェクト]
  - バリデーションエラー → throw
```

### 7.5 リカバリー戦略

| シナリオ | リカバリー方法 | ユーザー影響 |
|---------|-------------|------------|
| レイアウト計算失敗 | デフォルトサイズ（30px）を使用 | デスクトップサイズで表示 |
| タッチコントロール生成失敗 | タッチコントロールなしで継続 | キーボード操作のみ可能 |
| リサイズ処理失敗 | 現在のサイズを維持 | リサイズ無効 |
| 入力処理エラー | 入力を無視して継続 | 1回の入力が無視される |
| ゲームループエラー | ゲームを停止、エラー表示 | ゲーム停止、再起動が必要 |

---

## 8. パフォーマンス最適化設計

### 8.1 デバウンス処理

#### 8.1.1 リサイズイベントのデバウンス

**目的**: 連続したリサイズイベントによる過剰な再計算を防ぐ

**実装**:
```typescript
private handleResizeWithDebounce(): void {
  // 既存のタイマーをクリア
  if (this.resizeTimeoutId !== null) {
    clearTimeout(this.resizeTimeoutId);
  }

  // 新しいタイマーを設定
  this.resizeTimeoutId = window.setTimeout(() => {
    this.handleResize();
    this.resizeTimeoutId = null;
  }, 250); // 250msデバウンス
}
```

**パラメータ調整**:
- **250ms**: ユーザーがリサイズを終えたと判断する妥当な時間
- 短すぎる（< 100ms）: デバウンス効果が薄い
- 長すぎる（> 500ms）: レスポンスが遅く感じる

**効果**:
- リサイズ中の再計算回数を大幅削減（連続10回 → 1回）
- CPU使用率の低減
- スムーズなリサイズ体験

### 8.2 メモリリーク対策

#### 8.2.1 イベントリスナーの自動管理

**問題**: イベントリスナーを適切に解除しないとメモリリーク

**解決策**: EventListenerRecordによる一元管理

```typescript
class TouchControlRenderer {
  private eventListeners: EventListenerRecord[] = [];

  private addEventListener(
    element: HTMLElement,
    event: string,
    handler: EventListener
  ): void {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  destroy(): void {
    // 全リスナーを自動解放
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
}
```

**効果**:
- リスナーの登録漏れ・解除漏れを防ぐ
- メモリリークのリスクを最小化
- コードの保守性向上

#### 8.2.2 タイマーのクリーンアップ

**問題**: setTimeoutのクリアを忘れるとメモリリーク

**解決策**: コンポーネント破棄時に確実にクリア

```typescript
class GameController {
  private resizeTimeoutId: number | null = null;

  private removeEventListeners(): void {
    // タイマーをクリア
    if (this.resizeTimeoutId !== null) {
      clearTimeout(this.resizeTimeoutId);
      this.resizeTimeoutId = null;
    }
  }
}
```

### 8.3 レンダリング最適化

#### 8.3.1 不要な再描画の防止

**実装**: サイズ変更チェック

```typescript
private handleResize(): void {
  const newViewport = ViewportSize.fromWindow();

  // サイズが変わらなければスキップ
  if (this.currentViewportSize?.equals(newViewport)) {
    return;
  }

  // 再描画処理
  // ...
}
```

**効果**:
- 不要な再計算・再描画を回避
- バッテリー消費の低減（モバイル）

#### 8.3.2 Canvas描画の最適化

**既存の最適化を維持**:
- `requestAnimationFrame`によるフレーム同期
- 必要最小限の領域のみ描画（clearRect → fillRect）

### 8.4 パフォーマンスメトリクス

#### 8.4.1 測定項目

| 項目 | 目標値 | 測定方法 |
|------|-------|---------|
| タッチ操作応答時間 | < 50ms | `performance.now()` |
| リサイズ処理時間 | < 100ms | `console.time()` |
| ゲームループFPS | 30fps維持 | フレームカウンター |
| メモリ使用量増加 | < 10MB/時間 | Chrome DevTools Memory Profiler |

#### 8.4.2 ボトルネック分析

**想定されるボトルネック**:
1. **リサイズ時のCanvas再描画**: デバウンスで対処済み
2. **タッチイベント処理**: クールダウンで対処済み
3. **DOM要素の大量生成**: 1回のみ生成で対処済み

**モニタリング方法**:
```typescript
// パフォーマンス計測（開発時のみ）
const startTime = performance.now();
this.handleResize();
const endTime = performance.now();
console.log(`Resize took ${endTime - startTime}ms`);
```

### 8.5 モバイル端末での最適化

#### 8.5.1 タッチイベントの最適化

**passive eventリスナーの使用**:
```typescript
// 将来的な最適化案
element.addEventListener('touchstart', handler, { passive: true });
```

**効果**:
- スクロールパフォーマンスの向上
- ブラウザが最適化を適用可能

**注意**: `preventDefault()`と併用不可

#### 8.5.2 Canvas解像度の調整

**現状**: ブロックサイズを動的に調整（15px〜30px）

**効果**:
- モバイルでは小さいCanvasで描画負荷を軽減
- デスクトップでは高解像度で視認性向上

---

## 9. CSS設計

### 9.1 タッチコントロール用スタイル

#### 9.1.1 ファイル情報

**パス**: `public/styles.css`（既存ファイルに追加）

#### 9.1.2 CSS定義

```css
/* ========================================
   タッチコントロール
   ======================================== */

.touch-controls {
  display: none; /* デフォルトは非表示 */
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: #34495e;
  border-radius: 8px;
  margin-top: 16px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* モバイル表示時 */
@media (max-width: 767px) {
  .touch-controls {
    max-width: 100%;
  }
}

/* 回転ボタンコンテナ */
.rotation-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 方向ボタンコンテナ */
.direction-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 即落下ボタンコンテナ */
.drop-button {
  display: flex;
  justify-content: center;
}

/* タッチボタン共通スタイル */
.touch-btn {
  min-width: 60px;
  min-height: 60px;
  padding: 12px;
  font-size: 24px;
  font-weight: bold;
  background-color: #2c3e50;
  color: #ecf0f1;
  border: 2px solid #3498db;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.1s ease;
  -webkit-tap-highlight-color: transparent; /* iOSのタップハイライト無効化 */
}

/* ホバー時 */
.touch-btn:hover {
  background-color: #34495e;
  border-color: #5dade2;
}

/* アクティブ時（タッチ中） */
.touch-btn.active {
  background-color: #3498db;
  border-color: #2980b9;
  transform: scale(0.95);
}

/* フォーカス時 */
.touch-btn:focus {
  outline: 2px solid #5dade2;
  outline-offset: 2px;
}

/* 無効時 */
.touch-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 即落下ボタン（大きめ） */
.drop-button .touch-btn {
  min-width: 120px;
  font-size: 18px;
}

/* モバイル向け最適化 */
@media (max-width: 767px) {
  .touch-btn {
    min-width: 70px;
    min-height: 70px;
    font-size: 28px;
  }

  .drop-button .touch-btn {
    min-width: 140px;
    font-size: 20px;
  }
}

/* 小さい画面向け（iPhone SE等） */
@media (max-width: 374px) {
  .touch-btn {
    min-width: 60px;
    min-height: 60px;
    font-size: 24px;
  }

  .drop-button .touch-btn {
    min-width: 120px;
    font-size: 18px;
  }

  .touch-controls {
    gap: 12px;
    padding: 12px;
  }

  .rotation-buttons,
  .direction-buttons {
    gap: 8px;
  }
}

/* アクセシビリティ: プリファー・レデューサード・モーション */
@media (prefers-reduced-motion: reduce) {
  .touch-btn {
    transition: none;
  }

  .touch-btn.active {
    transform: none;
  }
}

/* ダークモード対応（将来的な拡張） */
@media (prefers-color-scheme: dark) {
  .touch-controls {
    background-color: #1a1a1a;
  }

  .touch-btn {
    background-color: #2c2c2c;
    color: #ffffff;
    border-color: #4a9eff;
  }

  .touch-btn:hover {
    background-color: #3c3c3c;
    border-color: #6db3ff;
  }

  .touch-btn.active {
    background-color: #4a9eff;
    border-color: #3a8eef;
  }
}
```

### 9.2 レスポンシブ対応のCanvas配置

```css
/* ========================================
   Canvas レスポンシブ対応
   ======================================== */

#game-canvas {
  display: block;
  margin: 0 auto;
  border: 2px solid #34495e;
  border-radius: 4px;
  background-color: #2c3e50;
  /* サイズはJavaScriptで動的に設定 */
}

/* Canvas コンテナ */
.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  min-height: 400px;
}

/* モバイル表示時 */
@media (max-width: 767px) {
  .canvas-container {
    padding: 8px;
    min-height: 300px;
  }

  #game-canvas {
    max-width: 90vw;
    height: auto;
  }
}
```

### 9.3 CSSクラス命名規則

**BEM（Block Element Modifier）スタイル**:
- Block: `.touch-controls`
- Element: `.touch-controls__button`（今回は簡略化して`.touch-btn`）
- Modifier: `.touch-btn--active`（今回はクラス`.active`で対応）

**理由**:
- シンプルで理解しやすい
- 既存のスタイルと統一感を保つ

### 9.4 CSS変数による拡張性（将来的な改善案）

```css
:root {
  --touch-btn-bg: #2c3e50;
  --touch-btn-border: #3498db;
  --touch-btn-active-bg: #3498db;
  --touch-btn-text: #ecf0f1;
  --touch-btn-size: 60px;
}

.touch-btn {
  min-width: var(--touch-btn-size);
  min-height: var(--touch-btn-size);
  background-color: var(--touch-btn-bg);
  color: var(--touch-btn-text);
  border-color: var(--touch-btn-border);
}
```

---

**Part 2 完成！**

以下のセクションを完成させたのだ：

### ✅ 完成内容（Part 2）

5. **Presentation層コンポーネント（続き）**
   - CanvasRenderer（変更）- 完全な変更差分、テストケース
   - GameController（変更）- 完全な変更差分、処理フロー、テストケース

6. **TypeScript型定義とインターフェース**
   - EventListenerRecord
   - TouchAction型
   - DeviceType型

7. **エラーハンドリング戦略**
   - エラー分類
   - 層ごとの方針
   - エラーメッセージフォーマット
   - リカバリー戦略

8. **パフォーマンス最適化設計**
   - デバウンス処理
   - メモリリーク対策
   - レンダリング最適化
   - パフォーマンスメトリクス
   - モバイル最適化

9. **CSS設計**
   - タッチコントロール用スタイル（完全定義）
   - レスポンシブ対応
   - アクセシビリティ対応
   - ダークモード対応

---

次のステップ:
- **Part 3**: テスト設計詳細、実装マイルストーン、移行計画
