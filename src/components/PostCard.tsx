import React, { useState, useEffect } from "react";
import { Post, THEMES, ThemeName } from "../types";
import {
  Calendar,
  Globe,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ThumbsUp,
  MoreHorizontal,
  Check,
  Music,
  Eye,
  Repeat,
  Share2,
  MessageSquare,
  ShieldAlert
} from "lucide-react";

interface PostCardProps {
  post: Post;
  isEmbed?: boolean;
  onAdminClick?: () => void;
}

export default function PostCard({ post, isEmbed = false, onAdminClick }: PostCardProps) {
  // Sync local client interaction states
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likesCount ?? 142);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [retweets, setRetweets] = useState(post.sharesCount ?? 12);
  const [comments, setComments] = useState(post.commentsCount ?? 28);
  const [shares, setShares] = useState(post.sharesCount ?? 12);
  const [hoveredHeart, setHoveredHeart] = useState(false);
  const [tiktokPlaying, setTiktokPlaying] = useState(true);

  // Sync state if backend/JSON changes
  useEffect(() => {
    setLikes(post.likesCount ?? 142);
    setComments(post.commentsCount ?? 28);
    setRetweets(post.sharesCount ?? 12);
    setShares(post.sharesCount ?? 12);
    setIsLiked(false);
    setIsBookmarked(false);
    setIsRetweeted(false);
  }, [post]);

  const themeName = (post.theme || "warm") as ThemeName;
  const theme = THEMES[themeName] || THEMES.warm;
  const socialStyle = post.socialStyle || "instagram";

  // Initials for avatar fallback
  const authorInitials = (post.authorName || "Scuola")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Handle like animations
  const handleLikeClick = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
    } else {
      setLikes((prev) => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleRetweetClick = () => {
    if (isRetweeted) {
      setRetweets((prev) => prev - 1);
    } else {
      setRetweets((prev) => prev + 1);
    }
    setIsRetweeted(!isRetweeted);
  };

  // Nice date formats
  const formatDateFull = (isoStr: string) => {
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
      return "Oggi";
    }
  };

  const formatDateTwitter = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "short"
      });
    } catch {
      return "1g";
    }
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

  const authorName = post.authorName || "Scuola di Lingua Roma";
  const authorHandle = post.authorHandle || "lingua_roma";

  // ----------------- 📸 INSTAGRAM SOCIAL STYLE -----------------
  if (socialStyle === "instagram") {
    return (
      <div id="instagram-card-view" className={`w-full max-w-xl mx-auto rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-md overflow-hidden font-sans transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-3">
            {/* Gradient stories circle */}
            <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 animate-pulse-slow">
              <div className="bg-white dark:bg-zinc-950 rounded-full p-[1.5px]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white text-[11.5px] font-bold tracking-wider uppercase shadow-inner">
                  {authorInitials}
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold hover:underline cursor-pointer tracking-tight">{authorHandle}</span>
                <span className="w-3.5 h-3.5 rounded-full bg-sky-500 flex items-center justify-center text-white text-[7px]" title="Verificato">
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </span>
                {post.langBadge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded ml-1 scale-90">
                    {post.langBadge}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 block -mt-0.5">Roma, Italia</span>
            </div>
          </div>
          <button onClick={onAdminClick} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
          </button>
        </div>

        {/* Media */}
        {post.mediaType !== "none" && post.mediaUrl ? (
          <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-900 relative">
            {post.mediaType === "image" ? (
              <img
                src={post.mediaUrl}
                alt={post.title}
                referrerPolicy="no-referrer"
                className={`w-full ${getMediaAspectRatioClass(post.aspectRatio)}`}
                loading="lazy"
              />
            ) : (
              <video
                src={post.mediaUrl}
                controls
                playsInline
                className={`w-full ${getMediaAspectRatioClass(post.aspectRatio)}`}
              />
            )}
          </div>
        ) : (
          <div className="h-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600" />
        )}

        {/* Social action icons */}
        <div className="p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLikeClick}
                className="hover:scale-110 active:scale-90 transition-transform"
                title="Mi piace"
              >
                <Heart className={`w-6 h-6 transition-colors ${isLiked ? "fill-red-500 text-red-500 animate-ping-once" : "text-zinc-800 dark:text-zinc-200 hover:text-red-500"}`} />
              </button>
              <button
                onClick={() => setComments(c => c + 1)}
                className="hover:scale-110 active:scale-95 transition-transform"
                title="Commenta"
              >
                <MessageCircle className="w-6 h-6 text-zinc-800 dark:text-zinc-200 hover:text-zinc-500 dark:hover:text-zinc-400" />
              </button>
              <button
                onClick={() => setShares(s => s + 1)}
                className="hover:scale-110 active:scale-95 transition-transform"
                title="Condividi"
              >
                <Send className="w-5.5 h-5.5 text-zinc-800 dark:text-zinc-200 hover:text-indigo-500" />
              </button>
            </div>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="hover:scale-110 active:scale-95 transition-transform"
              title="Salva"
            >
              <Bookmark className={`w-6 h-6 ${isBookmarked ? "fill-yellow-500 text-yellow-500" : "text-zinc-800 dark:text-zinc-200"}`} />
            </button>
          </div>

          {/* Social Stats */}
          <div className="space-y-1.5 text-sm">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Piace a <span className="font-extrabold">{likes}</span> persone
            </p>
            
            {post.title && (
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 tracking-tight mt-1">
                {post.title}
              </h3>
            )}

            <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed text-[13.5px]">
              <span className="font-bold mr-1.5 hover:underline cursor-pointer">{authorHandle}</span>
              <span className="whitespace-pre-line">{post.text}</span>
            </p>

            <span className="text-[10px] text-gray-400 dark:text-zinc-500 block uppercase font-medium tracking-wider pt-1.5">
              {formatDateFull(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Dynamic widget signature / comment input */}
        <div className="px-3.5 py-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs text-amber-600 font-semibold bg-zinc-50 dark:bg-zinc-900/60">
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500">Angolo Sociale • Widget Attivo</span>
          </span>
          {onAdminClick && (
            <button
              onClick={onAdminClick}
              className="hover:underline text-[11px]"
            >
              Modifica Post
            </button>
          )}
        </div>
      </div>
    );
  }

  // ----------------- 🐦 TWITTER / X SOCIAL STYLE -----------------
  if (socialStyle === "twitter") {
    return (
      <div id="twitter-card-view" className="w-full max-w-xl mx-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white shadow-sm p-4 font-sans transition-colors duration-300">
        <div className="flex gap-3">
          {/* Circular avatar on left */}
          <div className="shrink-0">
            <div className="w-[42px] h-[42px] rounded-full bg-zinc-900 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-900 flex items-center justify-center text-white text-sm font-bold tracking-tight uppercase">
              {authorInitials}
            </div>
          </div>

          {/* Right column */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Twitter Header info */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-[14.5px] text-zinc-900 dark:text-zinc-50 truncate hover:underline cursor-pointer">
                  {authorName}
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[7px] shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[4.5]" />
                </span>
                <span className="text-zinc-500 text-xs truncate">@{authorHandle}</span>
                <span className="text-zinc-400 text-xs shrink-0">·</span>
                <span className="text-zinc-500 text-[11.5px] truncate shrink-0" title={formatDateFull(post.createdAt)}>
                  {formatDateTwitter(post.createdAt)}
                </span>
              </div>
              <button onClick={onAdminClick} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                <MoreHorizontal className="w-4 h-4 ml-auto" />
              </button>
            </div>

            {/* Language Tag */}
            {post.langBadge && (
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40">
                {post.langBadge}
              </span>
            )}

            {/* Post Title */}
            {post.title && (
              <h4 className="text-[15.5px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                {post.title}
              </h4>
            )}

            {/* Body text */}
            <p className="text-[14px] text-zinc-850 dark:text-zinc-200 leading-[21px] whitespace-pre-line text-left">
              {post.text}
            </p>

            {/* Attached media module */}
            {post.mediaType !== "none" && post.mediaUrl && (
              <div className="relative overflow-hidden rounded-2xl border border-zinc-150 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/60 mt-2">
                {post.mediaType === "image" ? (
                  <img
                    src={post.mediaUrl}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className={`w-full ${getMediaAspectRatioClass(post.aspectRatio)}`}
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={post.mediaUrl}
                    controls
                    playsInline
                    className={`w-full ${getMediaAspectRatioClass(post.aspectRatio)}`}
                  />
                )}
              </div>
            )}

            {/* Action Bar / Status row */}
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[12.5px] pt-2 max-w-md w-full border-t border-zinc-100 dark:border-zinc-900 mt-2.5 pr-4">
              {/* Comment bubble */}
              <button
                onClick={() => setComments(c => c + 1)}
                className="flex items-center gap-1.5 group hover:text-sky-500 transition-colors"
                title="Rispondi"
              >
                <div className="p-1.5 rounded-full group-hover:bg-sky-500/10">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span>{comments}</span>
              </button>

              {/* Retweet Recycle */}
              <button
                onClick={handleRetweetClick}
                className={`flex items-center gap-1.5 group hover:text-emerald-500 transition-colors ${isRetweeted ? "text-emerald-500" : ""}`}
                title="Ripubblica"
              >
                <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10">
                  <Repeat className={`w-4 h-4 ${isRetweeted ? "rotate-180 duration-500 transition-transform" : ""}`} />
                </div>
                <span>{retweets}</span>
              </button>

              {/* Heart Likes */}
              <button
                onClick={handleLikeClick}
                className={`flex items-center gap-1.5 group hover:text-pink-600 transition-colors ${isLiked ? "text-pink-600" : ""}`}
                title="Mi piace"
              >
                <div className="p-1.5 rounded-full group-hover:bg-pink-500/10">
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-pink-600 text-pink-600 animate-ping-once" : ""}`} />
                </div>
                <span>{likes}</span>
              </button>

              {/* Views Mock */}
              <div className="flex items-center gap-1.5 text-zinc-400">
                <div className="p-1.5 rounded-full">
                  <Eye className="w-4 h-4" />
                </div>
                <span>2.4K</span>
              </div>

              {/* Share */}
              <button
                onClick={() => setShares(s => s + 1)}
                className="flex items-center group hover:text-sky-500 transition-colors"
                title="Condividi"
              >
                <div className="p-1.5 rounded-full group-hover:bg-sky-500/10">
                  <Share2 className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------- 👥 FACEBOOK / LINKEDIN SOCIAL STYLE -----------------
  if (socialStyle === "facebook") {
    return (
      <div id="facebook-card-view" className="w-full max-w-xl mx-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-md p-4 font-sans space-y-3.5 transition-colors duration-300">
        {/* Profile row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm border border-gray-100 tracking-wider">
              {authorInitials}
            </div>
            <div>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-bold text-[14.5px] hover:underline cursor-pointer text-zinc-950 dark:text-zinc-50">
                  {authorName}
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[7px]" title="Verificato">
                  <Check className="w-2.5 h-2.5 stroke-[4]" />
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10.5px] text-zinc-500 dark:text-zinc-400 -mt-0.5">
                <span>Scuola di Lingua</span>
                <span>·</span>
                <span title={formatDateFull(post.createdAt)}>Oggi</span>
                <span>·</span>
                <Globe className="w-3 h-3 block" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {post.langBadge && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 rounded-full">
                {post.langBadge}
              </span>
            )}
            <button onClick={onAdminClick} className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-800">
              <MoreHorizontal className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Content text block above media */}
        <div className="space-y-1 text-left">
          {post.title && (
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 tracking-tight">
              {post.title}
            </h3>
          )}
          <p className="text-[14px] text-zinc-850 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
            {post.text}
          </p>
        </div>

        {/* Attached large media */}
        {post.mediaType !== "none" && post.mediaUrl && (
          <div className="relative overflow-hidden bg-zinc-100 dark:bg-zinc-950 border-t border-b border-gray-100 dark:border-zinc-800 -mx-4">
            {post.mediaType === "image" ? (
              <img
                src={post.mediaUrl}
                alt={post.title}
                referrerPolicy="no-referrer"
                className={`w-full max-h-[500px] mx-auto ${getMediaAspectRatioClass(post.aspectRatio)}`}
                loading="lazy"
              />
            ) : (
              <video
                src={post.mediaUrl}
                controls
                playsInline
                className={`w-full max-h-[500px] mx-auto ${getMediaAspectRatioClass(post.aspectRatio)}`}
              />
            )}
          </div>
        )}

        {/* Reaction Stats summary row */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-b border-gray-100 dark:border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <span className="w-4.5 h-4.5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] border border-white">👍</span>
              <span className="w-4.5 h-4.5 rounded-full bg-red-500 flex items-center justify-center text-white text-[9px] border border-white">❤️</span>
            </div>
            <span className="hover:underline cursor-pointer ml-1">{likes} persone</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hover:underline cursor-pointer">{comments} commenti</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">{shares} condivisioni</span>
          </div>
        </div>

        {/* Facebook Actions panel */}
        <div className="grid grid-cols-3 text-center text-zinc-500 dark:text-zinc-400 text-xs font-semibold pt-1">
          <button
            onClick={handleLikeClick}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 ${isLiked ? "text-blue-600 dark:text-blue-400" : ""}`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Mi piace</span>
          </button>
          
          <button
            onClick={() => setComments(c => c + 1)}
            className="py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Commenta</span>
          </button>

          <button
            onClick={() => setShares(s => s + 1)}
            className="py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800"
          >
            <Share2 className="w-4 h-4" />
            <span>Condividi</span>
          </button>
        </div>
      </div>
    );
  }

  // ----------------- 🎵 TIKTOK SOCIAL STYLE -----------------
  if (socialStyle === "tiktok") {
    return (
      <div id="tiktok-card-view" className="w-full max-w-[370px] mx-auto aspect-[9/16] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden font-sans relative text-white transition-all duration-300 flex flex-col justify-end">
        {/* Absolute Background Media - spans full container height */}
        {post.mediaType !== "none" && post.mediaUrl ? (
          <div className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
            {post.mediaType === "image" ? (
              <img
                src={post.mediaUrl}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-90 filter brightness-95"
                loading="lazy"
              />
            ) : (
              <video
                src={post.mediaUrl}
                controls={false}
                autoPlay={tiktokPlaying}
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-90 filter brightness-95 spin-target"
              />
            )}
            {/* Soft dark vignette gradients */}
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-zinc-900 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="p-3 bg-zinc-800/50 rounded-full border border-teal-500 animate-pulse">
              <Music className="w-10 h-10 text-teal-400" />
            </div>
            <p className="text-zinc-400 text-xs">Carica una foto/video nell'admin per un'esperienza TikTok immersiva!</p>
          </div>
        )}

        {/* Absolute Top widgets */}
        <div className="absolute top-4 inset-x-4 z-25 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-white/10">
            <span className="text-[10px] font-bold text-teal-400 tracking-wide uppercase">TikTok Mode</span>
          </div>

          <div className="flex items-center gap-2">
            {post.langBadge && (
              <span className="text-[10px] font-semibold bg-red-600 text-white px-2 py-0.5 rounded">
                Live badge: {post.langBadge}
              </span>
            )}
            <button onClick={onAdminClick} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border border-white/10 hover:bg-black/60 text-white">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Right Side Action Column */}
        <div className="absolute right-3.5 bottom-24 z-20 flex flex-col items-center gap-4.5 text-center">
          {/* Avatar with Pink plus sign */}
          <div className="relative mb-2">
            <div className="w-11 h-11 rounded-full border-2 border-white bg-teal-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-lg">
              {authorInitials}
            </div>
            <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full bg-rose-500 border border-white flex items-center justify-center text-white text-[11px] font-extrabold pb-0.5 hover:scale-110 active:scale-95 transition-transform cursor-pointer">
              +
            </button>
          </div>

          {/* Glowing Heart Like */}
          <button onClick={handleLikeClick} className="flex flex-col items-center group">
            <div className="w-10.5 h-10.5 rounded-full bg-black/35 backdrop-blur-xs flex items-center justify-center border border-white/5 group-hover:scale-110 active:scale-90 transition-all">
              <Heart className={`w-5.5 h-5.5 ${isLiked ? "text-rose-500 fill-rose-500 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "text-white"}`} />
            </div>
            <span className="text-[11.5px] font-semibold text-zinc-150 drop-shadow-sm mt-1">{likes}</span>
          </button>

          {/* Comment Balloon */}
          <button onClick={() => setComments(c => c + 1)} className="flex flex-col items-center group">
            <div className="w-10.5 h-10.5 rounded-full bg-black/35 backdrop-blur-xs flex items-center justify-center border border-white/5 group-hover:scale-110 active:scale-95 transition-all">
              <MessageCircle className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-[11.5px] font-semibold text-zinc-150 drop-shadow-sm mt-1">{comments}</span>
          </button>

          {/* Save Star */}
          <button onClick={() => setIsBookmarked(!isBookmarked)} className="flex flex-col items-center group">
            <div className="w-10.5 h-10.5 rounded-full bg-black/35 backdrop-blur-xs flex items-center justify-center border border-white/5 group-hover:scale-110 active:scale-95 transition-all">
              <Bookmark className={`w-5.5 h-5.5 ${isBookmarked ? "text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-white"}`} />
            </div>
            <span className="text-[11.5px] font-semibold text-zinc-150 drop-shadow-sm mt-1">Saves</span>
          </button>

          {/* Share Block */}
          <button onClick={() => setShares(s => s + 1)} className="flex flex-col items-center group">
            <div className="w-10.5 h-10.5 rounded-full bg-black/35 backdrop-blur-xs flex items-center justify-center border border-white/5 group-hover:scale-110 active:scale-95 transition-all">
              <Send className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11.5px] font-semibold text-zinc-150 drop-shadow-sm mt-1">{shares}</span>
          </button>
        </div>

        {/* Bottom Left Captions Overlay */}
        <div className="p-4 z-10 w-[78%] space-y-2 text-left text-white drop-shadow-md select-none">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-teal-400 hover:underline cursor-pointer">@{authorHandle}</span>
            <span className="w-3.5 h-3.5 rounded-full bg-sky-400 flex items-center justify-center text-white text-[7px]" title="Verificato">
              <Check className="w-2.5 h-2.5 stroke-[4.5]" />
            </span>
          </div>

          {post.title && (
            <h4 className="text-[13px] font-extrabold tracking-tight text-white line-clamp-1">
              {post.title}
            </h4>
          )}

          <p className="text-[12.5px] leading-[18px] text-zinc-100 font-normal line-clamp-3 overflow-hidden">
            {post.text}
          </p>

          {/* Scrolling Audio Label & Disk */}
          <div className="flex items-center gap-2 pt-1">
            <Music className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
            <div className="w-full overflow-hidden whitespace-nowrap text-[11px] text-zinc-300 relative h-4">
              <span className="absolute animate-marquee block">
                Suono originale - @{authorHandle} - Scuola di Lingua
              </span>
            </div>
          </div>
        </div>

        {/* Spinning Vinyl Record (Infinite rotate) */}
        <div className="absolute right-4 bottom-4 z-15">
          <div className="w-9 h-9 rounded-full bg-zinc-900 border-2 border-zinc-700/80 flex items-center justify-center animate-spin relative overflow-hidden shadow-md">
            <div className="w-2 h-2 rounded-full bg-teal-400 z-10" />
            <div className="absolute inset-0 bg-radial-gradient-vinyl opacity-35" />
          </div>
        </div>

        {/* CSS for marquee styling in TikTok inside card */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee {
            0% { transform: translate3d(100%, 0, 0); }
            100% { transform: translate3d(-100%, 0, 0); }
          }
          .animate-marquee {
            animation: marquee 12s linear infinite;
          }
          .animate-pulse-slow {
            animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .animate-ping-once {
            animation: ping 0.5s cubic-bezier(0, 0, 0.2, 1) 1;
          }
          .bg-radial-gradient-vinyl {
            background: repeating-radial-gradient(circle, #000, #000 2px, #333 3px, #000 4px);
          }
        `}} />
      </div>
    );
  }

  // ----------------- 📰 STANDARD/EDITORIAL RETRO RETREAT (DEFAULT FALLBACK) -----------------
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
              {formatDateFull(post.createdAt)}
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
            {post.text.split("\n").map((block, idx) => {
              if (!block.trim()) return <div key={idx} className="h-2"></div>;
              return (
                <p key={idx} className={`${theme.textBody} text-sm md:text-base leading-relaxed mb-3`}>
                  {block}
                </p>
              );
            })}
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
