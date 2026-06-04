import React, { useState, useEffect } from "react";
import { Post, THEMES, ThemeName } from "./types";
import PostCard from "./components/PostCard";
import AdminPanel from "./components/AdminPanel";
import { Globe, ShieldAlert, Sparkles, SlidersHorizontal, RefreshCw } from "lucide-react";

const LOCAL_STORAGE_KEY = "social_board_post_fallback";

const DEFAULT_POST: Post = {
  title: "Un Caffè a Roma ☕",
  text: "Benvenuti nel nostro Angolo Sociale! Questo è un angolo speciale dedicato a tutti gli studenti di lingua.\n\nDa qui puoi caricare istantanee dei tuoi eventi, foto storiche della scuola o pillole video personali con spiegazioni veloci dei vocaboli quotidiani.\n\nContenuto aggiornabile in tempo reale in tutta semplicità!",
  mediaType: "none",
  mediaUrl: "",
  mediaName: "",
  createdAt: new Date().toISOString(),
  theme: "editorial",
  langBadge: "In Evidenza",
  aspectRatio: "auto",
  socialStyle: "instagram",
  authorName: "Scuola di Lingua Roma",
  authorHandle: "lingua_roma",
  likesCount: 142,
  commentsCount: 28,
  sharesCount: 12
};

export default function App() {
  const [post, setPost] = useState<Post | null>(null);
  const [hasDefaultPassword, setHasDefaultPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showAdmin, setShowAdmin] = useState(true);

  // Parse embed parameter from the URL query params
  const [isEmbed, setIsEmbed] = useState(false);

  useEffect(() => {
    // Determine if embed mode is turned on via URL query string
    const params = new URLSearchParams(window.location.search);
    setIsEmbed(params.get("embed") === "true" || params.get("mode") === "widget");

    // Automatically open admin view if explicitly requested in URL (e.g. ?mode=admin)
    if (params.get("mode") === "admin" || params.get("admin") === "true") {
      setShowAdmin(true);
    }

    fetchPost();
  }, []);

  const fetchPost = async () => {
    setIsLoading(true);
    setErrorMsg("");
    
    // Priority 1: Try to load static post.json directly
    try {
      const res = await fetch("/post.json");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          const loadedPost = data.post || data;
          if (loadedPost && (loadedPost.title || loadedPost.text)) {
            setPost(loadedPost);
            setHasDefaultPassword(false);
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loadedPost));
            } catch (storageErr) {
              console.warn("Could not persist initial fetch to localStorage:", storageErr);
            }
            setIsLoading(false);
            return;
          }
        }
      }
      loadFromFallback();
    } catch (err) {
      loadFromFallback();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromFallback = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setPost(JSON.parse(saved));
        setHasDefaultPassword(false);
        return;
      } catch (e) {
        // ignore parse errors
      }
    }
    setPost(DEFAULT_POST);
    setHasDefaultPassword(false);
  };

  const handlePostUpdated = (newPost: Post) => {
    setPost(newPost);
    // Instant save to localStorage safely so storage quota issues don't crash the React context
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newPost));
    } catch (storageErr) {
      console.warn("Could not persist live updates to localStorage:", storageErr);
    }
  };

  if (isLoading) {
    return (
      <div id="loading-spinner" className="flex flex-col items-center justify-center min-h-[400px] py-16 space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500 font-mono">Caricamento Angolo Sociale...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div id="error-screen" className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-red-500/5 border border-red-500/15 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-red-700">Ops! Si è verificato un errore</h3>
        <p className="text-sm text-red-600/90 leading-relaxed">{errorMsg}</p>
        <button
          onClick={fetchPost}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
        >
          Riprova Caricamento
        </button>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const themeName = (post.theme || "warm") as ThemeName;
  const theme = THEMES[themeName] || THEMES.warm;
  const clientAppUrl = window.location.origin;

  // Render fully bare for embedded widget version
  if (isEmbed) {
    return (
      <div id="embedded-widget-wrapper" className="w-full h-full bg-transparent overflow-hidden antialiased">
        {showAdmin ? (
          <div className="p-4 bg-zinc-950 min-h-screen">
            <AdminPanel
              currentPost={post}
              onPostUpdated={handlePostUpdated}
              onClose={() => setShowAdmin(false)}
              appUrl={clientAppUrl}
            />
          </div>
        ) : (
          <PostCard
            post={post}
            isEmbed={true}
            onAdminClick={() => setShowAdmin(true)}
          />
        )}
      </div>
    );
  }

  // Full demonstration mode with clean typography & outer layouts for previewing!
  return (
    <div className={`min-h-screen ${theme.bgPage} transition-colors duration-300 flex flex-col antialiased`}>
      {/* Top Banner Guide - ONLY shown in standalone mode to help user set it up! */}
      <header className="bg-white border-b border-gray-200/80 py-4.5 px-6 shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 tracking-tight">Angolo Sociale per Siti Web</h1>
              <p className="text-[11px] text-gray-500">Usa questo portale per aggiornare e testare il tuo widget iframe</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              id="admin-toggle-nav"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                showAdmin
                  ? "bg-zinc-950 text-white hover:bg-zinc-900"
                  : "bg-amber-500 hover:bg-amber-400 text-zinc-950"
              }`}
            >
              {showAdmin ? (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Visualizza Widget</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Gestisci & Incorpora</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>
      {/* Main Layout Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center items-center">
        {showAdmin ? (
          <div className="w-full">
            <AdminPanel
              currentPost={post}
              onPostUpdated={handlePostUpdated}
              onClose={() => setShowAdmin(false)}
              appUrl={clientAppUrl}
            />
          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold tracking-wider uppercase font-mono shadow-xs">
                <Sparkles className="w-3 h-3" /> Area Preview Widget
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                L'Angolo Sociale in tempo reale
              </h2>
              <p className="text-sm text-gray-500 max-w-lg mx-auto">
                Così appare il widget sui tuoi siti web. Se vuoi vedere la versione compatta da iframe, clicca su "Incorpora l'Iframe" nel pannello di amministrazione.
              </p>
            </div>

            <PostCard
              post={post}
              isEmbed={false}
              onAdminClick={() => setShowAdmin(true)}
            />
          </div>
        )}
      </main>

      {/* Sticky footer info */}
      <footer className="py-6 border-t border-gray-200/50 bg-white/40 text-center text-xs text-gray-400 relative z-30">
        <p>© 2026 Angolo Sociale • Progettato per facilità d'uso e integrazione Iframe immediata.</p>
      </footer>
    </div>
  );
}
