import React, { useState } from 'react';
import { useTodo } from '../contexts/TodoContext';

export const TodoForm: React.FC = () => {
  const [text, setText] = useState('');
  const { addTodo } = useTodo();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addTodo(text);
      setText('');
    } catch (error) {
      console.error('Failed to add todo:', error);
      alert('Todoの追加に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="新しいTodoを入力..."
        className="todo-input"
        disabled={isSubmitting}
      />
      <button 
        type="submit" 
        className="todo-submit-btn"
        disabled={isSubmitting || !text.trim()}
      >
        {isSubmitting ? '追加中...' : '追加'}
      </button>
    </form>
  );
};

