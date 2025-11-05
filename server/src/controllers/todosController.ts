import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { prismaTodoToApiTodo } from '../utils/todoConverter.js';
import type { CreateTodoRequest, UpdateTodoRequest } from '../types/todo.js';

/**
 * 全Todo取得
 */
export async function getAllTodos(req: Request, res: Response) {
  try {
    const todos = await prisma.todo.findMany({
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
    const { text } = req.body as CreateTodoRequest;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        error: { message: 'Text is required and must be a non-empty string' },
      });
    }
    
    const todo = await prisma.todo.create({
      data: {
        text: text.trim(),
        completed: false,
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
    const { text, completed } = req.body as UpdateTodoRequest;
    
    const updateData: { text?: string; completed?: boolean } = {};
    
    if (text !== undefined) {
      if (typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({
          error: { message: 'Text must be a non-empty string' },
        });
      }
      updateData.text = text.trim();
    }
    
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({
          error: { message: 'Completed must be a boolean' },
        });
      }
      updateData.completed = completed;
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

