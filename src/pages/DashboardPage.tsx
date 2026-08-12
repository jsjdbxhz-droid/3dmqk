import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Images, Image as ImageIcon, Type, Loader2, Upload, X, Sparkles, Coins, Zap, Crown, Trash2, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { supabase, Model3D, CREDITS_PER_MODEL } from '@/lib/supabase';
import Model3DViewer from '@/components/Model3DViewer';
import ModelViewerModal from '@/components/ModelViewerModal';

type GenType = 'multi_image' | 'single_image' | 'text';

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { t, bgColor } = useSettings();
  const [genType, setGenType] = useState<GenType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [textPrompt, setTextPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recentModels, setRecentModels] = useState<Model3D[]>([]);
  const [viewerModel, setViewerModel] = useState<Model3D | null>(null);

  const fetchRecentModels = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6);

    if (!error && data) {
      setRecentModels(data as Model3D[]);
    }
  }, [user]);

  useEffect(() => {
    fetchRecentModels();
  }, [fetchRecentModels]);

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length) {
          setImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !genType) return;

    if (profile && profile.credits < CREDITS_PER_MODEL) {
      setError(t('dashNoCredits'));
      return;
    }

    if (genType !== 'text' && images.length === 0) {
      setError(t('dashUploadImages'));
      return;
    }
    if (genType === 'text' && !textPrompt.trim()) {
      setError(t('dashEnterText'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { data: deductResult, error: deductError } = await supabase.rpc('deduct_credits', {
      amount: CREDITS_PER_MODEL,
    });

    if (deductError) {
      setError(deductError.message);
      setLoading(false);
      return;
    }

    if (!deductResult) {
      setError(t('dashNoCredits'));
      setLoading(false);
      return;
    }

    const modelData = {
      user_id: user.id,
      title: title || `Model ${Date.now()}`,
      description: description || null,
      type: genType,
      status: 'completed' as const,
      input_images: genType !== 'text' ? images : [],
      input_text: genType === 'text' ? textPrompt : null,
      model_url: null,
      thumbnail_url: images[0] || null,
      credits_used: CREDITS_PER_MODEL,
    };

    const { data, error: insertError } = await supabase
      .from('models')
      .insert(modelData)
      .select('*')
      .maybeSingle();

    if (insertError) {
      setError(insertError.message);
      const { error: refundError } = await supabase.rpc('admin_grant_credits', {
        target_user: user.id,
        amount: CREDITS_PER_MODEL,
      });
      if (refundError) console.error('Failed to refund credits:', refundError);
    } else if (data) {
      setSuccess(t('dashSuccess'));
      setTitle('');
      setDescription('');
      setImages([]);
      setTextPrompt('');
      setGenType(null);
      await refreshProfile();
      await fetchRecentModels();
    }

    setLoading(false);
  };

  const handleDelete = async (modelId: string) => {
    const { error } = await supabase.from('models').delete().eq('id', modelId);
    if (!error) {
      await fetchRecentModels();
    }
  };

  const planIcon = profile?.plan === 'ultra' ? Crown : profile?.plan === 'pro' ? Zap : Sparkles;
  const PlanIcon = planIcon;

  const genTypes = [
    { type: 'multi_image' as GenType, icon: Images, label: t('dashTypeMulti'), desc: t('dashTypeMultiDesc'), color: 'from-cyan-500 to-blue-600' },
    { type: 'single_image' as GenType, icon: ImageIcon, label: t('dashTypeSingle'), desc: t('dashTypeSingleDesc'), color: 'from-emerald-500 to-teal-600' },
    { type: 'text' as GenType, icon: Type, label: t('dashTypeText'), desc: t('dashTypeTextDesc'), color: 'from-orange-500 to-red-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-sm text-slate-400">{t('dashCredits')}</span>
            </div>
            <p className="text-3xl font-bold text-white">{profile?.credits ?? 0}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <PlanIcon className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm text-slate-400">{t('dashPlan')}</span>
            </div>
            <p className="text-2xl font-bold text-white capitalize">{profile?.plan ?? 'free'}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-400">{t('dashRecentModels')}</span>
            </div>
            <p className="text-3xl font-bold text-white">{recentModels.length}</p>
          </div>
        </div>

        {/* Generation Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{t('dashGenerate')}</h2>
          <p className="text-slate-400 mb-6">{t('dashGenerateSubtitle')}</p>

          {!genType ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {genTypes.map((gt) => {
                const Icon = gt.icon;
                return (
                  <button
                    key={gt.type}
                    onClick={() => setGenType(gt.type)}
                    className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-600 transition-all hover:-translate-y-1 text-start"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gt.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{gt.label}</h3>
                    <p className="text-sm text-slate-400">{gt.desc}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {genTypes.find((g) => g.type === genType)?.label}
                </h3>
                <button
                  onClick={() => {
                    setGenType(null);
                    setImages([]);
                    setTextPrompt('');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  {t('dashBack')}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {success}
                </div>
              )}

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    {t('dashTitleLabel')}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                    placeholder="My 3D Model"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    {t('dashDescription')}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors resize-none"
                    placeholder="..."
                  />
                </div>

                {genType === 'text' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      {t('dashEnterText')}
                    </label>
                    <textarea
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      required
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors resize-none"
                      placeholder="A futuristic spaceship with glowing engines..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      {genType === 'multi_image' ? t('dashUploadImages') : t('dashUploadSingle')}
                    </label>
                    <div className="space-y-3">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-cyan-500 transition-colors bg-slate-800/50">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-6 h-6 text-slate-500" />
                          <span className="text-sm text-slate-400">{t('dashDragDrop')}</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple={genType === 'multi_image'}
                          className="hidden"
                          onChange={(e) => handleImageUpload(e.target.files)}
                        />
                      </label>

                      {images.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {images.map((img, i) => (
                            <div key={i} className="relative group">
                              <img
                                src={img}
                                alt={`Upload ${i + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border border-slate-700"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-slate-400">
                    {t('dashCost')}: <span className="text-cyan-400 font-semibold">{CREDITS_PER_MODEL} {t('dashCreditsLeft')}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> {t('dashGenerating')}</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> {t('dashGenerateBtn')}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Recent Models */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">{t('dashRecentModels')}</h2>
            {recentModels.length > 0 && (
              <Link to="/gallery" className="text-sm text-cyan-400 hover:text-cyan-300">
                {t('dashViewAll')}
              </Link>
            )}
          </div>

          {recentModels.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
              <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">{t('dashNoModels')}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentModels.map((model) => (
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
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {model.type === 'multi_image' ? t('dashTypeMulti') : model.type === 'single_image' ? t('dashTypeSingle') : t('dashTypeText')}
                      </span>
                      <span>{model.credits_used} {t('dashCreditsLeft')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewerModel && (
        <ModelViewerModal model={viewerModel} onClose={() => setViewerModel(null)} />
      )}
    </div>
  );
}
