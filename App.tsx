import React, { useState, useEffect } from 'react';
import { Staff, StudioEvent, ViewMode, ActivityLog } from './types';
import { Icons } from './constants';
import DashboardView from './components/DashboardView';
import CalendarView from './components/CalendarView';
import StaffView from './components/StaffView';
import ActivityLogsView from './components/ActivityLogsView';
import LoginView from './components/LoginView';

const STORAGE_KEY_EVENTS = 'kean_drew_events_v1';
const STORAGE_KEY_STAFF = 'kean_drew_staff_v1';
const STORAGE_KEY_LOGS = 'kean_drew_logs_v1';
const STORAGE_KEY_USER = 'kean_drew_current_user_v1';
const ADMIN_PASSCODE = 'KEANDREW';

const DEFAULT_STAFF: Staff[] = [
  { id: 'st-1', name: 'NERICA', contact: 'Team Member', baseDesignation: 'Production Assistant', isAdmin: false },
  { id: 'st-2', name: 'JEFF', contact: 'Team Member', baseDesignation: 'Photographer', isAdmin: false },
  { id: 'st-3', name: 'CERCAN', contact: 'Team Member', baseDesignation: 'Videographer', isAdmin: false },
  { id: 'st-4', name: 'JEV', contact: 'Team Member', baseDesignation: 'Editor', isAdmin: false },
  { id: 'st-5', name: 'KEAN', contact: 'Team Member', baseDesignation: 'Creative Lead', isAdmin: false },
  { id: 'st-6', name: 'KC', contact: 'Team Member', baseDesignation: 'Production Assistant', isAdmin: false },
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  
  // Initial state loading from localStorage
  const [events, setEvents] = useState<StudioEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STAFF);
    // If no staff exists, populate with default members requested by user
    return saved ? JSON.parse(saved) : DEFAULT_STAFF;
  });
  
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentUser, setCurrentUser] = useState<Staff | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    return saved ? JSON.parse(saved) : null;
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [currentUser]);

  const logActivity = (action: string, details: string) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  const addEvent = (event: StudioEvent) => {
    setEvents(prev => [...prev, event]);
    logActivity('Added Booking', `Created: ${event.title}`);
  };

  const updateEvent = (updated: StudioEvent) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    logActivity('Updated Booking', `Modified: ${updated.title}`);
  };

  const deleteEvent = (id: string) => {
    const e = events.find(ev => ev.id === id);
    setEvents(prev => prev.filter(ev => ev.id !== id));
    logActivity('Deleted Booking', `Removed: ${e?.title || id}`);
  };

  const addStaff = (s: Staff) => {
    setStaff(prev => [...prev, s]);
    logActivity('Added Team Member', `Joined: ${s.name}`);
  };

  const updateStaff = (updated: Staff) => {
    setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
    logActivity('Updated Team Member', `Modified: ${updated.name}`);
  };

  const deleteStaff = (id: string) => {
    if (!window.confirm("Are you sure you want to remove this staff member?")) return;
    const s = staff.find(member => member.id === id);
    setStaff(prev => prev.filter(member => member.id !== id));
    logActivity('Deleted Team Member', `Removed: ${s?.name || id}`);
  };

  const handleLogin = (name: string, passcode?: string) => {
    const isPasscodeCorrect = passcode === ADMIN_PASSCODE;

    // Check if user exists in the staff list
    const found = staff.find(s => s.name.toLowerCase().trim() === name.toLowerCase().trim());
    
    if (found) {
      // Create user session, elevate to Admin if passcode is correct
      const userToLogin = { ...found, isAdmin: found.isAdmin || isPasscodeCorrect };
      setCurrentUser(userToLogin);
      logActivity('Login', `User ${found.name} signed in ${isPasscodeCorrect ? '(Admin Mode)' : '(Staff Mode)'}`);
    } else if (staff.length === 0 || isPasscodeCorrect) {
      // Allow first admin setup or on-the-fly admin creation if passcode is correct
      const newStaff: Staff = {
        id: 'user-' + Date.now(),
        name,
        contact: 'Manual Entry',
        baseDesignation: isPasscodeCorrect ? 'Studio Owner' : 'Team Member',
        isAdmin: isPasscodeCorrect
      };
      addStaff(newStaff);
      setCurrentUser(newStaff);
    } else {
      alert("Name not recognized. Please check with the Studio Owner.");
    }
  };

  const handleLogout = () => {
    logActivity('Logout', `${currentUser?.name} signed out`);
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  const NavItem = ({ icon: Icon, label, id, adminOnly }: { icon: any, label: string, id: ViewMode, adminOnly?: boolean }) => {
    if (adminOnly && !currentUser?.isAdmin) return null;
    return (
      <button 
        onClick={() => setActiveView(id)}
        className={`flex flex-col items-center justify-center py-2 px-6 transition-all duration-300 relative group ${
          activeView === id ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-400'
        }`}
      >
        <Icon size={20} className={`mb-1 transition-transform duration-300 ${activeView === id ? 'scale-110' : 'group-hover:scale-105'}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        {activeView === id && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-t-full" />
        )}
      </button>
    );
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-100 selection:text-indigo-700">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-200 rotate-3">
              K
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-xl text-slate-900 tracking-tight leading-none uppercase">Kean Drew</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold tracking-widest uppercase ${currentUser.isAdmin ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {currentUser.isAdmin ? 'Owner Verified' : 'Staff Access'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-400 font-medium lowercase">
                  Active User: {currentUser.name}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex items-center bg-slate-50/50 rounded-2xl p-1 border border-slate-100">
            <NavItem id="dashboard" icon={Icons.Dashboard} label="Pulse" />
            <NavItem id="calendar" icon={Icons.Calendar} label="Book" />
            <NavItem id="staff" icon={Icons.Staff} label="Team" />
            <NavItem id="logs" icon={Icons.Work} label="Logs" adminOnly />
            
            <button 
              onClick={handleLogout}
              className="flex flex-col items-center justify-center py-2 px-6 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Icons.Prev size={20} className="mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Exit</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="animate-fadeIn">
          {activeView === 'dashboard' && <DashboardView events={events} staff={staff} />}
          {activeView === 'calendar' && (
            <CalendarView 
              events={events} 
              staff={staff} 
              isAdmin={currentUser.isAdmin}
              onAddEvent={addEvent} 
              onUpdateEvent={updateEvent} 
              onDeleteEvent={deleteEvent} 
            />
          )}
          {activeView === 'staff' && (
            <StaffView 
              staff={staff} 
              events={events}
              isAdmin={currentUser.isAdmin}
              onAddStaff={addStaff} 
              onUpdateStaff={updateStaff} 
              onDeleteStaff={deleteStaff} 
              onUpdateEvent={updateEvent}
            />
          )}
          {activeView === 'logs' && currentUser.isAdmin && (
            <ActivityLogsView logs={logs} />
          )}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full px-6 py-8 text-center text-slate-400">
        <p className="text-xs font-medium tracking-wide">© {new Date().getFullYear()} Kean Drew Studio Manager • All Data Saved Locally</p>
      </footer>
    </div>
  );
};

export default App;