import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Todo, TodoFilter } from '../types/todo';
import type { IStorage } from '../storage/IStorage';
import { RestApiAdapter } from '../storage/RestApiAdapter';

interface TodoContextType {
  todos: Todo[];
  filter: TodoFilter;
  filteredTodos: Todo[];
  addTodo: (text: string) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  setFilter: (filter: TodoFilter) => void;
  clearCompleted: () => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

interface TodoProviderProps {
  children: ReactNode;
  storage?: IStorage; // テストや将来的なRDB移行のために注入可能に
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ 
  children, 
  storage = new RestApiAdapter() 
}) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [loading, setLoading] = useState(true);

  // 初期データの読み込み
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const loadedTodos = await storage.getAllTodos();
        setTodos(loadedTodos);
      } catch (error) {
        console.error('Failed to load todos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTodos();
  }, [storage]);

  // フィルタリングされたTodoリスト
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // Todoを追加
  const addTodo = async (text: string) => {
    const newTodo: Todo = {
      id: '', // RestApiAdapterがサーバーからIDを取得する
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await storage.saveTodo(newTodo);
      // saveTodoでIDが設定されるので、それを反映
      setTodos(prev => [...prev, newTodo]);
    } catch (error) {
      console.error('Failed to add todo:', error);
      throw error;
    }
  };

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
      setTodos(prev => prev.map(t => (t.id === id ? updatedTodo : t)));
    } catch (error) {
      console.error('Failed to update todo:', error);
      throw error;
    }
  };

  // Todoを削除
  const deleteTodo = async (id: string) => {
    try {
      await storage.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
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
      setTodos(prev => prev.filter(t => !t.completed));
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
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        setFilter,
        clearCompleted,
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

