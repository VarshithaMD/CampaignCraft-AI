/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Type as TypeIcon, 
  Target, 
  RefreshCw,
  Download,
  Mail,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateCampaignText, generateCampaignImage, type CampaignData } from './lib/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'idle' | 'text' | 'image'>('idle');
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setCampaign(null);
    setHeroImage(null);
    setStep('text');

    try {
      const textData = await generateCampaignText(prompt);
      setCampaign(textData);
      
      setStep('image');
      const imageUrl = await generateCampaignImage(textData.imagePrompt);
      setHeroImage(imageUrl);
    } catch (error) {
      console.error(error);
      alert('Something went wrong during generation. Please try again.');
    } finally {
      setIsGenerating(false);
      setStep('idle');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadImage = () => {
    if (!heroImage) return;
    const link = document.createElement('a');
    link.href = heroImage;
    link.download = 'campaign-hero.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-zinc-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">CampaignCraft AI</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Templates</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">History</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Settings</a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Input Section */}
        <section className="mb-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-zinc-900">
              Your next viral campaign starts here.
            </h1>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
              Describe your product, goal, and audience. We'll handle the subject lines, copy, and visuals.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Launching a limited edition organic coffee blend for eco-conscious millennials. Goal: Pre-orders."
                className="w-full h-32 p-6 text-lg bg-transparent border-none focus:ring-0 resize-none placeholder:text-zinc-400"
                disabled={isGenerating}
              />
              <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-t border-zinc-100">
                <div className="flex items-center gap-4 text-zinc-400">
                  <span className="text-xs font-medium flex items-center gap-1">
                    <Target size={14} /> {prompt.length}/500
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!prompt.trim() || isGenerating}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200",
                    isGenerating 
                      ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg active:scale-95 shadow-indigo-200"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {step === 'text' ? 'Writing Copy...' : 'Creating Visuals...'}
                    </>
                  ) : (
                    <>
                      Generate Campaign
                      <Send size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {campaign ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Campaign Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <Target size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Target Audience</span>
                  </div>
                  <p className="text-zinc-700 leading-relaxed">{campaign.targetAudience}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <RefreshCw size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Tone & Style</span>
                  </div>
                  <p className="text-zinc-700 leading-relaxed">{campaign.tone}</p>
                </div>
              </div>

              {/* Subject Lines */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TypeIcon size={18} className="text-zinc-400" />
                    <h3 className="font-bold">Subject Line Options</h3>
                  </div>
                  <span className="text-xs text-zinc-400 font-medium">Select the best one</span>
                </div>
                <div className="divide-y divide-zinc-100">
                  {campaign.subjectLines.map((sl, i) => (
                    <div key={i} className="group flex items-center justify-between p-4 hover:bg-indigo-50/30 transition-colors">
                      <p className="text-zinc-800 font-medium">{sl}</p>
                      <button 
                        onClick={() => copyToClipboard(sl, `sl-${i}`)}
                        className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-white shadow-sm opacity-0 group-hover:opacity-100"
                      >
                        {copied === `sl-${i}` ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Body Copy */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail size={18} className="text-zinc-400" />
                        <h3 className="font-bold">Email Body Copy</h3>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(campaign.bodyCopy, 'body')}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        {copied === 'body' ? <Check size={14} /> : <Copy size={14} />}
                        {copied === 'body' ? 'Copied' : 'Copy All'}
                      </button>
                    </div>
                    <div className="p-8 prose prose-zinc max-w-none">
                      <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100 font-mono text-sm text-zinc-600 mb-6">
                        <div className="flex gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-red-400"></span>
                          <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        </div>
                        <p>To: [Customer Segment]</p>
                        <p>From: [Your Brand Name]</p>
                      </div>
                      <div className="markdown-body">
                        <Markdown>{campaign.bodyCopy}</Markdown>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visuals */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden sticky top-24">
                    <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={18} className="text-zinc-400" />
                        <h3 className="font-bold">Hero Image</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="aspect-video bg-zinc-100 rounded-xl overflow-hidden relative group">
                        {heroImage ? (
                          <>
                            <img 
                              src={heroImage} 
                              alt="Generated Hero" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button 
                                onClick={downloadImage}
                                className="p-3 bg-white rounded-full text-zinc-900 hover:scale-110 transition-transform shadow-lg"
                                title="Download Image"
                              >
                                <Download size={20} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 p-6 text-center">
                            <Loader2 className="animate-spin mb-3" size={32} />
                            <p className="text-sm font-medium">Generating visual asset...</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Image Prompt</p>
                        <p className="text-xs text-zinc-600 italic leading-relaxed">
                          "{campaign.imagePrompt}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : isGenerating ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                  <Sparkles size={32} />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Crafting your campaign...</h2>
              <div className="flex items-center gap-3 text-zinc-500 font-medium">
                <span className={cn(step === 'text' ? "text-indigo-600" : "opacity-50")}>1. Writing Copy</span>
                <ChevronRight size={16} className="opacity-30" />
                <span className={cn(step === 'image' ? "text-indigo-600" : "opacity-50")}>2. Generating Visuals</span>
              </div>
            </div>
          ) : (
            <div className="py-20 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center text-zinc-400">
              <Mail size={48} strokeWidth={1} className="mb-4" />
              <p className="font-medium">Enter a prompt above to generate your campaign</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center text-white">
              <Sparkles size={12} />
            </div>
            <span className="font-bold text-sm tracking-tight">CampaignCraft AI</span>
          </div>
          <p className="text-sm text-zinc-400">
            © 2026 CampaignCraft AI. Powered by Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}
