import type { Todo } from '../types/todo';
import type { IStorage } from './IStorage';

const STORAGE_KEY = 'todos';

/**
 * ブラウザのLocalStorageを使用したストレージ実装
 * 将来的にRDBに移行する際は、このクラスをDatabaseAdapterに置き換えるだけでOK
 */
export class LocalStorageAdapter implements IStorage {
  private getTodosFromStorage(): Todo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to read todos from localStorage:', error);
      return [];
    }
  }

  private saveTodosToStorage(todos: Todo[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos to localStorage:', error);
      throw error;
    }
  }

  async getAllTodos(): Promise<Todo[]> {
    return this.getTodosFromStorage();
  }

  async getTodoById(id: string): Promise<Todo | null> {
    const todos = this.getTodosFromStorage();
    return todos.find(todo => todo.id === id) || null;
  }

  async saveTodo(todo: Todo): Promise<void> {
    const todos = this.getTodosFromStorage();
    const index = todos.findIndex(t => t.id === todo.id);
    
    if (index >= 0) {
      todos[index] = todo;
    } else {
      todos.push(todo);
    }
    
    this.saveTodosToStorage(todos);
  }

  async deleteTodo(id: string): Promise<void> {
    const todos = this.getTodosFromStorage();
    const filtered = todos.filter(todo => todo.id !== id);
    this.saveTodosToStorage(filtered);
  }

  async deleteAllTodos(): Promise<void> {
    this.saveTodosToStorage([]);
  }
}

