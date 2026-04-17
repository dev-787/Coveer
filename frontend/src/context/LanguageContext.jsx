import { createContext, useContext } from 'react';

const LanguageContext = createContext(null);

const TRANSLATIONS = {
  dashboard: 'Dashboard', wallet: 'Wallet', coverage: 'My Coverage',
  profile: 'Profile', settings: 'Settings',
  goodDay: 'Good day,', walletBalance: 'Wallet Balance',
  maxDailyPayout: 'Max Daily Payout', thisHourPayout: "This Hour's Payout",
  willBeCredited: 'will be credited soon', noDisruption: 'No disruption this hour',
  recentActivity: 'Recent Activity', last7Days: 'Last 7 days',
  weeklyImpact: 'Weekly Impact', liveConditions: 'Live Conditions',
  trustScore: 'Your Trust Score',
};

const t = (key) => TRANSLATIONS[key] ?? key;

export function LanguageProvider({ children }) {
  return (
    <LanguageContext.Provider value={{ lang: 'en', setLanguage: () => { }, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
