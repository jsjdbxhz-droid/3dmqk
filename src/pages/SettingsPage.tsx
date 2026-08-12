import { useState, FormEvent } from 'react';
import { Palette, Globe, Save, CheckCircle2, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { supabase } from '@/lib/supabase';

const COLOR_PRESETS = [
  { name: 'Slate Dark', value: '#0f172a' },
  { name: 'Deep Blue', value: '#1e1b4b' },
  { name: 'Forest', value: '#052e16' },
  { name: 'Charcoal', value: '#1c1917' },
  { name: 'Midnight', value: '#0c0a09' },
  { name: 'Ocean', value: '#0c4a6e' },
  { name: 'Wine', value: '#450a0a' },
  { name: 'Slate Gray', value: '#1e293b' },
];

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { bgColor, language, t, updateSettings } = useSettings();
  const [selectedColor, setSelectedColor] = useState(bgColor);
  const [selectedLang, setSelectedLang] = useState<'en' | 'ar'>(language);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await updateSettings({
      background_color: selectedColor,
      language: selectedLang,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    setProfileSaved(false);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, avatar_url: avatarUrl || null })
      .eq('id', user.id);
    if (!error) {
      await refreshProfile();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
    setProfileSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-8">{t('settingsTitle')}</h1>

        {/* Appearance Settings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">{t('settingsBgColor')}</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                {t('settingsBgColor')}
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-3">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`relative w-full aspect-square rounded-xl border-2 transition-all ${
                      selectedColor === color.value
                        ? 'border-cyan-500 scale-110'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                />
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t('settingsLanguage')}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLang('en')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedLang === 'en'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span className="text-2xl mb-1">🇬🇧</span>
                  <p className={`text-sm font-medium ${selectedLang === 'en' ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {t('settingsEnglish')}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLang('ar')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedLang === 'ar'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span className="text-2xl mb-1">🇸🇦</span>
                  <p className={`text-sm font-medium ${selectedLang === 'ar' ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {t('settingsArabic')}
                  </p>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('settingsSave')}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  {t('settingsSaved')}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Profile Settings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">{t('settingsProfile')}</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {t('settingsDisplayName')}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {t('settingsAvatar')}
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('settingsUpdateProfile')}
              </button>
              {profileSaved && (
                <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  {t('settingsSaved')}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
