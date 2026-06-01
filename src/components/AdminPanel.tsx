import React, { useState, useRef } from "react";
import { Post, THEMES, ThemeName } from "../types";
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

  // File uploading states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaBase64, setMediaBase64] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string>(currentPost.mediaUrl || "");

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ success: false, message: "" });
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

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
        createdAt: new Date().toISOString()
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
        createdAt: new Date().toISOString()
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

              {/* Theme custom settings */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Stile Grafico e Colore</span>
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">Seleziona un tema coordinato per il tuo sito</label>
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
                <span>Incorpora l'Iframe</span>
              </h2>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Usa questo codice HTML per posizionare il tuo Angolo Sociale all'interno di qualsiasi tuo sito web.
                Basta incollarlo nell'editor del tuo sito (es. WordPress, Webflow, Shopify o codice HTML).
              </p>

              <div className="bg-black/80 rounded-xl p-3 border border-zinc-800 font-mono text-[10px] text-zinc-300 break-all select-all relative group">
                {getEmbedSnippet()}
              </div>

              <button
                type="button"
                onClick={copyEmbedCode}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700 transition-all active:scale-95"
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

              <div className="pt-2 flex items-start gap-2 text-[10px] text-zinc-500 leading-normal">
                <Info className="w-4.5 h-4.5 text-amber-500/60 shrink-0 mt-0.5" />
                <span>
                  La modalità Embed (attiva tramite <code className="text-amber-500/75 bg-zinc-950 p-0.5 rounded font-mono">?embed=true</code> nell'iframe)
                  nasconde i margini esterni per integrarsi perfettamente senza occupare spazio aggiuntivo.
                </span>
              </div>
                      </div>
        </div>
      </div>
    </div>
  );
}
