import React, { useState } from 'react';
import { 
  Home, LayoutGrid, Calendar, Wallet, MessageSquare, FolderOpen, 
  Settings, LogOut, Menu, Search, Bell, User
} from 'lucide-react';
import { Page, UserProfile, UserRole } from '../types.ts';

interface LayoutProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  children: React.ReactNode;
  onSearch: (query: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ currentPage, setPage, user, setUser, children, onSearch }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Jalali Date Formatter (Native)
  const today = new Date();
  const jalaliDate = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(today);
  
  const time = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(today);

  const navItems = [
    { id: Page.Home, label: 'خانه', icon: Home },
    { id: Page.Wards, label: 'بخش‌ها', icon: LayoutGrid },
    { id: Page.Calendar, label: 'تقویم', icon: Calendar },
    { id: Page.Financials, label: 'امور مالی', icon: Wallet },
    { id: Page.Messages, label: 'پیام‌ها', icon: MessageSquare },
    { id: Page.Records, label: 'سوابق بیماران', icon: FolderOpen },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="flex min-h-screen bg-dark-900 text-gray-100 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - HIDDEN ON PRINT */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50 w-72 bg-dark-800 border-l border-dark-700 
        transform transition-transform duration-300 ease-in-out print:hidden
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          
          {/* Profile Section */}
          <div className="p-8 flex flex-col items-center border-b border-dark-700">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-accent-blue to-accent-purple">
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover border-4 border-dark-800"
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-dark-800"></div>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
            <div className="relative w-full">
              <select 
                value={user.role}
                onChange={(e) => setUser({...user, role: e.target.value as any})}
                className="w-full appearance-none bg-dark-700 text-gray-400 text-sm py-2 px-3 rounded-xl cursor-pointer hover:bg-dark-600 outline-none text-center"
              >
                <option value={UserRole.MD_Specialist}>متخصص (استاد)</option>
                <option value={UserRole.MD_General}>پزشک عمومی</option>
                <option value={UserRole.MedicalStudent}>دانشجوی پزشکی</option>
                <option value={UserRole.Nurse_Head}>سرپرستار</option>
                <option value={UserRole.Nurse}>پرستار</option>
                <option value={UserRole.NursingStudent}>دانشجوی پرستاری</option>
                <option value={UserRole.Receptionist}>مسئول پذیرش</option>
              </select>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setPage(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-l from-primary/20 to-transparent text-primary border-r-4 border-primary' 
                      : 'text-gray-400 hover:bg-dark-700 hover:text-white'}
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium text-lg">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-dark-700 text-gray-500 text-sm flex justify-between">
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <Settings size={18} />
              تنظیمات
            </button>
            <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
              <LogOut size={18} />
              خروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header - HIDDEN ON PRINT */}
        <header className="h-20 bg-dark-900/90 backdrop-blur-md border-b border-dark-700 flex items-center justify-between px-6 lg:px-10 shrink-0 print:hidden">
          
          <div className="flex items-center gap-4 lg:hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 text-primary font-bold text-xl">
              <div className="p-1.5 bg-primary/20 rounded-lg">
                <User size={20} />
              </div>
              <span>Hospyar</span>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="flex-1 max-w-2xl hidden lg:block mx-8">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <input
                type="text"
                placeholder="هر چه دل تنگت می‌خواهد بجو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-800 text-white placeholder-gray-500 rounded-full py-3 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-dark-700 group-hover:border-dark-600"
              />
              <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary">
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-6">
             {/* Mobile Search Icon */}
             <button className="lg:hidden text-gray-400 hover:text-white">
                <Search size={24} />
             </button>

            <div className="hidden md:flex flex-col items-end">
              <span className="text-gray-200 font-medium">{jalaliDate}</span>
              <span className="text-primary text-sm font-bold dir-ltr">{time}</span>
            </div>
            
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors bg-dark-800 rounded-full hover:bg-dark-700">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-dark-900"></span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;