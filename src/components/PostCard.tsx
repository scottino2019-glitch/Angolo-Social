import React from "react";
import { Post, THEMES, ThemeName } from "../types";
import { Calendar, Globe, Volume2, ShieldAlert } from "lucide-react";

interface PostCardProps {
  post: Post;
  isEmbed?: boolean;
  onAdminClick?: () => void;
}

export default function PostCard({ post, isEmbed = false, onAdminClick }: PostCardProps) {
  const themeName = (post.theme || "warm") as ThemeName;
  const theme = THEMES[themeName] || THEMES.warm;

  // Format date nicely
  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  };

  // Safe split text with line breaks
  const renderTextBlocks = (text: string) => {
    return text.split("\n").map((block, idx) => {
      if (!block.trim()) return <div key={idx} className="h-2"></div>;
      return (
        <p key={idx} className={`${theme.textBody} text-sm md:text-base leading-relaxed mb-3`}>
          {block}
        </p>
      );
    });
  };

  const getMediaAspectRatioClass = (aspect: string) => {
    switch (aspect) {
      case "square":
        return "aspect-square object-cover";
      case "video":
        return "aspect-video object-cover";
      default:
        return "max-h-[500px] object-contain";
    }
  };

  const isEditorial = themeName === "editorial";

  return (
    <div
      id="root-card-container"
      className={`relative w-full ${isEmbed ? "p-3" : "py-8 px-4 md:py-12"} flex justify-center items-center`}
    >
      <div
        id="social-card-body"
        className={`w-full max-w-2xl ${
          isEditorial
            ? "rounded-none border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] hover:shadow-[8px_8px_0px_0px_#1A1A1A]"
            : `rounded-2xl border ${theme.border} shadow-xl hover:shadow-2xl`
        } ${theme.bgCard} overflow-hidden transition-all duration-300 transform`}
      >
        {/* Dynamic Theme Color Top Border/Bar */}
        {!isEditorial && <div className={`h-2.5 w-full ${theme.accent.split(" ")[0]}`} />}

        {/* Card Header */}
        <div
          id="card-header"
          className={`p-5 pb-3 md:p-6 md:pb-4 flex flex-wrap items-center justify-between gap-2 border-b ${
            isEditorial ? "border-[#1A1A1A]" : "border-gray-100/10"
          }`}
        >
          <div className="flex items-center gap-2">
            {post.langBadge && (
              <span
                id="lang-badge"
                className={`inline-flex items-center gap-1 px-3 py-1 ${
                  isEditorial ? "rounded-none font-sans font-bold" : "rounded-full"
                } text-xs font-semibold tracking-wider uppercase shadow-xs ${theme.badgeBg} ${theme.badgeText}`}
              >
                {post.langBadge}
              </span>
            )}
            <span className={`text-xs font-medium ${isEditorial ? "text-[#1A1A1A]/75 font-serif" : "text-gray-400 font-mono"} flex items-center gap-1`}>
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.createdAt)}
            </span>
          </div>

          {!isEmbed && onAdminClick && (
            <button
              onClick={onAdminClick}
              id="admin-trigger-header"
              className={`px-2.5 py-1 text-xs ${
                isEditorial
                  ? "text-[#1A1A1A] border-[#1A1A1A] hover:bg-black/5 font-serif rounded-none border-1.5"
                  : "text-gray-400 border-gray-200 dark:border-zinc-800 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg border"
              } flex items-center gap-1.5 transition-colors`}
              title="Accedi all'area riservata"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* Media Block */}
        {post.mediaType !== "none" && post.mediaUrl && (
          <div
            id="card-media-wrapper"
            className={`relative w-full overflow-hidden ${
              isEditorial ? "bg-zinc-200/50 border-b-2 border-[#1A1A1A] p-2" : "bg-black/5 border-b border-gray-100/10"
            } flex items-center justify-center`}
          >
            <div className={isEditorial ? "border border-[#1A1A1A] w-full h-full overflow-hidden relative" : "w-full h-full"}>
              {post.mediaType === "image" ? (
                <img
                  src={post.mediaUrl}
                  alt={post.title || "Post media"}
                  referrerPolicy="no-referrer"
                  id="post-media-image"
                  className={`w-full transition-transform duration-500 hover:scale-[1.01] ${getMediaAspectRatioClass(post.aspectRatio)}`}
                  loading="lazy"
                />
              ) : (
                <div className="relative w-full h-full bg-black">
                  <video
                    src={post.mediaUrl}
                    controls
                    playsInline
                    id="post-media-video"
                    className={`w-full ${getMediaAspectRatioClass(post.aspectRatio)}`}
                  >
                    Il tuo browser non supporta la riproduzione di video in HTML5.
                  </video>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card Content */}
        <div id="card-content" className="p-6 md:p-8">
          {post.title && (
            <h2
              id="post-title"
              className={`text-2xl md:text-3xl lg:text-4xl font-serif ${theme.textTitle} tracking-tight mb-4`}
            >
              {post.title}
            </h2>
          )}

          {isEditorial && <div className="w-16 h-0.5 bg-[#1A1A1A] mb-6"></div>}

          <div id="post-text" className="space-y-1">
            {renderTextBlocks(post.text)}
          </div>
        </div>

        {/* Footer info for simple attribution & secure entry for iframe/embeds */}
        <div
          id="card-footer"
          className={`px-6 py-4 border-t ${
            isEditorial
              ? "border-[#1A1A1A] text-[#1A1A1A] font-serif border-t-2"
              : "border-gray-100/10 text-gray-400"
          } flex items-center justify-between text-xs`}
        >
          <span className="flex items-center gap-1">
            <span>Angolo Sociale • Vivace e Integrato</span>
          </span>

          {onAdminClick && (
            <button
              onClick={onAdminClick}
              id="admin-embedded-trigger"
              className={`${
                isEditorial
                  ? "hover:underline text-[#1A1A1A] font-semibold"
                  : "hover:text-gray-600 dark:hover:text-zinc-200"
              } flex items-center gap-1 transition-colors`}
              title="Gestisci questo box"
            >
              <span>Accedi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
