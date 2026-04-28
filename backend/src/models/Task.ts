import { Schema, model, Document } from "mongoose";

export interface ITask extends Document {
  messageId: string;
  title?: string;
  note?: string;
  reminderAt: Date;
  status: "pending" | "done";
  notifyVia: ("email" | "telegram")[];
  isNotified: boolean; // Track notification state
  targetChatId?: string; // Telegram Bot Chat ID
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>({
  messageId: { type: String, required: true, index: true },

  title: String,
  note: String,

  reminderAt: { type: Date, required: true, index: true },

  status: {
    type: String,
    enum: ["pending", "done"],
    default: "pending",
  },

  notifyVia: [{ type: String, enum: ["email", "telegram"] }],

  isNotified: { type: Boolean, default: false },
  targetChatId: String,
  createdAt: { type: Date, default: Date.now },
});

export default model<ITask>("Task", TaskSchema);
