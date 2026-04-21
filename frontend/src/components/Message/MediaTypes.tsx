import { useState } from "react";
import { API_URL } from "../../lib/api-client";
import type { Message } from "../../types";
import {
  formatBytes,
  formatDuration,
  getSafeHostname,
} from "../../utils/format";

const API_BASE = `${API_URL}/messages/media`;

export const ImageMessage = ({ message }: { message: Message }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const aspectRatioStyle =
    message.metadata?.width && message.metadata?.height
      ? {
          aspectRatio: `${message.metadata.width} / ${message.metadata.height}`,
        }
      : {};

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-[#2b3e4d] max-w-lg bg-[#182533]"
      style={aspectRatioStyle}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <svg
            className="w-8 h-8 text-[#2b3e4d]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
      <img
        src={`${API_BASE}/${message.messageId}`}
        alt="Media"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export const VideoMessage = ({ message }: { message: Message }) => {
  const aspectRatioStyle =
    message.metadata?.width && message.metadata?.height
      ? {
          aspectRatio: `${message.metadata.width} / ${message.metadata.height}`,
        }
      : {};

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-[#0e1621] border border-[#2b3e4d] max-w-lg"
      style={aspectRatioStyle}
    >
      <video controls preload="none" className="absolute inset-0 w-full h-full">
        <source
          src={`${API_BASE}/${message.messageId}`}
          type={message.metadata?.mimeType || "video/mp4"}
        />
      </video>
    </div>
  );
};

export const AudioMessage = ({ message }: { message: Message }) => (
  <div className="bg-[#182533] hover:bg-[#1c2a3a] border border-[#2b3e4d] p-4 rounded-lg flex flex-col gap-2 max-w-md transition">
    <div className="flex justify-between text-sm font-medium text-[#f5f5f5]">
      <span>{message.metadata?.fileName || "Voice Message"}</span>
      {message.metadata?.duration && (
        <span className="text-[#8fa8ba]">
          {formatDuration(message.metadata.duration)}
        </span>
      )}
    </div>
    <audio controls className="w-full h-10">
      <source
        src={`${API_BASE}/${message.messageId}`}
        type={message.metadata?.mimeType || "audio/ogg"}
      />
    </audio>
  </div>
);

export const LinkMessage = ({ message }: { message: Message }) => (
  <div className="max-w-lg">
    {message.text && (
      <p className="mb-3 whitespace-pre-wrap wrap-break-words truncate text-[#f5f5f5]">
        {message.text}
      </p>
    )}
    {message.metadata?.url && (
      <a
        href={message.metadata.url}
        target="_blank"
        rel="noreferrer"
        className="block border border-[#2b3e4d] rounded-lg overflow-hidden bg-[#182533] hover:bg-[#1c2a3a] transition"
      >
        <div className="p-4">
          <p className="text-xs font-semibold text-[#8fa8ba] uppercase tracking-wide mb-1">
            {message.metadata.siteName || getSafeHostname(message.metadata.url)}
          </p>
          <h3 className="text-base font-bold text-[#37a8a0] line-clamp-2 mb-1">
            {message.metadata.title || message.metadata.url}
          </h3>
          {message.metadata.description && (
            <p className="text-sm text-[#8fa8ba] line-clamp-3">
              {message.metadata.description}
            </p>
          )}
        </div>
      </a>
    )}
  </div>
);

export const DocumentMessage = ({ message }: { message: Message }) => {
  const fileUrl = `${API_BASE}/${message.messageId}`;
  const fileName = message?.metadata?.fileName || "Document";

  const downloadFile = async (url: string, filename: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const urlBlob = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = urlBlob;
    link.download = filename;
    link.click();

    window.URL.revokeObjectURL(urlBlob);
  };
  return (
    <div className="bg-[#182533] hover:bg-[#1c2a3a] border border-[#2b3e4d] p-3 rounded-lg flex items-center justify-between transition max-w-md group">
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 overflow-hidden flex-1"
      >
        <div className="p-2 bg-[#5288c1] text-white rounded-md group-hover:bg-[#3e6d9e] transition shrink-0">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div className="overflow-hidden">
          <p className="font-semibold text-[#f5f5f5] truncate">{fileName}</p>
          <p className="text-xs text-[#8fa8ba]">
            {formatBytes(message?.metadata?.fileSize)} •{" "}
            {message?.metadata?.mimeType || "Unknown type"}
          </p>
        </div>
      </a>

      <button
        type="button"
        onClick={() => downloadFile(fileUrl, fileName)}
        className="p-2 ml-2 text-[#5288c1] hover:text-[#f5f5f5] hover:bg-[#2b5278] rounded-full transition-colors shrink-0 cursor-pointer"
        title="Download Document"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      </button>
    </div>
  );
};
