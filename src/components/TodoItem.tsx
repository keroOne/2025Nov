import React, { useState } from 'react';
import type { Todo } from '../types/todo';
import { useTodo } from '../contexts/TodoContext';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { updateTodo, deleteTodo, toggleTodo } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await toggleTodo(todo.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(todo.text);
  };

  const handleSave = async () => {
    if (!editText.trim()) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateTodo(todo.id, { text: editText.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update todo:', error);
      alert('Todoの更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(todo.text);
  };

  const handleDelete = async () => {
    if (window.confirm('このTodoを削除しますか？')) {
      setIsUpdating(true);
      try {
        await deleteTodo(todo.id);
      } catch (error) {
        console.error('Failed to delete todo:', error);
        alert('Todoの削除に失敗しました');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${isUpdating ? 'updating' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        className="todo-checkbox"
        disabled={isUpdating}
      />
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="todo-edit-input"
          autoFocus
          disabled={isUpdating}
        />
      ) : (
        <span 
          className="todo-text" 
          onDoubleClick={handleEdit}
        >
          {todo.text}
        </span>
      )}
      <div className="todo-actions">
        {!isEditing && (
          <>
            <button 
              onClick={handleEdit}
              className="todo-edit-btn"
              disabled={isUpdating}
              title="編集"
            >
              ✏️
            </button>
            <button 
              onClick={handleDelete}
              className="todo-delete-btn"
              disabled={isUpdating}
              title="削除"
            >
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  );
};

