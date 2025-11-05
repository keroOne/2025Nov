import React from 'react';
import ReactDOM from 'react-dom/client';
// テスト用: RestApiAdapterをテスト
import { TestRestApi } from './test-rest-api';
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

  // テストモード: RestApiAdapterのgetAllTodosをテスト
  root.render(
    <React.StrictMode>
      <TestRestApi />
    </React.StrictMode>
  );

  console.log('React app rendered (Test mode: RestApiAdapter)');
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

