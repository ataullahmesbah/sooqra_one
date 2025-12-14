// src/types/CategoryType.ts
import { Document, Types } from 'mongoose';

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryDocument extends ICategory, Document {}

export interface ICategoryLean {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}