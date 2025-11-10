import React, { useState } from 'react';
import { ResizablePane } from './ResizablePane';
import { CategoryTree } from './CategoryTree';
import { TodoListView } from './TodoListView';
import { TodoTabSheet } from './TodoTabSheet';
import type { Todo } from '../types/todo';

export const TodoApp: React.FC = () => {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#faf9f8' }}>
      <ResizablePane
        left={<CategoryTree />}
        right={
          <ResizablePane
            left={
              <ResizablePane
                left={
                  <TodoListView
                    onSelectTodo={setSelectedTodo}
                    selectedTodoId={selectedTodo?.id || null}
                  />
                }
                right={
                  <TodoTabSheet
                    onSelectTodo={setSelectedTodo}
                    selectedTodoId={selectedTodo?.id || null}
                  />
                }
                direction="vertical"
                defaultSize={400}
                minSize={200}
                maxSize={800}
                cookieKey="todo-pane-top-middle-size"
              />
            }
            right={
              <div style={{ padding: '16px', backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#323130' }}>ピン止め</h3>
                <div style={{ flex: 1 }}>
                  {/* ピン止め用エリア（今後実装予定） */}
                </div>
              </div>
            }
            direction="vertical"
            defaultSize={300}
            minSize={150}
            maxSize={600}
            cookieKey="todo-pane-middle-bottom-size"
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
