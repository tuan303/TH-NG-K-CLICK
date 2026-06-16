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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="flex-1 w-full flex flex-col">
        {view === 'user' ? <UserScreen /> : <AdminScreen />}
      </div>

      {/* View Controllers (Floating toggle) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[100]">
        <button 
          onClick={() => setView('user')} 
          className={`px-4 py-2 rounded-xl font-medium text-sm shadow-lg transition-all border ${view === 'user' ? 'bg-[#243b73] text-white border-[#243b73] scale-105' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}
        >
          🎓 User View
        </button>
        <button 
          onClick={() => setView('admin')} 
          className={`px-4 py-2 rounded-xl font-medium text-sm shadow-lg transition-all border ${view === 'admin' ? 'bg-[#1554A1] text-white border-[#1554A1] scale-105' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}
        >
          ⚙️ Admin View
        </button>
      </div>
    </div>
  );
}

