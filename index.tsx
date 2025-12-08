import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Wards from './components/Wards.tsx';
import CalendarPage from './components/Calendar.tsx';
import Financials from './components/Financials.tsx';
import Messages from './components/Messages.tsx';
import Records from './components/Records.tsx';
import Auth from './components/Auth.tsx';
import { Page, UserProfile, Patient, CalendarEvent, FinancialRecord, UserRole } from './types.ts';
import { searchApp } from './services/geminiService.ts';
import { db } from './services/db.ts';
import { X, Loader, Database } from 'lucide-react';

const App = () => {
  // --- Global State ---
  const [page, setPage] = useState<Page>(Page.Home);
  const [loading, setLoading] = useState(false); // Changed to false initially as we might wait for auth
  const [dbConnected, setDbConnected] = useState(false);
  
  // Navigation State (Deep Linking)
  const [targetPatientId, setTargetPatientId] = useState<string | null>(null);
  
  // Initialize User from LocalStorage
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('hospyar_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Save User to LocalStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('hospyar_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hospyar_user');
    }
  }, [user]);

  // Mock Data for Initial Seed
  const MOCK_PATIENTS: Patient[] = [
    {
      id: 'p1', name: 'علی رضایی', age: 63, ward: 'ICU', diagnosis: 'Stone Passage',
      admissionDate: '1404/04/12', status: 'Admitted',
      likes: 12, comments: [],
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
        { id: 'o2', type: 'Drug', name: 'Morphine', details: '5mg IV stat', dosage: '5mg', route: 'IV', frequency: 'Stat', status: 'Completed', date: '1404/04/12', prescribedBy: 'دکتر بسطامی', completedBy: 'پرستار رضایی' }
      ],
      progressNotes: [
        { id: 'pn1', date: '1404/04/13', note: 'درد بیمار با مسکن کنترل شد. منتظر جواب CT.', author: 'دکتر بسطامی' }
      ],
      auditLogs: []
    },
    {
      id: 'p2', name: 'مریم احمدی', age: 45, ward: 'داخلی', diagnosis: 'پنومونی',
      admissionDate: '1404/04/14', status: 'Admitted',
      likes: 5, comments: [],
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
        { id: 'o3', type: 'Drug', name: 'Ceftriaxone', details: '1g IV BD', dosage: '1g', route: 'IV', frequency: 'BD', status: 'Pending', date: '1404/04/14', prescribedBy: 'دکتر بسطامی' }
      ],
      progressNotes: [],
      auditLogs: []
    }
  ];

  const MOCK_EVENTS: CalendarEvent[] = [
    { id: 'e1', title: 'ویزیت بخش ICU', date: '1404/04/15', type: 'Visit' },
    { id: 'e2', title: 'جلسه با ریاست بیمارستان', date: '1404/04/18', type: 'Meeting' },
  ];

  const MOCK_FINANCIALS: FinancialRecord[] = [
    { id: 'f1', title: 'کارانه خرداد ماه', amount: 45000000, type: 'Income', date: '1404/04/01' },
    { id: 'f2', title: 'خرید تجهیزات معاینه', amount: 12000000, type: 'Outcome', date: '1404/04/05' },
    { id: 'f3', title: 'ویزیت مطب', amount: 8500000, type: 'Income', date: '1404/04/10' },
  ];

  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [financials, setFinancials] = useState<FinancialRecord[]>(MOCK_FINANCIALS);

  // --- Supabase Integration ---
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Patients
        const dbPatients = await db.getPatients();
        if (dbPatients.length > 0) {
          setPatients(dbPatients);
          setDbConnected(true);
        } else {
          // Seed DB if empty
          console.log('DB empty, seeding mock patients...');
          await Promise.all(MOCK_PATIENTS.map(p => db.upsertPatient(p)));
          setDbConnected(true);
        }

        // 2. Fetch Events
        const dbEvents = await db.getEvents();
        if (dbEvents.length > 0) {
          setEvents(dbEvents);
        } else {
          await Promise.all(MOCK_EVENTS.map(e => db.upsertEvent(e)));
        }

        // 3. Fetch Financials
        const dbFinancials = await db.getFinancials();
        if (dbFinancials.length > 0) {
          setFinancials(dbFinancials);
        } else {
           await db.seedFinancials(MOCK_FINANCIALS);
        }

      } catch (error) {
        console.error("Failed to connect to Supabase:", error);
        // Fallback to local state (MOCK_PATIENTS) which is already set initial
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      initData();
    }
  }, [user]);

  // --- Search Logic ---
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim() || !user) return;
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

  // --- Helper to Navigate to Patient Record ---
  const handleNavigateToPatient = (id: string) => {
    setTargetPatientId(id);
    setPage(Page.Records);
  };

  // --- Auth Check ---
  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  // --- Render Page ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
           <Loader className="animate-spin mb-4 text-primary" size={48} />
           <p>درحال دریافت اطلاعات از پایگاه داده...</p>
        </div>
      );
    }

    switch (page) {
      case Page.Home:
        return <Dashboard user={user} setPage={setPage} patients={patients} onNavigate={handleNavigateToPatient} />;
      case Page.Wards:
        return <Wards patients={patients} setPatients={setPatients} user={user} onNavigate={handleNavigateToPatient} />;
      case Page.Calendar:
        return <CalendarPage events={events} setEvents={setEvents} />;
      case Page.Financials:
        return <Financials records={financials} />;
      case Page.Messages:
        return <Messages />;
      case Page.Records:
        return (
          <Records 
            patients={patients} 
            setPatients={setPatients} 
            user={user} 
            targetPatientId={targetPatientId}
            clearTargetPatientId={() => setTargetPatientId(null)}
          />
        );
      default:
        return <Dashboard user={user} setPage={setPage} patients={patients} onNavigate={handleNavigateToPatient} />;
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
      {/* DB Connection Indicator */}
      {dbConnected && !loading && (
          <div className="fixed bottom-4 left-4 z-50 bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-full text-xs flex items-center gap-2 print:hidden">
            <Database size={12} />
            متصل به Supabase
          </div>
      )}

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

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}