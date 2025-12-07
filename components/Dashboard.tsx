import React, { useEffect, useState } from 'react';
import { Page, UserProfile, UserRole, DailyCase } from '../types.ts';
import { ArrowLeft, Stethoscope, Wallet, FileText, Sparkles, Monitor, X, Activity, ClipboardList, CheckSquare, Microscope, Syringe, User } from 'lucide-react';
import { generateDailyCase } from '../services/geminiService.ts';

interface DashboardProps {
  user: UserProfile;
  setPage: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, setPage }) => {
  const [dailyCase, setDailyCase] = useState<DailyCase | null>(null);
  const [loadingCase, setLoadingCase] = useState(true);
  
  // Modal State
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [activeSection, setActiveSection] = useState<keyof DailyCase | 'histories_detail'>('chiefComplaint');

  const fetchCase = () => {
    setLoadingCase(true);
    generateDailyCase(user.role).then(data => {
      if (data) setDailyCase(data);
      setLoadingCase(false);
    });
  };

  useEffect(() => {
    fetchCase();
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
      link: Page.Home 
    }
  ];

  const caseSections = [
    { id: 'chiefComplaint', label: 'شکایت اصلی', icon: Activity },
    { id: 'presentIllness', label: 'شرح حال کنونی (PI)', icon: FileText },
    { id: 'histories_detail', label: 'سوابق (Histories)', icon: ClipboardList },
    { id: 'ros', label: 'بررسی سیستم‌ها (ROS)', icon: User },
    { id: 'physicalExam', label: 'معاینه فیزیکی', icon: Stethoscope },
    { id: 'problemList', label: 'لیست مشکلات', icon: ClipboardList },
    { id: 'differentialDiagnosis', label: 'تشخیص افتراقی', icon: CheckSquare },
    { id: 'labData', label: 'آزمایشات و تصویربرداری', icon: Microscope },
    { id: 'finalDiagnosis', label: 'تشخیص نهایی', icon: CheckSquare },
    { id: 'treatment', label: 'درمان و مدیریت', icon: Syringe },
    { id: 'followUp', label: 'پیگیری', icon: ArrowLeft },
  ];

  const renderCaseContent = () => {
    if (!dailyCase) return null;

    if (activeSection === 'histories_detail') {
      const histories = dailyCase.histories || {};
      return (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-accent-blue border-b border-dark-600 pb-2 mb-4">سوابق پزشکی</h3>
          <div className="grid grid-cols-1 gap-4">
             <div className="bg-dark-900 p-4 rounded-xl border border-dark-700">
               <span className="text-gray-400 text-sm block mb-1">سوابق پزشکی گذشته (PMH)</span>
               <p className="text-white">{histories.pmh || 'موردی ذکر نشده'}</p>
             </div>
             <div className="bg-dark-900 p-4 rounded-xl border border-dark-700">
               <span className="text-gray-400 text-sm block mb-1">سوابق جراحی (PSH)</span>
               <p className="text-white">{histories.psh || 'موردی ذکر نشده'}</p>
             </div>
             <div className="bg-dark-900 p-4 rounded-xl border border-dark-700">
               <span className="text-gray-400 text-sm block mb-1">سوابق دارویی (DH)</span>
               <p className="text-white">{histories.dh || 'موردی ذکر نشده'}</p>
             </div>
             <div className="bg-dark-900 p-4 rounded-xl border border-dark-700">
               <span className="text-gray-400 text-sm block mb-1">سوابق خانوادگی (FH)</span>
               <p className="text-white">{histories.fh || 'موردی ذکر نشده'}</p>
             </div>
             <div className="bg-dark-900 p-4 rounded-xl border border-dark-700">
               <span className="text-gray-400 text-sm block mb-1">سوابق اجتماعی (SH)</span>
               <p className="text-white">{histories.sh || 'موردی ذکر نشده'}</p>
             </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'problemList' || activeSection === 'differentialDiagnosis') {
        const list = (dailyCase[activeSection] as string[]) || [];
        return (
            <div className="animate-fadeIn">
                <h3 className="text-xl font-bold text-accent-blue border-b border-dark-600 pb-2 mb-4">
                    {activeSection === 'problemList' ? 'لیست مشکلات' : 'تشخیص‌های افتراقی'}
                </h3>
                <ul className="space-y-2">
                    {list.length > 0 ? list.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-dark-900 p-3 rounded-xl border border-dark-700">
                            <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0"></div>
                            <span className="text-gray-200">{item}</span>
                        </li>
                    )) : (
                        <p className="text-gray-500">موردی یافت نشد.</p>
                    )}
                </ul>
            </div>
        )
    }

    const content = (dailyCase[activeSection as keyof DailyCase] as string) || 'اطلاعاتی موجود نیست.';
    
    return (
      <div className="animate-fadeIn">
        <h3 className="text-xl font-bold text-accent-blue border-b border-dark-600 pb-2 mb-4">
            {caseSections.find(s => s.id === activeSection)?.label}
        </h3>
        <div className="prose prose-invert prose-lg max-w-none text-gray-200 leading-relaxed text-justify whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  };

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

      {/* Daily Case Card */}
      <div className="bg-dark-800 rounded-3xl p-8 border border-dark-700 relative overflow-hidden">
         {/* Decorative AI Element */}
         <div className="absolute top-0 left-0 p-4 opacity-10">
            <Sparkles size={100} />
         </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-primary rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">بیمار روز</h2>
          </div>

          <div className="min-h-[120px]">
            {loadingCase ? (
              <div className="flex items-center gap-3 text-gray-500 animate-pulse">
                <Sparkles size={20} />
                در حال تحلیل پرونده و آماده‌سازی کیس امروز...
              </div>
            ) : dailyCase ? (
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{dailyCase.title}</h3>
                <div className="flex items-center gap-2 text-primary text-sm mb-4 bg-primary/10 w-fit px-3 py-1 rounded-full">
                  <User size={14} />
                  {dailyCase.demographics}
                </div>
                <p className="text-gray-300 leading-relaxed mb-2"><span className="font-bold text-white">شکایت اصلی:</span> {dailyCase.chiefComplaint}</p>
                <p className="text-gray-400 text-sm line-clamp-2">{dailyCase.presentIllness}</p>
              </div>
            ) : (
              <p className="text-red-400">خطا در بارگذاری کیس. لطفاً مجدد تلاش کنید.</p>
            )}
          </div>

          <div className="mt-8 flex gap-4">
            <button 
              onClick={() => setShowCaseModal(true)}
              disabled={loadingCase || !dailyCase}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-primary/25 flex items-center gap-2"
            >
              <Monitor size={18} />
              بررسی کامل بیمار
            </button>
            <button 
              onClick={fetchCase}
              disabled={loadingCase}
              className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
            >
              کیس جدید
            </button>
          </div>
        </div>
      </div>

      {/* --- DESKTOP MODAL FOR CASE REVIEW --- */}
      {showCaseModal && dailyCase && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 lg:p-10 animate-in fade-in zoom-in duration-200">
            <div className="bg-dark-800 w-full h-full max-w-7xl rounded-3xl border border-dark-600 shadow-2xl overflow-hidden flex flex-col md:flex-row">
                
                {/* Sidebar Navigation */}
                <div className="w-full md:w-80 bg-dark-900 border-b md:border-b-0 md:border-l border-dark-700 flex flex-col">
                    <div className="p-6 border-b border-dark-700 bg-dark-900">
                        <h2 className="text-lg font-bold text-white line-clamp-1">{dailyCase.title}</h2>
                        <span className="text-sm text-primary">{dailyCase.demographics}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        {caseSections.map(section => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id as any)}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium
                                        ${isActive 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                            : 'text-gray-400 hover:bg-dark-800 hover:text-white'}
                                    `}
                                >
                                    <Icon size={18} />
                                    {section.label}
                                </button>
                            )
                        })}
                    </div>
                    <div className="p-4 border-t border-dark-700 md:hidden">
                        <button onClick={() => setShowCaseModal(false)} className="w-full bg-dark-800 text-white py-3 rounded-xl">بستن پرونده</button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col bg-dark-800 relative">
                    {/* Header */}
                    <div className="h-16 border-b border-dark-700 flex items-center justify-between px-6 bg-dark-800">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Monitor size={16} />
                            <span>میزکار پزشک</span>
                            <span className="text-dark-600">/</span>
                            <span className="text-white">مرور پرونده آموزشی</span>
                        </div>
                        <button 
                            onClick={() => setShowCaseModal(false)}
                            className="p-2 hover:bg-red-500/20 hover:text-red-500 text-gray-400 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Main Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 bg-dark-800/50">
                        <div className="max-w-4xl mx-auto">
                            {renderCaseContent()}
                        </div>
                    </div>
                    
                    {/* Footer Status Bar */}
                    <div className="h-10 bg-dark-900 border-t border-dark-700 flex items-center px-4 text-xs text-gray-500 justify-between">
                        <span>Status: Reviewing</span>
                        <span>Case ID: #{Math.floor(Math.random() * 10000)}</span>
                    </div>
                </div>

            </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;