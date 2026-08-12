import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase, UserSettings } from '@/lib/supabase';
import { translations, Language, TranslationKey } from '@/lib/translations';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: UserSettings | null;
  bgColor: string;
  language: Language;
  t: (key: TranslationKey) => string;
  dir: 'ltr' | 'rtl';
  updateSettings: (updates: Partial<Pick<UserSettings, 'background_color' | 'language'>>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings:', error);
      return;
    }
    setSettings(data as UserSettings | null);
  }, []);

  useEffect(() => {
    if (user) {
      fetchSettings(user.id).finally(() => setLoading(false));
    } else {
      setSettings(null);
      setLoading(false);
    }
  }, [user, fetchSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<Pick<UserSettings, 'background_color' | 'language'>>) => {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error updating settings:', error);
        return;
      }
      setSettings(data as UserSettings | null);
    },
    [user]
  );

  const bgColor = settings?.background_color ?? '#0f172a';
  const language: Language = settings?.language ?? 'en';
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const t = useCallback(
    (key: TranslationKey) => translations[language][key] ?? translations.en[key] ?? key,
    [language]
  );

  return (
    <SettingsContext.Provider value={{ settings, bgColor, language, t, dir, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
