# Todo API Server

REST APIサーバー for Todoアプリ

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Prismaクライアントの生成とマイグレーション

```bash
# 環境変数を設定（PowerShellの場合）
$env:DATABASE_URL="file:./prisma/dev.db"

# Prismaクライアントの生成
npx prisma generate

# マイグレーションの実行
npx prisma migrate dev --name init
```

### 3. サーバーの起動

```bash
npm run dev
```

サーバーは `http://localhost:3001` で起動します。

## APIエンドポイント

### ヘルスチェック
```
GET /health
```

### Todo API

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/todos` | 全Todo取得 |
| GET | `/api/todos/:id` | 単一Todo取得 |
| POST | `/api/todos` | Todo作成 |
| PUT | `/api/todos/:id` | Todo更新 |
| DELETE | `/api/todos/:id` | Todo削除 |
| DELETE | `/api/todos` | 全Todo削除 |

## テスト方法

### 自動テストスクリプト（推奨）

#### PowerShell（Windows）
```powershell
cd server
npm run test
# または直接実行
.\test-api.ps1
```

#### Bash（Linux/Mac/Git Bash）
```bash
cd server
npm run test:bash
# または直接実行
bash test-api.sh
```

テストスクリプトは以下を自動実行します：
1. ヘルスチェック
2. Todo作成
3. 全Todo取得
4. 単一Todo取得
5. Todo更新
6. Todo削除
7. 削除確認

### 手動テスト

### PowerShell (Invoke-RestMethod) でのテスト

#### 1. ヘルスチェック
```powershell
Invoke-RestMethod -Uri http://localhost:3001/health
```

#### 2. Todo作成
```powershell
Invoke-RestMethod -Uri http://localhost:3001/api/todos `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"text":"テストTodo"}'
```

#### 3. 全Todo取得
```powershell
Invoke-RestMethod -Uri http://localhost:3001/api/todos
```

#### 4. 単一Todo取得
```powershell
$id = "todo-id-here"
Invoke-RestMethod -Uri "http://localhost:3001/api/todos/$id"
```

#### 5. Todo更新
```powershell
$id = "todo-id-here"
Invoke-RestMethod -Uri "http://localhost:3001/api/todos/$id" `
  -Method PUT `
  -ContentType "application/json" `
  -Body '{"completed":true}'
```

#### 6. Todo削除
```powershell
$id = "todo-id-here"
Invoke-RestMethod -Uri "http://localhost:3001/api/todos/$id" -Method DELETE
```

#### 7. 全Todo削除
```powershell
Invoke-RestMethod -Uri http://localhost:3001/api/todos -Method DELETE
```

### curlコマンドでのテスト（Linux/Mac/Git Bash）

#### 1. ヘルスチェック
```bash
curl http://localhost:3001/health
```

#### 2. Todo作成
```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"テストTodo"}'
```

#### 3. 全Todo取得
```bash
curl http://localhost:3001/api/todos
```

#### 4. 単一Todo取得
```bash
curl http://localhost:3001/api/todos/{id}
```

#### 5. Todo更新
```bash
curl -X PUT http://localhost:3001/api/todos/{id} \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

#### 6. Todo削除
```bash
curl -X DELETE http://localhost:3001/api/todos/{id}
```

#### 7. 全Todo削除
```bash
curl -X DELETE http://localhost:3001/api/todos
```

## データベースのリセット

テストを再実行する前に、データベースをリセットしたい場合：

```bash
cd server
npm run prisma:reset
```

これにより、データベースが初期化され、マイグレーションが再実行されます。

## データベース

SQLiteを使用しています。データベースファイルは `prisma/dev.db` に作成されます。

### Prisma Studio（データベースGUI）

```bash
npm run prisma:studio
```

ブラウザで `http://localhost:5555` が開きます。

## 環境変数

- `DATABASE_URL`: データベース接続URL（デフォルト: `file:./prisma/dev.db`）
- `PORT`: サーバーポート（デフォルト: `3001`）
- `CORS_ORIGIN`: CORS許可オリジン（デフォルト: `http://localhost:5173`）
- `NODE_ENV`: 環境（デフォルト: `development`）

## 開発

### ファイル構成

```
server/
├── src/
│   ├── app.ts              # Expressアプリ設定
│   ├── server.ts           # サーバー起動
│   ├── controllers/        # コントローラー
│   ├── routes/             # ルート定義
│   ├── middleware/         # ミドルウェア
│   ├── types/              # 型定義
│   └── utils/              # ユーティリティ
├── prisma/
│   ├── schema.prisma       # データベーススキーマ
│   └── migrations/         # マイグレーション
└── package.json
```

