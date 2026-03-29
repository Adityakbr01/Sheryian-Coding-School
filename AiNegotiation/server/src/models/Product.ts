import mongoose, { Schema, type Document } from 'mongoose';

export interface IProduct extends Document {
    id: string; // human-readable slug, e.g. "laptop-pro"
    name: string;
    description: string;
    basePrice: number;
    minimumPrice: number;
    emoji: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        id: { type: String, required: true, unique: true, trim: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        basePrice: { type: Number, required: true, min: 1 },
        minimumPrice: { type: Number, required: true, min: 1 },
        emoji: { type: String, default: '🛍️' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

