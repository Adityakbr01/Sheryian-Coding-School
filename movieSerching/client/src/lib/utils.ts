import { TMDB_IMAGE_BASE, PLACEHOLDER_IMAGE, PLACEHOLDER_BACKDROP } from "@/constants";

export const getImageUrl = (
  path: string | null | undefined,
  size: string = "w500"
): string => {
  if (!path) return PLACEHOLDER_IMAGE;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (
  path: string | null | undefined,
  size: string = "original"
): string => {
  if (!path) return PLACEHOLDER_BACKDROP;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getYouTubeUrl = (key: string): string => {
  return `https://www.youtube.com/embed/${key}?autoplay=1`;
};

export const getYouTubeThumbnail = (key: string): string => {
  return `https://img.youtube.com/vi/${key}/mqdefault.jpg`;
};

export const formatDate = (date: string | undefined): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatRating = (rating: number | undefined): string => {
  if (!rating) return "N/A";
  return rating.toFixed(1);
};

export const truncateText = (text: string, maxLength: number = 150): string => {
  if (!text) return "Description not available";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const getMediaTitle = (item: any): string => {
  return item.title || item.name || "Untitled";
};

export const getMediaDate = (item: any): string => {
  return item.release_date || item.first_air_date || "";
};

export const getMediaType = (item: any): "movie" | "tv" => {
  if (item.media_type) return item.media_type === "tv" ? "tv" : "movie";
  if (item.first_air_date || item.name) return "tv";
  return "movie";
};

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};
