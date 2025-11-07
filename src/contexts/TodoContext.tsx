import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Todo, TodoFilter } from '../types/todo';
import type { IStorage } from '../storage/IStorage';
import { RestApiAdapter } from '../storage/RestApiAdapter';

interface TodoContextType {
  todos: Todo[];
  filter: TodoFilter;
  filteredTodos: Todo[];
  selectedCategoryId: string | null;
  addTodo: (categoryId: string, title: string, content: string) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  setFilter: (filter: TodoFilter) => void;
  clearCompleted: () => Promise<void>;
  refreshTodos: (categoryId?: string | null) => Promise<void>;
  loading: boolean;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

interface TodoProviderProps {
  children: ReactNode;
  storage?: IStorage;
  selectedCategoryId?: string | null;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ 
  children, 
  storage: externalStorage,
  selectedCategoryId: externalSelectedCategoryId = null,
}) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [loading, setLoading] = useState(true);
  const selectedCategoryId = externalSelectedCategoryId;

  // storageをメモ化して、毎回新しいインスタンスが作成されないようにする
  const storage = useMemo(() => externalStorage || new RestApiAdapter(), [externalStorage]);

  const refreshTodos = useCallback(async (categoryId?: string | null) => {
    try {
      setLoading(true);
      const loadedTodos = await storage.getAllTodos(categoryId || undefined);
      setTodos(loadedTodos);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setLoading(false);
    }
  }, [storage]);

  // 初期データの読み込み
  useEffect(() => {
    refreshTodos(selectedCategoryId);
  }, [refreshTodos, selectedCategoryId]);

  // フィルタリングされたTodoリスト
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // Todoを追加
  const addTodo = useCallback(async (categoryId: string, title: string, content: string) => {
    console.log('addTodo called:', { categoryId, title, content });
    const newTodo: Todo = {
      id: '',
      categoryId,
      title: title.trim(),
      content: content.trim(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      console.log('Saving todo:', newTodo);
      await storage.saveTodo(newTodo);
      console.log('Todo saved, refreshing...');
      await refreshTodos(selectedCategoryId);
      console.log('Todos refreshed');
    } catch (error) {
      console.error('Failed to add todo:', error);
      throw error;
    }
  }, [storage, refreshTodos, selectedCategoryId]);

  // Todoを更新
  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const updatedTodo: Todo = {
        ...todo,
        ...updates,
        updatedAt: Date.now(),
      };

      await storage.saveTodo(updatedTodo);
      await refreshTodos(selectedCategoryId);
    } catch (error) {
      console.error('Failed to update todo:', error);
      throw error;
    }
  };

  // Todoを削除
  const deleteTodo = async (id: string) => {
    try {
      await storage.deleteTodo(id);
      await refreshTodos(selectedCategoryId);
    } catch (error) {
      console.error('Failed to delete todo:', error);
      throw error;
    }
  };

  // Todoの完了状態を切り替え
  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  };

  // 完了済みTodoを全て削除
  const clearCompleted = async () => {
    try {
      const completedIds = todos.filter(t => t.completed).map(t => t.id);
      await Promise.all(completedIds.map(id => storage.deleteTodo(id)));
      await refreshTodos(selectedCategoryId);
    } catch (error) {
      console.error('Failed to clear completed todos:', error);
      throw error;
    }
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        filter,
        filteredTodos,
        selectedCategoryId,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        setFilter,
        clearCompleted,
        refreshTodos,
        loading,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};
