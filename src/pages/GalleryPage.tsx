import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Eye, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { supabase, Model3D } from '@/lib/supabase';
import Model3DViewer from '@/components/Model3DViewer';
import ModelViewerModal from '@/components/ModelViewerModal';

export default function GalleryPage() {
  const { user } = useAuth();
  const { t, bgColor } = useSettings();
  const [models, setModels] = useState<Model3D[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewerModel, setViewerModel] = useState<Model3D | null>(null);

  const fetchModels = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setModels(data as Model3D[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleDelete = async (modelId: string) => {
    const { error } = await supabase.from('models').delete().eq('id', modelId);
    if (!error) {
      setModels((prev) => prev.filter((m) => m.id !== modelId));
    }
  };

  const filtered = models.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-white">{t('galleryTitle')}</h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('gallerySearch')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
            <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">{t('galleryEmpty')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((model) => (
              <div
                key={model.id}
                className="group bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all"
              >
                <div className="relative h-48 bg-slate-950">
                  <Model3DViewer
                    modelUrl={model.model_url}
                    bgColor={bgColor}
                    autoRotate
                    className="w-full h-full"
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setViewerModel(model)}
                      className="p-2 rounded-lg bg-slate-900/80 backdrop-blur text-white hover:bg-slate-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(model.id)}
                      className="p-2 rounded-lg bg-slate-900/80 backdrop-blur text-red-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white text-sm mb-1 truncate">{model.title}</h3>
                  {model.description && (
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">{model.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {model.type === 'multi_image' ? t('dashTypeMulti') : model.type === 'single_image' ? t('dashTypeSingle') : t('dashTypeText')}
                    </span>
                    <span>{new Date(model.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewerModel && (
        <ModelViewerModal model={viewerModel} onClose={() => setViewerModel(null)} />
      )}
    </div>
  );
}
