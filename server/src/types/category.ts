// クライアント側と共通のCategory型定義
export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number; // Unix timestamp (ms)
  updatedAt: number; // Unix timestamp (ms)
}

// 階層構造を含むCategory型
export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
  todoCount?: number;
}

// APIリクエスト/レスポンス用の型
export interface CreateCategoryRequest {
  name: string;
  parentId?: string | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  parentId?: string | null;
}

