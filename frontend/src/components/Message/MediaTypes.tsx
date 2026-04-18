import { API_URL } from "../../lib/api-client";
import type { Message } from "../../types";
import { formatDuration, getSafeHostname } from "../../utils/format";

const API_BASE = `${API_URL}/messages/media`;

export const ImageMessage = ({ message }: { message: Message }) => {
  const aspectRatioStyle =
    message.metadata?.width && message.metadata?.height
      ? {
          aspectRatio: `${message.metadata.width} / ${message.metadata.height}`,
        }
      : {};

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200 max-w-lg"
      style={aspectRatioStyle}
    >
      <img
        src={`${API_BASE}/${message.messageId}`}
        alt="Media"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
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
      className="relative w-full overflow-hidden rounded-lg bg-black max-w-lg"
      style={aspectRatioStyle}
    >
      <video
        controls
        preload="metadata"
        className="absolute inset-0 w-full h-full"
      >
        <source
          src={`${API_BASE}/${message.messageId}`}
          type={message.metadata?.mimeType || "video/mp4"}
        />
      </video>
    </div>
  );
};

export const AudioMessage = ({ message }: { message: Message }) => (
  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-col gap-2 max-w-md">
    <div className="flex justify-between text-sm font-medium text-slate-700">
      <span>{message.metadata?.fileName || "Voice Message"}</span>
      {message.metadata?.duration && (
        <span>{formatDuration(message.metadata.duration)}</span>
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
      <p className="mb-3 whitespace-pre-wrap wrap-break-words truncate">
        {message.text}
      </p>
    )}
    {message.metadata?.url && (
      <a
        href={message.metadata.url}
        target="_blank"
        rel="noreferrer"
        className="block border border-slate-200 rounded-lg overflow-hidden hover:bg-slate-50 transition"
      >
        <div className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            {message.metadata.siteName || getSafeHostname(message.metadata.url)}
          </p>
          <h3 className="text-base font-bold text-blue-600 line-clamp-2 mb-1">
            {message.metadata.title || message.metadata.url}
          </h3>
          {message.metadata.description && (
            <p className="text-sm text-slate-600 line-clamp-3">
              {message.metadata.description}
            </p>
          )}
        </div>
      </a>
    )}
  </div>
);
