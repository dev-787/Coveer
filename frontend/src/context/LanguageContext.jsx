import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
];

const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard', wallet: 'Wallet', coverage: 'My Coverage',
    profile: 'Profile', settings: 'Settings',
    goodDay: 'Good day,', walletBalance: 'Wallet Balance',
    maxDailyPayout: 'Max Daily Payout', thisHourPayout: "This Hour's Payout",
    willBeCredited: 'will be credited soon', noDisruption: 'No disruption this hour',
    recentActivity: 'Recent Activity', last7Days: 'Last 7 days',
    weeklyImpact: 'Weekly Impact', liveConditions: 'Live Conditions',
    trustScore: 'Your Trust Score',
  },
  hi: {
    dashboard: 'डैशबोर्ड', wallet: 'वॉलेट', coverage: 'मेरा कवरेज',
    profile: 'प्रोफ़ाइल', settings: 'सेटिंग्स',
    goodDay: 'नमस्ते,', walletBalance: 'वॉलेट बैलेंस',
    maxDailyPayout: 'अधिकतम दैनिक भुगतान', thisHourPayout: 'इस घंटे का भुगतान',
    willBeCredited: 'जल्द क्रेडिट होगा', noDisruption: 'इस घंटे कोई व्यवधान नहीं',
    recentActivity: 'हाल की गतिविधि', last7Days: 'पिछले 7 दिन',
    weeklyImpact: 'साप्ताहिक प्रभाव', liveConditions: 'लाइव स्थिति',
    trustScore: 'आपका ट्रस्ट स्कोर',
  },
  te: {
    dashboard: 'డాష్‌బోర్డ్', wallet: 'వాలెట్', coverage: 'నా కవరేజ్',
    profile: 'ప్రొఫైల్', settings: 'సెట్టింగ్‌లు',
    goodDay: 'నమస్కారం,', walletBalance: 'వాలెట్ బ్యాలెన్స్',
    maxDailyPayout: 'గరిష్ట రోజువారీ చెల్లింపు', thisHourPayout: 'ఈ గంట చెల్లింపు',
    willBeCredited: 'త్వరలో క్రెడిట్ అవుతుంది', noDisruption: 'ఈ గంట అంతరాయం లేదు',
    recentActivity: 'ఇటీవలి కార్యకలాపం', last7Days: 'గత 7 రోజులు',
    weeklyImpact: 'వారపు ప్రభావం', liveConditions: 'లైవ్ పరిస్థితులు',
    trustScore: 'మీ ట్రస్ట్ స్కోర్',
  },
  ta: {
    dashboard: 'டாஷ்போர்டு', wallet: 'வாலட்', coverage: 'என் கவரேஜ்',
    profile: 'சுயவிவரம்', settings: 'அமைப்புகள்',
    goodDay: 'வணக்கம்,', walletBalance: 'வாலட் இருப்பு',
    maxDailyPayout: 'அதிகபட்ச தினசரி கட்டணம்', thisHourPayout: 'இந்த மணி நேர கட்டணம்',
    willBeCredited: 'விரைவில் வரவு வைக்கப்படும்', noDisruption: 'இந்த மணி நேரம் இடையூறு இல்லை',
    recentActivity: 'சமீபத்திய செயல்பாடு', last7Days: 'கடந்த 7 நாட்கள்',
    weeklyImpact: 'வாராந்திர தாக்கம்', liveConditions: 'நேரடி நிலைமைகள்',
    trustScore: 'உங்கள் நம்பிக்கை மதிப்பெண்',
  },
  mr: {
    dashboard: 'डॅशबोर्ड', wallet: 'वॉलेट', coverage: 'माझे कव्हरेज',
    profile: 'प्रोफाइल', settings: 'सेटिंग्ज',
    goodDay: 'नमस्कार,', walletBalance: 'वॉलेट शिल्लक',
    maxDailyPayout: 'कमाल दैनिक पेआउट', thisHourPayout: 'या तासाचे पेआउट',
    willBeCredited: 'लवकरच जमा होईल', noDisruption: 'या तासात कोणताही व्यत्यय नाही',
    recentActivity: 'अलीकडील क्रियाकलाप', last7Days: 'मागील 7 दिवस',
    weeklyImpact: 'साप्ताहिक प्रभाव', liveConditions: 'थेट परिस्थिती',
    trustScore: 'तुमचा ट्रस्ट स्कोर',
  },
  gu: {
    dashboard: 'ડેશબોર્ડ', wallet: 'વૉલેટ', coverage: 'મારું કવરેજ',
    profile: 'પ્રોફાઇલ', settings: 'સેટિંગ્સ',
    goodDay: 'નમસ્તે,', walletBalance: 'વૉલેટ બૅલેન્સ',
    maxDailyPayout: 'મહત્તમ દૈનિક ચૂકવણી', thisHourPayout: 'આ કલાકની ચૂકવણી',
    willBeCredited: 'ટૂંક સમયમાં ક્રેડિટ થશે', noDisruption: 'આ કલાકે કોઈ વિક્ષેપ નથી',
    recentActivity: 'તાજેતરની પ્રવૃત્તિ', last7Days: 'છેલ્લા 7 દિવસ',
    weeklyImpact: 'સાપ્તાહિક અસર', liveConditions: 'લાઇવ સ્થિતિ',
    trustScore: 'તમારો ટ્રસ્ટ સ્કોર',
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('coveer_lang') || 'en');

  const setLanguage = (code) => {
    setLang(code);
    localStorage.setItem('coveer_lang', code);
  };

  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
