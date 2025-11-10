import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Input, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui/react-components';
import { AddRegular, DeleteRegular, EditRegular, ChevronRightRegular, ChevronDownRegular, MoreVerticalRegular, FolderRegular, FolderOpenRegular } from '@fluentui/react-icons';
import { useCategory } from '../contexts/CategoryContext';
import { CookieUtil } from '../utils/cookie';

interface CategoryTreeItemProps {
  category: {
    id: string;
    name: string;
    children: CategoryTreeItemProps['category'][];
  };
  level: number;
  expandedState: Record<string, boolean>;
  onExpandedChange: (categoryId: string, expanded: boolean) => void;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({ category, level, expandedState, onExpandedChange }) => {
  const { selectedCategoryId, setSelectedCategoryId, deleteCategory, addCategory, updateCategory } = useCategory();
  const isExpanded = expandedState[category.id] ?? true;
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [newName, setNewName] = useState('');
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const isSelected = selectedCategoryId === category.id;
  const hasChildren = category.children.length > 0;

  // 編集モードに入ったときにフォーカスを設定
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleSelect = () => {
    if (!isEditing) {
      setSelectedCategoryId(category.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      setIsEditing(true);
      setEditName(category.name);
    }
  };

  const handleEditSave = async () => {
    if (!editName.trim()) {
      setIsEditing(false);
      setEditName(category.name);
      return;
    }
    try {
      await updateCategory(category.id, { name: editName.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update category:', error);
      alert('カテゴリの更新に失敗しました');
      setIsEditing(false);
      setEditName(category.name);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditName(category.name);
  };

  const handleBlur = () => {
    // フォーカスが移動したときに保存
    if (isEditing) {
      handleEditSave();
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`カテゴリ「${category.name}」を削除しますか？`)) {
      try {
        await deleteCategory(category.id);
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('カテゴリの削除に失敗しました');
      }
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      setIsAdding(false);
      return;
    }
    try {
      await addCategory(newName.trim(), category.id);
      setNewName('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('カテゴリの追加に失敗しました');
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 右クリック位置を取得してコンテキストメニューを表示
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 12px',
          backgroundColor: isSelected ? '#e1f5fe' : 'transparent',
          cursor: 'pointer',
          marginLeft: `${level * 20}px`,
          borderRadius: '4px',
          transition: 'background-color 0.15s ease',
          lineHeight: '1.5',
          minHeight: '21px', // 14px * 1.5 = 21px
        }}
        onClick={handleSelect}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => {
          if (!isSelected && containerRef.current) {
            containerRef.current.style.backgroundColor = '#f3f2f1';
          }
        }}
        onMouseLeave={(e) => {
          // 展開/折りたたみボタンにマウスが移動した場合は背景色をリセットしない
          const target = e.relatedTarget as HTMLElement;
          if (target && containerRef.current && containerRef.current.contains(target)) {
            return;
          }
          if (!isSelected && containerRef.current) {
            containerRef.current.style.backgroundColor = 'transparent';
          }
        }}
      >
        {hasChildren ? (
          <Button
            appearance="subtle"
            icon={isExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
            onClick={(e) => {
              e.stopPropagation();
              onExpandedChange(category.id, !isExpanded);
              // 親要素の背景色をリセット（少し遅延を入れて確実にリセット）
              setTimeout(() => {
                if (containerRef.current && !isSelected) {
                  containerRef.current.style.backgroundColor = 'transparent';
                }
              }, 0);
            }}
            onMouseEnter={(e) => {
              e.stopPropagation();
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              // ボタンからマウスが離れたときに親要素の背景色をリセット
              if (containerRef.current && !isSelected) {
                containerRef.current.style.backgroundColor = 'transparent';
              }
            }}
            size="small"
            style={{ minWidth: '24px', padding: '4px' }}
          />
        ) : (
          <div style={{ width: '24px' }} />
        )}
        {isEditing ? (
          <Input
            ref={editInputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleEditSave();
              } else if (e.key === 'Escape') {
                handleEditCancel();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            size="small"
            style={{ flex: 1, fontSize: '13px' }}
          />
        ) : (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: 1,
              fontSize: '14px',
              fontWeight: isSelected ? '600' : '400',
              color: isSelected ? '#0078d4' : '#323130',
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <span style={{ fontSize: '16px', color: '#0078d4', display: 'inline-flex', alignItems: 'center' }}>
                  <FolderOpenRegular />
                </span>
              ) : (
                <span style={{ fontSize: '16px', color: '#0078d4', display: 'inline-flex', alignItems: 'center' }}>
                  <FolderRegular />
                </span>
              )
            ) : (
              <span style={{ fontSize: '16px', color: '#605e5c', display: 'inline-flex', alignItems: 'center' }}>
                <FolderRegular />
              </span>
            )}
            {category.name}
          </span>
        )}
        {!isEditing && (
          <div 
            style={{ display: 'flex', gap: '2px', opacity: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
            onClick={(e) => e.stopPropagation()}
          >
            <Menu open={contextMenuOpen && !contextMenuPosition} onOpenChange={(_, data) => {
              if (!data.open) {
                setContextMenuOpen(false);
                setContextMenuPosition(null);
              } else {
                setContextMenuOpen(data.open);
              }
            }}>
              <MenuTrigger disableButtonEnhancement>
                <Button
                  appearance="subtle"
                  icon={<MoreVerticalRegular />}
                  size="small"
                  title="メニュー"
                  style={{ minWidth: '28px', padding: '4px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenuPosition(null);
                    setContextMenuOpen(true);
                  }}
                />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem
                    icon={<FolderRegular />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenuOpen(false);
                      setContextMenuPosition(null);
                      setIsAdding(true);
                    }}
                  >
                    子の追加...
                  </MenuItem>
                  <MenuItem
                    icon={<EditRegular />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenuOpen(false);
                      setContextMenuPosition(null);
                      setIsEditing(true);
                      setEditName(category.name);
                    }}
                  >
                    編集...
                  </MenuItem>
                  <MenuItem
                    icon={<DeleteRegular />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenuOpen(false);
                      setContextMenuPosition(null);
                      handleDelete();
                    }}
                  >
                    削除...
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        )}
      </div>
      {contextMenuOpen && contextMenuPosition && (
        <Menu open={contextMenuOpen} onOpenChange={(_, data) => {
          if (!data.open) {
            setContextMenuOpen(false);
            setContextMenuPosition(null);
          } else {
            setContextMenuOpen(data.open);
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
              <MenuItem
                icon={<FolderRegular />}
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenuOpen(false);
                  setContextMenuPosition(null);
                  setIsAdding(true);
                }}
              >
                子の追加...
              </MenuItem>
              <MenuItem
                icon={<EditRegular />}
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenuOpen(false);
                  setContextMenuPosition(null);
                  setIsEditing(true);
                  setEditName(category.name);
                }}
              >
                編集...
              </MenuItem>
              <MenuItem
                icon={<DeleteRegular />}
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenuOpen(false);
                  setContextMenuPosition(null);
                  handleDelete();
                }}
              >
                削除...
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      )}
      {isAdding && (
        <div style={{ paddingLeft: `${(level + 1) * 20 + 24}px`, marginTop: '4px', marginBottom: '4px' }}>
          <Input
            ref={inputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="カテゴリ名"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAdd();
              } else if (e.key === 'Escape') {
                setIsAdding(false);
                setNewName('');
              }
            }}
            onBlur={() => {
              // フォーカスが移動したときに追加をキャンセル
              if (newName.trim() === '') {
                setIsAdding(false);
                setNewName('');
              }
            }}
            autoFocus
            size="small"
            style={{ fontSize: '13px' }}
          />
        </div>
      )}
      {isExpanded && hasChildren && (
        <div>
          {category.children.map((child) => (
            <CategoryTreeItem 
              key={child.id} 
              category={child} 
              level={level + 1}
              expandedState={expandedState}
              onExpandedChange={onExpandedChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const COOKIE_KEY = 'category-tree-expanded-state';

export const CategoryTree: React.FC = () => {
  const { categories, addCategory } = useCategory();
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>(() => {
    // Cookieから開閉状態を復元
    try {
      const saved = CookieUtil.get(COOKIE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
      }
    } catch (error) {
      console.error('Failed to load expanded state from cookie:', error);
    }
    return {};
  });

  // 開閉状態をCookieに保存
  const saveExpandedState = useCallback((state: Record<string, boolean>) => {
    try {
      // 現在存在するカテゴリIDのみを保存（削除されたカテゴリの状態は削除）
      const allCategoryIds = new Set<string>();
      const collectIds = (cats: typeof categories) => {
        cats.forEach(cat => {
          allCategoryIds.add(cat.id);
          collectIds(cat.children);
        });
      };
      collectIds(categories);

      // 存在するカテゴリの状態のみを保存
      const filteredState: Record<string, boolean> = {};
      Object.keys(state).forEach(id => {
        if (allCategoryIds.has(id)) {
          filteredState[id] = state[id];
        }
      });

      CookieUtil.set(COOKIE_KEY, JSON.stringify(filteredState));
    } catch (error) {
      console.error('Failed to save expanded state to cookie:', error);
    }
  }, [categories]);

  // 開閉状態を更新
  const handleExpandedChange = useCallback((categoryId: string, expanded: boolean) => {
    setExpandedState(prev => {
      const newState = { ...prev, [categoryId]: expanded };
      // 次のレンダリングサイクルでCookieに保存
      setTimeout(() => saveExpandedState(newState), 0);
      return newState;
    });
  }, [saveExpandedState]);

  // カテゴリが変更されたときに開閉状態を更新（新規カテゴリはデフォルトで開く）
  useEffect(() => {
    const allCategoryIds = new Set<string>();
    const collectIds = (cats: typeof categories) => {
      cats.forEach(cat => {
        allCategoryIds.add(cat.id);
        collectIds(cat.children);
      });
    };
    collectIds(categories);

    // 新規カテゴリが追加された場合はデフォルトで開く
    setExpandedState(prev => {
      let updated = false;
      const newState = { ...prev };
      allCategoryIds.forEach(id => {
        if (!(id in newState)) {
          newState[id] = true; // デフォルトで開く
          updated = true;
        }
      });
      if (updated) {
        // 次のレンダリングサイクルでCookieに保存
        setTimeout(() => {
          const allCategoryIdsForSave = new Set<string>();
          const collectIdsForSave = (cats: typeof categories) => {
            cats.forEach(cat => {
              allCategoryIdsForSave.add(cat.id);
              collectIdsForSave(cat.children);
            });
          };
          collectIdsForSave(categories);

          const filteredState: Record<string, boolean> = {};
          Object.keys(newState).forEach(id => {
            if (allCategoryIdsForSave.has(id)) {
              filteredState[id] = newState[id];
            }
          });
          CookieUtil.set(COOKIE_KEY, JSON.stringify(filteredState));
        }, 0);
      }
      return newState;
    });
  }, [categories]);

  const handleAddRoot = async () => {
    if (!newName.trim()) {
      setIsAddingRoot(false);
      return;
    }
    try {
      await addCategory(newName.trim(), null);
      setNewName('');
      setIsAddingRoot(false);
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('カテゴリの追加に失敗しました');
    }
  };

  return (
    <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#323130' }}>カテゴリ</h3>
        <Button
          appearance="primary"
          icon={<AddRegular />}
          onClick={() => setIsAddingRoot(true)}
          size="small"
          style={{ minWidth: 'auto' }}
        >
          追加
        </Button>
      </div>
      {isAddingRoot && (
        <div style={{ marginBottom: '16px' }}>
          <Input
            ref={inputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="カテゴリ名"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddRoot();
              } else if (e.key === 'Escape') {
                setIsAddingRoot(false);
                setNewName('');
              }
            }}
            onBlur={() => {
              // フォーカスが移動したときに追加をキャンセル
              if (newName.trim() === '') {
                setIsAddingRoot(false);
                setNewName('');
              }
            }}
            autoFocus
            size="small"
            style={{ fontSize: '13px' }}
          />
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {categories.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#605e5c', fontSize: '14px' }}>
            カテゴリがありません
          </div>
        ) : (
          categories.map((category) => (
            <CategoryTreeItem 
              key={category.id} 
              category={category} 
              level={0}
              expandedState={expandedState}
              onExpandedChange={handleExpandedChange}
            />
          ))
        )}
      </div>
    </div>
  );
};
