# Todoアプリ

React + TypeScript + Vite で作成されたTodoアプリです。ブラウザのLocalStorageを使用してデータを保存します。

## 機能

- ✅ Todoの追加・削除・更新
- ✅ 完了/未完了の切り替え
- ✅ フィルタリング（全て/未完了/完了済み）
- ✅ 完了済みTodoの一括削除
- ✅ ブラウザストレージへの自動保存
- ✅ レスポンシブデザイン

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

開発サーバーは `http://localhost:5173` で起動します。

## デバッグ方法

### 1. ブラウザの開発者ツールを使用

1. 開発サーバーを起動: `npm run dev`
2. ブラウザで `http://localhost:5173` を開く
3. ブラウザの開発者ツール（F12）を開く
4. **Console**タブでログを確認
5. **Sources**タブでソースコードにブレークポイントを設定可能
6. **React Developer Tools** 拡張機能をインストールすると、Reactコンポーネントの状態を確認できます

### 2. VS Code/Cursorでのデバッグ

1. **F5**キーを押すか、デバッグパネルから「Launch Chrome」を選択
2. 自動的に開発サーバーが起動し、Chromeが開きます
3. ソースコードにブレークポイントを設定してデバッグ可能

### 3. React Developer Tools

ブラウザ拡張機能として以下をインストールすることを推奨します：

- **Chrome**: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- **Firefox**: [React Developer Tools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

これにより、Reactコンポーネントの状態、props、hooksなどを確認できます。

## ビルド

```bash
# 本番用ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

## アーキテクチャ

### ストレージ層の抽象化

将来のRDB移行を考慮して、ストレージ層を抽象化しています：

- `src/storage/IStorage.ts` - ストレージインターフェース
- `src/storage/LocalStorageAdapter.ts` - ブラウザストレージ実装

将来的にRDBに移行する場合は、`DatabaseAdapter` を実装して `TodoProvider` に注入するだけです。

### コンポーネント構成

- `src/components/TodoApp.tsx` - メインコンテナ
- `src/components/TodoForm.tsx` - 追加フォーム
- `src/components/TodoList.tsx` - 一覧表示
- `src/components/TodoItem.tsx` - 個別項目
- `src/components/TodoFilter.tsx` - フィルター

### 状態管理

- `src/contexts/TodoContext.tsx` - Context APIを使用した状態管理

## ライセンス

MIT

