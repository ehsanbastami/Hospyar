import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types.ts';
import { User, Mail, Lock, Phone, GraduationCap, Building2, Stethoscope, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    university: '',
    fieldOfStudy: '',
    role: UserRole.MedicalStudent
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validation
    if (!formData.email || !formData.password) {
      setError('لطفاً ایمیل و رمز عبور را وارد کنید.');
      return;
    }

    if (!isLogin) {
      // All fields required for sign up
      if (
        !formData.firstName.trim() || 
        !formData.lastName.trim() || 
        !formData.phone.trim() || 
        !formData.university.trim() || 
        !formData.fieldOfStudy.trim()
      ) {
        setError('لطفاً تمام فیلدهای ستاره‌دار را تکمیل کنید.');
        return;
      }
    }

    // Mock Authentication Logic
    const userProfile: UserProfile = {
      name: isLogin ? 'کاربر آزمایشی' : `${formData.firstName} ${formData.lastName}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      university: formData.university,
      fieldOfStudy: formData.fieldOfStudy,
      role: formData.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`
    };

    // Simulate API delay
    setTimeout(() => {
      onLogin(userProfile);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-dark-800 w-full max-w-4xl rounded-3xl shadow-2xl flex overflow-hidden border border-dark-700">
        
        {/* Graphic Side */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-primary to-accent-purple p-10 text-white relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
          <div className="relative z-10 text-center">
             <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30">
                <Stethoscope size={40} className="text-white" />
             </div>
             <h1 className="text-4xl font-bold mb-4">Hospyar</h1>
             <p className="text-lg opacity-90">دستیار هوشمند و جامع مدیریت پزشکی</p>
             <div className="mt-12 space-y-4 text-sm opacity-80">
                <p className="flex items-center justify-center gap-2"><ArrowLeft size={16}/> مدیریت بیماران</p>
                <p className="flex items-center justify-center gap-2"><ArrowLeft size={16}/> گزارش‌گیری هوشمند</p>
                <p className="flex items-center justify-center gap-2"><ArrowLeft size={16}/> دستیار آموزشی</p>
             </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto max-h-screen">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? 'ورود به حساب کاربری' : 'ساخت حساب جدید'}</h2>
            <p className="text-gray-400 text-sm">
              {isLogin ? 'خوش آمدید! لطفاً وارد شوید.' : 'اطلاعات خود را برای شروع وارد کنید.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">نام *</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 text-gray-500" size={16} />
                    <input required name="firstName" placeholder="نام" className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:border-primary focus:outline-none" onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">نام خانوادگی *</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 text-gray-500" size={16} />
                    <input required name="lastName" placeholder="نام خانوادگی" className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:border-primary focus:outline-none" onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
               <label className="text-xs text-gray-400">ایمیل *</label>
               <div className="relative">
                  <Mail className="absolute right-3 top-3 text-gray-500" size={16} />
                  <input required name="email" type="email" placeholder="example@university.ac.ir" className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:border-primary focus:outline-none" onChange={handleChange} />
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-xs text-gray-400">رمز عبور *</label>
               <div className="relative">
                  <Lock className="absolute right-3 top-3 text-gray-500" size={16} />
                  <input required name="password" type="password" placeholder="••••••••" className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:border-primary focus:outline-none" onChange={handleChange} />
               </div>
            </div>

            {!isLogin && (
              <>
                 <div className="space-y-1">
                    <label className="text-xs text-gray-400">شماره تماس *</label>
                    <div className="relative">
                        <Phone className="absolute right-3 top-3 text-gray-500" size={16} />
                        <input required name="phone" placeholder="0912..." className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:border-primary focus:outline-none" onChange={handleChange} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">دانشگاه *</label>
                        <div className="relative">
                            <Building2 className="absolute right-3 top-3 text-gray-500" size={16} />
                            <input required name="university" placeholder="نام دانشگاه" className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:border-primary focus:outline-none" onChange={handleChange} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">رشته تحصیلی *</label>
                        <div className="relative">
                            <GraduationCap className="absolute right-3 top-3 text-gray-500" size={16} />
                            <input required name="fieldOfStudy" placeholder="مثال: پزشکی" className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:border-primary focus:outline-none" onChange={handleChange} />
                        </div>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-xs text-gray-400">نقش کاربری *</label>
                    <select required name="role" className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-white text-sm focus:border-primary focus:outline-none" onChange={handleChange} value={formData.role}>
                        <option value={UserRole.MedicalStudent}>دانشجوی پزشکی</option>
                        <option value={UserRole.MD_General}>پزشک عمومی</option>
                        <option value={UserRole.MD_Specialist}>پزشک متخصص</option>
                        <option value={UserRole.NursingStudent}>دانشجوی پرستاری</option>
                        <option value={UserRole.Nurse}>پرستار</option>
                        <option value={UserRole.Nurse_Head}>سرپرستار</option>
                        <option value={UserRole.Receptionist}>مسئول پذیرش</option>
                    </select>
                 </div>
              </>
            )}

            {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}

            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 mt-4 flex justify-center items-center gap-2">
              {isLogin ? 'ورود' : 'ثبت نام'}
              <ArrowLeft size={18} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? 'حساب کاربری ندارید؟' : 'قبلاً ثبت نام کرده‌اید؟'}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-primary font-bold mr-2 hover:underline"
              >
                {isLogin ? 'ثبت نام کنید' : 'وارد شوید'}
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;