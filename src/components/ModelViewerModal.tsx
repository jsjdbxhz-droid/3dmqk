import { useState } from 'react';
import { X } from 'lucide-react';
import Model3DViewer from './Model3DViewer';
import { useSettings } from '@/context/SettingsContext';
import { Model3D } from '@/lib/supabase';

interface ModelViewerModalProps {
  model: Model3D;
  onClose: () => void;
}

export default function ModelViewerModal({ model, onClose }: ModelViewerModalProps) {
  const { bgColor, t } = useSettings();
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">{model.title}</h3>
            <p className="text-sm text-slate-400">
              {model.type === 'multi_image' ? t('dashTypeMulti') : model.type === 'single_image' ? t('dashTypeSingle') : t('dashTypeText')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded-lg transition-colors ${autoRotate ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}
              title={t('viewerRotate')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`p-2 rounded-lg transition-colors ${wireframe ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}
              title={t('viewerWireframe')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-[400px] relative">
          <Model3DViewer
            modelUrl={model.model_url}
            bgColor={bgColor}
            autoRotate={autoRotate}
            wireframe={wireframe}
            className="w-full h-full"
          />
        </div>

        {model.description && (
          <div className="p-4 border-t border-slate-800">
            <p className="text-sm text-slate-300">{model.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
