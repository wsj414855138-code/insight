import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { FileDown, RefreshCw, Zap } from 'lucide-react';
import { generateResearchReport } from '../services/geminiService';
import { GeneratedReport } from '../types';

const ReportBuilder: React.FC = () => {
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<GeneratedReport | null>(null);

  const handleGenerate = async () => {
    if (!context) return;
    setIsGenerating(true);
    try {
      const data = await generateResearchReport(context);
      setReport(data);
    } catch (e) {
      alert("生成报告时出错");
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityLabel = (severity: string) => {
    switch (severity) {
      case 'High': return '高优先级';
      case 'Medium': return '中优先级';
      case 'Low': return '低优先级';
      default: return severity;
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">调研报告生成</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">将原始笔记与数据转化为可视化的行动建议。</p>
        </div>
        {report && (
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <FileDown size={18} /> 导出 PDF
          </button>
        )}
      </header>

      {!report && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">输入调研背景资料</h3>
            <p className="text-sm text-slate-500 mb-4">在此粘贴您的原始笔记、访谈摘要或观察记录。</p>
            <textarea
              className="w-full h-48 p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-6"
              placeholder="例如：我们就新导航栏采访了 5 位用户，其中 3 位用户觉得..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            ></textarea>
            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !context}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
                生成报告
              </button>
            </div>
        </div>
      )}

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary Section */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">执行摘要</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                {report.summary}
              </p>
            </section>

             {/* Chart Section */}
             <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">量化数据可视化</h2>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {report.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* Sidebar Insights */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm">关键洞察</h3>
            {report.insights.map((insight, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  insight.severity === 'High' ? 'bg-red-500' : insight.severity === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div className="mb-2 flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">{insight.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    insight.severity === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                    insight.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {getPriorityLabel(insight.severity)}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {insight.description}
                </p>
              </div>
            ))}
            
            <button onClick={() => setReport(null)} className="w-full py-3 mt-4 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              创建新报告
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportBuilder;