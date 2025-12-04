import React, { useEffect, useState } from 'react';
import { Page, UserProfile, UserRole } from '../types.ts';
import { ArrowLeft, Stethoscope, Wallet, FileText, Sparkles } from 'lucide-react';
import { generateDailyCase } from '../services/geminiService.ts';

interface DashboardProps {
  user: UserProfile;
  setPage: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, setPage }) => {
  const [dailyCase, setDailyCase] = useState<string>('درحال بارگذاری کیس روز با هوش مصنوعی...');

  useEffect(() => {
    let isMounted = true;
    generateDailyCase(user.role).then(text => {
      if (isMounted) setDailyCase(text);
    });
    return () => { isMounted = false; };
  }, [user.role]);

  const cards = [
    {
      title: 'سوابق بیماران',
      subtext: '۲۴ بیمار',
      icon: FileText,
      color: 'bg-accent-blue',
      progress: 65,
      link: Page.Records
    },
    {
      title: 'امور مالی',
      subtext: 'یک صورتحساب پرداخت نشده',
      icon: Wallet,
      color: 'bg-accent-orange',
      progress: 30,
      link: Page.Financials
    },
    {
      title: 'معرفی کیس آموزشی',
      subtext: 'موردی ثبت نکرده‌اید',
      icon: Stethoscope,
      color: 'bg-accent-purple',
      progress: 10,
      link: Page.Home // Keeps on home for now, or could act as a create button
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">سلام، دکتر {user.name.split(' ')[0]} 👋</h1>
          <p className="text-gray-400">امروز روز خوبی برای نجات جان انسان‌هاست.</p>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            onClick={() => setPage(card.link)}
            className="bg-dark-800 p-6 rounded-3xl border border-dark-700 hover:border-gray-600 transition-all cursor-pointer group relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-2xl ${card.color}`}></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-3 rounded-2xl text-white ${card.color} shadow-lg shadow-${card.color.split('-')[2]}/20`}>
                <span className="font-bold px-2 text-sm">{card.title}</span>
              </div>
              <ArrowLeft className="text-gray-500 group-hover:-translate-x-1 transition-transform" size={20} />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end">
                <span className="text-gray-300 text-sm font-medium">{card.subtext}</span>
              </div>
              
              {/* Fake Progress Bars for visual similarity to image */}
              <div className="space-y-2">
                <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden">
                  <div className={`h-full ${card.color} opacity-80 rounded-full`} style={{width: `${card.progress}%`}}></div>
                </div>
                <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden">
                  <div className={`h-full ${card.color} opacity-40 rounded-full`} style={{width: `${card.progress * 0.6}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Case */}
      <div className="bg-dark-800 rounded-3xl p-8 border border-dark-700 relative overflow-hidden">
         {/* Decorative AI Element */}
         <div className="absolute top-0 left-0 p-4 opacity-10">
            <Sparkles size={100} />
         </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-primary rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">بیمار روز</h2>
            <span className="text-xs bg-dark-700 text-gray-400 px-2 py-1 rounded-md border border-dark-600">
              تولید شده توسط هوش مصنوعی ({user.role === UserRole.MD_Specialist ? 'سطح پیشرفته' : 'سطح آموزشی'})
            </span>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed text-justify">
             {dailyCase.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
             ))}
          </div>

          <div className="mt-8 flex gap-4">
            <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-primary/25">
              بررسی کامل بیمار
            </button>
            <button 
              onClick={() => {
                setDailyCase('درحال تولید کیس جدید...');
                generateDailyCase(user.role).then(setDailyCase);
              }}
              className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
            >
              کیس جدید
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;