import React, { useState } from 'react';
import { ResizablePane } from './ResizablePane';
import { CategoryTree } from './CategoryTree';
import { TodoListView } from './TodoListView';
import { TodoDetailView } from './TodoDetailView';
import { ErrorBoundary } from './ErrorBoundary';
import type { Todo } from '../types/todo';

export const TodoApp: React.FC = () => {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#faf9f8' }}>
      <ResizablePane
        left={<CategoryTree />}
        right={
          <ResizablePane
            direction="vertical"
            left={
              <TodoListView
                onSelectTodo={setSelectedTodo}
                selectedTodoId={selectedTodo?.id || null}
              />
            }
            right={
              <ErrorBoundary>
                <TodoDetailView todo={selectedTodo} />
              </ErrorBoundary>
            }
            defaultSize={400}
            minSize={200}
            cookieKey="todo-pane-vertical-size"
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
