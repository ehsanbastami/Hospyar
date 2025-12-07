import React from 'react';
import { Page, UserProfile, Patient } from '../types.ts';
import { ArrowLeft, Stethoscope, Wallet, FileText, Heart, Monitor, User, ThumbsUp, MessageCircle } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  setPage: (page: Page) => void;
  patients: Patient[];
  onNavigate: (patientId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, setPage, patients, onNavigate }) => {
  
  // Logic to find the "Best Case" - Most Likes
  // We filter for Admitted patients usually, but could be any.
  // Sorting by likes descending.
  const bestCase = patients.length > 0 
    ? [...patients].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0] 
    : null;

  const cards = [
    {
      title: 'سوابق بیماران',
      subtext: `${patients.length} پرونده ثبت شده`,
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
      title: 'بخش‌ها',
      subtext: 'مدیریت و پذیرش',
      icon: Stethoscope,
      color: 'bg-accent-purple',
      progress: 45,
      link: Page.Wards
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">سلام، {user.name.split(' ')[0]} 👋</h1>
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

      {/* Daily Case Card (Real Patient) */}
      <div className="bg-dark-800 rounded-3xl p-8 border border-dark-700 relative overflow-hidden">
         {/* Decorative Element */}
         <div className="absolute top-0 left-0 p-4 opacity-10">
            <Heart size={100} className="text-red-500"/>
         </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-red-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">کیس برتر روز</h2>
            <span className="bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded-lg border border-red-500/20">منتخب کادر درمان</span>
          </div>

          <div className="min-h-[120px]">
            {bestCase ? (
              <div>
                <div className="flex justify-between items-start">
                   <div>
                        <h3 className="text-xl font-bold text-white mb-2">{bestCase.name}</h3>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                            <User size={14} />
                            <span>{bestCase.age} ساله</span>
                            <span className="text-dark-600">|</span>
                            <span>{bestCase.ward}</span>
                        </div>
                   </div>
                   <div className="flex items-center gap-4 bg-dark-900 px-4 py-2 rounded-xl border border-dark-600">
                        <div className="flex items-center gap-1.5 text-red-400">
                            <ThumbsUp size={16} className="fill-current"/>
                            <span className="font-bold">{bestCase.likes || 0}</span>
                        </div>
                        <div className="w-px h-4 bg-dark-600"></div>
                        <div className="flex items-center gap-1.5 text-blue-400">
                            <MessageCircle size={16} />
                            <span className="font-bold">{(bestCase.comments || []).length}</span>
                        </div>
                   </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-2"><span className="font-bold text-white">تشخیص نهایی:</span> {bestCase.primaryDiagnosis || bestCase.diagnosis}</p>
                <p className="text-gray-400 text-sm line-clamp-2">{bestCase.presentIllness || bestCase.chiefComplaint}</p>
              </div>
            ) : (
              <p className="text-gray-500">پرونده‌ای برای نمایش وجود ندارد.</p>
            )}
          </div>

          <div className="mt-8 flex gap-4">
            {bestCase && (
                <button 
                  onClick={() => onNavigate(bestCase.id)}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-primary/25 flex items-center gap-2"
                >
                  <Monitor size={18} />
                  مشاهده و بررسی پرونده
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;