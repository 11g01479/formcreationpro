
import React, { useState, useCallback } from 'react';
import { generateFormStructure } from './geminiService';
import { FormStructure } from './types';
import { FormPreview } from './components/FormPreview';
import { 
  FileText, 
  Send, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  Layout,
  MousePointer2,
  Info,
  CheckCircle2
} from 'lucide-react';

const App: React.FC = () => {
  const [proposal, setProposal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedForm, setGeneratedForm] = useState<FormStructure | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleGenerate = async () => {
    if (!proposal.trim()) {
      setError('提案内容を入力してください。');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateFormStructure(proposal);
      setGeneratedForm(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'フォームの生成中にエラーが発生しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = useCallback(() => {
    if (!generatedForm) return;
    navigator.clipboard.writeText(JSON.stringify(generatedForm, null, 2));
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  }, [generatedForm]);

  const handleDownload = useCallback(() => {
    if (!generatedForm) return;
    const blob = new Blob([JSON.stringify(generatedForm, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-design-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedForm]);

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      {/* Navbar */}
      <nav className="bg-indigo-900 text-white p-4 shadow-lg flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-lg shadow-inner">
            <Layout className="text-indigo-900" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SurveyArchitect Pro</h1>
            <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-widest">AI-Driven Form Engine</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-indigo-100">
          <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
          <span className="hover:text-white cursor-pointer transition-colors">Best Practices</span>
          <div className="px-3 py-1 bg-indigo-800 rounded-full border border-indigo-700 flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-400" />
            <span>Powered by Gemini 3</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Input Area */}
        <section className={`flex-1 p-6 overflow-y-auto transition-all duration-500 ${generatedForm ? 'md:w-1/3 md:max-w-md' : 'w-full'}`}>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-indigo-600" size={24} />
                企画書・提案書の内容
              </h2>
              <p className="text-gray-500 text-sm">
                イベント概要、サービス企画、社内提案などのテキストを貼り付けてください。
                AIがその目的に最適なアンケート項目を自動設計します。
              </p>
            </div>

            <div className="relative group">
              <textarea
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="例：2024年度 新入社員研修の企画案... 目的はスキルの向上とネットワーキングの強化です..."
                className="w-full h-96 p-5 text-gray-800 bg-white border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all resize-none shadow-sm hover:shadow-md text-base leading-relaxed"
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-mono">
                {proposal.length} characters
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-in fade-in duration-300">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !proposal.trim()}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 transition-all active:scale-95 group"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>構成を考案中...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                  <span>Googleフォーム構成を生成</span>
                </>
              )}
            </button>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2">
                <Info size={16} />
                設計のヒント
              </h4>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>ターゲットユーザーが誰か明記すると精度が上がります。</li>
                <li>「最終的に何を知りたいか」を最後に一言添えるのがおすすめ。</li>
                <li>イベント名や日付が含まれていると、自動的に質問に反映されます。</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Right Side: Preview Area */}
        <section className={`flex-1 overflow-hidden transition-all duration-700 ease-in-out border-l border-gray-100 ${generatedForm ? 'translate-x-0' : 'translate-x-full md:hidden'}`}>
          {generatedForm ? (
            <FormPreview 
              form={generatedForm} 
              onCopy={handleCopy} 
              onDownload={handleDownload} 
            />
          ) : (
            <div className="h-full hidden md:flex flex-col items-center justify-center bg-gray-50 text-gray-400 space-y-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-4 border-dashed border-gray-200">
                <MousePointer2 size={32} />
              </div>
              <p className="font-medium">左側の入力欄にテキストを入れて生成を開始してください</p>
            </div>
          )}
        </section>
      </main>

      {/* Copy Notification Toast */}
      {copyStatus === 'copied' && (
        <div className="fixed bottom-8 right-8 px-6 py-3 bg-gray-900 text-white rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="text-green-400" size={20} />
          <span className="font-medium">クリップボードにコピーしました</span>
        </div>
      )}
    </div>
  );
};

export default App;
