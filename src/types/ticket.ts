export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'bug';
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  submittedBy: string;
  screenshotUrl?: string;
}
