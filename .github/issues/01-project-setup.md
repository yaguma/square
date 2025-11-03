# Issue #1: プロジェクトセットアップと基本構造の作成

## 概要
ゲームの基本的なファイル構成とCanvas設定を行う。

## タスク
- [ ] HTML構造の作成（index.html）
- [ ] CSS基本スタイルの作成（style.css）
- [ ] JavaScriptファイルの基本構造作成
  - [ ] game.js（ゲームのメインロジック）
  - [ ] renderer.js（Canvas描画）
  - [ ] input.js（キー入力処理）
  - [ ] constants.js（定数定義）
- [ ] Canvas要素の初期化
- [ ] ゲームループの基本実装（30fps）

## 受け入れ条件
- index.htmlを開くとCanvasが表示される
- ゲームループが30fpsで動作する
- ブロックサイズなどの定数がconstants.jsで管理されている

## 技術詳細
- フレームレート: 30fps（約33.33ms間隔）
- Canvas: ゲームフィールド用とネクストブロック表示用の2つ
- ブロックサイズ: 30px（定数で管理）

## 依存関係
なし（最初のタスク）
