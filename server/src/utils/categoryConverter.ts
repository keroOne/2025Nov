import type { Category, CategoryWithChildren } from '../types/category.js';
import type { Prisma } from '@prisma/client';

// PrismaのCategory型（データベースから取得）
type PrismaCategory = Prisma.CategoryGetPayload<{}>;

/**
 * PrismaのCategoryをAPI用のCategoryに変換
 */
export function prismaCategoryToApiCategory(prismaCategory: PrismaCategory): Category {
  return {
    id: prismaCategory.id,
    name: prismaCategory.name,
    parentId: prismaCategory.parentId,
    createdAt: prismaCategory.createdAt.getTime(),
    updatedAt: prismaCategory.updatedAt.getTime(),
  };
}

/**
 * カテゴリリストを階層構造に変換
 */
export function buildCategoryTree(
  categories: Category[],
  parentId: string | null = null
): CategoryWithChildren[] {
  return categories
    .filter(cat => cat.parentId === parentId)
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(categories, cat.id),
    }));
}

