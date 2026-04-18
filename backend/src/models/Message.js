import { Schema, model } from "mongoose";

const MessageSchema = new Schema({
  messageId: { type: String, required: true, index: true, unique: true },
  peerId: { type: String },
  date: { type: Date, index: -1 },
  text: { type: String },

  // Forward Tracking
  isForwarded: { type: Boolean, default: false, index: true },
  forwardInfo: {
    fromName: String,
    fromId: String,
    date: Date,
  },

  // Categorization
  type: {
    type: String,
    enum: ["text", "image", "video", "audio", "document", "link", "other"],
    default: "text",
    index: true,
  },
  autoTags: { type: [String], default: [], index: true },
  userTags: { type: [String], default: [], index: true },

  // Flexible metadata payload
  metadata: {
    // Media properties
    mimeType: String,
    fileName: String,
    fileSize: Number,

    // Visual Media (Photos/Videos)
    width: Number,
    height: Number,

    // Time-based Media (Audio/Video)
    duration: Number,

    // Webpage properties
    url: String,
    siteName: String,
    title: String,
    description: String,
  },

  // Useful for identifying albums (multiple photos sent together)
  groupedId: { type: String, index: true },

  updatedAt: { type: Date, default: Date.now },
});

export default model("Message", MessageSchema);
