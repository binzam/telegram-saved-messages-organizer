import Message from "../models/Message.js";
import { ITask } from "../models/Task.js";
import { socketService } from "./socketService.js";
import { sendTelegramReminder } from "./telegramBotService.js";

export async function triggerTaskNotification(task: ITask) {
  const originalMessage = await Message.findOne({
    messageId: task.messageId,
  }).lean();
  const originalText = originalMessage?.text || "";

  if (task.notifyVia.includes("telegram") && task.targetChatId) {
    await sendTelegramReminder(
      task.targetChatId,
      task.title || "Task",
      task.note,
      originalText,
      task._id.toString(),
    );
  }

  task.isNotified = true;
  await task.save();

  const io = socketService.getIO();
  io.emit("task_updated", {
    messageId: task.messageId,
    taskId: task._id,
  });
}
