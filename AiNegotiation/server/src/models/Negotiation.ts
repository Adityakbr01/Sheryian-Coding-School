import mongoose, { Schema, type Document } from 'mongoose';

export type Mood = 'neutral' | 'happy' | 'annoyed' | 'desperate';
export type Tactic = 'emotional' | 'logical' | 'aggressive' | 'passive' | 'flattery' | 'anchor';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type FacialEmotion = 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral' | 'fearful' | 'disgusted';

export interface IMessage {
    role: 'user' | 'ai';
    content: string;
    tactic?: Tactic;
    mood?: Mood;
    priceAtRound?: number;
    timestamp: Date;
}

export interface INegotiation extends Document {
    userId: mongoose.Types.ObjectId;
    productId: string;
    productName: string;
    basePrice: number;
    minimumPrice: number;
    currentPrice: number;
    finalPrice?: number;
    success: boolean;
    isComplete: boolean;
    totalRounds: number;
    maxRounds: number;
    difficulty: Difficulty;
    currentMood: Mood;
    moodHistory: Mood[];
    tacticsUsed: Tactic[];
    messages: IMessage[];
    facialEmotions: FacialEmotion[];
    announcedRoundCount: number;
    isWalkaway: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    role: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true },
    tactic: { type: String, enum: ['emotional', 'logical', 'aggressive', 'passive', 'flattery', 'anchor'] },
    mood: { type: String, enum: ['neutral', 'happy', 'annoyed', 'desperate'] },
    priceAtRound: { type: Number },
    timestamp: { type: Date, default: Date.now },
});

const NegotiationSchema = new Schema<INegotiation>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        basePrice: { type: Number, required: true },
        minimumPrice: { type: Number, required: true },
        currentPrice: { type: Number, required: true },
        finalPrice: { type: Number },
        success: { type: Boolean, default: false },
        isComplete: { type: Boolean, default: false },
        totalRounds: { type: Number, default: 0 },
        maxRounds: { type: Number, default: 10 },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
        currentMood: { type: String, enum: ['neutral', 'happy', 'annoyed', 'desperate'], default: 'neutral' },
        moodHistory: [{ type: String, enum: ['neutral', 'happy', 'annoyed', 'desperate'] }],
        tacticsUsed: [{ type: String, enum: ['emotional', 'logical', 'aggressive', 'passive', 'flattery', 'anchor'] }],
        messages: [MessageSchema],
        facialEmotions: [{ type: String }],
        announcedRoundCount: { type: Number, default: 0 },
        isWalkaway: { type: Boolean, default: false },
    },
    { timestamps: true },
);

export const Negotiation = mongoose.model<INegotiation>('Negotiation', NegotiationSchema);

