import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const uri =
    process.env.MONGODB_URI;
  if(!uri){
      throw new Error("MONGODB_URI IS REQUIRED!");
  }
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
