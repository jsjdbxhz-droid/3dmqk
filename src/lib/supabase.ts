import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Plan = 'free' | 'pro' | 'ultra';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  plan: Plan;
  credits: number;
  is_admin: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface Model3D {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: 'multi_image' | 'single_image' | 'text';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_images: string[];
  input_text: string | null;
  model_url: string | null;
  thumbnail_url: string | null;
  credits_used: number;
  created_at: string;
}

export interface UserSettings {
  id: string;
  background_color: string;
  language: 'en' | 'ar';
  updated_at: string;
}

export const PLAN_CREDITS: Record<Plan, number> = {
  free: 25,
  pro: 750,
  ultra: 1250,
};

export const CREDITS_PER_MODEL = 5;
