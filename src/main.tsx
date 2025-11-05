import React from 'react';
import ReactDOM from 'react-dom/client';
import { TodoProvider } from './contexts/TodoContext';
import { TodoApp } from './components/TodoApp';
import './style.css';

// エラーハンドリングとログ出力
const appElement = document.getElementById('app');

if (!appElement) {
  throw new Error('Failed to find the root element');
}

console.log('React app starting...');
console.log('Root element found:', appElement);

try {
  const root = ReactDOM.createRoot(appElement);
  console.log('React root created');

  root.render(
    <TodoProvider>
      <TodoApp />
    </TodoProvider>
  );

  console.log('React app rendered');
} catch (error) {
  console.error('Failed to render React app:', error);
  appElement.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h1>エラーが発生しました</h1>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <p>ブラウザのコンソールを確認してください。</p>
    </div>
  `;
}

