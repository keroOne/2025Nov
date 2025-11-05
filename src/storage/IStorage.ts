import type { Todo } from '../types/todo';

/**
 * ストレージ層の抽象インターフェース
 * ブラウザストレージとRDBの両方で実装可能
 */
export interface IStorage {
  /**
   * 全てのTodoを取得
   */
  getAllTodos(): Promise<Todo[]>;

  /**
   * 指定されたIDのTodoを取得
   */
  getTodoById(id: string): Promise<Todo | null>;

  /**
   * Todoを保存（新規作成または更新）
   */
  saveTodo(todo: Todo): Promise<void>;

  /**
   * Todoを削除
   */
  deleteTodo(id: string): Promise<void>;

  /**
   * 全てのTodoを削除
   */
  deleteAllTodos(): Promise<void>;
}

