// クライアント側と共通のTodo型定義
export interface Todo {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  completed: boolean;
  createdAt: number; // Unix timestamp (ms)
  updatedAt: number; // Unix timestamp (ms)
}

// APIリクエスト/レスポンス用の型
export interface CreateTodoRequest {
  categoryId: string;
  title: string;
  content: string;
}

export interface UpdateTodoRequest {
  categoryId?: string;
  title?: string;
  content?: string;
  completed?: boolean;
}
