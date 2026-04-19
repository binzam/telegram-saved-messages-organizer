import React, { useState } from "react";
import type { Message } from "../../types";
import {
  ImageMessage,
  VideoMessage,
  AudioMessage,
  LinkMessage,
  DocumentMessage,
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
      </div>

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
            disabled={!tagText.trim()}
            className="bg-[#5288c1] hover:bg-[#3e6d9e] disabled:bg-[#2b3e4d] disabled:text-[#8fa8ba] text-[#f5f5f5] px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Tag
          </button>
        </form>
      </div>
    </div>
  );
}
