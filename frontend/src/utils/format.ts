/**
 * Formats a numeric byte value into a human-readable string (e.g., "1.5 MB").
 */
export const formatBytes = (
  bytes: number | undefined,
  decimals: number = 2,
): string => {
  if (!bytes || bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  // Determine which unit index to use
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Ensure we don't go out of bounds of our sizes array
  const unitIndex = Math.min(i, sizes.length - 1);

  const value = parseFloat((bytes / Math.pow(k, unitIndex)).toFixed(dm));

  return `${value} ${sizes[unitIndex]}`;
};

/**
 * Converts seconds into a MM:SS or H:MM:SS format.
 */
export const formatDuration = (seconds: number | undefined): string => {
  if (!seconds) return "0:00";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];

  if (hrs > 0) {
    parts.push(hrs);
    parts.push(mins.toString().padStart(2, "0"));
  } else {
    parts.push(mins);
  }

  parts.push(secs.toString().padStart(2, "0"));

  return parts.join(":");
};

/**
 * Extracts the hostname from a URL string, falling back to a default label.
 */
export const getSafeHostname = (urlString: string | undefined): string => {
  if (!urlString) return "Link";
  try {
    return new URL(urlString).hostname.replace("www.", "");
  } catch (e: unknown) {
    console.error(e);
    return "Link";
  }
};
