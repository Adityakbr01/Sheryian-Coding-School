import mongoose, { Schema, type Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: 'user' | 'admin';
    score: number;
    totalSessions: number;
    bestDealPrice: number;
    wins: number;
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        score: { type: Number, default: 0 },
        totalSessions: { type: Number, default: 0 },
        bestDealPrice: { type: Number, default: Infinity },
        wins: { type: Number, default: 0 },
    },
    { timestamps: true },
);

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
};

UserSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return;
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

export const User = mongoose.model<IUser>('User', UserSchema);

