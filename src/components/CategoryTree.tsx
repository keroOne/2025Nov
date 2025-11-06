import React, { useState } from 'react';
import { Button, Input } from '@fluentui/react-components';
import { AddRegular, DeleteRegular, ChevronRightRegular, ChevronDownRegular } from '@fluentui/react-icons';
import { useCategory } from '../contexts/CategoryContext';

interface CategoryTreeItemProps {
  category: {
    id: string;
    name: string;
    children: CategoryTreeItemProps['category'][];
  };
  level: number;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({ category, level }) => {
  const { selectedCategoryId, setSelectedCategoryId, deleteCategory, addCategory } = useCategory();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const isSelected = selectedCategoryId === category.id;
  const hasChildren = category.children.length > 0;

  const handleSelect = () => {
    setSelectedCategoryId(category.id);
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

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 12px',
          backgroundColor: isSelected ? '#e1f5fe' : 'transparent',
          cursor: 'pointer',
          marginLeft: `${level * 20}px`,
          borderRadius: '4px',
          transition: 'background-color 0.15s ease',
        }}
        onClick={handleSelect}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = '#f3f2f1';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {hasChildren ? (
          <Button
            appearance="subtle"
            icon={isExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            size="small"
            style={{ minWidth: '24px', padding: '4px' }}
          />
        ) : (
          <div style={{ width: '24px' }} />
        )}
        <span
          style={{
            flex: 1,
            fontSize: '14px',
            fontWeight: isSelected ? '600' : '400',
            color: isSelected ? '#0078d4' : '#323130',
          }}
        >
          {category.name}
        </span>
        <div style={{ display: 'flex', gap: '2px', opacity: 0 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }} onClick={(e) => e.stopPropagation()}>
          <Button
            appearance="subtle"
            icon={<AddRegular />}
            onClick={(e) => {
              e.stopPropagation();
              setIsAdding(true);
            }}
            size="small"
            title="サブカテゴリを追加"
            style={{ minWidth: '28px', padding: '4px' }}
          />
          <Button
            appearance="subtle"
            icon={<DeleteRegular />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            size="small"
            title="削除"
            style={{ minWidth: '28px', padding: '4px' }}
          />
        </div>
      </div>
      {isAdding && (
        <div style={{ paddingLeft: `${(level + 1) * 20 + 24}px`, marginTop: '4px', marginBottom: '4px' }}>
          <Input
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
            autoFocus
            size="small"
            style={{ fontSize: '13px' }}
          />
        </div>
      )}
      {isExpanded && hasChildren && (
        <div>
          {category.children.map((child) => (
            <CategoryTreeItem key={child.id} category={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTree: React.FC = () => {
  const { categories, addCategory } = useCategory();
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newName, setNewName] = useState('');

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
            <CategoryTreeItem key={category.id} category={category} level={0} />
          ))
        )}
      </div>
    </div>
  );
};
