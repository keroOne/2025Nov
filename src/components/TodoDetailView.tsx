import React, { useState, useEffect, useMemo } from 'react';
import { Card, Input, Button, Checkbox, Body1, Spinner } from '@fluentui/react-components';
import { SaveRegular, DismissRegular } from '@fluentui/react-icons';
import { useTodo } from '../contexts/TodoContext';
import type { Todo } from '../types/todo';

interface TodoDetailViewProps {
  todo: Todo | null;
}

export const TodoDetailView: React.FC<TodoDetailViewProps> = ({ todo }) => {
  const { updateTodo, todos } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // todoのIDを使って、最新のtodoを取得
  const currentTodo = useMemo(() => {
    if (!todo) return null;
    return todos.find(t => t.id === todo.id) || todo;
  }, [todo, todos]);

  // todoのIDをメモ化して、todoが変更されたときのみ状態をリセット
  const todoId = useMemo(() => currentTodo?.id || null, [currentTodo?.id]);

  useEffect(() => {
    // 編集モードの場合は状態をリセットしない（編集中の内容を保持）
    if (isEditing) return;
    
    if (currentTodo) {
      setTitle(currentTodo.title || '');
      setContent(currentTodo.content || '');
      setCompleted(currentTodo.completed || false);
    } else {
      setTitle('');
      setContent('');
      setCompleted(false);
    }
  }, [todoId, isEditing, currentTodo]); // todoIdが変更されたとき、または編集モードが終了したときに実行

  if (!currentTodo) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#605e5c', backgroundColor: '#ffffff', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '14px', margin: 0 }}>Todoを選択してください</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    setIsSaving(true);
    try {
      await updateTodo(currentTodo.id, {
        title: title.trim(),
        content: content.trim(),
        completed,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update todo:', error);
      alert('Todoの更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (currentTodo) {
      setTitle(currentTodo.title || '');
      setContent(currentTodo.content || '');
      setCompleted(currentTodo.completed || false);
    } else {
      setTitle('');
      setContent('');
      setCompleted(false);
    }
    setIsEditing(false);
  };

  return (
    <div key={currentTodo.id} style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <Card style={{ flex: 1, padding: '24px', border: '1px solid #edebe9', borderRadius: '4px', boxShadow: 'none' }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトル"
              size="large"
            />
            <div style={{ minHeight: '200px' }}>
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="内容"
                multiline
                rows={10}
              />
            </div>
            <Checkbox
              checked={completed}
              onChange={(e, data) => setCompleted(data.checked || false)}
              label="完了"
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
              {isSaving && <Spinner size="tiny" />}
              <Button
                key={`save-${currentTodo.id}`}
                onClick={handleSave}
                appearance="primary"
                icon={!isSaving ? <SaveRegular /> : undefined}
                disabled={isSaving}
              >
                保存
              </Button>
              <Button 
                key={`cancel-${currentTodo.id}`}
                onClick={handleCancel} 
                icon={<DismissRegular />}
                disabled={isSaving}
              >
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#323130', lineHeight: '1.4', margin: 0 }}>
                {String(currentTodo.title || '')}
              </h2>
            </div>
            <div style={{ minHeight: '200px', whiteSpace: 'pre-wrap', padding: '12px', backgroundColor: '#faf9f8', borderRadius: '4px', border: '1px solid #edebe9' }}>
              <p style={{ fontSize: '14px', color: '#323130', lineHeight: '1.6', margin: 0 }}>
                {String(currentTodo.content || '(内容なし)')}
              </p>
            </div>
            <div>
              <Checkbox checked={currentTodo.completed || false} label="完了" disabled />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button 
                key={`edit-${currentTodo.id}`}
                onClick={() => setIsEditing(true)} 
                appearance="primary"
              >
                編集
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
