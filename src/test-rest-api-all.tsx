// テスト用コンポーネント: RestApiAdapterの全メソッドをテスト
import React, { useEffect, useState } from 'react';
import { RestApiAdapter } from './storage/RestApiAdapter';
import type { Todo } from './types/todo';

export const TestRestApiAll: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [testTodoId, setTestTodoId] = useState<string | null>(null);

  const adapter = new RestApiAdapter();

  const addMessage = (msg: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString('ja-JP');
    setMessages((prev) => [`[${timestamp}] ${isError ? '❌' : '✅'} ${msg}`, ...prev]);
  };

  // 1. 全Todo取得（内部用：ローディング状態を変更しない）
  const refreshTodos = async (showLoading = false): Promise<Todo[]> => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const result = await adapter.getAllTodos();
      setTodos(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addMessage(`全Todo取得失敗: ${errorMessage}`, true);
      console.error('エラー:', err);
      return []; // エラー時は空配列を返す
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // 1. 全Todo取得（ボタン用）
  const testGetAllTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await refreshTodos(false);
      addMessage(`全Todo取得成功: ${result.length}件`);
      console.log('取得したTodo:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addMessage(`全Todo取得失敗: ${errorMessage}`, true);
      console.error('エラー:', err);
    } finally {
      // 確実にローディング状態を解除
      setTimeout(() => setLoading(false), 0);
    }
  };

  // 2. Todo作成
  const testCreateTodo = async () => {
    setLoading(true);
    setError(null);
    try {
      const newTodo: Todo = {
        id: '',
        categoryId: '',
        title: `テストTodo ${Date.now()}`,
        content: '',
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await adapter.saveTodo(newTodo);
      addMessage(`Todo作成成功: "${newTodo.title}" (ID: ${newTodo.id})`);
      setTestTodoId(newTodo.id);
      // 一覧を更新（ローディング状態を変更しない）
      try {
        await refreshTodos(false);
      } catch (refreshErr) {
        console.error('一覧更新エラー:', refreshErr);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addMessage(`Todo作成失敗: ${errorMessage}`, true);
      console.error('エラー:', err);
    } finally {
      // 確実にローディング状態を解除
      setTimeout(() => setLoading(false), 0);
    }
  };

  // 3. 単一Todo取得
  const testGetTodoById = async () => {
    if (!testTodoId) {
      addMessage('先にTodoを作成してください', true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const todo = await adapter.getTodoById(testTodoId);
      if (todo) {
        addMessage(`単一Todo取得成功: "${todo.title}"`);
        console.log('取得したTodo:', todo);
      } else {
        addMessage('Todoが見つかりませんでした', true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addMessage(`単一Todo取得失敗: ${errorMessage}`, true);
      console.error('エラー:', err);
    } finally {
      // 確実にローディング状態を解除
      setTimeout(() => setLoading(false), 0);
    }
  };

  // 4. Todo更新
  const testUpdateTodo = async () => {
    if (!testTodoId) {
      addMessage('先にTodoを作成してください', true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const todo = await adapter.getTodoById(testTodoId);
      if (!todo) {
        addMessage('Todoが見つかりませんでした', true);
        return;
      }
      todo.completed = !todo.completed;
      todo.title = `${todo.title} (更新済み)`;
      await adapter.saveTodo(todo);
      addMessage(`Todo更新成功: completed=${todo.completed}`);
      // 一覧を更新（ローディング状態を変更しない）
      try {
        await refreshTodos(false);
      } catch (refreshErr) {
        console.error('一覧更新エラー:', refreshErr);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addMessage(`Todo更新失敗: ${errorMessage}`, true);
      console.error('エラー:', err);
    } finally {
      // 確実にローディング状態を解除
      setTimeout(() => setLoading(false), 0);
    }
  };

  // 5. Todo削除
  const testDeleteTodo = async () => {
    if (!testTodoId) {
      addMessage('先にTodoを作成してください', true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await adapter.deleteTodo(testTodoId);
      addMessage(`Todo削除成功: ID=${testTodoId}`);
      setTestTodoId(null);
      // 一覧を更新（ローディング状態を変更しない）
      try {
        await refreshTodos(false);
      } catch (refreshErr) {
        console.error('一覧更新エラー:', refreshErr);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addMessage(`Todo削除失敗: ${errorMessage}`, true);
      console.error('エラー:', err);
    } finally {
      // 確実にローディング状態を解除
      setTimeout(() => setLoading(false), 0);
    }
  };

  // 6. 全Todo削除
  const testDeleteAllTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      await adapter.deleteAllTodos();
      addMessage('全Todo削除成功');
      setTestTodoId(null);
      // 一覧を更新（ローディング状態を変更しない）
      try {
        await refreshTodos(false);
      } catch (refreshErr) {
        console.error('一覧更新エラー:', refreshErr);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addMessage(`全Todo削除失敗: ${errorMessage}`, true);
      console.error('エラー:', err);
    } finally {
      // 確実にローディング状態を解除
      setTimeout(() => setLoading(false), 0);
    }
  };

  useEffect(() => {
    // コンポーネントマウント時に全Todo取得（ローディング状態を変更しない）
    refreshTodos(false).catch(console.error);
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>RestApiAdapter 全メソッドテスト</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={testGetAllTodos} disabled={loading} style={buttonStyle(loading)}>
          {loading ? '処理中...' : '1. 全Todo取得'}
        </button>
        <button onClick={testCreateTodo} disabled={loading} style={buttonStyle(loading)}>
          {loading ? '処理中...' : '2. Todo作成'}
        </button>
        <button onClick={testGetTodoById} disabled={loading || !testTodoId} style={buttonStyle(loading || !testTodoId)}>
          {loading ? '処理中...' : '3. 単一Todo取得'}
        </button>
        <button onClick={testUpdateTodo} disabled={loading || !testTodoId} style={buttonStyle(loading || !testTodoId)}>
          {loading ? '処理中...' : '4. Todo更新'}
        </button>
        <button onClick={testDeleteTodo} disabled={loading || !testTodoId} style={buttonStyle(loading || !testTodoId)}>
          {loading ? '処理中...' : '5. Todo削除'}
        </button>
        <button onClick={testDeleteAllTodos} disabled={loading} style={buttonStyle(loading, true)}>
          {loading ? '処理中...' : '6. 全Todo削除'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', border: '1px solid #faa', borderRadius: '8px', color: '#c00' }}>
          <strong>エラー:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h2>テストログ</h2>
        <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
          {messages.length === 0 ? (
            <p style={{ color: '#999' }}>テストを実行するとログが表示されます</p>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: '5px' }}>
                {msg}
              </div>
            ))
          )}
        </div>
      </div>

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
                  backgroundColor: testTodoId === todo.id ? '#fff3cd' : '#f8f9fa',
                  border: `1px solid ${testTodoId === todo.id ? '#ffc107' : '#e0e0e0'}`,
                  borderRadius: '8px',
                }}
              >
                <div><strong>ID:</strong> {todo.id}</div>
                <div><strong>Title:</strong> {todo.title}</div>
                <div><strong>Content:</strong> {todo.content || '(なし)'}</div>
                <div><strong>Completed:</strong> {todo.completed ? '✅' : '❌'}</div>
                <div><strong>Created:</strong> {new Date(todo.createdAt).toLocaleString('ja-JP')}</div>
                <div><strong>Updated:</strong> {new Date(todo.updatedAt).toLocaleString('ja-JP')}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const buttonStyle = (disabled: boolean, isDanger = false) => ({
  padding: '10px 20px',
  fontSize: '14px',
  backgroundColor: disabled ? '#ccc' : isDanger ? '#dc3545' : '#667eea',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'background-color 0.2s',
});

