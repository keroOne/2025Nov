import React from 'react';
import { useTodo } from '../contexts/TodoContext';
import { TodoItem } from './TodoItem';

export const TodoList: React.FC = () => {
  const { filteredTodos, todos } = useTodo();

  if (todos.length === 0) {
    return (
      <div className="todo-empty">
        <p>Todoがありません。新しいTodoを追加してください。</p>
      </div>
    );
  }

  if (filteredTodos.length === 0) {
    return (
      <div className="todo-empty">
        <p>表示するTodoがありません。</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {filteredTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
};

