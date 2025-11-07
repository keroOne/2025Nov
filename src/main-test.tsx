// テスト用：最小限のコンポーネントで動作確認
import ReactDOM from 'react-dom/client';
import './style.css';

const appElement = document.getElementById('app');

if (!appElement) {
  throw new Error('Failed to find the root element');
}

console.log('Test React app starting...');

const TestApp = () => {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0' }}>
      <h1>React動作確認</h1>
      <p>このメッセージが表示されていれば、Reactは正常に動作しています。</p>
    </div>
  );
};

try {
  const root = ReactDOM.createRoot(appElement);
  root.render(<TestApp />);
  console.log('Test React app rendered successfully');
} catch (error) {
  console.error('Failed to render test app:', error);
  appElement.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h1>エラーが発生しました</h1>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <pre>${error instanceof Error ? error.stack : ''}</pre>
    </div>
  `;
}

