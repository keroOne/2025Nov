// テスト用コンポーネント: RestApiAdapterのgetAllTodosをテスト
import React, { useEffect, useState } from 'react';
import { RestApiAdapter } from './storage/RestApiAdapter';
import type { Todo } from './types/todo';

export const TestRestApi: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const adapter = new RestApiAdapter();

  const testGetAllTodos = async () => {
    setLoading(true);
    setError(null);
    setMessage('全Todo取得をテスト中...');
    
    try {
      const result = await adapter.getAllTodos();
      setTodos(result);
      setMessage(`✅ 成功: ${result.length}件のTodoを取得しました`);
      console.log('取得したTodo:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setMessage(`❌ 失敗: ${errorMessage}`);
      console.error('エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // コンポーネントマウント時に自動テスト
    testGetAllTodos();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>RestApiAdapter テスト</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={testGetAllTodos}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '取得中...' : '全Todo取得をテスト'}
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: error ? '#fee' : '#efe',
            border: `1px solid ${error ? '#faa' : '#afa'}`,
            borderRadius: '8px',
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#fee',
            border: '1px solid #faa',
            borderRadius: '8px',
            color: '#c00',
          }}
        >
          <strong>エラー:</strong> {error}
        </div>
      )}

      <div>
        <h2>取得したTodo一覧 ({todos.length}件)</h2>
        {todos.length === 0 ? (
          <p>Todoがありません</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {todos.map((todo) => (
              <li
                key={todo.id}
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <strong>ID:</strong> {todo.id}
                </div>
                <div>
                  <strong>Text:</strong> {todo.text}
                </div>
                <div>
                  <strong>Completed:</strong> {todo.completed ? '✅' : '❌'}
                </div>
                <div>
                  <strong>Created:</strong>{' '}
                  {new Date(todo.createdAt).toLocaleString('ja-JP')}
                </div>
                <div>
                  <strong>Updated:</strong>{' '}
                  {new Date(todo.updatedAt).toLocaleString('ja-JP')}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

