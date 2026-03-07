import { User } from "@/models/user/user.model";
import { connectDB } from "@/db/mongo";
import mongoose from "mongoose";

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ email: "admin@movieplatform.com" });
    if (adminExists) {
      console.log("Admin user already exists");
    } else {
      await User.create({
        name: "Admin",
        email: "admin@movieplatform.com",
        password: "admin123",
        role: "admin",
      });
      console.log("Admin user created: admin@movieplatform.com / admin123");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedAdmin();
