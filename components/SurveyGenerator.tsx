import React, { useState } from 'react';
import { Sparkles, Copy, Loader2, List, Settings } from 'lucide-react';
import { generateSurveySchema } from '../services/geminiService';
import { SurveySchema, QuestionType } from '../types';

const SurveyGenerator: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [audience, setAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [survey, setSurvey] = useState<SurveySchema | null>(null);

  const handleGenerate = async () => {
    if (!goal || !audience) return;
    setIsGenerating(true);
    try {
      const result = await generateSurveySchema(goal, audience);
      setSurvey(result);
    } catch (e) {
      alert("生成问卷失败，请重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (survey) {
      navigator.clipboard.writeText(JSON.stringify(survey, null, 2));
      alert("问卷 JSON 已复制到剪贴板！");
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.SingleChoice: return '单选题';
      case QuestionType.MultipleChoice: return '多选题';
      case QuestionType.OpenText: return '开放式问题';
      case QuestionType.Rating: return '评分题';
      default: return type;
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Input Panel */}
      <div className="w-full lg:w-1/3 space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">智能问卷生成</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">秒级生成符合专业方法论的调研问卷框架。</p>
        </header>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">调研目标</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="例如：了解用户在结账过程中放弃购物车的原因..."
              className="w-full h-32 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">目标受众</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="例如：每周在线购物的千禧一代"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!goal || !audience || isGenerating}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-98"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            生成问卷框架
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-full lg:w-2/3 bg-slate-100 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 overflow-y-auto">
        {!survey ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <List size={64} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">尚未生成问卷</p>
            <p className="text-sm">填写左侧信息，让 AI 为您设计专业的研究工具。</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">预览模式</span>
              <button onClick={copyToClipboard} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 text-sm">
                <Copy size={16} /> 复制 JSON
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-t-xl p-8 border-b-4 border-blue-500 shadow-sm">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{survey.title}</h2>
              <p className="text-slate-600 dark:text-slate-400">{survey.description}</p>
            </div>

            {survey.questions.map((q, idx) => (
              <div key={q.id} className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings size={16} className="text-slate-400 cursor-pointer" />
                </div>
                <div className="mb-4">
                  <span className="text-sm font-medium text-slate-400 mb-1 block">问题 {idx + 1} • {getQuestionTypeLabel(q.type)}</span>
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    {q.text} {q.required && <span className="text-red-500">*</span>}
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Render based on type */}
                  {(q.type === QuestionType.SingleChoice || q.type === QuestionType.MultipleChoice) && (
                    q.options?.map((opt, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <div className={`w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 ${q.type === QuestionType.MultipleChoice ? 'rounded-sm' : ''}`}></div>
                        <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                      </div>
                    ))
                  )}

                  {q.type === QuestionType.OpenText && (
                    <div className="w-full h-24 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"></div>
                  )}

                  {q.type === QuestionType.Rating && (
                    <div className="flex justify-between px-4 py-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      {[1, 2, 3, 4, 5].map(val => (
                        <div key={val} className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                          {val}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyGenerator;