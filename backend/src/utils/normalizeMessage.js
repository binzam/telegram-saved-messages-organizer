// --- HELPER: Parse Telegram Message into our DB Schema ---
export function normalizeMessage(m) {
  let type = "text";
  const autoTags = [];
  const metadata = {};
  const text = m.message || m.message?.toString?.() || "";

  // 1. Handle Forwarded Info
  let isForwarded = false;
  let forwardInfo = null;

  if (m.fwdFrom) {
    isForwarded = true;
    autoTags.push("forwarded");
    forwardInfo = {
      fromName: m.fwdFrom.fromName || m.fwdFrom.savedFromName || null,
      fromId: m.fwdFrom.fromId
        ? String(m.fwdFrom.fromId?.userId || m.fwdFrom.fromId)
        : null,
      date: m.fwdFrom.date ? new Date(m.fwdFrom.date * 1000) : null,
    };
  }

  // 2. Handle Media & Metadata
  if (m.media) {
    if (m.media.className === "MessageMediaPhoto") {
      type = "image";
      autoTags.push("media", "photo");

      // Extract the highest resolution dimensions
      const sizes = m.media.photo?.sizes || [];
      const largestSize = sizes
        .filter((s) => s.w && s.h)
        .sort((a, b) => b.w * b.h - a.w * a.h)[0];

      if (largestSize) {
        metadata.width = largestSize.w;
        metadata.height = largestSize.h;
      }
    } else if (m.media.className === "MessageMediaDocument") {
      const doc = m.media.document;
      const mimeType = doc?.mimeType || "";
      metadata.mimeType = mimeType;
      metadata.fileSize = doc?.size;

      let isVoice = m.media.voice || false;

      // Extract specific attributes (filename, dimensions, audio properties)
      if (doc?.attributes) {
        for (const attr of doc.attributes) {
          if (attr.className === "DocumentAttributeFilename") {
            metadata.fileName = attr.fileName;
          } else if (
            attr.className === "DocumentAttributeImageSize" ||
            attr.className === "DocumentAttributeVideo"
          ) {
            metadata.width = attr.w;
            metadata.height = attr.h;
            if (attr.duration) metadata.duration = attr.duration;
          } else if (attr.className === "DocumentAttributeAudio") {
            if (attr.voice) isVoice = true;
            if (attr.duration) metadata.duration = attr.duration;
          }
        }
      }

      // Determine document sub-type
      if (isVoice || mimeType.startsWith("audio/")) {
        type = "audio";
        autoTags.push("media", "audio", isVoice ? "voice-note" : "music");
      } else if (mimeType.startsWith("video/")) {
        type = "video";
        autoTags.push("media", "video");
      } else if (mimeType.startsWith("image/")) {
        type = "image";
        autoTags.push("media", "image");
      } else {
        type = "document";
        autoTags.push("media", "document");
        if (mimeType) {
          const extension = mimeType.split("/").pop();
          if (extension) autoTags.push(extension);
        }
      }
    } else if (m.media.className === "MessageMediaWebPage") {
      type = "link";
      autoTags.push("link");
      const webpage = m.media.webpage;

      metadata.url = webpage?.url;
      metadata.siteName = webpage?.siteName;
      metadata.title = webpage?.title;
      metadata.description = webpage?.description;

      if (metadata.url) {
        try {
          const domain = new URL(metadata.url).hostname.replace("www.", "");
          autoTags.push(domain);
        } catch (e) {
          /* Ignore invalid URLs */
        }
      }
    } else {
      type = "other";
    }
  } else {
    // 3. Handle Text/Links without rich media previews
    const hasLinkEntity = m.entities?.some(
      (e) =>
        e.className === "MessageEntityUrl" ||
        e.className === "MessageEntityTextUrl",
    );
    if (hasLinkEntity) {
      type = "link";
      autoTags.push("link");
    } else {
      type = "text";
      autoTags.push("text");
    }
  }

  return {
    messageId: String(m.id || ""),
    peerId: m.peerId ? String(m.peerId?.userId || m.peerId) : "me",
    date: m.date ? new Date(m.date * 1000) : new Date(),
    text,
    type,
    isForwarded,
    forwardInfo,
    autoTags,
    metadata,
    groupedId: m.groupedId ? String(m.groupedId) : null,
  };
}
