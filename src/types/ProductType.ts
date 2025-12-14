// src/types/ProductType.ts
import { Types } from 'mongoose';

export interface IPrice {
  amount: number;
  currency: string;
  discount?: number;
}

export interface IProduct {
  _id: Types.ObjectId;
  title: string;
  slug?: string;
  mainImage?: string;
  mainImageAlt?: string;
  description?: string;
  shortDescription?: string;
  prices: IPrice[];
  category?: Types.ObjectId;
  subCategory?: Types.ObjectId;
  isActive: boolean;
  inStock: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductDocument extends IProduct, Document {}
export type IProductLean = Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};