import { FaArrowRight } from 'react-icons/fa';

const FEATURES = [
  {
    n: '01',
    title: 'Meal Suggestions',
    desc: 'AI-generated recipes matched to your exact macro targets — with ingredients, step-by-step instructions, and a full nutrition breakdown.',
    cta: 'Get suggestions',
    key: 'main',
    accent: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
  },
  {
    n: '02',
    title: 'Fast Food Finder',
    desc: 'Browse real menu items from 51 chains — each matched within ±10% of your targets. No cooking required.',
    cta: 'Find fast food',
    key: 'fastfood',
    accent: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
  },
  {
    n: '03',
    title: 'Favorites',
    desc: 'Save meals you love. Generate new suggestions based on your taste profile — no inputs needed.',
    cta: 'View favorites',
    key: 'favorites',
    accent: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
  },
  {
    n: '04',
    title: 'Meal Planner',
    desc: 'Lay out breakfast, lunch, and dinner for any day. See macro totals stack up in real time.',
    cta: 'Open planner',
    key: 'mealplan',
    accent: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
  },
];

const PLAN_MEALS = [
  {
    slot: 'Breakfast',
    name: 'Greek Yogurt Parfait',
    p: 28, c: 45, f: 8, cal: 360,
  },
  {
    slot: 'Lunch',
    name: 'Grilled Chicken Bowl',
    p: 48, c: 52, f: 14, cal: 530,
  },
  {
    slot: 'Dinner',
    name: 'Teriyaki Salmon',
    p: 42, c: 38, f: 14, cal: 450,
  },
];

function MacroBar({ pct, color }) {
  return (
    <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

function DailyPlanCard() {
  const total = PLAN_MEALS.reduce((a, m) => ({ p: a.p + m.p, c: a.c + m.c, f: a.f + m.f, cal: a.cal + m.cal }), { p: 0, c: 0, f: 0, cal: 0 });

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent rounded-2xl" />
      <div className="absolute -inset-6 bg-indigo-500/8 rounded-3xl blur-3xl" />
      <div className="relative bg-[#0c0c18] rounded-2xl border border-white/8 overflow-hidden shadow-2xl">

        {/* Header row */}
        <div className="px-5 pt-4 pb-3 border-b border-white/5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold tracking-[0.18em] text-slate-500 uppercase mb-1">Today's plan</p>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span className="text-white font-bold">{total.cal}</span> cal
              <span className="text-slate-600">·</span>
              <span className="text-violet-300">{total.p}g</span> protein
              <span className="text-slate-600">·</span>
              <span className="text-amber-300">{total.c}g</span> carbs
              <span className="text-slate-600">·</span>
              <span className="text-emerald-300">{total.f}g</span> fat
            </div>
          </div>
          <div className="flex gap-1 shrink-0 w-24">
            <MacroBar pct={total.p / 1.5} color="bg-violet-400" />
            <MacroBar pct={total.c / 2.2} color="bg-amber-400" />
            <MacroBar pct={total.f / 0.65} color="bg-emerald-400" />
          </div>
        </div>

        {/* Meals grid */}
        <div className="grid grid-cols-3 divide-x divide-white/5">
          {PLAN_MEALS.map((meal) => (
            <div key={meal.slot} className="p-4">
              <p className="text-[8px] font-bold tracking-[0.18em] text-slate-600 uppercase mb-2">{meal.slot}</p>
              <p className="text-xs font-semibold text-white leading-snug mb-3">{meal.name}</p>
              <div className="flex flex-col gap-1">
                {[
                  { dot: 'bg-violet-400', val: meal.p, label: 'P' },
                  { dot: 'bg-amber-400', val: meal.c, label: 'C' },
                  { dot: 'bg-emerald-400', val: meal.f, label: 'F' },
                  { dot: 'bg-slate-500', val: meal.cal, label: 'cal' },
                ].map(({ dot, val, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className={`w-1 h-1 rounded-full ${dot} shrink-0`} />
                    <span className="text-slate-300 font-medium tabular-nums">{val}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function HomePage({ setPage }) {
  return (
    <div className="flex-1 bg-white dark:bg-[#070711]">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-white dark:bg-[#070711] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
          <h1 className="text-6xl sm:text-7xl lg:text-[5rem] font-black tracking-tight leading-[1] mb-5 text-gray-900 dark:text-white">
            Know exactly<br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-500 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 bg-clip-text text-transparent">
              what to eat.
            </span>
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-lg leading-relaxed max-w-md mx-auto mb-8">
            Set your macro targets. Get matched recipes or real fast food — across AI and 51 chains.
          </p>
          <div className="flex justify-center gap-3 mb-14">
            <button
              onClick={() => setPage('main')}
              className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              Get meal suggestions
              <FaArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => setPage('fastfood')}
              className="px-6 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-slate-300 font-semibold text-sm rounded-xl transition-all border border-gray-200 dark:border-white/10"
            >
              Find fast food
            </button>
          </div>

          <DailyPlanCard />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-slate-600 uppercase mb-2">What's inside</p>
        <div className="mt-6 border-t border-gray-100 dark:border-white/5">
          {FEATURES.map((f) => (
            <button
              key={f.key}
              onClick={() => setPage(f.key)}
              className="group w-full flex items-center justify-between gap-6 py-6 border-b border-gray-100 dark:border-white/5 text-left transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02] -mx-4 px-4 rounded-xl"
            >
              <div className="flex items-start gap-6">
                <span className="text-xs font-bold text-gray-300 dark:text-slate-700 mt-0.5 tabular-nums shrink-0">{f.n}</span>
                <div>
                  <h3 className={`text-base font-bold text-gray-900 dark:text-white transition-colors ${f.accent}`}>{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">{f.desc}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold flex items-center gap-1.5 shrink-0 text-gray-400 dark:text-slate-600 transition-all group-hover:translate-x-0.5 ${f.accent}`}>
                {f.cta} <FaArrowRight size={10} />
              </span>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}
