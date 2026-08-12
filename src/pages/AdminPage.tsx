import { useState, useEffect, useCallback } from 'react';
import { Users, Coins, Shield, Zap, Crown, Search, Loader2, X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { supabase, Profile, Plan, PLAN_CREDITS } from '@/lib/supabase';

export default function AdminPage() {
  const { profile } = useAuth();
  const { t } = useSettings();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    type: 'plan' | 'credits' | 'panel' | 'admin';
    user: Profile;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('admin_get_all_profiles');
      if (error) throw error;
      if (data) setUsers(data as Profile[]);
    } catch (err: any) {
      setError(err.message || t('commonError'));
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    if (profile?.is_admin) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [profile, fetchUsers]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSetPlan = async (userId: string, plan: Plan) => {
    const { error } = await supabase.rpc('admin_update_user_plan', {
      target_user: userId,
      new_plan: plan,
    });
    if (error) {
      setError(error.message);
    } else {
      showSuccess(t('adminGranted'));
      await fetchUsers();
    }
    setModal(null);
  };

  const handleGrantCredits = async (userId: string, amount: number) => {
    const { error } = await supabase.rpc('admin_grant_credits', {
      target_user: userId,
      amount,
    });
    if (error) {
      setError(error.message);
    } else {
      showSuccess(t('adminGranted'));
      await fetchUsers();
    }
    setModal(null);
  };

  const handleGrantPanel = async (userId: string, plan: Plan, credits: number) => {
    const { error } = await supabase.rpc('admin_grant_panel', {
      target_user: userId,
      new_plan: plan,
      new_credits: credits,
    });
    if (error) {
      setError(error.message);
    } else {
      showSuccess(t('adminGranted'));
      await fetchUsers();
    }
    setModal(null);
  };

  const handleSetAdmin = async (userId: string, isAdmin: boolean) => {
    const { error } = await supabase.rpc('admin_set_admin', {
      target_user: userId,
      new_is_admin: isAdmin,
    });
    if (error) {
      setError(error.message);
    } else {
      showSuccess(t('adminGranted'));
      await fetchUsers();
    }
    setModal(null);
  };

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">{t('commonError')}</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: users.length,
    totalCredits: users.reduce((sum, u) => sum + u.credits, 0),
    admins: users.filter((u) => u.is_admin).length,
    pro: users.filter((u) => u.plan === 'pro').length,
    ultra: users.filter((u) => u.plan === 'ultra').length,
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  const planBadge = (plan: Plan) => {
    const styles = {
      free: 'bg-slate-700 text-slate-300',
      pro: 'bg-cyan-500/20 text-cyan-400',
      ultra: 'bg-amber-500/20 text-amber-400',
    };
    const labels = { free: t('adminFree'), pro: t('adminPro'), ultra: t('adminUltra') };
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${styles[plan]}`}>
        {labels[plan]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('adminTitle')}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400">{t('adminTotalUsers')}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">{t('adminTotalCredits')}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalCredits}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-xs text-slate-400">{t('adminAdmins')}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.admins}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400">{t('adminProUsers')}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pro}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">{t('adminUltraUsers')}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.ultra}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <Check className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('adminSearchUsers')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors text-sm"
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-start px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">{t('adminUser')}</th>
                    <th className="text-start px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">{t('adminPlan')}</th>
                    <th className="text-start px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">{t('adminCredits')}</th>
                    <th className="text-start px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">{t('adminJoined')}</th>
                    <th className="text-end px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">{t('adminActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-white">
                              {u.email[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">
                              {u.display_name || u.email}
                              {u.is_admin && <span className="ms-2 text-xs text-red-400">Admin</span>}
                            </p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{planBadge(u.plan)}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-cyan-400">{u.credits}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <button
                            onClick={() => setModal({ type: 'plan', user: u })}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition-colors"
                          >
                            {t('adminSetPlan')}
                          </button>
                          <button
                            onClick={() => setModal({ type: 'credits', user: u })}
                            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-medium transition-colors"
                          >
                            {t('adminGrantCredits')}
                          </button>
                          <button
                            onClick={() => setModal({ type: 'panel', user: u })}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-medium transition-colors"
                          >
                            {t('adminGrantPanel')}
                          </button>
                          <button
                            onClick={() => setModal({ type: 'admin', user: u })}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              u.is_admin
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {u.is_admin ? t('adminRemoveAdmin') : t('adminMakeAdmin')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <AdminModal
          modal={modal}
          onClose={() => setModal(null)}
          onSetPlan={handleSetPlan}
          onGrantCredits={handleGrantCredits}
          onGrantPanel={handleGrantPanel}
          onSetAdmin={handleSetAdmin}
        />
      )}
    </div>
  );
}

interface AdminModalProps {
  modal: { type: 'plan' | 'credits' | 'panel' | 'admin'; user: Profile };
  onClose: () => void;
  onSetPlan: (userId: string, plan: Plan) => Promise<void>;
  onGrantCredits: (userId: string, amount: number) => Promise<void>;
  onGrantPanel: (userId: string, plan: Plan, credits: number) => Promise<void>;
  onSetAdmin: (userId: string, isAdmin: boolean) => Promise<void>;
}

function AdminModal({ modal, onClose, onSetPlan, onGrantCredits, onGrantPanel, onSetAdmin }: AdminModalProps) {
  const { t } = useSettings();
  const [plan, setPlan] = useState<Plan>(modal.user.plan);
  const [credits, setCredits] = useState<number>(100);
  const [panelPlan, setPanelPlan] = useState<Plan>('pro');
  const [panelCredits, setPanelCredits] = useState<number>(PLAN_CREDITS.pro);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    if (modal.type === 'plan') {
      await onSetPlan(modal.user.id, plan);
    } else if (modal.type === 'credits') {
      await onGrantCredits(modal.user.id, credits);
    } else if (modal.type === 'panel') {
      await onGrantPanel(modal.user.id, panelPlan, panelCredits);
    } else if (modal.type === 'admin') {
      await onSetAdmin(modal.user.id, !modal.user.is_admin);
    }
    setLoading(false);
  };

  const titles = {
    plan: t('adminSetPlan'),
    credits: t('adminGrantCredits'),
    panel: t('adminGrantPanel'),
    admin: modal.user.is_admin ? t('adminRemoveAdmin') : t('adminMakeAdmin'),
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">{titles[modal.type]}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-slate-800/50">
          <p className="text-sm text-slate-300">
            {modal.user.display_name || modal.user.email}
          </p>
          <p className="text-xs text-slate-500">{modal.user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-slate-400">{t('adminCredits')}: {modal.user.credits}</span>
          </div>
        </div>

        {modal.type === 'plan' && (
          <div className="space-y-2">
            {(['free', 'pro', 'ultra'] as Plan[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                  plan === p ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  {p === 'free' && <Sparkles className="w-4 h-4 text-slate-400" />}
                  {p === 'pro' && <Zap className="w-4 h-4 text-cyan-400" />}
                  {p === 'ultra' && <Crown className="w-4 h-4 text-amber-400" />}
                  <span className={`text-sm font-medium ${plan === p ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {p === 'free' ? t('adminFree') : p === 'pro' ? t('adminPro') : t('adminUltra')}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{PLAN_CREDITS[p]} {t('dashCreditsLeft')}</span>
              </button>
            ))}
          </div>
        )}

        {modal.type === 'credits' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {t('adminAmount')}
            </label>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
              min={1}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
            <div className="flex gap-2 mt-3">
              {[25, 100, 500, 750, 1250].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setCredits(amt)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>
        )}

        {modal.type === 'panel' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {t('adminPlan')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['free', 'pro', 'ultra'] as Plan[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPanelPlan(p);
                      setPanelCredits(PLAN_CREDITS[p]);
                    }}
                    className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                      panelPlan === p ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-700 text-slate-300'
                    }`}
                  >
                    {p === 'free' ? t('adminFree') : p === 'pro' ? t('adminPro') : t('adminUltra')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {t('adminCustomCredits')}
              </label>
              <input
                type="number"
                value={panelCredits}
                onChange={(e) => setPanelCredits(parseInt(e.target.value) || 0)}
                min={0}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>
        )}

        {modal.type === 'admin' && (
          <p className="text-sm text-slate-300">
            {modal.user.is_admin
              ? `Remove admin privileges from ${modal.user.email}?`
              : `Grant admin privileges to ${modal.user.email}?`}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
          >
            {t('adminCancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {t('adminConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
