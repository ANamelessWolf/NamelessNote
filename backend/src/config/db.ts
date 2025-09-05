import mongoose from "mongoose";

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGO_URI || "mongodb://nameless_note_db:27017/namelessnote";
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName: "namelessnote" });
  console.log("Mongo connected:", uri);
}
