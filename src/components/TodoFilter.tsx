import React from 'react';
import type { TodoFilter as FilterType } from '../types/todo';
import { useTodo } from '../contexts/TodoContext';

export const TodoFilter: React.FC = () => {
  const { filter, setFilter, todos, clearCompleted } = useTodo();
  
  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: '全て' },
    { value: 'active', label: '未完了' },
    { value: 'completed', label: '完了済み' },
  ];

  return (
    <div className="todo-filter">
      <div className="todo-stats">
        <span>未完了: {activeCount}</span>
        <span>完了済み: {completedCount}</span>
        <span>合計: {todos.length}</span>
      </div>
      <div className="todo-filter-buttons">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`filter-btn ${filter === f.value ? 'active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {completedCount > 0 && (
        <button
          onClick={clearCompleted}
          className="clear-completed-btn"
        >
          完了済みを削除
        </button>
      )}
    </div>
  );
};

