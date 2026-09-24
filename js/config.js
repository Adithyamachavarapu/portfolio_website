/* ============================================================
   CONFIG  —  THE ONLY FILE YOU NEED TO EDIT
   ------------------------------------------------------------
   Everything personal lives here. Change a value, save, refresh.
   No build step, no npm, nothing else to touch.
   ============================================================ */

export const CONFIG = {

  /* ---- 1. WHO YOU ARE -------------------------------------- */
  name:        'Adithya Machavarapu',
  shortName:   'Adithya',
  monogram:    'AM',
  role:        'Data Analyst',
  tagline:     'I clean the data, find the story, and show my working.',
  location:    'Hyderabad, India',
  availability:'Data Analyst · Open to internships & freelance work',

  /* ---- 2. EDUCATION ---------------------------------------- */
  university:  'VIT-AP University',
  degree:      'B.Tech — Computer Science & Engineering',
  specialisation: 'Data Analytics',
  gradYear:    '2028',

  /* ---- 3. CONTACT  (fill these in when ready) --------------- */
  /* Leave as '' and the link quietly hides itself. Nothing breaks. */
  email:       'adithyamachavarapu7@gmail.com',
  phone:       '',                 //  e.g. '+91 90000 00000'
  linkedin:    'https://www.linkedin.com/in/adithya-machavarapu-76189440a/',
  github:      'https://github.com/Adithyamachavarapu?tab=repositories',
  twitter:     '',                 //  full https:// URL
  kaggle:      '',                 //  full https:// URL
  resumeFile:  'assets/Adithya-Machavarapu-Resume.pdf',

  /* ---- 4. HERO COUNTERS ------------------------------------ */
  /* Purely decorative confidence signals. Tune or empty the array. */
  stats: [
    { value: 22,   suffix: '',   label: 'Skills in the kit' },
    { value: 4,    suffix: '',   label: 'Services offered'  },
    { value: 6,    suffix: '',   label: 'Semesters in'      },
    { value: 2028, suffix: '',   label: 'Class of', plain: true }
  ],

  /* ---- 5. SERVICES ----------------------------------------- */
  services: [
    {
      id:    'data',
      no:    '01',
      title: 'Data Analysis & EDA',
      blurb: 'Messy dataset in, decision out. Cleaning, wrangling and exploratory analysis that turn a raw export into something a manager can act on.',
      points: ['Data cleaning & wrangling', 'Exploratory data analysis', 'Statistical analysis', 'Data visualization']
    },
    {
      id:    'excel',
      no:    '02',
      title: 'Excel Dashboards & Reporting',
      blurb: 'The spreadsheet is still where business runs. Interactive dashboards, KPI trackers and reports that refresh themselves instead of eating your Monday.',
      points: ['Excel dashboards', 'KPI design & analysis', 'Automated reporting', 'Power BI']
    },
    {
      id:    'risk',
      no:    '03',
      title: 'Risk Analytics',
      blurb: 'How much can a position lose on a bad day, and how bad does bad get? Value at Risk, Expected Shortfall and Monte Carlo — built from scratch, backtested, and broken on purpose to find where they fail.',
      points: ['Value at Risk (3 methods)', 'Expected Shortfall', 'Monte Carlo simulation', 'Time-series & backtesting']
    },
    {
      id:    'sql',
      no:    '04',
      title: 'SQL & Database Work',
      blurb: 'Queries that answer the actual question. Cohorts, retention, RFM, and reporting pipelines that stop you re-pulling the same numbers every month.',
      points: ['Complex joins & CTEs', 'Window functions', 'Cohort / RFM analysis', 'Reporting pipelines']
    }
  ],

  /* ---- 5b. CERTIFICATIONS -----------------------------------
     Rendered into the Certifications section. Drop new PDFs in
     assets/certs/ and add an entry here.                        */
  certs: [
    {
      no:     '01',
      title:  'SQL (Advanced)',
      issuer: 'HackerRank',
      date:   'Sep 2026',
      cid:    'ID 2639C498C94C',
      note:   'Passed the HackerRank advanced skill certification — window functions, CTEs and query optimisation under exam conditions.',
      file:   'assets/certs/hackerrank-sql-advanced.pdf'
    },
    {
      no:     '02',
      title:  'Risk Job Simulation',
      issuer: 'Goldman Sachs · Forage',
      date:   'Aug 2026',
      cid:    'Verified by Forage',
      note:   'Practical risk tasks from the Goldman Sachs programme: an introduction to risk, and evaluating client profiles and real-estate investments.',
      file:   'assets/certs/goldman-sachs-risk-simulation.pdf'
    }
  ],

  /* ---- 6. FEATURED PROJECTS ---------------------------------
     The top four from GitHub, hand-picked. Everything else sits
     behind the "More on GitHub" button. Edit freely.            */
  projects: [
    {
      no:     '01',
      title:  'RiskScope',
      lang:   'Python · Streamlit',
      repo:   'https://github.com/Adithyamachavarapu/Risk-Scope',
      metric: 'Live market data · VaR · options analytics',
      blurb:  'A Bloomberg-inspired risk terminal: real-time market data, portfolio analytics, risk metrics and interactive visualisations in one screen. Built to answer desk questions, not to sit in a notebook.',
      tags:   ['Python', 'Streamlit', 'yfinance', 'Market risk']
    },
    {
      no:     '02',
      title:  'BlackRock Risk Lab',
      lang:   'Jupyter · Python',
      repo:   'https://github.com/Adithyamachavarapu/blackrock-risk-lab',
      metric: 'Live data, 2015 onwards · VaR + Expected Shortfall',
      blurb:  'How much could you lose holding BlackRock stock, and what is it really worth? A full equity risk report on live data — returns, fat tails, VaR, ES and valuation, every chart reproducible from the notebook.',
      tags:   ['Python', 'pandas', 'Equity risk', 'Valuation']
    },
    {
      no:     '03',
      title:  'Credit Risk Analysis',
      lang:   'Pure SQL',
      repo:   'https://github.com/Adithyamachavarapu/credit-risk-analysis',
      metric: '32,000 real loans · every query shown',
      blurb:  'Where does a lender actually lose money — and is that risk priced right? Thirty-two thousand loans interrogated entirely in SQL: default rates by segment, pricing checks, and the answers next to the queries that produced them.',
      tags:   ['SQL', 'MySQL', 'Credit risk', 'Cohorts']
    },
    {
      no:     '04',
      title:  'UPI Transaction Risk',
      lang:   'Jupyter · Python',
      repo:   'https://github.com/Adithyamachavarapu/upi-transaction-risk',
      metric: 'Significance testing · honest about the noise',
      blurb:  'Why do so many UPI payments fail? A statistical investigation that uses hypothesis testing to separate real risk from random noise — and says so plainly when the answer turns out to be noise.',
      tags:   ['Python', 'Statistics', 'Payments', 'EDA']
    }
  ],

  /* ---- 6. SKILLS ------------------------------------------- */
  skills: [
    { group: 'Languages',  items: ['Python', 'SQL'] },
    { group: 'Analysis',   items: ['NumPy', 'Pandas', 'SciPy', 'Jupyter', 'Excel'] },
    { group: 'Visual',     items: ['Matplotlib', 'Seaborn', 'Power BI'] },
    { group: 'Risk',       items: ['VaR', 'Expected Shortfall', 'Monte Carlo', 'Backtesting', 'Stress testing'] },
    { group: 'Data',       items: ['MySQL', 'Data cleaning', 'Modelling'] },
    { group: 'Tools',      items: ['Git', 'yfinance', 'Terminal', 'Notion'] }
  ],

  /* ---- 7. TICKER TAPE -------------------------------------- */
  /* Decorative. Prices drift on their own — they are not live data. */
  ticker: [
    { sym: 'NIFTY',    px: 24218.40 },
    { sym: 'BANKNIFTY',px: 52104.75 },
    { sym: 'SENSEX',   px: 79486.20 },
    { sym: 'S&P 500',  px:  5718.60 },
    { sym: 'NASDAQ',   px: 18092.30 },
    { sym: 'USDINR',   px:    83.42 },
    { sym: 'BRENT',    px:    74.85 },
    { sym: 'GOLD',     px:  2612.10 },
    { sym: 'VIX',      px:    15.32 },
    { sym: 'US10Y',    px:     3.74 }
  ]
};
