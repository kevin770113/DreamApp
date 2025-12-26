import React, { useState } from 'react';
import { Key, ExternalLink, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (inputKey.length < 30) {
      setError("這似乎不是有效的 API Key，請檢查是否複製完整");
      return;
    }
    if (!inputKey.startsWith('AIza')) {
       setError("Google API Key 通常以 'AIza' 開頭，請檢查是否複製正確");
       return;
    }
    onSave(inputKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-gradient-to-br from-mystic-900 to-mystic-800 border border-gold-500/50 rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.2)] p-6 md:p-8 animate-fade-in-up flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="inline-block p-4 rounded-full bg-gold-500/10 mb-4 border border-gold-500/30">
            <Key className="w-8 h-8 text-gold-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">
            配置專屬金鑰
          </h2>
          <p className="text-mystic-300 text-sm leading-relaxed">
            系統提供的免費體驗次數已達上限。<br/>
            請按照以下步驟取得並設定您的 Google API Key 以繼續使用。
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {/* Step 1 */}
          <div className="flex items-start gap-4 p-4 bg-mystic-950/50 rounded-xl border border-mystic-700/30 hover:border-gold-500/30 transition-colors">
            <div className="bg-mystic-700 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 shadow-lg">1</div>
            <div className="flex-1">
              <p className="text-sm text-mystic-100 font-bold mb-1">前往 Google AI Studio</p>
              <p className="text-xs text-mystic-400 mb-2">點擊按鈕開啟網頁 (需登入 Google 帳號)</p>
              <a 
                href="https://aistudio.google.com/app/apikey?openExternalBrowser=1" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <ExternalLink className="w-3 h-3" />
                取得免費 API Key
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 p-4 bg-mystic-950/50 rounded-xl border border-mystic-700/30 hover:border-gold-500/30 transition-colors">
            <div className="bg-mystic-700 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 shadow-lg">2</div>
            <div className="flex-1">
              <p className="text-sm text-mystic-100 font-bold mb-3">建立專屬鑰匙 (分步執行)</p>
              
              <div className="space-y-3 relative border-l border-mystic-700 ml-1.5 pl-4">
                {/* 2.1 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-mystic-600 border border-mystic-400"></span>
                  <p className="text-xs text-mystic-300">
                    點擊頁面 <span className="text-gold-400 font-bold">右上角</span> 的藍色按鈕 <span className="text-white font-mono bg-white/10 px-1 rounded text-[10px]">Create API key</span>
                  </p>
                </div>

                {/* 2.2 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-mystic-600 border border-mystic-400"></span>
                  <p className="text-xs text-mystic-300">
                    在選單中點選第一項 <span className="text-white font-mono bg-white/10 px-1 rounded text-[10px]">Create API key in new project</span>
                  </p>
                </div>

                {/* 2.3 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-mystic-600 border border-mystic-400"></span>
                  <p className="text-xs text-mystic-300">
                    在彈出視窗的 <span className="text-white font-mono text-[10px]">Name your project</span> 欄位輸入任意名稱 (例如: <span className="text-white font-mono">DreamApp</span>)
                  </p>
                </div>

                {/* 2.4 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gold-500 border border-gold-400 animate-pulse"></span>
                  <p className="text-xs text-gold-300 font-bold">
                    點擊右下角 <span className="text-white font-mono bg-white/10 px-1 rounded text-[10px]">Create project</span> 按鈕並等待生成
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 p-4 bg-mystic-950/50 rounded-xl border border-mystic-700/30 hover:border-gold-500/30 transition-colors">
            <div className="bg-mystic-700 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 shadow-lg">3</div>
            <div className="flex-1">
              <p className="text-sm text-mystic-100 font-bold mb-1">複製並貼上</p>
              
              <div className="my-2 p-2 bg-emerald-500/10 border border-emerald-500/50 rounded-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-bold text-emerald-300">
                  僅取得個人免費額度，不產生額外費用
                </span>
              </div>

              <p className="text-xs text-mystic-400 mb-2">
                將 <span className="font-mono text-gold-400">AIza</span> 開頭的長字串複製並貼入下方：
              </p>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setError('');
                }}
                placeholder="在此貼上 API Key..."
                className="w-full bg-black/40 border border-mystic-600 rounded-lg px-3 py-2 text-sm text-white placeholder-mystic-600 focus:outline-none focus:border-gold-500 transition-colors font-mono"
              />
              {error && (
                <div className="flex items-center gap-1 mt-2 text-red-400 text-xs animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-mystic-600 to-indigo-600 hover:from-mystic-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg hover:shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            啟用個人金鑰並停止消耗系統額度
          </button>
          
          <p className="text-center text-[10px] text-mystic-500">
            啟用後將改用您的 API Key 進行運算，您的金鑰僅儲存在瀏覽器中。
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;