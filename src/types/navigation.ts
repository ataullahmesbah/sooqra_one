export interface NavigationItem {
  _id: string;
  title: string;
  slug: string;
  type: 'link' | 'dropdown';
  order: number;
  isActive: boolean;
  parentId?: string;
  children?: NavigationItem[]; // Make optional with ?
  createdAt?: string;
  updatedAt?: string;
}

export interface NavigationFormData {
  title: string;
  slug: string;
  type: 'link' | 'dropdown';
  order: number;
  parentId: string;
  isActive: boolean;
}

// Helper function to safely access children
export function hasChildren(item: NavigationItem): boolean {
  return !!item.children && item.children.length > 0;
}

// Helper function to get children
export function getChildren(item: NavigationItem): NavigationItem[] {
  return item.children || [];
}