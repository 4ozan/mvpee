"use client";

import ShaderBackground from "../components/ShaderBackground";
import { Loader } from "../components/ui/loader";
import { CircleArrowUp } from "lucide-react";
import { PromptInput, PromptInputTextarea, PromptInputActions } from "../components/ui/prompt-input";
import { Button } from "../components/ui/button";
import React, { useState } from "react";
import { Toast } from "../components/ui/toast";

export default function Home() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [inputError, setInputError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setInputError("");
    setLoading(true);
    setError("");
    setModalOpen(true);
    try {
      const res = await fetch("/api/getLink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content, targetLanguage: "English" }),
      });
      const data = await res.json();
      if (res.ok && data.article) {
        setToastMessage("Blog content generated! 🎉");
        setShowToast(true);
        setModalOpen(false);
      } else {
        setError(data.error || "Failed to generate blog content.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ShaderBackground />
      <div className="relative z-10 min-h-screen flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0f172a] via-[#1e293b] to-[#fb7185] text-black">
        <main className="flex-1 flex flex-col items-center justify-center py-8 px-2 sm:py-12 sm:px-4">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-center font-sans drop-shadow-lg flex flex-wrap items-center justify-center gap-2 leading-tight break-words">
            <h1 className="scroll-m-20 text-center text-white text-4xl font-extrabold tracking-tight text-balance">Produce a blog</h1>
          </h1>
          <p className="text-base xs:text-lg sm:text-xl md:text-xl text-white mb-6 sm:mb-10 text-center font-sans">Produce SEO-optimized blog content instantly</p>
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[120px]">
              <Loader variant="typing" size="md" text="Producing..." />
              <div className="mt-2 text-gray-500 text-sm">producing blog content, please wait...</div>
            </div>
          )}
          {!loading && (
            <div className="w-full max-w-full sm:max-w-2xl flex flex-col items-center">
              <div className="w-full flex flex-col items-center justify-center">
                <div className="w-full max-w-full sm:max-w-xl bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl px-2 sm:px-6 py-4 sm:py-6 mx-auto text-black">
                  <PromptInput isLoading={loading} value={content} onValueChange={setContent} onSubmit={handleSubmit} maxHeight={150}>
                    <div className="w-full flex flex-col gap-3 items-stretch">
                      <PromptInputTextarea
                        ref={inputRef}
                        placeholder="Enter your blog topic ..."
                        disabled={loading}
                        className="w-full min-h-[48px] sm:min-h-[56px] max-h-[120px] resize-none overflow-auto text-base sm:text-lg px-3 sm:px-6 py-3 sm:py-5 rounded-2xl border border-white/20 bg-white/10 text-black placeholder:text-slate-600 shadow-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all font-sans backdrop-blur"
                      />
                      <PromptInputActions className="flex justify-end mt-2">
                         <Button
                          onClick={handleSubmit}
                          disabled={loading || !content.trim()}
                          className="h-10 w-full sm:w-auto px-6 sm:px-8 text-base rounded-xl shadow-md bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold border-none hover:from-pink-400 hover:to-orange-300"
                        >
                          {loading ? <Loader variant="dots" size="sm" /> :<CircleArrowUp size={28} />}
                        </Button>
                      </PromptInputActions>
                    </div>
                  </PromptInput>
                  {inputError && (
                    <div className="text-center text-red-500 animate-shake mt-2">{inputError}</div>
                  )}
                  {error && !modalOpen && (
                    <div className="text-center text-red-500 animate-shake mt-2">{error}</div>
                  )}
                </div>
              </div>
            </div>
          )}
          <Toast
            open={showToast}
            onOpenChange={setShowToast}
            title={toastMessage}
            duration={1800}
          />
        </main>
      </div>
    </>
  );
}

