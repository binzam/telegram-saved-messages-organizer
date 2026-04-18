import React, { useState } from "react";
import type { Message } from "../../types";
import {
  ImageMessage,
  VideoMessage,
  AudioMessage,
  LinkMessage,
} from "./MediaTypes";

interface MessageCardProps {
  message: Message;
  onAddTags: (tags: string[]) => void;
  isAlbumItem?: boolean;
}

export default function MessageCard({
  message,
  onAddTags,
  isAlbumItem = false,
}: MessageCardProps) {
  const [tagText, setTagText] = useState("");

  const { type, text, autoTags, userTags, isForwarded, forwardInfo, date } =
    message;
  const allTags = Array.from(
    new Set([...(autoTags || []), ...(userTags || [])]),
  );

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagText
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (tags.length) {
      onAddTags(tags);
      setTagText("");
    }
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
      case "text":
      case "document":
        return text ? (
          <p className="whitespace-pre-wrap wrap-break-words text-slate-800">
            {text}
          </p>
        ) : (
          <i className="text-slate-400">Empty message</i>
        );
      default:
        return null;
    }
  };

  if (isAlbumItem) {
    return (
      <div className="relative group">
        {renderBody()}
        {text && <p className="mt-1 text-sm text-slate-600 truncate">{text}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-3">
        <div className="flex flex-col">
          {isForwarded && (
            <div className="flex items-center text-xs text-blue-600 font-medium mb-1">
              Forwarded from {forwardInfo?.fromName || "Unknown"}
            </div>
          )}
          <span className="text-xs text-slate-400">
            {new Date(date).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      </div>

      <div className="mb-4">
        {type !== "link" && type !== "text" && text && (
          <p className="mb-3 whitespace-pre-wrap wrap-break-words text-slate-800">
            {text}
          </p>
        )}
        {renderBody()}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex flex-wrap gap-2 mb-3">
          {allTags.map((t) => (
            <span
              key={t}
              className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600"
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
            className="flex-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!tagText.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
          >
            Tag
          </button>
        </form>
      </div>
    </div>
  );
}
