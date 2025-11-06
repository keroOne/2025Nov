import type { Todo } from '../types/todo';
import type { Category, CategoryWithChildren } from '../types/category';

export interface IStorage {
  // Todo操作
  getAllTodos(categoryId?: string): Promise<Todo[]>;
  getTodoById(id: string): Promise<Todo | null>;
  saveTodo(todo: Todo): Promise<void>;
  deleteTodo(id: string): Promise<void>;
  deleteAllTodos(): Promise<void>;
  
  // Category操作
  getAllCategories(): Promise<CategoryWithChildren[]>;
  getCategoryById(id: string): Promise<Category | null>;
  saveCategory(category: Category): Promise<void>;
  deleteCategory(id: string): Promise<void>;
}
