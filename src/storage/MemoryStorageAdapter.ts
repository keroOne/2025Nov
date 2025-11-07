import type { Todo } from '../types/todo';
import type { Category, CategoryWithChildren } from '../types/category';
import type { IStorage } from './IStorage';

/**
 * メモリ上にTodoを保持するストレージ実装
 * ページをリロードするとデータは消えます
 */
export class MemoryStorageAdapter implements IStorage {
  private todos: Todo[] = [];

  async getAllTodos(): Promise<Todo[]> {
    return [...this.todos];
  }

  async getTodoById(id: string): Promise<Todo | null> {
    return this.todos.find(todo => todo.id === id) || null;
  }

  async saveTodo(todo: Todo): Promise<void> {
    const index = this.todos.findIndex(t => t.id === todo.id);
    
    if (index >= 0) {
      this.todos[index] = todo;
    } else {
      this.todos.push(todo);
    }
  }

  async deleteTodo(id: string): Promise<void> {
    this.todos = this.todos.filter(todo => todo.id !== id);
  }

  async deleteAllTodos(): Promise<void> {
    this.todos = [];
  }

  // Category operations (not implemented for MemoryStorage)
  async getAllCategories(): Promise<CategoryWithChildren[]> {
    return [];
  }

  async getCategoryById(_id: string): Promise<Category | null> {
    return null;
  }

  async saveCategory(_category: Category): Promise<void> {
    // Not implemented
  }

  async deleteCategory(_id: string): Promise<void> {
    // Not implemented
  }
}

