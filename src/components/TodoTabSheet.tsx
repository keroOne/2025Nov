import React, { useState } from 'react';
import { TabList, Tab } from '@fluentui/react-components';
import { TodoListView } from './TodoListView';
import { TodoSearchView } from './TodoSearchView';
import type { Todo } from '../types/todo';

interface TodoTabSheetProps {
  onSelectTodo: (todo: Todo | null) => void;
  selectedTodoId: string | null;
}

export const TodoTabSheet: React.FC<TodoTabSheetProps> = ({ onSelectTodo, selectedTodoId }) => {
  const [selectedTab, setSelectedTab] = useState<'recent' | 'search'>('recent');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>
      <TabList selectedValue={selectedTab} onTabSelect={(_, data) => setSelectedTab(data.value as 'recent' | 'search')}>
        <Tab value="recent">新着</Tab>
        <Tab value="search">検索</Tab>
      </TabList>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {selectedTab === 'recent' && (
          <TodoListView
            onSelectTodo={onSelectTodo}
            selectedTodoId={selectedTodoId}
            sortBy="updatedAt"
          />
        )}
        {selectedTab === 'search' && (
          <TodoSearchView
            onSelectTodo={onSelectTodo}
            selectedTodoId={selectedTodoId}
          />
        )}
      </div>
    </div>
  );
};

