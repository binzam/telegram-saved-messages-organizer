import React, { useState } from "react";
import type { AddTaskForm, Message } from "../../types";
import {
  ImageMessage,
  VideoMessage,
  AudioMessage,
  LinkMessage,
  DocumentMessage,
} from "./MediaTypes";
import { useDeleteMessage, useTagMessage } from "../../hooks/message-hooks";
import { Link } from "react-router-dom";
import { useCreateTask } from "../../hooks/task-hooks";

interface MessageCardProps {
  message: Message;
  isAlbumItem?: boolean;
}
export default function MessageCard({
  message,
  isAlbumItem = false,
}: MessageCardProps) {
  const tagMutation = useTagMessage();
  const deleteMutation = useDeleteMessage();
  const createTaskMutation = useCreateTask();

  const [tagText, setTagText] = useState("");
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<AddTaskForm>({
    title: "",
    note: "",
    date: "",
    time: "",
    notifyVia: [],
  });
  const handleNotifyToggle = (medium: "email" | "telegram") => {
    setTaskForm((prev) => ({
      ...prev,
      notifyVia: prev.notifyVia.includes(medium)
        ? prev.notifyVia.filter((m) => m !== medium)
        : [...prev.notifyVia, medium],
    }));
  };
  const {
    type,
    text,
    autoTags,
    userTags,
    isForwarded,
    forwardInfo,
    date,
    messageId,
    hasTask,
  } = message;
  const allTags = Array.from(
    new Set([...(autoTags || []), ...(userTags || [])]),
  );

  const handleTagSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const tags = tagText
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (tags.length) {
      tagMutation.mutate({ messageId, tags });
      setTagText("");
    }
  };
  const handleDelete = () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this message? This will remove it from your database AND actual Telegram account permanently.",
    );
    if (isConfirmed) {
      deleteMutation.mutate(messageId);
    }
  };
  const handleTaskSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const reminderAt = new Date(
      `${taskForm.date}T${taskForm.time}`,
    ).toISOString();
    console.log({ taskForm });
    console.log({ reminderAt });
    createTaskMutation.mutate(
      {
        messageId,
        title: taskForm.title || undefined,
        note: taskForm.note || undefined,
        reminderAt,
        notifyVia: taskForm.notifyVia,
      },
      {
        onSuccess: () => {
          setIsTaskFormOpen(false);
          setTaskForm({
            title: "",
            note: "",
            date: "",
            time: "",
            notifyVia: [],
          });
        },
      },
    );
  };
  const renderBody = () => {
    switch (type) {
      case "image":
        return <ImageMessage message={message} />;
      case "video":
        return <VideoMessage message={message} />;
      case "audio":
        return <AudioMessage message={message} />;
      case "link":
        return <LinkMessage message={message} />;
      case "document":
        return <DocumentMessage message={message} />;
      case "text":
        return text ? (
          <p className="whitespace-pre-wrap wrap-break-words text-[#f5f5f5]">
            {text}
          </p>
        ) : (
          <i className="text-[#8fa8ba]">Empty message</i>
        );
      default:
        return null;
    }
  };

  if (isAlbumItem) {
    return (
      <div className="relative">
        {renderBody()}
        {text && <p className="mt-1 text-sm text-[#f5f5f5] truncate">{text}</p>}
      </div>
    );
  }

  return (
    <div className="bg-[#2b5278] p-5 rounded-[10px_30px_10px_2px] shadow-sm border border-[#2b3e4d] transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between mb-3 border-b border-[#2b3e4d] pb-3">
        <div className="flex flex-col">
          {isForwarded && (
            <div className="flex items-center text-sm text-[#afdcd9] font-semibold mb-1">
              Forwarded from {forwardInfo?.fromName || "Unknown"}
            </div>
          )}
          <span className="text-xs text-[#8fa8ba]">
            {new Date(date).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {hasTask && (
            <Link
              to={`/tasks/${messageId}`}
              className="text-[#afdcd9] hover:text-[#c4e8e6] text-sm font-medium transition flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              View Tasks
            </Link>
          )}

          <button
            onClick={() => setIsTaskFormOpen(!isTaskFormOpen)}
            className="text-[#5288c1] hover:text-[#73a2d6] text-sm font-medium transition flex items-center gap-1"
          >
            {createTaskMutation.isPending ? (
              <>
                <span className="w-3 h-3 border-2 border-t-transparent border-[#5288c1] rounded-full animate-spin"></span>
                Saving...
              </>
            ) : isTaskFormOpen ? (
              "Cancel"
            ) : hasTask ? (
              "+ Add Another"
            ) : (
              "+ Create Task"
            )}
          </button>

          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-[#ef6666] hover:text-[#ff8888] text-sm font-medium transition disabled:opacity-50"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
      {/* Task Creation Form (Inline Dropdown) */}
      {isTaskFormOpen && (
        <form
          onSubmit={handleTaskSubmit}
          className="mb-4 p-4 bg-[#182533] rounded-lg border border-[#2b3e4d] space-y-3"
        >
          <div className="text-sm font-semibold text-[#f5f5f5] mb-2">
            Create Reminder / Task
          </div>
          <input
            type="text"
            placeholder="Task Title"
            value={taskForm.title}
            onChange={(e) =>
              setTaskForm({ ...taskForm, title: e.target.value })
            }
            className="w-full bg-[#0e1621] border border-[#2b3e4d] text-[#f5f5f5] placeholder-[#8fa8ba] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5288c1]"
          />
          <textarea
            placeholder="Notes"
            value={taskForm.note}
            onChange={(e) => setTaskForm({ ...taskForm, note: e.target.value })}
            className="w-full bg-[#0e1621] border border-[#2b3e4d] text-[#f5f5f5] placeholder-[#8fa8ba] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5288c1] resize-none h-20"
          />
          <div className="flex gap-3">
            <input
              type="date"
              required
              value={taskForm.date}
              onChange={(e) =>
                setTaskForm({ ...taskForm, date: e.target.value })
              }
              className="flex-1 bg-[#0e1621] border border-[#2b3e4d] text-[#f5f5f5] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5288c1] [color-scheme:dark]"
            />
            <input
              type="time"
              required
              value={taskForm.time}
              onChange={(e) =>
                setTaskForm({ ...taskForm, time: e.target.value })
              }
              className="flex-1 bg-[#0e1621] border border-[#2b3e4d] text-[#f5f5f5] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5288c1] [color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#8fa8ba] uppercase">
              Notify me via:
            </p>
            <div className="flex gap-4">
              {(["telegram", "email"] as const).map((medium) => (
                <label
                  key={medium}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div
                    onClick={() => handleNotifyToggle(medium)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      taskForm.notifyVia.includes(medium)
                        ? "bg-[#5288c1] border-[#5288c1]"
                        : "bg-[#0e1621] border-[#2b3e4d] group-hover:border-[#5288c1]"
                    }`}
                  >
                    {taskForm.notifyVia.includes(medium) && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-[#f5f5f5] capitalize">
                    {medium}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="bg-[#5288c1] hover:bg-[#3e6d9e] disabled:opacity-50 text-[#f5f5f5] px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              {createTaskMutation.isPending ? "Saving..." : "Save Task"}
            </button>
          </div>
        </form>
      )}
      <div className="mb-4">
        {type !== "link" && type !== "text" && text && (
          <p className="mb-3 whitespace-pre-wrap wrap-break-words text-[#f5f5f5]">
            {text}
          </p>
        )}
        {renderBody()}
      </div>

      <div className="mt-4 pt-4 border-t border-[#2b3e4d]">
        <div className="flex flex-wrap gap-2 mb-3">
          {allTags.map((t) => (
            <span
              key={t}
              className="bg-[#182533] border border-[#2b3e4d] px-2.5 py-1 rounded-md text-xs font-medium text-[#f5f5f5]"
            >
              #{t}
            </span>
          ))}
        </div>
        <form onSubmit={handleTagSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Add tags..."
            value={tagText}
            onChange={(e) => setTagText(e.target.value)}
            className="flex-1 bg-[#182533] border border-[#2b3e4d] text-[#f5f5f5] placeholder-[#8fa8ba] px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5288c1]"
          />
          <button
            type="submit"
            disabled={!tagText.trim() || tagMutation.isPending}
            className="bg-[#5288c1] hover:bg-[#3e6d9e] disabled:bg-[#2b3e4d] disabled:text-[#8fa8ba] text-[#f5f5f5] px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            {tagMutation.isPending ? "..." : "Tag"}
          </button>
        </form>
      </div>
    </div>
  );
}
