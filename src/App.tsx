/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import UserScreen from './components/UserScreen';
import AdminScreen from './components/AdminScreen';

export default function App() {
  const [view, setView] = useState<'user' | 'admin'>('user');

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Mobile Device Frame */}
      <div className="w-full max-w-[414px] h-[896px] max-h-[96vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative border-[10px] border-neutral-900 flex flex-col ring-1 ring-black/5">
        {view === 'user' ? <UserScreen /> : <AdminScreen />}
      </div>

      {/* Out-of-frame View Controllers for Web Preview Environment */}
      <div className="fixed top-6 right-6 flex flex-col gap-3 z-50">
        <button 
          onClick={() => setView('user')} 
          className={`px-5 py-3 rounded-xl font-semibold shadow-lg transition-all border ${view === 'user' ? 'bg-[#243b73] text-white border-[#243b73] scale-105' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}
        >
          🎓 User List View
        </button>
        <button 
          onClick={() => setView('admin')} 
          className={`px-5 py-3 rounded-xl font-semibold shadow-lg transition-all border ${view === 'admin' ? 'bg-[#1554A1] text-white border-[#1554A1] scale-105' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}
        >
          ⚙️ Admin Dashboard
        </button>
      </div>

    </div>
  );
}

