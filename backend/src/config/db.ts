import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const uri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/telegram-saved-v2";

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");

    mongoose.connection.on("error", (err: Error) => {
      console.error("MongoDB runtime error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });
  } catch (err: any) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};

export default connectDB;
