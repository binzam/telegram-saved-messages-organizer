type MessageType = "image" | "video" | "audio" | "document" | "link" | "text";

interface MessageMetadata {
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
  duration?: number;
  fileSize?: number;
  url?: string;
  siteName?: string;
  title?: string;
  description?: string;
}

interface MessageSingleNode {
  isGroup: false;
  item: Message;
  key: string;
}

export interface MessageGroupNode {
  isGroup: true;
  groupedId: string;
  items: Message[];
  key: string;
}

export interface Message {
  messageId: string;
  type: MessageType;
  text?: string;
  metadata?: MessageMetadata;
  autoTags?: string[];
  userTags?: string[];
  isForwarded?: boolean;
  forwardInfo?: {
    fromName?: string;
  };
  date: string;
  groupedId?: string;
  hasTask: boolean;
}

export interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
  total?: number;
}
export interface FilterState {
  filter: string;
  mediaType: string;
  sortOrder: "asc" | "desc";
}

export type MessageDisplayNode = MessageSingleNode | MessageGroupNode;

export interface CreateTaskInput {
  messageId: string;
  title?: string;
  note?: string;
  reminderAt: string;
  notifyVia?: ("email" | "telegram")[];
}

export interface AddTaskForm {
  title: string;
  note: string;
  date: string;
  time: string;
  notifyVia: ("email" | "telegram")[];
}

export interface TasksResponse {
  message: Message & {
    tasks: Task[];
  };
}
export interface Task {
  _id: string;
  messageId: string;
  title?: string;
  note?: string;
  reminderAt: string;
  notifyVia: ("email" | "telegram")[];
  status: string;
  isNotified: boolean;
}
