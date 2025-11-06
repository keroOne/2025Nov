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
          gap: '8px',
          padding: '4px 8px',
          backgroundColor: isSelected ? '#e1f5fe' : 'transparent',
          cursor: 'pointer',
          borderRadius: '4px',
          marginLeft: `${level * 16}px`,
        }}
        onClick={handleSelect}
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
          />
        ) : (
          <div style={{ width: '24px' }} />
        )}
        <span style={{ flex: 1 }}>{category.name}</span>
        <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
          <Button
            appearance="subtle"
            icon={<AddRegular />}
            onClick={(e) => {
              e.stopPropagation();
              setIsAdding(true);
            }}
            size="small"
            title="サブカテゴリを追加"
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
          />
        </div>
      </div>
      {isAdding && (
        <div style={{ paddingLeft: `${(level + 1) * 16 + 24}px`, marginTop: '4px', marginBottom: '4px' }}>
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
    <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>カテゴリ</h3>
        <Button
          appearance="primary"
          icon={<AddRegular />}
          onClick={() => setIsAddingRoot(true)}
          size="small"
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
          />
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {categories.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#605e5c' }}>
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
