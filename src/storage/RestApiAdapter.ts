import type { Todo } from '../types/todo';
import type { Category, CategoryWithChildren } from '../types/category';
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
   * 全てのTodoを取得（カテゴリでフィルタ可能）
   */
  async getAllTodos(categoryId?: string): Promise<Todo[]> {
    try {
      const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
      const todos = await this.request<Todo[]>(`/todos${query}`);
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
    } catch (error: any) {
      // 404エラーの場合はnullを返す
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        return null;
      }
      console.error(`Failed to get todo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Todoを保存（新規作成または更新）
   */
  async saveTodo(todo: Todo): Promise<void> {
    try {
      // 新規作成の場合（idがない、または空文字列）
      if (!todo.id || todo.id.trim() === '') {
        const createdTodo = await this.request<Todo>('/todos', {
          method: 'POST',
          body: JSON.stringify({
            categoryId: todo.categoryId,
            title: todo.title,
            content: todo.content,
          }),
        });
        // 作成されたTodoのIDを元のTodoオブジェクトに反映
        todo.id = createdTodo.id;
        todo.createdAt = createdTodo.createdAt;
        todo.updatedAt = createdTodo.updatedAt;
      } else {
        // 更新
        const updatedTodo = await this.request<Todo>(`/todos/${todo.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            categoryId: todo.categoryId,
            title: todo.title,
            content: todo.content,
            completed: todo.completed,
          }),
        });
        // 更新されたTodoの情報を反映
        todo.updatedAt = updatedTodo.updatedAt;
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

  /**
   * 全てのカテゴリを取得（階層構造）
   */
  async getAllCategories(): Promise<CategoryWithChildren[]> {
    try {
      const categories = await this.request<CategoryWithChildren[]>('/categories/tree');
      return categories || [];
    } catch (error) {
      console.error('Failed to get all categories:', error);
      throw error;
    }
  }

  /**
   * 指定されたIDのカテゴリを取得
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const category = await this.request<Category>(`/categories/${id}`);
      return category || null;
    } catch (error: any) {
      // 404エラーの場合はnullを返す
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        return null;
      }
      console.error(`Failed to get category ${id}:`, error);
      throw error;
    }
  }

  /**
   * カテゴリを保存（新規作成または更新）
   */
  async saveCategory(category: Category): Promise<void> {
    try {
      // 新規作成の場合（idがない、または空文字列）
      if (!category.id || category.id.trim() === '') {
        const createdCategory = await this.request<Category>('/categories', {
          method: 'POST',
          body: JSON.stringify({
            name: category.name,
            parentId: category.parentId,
          }),
        });
        // 作成されたカテゴリのIDを元のカテゴリオブジェクトに反映
        category.id = createdCategory.id;
        category.createdAt = createdCategory.createdAt;
        category.updatedAt = createdCategory.updatedAt;
      } else {
        // 更新
        const updatedCategory = await this.request<Category>(`/categories/${category.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: category.name,
            parentId: category.parentId,
          }),
        });
        // 更新されたカテゴリの情報を反映
        category.updatedAt = updatedCategory.updatedAt;
      }
    } catch (error) {
      console.error('Failed to save category:', error);
      throw error;
    }
  }

  /**
   * カテゴリを削除
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      await this.request<void>(`/categories/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      throw error;
    }
  }
}
