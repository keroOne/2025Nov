import React from 'react';
import { Body1 } from '@fluentui/react-components';
import type { Todo } from '../types/todo';

interface TodoSearchViewProps {
  onSelectTodo: (todo: Todo | null) => void;
  selectedTodoId: string | null;
}

export const TodoSearchView: React.FC<TodoSearchViewProps> = () => {
  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
      <Body1 style={{ color: '#605e5c', fontSize: '14px' }}>検索機能は今後実装予定です</Body1>
    </div>
  );
};

