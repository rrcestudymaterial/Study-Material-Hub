export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: number;
  type: 'PDF' | 'VIDEO';
  link: string;
  tags: string[];
  uploadDate: string;
  author: string;
}

export interface FilterOptions {
  searchQuery: string;
  subject: string;
  semester: string;
  type: 'ALL' | 'PDF' | 'VIDEO';
} 