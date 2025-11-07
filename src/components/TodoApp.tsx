import React, { useState } from 'react';
import { ResizablePane } from './ResizablePane';
import { CategoryTree } from './CategoryTree';
import { TodoListView } from './TodoListView';
import type { Todo } from '../types/todo';

export const TodoApp: React.FC = () => {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#faf9f8' }}>
      <ResizablePane
        left={<CategoryTree />}
        right={
          <TodoListView
            onSelectTodo={setSelectedTodo}
            selectedTodoId={selectedTodo?.id || null}
          />
        }
        direction="horizontal"
        defaultSize={280}
        minSize={200}
        maxSize={500}
        cookieKey="todo-pane-horizontal-size"
      />
    </div>
  );
};
