import { Link } from 'react-router-dom';
import { Box, Images, Image, Type, Eye, Palette, Sparkles, Check, Zap, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { PLAN_CREDITS } from '@/lib/supabase';
import Model3DViewer from '@/components/Model3DViewer';

export default function LandingPage() {
  const { user, profile } = useAuth();
  const { t, bgColor } = useSettings();

  const features = [
    { icon: Images, title: t('featureMultiImage'), desc: t('featureMultiImageDesc'), color: 'from-cyan-500 to-blue-600' },
    { icon: Image, title: t('featureSingleImage'), desc: t('featureSingleImageDesc'), color: 'from-emerald-500 to-teal-600' },
    { icon: Type, title: t('featureText'), desc: t('featureTextDesc'), color: 'from-orange-500 to-red-600' },
    { icon: Eye, title: t('featureGallery'), desc: t('featureGalleryDesc'), color: 'from-purple-500 to-pink-600' },
    { icon: Palette, title: t('featureSettings'), desc: t('featureSettingsDesc'), color: 'from-amber-500 to-yellow-600' },
  ];

  const plans = [
    {
      name: t('planFree'),
      plan: 'free' as const,
      credits: PLAN_CREDITS.free,
      creditsLabel: t('planFreeCredits'),
      desc: t('planFreeDesc'),
      icon: Box,
      color: 'from-slate-600 to-slate-700',
      border: 'border-slate-600',
      popular: false,
    },
    {
      name: t('planPro'),
      plan: 'pro' as const,
      credits: PLAN_CREDITS.pro,
      creditsLabel: t('planProCredits'),
      desc: t('planProDesc'),
      icon: Zap,
      color: 'from-cyan-500 to-blue-600',
      border: 'border-cyan-500',
      popular: true,
    },
    {
      name: t('planUltra'),
      plan: 'ultra' as const,
      credits: PLAN_CREDITS.ultra,
      creditsLabel: t('planUltraCredits'),
      desc: t('planUltraDesc'),
      icon: Crown,
      color: 'from-amber-500 to-orange-600',
      border: 'border-amber-500',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered 3D Generation
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {t('heroTitle')}
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-xl">{t('heroSubtitle')}</p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to={user ? '/dashboard' : '/signup'}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
                >
                  {user ? t('navDashboard') : t('heroCta')}
                </Link>
                <a
                  href="#features"
                  className="px-8 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition-all"
                >
                  {t('heroLearnMore')}
                </a>
              </div>
            </div>

            <div className="relative h-[400px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <Model3DViewer bgColor={bgColor} autoRotate className="w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('featuresTitle')}</h2>
            <p className="text-slate-400 text-lg">{t('featuresSubtitle')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('pricingTitle')}</h2>
            <p className="text-slate-400 text-lg">{t('pricingSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = profile?.plan === plan.plan;
              return (
                <div
                  key={plan.plan}
                  className={`relative p-8 rounded-2xl bg-slate-800/50 border-2 transition-all ${
                    plan.popular
                      ? `border-cyan-500 lg:scale-105 shadow-2xl shadow-cyan-500/10`
                      : 'border-slate-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold">
                      {t('planPopular')}
                    </div>
                  )}

                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{plan.desc}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.credits}</span>
                    <span className="text-slate-400 text-sm ms-2">{t('dashCreditsLeft')}</span>
                  </div>

                  <div className="space-y-2 mb-8">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400" />
                      {plan.creditsLabel}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400" />
                      {t('planPerModel')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400" />
                      {t('featureGallery')}
                    </div>
                  </div>

                  {isCurrent ? (
                    <div className="w-full py-3 rounded-xl bg-slate-700 text-slate-300 font-semibold text-center cursor-default">
                      {t('planCurrent')}
                    </div>
                  ) : (
                    <Link
                      to={user ? '/dashboard' : '/signup'}
                      className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      {t('planChoose')}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          3DForge — AI-Powered 3D Model Generation
        </div>
      </footer>
    </div>
  );
}
