import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions, DialogContent, Button, Input, Checkbox, Body1 } from '@fluentui/react-components';
import { ChevronLeftRegular, ChevronRightRegular, EditRegular, DeleteRegular, SaveRegular, EyeRegular } from '@fluentui/react-icons';
import { useTodo } from '../contexts/TodoContext';
import { TinyMCEEditor } from './TinyMCEEditor';

interface TodoDialogProps {
  mode: 'view' | 'add' | 'edit' | 'preview' | null;
  todoId: string | null;
  onClose: () => void;
  onModeChange?: (mode: 'view' | 'add' | 'edit' | 'preview' | null) => void;
  onTodoChange?: (todoId: string | null) => void;
  onAdd?: (title: string, content: string, author?: string, publishedAt?: number) => Promise<void>;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TodoDialog: React.FC<TodoDialogProps> = ({ mode, todoId, onClose, onModeChange, onTodoChange, onAdd, onEdit, onDelete }) => {
  const { filteredTodos, updateTodo } = useTodo();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [completed, setCompleted] = useState(false);
  const [author, setAuthor] = useState('');
  const [publishedAt, setPublishedAt] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [viewingTodoId, setViewingTodoId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState('');

  // PCのユーザー名の初期値はブランク（本番ではログインユーザー名から取得）

  // 日時をdatetime-local形式に変換
  const dateTimeToLocalString = (timestamp?: number): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // datetime-local形式をタイムスタンプに変換
  const localStringToTimestamp = (localString: string): number | undefined => {
    if (!localString) return undefined;
    return new Date(localString).getTime();
  };

  // 現在表示中のTodoを取得
  const currentTodo = useMemo(() => {
    if (mode === 'view' || mode === 'edit' || mode === 'preview') {
      const id = viewingTodoId || todoId;
      return filteredTodos.find(t => t.id === id) || null;
    }
    return null;
  }, [mode, viewingTodoId, todoId, filteredTodos]);

  // 現在のTodoのインデックス
  const currentIndex = useMemo(() => {
    if (!currentTodo) return -1;
    return filteredTodos.findIndex(t => t.id === currentTodo.id);
  }, [currentTodo, filteredTodos]);

  // 前後のTodo
  const prevTodo = useMemo(() => {
    if (currentIndex <= 0) return null;
    return filteredTodos[currentIndex - 1];
  }, [currentIndex, filteredTodos]);

  const nextTodo = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= filteredTodos.length - 1) return null;
    return filteredTodos[currentIndex + 1];
  }, [currentIndex, filteredTodos]);

  // Todoが変更されたときに状態を更新
  useEffect(() => {
    if (mode === 'view' || mode === 'edit') {
      const id = viewingTodoId || todoId;
      if (id) {
        setViewingTodoId(id);
        const todo = filteredTodos.find(t => t.id === id);
        if (todo) {
          setTitle(todo.title);
          setContent(todo.content);
          setCompleted(todo.completed);
          setAuthor(todo.author || '');
          setPublishedAt(dateTimeToLocalString(todo.publishedAt));
        }
      }
    } else if (mode === 'preview') {
      // プレビューモードでは、編集内容を保持するため、状態を更新しない
      // （編集画面で入力した値がそのまま表示される）
    } else if (mode === 'add') {
      const now = new Date();
      setTitle('');
      setContent('');
      setCompleted(false);
      setAuthor(''); // 初期値はブランク（本番ではログインユーザー名から取得）
      setPublishedAt(dateTimeToLocalString(now.getTime()));
      setViewingTodoId(null);
    }
  }, [mode, todoId, filteredTodos]);

  // modeが変更されたときにviewingTodoIdをリセット
  useEffect(() => {
    if (mode === 'view' || mode === 'edit' || mode === 'preview') {
      if (todoId) {
        setViewingTodoId(todoId);
      }
    } else {
      setViewingTodoId(null);
    }
  }, [mode, todoId]);

  // プレビューモードに遷移するときに、現在の編集内容をプレビュー用に保存
  // このuseEffectは削除し、handlePreview関数内で直接設定する

  // 前のTodoに移動
  const handlePrev = () => {
    if (prevTodo) {
      setViewingTodoId(prevTodo.id);
      if (onTodoChange) {
        onTodoChange(prevTodo.id);
      }
    }
  };

  // 次のTodoに移動
  const handleNext = () => {
    if (nextTodo) {
      setViewingTodoId(nextTodo.id);
      if (onTodoChange) {
        onTodoChange(nextTodo.id);
      }
    }
  };

  // 保存処理
  const handleSave = async () => {
    if (mode === 'add') {
      if (!title.trim()) {
        alert('タイトルを入力してください');
        return;
      }
      if (!onAdd) return;
      setIsSaving(true);
      try {
        await onAdd(title.trim(), content.trim(), author.trim() || undefined, localStringToTimestamp(publishedAt));
        onClose();
      } catch (error) {
        console.error('Failed to add todo:', error);
        alert('Todoの追加に失敗しました');
      } finally {
        setIsSaving(false);
      }
    } else if (mode === 'preview' && currentTodo) {
      if (!title.trim()) {
        alert('タイトルを入力してください');
        return;
      }
      setIsSaving(true);
      try {
        // previewContentが空の場合はcontentを使用（フォールバック）
        const contentToSave = previewContent.trim() || content.trim();
        await updateTodo(currentTodo.id, {
          title: title.trim(),
          content: contentToSave,
          completed,
          author: author.trim() || undefined,
          publishedAt: localStringToTimestamp(publishedAt),
        });
        onClose();
      } catch (error) {
        console.error('Failed to update todo:', error);
        alert('Todoの更新に失敗しました');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // プレビューに遷移
  const handlePreview = () => {
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    // 現在の編集内容をプレビュー用に保存
    setPreviewContent(content);
    if (onModeChange) {
      onModeChange('preview');
    }
  };

  // プレビューから編集に戻る
  const handleCancelPreview = () => {
    if (onModeChange) {
      onModeChange('edit');
    }
  };

  // 編集モードに切り替え
  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
  };

  // 削除処理
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  if (!mode) return null;

  return (
    <Dialog open={mode !== null} onOpenChange={(_, data) => {
      if (!data.open) {
        onClose();
      }
    }}>
      <DialogSurface style={{ minWidth: '600px', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
        <DialogTitle>
          {mode === 'add' ? 'Todo追加' : mode === 'edit' ? 'Todo編集' : mode === 'preview' ? 'Todoプレビュー' : 'Todo表示'}
        </DialogTitle>
        <DialogBody>
          <DialogContent>
            {mode === 'view' && currentTodo && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 前後移動ボタン（複数Todoがある場合のみ） */}
                {filteredTodos.length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <Button
                      appearance="subtle"
                      icon={<ChevronLeftRegular />}
                      onClick={handlePrev}
                      disabled={!prevTodo}
                      title="前のTodo"
                    >
                      前へ
                    </Button>
                    <Body1 style={{ fontSize: '14px', color: '#605e5c' }}>
                      {currentIndex + 1} / {filteredTodos.length}
                    </Body1>
                    <Button
                      appearance="subtle"
                      icon={<ChevronRightRegular />}
                      onClick={handleNext}
                      disabled={!nextTodo}
                      title="次のTodo"
                    >
                      次へ
                    </Button>
                  </div>
                )}
                <div>
                  <Body1 style={{ fontSize: '12px', color: '#605e5c', marginBottom: '4px' }}>タイトル</Body1>
                  <Body1 style={{ fontSize: '16px', fontWeight: '600', color: '#323130' }}>
                    {currentTodo.title}
                  </Body1>
                </div>
                <div>
                  <Body1 style={{ fontSize: '12px', color: '#605e5c', marginBottom: '4px' }}>内容</Body1>
                  <div 
                    style={{ 
                      minHeight: '200px', 
                      padding: '12px', 
                      backgroundColor: '#faf9f8', 
                      borderRadius: '4px', 
                      border: '1px solid #edebe9',
                    }}
                    dangerouslySetInnerHTML={{ __html: currentTodo.content || '(内容なし)' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <Body1 style={{ fontSize: '12px', color: '#605e5c', marginBottom: '4px' }}>掲載者</Body1>
                    <Body1 style={{ fontSize: '14px', color: '#323130' }}>
                      {currentTodo.author || '-'}
                    </Body1>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Body1 style={{ fontSize: '12px', color: '#605e5c', marginBottom: '4px' }}>公開日時</Body1>
                    <Body1 style={{ fontSize: '14px', color: '#323130' }}>
                      {currentTodo.publishedAt ? new Date(currentTodo.publishedAt).toLocaleString('ja-JP') : '-'}
                    </Body1>
                  </div>
                </div>
                <div>
                  <Checkbox checked={currentTodo.completed} label="完了" disabled />
                </div>
              </div>
            )}
            {(mode === 'add' || mode === 'edit') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="タイトル"
                  size="large"
                />
                <div>
                  <Body1 style={{ fontSize: '12px', color: '#605e5c', marginBottom: '4px' }}>内容</Body1>
                  <TinyMCEEditor
                    value={content}
                    onChange={setContent}
                    placeholder="内容を入力..."
                  />
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Body1 style={{ fontSize: '12px', color: '#605e5c', marginBottom: '4px' }}>掲載者</Body1>
                    <Input
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="掲載者名"
                      size="medium"
                    />
                  </div>
                  <div style={{ flex: '1 1 200px', minWidth: '200px', position: 'relative', zIndex: 1 }}>
                    <Body1 style={{ fontSize: '12px', color: '#605e5c', marginBottom: '4px' }}>公開日時</Body1>
                    <input
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      onFocus={(e) => {
                        // カレンダーポップアップが画面内に収まるように位置を調整
                        const rect = e.target.getBoundingClientRect();
                        const windowHeight = window.innerHeight;
                        const popupHeight = 300; // カレンダーポップアップの推定高さ
                        
                        // 画面下部にはみ出る場合は、上方向に表示
                        if (rect.bottom + popupHeight > windowHeight) {
                          const scrollTop = window.scrollY || document.documentElement.scrollTop;
                          const targetTop = rect.top + scrollTop - popupHeight - 10;
                          if (targetTop > 0) {
                            window.scrollTo({ top: targetTop, behavior: 'smooth' });
                          }
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid #edebe9',
                        borderRadius: '4px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
                <Checkbox
                  checked={completed}
                  onChange={(_, data) => setCompleted(data.checked === true)}
                  label="完了"
                />
              </div>
            )}
            {mode === 'preview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <Body1 style={{ fontSize: '12px', color: '#605e5c', marginBottom: '4px' }}>タイトル</Body1>
                  <Body1 style={{ fontSize: '16px', fontWeight: '600', color: '#323130' }}>
                    {title}
                  </Body1>
                </div>
                <div>
                  <Body1 style={{ fontSize: '12px', color: '#605e5c', marginBottom: '4px' }}>内容</Body1>
                  <div 
                    style={{ 
                      minHeight: '200px', 
                      padding: '12px', 
                      backgroundColor: '#faf9f8', 
                      borderRadius: '4px', 
                      border: '1px solid #edebe9',
                    }}
                    dangerouslySetInnerHTML={{ __html: previewContent || '(内容なし)' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <Body1 style={{ fontSize: '12px', color: '#605e5c', marginBottom: '4px' }}>掲載者</Body1>
                    <Body1 style={{ fontSize: '14px', color: '#323130' }}>
                      {author || '-'}
                    </Body1>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Body1 style={{ fontSize: '12px', color: '#605e5c', marginBottom: '4px' }}>公開日時</Body1>
                    <Body1 style={{ fontSize: '14px', color: '#323130' }}>
                      {publishedAt ? new Date(localStringToTimestamp(publishedAt)!).toLocaleString('ja-JP') : '-'}
                    </Body1>
                  </div>
                </div>
                <div>
                  <Checkbox checked={completed} label="完了" disabled />
                </div>
              </div>
            )}
          </DialogContent>
        </DialogBody>
        <DialogActions>
          {mode === 'view' && (
            <>
              <Button
                appearance="subtle"
                icon={<EditRegular />}
                onClick={handleEdit}
              >
                編集...
              </Button>
              <Button
                appearance="subtle"
                icon={<DeleteRegular />}
                onClick={handleDelete}
              >
                削除...
              </Button>
              <Button
                appearance="primary"
                onClick={onClose}
              >
                戻る
              </Button>
            </>
          )}
          {mode === 'add' && (
            <>
              <Button
                appearance="secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                キャンセル
              </Button>
              <Button
                appearance="primary"
                icon={<SaveRegular />}
                onClick={handleSave}
                disabled={isSaving}
              >
                保存
              </Button>
            </>
          )}
          {mode === 'edit' && (
            <>
              <Button
                appearance="secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                キャンセル
              </Button>
              <Button
                appearance="primary"
                icon={<EyeRegular />}
                onClick={handlePreview}
                disabled={isSaving}
              >
                プレビュー
              </Button>
            </>
          )}
          {mode === 'preview' && (
            <>
              <Button
                appearance="secondary"
                onClick={handleCancelPreview}
                disabled={isSaving}
              >
                キャンセル
              </Button>
              <Button
                appearance="primary"
                icon={<SaveRegular />}
                onClick={handleSave}
                disabled={isSaving}
              >
                保存
              </Button>
            </>
          )}
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};

