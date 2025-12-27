import React, { useState, useCallback, useRef } from 'react';
import { Upload, Play, Pause, FileAudio, CheckCircle, AlertCircle, Loader2, FileText, Sparkles, ChevronRight, Quote, Lightbulb, Star, List, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyzeAudioContent, generateDetailedInterviewReport } from '../services/geminiService';
import { AudioAnalysisResult, DetailedInterviewReport } from '../types';

const AudioAnalyzer: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // New states for report generation
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [detailedReport, setDetailedReport] = useState<DetailedInterviewReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    if (f.type.startsWith('audio/')) {
      setFile(f);
      setResult(null);
      setDetailedReport(null);
      setError(null);
    } else {
      setError("请上传有效的音频文件。");
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setDetailedReport(null);

    try {
      const base64Data = await convertFileToBase64(file);
      const data = await analyzeAudioContent(base64Data, file.type);
      setResult(data);
    } catch (err) {
      setError("分析失败。请检查您的 API Key 并重试。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!result?.transcription) return;
    setIsGeneratingReport(true);
    try {
      const report = await generateDetailedInterviewReport(result.transcription);
      setDetailedReport(report);
      setShowReportModal(true);
    } catch (e) {
      setError("生成深度报告失败，请稍后重试。");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return '积极';
      case 'Negative': return '消极';
      case 'Neutral': return '中性';
      case 'Mixed': return '混合';
      default: return sentiment;
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 relative">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">录音智能分析</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">上传访谈录音，即刻获取转录文本与深度洞察。</p>
      </header>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-900'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="audio/*"
          onChange={handleFileSelect}
        />
        
        {!file ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
                将音频文件拖拽至此
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                或 <button onClick={() => fileInputRef.current?.click()} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">点击浏览</button>
              </p>
            </div>
            <p className="text-xs text-slate-400">支持格式: MP3, WAV, M4A</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FileAudio size={24} />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
              >
                <X size={20} className="w-5 h-5" /> 
              </button>
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" /> 正在处理音频...
                </>
              ) : (
                <>
                  <Play size={20} fill="currentColor" /> 开始分析
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-900/30">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="animate-fade-in space-y-6">
          <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
            <div className="flex items-center gap-3">
               <Sparkles className="text-blue-600 dark:text-blue-400" />
               <span className="font-semibold text-blue-900 dark:text-blue-200">
                 想获取更专业的汇报材料？
               </span>
            </div>
            <button
               onClick={handleGenerateReport}
               disabled={isGeneratingReport}
               className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {isGeneratingReport ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
              生成结构化深度报告
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Summary & Transcription */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText size={20} className="text-blue-500" /> 执行摘要
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-96 flex flex-col">
                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">逐字转录</h3>
                <div className="flex-1 overflow-y-auto pr-2 text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {result.transcription}
                </div>
              </div>
            </div>

            {/* Right: Insights & Sentiment */}
            <div className="space-y-6">
               {/* Sentiment Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">情感倾向分析</h3>
                <div className="flex items-center gap-6">
                  <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-8 ${
                    result.sentimentScore > 70 ? 'border-green-500 text-green-600' :
                    result.sentimentScore < 40 ? 'border-red-500 text-red-600' : 'border-yellow-500 text-yellow-600'
                  }`}>
                    <span className="text-2xl font-bold">{result.sentimentScore}</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{getSentimentLabel(result.sentiment)}</div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">对话中检测到的整体情绪基调。</p>
                  </div>
                </div>
              </div>

              {/* Key Points */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white text-emerald-600 dark:text-emerald-400">核心发现</h3>
                <ul className="space-y-3">
                  {result.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300 text-sm">
                      <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pain Points */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white text-red-600 dark:text-red-400">用户痛点</h3>
                <ul className="space-y-3">
                  {result.painPoints.map((point, idx) => (
                    <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300 text-sm">
                      <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Report Modal */}
      {showReportModal && detailedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
               <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    深度访谈洞察报告
                    <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                      金字塔原理
                    </span>
                  </h2>
               </div>
               <button 
                 onClick={() => setShowReportModal(false)}
                 className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"
               >
                 <X size={24} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               {/* 1. Pyramid Top: Main Conclusion */}
               <section className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                  <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-2">核心战略结论</h3>
                  <p className="text-2xl font-serif font-medium text-slate-800 dark:text-slate-100 leading-snug">
                    "{detailedReport.mainConclusion}"
                  </p>
               </section>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* 2. Topic Analysis Chart (Left Column) */}
                 <section className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-fit">
                    <h3 className="text-sm font-bold text-slate-500 mb-6 flex items-center gap-2">
                      <PieChart size={16} /> 话题关注度分析
                    </h3>
                    <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={detailedReport.topicAnalysis} layout="vertical" margin={{ left: 0 }}>
                           <XAxis type="number" hide />
                           <YAxis dataKey="name" type="category" width={80} tick={{fill: '#94a3b8', fontSize: 12}} />
                           <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                           />
                           <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                              {detailedReport.topicAnalysis.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Bar>
                        </BarChart>
                       </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-slate-400 mt-4 text-center">
                      * 基于访谈中关键词的语义权重分析
                    </p>
                 </section>

                 {/* 3. Logical Sections (Right Column) */}
                 <div className="lg:col-span-2 space-y-6">
                    {detailedReport.sections.map((section, idx) => {
                      const Icon = section.icon === 'star' ? Star : section.icon === 'quote' ? Quote : section.icon === 'bulb' ? Lightbulb : List;
                      return (
                        <div key={idx} className="relative pl-8 border-l-2 border-slate-200 dark:border-slate-800 pb-2">
                           <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-blue-600 dark:text-blue-400">
                             <Icon size={14} />
                           </div>
                           <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{section.title}</h4>
                           <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                             {section.content}
                           </p>
                           {section.quotes && section.quotes.length > 0 && (
                             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                               {section.quotes.map((q, qIdx) => (
                                 <div key={qIdx} className="flex gap-3 mb-2 last:mb-0">
                                   <Quote size={12} className="text-slate-400 shrink-0 mt-1" />
                                   <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{q}"</p>
                                 </div>
                               ))}
                             </div>
                           )}
                        </div>
                      )
                    })}
                 </div>
               </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 rounded-b-3xl">
              <button 
                onClick={() => setShowReportModal(false)}
                className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                关闭
              </button>
              <button className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all">
                导出 PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Icon component for reuse within this file (X icon is already imported in Layout, but creating local here if needed, 
// though X is imported from lucide-react in the header. Wait, X is imported in this file header too? Yes.)
function X({ size, className, ...props }: { size: number, className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M18 6 6 18"/><path d="m6 6 18 18"/>
    </svg>
  )
}

function PieChartIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  )
}

export default AudioAnalyzer;