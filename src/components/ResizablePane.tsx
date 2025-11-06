import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ResizablePaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  direction: 'horizontal' | 'vertical';
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  cookieKey?: string;
  onResize?: (size: number) => void;
}

export const ResizablePane: React.FC<ResizablePaneProps> = ({
  left,
  right,
  direction,
  defaultSize = 300,
  minSize = 100,
  maxSize,
  cookieKey,
  onResize,
}) => {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHorizontal = direction === 'horizontal';

  // Cookieからサイズを復元
  useEffect(() => {
    if (cookieKey) {
      const savedSize = parseFloat(
        document.cookie
          .split('; ')
          .find(row => row.startsWith(`${cookieKey}=`))
          ?.split('=')[1] || ''
      );
      if (!isNaN(savedSize) && savedSize >= minSize && (!maxSize || savedSize <= maxSize)) {
        setSize(savedSize);
      }
    }
  }, [cookieKey, minSize, maxSize]);

  // Cookieにサイズを保存
  const saveSize = useCallback((newSize: number) => {
    if (cookieKey) {
      const expires = new Date();
      expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000); // 1年
      document.cookie = `${cookieKey}=${newSize};expires=${expires.toUTCString()};path=/`;
    }
  }, [cookieKey]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let newSize: number;

    if (isHorizontal) {
      newSize = e.clientX - containerRect.left;
    } else {
      newSize = e.clientY - containerRect.top;
    }

    // 最小・最大サイズの制限
    if (newSize < minSize) newSize = minSize;
    if (maxSize && newSize > maxSize) newSize = maxSize;

    setSize(newSize);
    saveSize(newSize);
    onResize?.(newSize);
  }, [isResizing, isHorizontal, minSize, maxSize, saveSize, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp, isHorizontal]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        height: '100%',
        width: '100%',
        position: 'relative',
      }}
    >
      <div
        style={{
          [isHorizontal ? 'width' : 'height']: `${size}px`,
          [isHorizontal ? 'height' : 'width']: '100%',
          overflow: 'auto',
          flexShrink: 0,
        }}
      >
        {left}
      </div>
      <div
        onMouseDown={handleMouseDown}
        style={{
          [isHorizontal ? 'width' : 'height']: '4px',
          [isHorizontal ? 'height' : 'width']: '100%',
          backgroundColor: isResizing ? '#0078d4' : '#edebe9',
          cursor: isHorizontal ? 'col-resize' : 'row-resize',
          flexShrink: 0,
          position: 'relative',
          transition: isResizing ? 'none' : 'background-color 0.2s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            [isHorizontal ? 'left' : 'top']: '50%',
            [isHorizontal ? 'top' : 'left']: '50%',
            transform: 'translate(-50%, -50%)',
            [isHorizontal ? 'width' : 'height']: '20px',
            [isHorizontal ? 'height' : 'width']: '20px',
            borderRadius: '50%',
            backgroundColor: '#c8c6c4',
            opacity: isResizing ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {right}
      </div>
    </div>
  );
};

