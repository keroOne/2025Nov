import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import type { Category, CategoryWithChildren } from '../types/category';
import type { IStorage } from '../storage/IStorage';
import { RestApiAdapter } from '../storage/RestApiAdapter';

interface CategoryContextType {
  categories: CategoryWithChildren[];
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  addCategory: (name: string, parentId?: string | null) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
  loading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

interface CategoryProviderProps {
  children: ReactNode;
  storage?: IStorage;
}

export const CategoryProvider: React.FC<CategoryProviderProps> = ({ 
  children, 
  storage: externalStorage,
}) => {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // storageをメモ化して、毎回新しいインスタンスが作成されないようにする
  const storage = useMemo(() => externalStorage || new RestApiAdapter(), [externalStorage]);

  const refreshCategories = useCallback(async () => {
    try {
      setLoading(true);
      const loadedCategories = await storage.getAllCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  }, [storage]);

  // 初期データの読み込み
  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  // カテゴリを追加
  const addCategory = async (name: string, parentId?: string | null) => {
    const newCategory: Category = {
      id: '',
      name: name.trim(),
      parentId: parentId || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await storage.saveCategory(newCategory);
      await refreshCategories();
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    }
  };

  // カテゴリを更新
  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const category = findCategoryById(categories, id);
      if (!category) return;

      const updatedCategory: Category = {
        id: category.id,
        name: category.name,
        parentId: category.parentId,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        ...updates,
        updatedAt: Date.now(),
      };

      await storage.saveCategory(updatedCategory);
      await refreshCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  };

  // カテゴリを削除
  const deleteCategory = async (id: string) => {
    try {
      await storage.deleteCategory(id);
      await refreshCategories();
      // 削除されたカテゴリが選択されていた場合は選択を解除
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  };

  // カテゴリをIDで検索（階層構造内）
  const findCategoryById = (
    cats: CategoryWithChildren[],
    id: string
  ): CategoryWithChildren | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      const found = findCategoryById(cat.children, id);
      if (found) return found;
    }
    return null;
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        selectedCategoryId,
        setSelectedCategoryId,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshCategories,
        loading,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};

