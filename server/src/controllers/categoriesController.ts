import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { prismaCategoryToApiCategory, buildCategoryTree } from '../utils/categoryConverter.js';
import type { CreateCategoryRequest, UpdateCategoryRequest } from '../types/category.js';

/**
 * 全カテゴリ取得（階層構造）
 */
export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    
    const apiCategories = categories.map(prismaCategoryToApiCategory);
    const tree = buildCategoryTree(apiCategories);
    
    res.json(tree);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: { message: 'Failed to get categories' } });
  }
}

/**
 * 全カテゴリ取得（フラットリスト）
 */
export async function getCategoriesFlat(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    
    const apiCategories = categories.map(prismaCategoryToApiCategory);
    res.json(apiCategories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: { message: 'Failed to get categories' } });
  }
}

/**
 * 単一カテゴリ取得
 */
export async function getCategoryById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            todos: true,
            children: true,
          },
        },
      },
    });
    
    if (!category) {
      return res.status(404).json({ error: { message: 'Category not found' } });
    }
    
    const apiCategory = prismaCategoryToApiCategory(category);
    res.json({
      ...apiCategory,
      todoCount: category._count.todos,
      childrenCount: category._count.children,
    });
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({ error: { message: 'Failed to get category' } });
  }
}

/**
 * カテゴリ作成
 */
export async function createCategory(req: Request, res: Response) {
  try {
    const { name, parentId } = req.body as CreateCategoryRequest;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: { message: 'Name is required and must be a non-empty string' },
      });
    }
    
    // 親カテゴリの存在確認
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        return res.status(400).json({
          error: { message: 'Parent category not found' },
        });
      }
    }
    
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        parentId: parentId || null,
      },
    });
    
    res.status(201).json(prismaCategoryToApiCategory(category));
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: { message: 'Failed to create category' } });
  }
}

/**
 * カテゴリ更新
 */
export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body as UpdateCategoryRequest;
    
    const updateData: { name?: string; parentId?: string | null } = {};
    
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          error: { message: 'Name must be a non-empty string' },
        });
      }
      updateData.name = name.trim();
    }
    
    if (parentId !== undefined) {
      // 自分自身を親にすることはできない
      if (parentId === id) {
        return res.status(400).json({
          error: { message: 'Category cannot be its own parent' },
        });
      }
      
      // 親カテゴリの存在確認
      if (parentId) {
        const parent = await prisma.category.findUnique({
          where: { id: parentId },
        });
        if (!parent) {
          return res.status(400).json({
            error: { message: 'Parent category not found' },
          });
        }
      }
      
      updateData.parentId = parentId || null;
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: { message: 'No fields to update' },
      });
    }
    
    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });
    
    res.json(prismaCategoryToApiCategory(category));
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Category not found' } });
    }
    console.error('Error updating category:', error);
    res.status(500).json({ error: { message: 'Failed to update category' } });
  }
}

/**
 * カテゴリ削除
 * 子カテゴリやTodoはCASCADEで自動削除される
 */
export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id },
    });
    
    if (!category) {
      return res.status(404).json({ error: { message: 'Category not found' } });
    }
    
    // CASCADEで子カテゴリとTodoが自動削除される
    await prisma.category.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Category not found' } });
    }
    console.error('Error deleting category:', error);
    res.status(500).json({ error: { message: 'Failed to delete category' } });
  }
}

