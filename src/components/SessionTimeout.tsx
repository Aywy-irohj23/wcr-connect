import { useState, useEffect } from "react";
import { Clock, AlertTriangle, Shield } from "lucide-react";

interface SessionTimeoutProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout: () => void;
}

export default function SessionTimeout({ 
  timeoutMinutes = 30, 
  warningMinutes = 5, 
  onTimeout 
}: SessionTimeoutProps) {
  const [timeLeft, setTimeLeft] = useState(timeoutMinutes * 60);
  const [showWarning, setShowWarning] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeout]);

  useEffect(() => {
    const handleActivity = () => {
      setTimeLeft(timeoutMinutes * 60);
      setShowWarning(false);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [timeoutMinutes]);

  useEffect(() => {
    if (timeLeft <= warningMinutes * 60 && timeLeft > 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [timeLeft, warningMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const extendSession = () => {
    setTimeLeft(timeoutMinutes * 60);
    setShowWarning(false);
  };

  if (!showWarning && timeLeft > warningMinutes * 60) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ostrzeżenie bezpieczeństwa</h3>
            <p className="text-sm text-gray-600">Sesja wygasa za chwilę</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Pozostały czas:</span>
            <span className="text-lg font-bold text-red-600 flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeLeft)}</span>
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / (timeoutMinutes * 60)) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Bezpieczeństwo sesji</p>
              <p>Dla bezpieczeństwa systemu, sesja zostanie automatycznie zakończona po {timeoutMinutes} minutach nieaktywności.</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={extendSession}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>Przedłuż sesję</span>
          </button>
          <button
            onClick={onTimeout}
            className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Wyloguj teraz
          </button>
        </div>
      </div>
    </div>
  );
}


