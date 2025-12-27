import React from 'react';
import { ViewState } from '../types';
import { Mic, FileText, PieChart, ArrowRight, Lock } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10 py-6">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          全方位提升您的 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">用户研究效率</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          InsightFlow 融合先进 AI 技术与专业研究方法论，自动化处理繁琐工作流，让您专注于洞察本身。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => onNavigate('audio')}
          className="group bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Mic size={100} className="text-blue-600" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
            <Mic size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">录音智能分析</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            上传访谈录音，通过 Gemini 2.0 即可实现秒级转录、情感分析及用户痛点自动提取。
          </p>
          <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
            开始分析 <ArrowRight size={16} className="ml-2" />
          </div>
        </div>

        <div 
          className="group bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden cursor-not-allowed opacity-75"
        >
          <div className="absolute top-4 right-4 text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
             <Lock size={12} /> 待开发
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-6">
            <FileText size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-3">智能问卷生成</h3>
          <p className="text-slate-400 dark:text-slate-500 mb-6 leading-relaxed">
            基于调研目标自动生成符合专业方法论的问卷结构。（即将上线）
          </p>
        </div>

        <div 
          className="group bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden cursor-not-allowed opacity-75"
        >
          <div className="absolute top-4 right-4 text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
             <Lock size={12} /> 待开发
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-6">
            <PieChart size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-3">调研报告生成</h3>
          <p className="text-slate-400 dark:text-slate-500 mb-6 leading-relaxed">
            将原始笔记一键转化为可视化专业报告。（即将上线）
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;