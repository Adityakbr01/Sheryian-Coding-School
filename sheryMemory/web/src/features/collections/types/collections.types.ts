export interface Collection {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
  items?: any[];
}
