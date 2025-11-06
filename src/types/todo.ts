export interface Todo {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export type TodoFilter = 'all' | 'active' | 'completed';
