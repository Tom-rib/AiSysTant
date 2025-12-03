import React, { useState } from 'react';
import axios from 'axios';

interface FormState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export const AccountSettings: React.FC = () => {
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    confirmEmail: '',
  });
  const [emailState, setEmailState] = useState<FormState>({
    loading: false,
    error: null,
    success: null,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordState, setPasswordState] = useState<FormState>({
    loading: false,
    error: null,
    success: null,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculateStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 12) strength += 25;
    if (password.length >= 16) strength += 25;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailState({ loading: true, error: null, success: null });

    try {
      if (emailForm.newEmail !== emailForm.confirmEmail) {
        throw new Error('Les emails ne correspondent pas');
      }

      await axios.put('/api/account/email', {
        newEmail: emailForm.newEmail,
        confirmEmail: emailForm.confirmEmail,
      });

      setEmailState({
        loading: false,
        error: null,
        success: '✅ Email changé avec succès!',
      });
      setEmailForm({ newEmail: '', confirmEmail: '' });
    } catch (error: any) {
      setEmailState({
        loading: false,
        error: error.response?.data?.error || 'Erreur',
        success: null,
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordState({ loading: true, error: null, success: null });

    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      await axios.put('/api/account/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordState({
        loading: false,
        error: null,
        success: '✅ Mot de passe changé avec succès!',
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setPasswordState({
        loading: false,
        error: error.response?.data?.error || 'Erreur',
        success: null,
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Paramètres du Compte</h1>

        {/* EMAIL CHANGE SECTION */}
        <div className="bg-white rounded-lg p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950 mb-6">Changer d'email</h2>

          {emailState.success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{emailState.success}</div>
          )}
          {emailState.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{emailState.error}</div>
          )}

          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-950 mb-2">
                Nouvel email *
              </label>
              <input
                type="email"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                placeholder="nouveau@example.com"
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-950 mb-2">
                Confirmer email *
              </label>
              <input
                type="email"
                value={emailForm.confirmEmail}
                onChange={(e) => setEmailForm({ ...emailForm, confirmEmail: e.target.value })}
                placeholder="nouveau@example.com"
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={emailState.loading}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:brightness-110 transition disabled:opacity-50"
            >
              {emailState.loading ? '⏳ Mise à jour...' : 'Changer l\'email'}
            </button>
          </form>
        </div>

        {/* PASSWORD CHANGE SECTION */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950 mb-6">Changer le mot de passe</h2>

          {passwordState.success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{passwordState.success}</div>
          )}
          {passwordState.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{passwordState.error}</div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-950 mb-2">
                Mot de passe actuel *
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-950 mb-2">
                Nouveau mot de passe *
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                  setPasswordStrength(calculateStrength(e.target.value));
                }}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
              />
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition ${
                    passwordStrength < 40
                      ? 'bg-red-500'
                      : passwordStrength < 70
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: passwordStrength + '%' }}
                ></div>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Force: {passwordStrength < 40 ? '🔴 Faible' : passwordStrength < 70 ? '🟡 Moyen' : '🟢 Fort'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-950 mb-2">
                Confirmer mot de passe *
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={passwordState.loading}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:brightness-110 transition disabled:opacity-50"
            >
              {passwordState.loading ? '⏳ Mise à jour...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
