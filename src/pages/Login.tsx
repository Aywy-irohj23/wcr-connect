import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";
import { setToken } from "../lib/auth";
import { Shield, Eye, EyeOff, Lock, AlertTriangle, Clock, CheckCircle } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  const [sessionWarning, setSessionWarning] = useState(false);
  const navigate = useNavigate();

  // Security level calculation
  useEffect(() => {
    const calculateSecurityLevel = () => {
      if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
        setSecurityLevel('high');
      } else if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
        setSecurityLevel('medium');
      } else {
        setSecurityLevel('low');
      }
    };
    calculateSecurityLevel();
  }, [password]);

  // Check lockout status
  useEffect(() => {
    if (lockoutTime) {
      const now = new Date();
      const timeDiff = now.getTime() - lockoutTime.getTime();
      if (timeDiff >= 15 * 60 * 1000) { // 15 minutes
        setIsLocked(false);
        setLockoutTime(null);
        setLoginAttempts(0);
      }
    }
  }, [lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Security checks
    if (isLocked) {
      setError("Konto zablokowane z powodu zbyt wielu nieudanych prób logowania. Spróbuj ponownie za 15 minut.");
      return;
    }

    if (loginAttempts >= 3) {
      setIsLocked(true);
      setLockoutTime(new Date());
      setError("Zbyt wiele nieudanych prób logowania. Konto zostało zablokowane na 15 minut.");
      return;
    }

    setLoading(true);

    try {
      const { token, user } = await login(username, password);
      setToken(token);
      
      // Reset security counters on successful login
      setLoginAttempts(0);
      setIsLocked(false);
      setLockoutTime(null);
      
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setLoginAttempts(prev => prev + 1);
      setError(err instanceof Error ? err.message : "Błąd logowania");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">WCR</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">WCR Connect</h1>
          <p className="mt-2 text-gray-600">System Komunikacji Wojskowej</p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder=" "
              />
              <label 
                htmlFor="username" 
                className="absolute left-4 -top-2 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-600"
              >
                Nazwa użytkownika
              </label>
            </div>
            
                  {/* Password Field */}
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="peer w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder=" "
                    />
                    <label 
                      htmlFor="password" 
                      className="absolute left-4 -top-2 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-600"
                    >
                      Hasło
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Security Level Indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Poziom bezpieczeństwa hasła:</span>
                        <span className={`text-sm font-medium ${
                          securityLevel === 'high' ? 'text-green-600' :
                          securityLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {securityLevel === 'high' ? 'Wysoki' :
                           securityLevel === 'medium' ? 'Średni' : 'Niski'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            securityLevel === 'high' ? 'bg-green-500 w-full' :
                            securityLevel === 'medium' ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-1/3'
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}

            {/* Security Warnings */}
            {loginAttempts > 0 && loginAttempts < 3 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Ostrzeżenie: {3 - loginAttempts} prób pozostało przed zablokowaniem konta</span>
              </div>
            )}

            {isLocked && lockoutTime && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Konto zablokowane. Spróbuj ponownie za {Math.ceil((15 * 60 * 1000 - (new Date().getTime() - lockoutTime.getTime())) / 60000)} minut</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logowanie...
                </span>
              ) : "Zaloguj się"}
            </button>
          </form>
        </div>

              {/* Security Notice */}
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-800">Informacje bezpieczeństwa</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Połączenie szyfrowane (HTTPS)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Sesja wygasa po 30 minutach nieaktywności</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-red-600" />
                    <span>Konto blokowane po 3 nieudanych próbach</span>
                  </div>
                </div>
              </div>

              {/* Demo Credentials */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-blue-800 mb-3">Dane testowe:</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Administrator:</span>
                    <span className="font-mono">admin / start123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Rezerwista (PR):</span>
                    <span className="font-mono">jan.kowalski / start123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Rezerwista (AR):</span>
                    <span className="font-mono">anna.nowak / start123</span>
                  </div>
                </div>
              </div>
      </div>
    </div>
  );
}
