
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Wards from './components/Wards';
import CalendarPage from './components/Calendar';
import Financials from './components/Financials';
import Messages from './components/Messages';
import Records from './components/Records';
import { Page, UserProfile, Patient, CalendarEvent, FinancialRecord, UserRole } from './types';
import { searchApp } from './services/geminiService';
import { X, Loader } from 'lucide-react';

const App = () => {
  // --- Global State ---
  const [page, setPage] = useState<Page>(Page.Home);
  
  const [user, setUser] = useState<UserProfile>({
    name: 'دکتر احسان بسطامی',
    role: UserRole.MD_Specialist,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  });

  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'p1', name: 'علی رضایی', age: 63, ward: 'ICU', diagnosis: 'Stone Passage',
      admissionDate: '1404/04/12', status: 'Admitted',
      chiefComplaint: 'درد شدید پهلو و هماچوری',
      presentIllness: 'بیمار آقای ۶۳ ساله با شکایت درد پهلوی راست مراجعه کرده است. درد کولیکی بوده و به کشاله ران تیر می‌کشد. همراه با تهوع و استفراغ.',
      pmh: ['Hypertension', 'Kidney Stones'],
      psh: ['Appendectomy (20 years ago)'],
      fh: ['Father: MI'],
      dh: [{ id: 'd1', name: 'Losartan', dosage: '50mg', frequency: 'Daily', startDate: '1400/01/01' }],
      sh: 'سیگاری (۵ پاکت سال)',
      ros: { 'عمومی': ['تب'], 'ادراری': ['هماچوری', 'درد پهلو'] },
      generalAppearance: 'بیمار هوشیار اما بی‌قرار به نظر می‌رسد.',
      vitalSigns: { bp: '150/90', hr: '98', rr: '18', spo2: '96%', temp: '37.8', gcs: '15' },
      physicalExam: { 'Abdomen': 'تندرنس در RLQ', 'Back': 'CVA تندرنس مثبت در سمت راست' },
      problemList: ['Renal Colic', 'Hypertension', 'Microscopic Hematuria'],
      differentialDiagnosis: ['Nephrolithiasis', 'Pyelonephritis', 'Musculoskeletal Pain'],
      primaryDiagnosis: 'Renal Calculi',
      orders: [
        { id: 'o1', type: 'Imaging', name: 'CT KUB', status: 'Completed', date: '1404/04/12', prescribedBy: 'دکتر بسطامی', completedBy: 'پرستار رضایی' },
        { id: 'o2', type: 'Drug', name: 'Morphine', details: '5mg IV stat', status: 'Completed', date: '1404/04/12', prescribedBy: 'دکتر بسطامی', completedBy: 'پرستار رضایی' }
      ],
      progressNotes: [
        { id: 'pn1', date: '1404/04/13', note: 'درد بیمار با مسکن کنترل شد. منتظر جواب CT.', author: 'دکتر بسطامی' }
      ],
      auditLogs: []
    },
    {
      id: 'p2', name: 'مریم احمدی', age: 45, ward: 'داخلی', diagnosis: 'پنومونی',
      admissionDate: '1404/04/14', status: 'Admitted',
      chiefComplaint: 'تنگی نفس و تب',
      presentIllness: 'بیمار خانم ۴۵ ساله با تب و لرز و سرفه خلط دار از ۳ روز پیش.',
      pmh: ['Diabetes Mellitus Type 2'],
      psh: [],
      fh: [],
      dh: [{ id: 'd2', name: 'Metformin', dosage: '500mg', frequency: 'BD', startDate: '1398/01/01' }],
      sh: '-',
      ros: { 'تنفسی': ['سرفه', 'خلط'], 'عمومی': ['تب', 'لرز'] },
      generalAppearance: 'Ill toxic',
      vitalSigns: { bp: '110/70', hr: '105', rr: '22', spo2: '92%', temp: '38.5', gcs: '15' },
      physicalExam: { 'Chest': 'کراکل در قاعده ریه چپ' },
      problemList: ['Pneumonia', 'Uncontrolled DM'],
      differentialDiagnosis: ['Bacterial Pneumonia', 'Viral Pneumonia', 'TB'],
      primaryDiagnosis: 'CAP (Community Acquired Pneumonia)',
      orders: [
        { id: 'o3', type: 'Drug', name: 'Ceftriaxone', details: '1g IV BD', status: 'Pending', date: '1404/04/14', prescribedBy: 'دکتر بسطامی' }
      ],
      progressNotes: [],
      auditLogs: []
    }
  ]);

  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 'e1', title: 'ویزیت بخش ICU', date: '1404/04/15', type: 'Visit' },
    { id: 'e2', title: 'جلسه با ریاست بیمارستان', date: '1404/04/18', type: 'Meeting' },
  ]);

  const [financials, setFinancials] = useState<FinancialRecord[]>([
    { id: 'f1', title: 'کارانه خرداد ماه', amount: 45000000, type: 'Income', date: '1404/04/01' },
    { id: 'f2', title: 'خرید تجهیزات معاینه', amount: 12000000, type: 'Outcome', date: '1404/04/05' },
    { id: 'f3', title: 'ویزیت مطب', amount: 8500000, type: 'Income', date: '1404/04/10' },
  ]);

  // --- Search Logic ---
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchResult(null);

    // Prepare context for AI
    const context = JSON.stringify({
      user,
      patients: patients.map(p => ({ 
        name: p.name, 
        ward: p.ward, 
        diagnosis: p.primaryDiagnosis || p.diagnosis,
        problems: p.problemList 
      })),
      events,
      financials
    });

    try {
      const result = await searchApp(query, context);
      setSearchResult(result);
    } catch (error) {
      setSearchResult('خطا در جستجو.');
    } finally {
      setIsSearching(false);
    }
  };

  // --- Render Page ---
  const renderContent = () => {
    switch (page) {
      case Page.Home:
        return <Dashboard user={user} setPage={setPage} />;
      case Page.Wards:
        return <Wards patients={patients} setPatients={setPatients} />;
      case Page.Calendar:
        return <CalendarPage events={events} setEvents={setEvents} />;
      case Page.Financials:
        return <Financials records={financials} />;
      case Page.Messages:
        return <Messages />;
      case Page.Records:
        return <Records patients={patients} setPatients={setPatients} user={user} />;
      default:
        return <Dashboard user={user} setPage={setPage} />;
    }
  };

  return (
    <Layout 
      currentPage={page} 
      setPage={setPage} 
      user={user} 
      setUser={setUser} 
      onSearch={handleSearch}
    >
      {renderContent()}

      {/* Global Search Result Modal */}
      {(isSearching || searchResult) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-700 w-full max-w-2xl rounded-3xl p-6 relative shadow-2xl">
            <button 
              onClick={() => { setSearchResult(null); setIsSearching(false); }}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-3">
              <span className="bg-primary/20 p-2 rounded-lg">نتایج جستجوی هوشمند</span>
            </h3>

            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader className="animate-spin mb-4" size={40} />
                <p>در حال جستجو در پایگاه داده...</p>
              </div>
            ) : (
              <div className="prose prose-invert prose-lg max-w-none text-gray-200 leading-relaxed bg-dark-900/50 p-6 rounded-2xl border border-dark-700/50">
                {searchResult}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
