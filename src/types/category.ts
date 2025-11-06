export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
  todoCount?: number;
}

