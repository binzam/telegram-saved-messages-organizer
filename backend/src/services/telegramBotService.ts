import { Markup, Telegraf } from "telegraf";
import Task from "../models/Task.js";
import { socketService } from "./socketService.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN must be provided!");
export const bot = new Telegraf(token);

/**
 * Logic for when a user first interacts with the bot
 */
bot.start((ctx) => {
  ctx.reply(
    `Welcome ${ctx.from.first_name}! I will send your task reminders here.`,
  );
});

// Helper function to escape HTML characters so the bot doesn't crash on < or >
const escapeHtml = (str: string) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export async function sendTelegramReminder(
  chatId: string,
  title: string,
  note?: string,
  originalText?: string,
  taskId?: string,
) {
  try {
    let text = `⏰ <b>Reminder: ${escapeHtml(title)}</b>\n`;
    if (note) {
      text += `\n${escapeHtml(note)}\n`;
    }
    if (originalText) {
      text += `\n💬 <b>Original Message:</b>\n<i>${escapeHtml(originalText)}</i>`;
    }
    const options: any = { parse_mode: "HTML" };
    // If a taskId is provided, attach the inline keyboard button
    if (taskId) {
      options.reply_markup = Markup.inlineKeyboard([
        Markup.button.callback("✅ Mark as Done", `done_${taskId}`),
      ]).reply_markup;
    }
    // Switched to HTML for safer string parsing
    await bot.telegram.sendMessage(chatId, text, options);
    console.log(`✅ Telegram bot message sent to ${chatId}`);
  } catch (error) {
    console.error(
      `❌ Failed to send Telegram bot message to ${chatId}:`,
      error,
    );
  }
}
// Listen for the "Mark as Done" button click
bot.action(/^done_(.+)$/, async (ctx) => {
  try {
    // Extract the task ID from the callback data
    const taskId = ctx.match[1];

    // 1. Update the database
    const updatedTask = await Task.findByIdAndUpdate(taskId, {
      status: "done",
    });
    if (updatedTask) {
      const io = socketService.getIO();
      io.emit("task_updated", {
        messageId: updatedTask.messageId,
        taskId: updatedTask._id,
        updates: { status: "done" },
      });
    }
    // 2. Answer the callback so the button stops showing a "loading" state
    await ctx.answerCbQuery("Task marked as done!");

    // 3. Edit the original message to remove the button and add a visual cue
    if (ctx.callbackQuery.message && "text" in ctx.callbackQuery.message) {
      const currentText = ctx.callbackQuery.message.text;
      await ctx.editMessageText(
        `${escapeHtml(currentText)}\n\n✅ <i>Status: Completed</i>`,
        {
          parse_mode: "HTML",
          reply_markup: undefined, // This removes the inline button
        },
      );
    }

    console.log(`✅ Task ${taskId} marked as done via Telegram button`);
  } catch (error) {
    console.error("❌ Error marking task as done:", error);
    await ctx.answerCbQuery("Failed to update task.", { show_alert: true });
  }
});
// Launch the bot gracefully
export function initTelegramBot() {
  bot.launch();
  console.log("🤖 Telegram Bot initialized");
}
