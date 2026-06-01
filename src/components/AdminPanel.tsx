import React, { useState, useRef, useEffect } from "react";
import { Post, THEMES, ThemeName } from "../types";
import PostCard from "./PostCard";
import {
  FileImage,
  FileVideo,
  Sparkles,
  Code,
  Copy,
  Save,
  RefreshCw,
  X,
  Info,
  Check,
  LayoutGrid,
  Download,
  Upload
} from "lucide-react";

interface AdminPanelProps {
  currentPost: Post;
  onPostUpdated: (newPost: Post) => void;
  onClose: () => void;
  appUrl: string;
}

export default function AdminPanel({ currentPost, onPostUpdated, onClose, appUrl }: AdminPanelProps) {
  // Form edit elements state
  const [title, setTitle] = useState(currentPost.title);
  const [langBadge, setLangBadge] = useState(currentPost.langBadge);
  const [text, setText] = useState(currentPost.text);
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">(currentPost.mediaType);
  const [aspectRatio, setAspectRatio] = useState(currentPost.aspectRatio || "auto");
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>((currentPost.theme as ThemeName) || "warm");

  // Nuove opzioni per stile Social
  const [socialStyle, setSocialStyle] = useState<"instagram" | "facebook" | "twitter" | "tiktok" | "standard">(currentPost.socialStyle || "instagram");
  const [authorName, setAuthorName] = useState(currentPost.authorName || "Scuola di Lingua Roma");
  const [authorHandle, setAuthorHandle] = useState(currentPost.authorHandle || "lingua_roma");
  const [likesCount, setLikesCount] = useState<number>(currentPost.likesCount ?? 142);
  const [commentsCount, setCommentsCount] = useState<number>(currentPost.commentsCount ?? 28);
  const [sharesCount, setSharesCount] = useState<number>(currentPost.sharesCount ?? 12);

  // File uploading states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaBase64, setMediaBase64] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string>(currentPost.mediaUrl || "");

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ success: false, message: "" });
  const [copied, setCopied] = useState(false);
  const [htmlCopied, setHtmlCopied] = useState(false);
  const [activeEmbedTab, setActiveEmbedTab] = useState<"iframe" | "static">("iframe");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // Instant real-time synchronization to ensure App updates without submitting manually
  useEffect(() => {
    const updated: Post = {
      title,
      text,
      mediaType,
      mediaUrl: filePreview,
      mediaName: selectedFile ? selectedFile.name : currentPost.mediaName || "",
      theme: selectedTheme,
      langBadge,
      aspectRatio,
      createdAt: currentPost.createdAt || new Date().toISOString(),
      socialStyle,
      authorName,
      authorHandle,
      likesCount,
      commentsCount,
      sharesCount
    };
    onPostUpdated(updated);
  }, [
    title,
    text,
    mediaType,
    filePreview,
    selectedTheme,
    langBadge,
    aspectRatio,
    socialStyle,
    authorName,
    authorHandle,
    likesCount,
    commentsCount,
    sharesCount
  ]);

  // Create a real-time preview post object matching current admin fields state
  const previewPost: Post = {
    title,
    text,
    mediaType,
    mediaUrl: filePreview,
    mediaName: selectedFile ? selectedFile.name : currentPost.mediaName || "",
    theme: selectedTheme,
    langBadge,
    aspectRatio,
    createdAt: currentPost.createdAt || new Date().toISOString(),
    socialStyle,
    authorName,
    authorHandle,
    likesCount,
    commentsCount,
    sharesCount
  };

  // Export current post parameters as a self-contained portable post.json file
  const handleExportJson = () => {
    try {
      const portablePost = {
        title,
        text,
        mediaType,
        // If they have uploaded/loaded a Local file (represented as base64 string in mediaBase64),
        // we write that directly as the mediaUrl! This makes the downloaded JSON 100% self-contained,
        // so it renders the picture/video on any host (WordPress, custom site) without needing any server database!
        mediaUrl: mediaBase64 || filePreview || "",
        mediaName: selectedFile ? selectedFile.name : currentPost.mediaName || "",
        theme: selectedTheme,
        langBadge,
        aspectRatio,
        createdAt: new Date().toISOString(),
        socialStyle,
        authorName,
        authorHandle,
        likesCount,
        commentsCount,
        sharesCount
      };

      const jsonStr = JSON.stringify(portablePost, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "post.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSaveStatus({
        success: true,
        message: "File 'post.json' scaricato con successo! Inserisci questo file nella cartella corretta del tuo sito web per aggiornare le info."
      });
    } catch (err) {
      alert("Errore durante la creazione del file JSON per l'esportazione.");
    }
  };

  // Import existing post configuration from uploaded JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawData = JSON.parse(event.target?.result as string);
        const importedPost = rawData.post || rawData;

        if (importedPost && (importedPost.title !== undefined || importedPost.text !== undefined)) {
          setTitle(importedPost.title || "");
          setText(importedPost.text || "");
          setLangBadge(importedPost.langBadge || "");
          setMediaType(importedPost.mediaType || "none");
          setAspectRatio(importedPost.aspectRatio || "auto");
          setSelectedTheme((importedPost.theme as ThemeName) || "warm");
          
          // Nuovi parametri social importati con default intelligenti
          setSocialStyle(importedPost.socialStyle || "instagram");
          setAuthorName(importedPost.authorName || "Scuola di Lingua Roma");
          setAuthorHandle(importedPost.authorHandle || "lingua_roma");
          setLikesCount(importedPost.likesCount ?? 142);
          setCommentsCount(importedPost.commentsCount ?? 28);
          setSharesCount(importedPost.sharesCount ?? 12);
          
          const url = importedPost.mediaUrl || "";
          setFilePreview(url);
          if (url.startsWith("data:")) {
            setMediaBase64(url);
          } else {
            setMediaBase64("");
          }

          setSaveStatus({
            success: true,
            message: "Configurazione da 'post.json' caricata con successo nell'editor! Clicca su 'Pubblica Aggiornamento' per trasmettere in tempo reale, oppure genera modifiche e scarica di nuovo."
          });
        } else {
          alert("File JSON non valido. Deve contenere i dati strutturati dell'Angolo Sociale.");
        }
      } catch (err) {
        alert("Errore durante la decodifica del file JSON. Assicurati che sia leggibile.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset
  };

  // Convert files to base64 properly
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit files to a maximum of 60MB for upload directly through state
    const MAX_SIZE = 60 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("Il video/file è troppo grande. Il limite massimo supportato per il caricamento è 60MB. Seleziona un file compresso o più breve.");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setMediaBase64(base64String);
      setFilePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleMediaTypeChange = (type: "none" | "image" | "video") => {
    setMediaType(type);
    if (type === "none") {
      setFilePreview("");
      setSelectedFile(null);
      setMediaBase64("");
    } else if (type === currentPost.mediaType) {
      setFilePreview(currentPost.mediaUrl);
    } else {
      setFilePreview("");
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus({ success: false, message: "" });

    try {
      const localUpdatedPost: Post = {
        title,
        text,
        mediaType,
        // Save base64 string directly as mediaUrl so it remains self-contained
        mediaUrl: mediaBase64 || filePreview || "",
        mediaName: selectedFile ? selectedFile.name : currentPost.mediaName || "",
        theme: selectedTheme,
        langBadge,
        aspectRatio,
        createdAt: new Date().toISOString(),
        socialStyle,
        authorName,
        authorHandle,
        likesCount,
        commentsCount,
        sharesCount
      };

      // Call onPostUpdated trigger to update App component's post state and write to localStorage
      onPostUpdated(localUpdatedPost);

      setSaveStatus({
        success: true,
        message: "Anteprima aggiornata con successo! Per caricarla stabilmente sul tuo sito, scarica il file 'post.json' sulla destra."
      });

      // Clear pending upload files state but keep current updated media preview
      setSelectedFile(null);
      setMediaBase64("");
      if (localUpdatedPost.mediaUrl) {
        setFilePreview(localUpdatedPost.mediaUrl);
      }
    } catch (err) {
      setSaveStatus({ success: false, message: "Errore durante l'aggiornamento dell'anteprima locale." });
    } finally {
      setIsSaving(false);
    }
  };

  // Embed generation logic
  const getEmbedSnippet = () => {
    const cleanUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
    return `<iframe src="${cleanUrl}/?embed=true" width="100%" height="650" style="border:none; border-radius:16px; overflow:hidden; background:transparent;" title="Angolo Sociale"></iframe>`;
  };

  const getStaticHtmlSnippet = () => {
    return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget Angolo Sociale</title>
  <!-- Tailwind CSS per la grafica e lo stile -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide icons cdn -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
    body { font-family: 'Inter', sans-serif; }
    @keyframes marquee {
      0% { transform: translate3d(100%, 0, 0); }
      100% { transform: translate3d(-100%, 0, 0); }
    }
    .animate-marquee {
      animation: marquee 14s linear infinite;
    }
  </style>
</head>
<body class="bg-transparent p-2">

  <!-- ID del contenitore del widget -->
  <div id="angolo-sociale-root" class="w-full max-w-xl mx-auto">
    <div class="p-6 text-center text-zinc-400 font-mono text-xs">Caricamento widget...</div>
  </div>

  <script>
    // Caricamento asincrono del file JSON locale
    fetch('post.json')
      .then(res => {
        if (!res.ok) throw new Error('File post.json non trovato. Assicurati che sia nella stessa cartella della pagina.');
        return res.json();
      })
      .then(data => {
        const post = data.post || data;
        renderWidget(post);
        // Richiama i simboli grafici di Lucide
        lucide.createIcons();
      })
      .catch(err => {
        document.getElementById('angolo-sociale-root').innerHTML = \`
          <div style="background:#fef2f2; border:1px solid #fee2e2; color:#b91c1c; padding:16px; border-radius:12px; text-align:center; font-size:13px;">
            <strong style="display:block; margin-bottom:4px;">Errore caricamento dati</strong>
            \${err.message}
            <div style="color:#6b7280; font-size:10px; margin-top:10px;">Assicurati che il file 'post.json' scaricato sia nella stessa cartella di questa pagina HTML.</div>
          </div>
        \`;
      });

    function renderWidget(post) {
      const root = document.getElementById('angolo-sociale-root');
      const style = post.socialStyle || 'instagram';
      const initials = (post.authorName || 'SL')
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      
      const author = post.authorName || 'Scuola di Lingua';
      const handle = post.authorHandle || 'lingua_roma';
      const badge = post.langBadge ? \`<span style="background:#f0fdfa; color:#115e59; font-weight:700; font-size:9px; padding:2px 6px; border-radius:4px; margin-left:6px; border:1px solid #ccfbf1;">\${post.langBadge}</span>\` : '';

      // Gestione Media (Immagine / Video)
      let mediaHtml = '';
      if (post.mediaType && post.mediaType !== 'none' && post.mediaUrl) {
        let aspectClass = 'max-h-[480px] object-contain';
        if (post.aspectRatio === 'square') aspectClass = 'aspect-square object-cover';
        if (post.aspectRatio === 'video') aspectClass = 'aspect-video object-cover';

        if (post.mediaType === 'image') {
          mediaHtml = \`<div class="bg-zinc-50 border-b border-zinc-100 overflow-hidden relative">
            <img src="\${post.mediaUrl}" class="w-full \${aspectClass}" style="display:block;" />
          </div>\`;
        } else if (post.mediaType === 'video') {
          mediaHtml = \`<div class="bg-zinc-50 border-b border-zinc-100 overflow-hidden relative">
            <video src="\${post.mediaUrl}" controls class="w-full \${aspectClass}" style="display:block; max-height: 480px;"></video>
          </div>\`;
        }
      }

      // Render Layout
      if (style === 'instagram') {
        root.innerHTML = \`
          <div class="rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-sm overflow-hidden font-sans">
            <div class="flex items-center justify-between p-3.5 border-b border-zinc-100">
              <div class="flex items-center gap-2.5">
                <div class="p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600">
                  <div class="bg-white rounded-full p-[1.5px]">
                    <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-[10px] font-bold tracking-wider uppercase">\${initials}</div>
                  </div>
                </div>
                <div>
                  <div class="flex items-center gap-1">
                    <span class="text-xs font-bold leading-none">\${handle}</span>
                    <span class="text-sky-500 text-[10px]" title="Verificato">✓</span>
                    \${badge}
                  </div>
                  <span class="text-[9.5px] text-gray-400 block mt-0.5">Roma, Italia</span>
                </div>
              </div>
              <button class="text-gray-400 p-1"><i data-lucide="more-horizontal" class="w-5 h-5"></i></button>
            </div>

            \${mediaHtml ? mediaHtml : '<div class="h-1 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600"></div>'}

            <div class="p-4 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 text-zinc-800">
                  <button class="hover:text-red-500 transition-colors"><i data-lucide="heart" class="w-6 h-6"></i></button>
                  <button class="hover:text-zinc-500 transition-colors"><i data-lucide="message-circle" class="w-6 h-6"></i></button>
                  <button class="hover:text-zinc-500 transition-colors"><i data-lucide="send" class="w-5.5 h-5.5"></i></button>
                </div>
                <button class="text-zinc-800"><i data-lucide="bookmark" class="w-6 h-6"></i></button>
              </div>

              <div class="space-y-1 text-sm">
                <p class="font-bold">Piace a <span class="font-extrabold">\${post.likesCount || 0}</span> persone</p>
                \${post.title ? \`<h4 class="font-extrabold text-base tracking-tight text-zinc-950 mt-1">\${post.title}</h4>\` : ''}
                <p class="text-zinc-800 leading-relaxed text-[13px] mt-1">
                  <span class="font-bold mr-1">\${handle}</span>
                  <span class="whitespace-pre-line">\${post.text}</span>
                </p>
                <span class="text-[9px] text-zinc-400 block uppercase tracking-wider pt-2">Aggiornato</span>
              </div>
            </div>
          </div>
        \`;
      } else if (style === 'twitter') {
        root.innerHTML = \`
          <div class="rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-sm p-4 font-sans">
            <div class="flex gap-3">
              <div class="shrink-0">
                <div class="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center text-xs">\${initials}</div>
              </div>
              <div class="flex-1 min-w-0 space-y-2">
                <div class="flex items-center justify-between gap-1">
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="font-bold text-[14px] hover:underline">\${author}</span>
                    <span class="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[7px]">✓</span>
                    <span class="text-zinc-400 text-xs font-normal">@\${handle}</span>
                    <span class="text-zinc-400 text-xs">·</span>
                    <span class="text-zinc-400 text-[11px]">Oggi</span>
                  </div>
                  <i data-lucide="more-horizontal" class="w-4 h-4 text-zinc-400"></i>
                </div>
                \${badge ? \`<div class="pb-1">\${badge}</div>\` : ''}
                \${post.title ? \`<h4 class="font-bold text-[15px] text-zinc-950">\${post.title}</h4>\` : ''}
                <p class="text-[13.5px] text-zinc-800 leading-relaxed whitespace-pre-line">\${post.text}</p>
                \${mediaHtml ? \`<div class="mt-2 rounded-xl overflow-hidden border border-zinc-150 bg-zinc-50">\${mediaHtml}</div>\` : ''}
                
                <div class="flex items-center justify-between text-zinc-500 text-xs pt-1.5 border-t border-zinc-100 mt-3 max-w-md w-full">
                  <button class="flex items-center gap-1 hover:text-sky-500"><i data-lucide="message-circle" class="w-4 h-4"></i><span>\${post.commentsCount || 0}</span></button>
                  <button class="flex items-center gap-1 hover:text-emerald-500"><i data-lucide="repeat" class="w-4 h-4"></i><span>\${post.sharesCount || 0}</span></button>
                  <button class="flex items-center gap-1 hover:text-pink-600"><i data-lucide="heart" class="w-4 h-4"></i><span>\${post.likesCount || 0}</span></button>
                  <button class="p-1 hover:text-sky-500"><i data-lucide="share" class="w-4 h-4"></i></button>
                </div>
              </div>
            </div>
          </div>
        \`;
      } else if (style === 'facebook') {
        root.innerHTML = \`
          <div class="rounded-2xl border border-zinc-200 bg-white shadow-sm p-4 font-sans space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">\${initials}</div>
                <div>
                  <div class="flex items-center gap-1">
                    <span class="font-bold text-sm hover:underline">\${author}</span>
                    <span class="text-blue-500 text-xs">✓</span>
                  </div>
                  <div class="flex items-center gap-1 text-[10px] text-zinc-500">
                    <span>Scuola</span>
                    <span>·</span>
                    <span>Oggi</span>
                    <span>·</span>
                    <i data-lucide="globe" class="w-3 h-3"></i>
                  </div>
                </div>
              </div>
              \${badge}
            </div>

            <div class="space-y-1">
              \${post.title ? \`<h1 class="font-bold text-[15px] text-zinc-950">\${post.title}</h1>\` : ''}
              <p class="text-[13px] text-zinc-800 leading-relaxed whitespace-pre-line">\${post.text}</p>
            </div>

            \${mediaHtml ? \`<div class="-mx-4 border-t border-b border-zinc-100 bg-zinc-50">\${mediaHtml}</div>\` : ''}

            <div class="flex items-center justify-between text-[11px] text-zinc-500 pb-1 border-b border-zinc-100">
              <span>👍 \${post.likesCount || 0} persone</span>
              <span>\${post.commentsCount || 0} commenti · \${post.sharesCount || 0} condivisioni</span>
            </div>

            <div class="grid grid-cols-3 text-center text-zinc-500 text-xs font-semibold pt-1">
              <button class="py-1.5 hover:bg-zinc-50 flex items-center justify-center gap-1.5 rounded"><i data-lucide="thumbs-up" class="w-4 h-4"></i><span>Mi piace</span></button>
              <button class="py-1.5 hover:bg-zinc-50 flex items-center justify-center gap-1.5 rounded"><i data-lucide="message-square" class="w-4 h-4"></i><span>Commenta</span></button>
              <button class="py-1.5 hover:bg-zinc-50 flex items-center justify-center gap-1.5 rounded"><i data-lucide="share" class="w-4 h-4"></i><span>Condividi</span></button>
            </div>
          </div>
        \`;
      } else if (style === 'tiktok') {
        const hasMedia = post.mediaType && post.mediaType !== 'none' && post.mediaUrl;
        const tiktokMedia = hasMedia 
          ? (post.mediaType === 'image' 
              ? \`<img src="\${post.mediaUrl}" class="w-full h-full object-cover opacity-90 brightness-95" />\`
              : \`<video src="\${post.mediaUrl}" autoplay loop muted playsinline class="w-full h-full object-cover opacity-90 brightness-50"></video>\`)
          : \`<div class="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <i data-lucide="music" class="w-10 h-10 text-teal-400 animate-pulse"></i>
              <p class="text-zinc-500 text-xs font-mono">Modalità TikTok</p>
             </div>\`;

        root.innerHTML = \`
          <div class="w-full max-w-[360px] mx-auto aspect-[9/16] rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden font-sans relative text-white flex flex-col justify-end">
            <div class="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
              \${tiktokMedia}
              <div class="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>
            </div>
            
            <div class="absolute right-3.5 bottom-24 z-20 flex flex-col items-center gap-4 text-center text-white">
              <div class="relative mb-2">
                <div class="w-10 h-10 rounded-full border-2 border-white bg-zinc-800 flex items-center justify-center text-xs font-bold uppercase shadow-lg">\${initials}</div>
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 border border-white flex items-center justify-center text-[9px] font-bold">+</div>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-9.5 h-9.5 rounded-full bg-black/35 flex items-center justify-center border border-white/5"><i data-lucide="heart" class="w-4.5 h-4.5 text-white"></i></div>
                <span class="text-[10px] whitespace-nowrap mt-1 font-semibold text-white">\${post.likesCount || 0}</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-9.5 h-9.5 rounded-full bg-black/35 flex items-center justify-center border border-white/5"><i data-lucide="message-circle" class="w-4.5 h-4.5 text-white"></i></div>
                <span class="text-[10px] whitespace-nowrap mt-1 font-semibold text-white">\${post.commentsCount || 0}</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-9.5 h-9.5 rounded-full bg-black/35 flex items-center justify-center border border-white/5"><i data-lucide="bookmark" class="w-4.5 h-4.5 text-white"></i></div>
                <span class="text-[10px] whitespace-nowrap mt-1 font-semibold text-white">Saves</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-9.5 h-9.5 rounded-full bg-black/35 flex items-center justify-center border border-white/5"><i data-lucide="send" class="w-4.5 h-4.5 text-white"></i></div>
                <span class="text-[10px] whitespace-nowrap mt-1 font-semibold text-white">\${post.sharesCount || 0}</span>
              </div>
            </div>

            <!-- Bottom Left Info -->
            <div class="p-4 z-10 w-[78%] space-y-2 text-left text-white drop-shadow pb-5">
              <div class="flex items-center gap-1">
                <span class="text-xs font-bold text-teal-300">@\${handle}</span>
                <span class="w-3.5 h-3.5 rounded-full bg-sky-400 flex items-center justify-center text-[7px] text-white">✓</span>
              </div>
              \${post.title ? \`<h4 class="text-xs font-semibold text-white">\${post.title}</h4>\` : ''}
              <p class="text-[11.5px] leading-relaxed text-zinc-200 line-clamp-3 font-light">\text</p>
              <div class="flex items-center gap-2 pt-1">
                <i data-lucide="music" class="w-3.5 h-3.5 text-zinc-300 shrink-0"></i>
                <div class="w-full overflow-hidden whitespace-nowrap text-[9px] text-zinc-300 relative h-3.5">
                  <span class="absolute animate-marquee block">Suono originale - @\${handle}</span>
                </div>
              </div>
            </div>

            <div class="absolute right-4 bottom-4 z-15">
              <div class="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center animate-spin" style="animation-duration: 4s;">
                <div class="w-2 h-2 rounded-full bg-teal-400"></div>
              </div>
            </div>
          </div>
        \`;
      } else {
        // Standard/Editorial template
        root.innerHTML = \`
          <div class="w-full bg-white text-zinc-900 rounded-2xl border border-zinc-200 p-5 space-y-4 shadow-sm font-serif">
            <div class="flex items-center justify-between border-b pb-2 text-zinc-500 font-sans text-xs">
              \${badge ? badge : '<span class="text-zinc-450">Speciale</span>'}
              <span>Agosto 2026</span>
            </div>
            \${mediaHtml ? \`<div class="rounded-xl overflow-hidden border border-zinc-100">\${mediaHtml}</div>\` : ''}
            <div class="space-y-3">
              \${post.title ? \`<h1 class="text-xl md:text-2xl font-bold font-serif text-zinc-950 leading-tight">\${post.title}</h1>\` : ''}
              <p class="text-zinc-700 leading-relaxed text-[13.5px] whitespace-pre-line font-sans">\${post.text}</p>
            </div>
            <div class="text-[9px] font-sans text-zinc-400 uppercase tracking-widest pt-2 border-t">Angolo Sociale · \${author}</div>
          </div>
        \`;
      }
    }
  </script>
</body>
</html>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const currentThemeStyles = THEMES[selectedTheme] || THEMES.warm;

  return (
    <div id="admin-panel-viewport" className="w-full max-w-4xl mx-auto p-4 md:p-6 my-4 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden animate-fade-in">
      {/* Background Gradient Spot */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Panel Nav/Header */}
      <div id="admin-header" className="relative z-10 flex items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
            <Sparkles className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight">Area Amministrazione</h1>
            <p className="text-xs md:text-sm text-zinc-400">Personalizza il tuo widget e carica nuovi moduli sociali.</p>
          </div>
        </div>

        <button
          onClick={onClose}
          id="admin-close-btn"
          className="p-2 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors"
          title="Torna alla visualizzazione normale"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div id="admin-editor-panels" className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6 relative z-10">
        {/* Editor Form Columns - Left Side (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSavePost} className="space-y-6">
            {/* Box Content Card */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                <LayoutGrid className="w-4 h-4" />
                <span>Contenuto del Post</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lang/Category Badge */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Etichetta Badge (es. "Novità", "Español")</label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="es. Novità"
                      value={langBadge}
                      onChange={(e) => setLangBadge(e.target.value)}
                      id="edit-badge-field"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Post Title */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-sans">Titolo del Post (opzionale)</label>
                    <input
                      type="text"
                      placeholder="es. Pillola linguistica di oggi!"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      id="edit-title-field"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Description Body */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Testo / Descrizione</label>
                  <textarea
                    rows={6}
                    placeholder="Scrivi qui la descrizione, formule d'augurio, curiosità grammaticali o un messaggio per i tuoi studenti..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    id="edit-text-field"
                    className="w-full px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-amber-500 font-sans text-sm md:text-base"
                    required
                  />
                  <span className="text-[10px] text-zinc-500 block text-right mt-1">Puoi andare a capo per formattare i paragrafi.</span>
                </div>
              </div>

              {/* Media Settings Area */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                  <FileImage className="w-4 h-4" />
                  <span>Media & Allegato Locale</span>
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">Tipologia file</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleMediaTypeChange("none")}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        mediaType === "none"
                          ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                      }`}
                    >
                      <span>Nessuno</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMediaTypeChange("image")}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        mediaType === "image"
                          ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                      }`}
                    >
                      <FileImage className="w-3.5 h-3.5" />
                      <span>Immagine</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMediaTypeChange("video")}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        mediaType === "video"
                          ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                      }`}
                    >
                      <FileVideo className="w-3.5 h-3.5" />
                      <span>Video</span>
                    </button>
                  </div>
                </div>

                {mediaType !== "none" && (
                  <div className="space-y-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/85">
                    {/* File chooser */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                        Carica {mediaType === "image" ? "una Foto (PNG, JPG)" : "un Video (MP4, QuickTime)"}
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept={mediaType === "image" ? "image/*" : "video/*"}
                        onChange={handleFileChange}
                        id="media-uploader-input"
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-3 px-3.5 rounded-xl border border-dashed border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-500 cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-2"
                        >
                          {mediaType === "image" ? (
                            <FileImage className="w-8 h-8 text-zinc-400" />
                          ) : (
                            <FileVideo className="w-8 h-8 text-zinc-400" />
                          )}
                          <span>
                            {selectedFile ? `File selezionato: ${selectedFile.name}` : `Clicca qui per sfogliare il dispositivo`}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Crop & Ratio constraints */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Proporzioni del Box Media</label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="auto">Altezza Automatica (Intero)</option>
                        <option value="square">Quadrato (1:1 - Ottimo per foto quadrate)</option>
                        <option value="video">Rapporto Video (16:9 - Ottimo per video orizzontali)</option>
                      </select>
                    </div>

                    {/* Preview box inside panel */}
                    {filePreview && (
                      <div className="mt-2 text-center">
                        <p className="text-[10px] text-zinc-500 mb-1 bg-zinc-950 p-1.5 inline-block rounded font-mono">Anteprima Attuale:</p>
                        <div className="max-w-[150px] mx-auto rounded-lg overflow-hidden border border-zinc-800 bg-black/40">
                          {mediaType === "image" ? (
                            <img src={filePreview} alt="Preview" className="w-full h-auto aspect-video object-cover" />
                          ) : (
                            <video src={filePreview} className="w-full h-auto" preload="none" muted />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Piattaforma Social e Profilo Brand */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Layout & Info Canale Social</span>
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2.5">Scegli la Piattaforma Social da simulare</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: "instagram", name: "Instagram", icon: "📸" },
                      { id: "twitter", name: "Twitter / X", icon: "🐦" },
                      { id: "facebook", name: "Facebook", icon: "👥" },
                      { id: "tiktok", name: "TikTok", icon: "🎵" },
                      { id: "standard", name: "Standard", icon: "📰" }
                    ].map((plat) => {
                      const isSel = socialStyle === plat.id;
                      return (
                        <button
                          key={plat.id}
                          type="button"
                          onClick={() => setSocialStyle(plat.id as any)}
                          className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isSel
                              ? "bg-zinc-100 text-zinc-900 border-zinc-100 font-bold scale-[1.03]"
                              : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                          }`}
                        >
                          <span className="text-lg">{plat.icon}</span>
                          <span className="text-[10px] tracking-tight">{plat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {socialStyle !== "standard" && (
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3.5">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Personalizzazione Profilo Autore</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Nome sul Profilo (es. Scuola di Lingua)</label>
                        <input
                          type="text"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:ring-1 focus:ring-amber-500"
                          placeholder="es. Scuola di Lingua"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Nome Utente / Handle (es. @lingua_roma)</label>
                        <input
                          type="text"
                          value={authorHandle}
                          onChange={(e) => setAuthorHandle(e.target.value.replace("@", ""))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:ring-1 focus:ring-amber-500"
                          placeholder="es. lingua_roma"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 pt-1.5 font-mono">
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-1 font-semibold">Mi piace</label>
                        <input
                          type="number"
                          value={likesCount}
                          onChange={(e) => setLikesCount(Number(e.target.value))}
                          className="w-full px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-1 font-semibold">Commenti</label>
                        <input
                          type="number"
                          value={commentsCount}
                          onChange={(e) => setCommentsCount(Number(e.target.value))}
                          className="w-full px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-1 font-semibold">Condivisioni</label>
                        <input
                          type="number"
                          value={sharesCount}
                          onChange={(e) => setSharesCount(Number(e.target.value))}
                          className="w-full px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme custom settings */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Stile Grafico e Colore</span>
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">Seleziona un tema coordinato per il tuo sito (se carichi "Standard")</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(Object.keys(THEMES) as ThemeName[]).map((thm) => {
                      const opt = THEMES[thm];
                      const isSel = selectedTheme === thm;
                      const thmAccentHex = opt.accent.split(" ")[0]; // Get the background color class
                      return (
                        <button
                          key={thm}
                          type="button"
                          onClick={() => setSelectedTheme(thm)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSel
                              ? "bg-zinc-900 border-amber-500/80 shadow-md scale-[1.02]"
                              : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className={`w-3 h-3 rounded-full ${thmAccentHex}`} />
                            <span className="text-xs font-semibold text-zinc-200">{opt.name}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block">Stile del card: {thm}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit Post Buttons */}
              <div className="pt-4 space-y-3">
                {saveStatus.message && (
                  <div
                    className={`p-3 rounded-xl text-xs md:text-sm font-medium border ${
                      saveStatus.success
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                        : "bg-red-500/10 border-red-500/25 text-red-400"
                    }`}
                  >
                    {saveStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  id="submit-post-btn"
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Pubblica Aggiornamento</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Iframe Code & Security - Right Side (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Real-time Visual Card Preview */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Anteprima Live Social Card</span>
                </h2>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 relative"></span>
                  <span>LIVE</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-normal">
                Così appare la tua card social configurata. Scegli lo stile (Instagram, Twitter, Facebook, TikTok, Standard) a sinistra per cambiare istantaneamente look.
              </p>
              
              <div className="p-1 rounded-2xl bg-zinc-950/80 border border-zinc-850/60 overflow-hidden flex items-center justify-center">
                <div className="w-full">
                  <PostCard post={previewPost} isEmbed={true} />
                </div>
              </div>
            </div>

            {/* Real-time Post Preview Status */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Sincronizzazione Live</span>
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 relative"></span>
                  <span>LIVE ACCESO</span>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Ogni lettera digitata, colore selezionato o file caricato a sinistra si riflette <strong className="text-amber-400">all'istante</strong> sulla card visualizzata sul display principale dell'app. Non devi fare nulla per testare i tuoi layout!
              </p>
              
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-mono font-bold shrink-0">100%</div>
                <span className="text-[11px] text-zinc-400 leading-normal">
                  Il costruttore invia i dati sul canale locale della pagina in tempo reale.
                </span>
              </div>
            </div>

            {/* JSON Export/Import Portal */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                <span>Salvataggio File (Senza Server)</span>
              </h2>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Vuoi rendere l'app 100% stabile senza dipendere da database o cookie bloccati? Scarica il file <code className="text-amber-400 bg-black/45 px-1.5 py-0.5 rounded font-mono font-bold">post.json</code> e inseriscilo nella cartella del tuo sito web. L'applicazione caricherà la grafica e il media istantaneamente dal file statico!
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {/* Export Button */}
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4 animate-bounce" />
                  <span>Scarica file post.json</span>
                </button>

                {/* Import Button */}
                <input
                  type="file"
                  ref={jsonInputRef}
                  accept="application/json"
                  onChange={handleImportJson}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => jsonInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700 transition-colors"
                >
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span>Carica/Importa post.json esistente</span>
                </button>
              </div>

              <div className="pt-2 flex items-start gap-2 text-[10px] text-zinc-500 leading-normal">
                <Sparkles className="w-4 h-4 text-amber-500/60 shrink-0 mt-0.5" />
                <span>
                  <strong>Media inclusi:</strong> Se carichi un'immagine/video locale, questa verrà convertita integrandosi direttamente all'interno del file <code className="text-zinc-300">post.json</code> consentendone la riproduzione automatica dovunque.
                </span>
              </div>
            </div>

            {/* Embed code component */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Code className="w-4 h-4" />
                <span>Integrazione sul tuo Sito</span>
              </h2>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Scegli la modalità che preferisci per incorporare l'Angolo Sociale all'interno del tuo sito web (WordPress, Shopify, Webflow o file HTML statici).
              </p>

              {/* Tabs selector */}
              <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveEmbedTab("iframe")}
                  className={`flex-1 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all ${
                    activeEmbedTab === "iframe"
                      ? "bg-zinc-850 text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Opzione 1: Iframe Semplice
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEmbedTab("static")}
                  className={`flex-1 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all ${
                    activeEmbedTab === "static"
                      ? "bg-zinc-850 text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Opzione 2: HTML Statico Completo
                </button>
              </div>

              {activeEmbedTab === "iframe" ? (
                <div className="space-y-3.5">
                  <p className="text-[11px] text-zinc-400">
                    Ideale per posizionare il widget ospitato sul server cloud. Copia questo snippet HTML ed incollalo nell'editor del tuo sito:
                  </p>
                  <div className="bg-black/80 rounded-xl p-3 border border-zinc-800 font-mono text-[9px] text-zinc-300 break-all select-all relative group max-h-[120px] overflow-y-auto">
                    {getEmbedSnippet()}
                  </div>

                  <button
                    type="button"
                    onClick={copyEmbedCode}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-205 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700 transition-all active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Codice Copiato!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copia Codice Iframe</span>
                      </>
                    )}
                  </button>

                  <div className="pt-1 flex items-start gap-1.5 text-[10px] text-zinc-500">
                    <Info className="w-4 h-4 text-amber-500/60 shrink-0" />
                    <span>
                      La modalità Embed si attiva tramite <code className="text-amber-500/75 bg-zinc-950 px-1 py-0.5 rounded font-mono font-bold">?embed=true</code> nascondendo i margini per integrarsi dovunque.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 animate-fade-in">
                  <p className="text-[11px] text-zinc-450 leading-relaxed">
                    Vuoi che il widget giri interamente sul tuo spazio web senza dipendere da URL esterni?
                    Crea un file chiamato <code className="text-amber-400 bg-zinc-950 px-1 py-0.5 rounded font-bold font-mono">social.html</code> sul tuo sito, cancella tutto il contenuto, incollaci questo codice completo e posiziona il file <code className="text-amber-400 bg-zinc-950 px-1 py-0.5 rounded font-bold font-mono">post.json</code> nella stessa cartella:
                  </p>
                  <div className="bg-black/90 rounded-xl p-3 border border-zinc-800 font-mono text-[9px] text-zinc-300 select-all relative max-h-[160px] overflow-y-auto whitespace-pre block leading-normal">
                    {getStaticHtmlSnippet()}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(getStaticHtmlSnippet());
                      setHtmlCopied(true);
                      setTimeout(() => setHtmlCopied(false), 3000);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-205 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700 transition-all active:scale-95"
                  >
                    {htmlCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Codice Completo Copiato!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copia HTML & Script Completo</span>
                      </>
                    )}
                  </button>

                  <div className="pt-1 flex items-start gap-1.5 text-[10px] text-zinc-500">
                    <Sparkles className="w-4 h-4 text-amber-500/60 shrink-0" />
                    <span>
                      Questo codice HTML è leggero, reattivo, e disegna in automatico tutti e 5 i layout social (Instagram, Twitter, TikTok, Facebook, Standard) in base a quanto selezionato nel tuo post.json.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
