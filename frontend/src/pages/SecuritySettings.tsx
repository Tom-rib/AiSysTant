import React, { useState } from 'react';
import axios from 'axios';

type SetupStep = null | 'qrcode' | 'verify' | 'backup-codes';

interface TwoFAData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export const SecuritySettings: React.FC = () => {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [setupStep, setSetupStep] = useState<SetupStep>(null);
  const [twoFAData, setTwoFAData] = useState<TwoFAData>({
    secret: '',
    qrCode: '',
    backupCodes: [],
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSetup2FA = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/account/2fa/setup');
      setTwoFAData({
        secret: response.data.secret,
        qrCode: response.data.qrCode,
        backupCodes: response.data.backupCodes,
      });
      setSetupStep('qrcode');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/account/2fa/verify', {
        code: verificationCode,
        secret: twoFAData.secret,
        backupCodes: twoFAData.backupCodes,
      });
      setSetupStep('backup-codes');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish2FA = () => {
    setTwoFAEnabled(true);
    setSetupStep(null);
    setSuccess('✅ 2FA activée avec succès!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/account/2fa/disable', {
        password: disablePassword,
      });
      setTwoFAEnabled(false);
      setDisablePassword('');
      setSuccess('✅ 2FA désactivée');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Sécurité</h1>

        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950 mb-6">Double Authentification (2FA)</h2>

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
          )}

          {twoFAEnabled ? (
            <div>
              <p className="text-slate-950 mb-6 font-semibold">
                ✅ <strong>Activée</strong> - Votre compte est protégé
              </p>

              <button
                onClick={() => setDisablePassword('')}
                className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:brightness-110 transition"
              >
                🚪 Désactiver 2FA
              </button>

              {disablePassword !== '' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 mb-3">Confirmez avec votre mot de passe:</p>
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="w-full px-3 py-2 bg-white border border-red-200 rounded text-slate-900 mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDisable2FA}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:brightness-110 disabled:opacity-50"
                    >
                      {loading ? 'Désactivation...' : 'Désactiver'}
                    </button>
                    <button
                      onClick={() => setDisablePassword('')}
                      className="flex-1 px-3 py-2 bg-gray-300 text-slate-900 rounded hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-slate-950 mb-6">
                ❌ <strong>Désactivée</strong> - Renforcez la sécurité de votre compte
              </p>

              <button
                onClick={handleSetup2FA}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:brightness-110 transition disabled:opacity-50"
              >
                {loading ? '⏳ Configuration...' : '🔒 Configurer 2FA'}
              </button>
            </div>
          )}

          {setupStep && (
            <div className="mt-6 p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
              {setupStep === 'qrcode' && (
                <div>
                  <h3 className="font-bold text-slate-950 mb-3">Étape 1: Scanner le QR code</h3>
                  <p className="text-sm text-slate-700 mb-4">
                    Utilisez Google Authenticator, Microsoft Authenticator, ou Authy
                  </p>
                  <div className="bg-white p-4 mb-4 text-center">
                    <img src={twoFAData.qrCode} alt="QR Code" className="mx-auto" />
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-slate-700 mb-2">Code manuel:</p>
                    <code className="block bg-white p-2 text-center font-mono text-slate-950 border border-gray-200 rounded select-all">
                      {twoFAData.secret}
                    </code>
                  </div>

                  <button
                    onClick={() => setSetupStep('verify')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:brightness-110"
                  >
                    Suivant
                  </button>
                </div>
              )}

              {setupStep === 'verify' && (
                <div>
                  <h3 className="font-bold text-slate-950 mb-3">Étape 2: Entrer le code 6 chiffres</h3>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 text-2xl text-center tracking-widest bg-white border-2 border-gray-300 rounded-lg text-slate-900 mb-4 font-mono"
                  />
                  <button
                    onClick={handleVerify2FA}
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:brightness-110 disabled:opacity-50"
                  >
                    {loading ? 'Vérification...' : 'Vérifier'}
                  </button>
                </div>
              )}

              {setupStep === 'backup-codes' && (
                <div>
                  <h3 className="font-bold text-slate-950 mb-3">Codes de secours</h3>
                  <p className="text-sm text-slate-700 mb-4">
                    ⚠️ Conservez ces codes en lieu sûr! Vous en aurez besoin si vous perdez votre téléphone.
                  </p>

                  <div className="bg-white p-4 rounded mb-4 border border-gray-200 max-h-48 overflow-y-auto">
                    {twoFAData.backupCodes.map((code, index) => (
                      <div key={index} className="font-mono text-sm text-slate-950 py-1 border-b last:border-b-0">
                        {code}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(twoFAData.backupCodes.join('\n'));
                        setSuccess('✅ Codes copiés!');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:brightness-110"
                    >
                      📋 Copier
                    </button>
                  </div>

                  <button
                    onClick={handleFinish2FA}
                    className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:brightness-110"
                  >
                    ✅ Terminer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
