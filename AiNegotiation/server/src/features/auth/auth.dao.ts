import { User, type IUser } from '../../models/User.ts';

export const authDao = {
    findByEmail: async (email: string): Promise<IUser | null> => {
        return User.findOne({ email }).lean<IUser>().exec();
    },

    findById: async (id: string): Promise<IUser | null> => {
        return User.findById(id).lean<IUser>().exec();
    },

    create: async (data: { name: string; email: string; password: string }): Promise<IUser> => {
        const user = new User({
            name: data.name,
            email: data.email,
            passwordHash: data.password,
        });
        return user.save();
    },

    updateStats: async (
        userId: string,
        update: { totalSessions?: number; wins?: number; bestDealPrice?: number; score?: number },
    ): Promise<void> => {
        await User.findByIdAndUpdate(userId, { $inc: update });
    },
};
