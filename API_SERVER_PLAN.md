# REST APIサーバー実装方針

## 1. アーキテクチャ概要

```
┌─────────────┐         HTTP/REST API         ┌─────────────┐
│   React     │ ◄───────────────────────────► │   Node.js   │
│   Client    │                               │   Server    │
│             │                               │             │
│ RestApiAdapter │                           │  Express    │
│ (IStorage)  │                               │  + Prisma   │
└─────────────┘                               └──────┬──────┘
                                                      │
                                                      ▼
                                               ┌─────────────┐
                                               │  Database   │
                                               │  (SQLite/   │
                                               │  PostgreSQL)│
                                               └─────────────┘
```

## 2. 技術スタック

### サーバー側
- **ランタイム**: Node.js 18+
- **フレームワーク**: Express.js (TypeScript)
- **ORM**: Prisma（型安全で開発効率が高い）
- **データベース**: 
  - 開発環境: SQLite（簡単にセットアップ可能）
  - 本番環境: PostgreSQL（将来的に移行可能）
- **バリデーション**: Zod（型安全なバリデーション）
- **CORS**: express-cors（フロントエンドとの通信）

### クライアント側
- **HTTP クライアント**: fetch API（標準API、追加依存関係不要）
- **アダプター**: `RestApiAdapter`（既存の`IStorage`インターフェースを実装）

## 3. プロジェクト構成

```
2025Nov/
├── client/              # フロントエンド（既存のReactアプリ）
│   ├── src/
│   │   ├── storage/
│   │   │   ├── IStorage.ts
│   │   │   ├── MemoryStorageAdapter.ts
│   │   │   └── RestApiAdapter.ts  # 新規作成
│   │   └── ...
│   └── ...
├── server/              # バックエンド（新規作成）
│   ├── src/
│   │   ├── routes/
│   │   │   └── todos.ts        # Todo APIルート
│   │   ├── controllers/
│   │   │   └── todosController.ts
│   │   ├── services/
│   │   │   └── todosService.ts
│   │   ├── models/
│   │   │   └── todo.ts         # Prismaモデル
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   └── cors.ts
│   │   ├── app.ts              # Expressアプリ設定
│   │   └── server.ts           # サーバー起動
│   ├── prisma/
│   │   ├── schema.prisma        # データベーススキーマ
│   │   └── migrations/         # マイグレーション
│   ├── package.json
│   └── tsconfig.json
├── package.json                 # ルートpackage.json（オプション）
└── README.md
```

## 4. API設計

### エンドポイント一覧

| メソッド | エンドポイント | 説明 | リクエストボディ | レスポンス |
|---------|--------------|------|----------------|-----------|
| GET | `/api/todos` | 全Todo取得 | - | `Todo[]` |
| GET | `/api/todos/:id` | 単一Todo取得 | - | `Todo \| null` |
| POST | `/api/todos` | Todo作成 | `{ text: string }` | `Todo` |
| PUT | `/api/todos/:id` | Todo更新 | `Partial<Todo>` | `Todo` |
| DELETE | `/api/todos/:id` | Todo削除 | - | `204 No Content` |
| DELETE | `/api/todos` | 全Todo削除 | - | `204 No Content` |

### データモデル

```typescript
// 既存のTodo型
interface Todo {
  id: string;           // UUID
  text: string;
  completed: boolean;
  createdAt: number;    // Unix timestamp (ms)
  updatedAt: number;    // Unix timestamp (ms)
}
```

### エラーレスポンス

```typescript
{
  error: {
    message: string;
    code?: string;
    details?: any;
  }
}
```

HTTPステータスコード:
- `200 OK`: 成功
- `201 Created`: 作成成功
- `204 No Content`: 削除成功
- `400 Bad Request`: リクエストエラー
- `404 Not Found`: リソースが見つからない
- `500 Internal Server Error`: サーバーエラー

## 5. データベーススキーマ（Prisma）

```prisma
model Todo {
  id        String   @id @default(uuid())
  text      String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("todos")
}
```

## 6. 実装手順

### フェーズ1: サーバー基盤の構築
1. `server/`ディレクトリの作成
2. Express + TypeScriptのセットアップ
3. Prismaのセットアップとスキーマ定義
4. 基本的なミドルウェア設定（CORS、エラーハンドリング）

### フェーズ2: API実装
1. Todo CRUD操作の実装
2. バリデーション（Zod）の追加
3. エラーハンドリングの強化

### フェーズ3: クライアント側の統合
1. `RestApiAdapter`の実装
2. `TodoContext`で`RestApiAdapter`を使用するように変更
3. エラーハンドリングとローディング状態の改善

### フェーズ4: 開発環境の整備
1. 開発サーバーの同時起動（concurrently）
2. 環境変数の設定
3. ドキュメントの整備

## 7. セキュリティ考慮事項

- **CORS**: 開発環境ではlocalhostのみ許可、本番環境では適切なオリジンを設定
- **入力バリデーション**: Zodによる型安全なバリデーション
- **SQLインジェクション対策**: Prisma ORMにより自動的に防止
- **レート制限**: 将来的にexpress-rate-limitを追加可能
- **認証**: 将来的にJWT認証を追加可能

## 8. 開発環境

### サーバー起動
```bash
cd server
npm run dev  # nodemon + ts-node
```

### クライアント起動
```bash
cd client
npm run dev  # Vite
```

### 同時起動（オプション）
```bash
# ルートで
npm run dev:all  # クライアントとサーバーを同時起動
```

## 9. 環境変数

### サーバー側（`.env`）
```
DATABASE_URL="file:./dev.db"  # SQLite（開発）
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

### クライアント側（`.env`）
```
VITE_API_URL="http://localhost:3001/api"
```

## 10. 今後の拡張可能性

- **認証**: JWT認証の追加
- **ユーザー管理**: マルチユーザー対応
- **リアルタイム更新**: WebSocket対応
- **ページネーション**: 大量データ対応
- **検索・フィルタリング**: サーバー側実装
- **ソート**: 日付、優先度など

## 11. メリット

- ✅ **型安全性**: TypeScript + Prismaでエンドツーエンドの型安全
- ✅ **既存コードとの互換性**: `IStorage`インターフェースを維持
- ✅ **段階的な移行**: メモリストレージからAPIに切り替え可能
- ✅ **テスト容易性**: サーバーとクライアントを分離してテスト可能
- ✅ **スケーラビリティ**: 将来的に複数クライアント対応が容易

