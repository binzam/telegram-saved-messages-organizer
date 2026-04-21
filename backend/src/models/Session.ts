import { Schema, model, Document } from "mongoose";

export interface ISession extends Document {
  phoneNumber: string;
  session: string;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
  phoneNumber: { type: String, required: true, unique: true },
  session: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<ISession>("Session", SessionSchema);
