import React from 'react';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';
import { TodoFilter } from './TodoFilter';

export const TodoApp: React.FC = () => {
  return (
    <div className="todo-app">
      <header className="todo-header">
        <h1>Todoアプリ</h1>
        <p>React + TypeScript + ブラウザストレージ</p>
      </header>
      <main className="todo-main">
        <TodoForm />
        <TodoFilter />
        <TodoList />
      </main>
    </div>
  );
};

