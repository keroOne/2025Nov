// クライアント側と共通のTodo型定義
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number; // Unix timestamp (ms)
  updatedAt: number; // Unix timestamp (ms)
}

// APIリクエスト/レスポンス用の型
export interface CreateTodoRequest {
  text: string;
}

export interface UpdateTodoRequest {
  text?: string;
  completed?: boolean;
}

