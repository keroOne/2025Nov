import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Checkbox, Body1, Spinner } from '@fluentui/react-components';
import { SaveRegular, DismissRegular } from '@fluentui/react-icons';
import { useTodo } from '../contexts/TodoContext';
import type { Todo } from '../types/todo';

interface TodoDetailViewProps {
  todo: Todo | null;
}

export const TodoDetailView: React.FC<TodoDetailViewProps> = ({ todo }) => {
  const { updateTodo } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setContent(todo.content);
      setCompleted(todo.completed);
      setIsEditing(false);
    }
  }, [todo]);

  if (!todo) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#605e5c' }}>
        <Body1>Todoを選択してください</Body1>
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
      await updateTodo(todo.id, {
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
    setTitle(todo.title);
    setContent(todo.content);
    setCompleted(todo.completed);
    setIsEditing(false);
  };

  return (
    <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Card style={{ flex: 1, padding: '24px' }}>
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
              onChange={(e) => setCompleted(e.target.checked)}
              label="完了"
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button
                onClick={handleSave}
                appearance="primary"
                icon={isSaving ? <Spinner size="tiny" /> : <SaveRegular />}
                disabled={isSaving}
              >
                保存
              </Button>
              <Button onClick={handleCancel} icon={<DismissRegular />}>
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <Body1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {todo.title}
              </Body1>
            </div>
            <div style={{ minHeight: '200px', whiteSpace: 'pre-wrap' }}>
              <Body1>{todo.content || '(内容なし)'}</Body1>
            </div>
            <div>
              <Checkbox checked={todo.completed} label="完了" disabled />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsEditing(true)} appearance="primary">
                編集
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

