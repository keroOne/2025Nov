import type { Todo } from '../types/todo';
import type { IStorage } from './IStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * REST APIを使用したストレージ実装
 * サーバーのREST APIと通信してデータを永続化
 */
export class RestApiAdapter implements IStorage {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: { message: `HTTP ${response.status}: ${response.statusText}` },
      }));
      throw new Error(error.error?.message || 'Request failed');
    }

    // 204 No Content の場合は空のレスポンス
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * 全てのTodoを取得
   */
  async getAllTodos(): Promise<Todo[]> {
    try {
      const todos = await this.request<Todo[]>('/todos');
      return todos || [];
    } catch (error) {
      console.error('Failed to get all todos:', error);
      throw error;
    }
  }

  /**
   * 指定されたIDのTodoを取得
   */
  async getTodoById(id: string): Promise<Todo | null> {
    try {
      const todo = await this.request<Todo>(`/todos/${id}`);
      return todo || null;
    } catch (error) {
      console.error(`Failed to get todo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Todoを保存（新規作成または更新）
   */
  async saveTodo(todo: Todo): Promise<void> {
    try {
      const isNew = !todo.id;
      
      if (isNew) {
        // 新規作成
        await this.request<Todo>('/todos', {
          method: 'POST',
          body: JSON.stringify({ text: todo.text }),
        });
      } else {
        // 更新
        await this.request<Todo>(`/todos/${todo.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            text: todo.text,
            completed: todo.completed,
          }),
        });
      }
    } catch (error) {
      console.error('Failed to save todo:', error);
      throw error;
    }
  }

  /**
   * Todoを削除
   */
  async deleteTodo(id: string): Promise<void> {
    try {
      await this.request<void>(`/todos/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Failed to delete todo ${id}:`, error);
      throw error;
    }
  }

  /**
   * 全てのTodoを削除
   */
  async deleteAllTodos(): Promise<void> {
    try {
      await this.request<void>('/todos', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete all todos:', error);
      throw error;
    }
  }
}

