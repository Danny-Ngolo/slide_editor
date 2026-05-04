import mongoose from "mongoose";

let isConnected;

export const connectDB = async () => {
  if (isConnected) {
    console.log("DB is already connected.");

    return 1;
  }

  if (mongoose.connection.readyState === 1) {
    console.log("Using existing connection...");
    return mongoose.connection.readyState;
  }

  const mongoDBURI = process.env.MONGODB_URI;
  console.log("mongoDBURI", mongoDBURI);

  try {
    await mongoose.connect(mongoDBURI, { bufferCommands: false });

    console.log("DB connected successfully!");

    isConnected = mongoose.connection.readyState;

    return 1;
  } catch (err) {
    console.log(err);

    throw new Error(err);
  }
};
