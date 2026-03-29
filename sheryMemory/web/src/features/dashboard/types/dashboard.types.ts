export type DashboardTab = 'home' | 'library' | 'collections' | 'highlights' | 'graph' | 'chat';
export type FeedFilter = 'recent' | 'relevant';

export interface DashboardNotification {
  message: string;
  item?: {
    id: string;
    title?: string;
    url: string;
  };
  createdAt: string;
}
