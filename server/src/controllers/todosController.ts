import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { prismaTodoToApiTodo } from '../utils/todoConverter.js';
import type { CreateTodoRequest, UpdateTodoRequest } from '../types/todo.js';

/**
 * 全Todo取得
 */
export async function getAllTodos(req: Request, res: Response) {
  try {
    const { categoryId } = req.query;
    
    const where: { categoryId?: string } = {};
    if (categoryId && typeof categoryId === 'string') {
      where.categoryId = categoryId;
    }
    
    const todos = await prisma.todo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    const apiTodos = todos.map(prismaTodoToApiTodo);
    res.json(apiTodos);
  } catch (error) {
    console.error('Error getting todos:', error);
    res.status(500).json({ error: { message: 'Failed to get todos' } });
  }
}

/**
 * 単一Todo取得
 */
export async function getTodoById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const todo = await prisma.todo.findUnique({
      where: { id },
    });
    
    if (!todo) {
      return res.status(404).json({ error: { message: 'Todo not found' } });
    }
    
    res.json(prismaTodoToApiTodo(todo));
  } catch (error) {
    console.error('Error getting todo:', error);
    res.status(500).json({ error: { message: 'Failed to get todo' } });
  }
}

/**
 * Todo作成
 */
export async function createTodo(req: Request, res: Response) {
  try {
    const { categoryId, title, content, author, publishedAt } = req.body as CreateTodoRequest;
    
    if (!categoryId || typeof categoryId !== 'string') {
      return res.status(400).json({
        error: { message: 'CategoryId is required' },
      });
    }
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        error: { message: 'Title is required and must be a non-empty string' },
      });
    }
    
    // カテゴリの存在確認
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return res.status(400).json({
        error: { message: 'Category not found' },
      });
    }
    
    const todo = await prisma.todo.create({
      data: {
        categoryId,
        title: title.trim(),
        content: (content || '').trim(),
        completed: false,
        author: author ? author.trim() : null,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    });
    
    res.status(201).json(prismaTodoToApiTodo(todo));
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: { message: 'Failed to create todo' } });
  }
}

/**
 * Todo更新
 */
export async function updateTodo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { categoryId, title, content, completed, author, publishedAt } = req.body as UpdateTodoRequest;
    
    const updateData: { 
      categoryId?: string; 
      title?: string; 
      content?: string; 
      completed?: boolean;
      author?: string | null;
      publishedAt?: Date | null;
    } = {};
    
    if (categoryId !== undefined) {
      if (typeof categoryId !== 'string') {
        return res.status(400).json({
          error: { message: 'CategoryId must be a string' },
        });
      }
      // カテゴリの存在確認
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return res.status(400).json({
          error: { message: 'Category not found' },
        });
      }
      updateData.categoryId = categoryId;
    }
    
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          error: { message: 'Title must be a non-empty string' },
        });
      }
      updateData.title = title.trim();
    }
    
    if (content !== undefined) {
      if (typeof content !== 'string') {
        return res.status(400).json({
          error: { message: 'Content must be a string' },
        });
      }
      updateData.content = content.trim();
    }
    
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({
          error: { message: 'Completed must be a boolean' },
        });
      }
      updateData.completed = completed;
    }
    
    if (author !== undefined) {
      if (author !== null && typeof author !== 'string') {
        return res.status(400).json({
          error: { message: 'Author must be a string or null' },
        });
      }
      updateData.author = author ? author.trim() : null;
    }
    
    if (publishedAt !== undefined) {
      if (publishedAt !== null && typeof publishedAt !== 'number') {
        return res.status(400).json({
          error: { message: 'PublishedAt must be a number (Unix timestamp) or null' },
        });
      }
      updateData.publishedAt = publishedAt ? new Date(publishedAt) : null;
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: { message: 'No fields to update' },
      });
    }
    
    const todo = await prisma.todo.update({
      where: { id },
      data: updateData,
    });
    
    res.json(prismaTodoToApiTodo(todo));
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Todo not found' } });
    }
    console.error('Error updating todo:', error);
    res.status(500).json({ error: { message: 'Failed to update todo' } });
  }
}

/**
 * Todo削除
 */
export async function deleteTodo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    await prisma.todo.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Todo not found' } });
    }
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: { message: 'Failed to delete todo' } });
  }
}

/**
 * 全Todo削除
 */
export async function deleteAllTodos(req: Request, res: Response) {
  try {
    await prisma.todo.deleteMany();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting all todos:', error);
    res.status(500).json({ error: { message: 'Failed to delete all todos' } });
  }
}

