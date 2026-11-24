import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { FAST_FOOD_CHAINS } from '../data/fastFoodChains';

const INK = 'text-[#1f1b16] dark:text-[#ece4d4]';
const MUTED = 'text-[#5f564a] dark:text-[#a79d8c]';
const RULE = 'border-[#1f1b16]/15 dark:border-[#ece4d4]/15';

// An example, not live data — shows what "close to your numbers" looks like.
const LABEL_ROWS = [
  { name: 'Protein', asked: 45, got: 46 },
  { name: 'Carbs', asked: 60, got: 58 },
  { name: 'Fat', asked: 20, got: 20 },
];

function NutritionLabel() {
  return (
    <div
      className="w-full max-w-[22rem] bg-[#fffdf6] text-[#1f1b16] border-2 border-[#1f1b16] px-4 pt-3 pb-4 shadow-[6px_6px_0_0_rgba(31,27,22,0.18)] rotate-[1.4deg]"
      aria-label="Example of a generated meal compared with the requested macros"
    >
      <p className="font-display text-[2rem] leading-none font-extrabold tracking-normal">Nutrition Facts</p>
      <p className="text-[11px] mt-1 text-[#5f564a]">Example · Lemon chicken thighs, rice, charred broccoli</p>

      <div className="border-t-[6px] border-[#1f1b16] mt-2 pt-1 flex items-end justify-between">
        <span className="font-bold text-sm">Calories</span>
        <span className="font-display text-4xl font-extrabold leading-none">596</span>
      </div>
      <p className="text-[11px] text-right text-[#5f564a] -mt-0.5">you asked for 600</p>

      <div className="border-t-4 border-[#1f1b16] mt-2">
        <div className="flex text-[10px] uppercase tracking-wider text-[#5f564a] py-1 border-b border-[#1f1b16]/40">
          <span className="flex-1" />
          <span className="w-16 text-right">You asked</span>
          <span className="w-16 text-right">You got</span>
        </div>
        {LABEL_ROWS.map(({ name, asked, got }) => (
          <div key={name} className="flex items-baseline py-1.5 border-b border-[#1f1b16]/40 text-sm">
            <span className="flex-1 font-bold">{name}</span>
            <span className="w-16 text-right tabular-nums text-[#5f564a]">{asked}g</span>
            <span className="w-16 text-right tabular-nums font-bold">{got}g</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] leading-snug mt-3 text-[#5f564a]">
        Recipe, ingredient amounts and steps come with it. Within a few grams is the goal; nothing here is lab-tested.
      </p>
    </div>
  );
}

function LandingNav({ onSignIn, onGetStarted }) {
  const { dark, toggle } = useTheme();
  return (
    <header className="max-w-5xl mx-auto px-5 sm:px-6 py-6 flex items-center justify-between">
      <span className={`font-display text-xl sm:text-2xl font-extrabold tracking-normal ${INK}`}>MacroBuddy</span>
      <div className="flex items-center gap-1 sm:gap-3">
        <button
          onClick={toggle}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`p-2 rounded-md ${MUTED} hover:text-[#c4451c] transition-colors`}
        >
          {dark ? <FaSun size={15} /> : <FaMoon size={15} />}
        </button>
        <button onClick={onSignIn} className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${INK} hover:text-[#c4451c] transition-colors`}>
          Sign in
        </button>
        <button
          onClick={onGetStarted}
          className="px-3 sm:px-4 py-2 text-sm font-bold whitespace-nowrap rounded-md bg-[#1f1b16] text-[#f6f0e3] dark:bg-[#ece4d4] dark:text-[#17140f] hover:bg-[#c4451c] dark:hover:bg-[#e2683f] dark:hover:text-[#17140f] transition-colors"
        >
          <span className="sm:hidden">Sign up</span>
          <span className="hidden sm:inline">Make an account</span>
        </button>
      </div>
    </header>
  );
}

const STEPS = [
  {
    title: 'Give it your numbers.',
    body: 'Type in protein, carbs, fat and calories. Or answer a few questions when you sign up and it works out a starting point from your height, weight and activity (the Mifflin-St Jeor formula, same as most calculators).',
  },
  {
    title: 'Say what you feel like.',
    body: 'Pick breakfast, lunch or dinner, and a cuisine if you care. You get a few options, each with ingredient-level macros and cooking steps.',
  },
  {
    title: 'Or just eat out.',
    body: `Choose a chain and it picks the menu items that land closest to your numbers. ${FAST_FOOD_CHAINS.length} chains so far.`,
  },
  {
    title: 'Keep what works.',
    body: 'Save meals you liked. Drop them into a day plan with breakfast, lunch and dinner, and watch the totals add up against your targets.',
  },
];

export default function HomePage({ user, setPage, onSignIn, onGetStarted }) {
  const start = user ? () => setPage('main') : onGetStarted;
  const shownChains = FAST_FOOD_CHAINS.slice(0, 16);

  return (
    <div className="font-landing flex-1 bg-[#f6f0e3] dark:bg-[#17140f]">
      {!user && <LandingNav onSignIn={onSignIn} onGetStarted={onGetStarted} />}

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-20 lg:pt-16 grid lg:grid-cols-[1.25fr_1fr] gap-14 items-center">
        <div>
          <h1 className={`font-display text-[2.6rem] sm:text-6xl leading-[1.04] font-extrabold tracking-[-0.012em] ${INK}`}>
            You've got{' '}
            <span className="whitespace-nowrap underline decoration-[#c4451c] decoration-[5px] underline-offset-[7px]">45g of protein</span>{' '}
            left. Here's dinner.
          </h1>
          <p className={`mt-7 text-lg leading-relaxed max-w-xl ${MUTED}`}>
            MacroBuddy writes recipes that land within a few grams of the numbers you give it, or digs through fast-food menus for the closest match. No spreadsheet, no guessing.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              onClick={start}
              className="px-6 py-3 text-sm font-bold rounded-md bg-[#c4451c] text-white hover:bg-[#a83a16] transition-colors"
            >
              {user ? 'Open meal suggestions' : 'Make an account'}
            </button>
            {!user && (
              <button onClick={onSignIn} className={`text-sm font-medium underline underline-offset-4 ${INK} hover:text-[#c4451c]`}>
                I already have one
              </button>
            )}
          </div>
        </div>
        <div className="flex justify-center lg:justify-end lg:pr-2">
          <NutritionLabel />
        </div>
      </section>

      {/* How it goes */}
      <section className={`border-t ${RULE}`}>
        <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-[1fr_2fr] gap-8 md:gap-14">
          <h2 className={`font-display text-3xl font-semibold tracking-normal ${INK}`}>How it goes</h2>
          <div className={`border-t ${RULE}`}>
            {STEPS.map((s) => (
              <div key={s.title} className={`py-5 border-b ${RULE}`}>
                <p className={`font-bold ${INK}`}>{s.title}</p>
                <p className={`mt-1.5 leading-relaxed ${MUTED}`}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chains */}
      <section className={`border-t ${RULE}`}>
        <div className="max-w-5xl mx-auto px-6 py-14 grid md:grid-cols-[1fr_2fr] gap-8 md:gap-14">
          <h2 className={`font-display text-3xl font-semibold tracking-normal ${INK}`}>On the menu</h2>
          <p className={`font-display text-xl leading-relaxed ${INK}`}>
            {shownChains.join(', ')}, and {FAST_FOOD_CHAINS.length - shownChains.length} more.
          </p>
        </div>
      </section>

      {/* Honest note */}
      <section className={`border-t ${RULE}`}>
        <div className="max-w-5xl mx-auto px-6 py-14 grid md:grid-cols-[1fr_2fr] gap-8 md:gap-14">
          <h2 className={`font-display text-3xl font-semibold tracking-normal ${INK}`}>Worth knowing</h2>
          <div className={`space-y-3 leading-relaxed ${MUTED}`}>
            <p>
              Recipes and menu numbers come from an AI model, so treat them as good estimates rather than lab results. If you're counting to the gram, check the label.
            </p>
            <p>
              It plans meals; it doesn't keep a food diary. Logging what you actually ate isn't built yet.
            </p>
            <button
              onClick={start}
              className={`mt-3 text-sm font-bold underline underline-offset-4 decoration-2 decoration-[#c4451c] ${INK} hover:text-[#c4451c]`}
            >
              {user ? 'Open meal suggestions' : 'Fine by me, make an account'}
            </button>
          </div>
        </div>
      </section>

      <footer className={`border-t ${RULE}`}>
        <div className={`max-w-5xl mx-auto px-6 py-6 text-xs ${MUTED}`}>© {new Date().getFullYear()} MacroBuddy</div>
      </footer>
    </div>
  );
}
