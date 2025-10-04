import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock, AlertTriangle, Clock, CheckCircle, Phone, User, Key, CreditCard } from "lucide-react";

interface RegistrationStep {
  step: number;
  title: string;
  description: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    pesel: '',
    phone: '',
    smsCode: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [smsTimer, setSmsTimer] = useState(0);
  const [isPeselValid, setIsPeselValid] = useState(false);

  const steps: RegistrationStep[] = [
    {
      step: 1,
      title: "Weryfikacja PESEL",
      description: "Wprowadź swój numer PESEL do weryfikacji w bazie danych wojskowej"
    },
    {
      step: 2,
      title: "Weryfikacja telefonu",
      description: "Podaj numer telefonu i wprowadź kod SMS"
    },
    {
      step: 3,
      title: "Ustawienie hasła",
      description: "Utwórz bezpieczne hasło do swojego konta"
    },
    {
      step: 4,
      title: "Dane osobowe",
      description: "Uzupełnij swoje dane osobowe"
    }
  ];

  // SMS Timer
  useEffect(() => {
    if (smsTimer > 0) {
      const timer = setTimeout(() => setSmsTimer(smsTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [smsTimer]);

  // PESEL validation
  useEffect(() => {
    if (formData.pesel.length === 11) {
      // Simple PESEL validation (demo)
      const isValid = /^\d{11}$/.test(formData.pesel);
      setIsPeselValid(isValid);
      
      if (isValid) {
        // Mock data - in real app this would check military database
        const mockMilitaryData = {
          '12345678901': { firstName: 'Jan', lastName: 'Kowalski', unit: '1. Batalion' },
          '98765432109': { firstName: 'Anna', lastName: 'Nowak', unit: '2. Batalion' },
          '11223344556': { firstName: 'Piotr', lastName: 'Wiśniewski', unit: '1. Batalion' }
        };
        
        const userData = mockMilitaryData[formData.pesel as keyof typeof mockMilitaryData];
        if (userData) {
          setFormData(prev => ({
            ...prev,
            firstName: userData.firstName,
            lastName: userData.lastName
          }));
        }
      }
    } else {
      setIsPeselValid(false);
    }
  }, [formData.pesel]);

  const handlePeselVerification = async () => {
    if (!isPeselValid) {
      setError("Nieprawidłowy numer PESEL lub brak w bazie danych wojskowej");
      return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(2);
      setError("");
    }, 1000);
  };

  const handleSendSms = async () => {
    if (!formData.phone) {
      setError("Wprowadź numer telefonu");
      return;
    }
    
    setLoading(true);
    // Simulate SMS sending
    setTimeout(() => {
      setSmsSent(true);
      setSmsTimer(60);
      setLoading(false);
      setError("");
    }, 1000);
  };

  const handleSmsVerification = async () => {
    if (!formData.smsCode) {
      setError("Wprowadź kod SMS");
      return;
    }
    
    // Demo: accept any 6-digit code
    if (formData.smsCode.length === 6) {
      setCurrentStep(3);
      setError("");
    } else {
      setError("Nieprawidłowy kod SMS");
    }
  };

  const handlePasswordSetup = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }
    
    if (formData.password.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków");
      return;
    }
    
    setCurrentStep(4);
    setError("");
  };

  const handleFinalRegistration = async () => {
    if (!formData.firstName || !formData.lastName) {
      setError("Wszystkie pola są wymagane");
      return;
    }
    
    setLoading(true);
    // Simulate registration
    setTimeout(() => {
      setLoading(false);
      // Redirect to login with success message
      navigate("/login?registered=true");
    }, 2000);
  };

  const getSecurityLevel = (password: string) => {
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
      return 'high';
    } else if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return 'medium';
    } else {
      return 'low';
    }
  };

  const securityLevel = getSecurityLevel(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">WCR</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">WCR Connect</h1>
          <p className="mt-2 text-gray-600">Rejestracja nowego użytkownika</p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= step.step 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.step}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.step ? 'bg-blue-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">{steps[currentStep - 1].title}</h2>
            <p className="text-gray-600 text-sm mt-1">{steps[currentStep - 1].description}</p>
          </div>

          {/* Step 1: PESEL Verification */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="relative">
                <input
                  id="pesel"
                  name="pesel"
                  type="text"
                  required
                  value={formData.pesel}
                  onChange={(e) => setFormData(prev => ({ ...prev, pesel: e.target.value }))}
                  className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder=" "
                  maxLength={11}
                />
                <label 
                  htmlFor="pesel" 
                  className="absolute left-4 -top-2 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-600"
                >
                  Numer PESEL
                </label>
                {formData.pesel.length === 11 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isPeselValid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>

              {formData.pesel.length === 11 && isPeselValid && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">PESEL zweryfikowany w bazie danych wojskowej</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Znaleziono: {formData.firstName} {formData.lastName}
                  </p>
                </div>
              )}

              {formData.pesel.length === 11 && !isPeselValid && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">PESEL nie został znaleziony w bazie danych wojskowej</span>
                  </div>
                </div>
              )}

              <button
                onClick={handlePeselVerification}
                disabled={!isPeselValid || loading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? "Weryfikacja..." : "Dalej"}
              </button>
            </div>
          )}

          {/* Step 2: Phone Verification */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="peer w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder=" "
                />
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <label 
                  htmlFor="phone" 
                  className="absolute left-12 -top-2 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-600"
                >
                  Numer telefonu
                </label>
              </div>

              {!smsSent ? (
                <button
                  onClick={handleSendSms}
                  disabled={!formData.phone || loading}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? "Wysyłanie..." : "Wyślij kod SMS"}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      id="smsCode"
                      name="smsCode"
                      type="text"
                      required
                      value={formData.smsCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, smsCode: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Wprowadź kod SMS"
                      maxLength={6}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSmsVerification}
                      disabled={!formData.smsCode || loading}
                      className="flex-1 bg-green-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? "Weryfikacja..." : "Zweryfikuj kod"}
                    </button>
                    <button
                      onClick={handleSendSms}
                      disabled={smsTimer > 0 || loading}
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {smsTimer > 0 ? `${smsTimer}s` : "Wyślij ponownie"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Password Setup */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="peer w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder=" "
                />
                <label 
                  htmlFor="confirmPassword" 
                  className="absolute left-4 -top-2 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-600"
                >
                  Potwierdź hasło
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Security Level Indicator */}
              {formData.password && (
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

              <button
                onClick={handlePasswordSetup}
                disabled={!formData.password || !formData.confirmPassword || loading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? "Zapisywanie..." : "Dalej"}
              </button>
            </div>
          )}

          {/* Step 4: Personal Data */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder=" "
                  />
                  <label 
                    htmlFor="firstName" 
                    className="absolute left-4 -top-2 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-600"
                  >
                    Imię
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder=" "
                  />
                  <label 
                    htmlFor="lastName" 
                    className="absolute left-4 -top-2 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-600"
                  >
                    Nazwisko
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Dane z bazy wojskowej</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Imię i nazwisko zostały automatycznie wypełnione na podstawie numeru PESEL
                </p>
              </div>

              <button
                onClick={handleFinalRegistration}
                disabled={!formData.firstName || !formData.lastName || loading}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? "Rejestracja..." : "Zakończ rejestrację"}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Powrót do logowania
          </button>
        </div>

        {/* Demo Info */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-yellow-800 mb-3">Dane testowe do rejestracji:</h3>
          <div className="space-y-2 text-sm text-yellow-700">
            <div className="flex justify-between">
              <span className="font-medium">PESEL:</span>
              <span className="font-mono">12345678901</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">PESEL:</span>
              <span className="font-mono">98765432109</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">PESEL:</span>
              <span className="font-mono">11223344556</span>
            </div>
            <p className="text-xs mt-2">Kod SMS: dowolny 6-cyfrowy kod</p>
          </div>
        </div>
      </div>
    </div>
  );
}
