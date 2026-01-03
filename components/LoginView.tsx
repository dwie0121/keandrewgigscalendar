
import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (name: string, passcode?: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim(), passcode.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl animate-scaleIn">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-indigo-500/50 mx-auto mb-6 rotate-3">
            K
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Kean Drew</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Studio Access Gateway</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Identity (First Name)</label>
              <input 
                required
                autoFocus
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-lg text-slate-800"
                placeholder="e.g. Kean"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Admin Passcode (Optional)</label>
              <input 
                type="password" 
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold text-lg text-slate-800 tracking-widest"
                placeholder="••••••••"
              />
              <p className="mt-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1">Required only for Admin functions</p>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3"
          >
            Enter Studio {passcode && <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Verifying Key</span>}
          </button>
        </form>

        <p className="text-center mt-10 text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
          Authorized personnel only.<br/>All access attempts are recorded.
        </p>
      </div>
    </div>
  );
};

export default LoginView;
