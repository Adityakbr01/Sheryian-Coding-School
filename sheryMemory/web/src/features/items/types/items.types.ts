export interface Tag {
  id: string;
  name: string;
}

export interface ItemTag {
  tag: Tag;
}

export interface collection {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  userId: string;
  url: string;
  title?: string;
  type: string;
  status: string; // 'pending' | 'processed' | 'failed'
  content?: string;
  summary?: string;
  aiInsight?: string;
  imageUrl?: string;
  highlights?: Array<{ text: string; annotation: string }>;
  createdAt: string;
  updatedAt: string;
  tags?: ItemTag[];
  collection?: collection;
}
