import { Schema, model } from "mongoose";

const SessionSchema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  session: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model("Session", SessionSchema);
