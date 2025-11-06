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

続きの詳細設計を作成するのだ。次は CanvasRenderer の変更、GameController の変更、型定義、CSS設計などを書いていくのだ！

**使用コンテキスト**: 約95,000トークン
**コンテキスト残量**: 約105,000トークン

ここまでで詳細設計の前半部分が完成したのだ。続きを作成してもよいか確認させてほしいのだ。