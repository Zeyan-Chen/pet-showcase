import mongoose from "mongoose";

declare global {
  var mongooseConnection: Promise<typeof mongoose> | undefined;
}

export function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!global.mongooseConnection) {
    global.mongooseConnection = mongoose.connect(process.env.MONGODB_URI);
  }

  return global.mongooseConnection;
}
