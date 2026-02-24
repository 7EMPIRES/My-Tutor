import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, Loader2, Download, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { extractTextFromPDF } from './utils/pdf';
import { extractTextFromWord } from './utils/word';
import { extractTextFromPPTX } from './utils/pptx';
import { generateStudyGuide } from './services/geminiService';
import { generateDocx } from './utils/docx';
import { generatePdf } from './utils/pdfExport';

type AppState = 'idle' | 'reading' | 'generating' | 'done' | 'error';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [language, setLanguage] = useState<'English' | 'French'>('English');
  const [logo, setLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem('app_logo');
    } catch (e) {
      return null;
    }
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogo(base64);
        try {
          localStorage.setItem('app_logo', base64);
        } catch (e) {
          console.error('Failed to save logo to localStorage', e);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint'
    ];

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid PDF, Word, or PowerPoint file.');
      setState('error');
      return;
    }

    try {
      setState('reading');
      setFileName(file.name);
      setError('');
      
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (file.type.includes('word') || file.type.includes('msword')) {
        text = await extractTextFromWord(file);
      } else if (file.type.includes('presentation') || file.type.includes('powerpoint')) {
        text = await extractTextFromPPTX(file);
      }
      
      if (!text.trim()) {
        throw new Error('The file seems to be empty or unreadable.');
      }

      setState('generating');
      const studyGuide = await generateStudyGuide(text, language);
      setResult(studyGuide);
      setState('done');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
      setState('error');
    }
  }, [language]);

  const handleDownloadDocx = async () => {
    if (!result) return;
    await generateDocx('7EMPIRES DRC EXHAUSTIVE TUTOR', fileName, result);
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    await generatePdf('7EMPIRES DRC EXHAUSTIVE TUTOR', fileName, result);
  };

  const reset = () => {
    setState('idle');
    setFileName('');
    setResult('');
    setError('');
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-red-100 flex flex-col" style={{ display: 'flex', minHeight: '100vh', opacity: 1, visibility: 'visible' }}>
      <div className="bg-red-600 text-white text-center py-1 text-xs font-bold">7EMPIRES DRC - ACTIVE</div>
      <header className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        <div className="flex flex-col items-center mb-6 relative group">
          <label className="cursor-pointer relative">
            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            <div className="bg-black w-24 h-24 rounded-full shadow-xl shadow-red-100 mb-3 flex items-center justify-center overflow-hidden border-4 border-white">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-12 h-12 text-white" />
              )}
              <div className="absolute inset-0 bg-red-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
          </label>
          <div className="text-red-600 font-black text-2xl tracking-tighter">
            7EMPIRES DRC
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-4">
          7EMPIRES DRC EXHAUSTIVE TUTOR
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl">
          Transform your syllabus into a detailed chapter-by-chapter study guide. No detail left behind.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-24">
        {state === 'idle' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center transition-colors shadow-sm">
            <div className="flex gap-4 mb-8 p-1 bg-slate-50 rounded-xl border border-slate-200">
              <button
                onClick={() => setLanguage('English')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${language === 'English' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('French')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${language === 'French' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Français
              </button>
            </div>

            <div className="bg-red-50 p-6 rounded-full mb-6 border-2 border-dashed border-red-200">
              <Upload className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Course Material</h3>
            <p className="text-slate-500 mb-8 text-center">Select your PDF, Word, or PowerPoint file to begin exhaustive reconstruction in {language}</p>
            <label className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-medium transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95">
              Select File
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {(state === 'reading' || state === 'generating') && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 flex flex-col items-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20" />
              <Loader2 className="w-16 h-16 text-red-600 animate-spin relative z-10" />
            </div>
            <h3 className="text-2xl font-bold mb-3">
              {state === 'reading' ? 'Reading File...' : 'AI is generating your guide...'}
            </h3>
            <p className="text-slate-500 max-w-md">
              {state === 'reading' 
                ? `Extracting text from ${fileName}. This might take a moment depending on the file size.`
                : 'Analyzing concepts and creating questions. This usually takes 15-30 seconds.'}
            </p>
            
            <div className="w-full max-w-xs bg-slate-50 h-2 rounded-full mt-10 overflow-hidden border border-slate-100">
              <div 
                className="bg-red-600 h-full transition-all duration-1000"
                style={{ width: state === 'reading' ? "40%" : "90%" }}
              />
            </div>
          </div>
        )}

        {state === 'done' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-2xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Synthesis Complete!</h3>
                    <p className="text-slate-500 text-sm">Generated from {fileName}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-6 w-full">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
                    <button 
                      onClick={handleDownloadDocx}
                      className="w-full md:w-auto bg-white border-4 border-black hover:bg-black hover:text-white text-black px-10 py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                    >
                      <Download className="w-6 h-6" />
                      DOWNLOAD WORD (.DOCX)
                    </button>
                    <button 
                      onClick={handleDownloadPdf}
                      className="w-full md:w-auto bg-red-600 border-4 border-black hover:bg-red-700 text-white px-10 py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                    >
                      <Download className="w-6 h-6" />
                      DOWNLOAD PDF (.PDF)
                    </button>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-slate-500 font-medium italic">Click above to save your study guide</p>
                    <button 
                      onClick={reset}
                      className="text-slate-400 hover:text-black transition-colors text-sm font-bold uppercase tracking-widest"
                    >
                      ← Start New Synthesis
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Preview</span>
              </div>
              <div className="p-8 md:p-12 prose prose-slate max-w-none">
                <div className="markdown-body">
                  <Markdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {result}
                  </Markdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="bg-red-50 rounded-3xl border border-red-100 p-12 flex flex-col items-center text-center">
            <div className="bg-red-100 p-4 rounded-full mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h3>
            <p className="text-red-700 mb-8 max-w-md">{error}</p>
            <button 
              onClick={reset}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-slate-200 text-center text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-4">
          <p>© 2026 7EMPIRES DRC • Exhaustive Study Guide Generator</p>
          {deferredPrompt && (
            <button 
              onClick={handleInstall}
              className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Download className="w-3 h-3" />
              INSTALL AS PC APP
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
