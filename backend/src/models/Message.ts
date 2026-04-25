import { Schema, model, Document } from "mongoose";

export interface IMessage extends Document {
  messageId: string;
  peerId?: string;
  date?: Date;
  text?: string;
  isForwarded: boolean;
  forwardInfo?: {
    fromName?: string;
    fromId?: string;
    date?: Date;
  };
  type: "text" | "image" | "video" | "audio" | "document" | "link" | "other";
  autoTags: string[];
  userTags: string[];
  metadata?: {
    mimeType?: string;
    fileName?: string;
    fileSize?: number;
    width?: number;
    height?: number;
    duration?: number;
    url?: string;
    siteName?: string;
    title?: string;
    description?: string;
  };
  // summary?: string;
  // summaryGenerated?: boolean;
  groupedId?: string;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  messageId: { type: String, required: true, index: true, unique: true },
  peerId: { type: String },
  date: { type: Date, index: -1 },
  text: { type: String },

  isForwarded: { type: Boolean, default: false, index: true },
  forwardInfo: {
    fromName: String,
    fromId: String,
    date: Date,
  },

  type: {
    type: String,
    enum: ["text", "image", "video", "audio", "document", "link", "other"],
    default: "text",
    index: true,
  },
  autoTags: { type: [String], default: [], index: true },
  userTags: { type: [String], default: [], index: true },

  metadata: {
    mimeType: String,
    fileName: String,
    fileSize: Number,
    width: Number,
    height: Number,
    duration: Number,
    url: String,
    siteName: String,
    title: String,
    description: String,
  },
  summary: { type: String, index: true },
  summaryGenerated: { type: Boolean, default: false },
  groupedId: { type: String, index: true },
  updatedAt: { type: Date, default: Date.now },
});

export default model<IMessage>("Message", MessageSchema);
