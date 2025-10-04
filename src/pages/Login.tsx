import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";
import { setToken } from "../lib/auth";
import { Shield, AlertTriangle, Key, Smartphone, User, Settings, XCircle } from "lucide-react";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEncryptionLogin, setShowEncryptionLogin] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [showAdminSelection, setShowAdminSelection] = useState(false);
  const [showMobywatelLogin, setShowMobywatelLogin] = useState(false);
  const navigate = useNavigate();


  const handleEncryptionLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!encryptionKey) {
      setError("Wprowadź klucz szyfrowania");
      return;
    }

    setLoading(true);

    try {
      // Demo encryption key validation
      const validKeys = ['WCR2024', 'MILITARY', 'SECURE123', 'ENCRYPT'];
      if (validKeys.includes(encryptionKey)) {
        // Simulate successful login with encryption key
        const mockToken = 'encrypted_token_' + Date.now();
        
        setToken(mockToken);
        localStorage.setItem('encryption_login', 'true');
        
        navigate("/admin");
      } else {
        setError("Nieprawidłowy klucz szyfrowania");
      }
    } catch (err) {
      setError("Błąd weryfikacji klucza szyfrowania");
    } finally {
      setLoading(false);
    }
  };

  const handleMobywatelLogin = async () => {
    setLoading(true);
    
    try {
      // Simulate mObywatel login - just use demo credentials
      const { token } = await login('jan.kowalski', 'start123');
      setToken(token);
      navigate("/dashboard");
    } catch (err) {
      setError("Błąd logowania przez mObywatel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#0f1419' }}>
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-[36rem] h-[36rem] -mb-16 relative">
            <img 
              src="/src/assets/mRezerwa-logo1.png" 
              alt="WCR Logo" 
              className="w-full h-full object-contain"
              style={{ 
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
                backgroundColor: 'transparent'
              }}
            />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>
            System Rezerw
          </h1>
          <p className="text-sm" style={{ color: '#44576f', fontFamily: 'Cooper Hewitt, sans-serif' }}>
            System Komunikacji Wojskowej
          </p>
        </div>
        
        {/* Login Form */}
        <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#1a2332', borderColor: '#5a6b7d' }}>
          {/* Login Options */}
          <div className="space-y-4 mb-8">
            {/* mObywatel Login */}
            <button
              onClick={() => setShowMobywatelLogin(true)}
              className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 border-2"
              style={{ 
                backgroundColor: '#5a6b7d', 
                borderColor: '#5a6b7d',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6b7c8f';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#5a6b7d';
              }}
            >
              <Smartphone className="w-6 h-6" />
              <span style={{ fontFamily: 'Cooper Hewitt, sans-serif' }}>Logowanie przez mObywatel</span>
            </button>

            {/* Admin Encryption Login */}
            <button
              onClick={() => setShowAdminSelection(true)}
              className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 border-2"
              style={{ 
                backgroundColor: 'transparent', 
                borderColor: '#5a6b7d',
                color: '#6b7c8f'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3c4a5a';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b7c8f';
              }}
            >
              <Key className="w-6 h-6" />
              <span style={{ fontFamily: 'Cooper Hewitt, sans-serif' }}>Logowanie administracyjne</span>
            </button>
          </div>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#2a3441' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'white', fontFamily: 'Cooper Hewitt, sans-serif' }}>
              Informacje o systemie
            </h3>
            <div className="space-y-2 text-xs" style={{ color: '#44576f', fontFamily: 'Cooper Hewitt, sans-serif' }}>
              <p>• Logowanie przez mObywatel dla żołnierzy rezerwy</p>
              <p>• Logowanie administracyjne dla personelu dowódczego</p>
              <p>• System szyfrowany zgodnie z normami wojskowymi</p>
            </div>
          </div>

          {/* Demo Encryption Keys */}
          <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#2a3441' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'white', fontFamily: 'Cooper Hewitt, sans-serif' }}>
              Demo Klucze Szyfrowania:
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: '#44576f', fontFamily: 'Cooper Hewitt, sans-serif' }}>
              <div className="p-2 rounded" style={{ backgroundColor: '#0f1419' }}>
                <span className="font-mono">WCR2024</span>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: '#0f1419' }}>
                <span className="font-mono">MILITARY</span>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: '#0f1419' }}>
                <span className="font-mono">SECURE123</span>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: '#0f1419' }}>
                <span className="font-mono">ENCRYPT</span>
              </div>
            </div>
          </div>
        </div>

        {/* mObywatel Login Modal */}
        {showMobywatelLogin && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl shadow-2xl max-w-md w-full" style={{ backgroundColor: '#222b36' }}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>
                    Logowanie przez mObywatel
                  </h2>
                  <button
                    onClick={() => setShowMobywatelLogin(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#44576f' }}>
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'white', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                      Autoryzacja mObywatel
                    </h3>
                    <p className="text-sm" style={{ color: '#44576f', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                      Kliknij poniżej, aby zalogować się przez aplikację mObywatel
                    </p>
                  </div>

                  <button
                    onClick={handleMobywatelLogin}
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3"
                    style={{ 
                      backgroundColor: '#44576f', 
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#5a6b7d';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#44576f';
                    }}
                  >
                    {loading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Smartphone className="w-5 h-5" />
                    )}
                    <span style={{ fontFamily: 'Cooper Hewitt, sans-serif' }}>
                      {loading ? 'Logowanie...' : 'Zaloguj przez mObywatel'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Selection Modal */}
        {showAdminSelection && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl shadow-2xl max-w-md w-full" style={{ backgroundColor: '#222b36' }}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>
                    Logowanie administracyjne
                  </h2>
                  <button
                    onClick={() => setShowAdminSelection(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#44576f' }}>
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'white', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                      Wybierz metodę logowania
                    </h3>
                    <p className="text-sm" style={{ color: '#44576f', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                      Dostępne opcje dla personelu administracyjnego
                    </p>
            </div>
            
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowAdminSelection(false);
                        setShowEncryptionLogin(true);
                      }}
                      className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 border-2"
                      style={{ 
                        backgroundColor: 'transparent', 
                        borderColor: '#44576f',
                        color: '#44576f'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#44576f';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#44576f';
                      }}
                    >
                      <Key className="w-5 h-5" />
                      <span style={{ fontFamily: 'Cooper Hewitt, sans-serif' }}>Klucz szyfrowania (Pendrive)</span>
                    </button>

                    <button
                      onClick={async () => {
                        setShowAdminSelection(false);
                        setLoading(true);
                        try {
                          const { token } = await login('admin', 'start123');
                          setToken(token);
                          navigate("/admin");
                        } catch (err) {
                          setError("Błąd logowania administratora");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3"
                      style={{ 
                        backgroundColor: '#44576f', 
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#5a6b7d';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#44576f';
                      }}
                    >
                      <User className="w-5 h-5" />
                      <span style={{ fontFamily: 'Cooper Hewitt, sans-serif' }}>Logowanie standardowe</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Encryption Login Modal */}
        {showEncryptionLogin && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl shadow-2xl max-w-lg w-full" style={{ backgroundColor: '#222b36' }}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>
                    Logowanie kryptologiczne
                  </h2>
                  <button
                    onClick={() => {
                      setShowEncryptionLogin(false);
                      setEncryptionKey('');
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                <form onSubmit={handleEncryptionLogin} className="space-y-6">
                  {/* Military-Style Instructions */}
                  <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#3c2d3e' }}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dc2626' }}>
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Titillium Web, sans-serif' }}>
                          PROCEDURA LOGOWANIA KRYPTOLOGICZNEGO
                        </h3>
                        <p className="text-sm" style={{ color: '#44576f', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                          Poziom bezpieczeństwa: Maksymalny
                        </p>
                      </div>
                  </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#121c26' }}>
                        <h4 className="font-semibold mb-2" style={{ color: '#fbbf24', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                          KROK 1: Podłącz urządzenie
                        </h4>
                        <p className="text-sm" style={{ color: '#44576f', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                          Włóż pendrive z kluczem szyfrowania do portu USB
                        </p>
                      </div>
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#121c26' }}>
                        <h4 className="font-semibold mb-2" style={{ color: '#fbbf24', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                          KROK 2: Wprowadź klucz
                        </h4>
                        <p className="text-sm" style={{ color: '#44576f', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                          Wpisz klucz szyfrowania z urządzenia
                        </p>
                      </div>
                  </div>

                    <div className="rounded-lg p-3" style={{ backgroundColor: '#7f1d1d', borderColor: '#dc2626' }}>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5" style={{ color: '#fca5a5' }} />
                        <span className="font-semibold" style={{ color: '#fca5a5', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                          UWAGA BEZPIECZEŃSTWA
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: '#fecaca', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                        Ten tryb logowania jest przeznaczony wyłącznie dla personelu z uprawnieniami kryptograficznymi. 
                        Nieprawidłowe użycie może skutkować zablokowaniem dostępu.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="rounded-xl p-4" style={{ backgroundColor: '#121c26', borderColor: '#44576f' }}>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#16a34a' }}>
                          <Key className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white" style={{ fontFamily: 'Cooper Hewitt, sans-serif' }}>
                            KLUCZ SZYFROWANIA
                          </h4>
                          <p className="text-xs" style={{ color: '#44576f', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                            Wprowadź klucz z urządzenia kryptograficznego
                          </p>
                        </div>
                      </div>
                      
                      <input
                        id="encryptionKey"
                        name="encryptionKey"
                        type="password"
                        required
                        value={encryptionKey}
                        onChange={(e) => setEncryptionKey(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-mono"
                        style={{ backgroundColor: '#3c2d3e', borderColor: '#44576f' }}
                        placeholder="Wprowadź klucz szyfrowania..."
                      />
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex space-x-1">
                          {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${
                              encryptionKey.length > i ? 'bg-green-500' : 'bg-gray-600'
                            }`}></div>
                          ))}
                        </div>
                        <span className="text-xs" style={{ color: '#44576f', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                          {encryptionKey.length > 0 ? `${encryptionKey.length}/8 znaków` : 'Oczekiwanie na klucz...'}
                        </span>
                      </div>
                    </div>
              </div>

            <button
              type="submit"
              disabled={loading}
                    className="w-full py-4 px-6 rounded-xl font-bold transition-all duration-200 border-2 shadow-lg"
                    style={{ 
                      backgroundColor: '#dc2626', 
                      borderColor: '#dc2626',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                        WERYFIKACJA KRYPTOLOGICZNA...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Shield className="w-5 h-5 mr-2" />
                        AUTORYZACJA KRYPTOLOGICZNA
                </span>
                    )}
            </button>
          </form>
        </div>
                  </div>
                </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#7f1d1d', borderColor: '#dc2626' }}>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" style={{ color: '#fca5a5' }} />
              <span className="font-semibold" style={{ color: '#fca5a5', fontFamily: 'Cooper Hewitt, sans-serif' }}>
                Błąd logowania
              </span>
                  </div>
            <p className="text-sm mt-1" style={{ color: '#fecaca', fontFamily: 'Cooper Hewitt, sans-serif' }}>
              {error}
            </p>
                  </div>
        )}
      </div>
    </div>
  );
}