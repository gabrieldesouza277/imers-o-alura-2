import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  X, 
  ExternalLink 
} from 'lucide-react';
import { CalculationHistoryItem } from '../types/math';
import { playClickSound } from '../utils/audio';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    playClickSound(650);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    playClickSound(500);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `historico_calculos_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Histórico de Cálculos</h3>
            <span className="text-xs font-mono text-slate-500">
              ({history.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExportJSON}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Exportar JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onClearHistory}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Limpar Histórico"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <History className="w-12 h-12 stroke-[1.5] mb-3 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">Nenhum cálculo registrado ainda</p>
              <p className="text-xs text-slate-600 mt-1">
                Realize cálculos em qualquer módulo e clique em "Salvar no Histórico" para guardá-los aqui.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="font-semibold text-xs text-white">
                  {item.title}
                </div>

                <div className="text-xs font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/60 flex items-center justify-between">
                  <span className="truncate pr-2">{item.expression}</span>
                  <span className="text-emerald-400 font-bold whitespace-nowrap">
                    = {String(item.result)}
                  </span>
                </div>

                {item.pythonCode && (
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => handleCopyCode(item.id, item.pythonCode)}
                      className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Python Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar Código Python</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
