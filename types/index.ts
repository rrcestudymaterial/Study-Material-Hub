export type MaterialType = 'document' | 'video' | 'link';

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: MaterialType;
  url: string;
  subject: string;
  topic: string;
  dateAdded: Date;
  fileSize?: number; // Only for documents
  duration?: number; // Only for videos
  tags: string[];
}

export interface FilterOptions {
  type?: MaterialType;
  subject?: string;
  topic?: string;
  tags?: string[];
}

export interface SortOptions {
  field: 'title' | 'dateAdded' | 'subject' | 'topic';
  direction: 'asc' | 'desc';
} 