import mongoose, { Schema, type Document } from 'mongoose';
import type { Tactic } from './Negotiation.ts';

export type ResistanceLevel = 'low' | 'medium' | 'high';

export interface IAnalytics extends Document {
    tactic: Tactic;
    totalUses: number;
    successCount: number;
    successRate: number;
    avgDiscountAchieved: number;
    aiResistanceLevel: ResistanceLevel;
    lastUpdated: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
    {
        tactic: {
            type: String,
            enum: ['emotional', 'logical', 'aggressive', 'passive', 'flattery', 'anchor'],
            required: true,
            unique: true,
        },
        totalUses: { type: Number, default: 0 },
        successCount: { type: Number, default: 0 },
        successRate: { type: Number, default: 0 },
        avgDiscountAchieved: { type: Number, default: 0 },
        aiResistanceLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true },
);

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

