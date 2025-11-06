import React, { useState } from 'react';
import { CategoryTree } from './CategoryTree';
import { TodoListView } from './TodoListView';
import { TodoDetailView } from './TodoDetailView';
import type { Todo } from '../types/todo';

export const TodoApp: React.FC = () => {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* 左ペイン: カテゴリツリー */}
      <div style={{ width: '300px', borderRight: '1px solid #edebe9', overflow: 'auto' }}>
        <CategoryTree />
      </div>

      {/* 右ペイン: 上下分割 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 上段: Todo一覧 */}
        <div style={{ flex: 1, borderBottom: '1px solid #edebe9', overflow: 'auto' }}>
          <TodoListView
            onSelectTodo={setSelectedTodo}
            selectedTodoId={selectedTodo?.id || null}
          />
        </div>

        {/* 下段: Todo詳細 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <TodoDetailView todo={selectedTodo} />
        </div>
      </div>
    </div>
  );
};
