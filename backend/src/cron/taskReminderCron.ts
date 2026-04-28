import cron from "node-cron";
import Task from "../models/Task.js";
import { sendTelegramReminder } from "../services/telegramBotService.js";
import Message from "../models/Message.js";
import { socketService } from "../services/socketService.js";

export function initCronJobs() {
  // Run every minute at the 0th second
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Find tasks that are due, haven't been notified yet, and aren't marked done
      const dueTasks = await Task.find({
        reminderAt: { $lte: now },
        isNotified: false,
        status: "pending",
      });

      if (dueTasks.length === 0) return;

      console.log(`🔍 Found ${dueTasks.length} tasks to notify.`);

      for (const task of dueTasks) {
        const promises: Promise<void>[] = [];
        // 1. Fetch the original saved message from the DB using messageId
        const originalMessage = await Message.findOne({
          messageId: task.messageId,
        }).lean();
        const originalText = originalMessage?.text || "";
        // 2. Queue Telegram Notification
        if (task.notifyVia.includes("telegram") && task.targetChatId) {
          promises.push(
            sendTelegramReminder(
              task.targetChatId,
              task.title || "Task",
              task.note,
              originalText,
              task._id.toString(),
            ),
          );
        }

        // Execute notifications concurrently
        await Promise.all(promises);

        // 3. Mark task as notified to prevent duplicate alerts
        task.isNotified = true;
        await task.save();
        const io = socketService.getIO();
        io.emit("task_updated", {
          messageId: task.messageId,
          taskId: task._id,
        });
      }
    } catch (error) {
      console.error("❌ Error in task reminder cron job:", error);
    }
  });

  console.log("⏱️ Task reminder cron job initialized");
}
