// Common application types

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  description: string;
  lastUpdated?: Date;
}

export interface KeyFigure {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
} 