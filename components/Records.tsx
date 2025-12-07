import React, { useState, useEffect } from 'react';
import { Patient, DrugOrder, Order, UserProfile, UserRole, AuditLogEntry, Comment } from '../types.ts';
import { db } from '../services/db.ts';
import { 
  FileText, Clock, UserPlus, Calendar, ChevronLeft, Save, X, 
  Activity, User, Eye, Pill, Syringe, ClipboardList, Plus, Trash2, Search, CheckSquare,
  ShieldCheck, AlertTriangle, CheckCircle, ShieldAlert, Printer, Heart, MessageCircle, Send, Edit2
} from 'lucide-react';

interface RecordsProps {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  user: UserProfile;
  targetPatientId: string | null;
  clearTargetPatientId: () => void;
}

// --- Data Constants ---
const ROS_CATEGORIES: Record<string, string[]> = {
  'عمومی': ['تغییرات وزن اخیر', 'ضعف و بی حالی', 'کم اشتهایی', 'تب', 'لرز'],
  'اعصاب': ['تشنج', 'ضعف', 'سردرد', 'سرگیجه', 'فلج', 'بی حسی'],
  'پوست': ['توده', 'خارش', 'اریتم', 'سیانوز', 'ایکتر', 'اسکار'],
  'سر و گردن': ['تروما', 'توده گردنی', 'سردرد', 'گیجی', 'احساس سبکی سر'],
  'چشم ها': ['انحراف چشم ها', 'اشک ریزش', 'خارش', 'کاهش دید', 'دوبینی', 'تاری دید'],
  'گوش، حلق و بینی': ['گوش درد', 'سرگیجه', 'ترشحات', 'خارش', 'کاهش بویایی'],
  'قفسه سینه و پستان': ['توده', 'درد', 'ترشح', 'چندپستانی', 'گالاکتوره'],
  'تنفسی': ['سرفه', 'عطسه', 'خلط', 'آسم', 'استریدور', 'دیسترس تنفسی'],
  'قلبی-عروقی': ['فشارخون بالا', 'سیانوز اندام'],
  'گوارشی': ['کم اشتهایی', 'تهوع', 'استفراغ', 'دیسفاژی', 'یبوست', 'اسهال', 'نفخ', 'دردشکمی', 'هماتمز', 'ملنا', 'ایکتر', 'هپاتومگالی', 'درولینگ', 'بی اختیاری مدفوع'],
  'ادراری': ['درد پهلو', 'دردشکمی', 'درد سوپراپوبیک', 'پلی اوری', 'الیگوری', 'آنوری', 'دیزوری', 'هماچوری', 'تغییر رنگ ادرار', 'بی اختیاری ادرار'],
  'تناسلی': ['ترشح', 'خارش', 'توده'],
  'اسکلتی-عضلانی': ['درد استخوانی', 'دردعضلانی', 'خشکی', 'دفورمیتی اندام ها', 'کاهش دامنه حرکتی', 'ضعف اندام ها'],
  'خون': ['آنمی', 'پتشی', 'اکیموز', 'پورپورا', 'ترانسفیوژن', 'اسپلنومگالی'],
  'غدد درون ریز': ['عدم تحمل گرما', 'عدم تحمل سرما', 'تعریق بیش از حد', 'پلی دیپسی', 'مشکلات تیروئید', 'گرسنگی بیش از حد'],
};

const PHYSICAL_EXAM_PARTS = [
  'Head', 'Neck', 'Upper limbs', 'Lower limbs', 'Chest', 'Back', 'Abdomen', 'Waist', 'Genitalia', 'Anus'
];

const COMMON_DRUGS = ['Aspirin', 'Metformin', 'Atorvastatin', 'Losartan', 'Pantoprazole', 'Ceftriaxone', 'Insulin', 'Acetaminophen', 'Morphine', 'Heparin'];
const COMMON_LABS = ['CBC', 'BMP', 'LFT', 'Coagulation Profile', 'U/A', 'VBG'];
const COMMON_IMAGING = ['CXR', 'ECG', 'Abdominal US', 'Brain CT', 'Chest CT'];

const ROUTES = ['PO (خوراکی)', 'IV (وریدی)', 'IM (عضلانی)', 'SC (زیرجلدی)', 'SL (زیرزبانی)', 'Topical (موضعی)', 'PR (رکتال)'];
const FREQUENCIES = ['Daily (روزانه)', 'BD (دوبار در روز)', 'TID (سه بار در روز)', 'QID (چهار بار در روز)', 'PRN (هنگام نیاز)', 'Stat (فوری)', 'Q8H', 'Q12H'];

const Records: React.FC<RecordsProps> = ({ patients, setPatients, user, targetPatientId, clearTargetPatientId }) => {
  const [activeTab, setActiveTab] = useState<'New' | 'Recent' | 'All'>('New');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Handle Deep Linking
  useEffect(() => {
    if (targetPatientId) {
      const p = patients.find(p => p.id === targetPatientId);
      if (p) {
        setSelectedPatient(p);
        clearTargetPatientId();
      }
    }
  }, [targetPatientId, patients, clearTargetPatientId]);

  // Editor State
  const [recordTab, setRecordTab] = useState<'History' | 'Orders' | 'FollowUp' | 'Log' | 'Social'>('History');
  const [drugSearch, setDrugSearch] = useState('');
  const [newDrug, setNewDrug] = useState<Partial<DrugOrder>>({ dosage: '', frequency: '' });
  
  // Comment State
  const [newComment, setNewComment] = useState('');

  // Prescription Modal State
  const [prescribeModalOpen, setPrescribeModalOpen] = useState(false);
  const [pendingDrugName, setPendingDrugName] = useState('');
  const [prescribeDetails, setPrescribeDetails] = useState({ dosage: '', route: ROUTES[0], frequency: FREQUENCIES[1] });
  
  // Name Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Permissions
  const canPrescribe = [UserRole.MD_General, UserRole.MD_Specialist, UserRole.MedicalStudent].includes(user.role);
  const canEditClinical = [UserRole.MD_General, UserRole.MD_Specialist, UserRole.MedicalStudent].includes(user.role);
  const canAdminister = [UserRole.Nurse, UserRole.Nurse_Head, UserRole.NursingStudent].includes(user.role);
  const isReceptionist = user.role === UserRole.Receptionist;

  // --- Logic ---
  
  const handleNameSave = () => {
      if (!selectedPatient || !editedName.trim()) return;
      updatePatientWithLog({ ...selectedPatient, name: editedName }, 'Edit Name', `Name changed from ${selectedPatient.name} to ${editedName}`);
      setIsEditingName(false);
  };

  const updatePatientWithLog = (updatedPatient: Patient, action: string, details: string) => {
    const logEntry: AuditLogEntry = {
      id: Math.random().toString(),
      timestamp: new Date().toLocaleString('fa-IR'),
      user: user.name,
      role: user.role,
      action: action,
      details: details
    };
    
    const currentLogs = updatedPatient.auditLogs || [];
    const patientWithLog = { 
      ...updatedPatient, 
      auditLogs: [logEntry, ...currentLogs] 
    };

    setPatients(patients.map(p => p.id === updatedPatient.id ? patientWithLog : p));
    setSelectedPatient(patientWithLog);
    
    // Persist to Supabase
    db.upsertPatient(patientWithLog);
  };

  // Social Features
  const handleLike = () => {
    if(!selectedPatient) return;
    const currentLikes = selectedPatient.likes || 0;
    const updated = { ...selectedPatient, likes: currentLikes + 1 };
    setPatients(patients.map(p => p.id === selectedPatient.id ? updated : p));
    setSelectedPatient(updated);
    db.upsertPatient(updated);
  };

  const handleComment = () => {
    if(!selectedPatient || !newComment.trim()) return;
    const comment: Comment = {
        id: Math.random().toString(),
        user: user.name,
        role: user.role,
        text: newComment,
        date: new Date().toLocaleString('fa-IR')
    };
    const updated = { 
        ...selectedPatient, 
        comments: [comment, ...(selectedPatient.comments || [])] 
    };
    setPatients(patients.map(p => p.id === selectedPatient.id ? updated : p));
    setSelectedPatient(updated);
    db.upsertPatient(updated);
    setNewComment('');
  };

  // ... (Other handlers: addDrugHistory, toggleROS, initiateOrder, confirmDrugPrescription, addOrder, updateOrderStatus, addProgressNote, handleTextChange, handleBlurLog remain largely the same)
  
  const addDrugHistory = () => {
    if (!selectedPatient || !newDrug.name) return;
    const order: DrugOrder = {
      id: Math.random().toString(),
      name: newDrug.name,
      dosage: newDrug.dosage || '',
      frequency: newDrug.frequency || '',
      startDate: new Date().toLocaleDateString('fa-IR'),
    };
    
    updatePatientWithLog(
      { ...selectedPatient, dh: [...selectedPatient.dh, order] },
      'Add Drug History',
      `Added ${order.name} (${order.dosage})`
    );
    setNewDrug({ dosage: '', frequency: '' });
    setDrugSearch('');
  };

  const removeDrugHistory = (id: string, name: string) => {
    if (!selectedPatient) return;
    updatePatientWithLog(
      { ...selectedPatient, dh: selectedPatient.dh.filter(d => d.id !== id) },
      'Remove Drug History',
      `Removed ${name}`
    );
  };

  const toggleROS = (category: string, symptom: string) => {
    if (!selectedPatient || !canEditClinical) return;
    const currentCat = selectedPatient.ros[category] || [];
    const newCat = currentCat.includes(symptom) 
      ? currentCat.filter(s => s !== symptom)
      : [...currentCat, symptom];
    
    updatePatientWithLog(
      { ...selectedPatient, ros: { ...selectedPatient.ros, [category]: newCat } },
      'Update ROS',
      `Changed ${category}: ${symptom}`
    );
  };

  const initiateOrder = (type: 'Drug' | 'Lab' | 'Imaging', name: string) => {
     if (!canPrescribe) return;
     if (type === 'Drug') {
         setPendingDrugName(name);
         setPrescribeDetails({ dosage: '', route: 'PO (خوراکی)', frequency: 'BD (دوبار در روز)' });
         setPrescribeModalOpen(true);
     } else {
         addOrder(type, name);
     }
  };

  const confirmDrugPrescription = () => {
      if (!selectedPatient || !pendingDrugName) return;
      const { dosage, route, frequency } = prescribeDetails;
      
      const newOrder: Order = {
        id: Math.random().toString(),
        type: 'Drug',
        name: pendingDrugName,
        status: 'Pending',
        date: new Date().toLocaleDateString('fa-IR'),
        prescribedBy: user.name,
        dosage,
        route,
        frequency,
        details: `${dosage} - ${route} - ${frequency}` // Legacy fallback
      };

      updatePatientWithLog(
        { ...selectedPatient, orders: [...selectedPatient.orders, newOrder] },
        'New Drug Order',
        `Prescribed ${pendingDrugName} | ${dosage} | ${route} | ${frequency}`
      );

      setPrescribeModalOpen(false);
      setPendingDrugName('');
  };

  const addOrder = (type: 'Lab' | 'Imaging', name: string) => {
    if (!selectedPatient || !canPrescribe) return;
    const newOrder: Order = {
      id: Math.random().toString(),
      type,
      name,
      status: 'Pending',
      date: new Date().toLocaleDateString('fa-IR'),
      prescribedBy: user.name
    };
    
    updatePatientWithLog(
      { ...selectedPatient, orders: [...selectedPatient.orders, newOrder] },
      `New ${type} Order`,
      `Ordered ${name}`
    );
  };

  const updateOrderStatus = (orderId: string, status: 'Completed' | 'Flagged', reason?: string) => {
    if (!selectedPatient) return;
    const order = selectedPatient.orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrders = selectedPatient.orders.map(o => o.id === orderId ? { 
      ...o, 
      status, 
      completedBy: user.name,
      flagReason: reason 
    } : o);

    updatePatientWithLog(
      { ...selectedPatient, orders: updatedOrders },
      `Order ${status}`,
      `${order.type} ${order.name} marked as ${status} by ${user.name}`
    );
  };

  const addProgressNote = (note: string) => {
    if (!selectedPatient || !note.trim()) return;
    const newNote = {
      id: Math.random().toString(),
      date: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', {hour:'2-digit', minute:'2-digit'}),
      note,
      author: user.name
    };
    
    updatePatientWithLog(
      { ...selectedPatient, progressNotes: [newNote, ...selectedPatient.progressNotes] },
      'Add Progress Note',
      `Note added by ${user.name}`
    );
  };

  const handleTextChange = (field: keyof Patient, value: any) => {
    if(!selectedPatient) return;
    setPatients(patients.map(p => p.id === selectedPatient.id ? { ...p, [field]: value } : p));
    setSelectedPatient({ ...selectedPatient, [field]: value });
  };
  
  const handleBlurLog = (field: string, oldVal: string, newVal: string) => {
    if (oldVal !== newVal && selectedPatient) {
       updatePatientWithLog(selectedPatient, `Edit ${field}`, `Changed content of ${field}`);
    }
  };

  const filterTabs = [
    { id: 'New', label: 'بیماران جدید', icon: UserPlus },
    { id: 'Recent', label: 'بیماران اخیر', icon: Clock },
    { id: 'All', label: 'کل پرونده‌ها', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      
      {/* Header - Hidden on Print */}
      <div className="flex justify-between items-center shrink-0 print:hidden">
         <h2 className="text-2xl font-bold text-white">سوابق و پرونده‌ها</h2>
         <div className="bg-dark-800 p-1 rounded-xl flex gap-1 border border-dark-700">
            {filterTabs.map(tab => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id as any); setSelectedPatient(null); }}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${activeTab === tab.id 
                                ? 'bg-primary text-white shadow-lg' 
                                : 'text-gray-400 hover:text-white hover:bg-dark-700'}
                        `}
                    >
                        <Icon size={16} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                );
            })}
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        
        {/* Sidebar Patient List - Hidden on Print */}
        <div className={`
            flex-1 bg-dark-800 rounded-3xl border border-dark-700 overflow-hidden flex flex-col print:hidden
            ${selectedPatient ? 'hidden lg:flex lg:max-w-xs' : ''}
        `}>
            <div className="p-4 border-b border-dark-700 bg-dark-900/50">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="جستجوی بیمار..." 
                        className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 pl-10 text-sm text-white focus:outline-none focus:border-primary"
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-500" size={16} />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {patients.map(patient => (
                    <div 
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`
                            p-4 border-b border-dark-700 cursor-pointer transition-colors hover:bg-dark-700/50
                            ${selectedPatient?.id === patient.id ? 'bg-primary/10 border-r-4 border-r-primary' : 'border-r-4 border-r-transparent'}
                        `}
                    >
                        <div className="flex justify-between mb-1">
                            <span className="font-bold text-white">{patient.name}</span>
                            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{patient.ward}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2 truncate">{patient.diagnosis}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar size={12} />
                            {patient.admissionDate}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Editor Area */}
        <div className={`
            flex-[3] bg-dark-800 rounded-3xl border border-dark-700 overflow-hidden flex flex-col relative print:border-0 print:bg-white print:text-black print:rounded-none
            ${!selectedPatient ? 'hidden lg:flex items-center justify-center text-gray-500' : ''}
        `}>
            {selectedPatient ? (
                <>
                    {/* Patient Header Info - Hidden on Print */}
                    <div className="p-6 border-b border-dark-700 flex flex-col md:flex-row justify-between items-start md:items-center bg-dark-900/30 gap-4 print:hidden">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                {isEditingName ? (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="bg-dark-700 border border-dark-500 text-white rounded px-2 py-1"
                                            autoFocus
                                        />
                                        <button onClick={handleNameSave} className="text-green-500"><CheckCircle size={20}/></button>
                                        <button onClick={() => setIsEditingName(false)} className="text-red-500"><X size={20}/></button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold text-white">{selectedPatient.name}</h2>
                                        {isReceptionist && (
                                            <button 
                                                onClick={() => { setEditedName(selectedPatient.name); setIsEditingName(true); }}
                                                className="text-gray-500 hover:text-white"
                                            >
                                                <Edit2 size={16}/>
                                            </button>
                                        )}
                                    </>
                                )}
                                <span className="bg-dark-700 text-gray-300 px-2 py-0.5 rounded text-sm">{selectedPatient.age} ساله</span>
                                <span className="text-sm text-gray-400">| پرونده: {selectedPatient.id}</span>
                            </div>
                            <div className="flex gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><User size={14}/> بخش: {selectedPatient.ward}</span>
                                <span className="flex items-center gap-1"><Calendar size={14}/> پذیرش: {selectedPatient.admissionDate}</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setSelectedPatient(null)}
                                className="lg:hidden p-2 bg-dark-700 rounded-lg text-gray-300"
                            >
                                <ChevronLeft />
                            </button>
                            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                                <Save size={16} />
                                ذخیره تغییرات
                            </button>
                        </div>
                    </div>

                    {/* Editor Tabs - Hidden on Print */}
                    <div className="px-6 pt-4 flex gap-4 border-b border-dark-700 overflow-x-auto print:hidden">
                        {['History', 'Orders', 'FollowUp', 'Log', 'Social'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setRecordTab(t as any)}
                                className={`
                                    pb-3 px-2 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap
                                    ${recordTab === t 
                                        ? 'text-primary border-primary' 
                                        : 'text-gray-400 border-transparent hover:text-white'}
                                `}
                            >
                                {t === 'History' && 'شرح حال و معاینه'}
                                {t === 'Orders' && 'دستورات پزشک'}
                                {t === 'FollowUp' && 'سیر بیماری'}
                                {t === 'Log' && <><ShieldCheck size={14}/> گزارشات</>}
                                {t === 'Social' && <><Heart size={14}/> تعامل</>}
                            </button>
                        ))}
                    </div>
                    
                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 print:overflow-visible">
                        
                        {/* ---------------- SOCIAL TAB (NEW) ---------------- */}
                        {recordTab === 'Social' && (
                            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="bg-dark-900 rounded-2xl p-8 border border-dark-700 text-center space-y-4">
                                    <h3 className="text-xl font-bold text-white">بازخورد و مشارکت در کیس آموزشی</h3>
                                    <p className="text-gray-400">نظر شما در مورد تشخیص و درمان این بیمار چیست؟</p>
                                    
                                    <button 
                                        onClick={handleLike}
                                        className="inline-flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3 rounded-full transition-all border border-red-500/20 group"
                                    >
                                        <Heart size={24} className={`group-hover:fill-current fill-current`} />
                                        <span className="font-bold text-lg">{selectedPatient.likes || 0} لایک</span>
                                    </button>
                                </div>

                                <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
                                    <div className="p-4 bg-dark-900 border-b border-dark-700 font-bold text-gray-300">
                                        نظرات و بحث ({selectedPatient.comments?.length || 0})
                                    </div>
                                    <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                                        {selectedPatient.comments && selectedPatient.comments.length > 0 ? (
                                            selectedPatient.comments.map(comment => (
                                                <div key={comment.id} className="bg-dark-900 p-4 rounded-xl border border-dark-700">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center">
                                                                <User size={16} className="text-gray-400" />
                                                            </div>
                                                            <div>
                                                                <span className="text-white font-bold text-sm block">{comment.user}</span>
                                                                <span className="text-xs text-gray-500">{comment.role}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-600">{comment.date}</span>
                                                    </div>
                                                    <p className="text-gray-300 text-sm leading-relaxed">{comment.text}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">اولین نظر را شما ثبت کنید.</p>
                                        )}
                                    </div>
                                    <div className="p-4 bg-dark-900/50 border-t border-dark-700 flex gap-2">
                                        <input 
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="نظر خود را بنویسید..."
                                            className="flex-1 bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                                            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                                        />
                                        <button 
                                            onClick={handleComment}
                                            disabled={!newComment.trim()}
                                            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ---------------- HISTORY TAB ---------------- */}
                        {recordTab === 'History' && (
                            <div className="print:hidden"> 
                                {/* Permission Warning for Nurses */}
                                {!canEditClinical && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/50 p-3 rounded-xl flex items-center gap-3 text-yellow-200 text-sm mb-4">
                                        <ShieldAlert size={18} />
                                        شما دسترسی مشاهده دارید (فقط خواندنی). امکان ویرایش شرح حال برای نقش شما غیرفعال است.
                                    </div>
                                )}

                                {/* CC & PI */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-primary flex items-center gap-2">
                                            <Activity size={16}/> شکایت اصلی (CC)
                                        </label>
                                        <textarea 
                                            disabled={!canEditClinical}
                                            className="w-full bg-dark-900 border border-dark-600 rounded-xl p-3 text-white h-24 focus:outline-none focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
                                            value={selectedPatient.chiefComplaint}
                                            onChange={(e) => handleTextChange('chiefComplaint', e.target.value)}
                                            onBlur={(e) => handleBlurLog('Chief Complaint', selectedPatient.chiefComplaint, e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-primary flex items-center gap-2">
                                            <FileText size={16}/> شرح بیماری کنونی (PI)
                                        </label>
                                        <textarea 
                                            disabled={!canEditClinical}
                                            className="w-full bg-dark-900 border border-dark-600 rounded-xl p-3 text-white h-24 focus:outline-none focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
                                            value={selectedPatient.presentIllness}
                                            onChange={(e) => handleTextChange('presentIllness', e.target.value)}
                                            onBlur={(e) => handleBlurLog('Present Illness', selectedPatient.presentIllness, e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Histories */}
                                <div className="space-y-4 mt-6">
                                    <h3 className="text-lg font-bold text-white border-b border-dark-700 pb-2">سوابق پزشکی (Histories)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { label: 'سوابق پزشکی (PMH)', field: 'pmh', placeholder: 'فشار خون، دیابت...' },
                                            { label: 'سوابق جراحی (PSH)', field: 'psh', placeholder: 'آپاندکتومی...' },
                                            { label: 'سوابق خانوادگی (FH)', field: 'fh', placeholder: 'سکته قلبی پدر...' },
                                            { label: 'سوابق اجتماعی (SH)', field: 'sh', isString: true, placeholder: 'سیگار، الکل، شغل...' }
                                        ].map((item: any) => (
                                            <div key={item.field} className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">{item.label}</label>
                                                {item.isString ? (
                                                    <input 
                                                        disabled={!canEditClinical}
                                                        className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2 text-white disabled:opacity-60"
                                                        value={selectedPatient[item.field as keyof Patient] as string}
                                                        onChange={(e) => handleTextChange(item.field, e.target.value)}
                                                        onBlur={(e) => handleBlurLog(item.field, selectedPatient[item.field as keyof Patient] as string, e.target.value)}
                                                        placeholder={item.placeholder}
                                                    />
                                                ) : (
                                                    <div className={`bg-dark-900 border border-dark-600 rounded-lg p-2 ${!canEditClinical ? 'opacity-60' : ''}`}>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {(selectedPatient[item.field as keyof Patient] as string[]).map((tag, idx) => (
                                                                <span key={idx} className="bg-dark-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                                                                    {tag}
                                                                    {canEditClinical && (
                                                                        <button onClick={() => {
                                                                            const newTags = (selectedPatient[item.field as keyof Patient] as string[]).filter((_, i) => i !== idx);
                                                                            updatePatientWithLog(
                                                                                { ...selectedPatient, [item.field]: newTags },
                                                                                `Remove ${item.field}`,
                                                                                `Removed: ${tag}`
                                                                            );
                                                                        }}><X size={12}/></button>
                                                                    )}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        {canEditClinical && (
                                                            <input 
                                                                className="w-full bg-transparent outline-none text-sm text-white"
                                                                placeholder="تایپ کنید و Enter بزنید..."
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const val = e.currentTarget.value.trim();
                                                                        if (val) {
                                                                            const current = selectedPatient[item.field as keyof Patient] as string[];
                                                                            updatePatientWithLog(
                                                                                { ...selectedPatient, [item.field]: [...current, val] },
                                                                                `Add ${item.field}`,
                                                                                `Added: ${val}`
                                                                            );
                                                                            e.currentTarget.value = '';
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Drug History */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">سوابق دارویی (DH)</label>
                                        <div className={`bg-dark-900 border border-dark-600 rounded-lg p-3 ${!canEditClinical ? 'opacity-70' : ''}`}>
                                            {canEditClinical && (
                                                <div className="flex gap-2 mb-3">
                                                    <div className="relative flex-1">
                                                        <input 
                                                            className="w-full bg-dark-800 rounded px-3 py-2 text-sm text-white focus:outline-none"
                                                            placeholder="نام دارو..."
                                                            value={drugSearch}
                                                            onChange={(e) => {
                                                                setDrugSearch(e.target.value);
                                                                setNewDrug({...newDrug, name: e.target.value});
                                                            }}
                                                        />
                                                        {drugSearch && !COMMON_DRUGS.includes(drugSearch) && (
                                                            <div className="absolute top-full left-0 right-0 bg-dark-800 border border-dark-600 rounded mt-1 z-10 max-h-32 overflow-y-auto">
                                                                {COMMON_DRUGS.filter(d => d.toLowerCase().includes(drugSearch.toLowerCase())).map(d => (
                                                                    <div key={d} className="p-2 hover:bg-dark-700 cursor-pointer text-sm" onClick={() => {
                                                                        setDrugSearch(d);
                                                                        setNewDrug({...newDrug, name: d});
                                                                    }}>
                                                                        {d}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input 
                                                        className="w-24 bg-dark-800 rounded px-3 py-2 text-sm text-white focus:outline-none"
                                                        placeholder="دوز"
                                                        value={newDrug.dosage}
                                                        onChange={(e) => setNewDrug({...newDrug, dosage: e.target.value})}
                                                    />
                                                    <input 
                                                        className="w-24 bg-dark-800 rounded px-3 py-2 text-sm text-white focus:outline-none"
                                                        placeholder="تکرار"
                                                        value={newDrug.frequency}
                                                        onChange={(e) => setNewDrug({...newDrug, frequency: e.target.value})}
                                                    />
                                                    <button onClick={addDrugHistory} className="bg-primary text-white p-2 rounded"><Plus size={16}/></button>
                                                </div>
                                            )}
                                            <div className="flex flex-wrap gap-2">
                                                {selectedPatient.dh.map(drug => (
                                                    <div key={drug.id} className="bg-dark-700 border border-dark-600 rounded-lg p-2 flex items-center gap-3">
                                                        <Pill size={16} className="text-accent-blue"/>
                                                        <div className="text-xs">
                                                            <div className="font-bold text-white">{drug.name}</div>
                                                            <div className="text-gray-400">{drug.dosage} - {drug.frequency}</div>
                                                        </div>
                                                        {canEditClinical && (
                                                            <button onClick={() => removeDrugHistory(drug.id, drug.name)} className="text-red-400 hover:text-red-300"><X size={14}/></button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ROS */}
                                <div className="space-y-4 mt-6">
                                    <h3 className="text-lg font-bold text-white border-b border-dark-700 pb-2">بررسی سیستم‌ها (ROS)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(ROS_CATEGORIES).map(([cat, symptoms]) => (
                                            <div key={cat} className="bg-dark-900 rounded-xl p-3 border border-dark-600">
                                                <h4 className="font-bold text-sm text-accent-blue mb-2">{cat}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {symptoms.map(sym => {
                                                        const active = selectedPatient.ros[cat]?.includes(sym);
                                                        return (
                                                            <button 
                                                                key={sym}
                                                                disabled={!canEditClinical}
                                                                onClick={() => toggleROS(cat, sym)}
                                                                className={`text-xs px-2 py-1 rounded-full border transition-all ${active ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-dark-800 text-gray-500 border-transparent'} ${!canEditClinical ? 'cursor-not-allowed opacity-80' : 'hover:border-gray-600'}`}
                                                            >
                                                                {sym}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* General & Vitals */}
                                <div className="space-y-4 mt-6">
                                    <h3 className="text-lg font-bold text-white border-b border-dark-700 pb-2">معاینات عمومی</h3>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">ظاهر کلی (General Appearance)</label>
                                        <input 
                                            disabled={!canEditClinical}
                                            className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-white disabled:opacity-60"
                                            value={selectedPatient.generalAppearance}
                                            onChange={(e) => handleTextChange('generalAppearance', e.target.value)}
                                            onBlur={(e) => handleBlurLog('General Appearance', selectedPatient.generalAppearance, e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                        {[
                                            { k: 'bp', l: 'BP (mmHg)' }, { k: 'hr', l: 'HR (bpm)' },
                                            { k: 'rr', l: 'RR (/min)' }, { k: 'spo2', l: 'SpO2 (%)' },
                                            { k: 'temp', l: 'Temp (°C)' }, { k: 'gcs', l: 'GCS (/15)' },
                                        ].map(v => (
                                            <div key={v.k} className="bg-dark-900 p-2 rounded-lg border border-dark-600">
                                                <label className="text-xs text-gray-500 block mb-1 font-mono">{v.l}</label>
                                                <input 
                                                    disabled={!canEditClinical}
                                                    className="w-full bg-transparent text-white font-bold text-center outline-none disabled:opacity-60"
                                                    value={selectedPatient.vitalSigns[v.k as keyof typeof selectedPatient.vitalSigns]}
                                                    onChange={(e) => handleTextChange('vitalSigns', { ...selectedPatient.vitalSigns, [v.k]: e.target.value })}
                                                    onBlur={(e) => handleBlurLog(`Vital ${v.k}`, selectedPatient.vitalSigns[v.k as keyof typeof selectedPatient.vitalSigns], e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Physical Exam */}
                                <div className="space-y-4 mt-6">
                                    <h3 className="text-lg font-bold text-white border-b border-dark-700 pb-2">معاینات فیزیکی (Physical Exam)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {PHYSICAL_EXAM_PARTS.map(part => (
                                            <div key={part} className="flex gap-3 bg-dark-900 p-3 rounded-xl border border-dark-600">
                                                <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-primary shrink-0">
                                                    <User size={20}/>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-sm font-bold text-gray-300 mb-1 block">{part}</label>
                                                    <textarea 
                                                        disabled={!canEditClinical}
                                                        className="w-full bg-dark-800 text-sm text-white rounded p-2 h-20 outline-none resize-none disabled:opacity-60"
                                                        placeholder="یافته‌های معاینه..."
                                                        value={selectedPatient.physicalExam[part] || ''}
                                                        onChange={(e) => handleTextChange('physicalExam', { ...selectedPatient.physicalExam, [part]: e.target.value })}
                                                        onBlur={(e) => handleBlurLog(`Physical Exam ${part}`, selectedPatient.physicalExam[part] || '', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Assessment */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-dark-900/50 p-6 rounded-2xl border border-dark-700 mt-6">
                                    <div>
                                        <h4 className="text-primary font-bold mb-3 flex items-center gap-2"><ClipboardList size={18}/> لیست مشکلات (Problem List)</h4>
                                        <div className="space-y-2">
                                            {selectedPatient.problemList.map((p, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <span className="text-gray-500">{i+1}.</span>
                                                    <input 
                                                        disabled={!canEditClinical}
                                                        className="flex-1 bg-dark-800 rounded px-2 py-1 text-sm text-white disabled:opacity-60"
                                                        value={p}
                                                        onChange={(e) => {
                                                            const newList = [...selectedPatient.problemList];
                                                            newList[i] = e.target.value;
                                                            handleTextChange('problemList', newList);
                                                        }}
                                                        onBlur={(e) => handleBlurLog(`Problem List ${i+1}`, selectedPatient.problemList[i], e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                            {canEditClinical && (
                                                <button 
                                                    onClick={() => handleTextChange('problemList', [...selectedPatient.problemList, ''])}
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    + افزودن مشکل
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-accent-orange font-bold mb-3 flex items-center gap-2"><CheckSquare size={18}/> تشخیص‌های افتراقی (DDx)</h4>
                                        <div className="space-y-2">
                                            {selectedPatient.differentialDiagnosis.map((ddx, i) => (
                                                <div key={i} className="flex gap-2 items-center">
                                                    <input 
                                                        disabled={!canEditClinical}
                                                        type="radio"
                                                        name="primaryDx"
                                                        checked={selectedPatient.primaryDiagnosis === ddx && ddx !== ''}
                                                        onChange={() => {
                                                            if (canEditClinical) {
                                                                updatePatientWithLog({ ...selectedPatient, primaryDiagnosis: ddx }, 'Set Diagnosis', `Primary: ${ddx}`);
                                                            }
                                                        }}
                                                        className="accent-primary"
                                                    />
                                                    <input 
                                                        disabled={!canEditClinical}
                                                        className="flex-1 bg-dark-800 rounded px-2 py-1 text-sm text-white disabled:opacity-60"
                                                        value={ddx}
                                                        onChange={(e) => {
                                                            const newList = [...selectedPatient.differentialDiagnosis];
                                                            newList[i] = e.target.value;
                                                            handleTextChange('differentialDiagnosis', newList);
                                                        }}
                                                        onBlur={(e) => handleBlurLog(`DDx ${i+1}`, selectedPatient.differentialDiagnosis[i], e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                            {canEditClinical && (
                                                <button 
                                                    onClick={() => handleTextChange('differentialDiagnosis', [...selectedPatient.differentialDiagnosis, ''])}
                                                    className="text-xs text-accent-orange hover:underline"
                                                >
                                                    + افزودن تشخیص
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ---------------- ORDERS TAB ---------------- */}
                        {recordTab === 'Orders' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full print:hidden">
                                {/* Order List */}
                                <div className="lg:col-span-2 space-y-6">
                                    
                                    {/* Prescribed Drugs */}
                                    <div className="bg-dark-900 rounded-2xl p-4 border border-dark-600">
                                        <h3 className="font-bold text-accent-blue mb-4 flex items-center gap-2"><Pill size={18}/> دستورات دارویی</h3>
                                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                            {selectedPatient.orders.filter(o => o.type === 'Drug').length === 0 && <p className="text-gray-500 text-sm">موردی ثبت نشده است.</p>}
                                            {selectedPatient.orders.filter(o => o.type === 'Drug').map(order => (
                                                <div key={order.id} className={`bg-dark-800 p-3 rounded-xl flex flex-col gap-2 ${order.status === 'Completed' ? 'border-r-4 border-r-green-500' : order.status === 'Flagged' ? 'border-r-4 border-r-red-500' : ''}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="text-white font-medium flex items-center gap-2">
                                                                {order.name}
                                                                {order.status === 'Completed' && <CheckCircle size={14} className="text-green-500"/>}
                                                                {order.status === 'Flagged' && <AlertTriangle size={14} className="text-red-500"/>}
                                                            </div>
                                                            {/* Detailed Drug Info */}
                                                            {order.dosage && (
                                                                <div className="text-sm text-accent-blue mt-1 font-bold">
                                                                    {order.dosage} | {order.route} | {order.frequency}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                تجویز: {order.prescribedBy} | {order.date}
                                                            </div>
                                                            {order.completedBy && <div className="text-xs text-green-400 mt-0.5">اجرا: {order.completedBy}</div>}
                                                            {order.flagReason && <div className="text-xs text-red-400 mt-0.5">هشدار: {order.flagReason}</div>}
                                                        </div>
                                                        
                                                        {/* Actions based on Role */}
                                                        {canAdminister && order.status === 'Pending' && (
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => updateOrderStatus(order.id, 'Completed')}
                                                                    className="bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white px-3 py-1 rounded text-xs transition-colors border border-green-500/30"
                                                                >
                                                                    انجام شد
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        const reason = prompt('دلیل عدم انجام یا هشدار:');
                                                                        if (reason) updateOrderStatus(order.id, 'Flagged', reason);
                                                                    }}
                                                                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded text-xs transition-colors border border-red-500/30"
                                                                >
                                                                    هشدار
                                                                </button>
                                                            </div>
                                                        )}

                                                        {canPrescribe && order.status === 'Pending' && (
                                                            <button onClick={() => {
                                                                const newOrders = selectedPatient.orders.filter(o => o.id !== order.id);
                                                                updatePatientWithLog({ ...selectedPatient, orders: newOrders }, 'Cancel Order', `Cancelled ${order.name}`);
                                                            }} className="text-red-400 p-1"><Trash2 size={16}/></button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Labs & Imaging */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-dark-900 rounded-2xl p-4 border border-dark-600">
                                            <h3 className="font-bold text-accent-orange mb-4 flex items-center gap-2"><Syringe size={18}/> آزمایشات</h3>
                                            <div className="space-y-2">
                                                {selectedPatient.orders.filter(o => o.type === 'Lab').map(order => (
                                                    <div key={order.id} className="bg-dark-800 p-2 rounded-lg flex justify-between items-center text-sm">
                                                        <div>
                                                            <span className="text-white block">{order.name}</span>
                                                            <span className="text-[10px] text-gray-500">{order.status === 'Completed' ? `انجام: ${order.completedBy}` : 'در انتظار'}</span>
                                                        </div>
                                                        {canAdminister && order.status === 'Pending' && (
                                                            <button onClick={() => updateOrderStatus(order.id, 'Completed')} className="text-green-500 text-xs border border-green-500 px-2 py-0.5 rounded">تایید</button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-dark-900 rounded-2xl p-4 border border-dark-600">
                                            <h3 className="font-bold text-accent-purple mb-4 flex items-center gap-2"><Eye size={18}/> تصویربرداری</h3>
                                            <div className="space-y-2">
                                                {selectedPatient.orders.filter(o => o.type === 'Imaging').map(order => (
                                                    <div key={order.id} className="bg-dark-800 p-2 rounded-lg flex justify-between items-center text-sm">
                                                         <div>
                                                            <span className="text-white block">{order.name}</span>
                                                            <span className="text-[10px] text-gray-500">{order.status === 'Completed' ? `انجام: ${order.completedBy}` : 'در انتظار'}</span>
                                                        </div>
                                                        {canAdminister && order.status === 'Pending' && (
                                                            <button onClick={() => updateOrderStatus(order.id, 'Completed')} className="text-green-500 text-xs border border-green-500 px-2 py-0.5 rounded">تایید</button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Prescribe Sidebar - ONLY FOR DOCTORS */}
                                {canPrescribe ? (
                                    <div className="bg-dark-800 border-l border-dark-700 pl-4 space-y-6">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-400 mb-2">داروهای پرکاربرد</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {COMMON_DRUGS.map(d => (
                                                    <button key={d} onClick={() => initiateOrder('Drug', d)} className="text-xs bg-dark-700 hover:bg-accent-blue hover:text-white px-2 py-1 rounded transition-colors text-gray-300">
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-400 mb-2">آزمایشات روتین</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {COMMON_LABS.map(l => (
                                                    <button key={l} onClick={() => initiateOrder('Lab', l)} className="text-xs bg-dark-700 hover:bg-accent-orange hover:text-white px-2 py-1 rounded transition-colors text-gray-300">
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-400 mb-2">تصویربرداری</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {COMMON_IMAGING.map(i => (
                                                    <button key={i} onClick={() => initiateOrder('Imaging', i)} className="text-xs bg-dark-700 hover:bg-accent-purple hover:text-white px-2 py-1 rounded transition-colors text-gray-300">
                                                        {i}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-dark-900/50 rounded-xl p-4 flex flex-col items-center justify-center text-center h-40">
                                        <ShieldCheck className="text-gray-500 mb-2" size={32}/>
                                        <p className="text-gray-400 text-sm">شما دسترسی تجویز ندارید.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ---------------- FOLLOW UP TAB ---------------- */}
                        {recordTab === 'FollowUp' && (
                            <div className="space-y-6 print:hidden">
                                <div className="bg-primary/10 border border-primary/30 p-4 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <span className="text-primary text-sm font-bold block mb-1">تشخیص نهایی (Final Diagnosis)</span>
                                        <h3 className="text-xl font-bold text-white">{selectedPatient.primaryDiagnosis || 'هنوز انتخاب نشده'}</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs text-gray-400">وضعیت فعلی</span>
                                        <span className="text-yellow-400 font-bold">{selectedPatient.status === 'Admitted' ? 'بستری' : 'ترخیص شده'}</span>
                                    </div>
                                </div>

                                <div className="bg-dark-900 p-6 rounded-2xl border border-dark-600">
                                    <h3 className="font-bold text-white mb-4">سیر بیماری (Progress Notes)</h3>
                                    <div className="flex gap-2 mb-6">
                                        <textarea 
                                            id="new-note"
                                            className="flex-1 bg-dark-800 border border-dark-600 rounded-xl p-3 text-white h-20 outline-none focus:border-primary"
                                            placeholder="یادداشت جدید..."
                                        />
                                        <button 
                                            onClick={() => {
                                                const el = document.getElementById('new-note') as HTMLTextAreaElement;
                                                addProgressNote(el.value);
                                                el.value = '';
                                            }}
                                            className="bg-primary hover:bg-primary/90 text-white px-6 rounded-xl font-bold"
                                        >
                                            ثبت
                                        </button>
                                    </div>
                                    
                                    <div className="relative border-r-2 border-dark-700 pr-6 space-y-8">
                                        {selectedPatient.progressNotes.map(note => (
                                            <div key={note.id} className="relative">
                                                <div className="absolute -right-[31px] top-0 w-4 h-4 rounded-full bg-dark-600 border-2 border-dark-900"></div>
                                                <div className="text-xs text-gray-500 mb-1">{note.date} <span className="text-dark-600 mx-1">|</span> {note.author}</div>
                                                <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 text-gray-200 leading-relaxed">
                                                    {note.note}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ---------------- LOG TAB (AUDIT) ---------------- */}
                        {recordTab === 'Log' && (
                            // Add 'print:...' classes to style the log for printing
                            <div className="space-y-4 print:fixed print:inset-0 print:bg-white print:z-[9999] print:p-8 print:h-full print:w-full print:overflow-visible">
                                <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 flex items-center justify-between print:bg-gray-100 print:border-gray-300">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="text-green-500 print:text-black" size={24} />
                                        <div>
                                            <h3 className="font-bold text-white text-sm print:text-black">ثبت وقایع (Audit Log) - پرونده {selectedPatient.name}</h3>
                                            <p className="text-xs text-gray-400 print:text-gray-600">تمامی اقدامات انجام شده روی پرونده این بیمار به صورت خودکار ثبت و غیرقابل تغییر می‌باشد.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg transition-colors print:hidden"
                                    >
                                        <Printer size={16} />
                                        چاپ گزارش
                                    </button>
                                </div>

                                <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden print:bg-white print:border-gray-300 print:shadow-none">
                                    <table className="w-full text-right text-sm">
                                        <thead className="bg-dark-900 text-gray-400 print:bg-gray-200 print:text-black">
                                            <tr>
                                                <th className="p-4">زمان</th>
                                                <th className="p-4">کاربر</th>
                                                <th className="p-4">اقدام</th>
                                                <th className="p-4">جزئیات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-dark-700 print:divide-gray-300">
                                            {selectedPatient.auditLogs && selectedPatient.auditLogs.length > 0 ? (
                                                selectedPatient.auditLogs.map(log => (
                                                    <tr key={log.id} className="hover:bg-dark-700/50 print:text-black">
                                                        <td className="p-4 font-mono text-gray-400 dir-ltr text-right print:text-black">{log.timestamp}</td>
                                                        <td className="p-4">
                                                            <div className="font-bold text-white print:text-black">{log.user}</div>
                                                            <div className="text-[10px] text-gray-500 print:text-gray-600">{log.role}</div>
                                                        </td>
                                                        <td className="p-4 text-accent-blue print:text-black font-bold">{log.action}</td>
                                                        <td className="p-4 text-gray-300 print:text-black">{log.details}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                                        هنوز اقدامی ثبت نشده است.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center text-dark-500">
                        <FileText size={40} />
                    </div>
                    <p>لطفاً یک بیمار را از لیست انتخاب کنید</p>
                </div>
            )}
        </div>
      </div>

      {/* --- Drug Prescription Modal --- */}
      {prescribeModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-dark-800 w-full max-w-lg rounded-3xl border border-dark-700 shadow-2xl overflow-hidden">
                  <div className="p-5 border-b border-dark-700 flex justify-between items-center bg-dark-900/50">
                      <div>
                          <h3 className="text-xl font-bold text-white">تجویز دارو</h3>
                          <p className="text-sm text-primary">{pendingDrugName}</p>
                      </div>
                      <button onClick={() => setPrescribeModalOpen(false)} className="text-gray-400 hover:text-white">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-gray-400 text-sm mb-2">دوز مصرفی (Dosage)</label>
                          <input 
                              type="text" 
                              autoFocus
                              placeholder="مثال: 500mg یا 10ml"
                              className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                              value={prescribeDetails.dosage}
                              onChange={(e) => setPrescribeDetails({...prescribeDetails, dosage: e.target.value})}
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-gray-400 text-sm mb-2">راه مصرف (Route)</label>
                              <select 
                                  className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary appearance-none"
                                  value={prescribeDetails.route}
                                  onChange={(e) => setPrescribeDetails({...prescribeDetails, route: e.target.value})}
                              >
                                  {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-gray-400 text-sm mb-2">تواتر (Frequency)</label>
                              <select 
                                  className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary appearance-none"
                                  value={prescribeDetails.frequency}
                                  onChange={(e) => setPrescribeDetails({...prescribeDetails, frequency: e.target.value})}
                              >
                                  {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                              </select>
                          </div>
                      </div>
                  </div>

                  <div className="p-4 border-t border-dark-700 bg-dark-900/50 flex justify-end gap-3">
                      <button 
                          onClick={() => setPrescribeModalOpen(false)}
                          className="px-6 py-2 rounded-xl text-gray-300 hover:bg-dark-700 transition-colors"
                      >
                          لغو
                      </button>
                      <button 
                          onClick={confirmDrugPrescription}
                          disabled={!prescribeDetails.dosage}
                          className="px-6 py-2 rounded-xl text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                      >
                          تایید و ثبت
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Records;