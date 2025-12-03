import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const user = {
    email: localStorage.getItem('userEmail') || 'user@example.com',
    username: localStorage.getItem('username') || 'User',
    tier: localStorage.getItem('userTier') || 'Starter',
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/account/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold hover:ring-2 hover:ring-cyan-400 transition"
        title="Account menu"
      >
        {user.username.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white text-slate-950 rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold">{user.username}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
              {user.tier}
            </span>
          </div>

          <div className="py-2">
            <Link
              to="/account/settings"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              🔑 Configuration - Clé API
            </Link>

            <Link
              to="/account/security"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              🔒 Sécurité
            </Link>

            <Link
              to="/pricing"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              💳 Facturation
            </Link>

            <div className="border-t border-gray-200 my-2"></div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
            >
              🚪 Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
