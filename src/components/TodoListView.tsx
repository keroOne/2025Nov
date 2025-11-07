import React, { useState } from 'react';
import { Card, Button, Checkbox, Input, Body1, Spinner, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui/react-components';
import { AddRegular, DeleteRegular, DocumentRegular, DocumentTextRegular } from '@fluentui/react-icons';
import { useTodo } from '../contexts/TodoContext';
import { useCategory } from '../contexts/CategoryContext';
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
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const selectedCategory = selectedCategoryId && categories.length > 0
    ? findCategoryById(categories, selectedCategoryId)
    : null;

  const handleAdd = async () => {
    console.log('handleAdd called:', { newTitle, newContent, selectedCategoryId });
    if (!newTitle.trim()) {
      console.log('Title is empty');
      alert('タイトルを入力してください');
      return;
    }
    if (!selectedCategoryId) {
      console.log('No category selected');
      alert('カテゴリを選択してください');
      return;
    }
    try {
      console.log('Calling addTodo...');
      await addTodo(selectedCategoryId, newTitle.trim(), newContent.trim());
      console.log('addTodo completed');
      setNewTitle('');
      setNewContent('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add todo:', error);
      alert('Todoの追加に失敗しました: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('このTodoを削除しますか？')) {
      try {
        await deleteTodo(id);
        if (selectedTodoId === id) {
          onSelectTodo(null);
        }
      } catch (error) {
        console.error('Failed to delete todo:', error);
        alert('Todoの削除に失敗しました');
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedCategoryId) return;
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  const handleAddFromMenu = () => {
    setContextMenuOpen(false);
    setIsAdding(true);
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
        onContextMenu={handleContextMenu}
      >
        <h3 
          style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#323130', cursor: 'context-menu' }}
          onContextMenu={handleContextMenu}
        >
          {selectedCategory?.name || 'Todo'}
        </h3>
        <Button
          appearance="primary"
          icon={<AddRegular />}
          onClick={() => setIsAdding(true)}
          size="small"
          style={{ minWidth: 'auto' }}
        >
          Todo追加
        </Button>
      </div>
      {contextMenuOpen && contextMenuPosition && (
        <Menu open={contextMenuOpen} onOpenChange={(_, data) => setContextMenuOpen(data.open)}>
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
              <MenuItem
                icon={<DocumentRegular />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFromMenu();
                }}
              >
                追加...
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      )}
      {isAdding && (
        <Card style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#faf9f8', border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="タイトル"
              autoFocus
              size="medium"
            />
            <Input
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="内容"
              size="medium"
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button onClick={handleAdd} appearance="primary" size="small">
                追加
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false);
                  setNewTitle('');
                  setNewContent('');
                }}
                size="small"
              >
                キャンセル
              </Button>
            </div>
          </div>
        </Card>
      )}
      <div 
        style={{ flex: 1, overflow: 'auto' }}
        onContextMenu={handleContextMenu}
      >
        {filteredTodos.length === 0 ? (
          <div 
            style={{ padding: '24px', textAlign: 'center', color: '#605e5c', fontSize: '14px', minHeight: '200px' }}
            onContextMenu={handleContextMenu}
          >
            Todoがありません
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredTodos.map((todo) => (
              <Card
                key={todo.id}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: selectedTodoId === todo.id ? '#e1f5fe' : '#ffffff',
                  border: selectedTodoId === todo.id ? '1px solid #0078d4' : '1px solid #edebe9',
                  borderRadius: '4px',
                  boxShadow: selectedTodoId === todo.id ? '0 2px 4px rgba(0,120,212,0.2)' : 'none',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => onSelectTodo(todo)}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      }}
                    >
                      {todo.title}
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
    </div>
  );
};
