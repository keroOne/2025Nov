export interface Todo {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  completed: boolean;
  author?: string;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export type TodoFilter = 'all' | 'active' | 'completed';
