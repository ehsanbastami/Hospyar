import React, { useState } from 'react';
import { Patient } from '../types.ts';
import { db } from '../services/db.ts';
import { Plus, Archive, ArrowRightLeft, Activity, Eye, X, Save } from 'lucide-react';

interface WardsProps {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

const Wards: React.FC<WardsProps> = ({ patients, setPatients }) => {
  const wardsList = ['اورژانس', 'ICU', 'CCU', 'داخلی', 'جراحی'];
  const [activeWard, setActiveWard] = useState('اورژانس');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(p => p.ward === activeWard && p.status === 'Admitted');

  const handleTransfer = (id: string, newWard: string) => {
    const p = patients.find(p => p.id === id);
    if (!p) return;
    const updated = { ...p, ward: newWard };
    
    setPatients(patients.map(p => p.id === id ? updated : p));
    db.upsertPatient(updated);
  };

  const handleDischarge = (id: string) => {
    if (window.confirm('آیا از بایگانی پرونده این بیمار اطمینان دارید؟')) {
       const p = patients.find(p => p.id === id);
       if (!p) return;
       const updated = { ...p, status: 'Discharged' as const };
       
       setPatients(patients.map(p => p.id === id ? updated : p));
       db.upsertPatient(updated);
    }
  };

  const handleAddPatient = () => {
    const newPatient: Patient = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'بیمار جدید',
        age: 0,
        ward: activeWard,
        diagnosis: 'بررسی نشده',
        admissionDate: new Date().toLocaleDateString('fa-IR'),
        status: 'Admitted',
        chiefComplaint: '',
        presentIllness: '',
        pmh: [], psh: [], fh: [], dh: [], sh: '',
        ros: {},
        generalAppearance: '',
        vitalSigns: { bp: '', hr: '', rr: '', spo2: '', temp: '', gcs: '' },
        physicalExam: {},
        problemList: [],
        differentialDiagnosis: [],
        primaryDiagnosis: '',
        orders: [],
        progressNotes: [],
        auditLogs: []
    };
    setPatients([newPatient, ...patients]);
    db.upsertPatient(newPatient);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">مدیریت بخش‌ها</h2>
        <button 
          onClick={handleAddPatient}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={18} />
          پذیرش بیمار جدید
        </button>
      </div>

      {/* Wards Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {wardsList.map(ward => (
          <button
            key={ward}
            onClick={() => setActiveWard(ward)}
            className={`
              px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all
              ${activeWard === ward 
                ? 'bg-dark-700 text-white border border-primary/50 shadow-lg shadow-primary/10' 
                : 'bg-dark-800 text-gray-400 border border-transparent hover:bg-dark-700'}
            `}
          >
            {ward}
          </button>
        ))}
      </div>

      {/* Patient List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-dark-700 rounded-3xl">
            بیماری در بخش {activeWard} بستری نیست.
          </div>
        ) : (
          filteredPatients.map(patient => (
            <div key={patient.id} className="bg-dark-800 p-6 rounded-2xl border border-dark-700 hover:border-dark-600 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-primary">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{patient.name}</h3>
                    <span className="text-xs text-gray-400">{patient.age} ساله</span>
                  </div>
                </div>
                <span className="text-xs bg-dark-900 text-primary px-2 py-1 rounded">
                  {patient.admissionDate}
                </span>
              </div>
              
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">تشخیص:</span>
                  <span className="text-gray-200">{patient.primaryDiagnosis || patient.diagnosis}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">وضعیت:</span>
                  <span className="text-yellow-500">تحت مراقبت</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setSelectedPatient(patient)}
                  className="w-full flex items-center justify-center gap-2 bg-dark-700 hover:bg-primary hover:text-white text-gray-300 py-2.5 rounded-xl text-sm transition-all"
                >
                    <Eye size={16} />
                    مشاهده خلاصه وضعیت
                </button>

                <div className="flex gap-2 pt-2 border-t border-dark-700">
                    <div className="relative group flex-1">
                        <select 
                            className="absolute opacity-0 inset-0 w-full cursor-pointer z-10"
                            onChange={(e) => handleTransfer(patient.id, e.target.value)}
                            value={patient.ward}
                        >
                            {wardsList.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                        <button className="w-full flex items-center justify-center gap-2 bg-dark-900 hover:bg-dark-800 text-gray-400 py-2 rounded-lg text-sm transition-colors">
                        <ArrowRightLeft size={16} />
                        انتقال
                        </button>
                    </div>
                    <button 
                    onClick={() => handleDischarge(patient.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-dark-900 hover:bg-red-900/20 hover:text-red-400 text-gray-400 py-2 rounded-lg text-sm transition-colors"
                    >
                    <Archive size={16} />
                    ترخیص
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Simplified Patient Detail Modal for Wards View */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-800 w-full max-w-2xl rounded-3xl border border-dark-700 flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">{selectedPatient.name}</h2>
                        <p className="text-sm text-gray-400">خلاصه وضعیت در بخش</p>
                    </div>
                    <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-dark-700 rounded-full text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <span className="text-sm text-primary font-bold">شکایت اصلی:</span>
                        <p className="text-gray-300 mt-1">{selectedPatient.chiefComplaint || 'ثبت نشده'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-primary font-bold">تشخیص نهایی:</span>
                        <p className="text-white text-lg font-bold mt-1">{selectedPatient.primaryDiagnosis || 'نامشخص'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-primary font-bold">علائم حیاتی آخر:</span>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                             <div className="bg-dark-900 p-2 rounded text-center border border-dark-600">
                                <span className="text-xs text-gray-500 block">فشار خون</span>
                                {selectedPatient.vitalSigns.bp || '-'}
                             </div>
                             <div className="bg-dark-900 p-2 rounded text-center border border-dark-600">
                                <span className="text-xs text-gray-500 block">ضربان</span>
                                {selectedPatient.vitalSigns.hr || '-'}
                             </div>
                             <div className="bg-dark-900 p-2 rounded text-center border border-dark-600">
                                <span className="text-xs text-gray-500 block">دما</span>
                                {selectedPatient.vitalSigns.temp || '-'}
                             </div>
                        </div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg text-sm text-yellow-200">
                        برای ویرایش کامل پرونده، دستورات و سیر بیماری لطفاً به صفحه <b>سوابق بیماران</b> مراجعه کنید.
                    </div>
                </div>

                <div className="p-4 border-t border-dark-700 bg-dark-900/50 flex justify-end">
                    <button 
                        onClick={() => setSelectedPatient(null)}
                        className="px-6 py-2 rounded-xl text-white bg-dark-700 hover:bg-dark-600 transition-colors"
                    >
                        بستن
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Wards;