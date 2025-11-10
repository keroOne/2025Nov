import type { Todo } from '../types/todo.js';
import type { Prisma } from '@prisma/client';

// PrismaのTodo型（データベースから取得）
type PrismaTodo = Prisma.TodoGetPayload<{}>;

/**
 * PrismaのTodoをAPI用のTodoに変換
 */
export function prismaTodoToApiTodo(prismaTodo: PrismaTodo): Todo {
  return {
    id: prismaTodo.id,
    categoryId: prismaTodo.categoryId,
    title: prismaTodo.title,
    content: prismaTodo.content,
    completed: prismaTodo.completed,
    author: prismaTodo.author || undefined,
    publishedAt: prismaTodo.publishedAt ? prismaTodo.publishedAt.getTime() : undefined,
    createdAt: prismaTodo.createdAt.getTime(),
    updatedAt: prismaTodo.updatedAt.getTime(),
  };
}
