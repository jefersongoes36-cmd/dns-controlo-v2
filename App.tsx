import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import Chat from './components/Chat';
import Help from './components/Help';
import SalesPage from './components/SalesPage';
import { User, TimeRecord, SupportedLanguage, SUPPORTED_LANGUAGES, CURRENCIES, ChatMessage } from './types';
import { TRANSLATIONS } from './constants';
import { getGreeting } from './utils/helpers';
import { LayoutDashboard, PieChart, LogOut, Settings, Globe, Wallet, Users as UsersIcon, Menu, UserCircle, User as UserIconGeneric, MessageCircle, HelpCircle } from 'lucide-react';

// Initial Mock Data
const INITIAL_USERS: User[] = [
  {
    id: 'MASTER-01',
    username: 'admin',
    password: '123', // Demo password
    name: 'Master Admin',
    role: 'master',
    currency: 'EUR',
    country: 'PT',
    language: 'pt',
    hourlyRate: 0,
    isActive: true,
    isProvisionalPassword: false
  },
  {
    id: 'DNS-2024-1001',
    username: 'joao',
    password: '123',
    name: 'João Silva',
    role: 'employee',
    currency: 'EUR', 
    country: 'PT',
    language: 'pt',
    hourlyRate: 15,
    nif: '123456789',
    isActive: true,
    isProvisionalPassword: true // Demo: needs to change password
  },
  {
    id: 'DNS-2024-1002',
    username: 'mario',
    password: '123',
    name: 'Mario Rossi',
    role: 'employee',
    currency: 'EUR',
    country: 'IT',
    language: 'it',
    hourlyRate: 20,
    isActive: true,
    isProvisionalPassword: false,
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150'
  },
  {
    id: 'DNS-2024-1003',
    username: 'carlos',
    password: '123',
    name: 'Carlos Oliveira',
    role: 'employee',
    currency: 'BRL',
    country: 'BR',
    language: 'pt-BR',
    hourlyRate: 50, // Reais
    isActive: true,
    isProvisionalPassword: false
  }
];

const App: React.FC = () => {
  const [phase, setPhase] = useState<'splash' | 'sales' | 'login' | 'greeting' | 'app'>('splash');
  const [user, setUser] = useState<User | null>(null);
  
  // Database States (Lifted up)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [records, setRecords] = useState<TimeRecord[]>([]);
  // Chat state lifted up to simulate "server" persistence across users
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'profile' | 'admin' | 'chat' | 'help'>('dashboard');
  const [greetingOpacity, setGreetingOpacity] = useState(0);
  
  // Global Settings (Defaults)
  const [lang, setLang] = useState<SupportedLanguage>('pt');

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    // Sync app language with user preference
    setLang(loggedInUser.language);
    // Set initial tab based on role
    setActiveTab(loggedInUser.role === 'master' ? 'admin' : 'dashboard');
    setPhase('greeting');
  };

  const handleRegister = (newUser: User) => {
      setUsers(prev => [...prev, newUser]);
      // Force user to login screen to enter their new credentials
      // But we can also show a success message or auto-fill
      alert(TRANSLATIONS[lang].paymentSuccess);
      setPhase('login');
  };

  const handleAddUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleEditUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    // If the logged in user is being edited (by master), update session too
    if (user && user.id === updatedUser.id) {
        setUser(updatedUser);
        setLang(updatedUser.language);
    }
  };

  // Specific handler for Profile Page updates
  const handleUpdateUserProfile = (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setUser(updatedUser);
      setLang(updatedUser.language);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handlePasswordChange = (userId: string, newPass: string) => {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, password: newPass, isProvisionalPassword: false } : u
      ));
  };

  const handleUpdateRecord = (record: TimeRecord) => {
    setRecords(prev => {
      const filtered = prev.filter(r => r.date !== record.date);
      return [...filtered, record];
    });
  };

  const handleSendMessage = (text: string) => {
    if (!user) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      text: text,
      timestamp: new Date().toISOString(),
      originalLanguage: user.language // Important: Capture the sender's language
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Restore Data Logic
  const handleRestoreData = (backupData: any) => {
      try {
          if (backupData.type === 'digital-nexus-backup-full') {
              if (user && user.role !== 'master') {
                  alert("Only admin can restore full system backups.");
                  return;
              }
              setUsers(backupData.users);
              setRecords(backupData.records);
              // Update session if current user still exists
              if (user) {
                  const updatedMe = backupData.users.find((u: User) => u.id === user.id);
                  if (updatedMe) setUser(updatedMe);
                  else setUser(null); // Log out if user deleted
              }
          } else if (backupData.type === 'digital-nexus-backup-single') {
              // Merge User
              const backupUser = backupData.userProfile;
              setUsers(prev => prev.map(u => u.id === backupUser.id ? backupUser : u));
              if (user && user.id === backupUser.id) {
                  setUser(backupUser);
                  setLang(backupUser.language);
              }

              // Merge Records (Strategy: Remove existing records for the same dates in backup, append new ones)
              // Note: In a real app with userId on records, filter by user. Here we assume records match dates.
              const backupRecordDates = backupData.records.map((r: TimeRecord) => r.date);
              setRecords(prev => [
                  ...prev.filter(r => !backupRecordDates.includes(r.date)), 
                  ...backupData.records
              ]);
          } else {
              throw new Error("Invalid backup type");
          }
      } catch (e) {
          console.error(e);
          alert(TRANSLATIONS[lang].invalidBackupFile);
      }
  };

  // Greeting Animation Logic
  useEffect(() => {
    if (phase === 'greeting') {
      // Fade In
      setTimeout(() => setGreetingOpacity(1), 100);
      // Fade Out
      setTimeout(() => setGreetingOpacity(0), 2500);
      // Switch to App
      setTimeout(() => setPhase('app'), 3500);
    }
  }, [phase]);

  const t = TRANSLATIONS[lang];

  if (phase === 'splash') {
    return (
        <SplashScreen 
            onLoginClick={() => setPhase('login')} 
            onSalesClick={() => setPhase('sales')}
            lang={lang}
            setLang={setLang}
        />
    );
  }

  if (phase === 'sales') {
      return (
          <SalesPage 
            onRegister={handleRegister} 
            lang={lang}
            setLang={setLang}
            onCancel={() => setPhase('splash')}
          />
      );
  }

  if (phase === 'login') {
    return (
      <>
       <div className="fixed top-4 right-4 z-50">
          <select 
            value={lang}
            onChange={(e) => setLang(e.target.value as SupportedLanguage)}
            className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
            ))}
          </select>
       </div>
       <Login 
          onLogin={handleLogin} 
          lang={lang} 
          users={users} 
          onPasswordChange={handlePasswordChange}
       />
      </>
    );
  }

  if (phase === 'greeting' && user) {
    return (
      <div 
        className="fixed inset-0 flex flex-col items-center justify-center bg-white transition-opacity duration-1000"
        style={{ opacity: greetingOpacity }}
      >
        <div className="mb-6 scale-150 transform">
           {user.profilePicture ? (
             <img src={user.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-xl" />
           ) : (
             <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-4xl shadow-xl">
                 {user.name.charAt(0)}
             </div>
           )}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center px-4">{getGreeting(lang)}, <br className="md:hidden" />{user.name.split(' ')[0]}</h2>
        <p className="text-lg md:text-xl text-gray-500">{t.companyName}</p>
        {user.role === 'master' && <p className="mt-2 text-blue-600 font-medium text-sm md:text-base">Administrator Access</p>}
      </div>
    );
  }

  if (phase === 'app' && user) {
    const isMaster = user.role === 'master';

    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        
        {/* Desktop Sidebar - Hidden on Mobile */}
        <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-shrink-0 flex-col">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Digital Nexus
            </h1>
            <p className="text-xs text-slate-400 mt-1">Solutions</p>
          </div>

          <div className="p-6 flex items-center gap-3 border-b border-slate-800 bg-slate-800/50">
            {/* User Profile Pic/Icon */}
            <div className="w-10 h-10 flex-shrink-0">
               {user.profilePicture ? (
                 <img src={user.profilePicture} alt="User" className="w-10 h-10 rounded-full object-cover border border-slate-600" />
               ) : (
                 <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0)}
                 </div>
               )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <div className="flex flex-col">
                 <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                 <p className="text-[10px] text-slate-500 font-mono truncate">{user.id}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {!isMaster && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={20} />
                  {t.dashboard}
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'reports' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <PieChart size={20} />
                  {t.reports}
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'chat' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <MessageCircle size={20} />
                  {t.chat}
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <UserCircle size={20} />
                  {t.profile}
                </button>
              </>
            )}

            {isMaster && (
              <>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'admin' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <UsersIcon size={20} />
                  {t.adminDashboard}
                </button>
                 <button
                  onClick={() => setActiveTab('chat')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'chat' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <MessageCircle size={20} />
                  {t.chat}
                </button>
              </>
            )}
            
            {/* Common Help Tab for everyone */}
            <button
                onClick={() => setActiveTab('help')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'help' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
                <HelpCircle size={20} />
                {t.help}
            </button>
          </nav>

          <div className="p-4 border-t border-slate-800 space-y-3">
             <div className="bg-slate-800 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Globe size={14} /> Lang
                    </div>
                    <select 
                        value={lang}
                        onChange={(e) => {
                             const newLang = e.target.value as SupportedLanguage;
                             setLang(newLang);
                             // Also update user profile lang for persistence
                             if(user) {
                                 handleEditUser({...user, language: newLang});
                             }
                        }}
                        className="bg-slate-700 text-white text-xs rounded px-1 py-0.5 border-none focus:ring-0 cursor-pointer"
                    >
                        {SUPPORTED_LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.flag}</option>
                        ))}
                    </select>
                </div>
                {!isMaster && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Wallet size={14} /> Currency
                        </div>
                        <select 
                            className="bg-slate-700 text-white text-xs rounded px-1 py-0.5 border-none focus:ring-0 max-w-[80px]"
                            onChange={(e) => setUser({...user, currency: e.target.value})}
                            value={user.currency}
                        >
                            {CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>{c.code}</option>
                            ))}
                        </select>
                    </div>
                )}
             </div>

            <button
              onClick={() => {
                setPhase('login');
                setUser(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-sm"
            >
              <LogOut size={18} />
              {t.logout}
            </button>
          </div>
        </aside>

        {/* Mobile Top Header (Minimal) */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-30">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex-shrink-0">
                   {user.profilePicture ? (
                     <img src={user.profilePicture} alt="User" className="w-8 h-8 rounded-full object-cover" />
                   ) : (
                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {user.name.charAt(0)}
                     </div>
                   )}
                </div>
                <div>
                   <h1 className="text-sm font-bold text-gray-800 leading-tight">{user.name}</h1>
                   <p className="text-[10px] text-gray-500 leading-none font-mono">{user.id}</p>
                </div>
             </div>
             <div className="flex gap-3 items-center">
                 <select 
                        value={lang}
                        onChange={(e) => {
                             const newLang = e.target.value as SupportedLanguage;
                             setLang(newLang);
                             if(user) {
                                 handleEditUser({...user, language: newLang});
                             }
                        }}
                        className="bg-gray-100 text-gray-800 text-sm rounded px-2 py-1 border-none focus:ring-0"
                    >
                        {SUPPORTED_LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.flag}</option>
                        ))}
                </select>
                <button onClick={() => { setPhase('login'); setUser(null); }} className="text-gray-400 hover:text-red-500">
                    <LogOut size={20} />
                </button>
             </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full mb-16 md:mb-0">

           {/* Current Time Display - Simplified on Mobile */}
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-2">
             <div>
               <h1 className="text-xl md:text-3xl font-bold text-gray-800">
                  {isMaster && activeTab === 'admin' ? t.adminDashboard : 
                   activeTab === 'dashboard' ? t.dashboard : 
                   activeTab === 'chat' ? t.chat :
                   activeTab === 'profile' ? t.profile : 
                   activeTab === 'help' ? t.help : t.reports}
               </h1>
               <p className="text-sm md:text-base text-gray-500">
                  {new Date().toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
               </p>
             </div>
             <div className="hidden md:block text-right">
                <p className="text-3xl font-light text-blue-600">
                    {new Date().toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
                </p>
             </div>
          </div>

          {/* Render content based on Tab and Role */}
          {isMaster ? (
            <>
                {activeTab === 'admin' && (
                    <AdminDashboard 
                    users={users} 
                    onAddUser={handleAddUser} 
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                    lang={lang} 
                    records={records}
                    onRestoreData={handleRestoreData}
                    />
                )}
                 {activeTab === 'chat' && (
                    <Chat 
                      currentUser={user}
                      users={users}
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      lang={lang}
                    />
                )}
                 {activeTab === 'help' && (
                    <Help lang={lang} />
                )}
            </>
          ) : (
            <>
                {activeTab === 'dashboard' && (
                    <Dashboard 
                    user={user} 
                    records={records} 
                    onUpdateRecord={handleUpdateRecord}
                    lang={lang}
                    />
                )}
                {activeTab === 'reports' && (
                    <Reports 
                    user={user} 
                    records={records} 
                    lang={lang}
                    />
                )}
                {activeTab === 'chat' && (
                    <Chat 
                      currentUser={user}
                      users={users}
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      lang={lang}
                    />
                )}
                {activeTab === 'profile' && (
                    <Profile 
                    user={user} 
                    onUpdateUser={handleUpdateUserProfile} 
                    lang={lang}
                    records={records}
                    onRestoreData={handleRestoreData}
                    />
                )}
                {activeTab === 'help' && (
                    <Help lang={lang} />
                )}
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40 pb-safe">
            <div className="flex justify-around items-center p-2">
                {!isMaster && (
                    <>
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                        <LayoutDashboard size={24} />
                        <span className="text-[10px] font-medium">{t.dashboard}</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('reports')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'reports' ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                        <PieChart size={24} />
                        <span className="text-[10px] font-medium">{t.reports}</span>
                    </button>
                    {/* Replaced Chat with Help on Mobile for space, or just squeeze it in. Let's swap chat for Help or just add it. 5 items is okay. */}
                     <button 
                        onClick={() => setActiveTab('chat')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'chat' ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                        <MessageCircle size={24} />
                        <span className="text-[10px] font-medium">Chat</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                        <UserCircle size={24} />
                        <span className="text-[10px] font-medium">{t.profile}</span>
                    </button>
                     <button 
                        onClick={() => setActiveTab('help')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'help' ? 'text-cyan-600' : 'text-gray-400'}`}
                    >
                        <HelpCircle size={24} />
                        <span className="text-[10px] font-medium">{t.help}</span>
                    </button>
                    </>
                )}
                 {isMaster && (
                    <>
                        <button 
                            onClick={() => setActiveTab('admin')}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'admin' ? 'text-emerald-600' : 'text-gray-400'}`}
                        >
                            <UsersIcon size={24} />
                            <span className="text-[10px] font-medium">Admin</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('chat')}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'chat' ? 'text-emerald-600' : 'text-gray-400'}`}
                        >
                            <MessageCircle size={24} />
                            <span className="text-[10px] font-medium">Chat</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('help')}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'help' ? 'text-cyan-600' : 'text-gray-400'}`}
                        >
                            <HelpCircle size={24} />
                            <span className="text-[10px] font-medium">{t.help}</span>
                        </button>
                    </>
                 )}
            </div>
        </nav>
      </div>
    );
  }

  return null;
};

export default App;