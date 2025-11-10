import React, { useState } from 'react';
import { Card, Button, Checkbox, Body1, Spinner, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui/react-components';
import { AddRegular, DeleteRegular, DocumentRegular, DocumentTextRegular, EditRegular, EyeRegular } from '@fluentui/react-icons';
import { useTodo } from '../contexts/TodoContext';
import { useCategory } from '../contexts/CategoryContext';
import { TodoDialog } from './TodoDialog';
import type { Todo } from '../types/todo';

interface TodoListViewProps {
  onSelectTodo: (todo: Todo | null) => void;
  selectedTodoId: string | null;
}

// カテゴリをIDで検索（階層構造内）
const findCategoryById = (
  cats: Array<{ id: string; name: string; children: any[] }>,
  id: string
): any => {
  for (const cat of cats) {
    if (cat.id === id) return cat;
    const found = findCategoryById(cat.children, id);
    if (found) return found;
  }
  return null;
};

export const TodoListView: React.FC<TodoListViewProps> = ({ onSelectTodo, selectedTodoId }) => {
  const { filteredTodos, addTodo, deleteTodo, toggleTodo, selectedCategoryId } = useTodo();
  const { categories, loading: categoriesLoading } = useCategory();
  const [dialogMode, setDialogMode] = useState<'view' | 'add' | 'edit' | 'preview' | null>(null);
  const [dialogTodoId, setDialogTodoId] = useState<string | null>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuTodoId, setContextMenuTodoId] = useState<string | null>(null);

  const selectedCategory = selectedCategoryId && categories.length > 0
    ? findCategoryById(categories, selectedCategoryId)
    : null;

  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setDialogMode(null);
    setDialogTodoId(null);
  };

  // 追加処理
  const handleAdd = async (title: string, content: string, author?: string, publishedAt?: number) => {
    if (!selectedCategoryId) {
      alert('カテゴリを選択してください');
      return;
    }
    try {
      await addTodo(selectedCategoryId, title, content, author, publishedAt);
    } catch (error) {
      console.error('Failed to add todo:', error);
      throw error;
    }
  };

  // 表示ダイアログを開く
  const handleView = (todoId: string) => {
    setDialogTodoId(todoId);
    setDialogMode('view');
    onSelectTodo(filteredTodos.find(t => t.id === todoId) || null);
  };

  // 編集ダイアログを開く
  const handleEdit = (todoId: string) => {
    setDialogTodoId(todoId);
    setDialogMode('edit');
    onSelectTodo(filteredTodos.find(t => t.id === todoId) || null);
  };

  // 削除処理
  const handleDelete = async (todoId: string) => {
    if (window.confirm('このTodoを削除しますか？')) {
      try {
        await deleteTodo(todoId);
        if (selectedTodoId === todoId) {
          onSelectTodo(null);
        }
        if (dialogTodoId === todoId) {
          handleCloseDialog();
        }
      } catch (error) {
        console.error('Failed to delete todo:', error);
        alert('Todoの削除に失敗しました');
      }
    }
  };

  // コンテキストメニュー（空の場所）
  const handleContextMenuEmpty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedCategoryId) return;
    setContextMenuTodoId(null);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  // コンテキストメニュー（Todoアイテム上）
  const handleContextMenuTodo = (e: React.MouseEvent, todoId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuTodoId(todoId);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  // ダブルクリック
  const handleDoubleClick = (todoId: string) => {
    handleView(todoId);
  };

  // ダイアログで前後のTodoに移動したときの処理
  const handleTodoChange = (todoId: string | null) => {
    if (todoId) {
      const todo = filteredTodos.find(t => t.id === todoId);
      if (todo) {
        onSelectTodo(todo);
      }
    }
  };

  if (categoriesLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#605e5c', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <Spinner size="medium" />
        <Body1>読み込み中...</Body1>
      </div>
    );
  }

  if (!selectedCategoryId) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#605e5c' }}>
        <Body1>カテゴリを選択してください</Body1>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <div
        style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onContextMenu={handleContextMenuEmpty}
      >
        <h3 
          style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#323130', cursor: 'context-menu' }}
          onContextMenu={handleContextMenuEmpty}
        >
          {selectedCategory?.name || 'Todo'}
        </h3>
        <Button
          appearance="primary"
          icon={<AddRegular />}
          onClick={() => {
            setDialogMode('add');
            setDialogTodoId(null);
          }}
          size="small"
          style={{ minWidth: 'auto' }}
        >
          Todo追加
        </Button>
      </div>
      {contextMenuOpen && contextMenuPosition && (
        <Menu open={contextMenuOpen} onOpenChange={(_, data) => {
          if (!data.open) {
            setContextMenuOpen(false);
            setContextMenuPosition(null);
            setContextMenuTodoId(null);
          }
        }}>
          <MenuTrigger disableButtonEnhancement>
            <div 
              style={{ 
                position: 'fixed', 
                left: contextMenuPosition.x, 
                top: contextMenuPosition.y, 
                width: 0, 
                height: 0,
                pointerEvents: 'none',
                zIndex: -1
              }} 
            />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {contextMenuTodoId ? (
                // Todoアイテム上でのコンテキストメニュー
                <>
                  <MenuItem
                    icon={<EyeRegular />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenuOpen(false);
                      handleView(contextMenuTodoId);
                    }}
                  >
                    表示...
                  </MenuItem>
                  <MenuItem
                    icon={<EditRegular />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenuOpen(false);
                      handleEdit(contextMenuTodoId);
                    }}
                  >
                    編集...
                  </MenuItem>
                  <MenuItem
                    icon={<DeleteRegular />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenuOpen(false);
                      handleDelete(contextMenuTodoId);
                    }}
                  >
                    削除...
                  </MenuItem>
                </>
              ) : (
                // 空の場所でのコンテキストメニュー
                <MenuItem
                  icon={<DocumentRegular />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenuOpen(false);
                    setDialogMode('add');
                    setDialogTodoId(null);
                  }}
                >
                  追加...
                </MenuItem>
              )}
            </MenuList>
          </MenuPopover>
        </Menu>
      )}
      <div 
        style={{ flex: 1, overflow: 'auto' }}
        onContextMenu={handleContextMenuEmpty}
      >
        {filteredTodos.length === 0 ? (
          <div 
            style={{ padding: '24px', textAlign: 'center', color: '#605e5c', fontSize: '14px', minHeight: '200px' }}
            onContextMenu={handleContextMenuEmpty}
          >
            Todoがありません
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredTodos.map((todo) => (
              <Card
                key={todo.id}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: selectedTodoId === todo.id ? '#e1f5fe' : '#ffffff',
                  border: selectedTodoId === todo.id ? '1px solid #0078d4' : '1px solid #edebe9',
                  borderRadius: '4px',
                  boxShadow: selectedTodoId === todo.id ? '0 2px 4px rgba(0,120,212,0.2)' : 'none',
                  transition: 'all 0.15s ease',
                  lineHeight: '1.5',
                  minHeight: '21px', // 14px * 1.5 = 21px
                }}
                onClick={() => onSelectTodo(todo)}
                onDoubleClick={() => handleDoubleClick(todo.id)}
                onContextMenu={(e) => handleContextMenuTodo(e, todo.id)}
                onMouseEnter={(e) => {
                  if (selectedTodoId !== todo.id) {
                    e.currentTarget.style.backgroundColor = '#faf9f8';
                    e.currentTarget.style.borderColor = '#c8c6c4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTodoId !== todo.id) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#edebe9';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    {todo.content && todo.content.trim() ? (
                      <span style={{ fontSize: '16px', color: todo.completed ? '#605e5c' : '#0078d4', flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
                        <DocumentTextRegular />
                      </span>
                    ) : (
                      <span style={{ fontSize: '16px', color: todo.completed ? '#605e5c' : '#0078d4', flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
                        <DocumentRegular />
                      </span>
                    )}
                    <Body1
                      style={{
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: todo.completed ? '#605e5c' : '#323130',
                        fontWeight: selectedTodoId === todo.id ? '600' : '400',
                        fontSize: '14px',
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {todo.title}
                    </Body1>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <Body1
                      style={{
                        fontSize: '12px',
                        color: '#605e5c',
                        minWidth: '80px',
                        textAlign: 'right',
                      }}
                    >
                      {todo.author || '-'}
                    </Body1>
                    <Body1
                      style={{
                        fontSize: '12px',
                        color: '#605e5c',
                        minWidth: '140px',
                        textAlign: 'right',
                      }}
                    >
                      {todo.publishedAt ? new Date(todo.publishedAt).toLocaleString('ja-JP', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : '-'}
                    </Body1>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', opacity: 0 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}>
                    <Button
                      appearance="subtle"
                      icon={<DeleteRegular />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(todo.id);
                      }}
                      size="small"
                      title="削除"
                      style={{ minWidth: '28px', padding: '4px' }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <TodoDialog
        mode={dialogMode}
        todoId={dialogTodoId}
        onClose={handleCloseDialog}
        onModeChange={(mode) => {
          setDialogMode(mode);
        }}
        onTodoChange={handleTodoChange}
        onAdd={handleAdd}
        onEdit={() => {
          if (dialogTodoId) {
            handleEdit(dialogTodoId);
          }
        }}
        onDelete={() => {
          if (dialogTodoId) {
            handleDelete(dialogTodoId);
          }
        }}
      />
    </div>
  );
};
