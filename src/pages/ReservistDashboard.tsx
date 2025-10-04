import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, LogOut, Bell, Trophy, Calendar, TrendingUp, 
  MessageSquare, Clock, CheckCircle, XCircle, AlertTriangle,
  Star, Award, Target, Activity, MapPin, Phone, Mail,
  ChevronRight, ChevronLeft, Play, Pause, RefreshCw,
  Mail as MailIcon, Filter, Clock as ClockIcon, MapPin as MapPinIcon, 
  Paperclip, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon,
  TrendingUp as TrendingUpIcon, BarChart3, Award as AwardIcon, Zap, Search, Download,
  Shield, Target as TargetIcon, Users, Timer, Globe, Star as StarIcon, Brain, TrendingDown,
  BarChart, PieChart, LineChart, BrainCircuit, Crown, Flame, Rocket, Eye, BrainIcon,
  MessageCircle, UserPlus, Heart, Send, Lock, Key, UserCheck, UserX, UserCog,
  ThumbsUp, ThumbsDown, Share2, Flag, Settings, Mic, MicOff, Video, VideoOff, Image, FileText, Smile, Frown, Meh
} from "lucide-react";
import { clearToken } from "../lib/auth";
import { socket } from "../lib/socket";
import { getMessages, respondToMessage } from "../lib/api";

interface PersonalStats {
  messagesReceived: number;
  responsesSent: number;
  attendanceRate: number;
  currentRank: string;
  nextRank: string;
  pointsToNextRank: number;
  totalPoints: number;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  type: 'announcement' | 'training' | 'general' | 'urgent';
  priority: 'high' | 'medium' | 'low';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: 'training' | 'meeting' | 'exercise' | 'other';
  status: 'confirmed' | 'pending' | 'declined';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedDate?: Date;
  points: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'urgent' | 'achievement' | 'reminder';
  read: boolean;
}

interface Message {
  id: string;
  type: string;
  title: string;
  body: string;
  sender: string;
  phone: string;
  place: string;
  datetime: string;
  attachments: string[];
  target: {
    group: string;
    individuals: string[];
  };
  required: boolean;
  createdAt: string;
  status?: 'pending' | 'acknowledged' | 'declined';
}

interface WeatherData {
  temperature: number;
  condition: string;
  wind: string;
  visibility: string;
  operationalConditions: string;
}

interface HeatmapData {
  date: string;
  activity: number;
  type: 'training' | 'response' | 'attendance';
}

interface GroupComparison {
  rank: number;
  percentile: number;
  totalReservists: number;
  performance: {
    responseTime: number;
    attendance: number;
    participation: number;
  };
}

interface PredictiveData {
  nextExerciseProbability: number;
  confidence: number;
  factors: string[];
  recommendation: string;
}

interface AttendanceTrend {
  month: string;
  attendance: number;
  responseTime: number;
}

interface ResponseAnalytics {
  average: number;
  fastest: number;
  slowest: number;
  trend: 'improving' | 'stable' | 'declining';
  rank: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'invitation' | 'system';
  invitation?: {
    title: string;
    description: string;
    date: string;
    location: string;
    type: string;
  };
}

interface Reservist {
  id: string;
  name: string;
  rank: string;
  unit: string;
  online: boolean;
  mutualFriends: number;
}

interface BattalionTransfer {
  id: string;
  fromUnit: string;
  toUnit: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export default function ReservistDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'calendar' | 'achievements' | 'inbox' | 'analytics' | 'community' | 'progress'>('inbox');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newsTickerPosition, setNewsTickerPosition] = useState(0);
  const [isNewsTickerPaused, setIsNewsTickerPaused] = useState(false);
  
  // Message states
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [declineCategory, setDeclineCategory] = useState('');
  
  // Weather and interactive modals
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showGroupStatusModal, setShowGroupStatusModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  
  // Weather data
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 15,
    condition: 'Słonecznie',
    wind: '10 km/h',
    visibility: 'Dobra',
    operationalConditions: 'Optymalne warunki operacyjne'
  });
  
  // Analytics data
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [groupComparison, setGroupComparison] = useState<GroupComparison>({
    rank: 15,
    percentile: 85,
    totalReservists: 120,
    performance: {
      responseTime: 2.3,
      attendance: 89,
      participation: 92
    }
  });
  const [predictiveData, setPredictiveData] = useState<PredictiveData>({
    nextExerciseProbability: 78,
    confidence: 85,
    factors: ['Historia uczestnictwa', 'Dostępność czasowa', 'Specjalizacja'],
    recommendation: 'Wysokie prawdopodobieństwo wezwania na ćwiczenia w ciągu 2 tygodni'
  });
  const [attendanceTrends, setAttendanceTrends] = useState<AttendanceTrend[]>([]);
  const [responseAnalytics, setResponseAnalytics] = useState<ResponseAnalytics>({
    average: 2.3,
    fastest: 0.5,
    slowest: 8.2,
    trend: 'improving',
    rank: 15
  });
  
  // Community data
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [reservists, setReservists] = useState<Reservist[]>([]);
  const [battalionTransfers, setBattalionTransfers] = useState<BattalionTransfer[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Personal Stats
  const [personalStats] = useState<PersonalStats>({
    messagesReceived: 47,
    responsesSent: 42,
    attendanceRate: 89,
    currentRank: "Kapral",
    nextRank: "Kapral Sztabowy",
    pointsToNextRank: 150,
    totalPoints: 850
  });

  // News Feed
  const [newsFeed] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'Nowe ćwiczenia w regionie',
      content: 'Planowane są nowe ćwiczenia wojskowe w regionie. Szczegóły zostaną przekazane w najbliższych dniach.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'training',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Aktualizacja procedur bezpieczeństwa',
      content: 'Wprowadzono nowe procedury bezpieczeństwa obowiązujące od 1 stycznia 2024.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      type: 'announcement',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Spotkanie z dowódcą',
      content: 'Planowane spotkanie z dowódcą jednostki w dniu 15 stycznia 2024.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      type: 'general',
      priority: 'low'
    }
  ]);

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Potwierdź obecność',
      description: 'Szybkie potwierdzenie obecności na ćwiczeniach',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      action: () => handleQuickAction('confirm')
    },
    {
      id: '2',
      title: 'Zgłoś nieobecność',
      description: 'Zgłoś nieobecność na ćwiczeniach',
      icon: <XCircle className="w-6 h-6" />,
      color: 'bg-red-500',
      action: () => handleQuickAction('decline')
    },
    {
      id: '3',
      title: 'Wyślij wiadomość',
      description: 'Wyślij wiadomość do dowództwa',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-blue-500',
      action: () => handleQuickAction('message')
    },
    {
      id: '4',
      title: 'Zgłoś problem',
      description: 'Zgłoś problem techniczny',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-orange-500',
      action: () => handleQuickAction('report')
    }
  ];

  // Calendar Events
  const [calendarEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Ćwiczenia taktyczne',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '08:00',
      location: 'Poligon w Poznaniu',
      type: 'training',
      status: 'confirmed'
    },
    {
      id: '2',
      title: 'Spotkanie z dowódcą',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '14:00',
      location: 'Siedziba WCR',
      type: 'meeting',
      status: 'pending'
    },
    {
      id: '3',
      title: 'Ćwiczenia strzeleckie',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      time: '09:00',
      location: 'Strzelnica wojskowa',
      type: 'exercise',
      status: 'confirmed'
    }
  ]);

  // Achievements
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Pierwsze kroki',
      description: 'Ukończ pierwsze ćwiczenia',
      icon: <Star className="w-6 h-6" />,
      earned: true,
      earnedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      points: 50
    },
    {
      id: '2',
      title: 'Wzorowy żołnierz',
      description: '100% frekwencja przez 3 miesiące',
      icon: <Award className="w-6 h-6" />,
      earned: true,
      earnedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      points: 100
    },
    {
      id: '3',
      title: 'Mistrz strzelania',
      description: 'Najlepszy wynik na strzelnicy',
      icon: <Target className="w-6 h-6" />,
      earned: false,
      points: 200
    },
    {
      id: '4',
      title: 'Lider zespołu',
      description: 'Przewodzenie w 5 ćwiczeniach',
      icon: <Trophy className="w-6 h-6" />,
      earned: false,
      points: 300
    }
  ]);

  // News ticker content
  const newsTickerItems = [
    "Nowe ćwiczenia planowane na styczeń 2024",
    "Aktualizacja procedur bezpieczeństwa",
    "Spotkanie z dowódcą 15 stycznia",
    "Nowe wyposażenie dla rezerwistów",
    "Zmiany w harmonogramie ćwiczeń"
  ];

  useEffect(() => {
    // Initialize notifications
    setNotifications([
      {
        id: '1',
        title: 'Nowe ćwiczenia',
        message: 'Planowane są nowe ćwiczenia w regionie',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'info',
        read: false
      },
      {
        id: '2',
        title: 'Osiągnięcie odblokowane',
        message: 'Zdobyłeś odznakę "Wzorowy żołnierz"',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'achievement',
        read: false
      },
      {
        id: '3',
        title: 'Pilne wezwanie',
        message: 'Ćwiczenia taktyczne w sobotę - potwierdź obecność',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        type: 'urgent',
        read: false
      }
    ]);

    // Initialize demo messages
    setMessages([
      {
        id: '1',
        type: 'Ćwiczenia planowe',
        title: 'Ćwiczenia taktyczne - Poligon Poznań',
        body: 'Planowane są ćwiczenia taktyczne na poligonie w Poznaniu. Proszę o potwierdzenie obecności do piątku.',
        sender: 'Dowództwo WCR',
        phone: '+48 123 456 789',
        place: 'Poligon Poznań',
        datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: ['instrukcja_cwiczen.pdf', 'mapa_poligonu.pdf'],
        target: { group: 'AR', individuals: [] },
        required: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'Pilne wezwanie',
        title: 'Spotkanie z dowódcą',
        body: 'Pilne spotkanie z dowódcą jednostki w sprawie nowych procedur bezpieczeństwa.',
        sender: 'Kapitan Kowalski',
        phone: '+48 987 654 321',
        place: 'Siedziba WCR',
        datetime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: ['procedury_bezpieczenstwa.pdf'],
        target: { group: 'all', individuals: [] },
        required: true,
        createdAt: new Date().toISOString()
      }
    ]);

    // Initialize demo chat messages
    setChatMessages([
      {
        id: '1',
        sender: 'Kapral Marcin Nowak',
        message: 'Cześć! Gdzie mogę wymienić buty wojskowe na większy rozmiar? Moje są za małe po ostatnim treningu.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'text'
      },
      {
        id: '2',
        sender: 'Starszy Kapral Anna Kowalska',
        message: 'Ćwiczenia taktyczne - koordynacja',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        type: 'invitation',
        invitation: {
          title: 'Ćwiczenia taktyczne - Sobota 08:00',
          description: 'Planowane są ćwiczenia taktyczne na poligonie. Proszę o potwierdzenie obecności.',
          date: 'Sobota, 08:00',
          location: 'Poligon Poznań',
          type: 'Ćwiczenia wojskowe'
        }
      },
      {
        id: '3',
        sender: 'Kapral Piotr Wiśniewski',
        message: 'Ktoś wie gdzie można zgłosić problem z wyposażeniem? Mam problem z plecakiem.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'text'
      },
      {
        id: '4',
        sender: 'Starszy Kapral Anna Kowalska',
        message: 'Piotr, idź do kwatermistrza w siedzibie WCR. On zajmuje się wyposażeniem.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        type: 'text'
      }
    ]);

    // Initialize demo reservists
    setReservists([
      {
        id: '1',
        name: 'Marcin Nowak',
        rank: 'Kapral',
        unit: '1. Batalion',
        online: true,
        mutualFriends: 3
      },
      {
        id: '2',
        name: 'Anna Kowalska',
        rank: 'Starszy Kapral',
        unit: '2. Batalion',
        online: false,
        mutualFriends: 1
      },
      {
        id: '3',
        name: 'Piotr Wiśniewski',
        rank: 'Kapral',
        unit: '1. Batalion',
        online: true,
        mutualFriends: 5
      }
    ]);

    // Initialize demo battalion transfers
    setBattalionTransfers([
      {
        id: '1',
        fromUnit: '1. Batalion',
        toUnit: '2. Batalion',
        reason: 'Chcę być z moimi znajomymi z jednostki',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]);

    // Socket listener for real-time notifications
    socket.on("notification:new", (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    // Socket listener for new messages
    socket.on("message:new", (message) => {
      setMessages(prev => [message, ...prev]);
    });

    // News ticker animation
    const tickerInterval = setInterval(() => {
      if (!isNewsTickerPaused) {
        setNewsTickerPosition(prev => (prev + 1) % newsTickerItems.length);
      }
    }, 3000);

    return () => {
      socket.off("notification:new");
      socket.off("message:new");
      clearInterval(tickerInterval);
    };
  }, [isNewsTickerPaused, newsTickerItems.length]);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const handleQuickAction = (action: string) => {
    // Add notification for quick action
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: 'Akcja wykonana',
      message: `Wykonano akcję: ${action}`,
      timestamp: new Date(),
      type: 'info',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'text-blue-600 bg-blue-100';
      case 'announcement': return 'text-purple-600 bg-purple-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-blue-500';
      case 'meeting': return 'bg-green-500';
      case 'exercise': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'declined': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f1419' }}>
      {/* Header */}
      <div className="shadow-lg border-b" style={{ backgroundColor: '#2a3441', borderColor: '#6b7c8f' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-48 h-12 flex items-center justify-center">
                <img 
                  src="/src/assets/mRezerwa-logo1.png"
                  alt="WCR Logo" 
                  className="w-48 h-48 object-contain"
                />
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-6 h-6" style={{ color: '#6b7c8f' }} />
                <h1 className="text-2xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Dashboard Rezerwisty</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Live Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-6 h-6" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotificationDropdown && (
                  <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-xl border z-50" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Powiadomienia</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>Brak powiadomień</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markNotificationAsRead(notification.id)}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.type === 'urgent' ? 'bg-red-500' :
                                notification.type === 'achievement' ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }`}></div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                                <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                                <span className="text-xs text-gray-500">
                                  {notification.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>Wyloguj</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* News Ticker */}
      <div className="bg-black text-white py-2 overflow-hidden">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded">
            <Activity className="w-4 h-4" />
            <span className="font-semibold text-sm">LIVE</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div 
              className="flex space-x-8 animate-scroll"
              style={{ 
                transform: `translateX(-${newsTickerPosition * 100}%)`,
                transition: isNewsTickerPaused ? 'none' : 'transform 3s linear'
              }}
            >
              {newsTickerItems.map((item, index) => (
                <div key={index} className="whitespace-nowrap text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setIsNewsTickerPaused(!isNewsTickerPaused)}
            className="p-1 hover:bg-gray-800 rounded"
          >
            {isNewsTickerPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: '#0f1419' }}>
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-2 rounded-2xl" style={{ backgroundColor: '#2a3441' }}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'overview' 
                  ? 'shadow-lg' 
                  : ''
              }`}
              style={{
                backgroundColor: activeTab === 'overview' ? '#6b7c8f' : 'transparent',
                color: activeTab === 'overview' ? 'white' : '#8b9aab',
                fontFamily: 'Cooper Hewitt, sans-serif',
                border: activeTab === 'overview' ? '2px solid #5a6b7d' : '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'overview') {
                  e.currentTarget.style.backgroundColor = '#5a6b7d';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.border = '2px solid #6b7c8f';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'overview') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#8b9aab';
                  e.currentTarget.style.border = '2px solid transparent';
                }
              }}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Przegląd</span>
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'inbox' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MailIcon className="w-4 h-4" />
              <span>Wiadomości</span>
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'news' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Aktualności</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'calendar' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Kalendarz</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'analytics' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analityka</span>
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'community' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Społeczność</span>
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'achievements' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Osiągnięcia</span>
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'progress' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Postęp</span>
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Personal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-2xl shadow-xl border p-6" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#8b9aab' }}>Otrzymane wiadomości</p>
                    <p className="text-3xl font-bold" style={{ color: 'white' }}>{personalStats.messagesReceived}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl shadow-xl border p-6" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#8b9aab' }}>Wysłane odpowiedzi</p>
                    <p className="text-3xl font-bold" style={{ color: 'white' }}>{personalStats.responsesSent}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl shadow-xl border p-6" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#8b9aab' }}>Frekwencja</p>
                    <p className="text-3xl font-bold" style={{ color: 'white' }}>{personalStats.attendanceRate}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl shadow-xl border p-6" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#8b9aab' }}>Aktualny stopień</p>
                    <p className="text-xl font-bold" style={{ color: 'white' }}>{personalStats.currentRank}</p>
                    <p className="text-sm" style={{ color: '#8b9aab' }}>{personalStats.pointsToNextRank} pkt do następnego</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Szybkie akcje</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`${action.color} text-white p-6 rounded-xl hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      {action.icon}
                      <div className="text-center">
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Ostatnia aktywność</h2>
              <div className="space-y-4">
                {notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-xl border-l-4 ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50'
                    } ${!notification.read ? 'border-blue-500' : 'border-gray-300'}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <p className="text-gray-600">{notification.message}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {notification.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <div className="space-y-8">
            {/* Search and Filters */}
            <div className="rounded-2xl shadow-xl border p-6" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#8b9aab' }} />
                    <input
                      type="text"
                      placeholder="Szukaj wiadomości..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ backgroundColor: '#1a2332', borderColor: '#5a6b7d', color: 'white' }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filter === 'all' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Wszystkie
                  </button>
                  <button
                    onClick={() => setFilter('upcoming')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filter === 'upcoming' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Nadchodzące
                  </button>
                </div>
              </div>
              
              {/* Messages List */}
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MailIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak wiadomości</h3>
                    <p className="text-gray-500">Nowe wiadomości pojawią się tutaj</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`rounded-xl p-6 cursor-pointer transition-colors border-2 ${
                        message.status === 'acknowledged' 
                          ? 'hover:bg-green-100' 
                          : message.status === 'declined'
                          ? 'hover:bg-red-100'
                          : 'hover:bg-gray-100'
                      }`}
                      style={{ 
                        backgroundColor: '#2a3441', 
                        borderColor: '#5a6b7d'
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                            {message.type}
                          </span>
                          {message.status && (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              message.status === 'acknowledged' 
                                ? 'bg-green-100 text-green-600' 
                                : message.status === 'declined'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-yellow-100 text-yellow-600'
                            }`}>
                              {message.status === 'acknowledged' ? 'Potwierdzono' : 
                               message.status === 'declined' ? 'Odrzucono' : 'Oczekuje'}
                            </span>
                          )}
                        </div>
                        <span className="text-sm" style={{ color: '#8b9aab' }}>
                          {new Date(message.datetime).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="font-bold mb-2" style={{ color: 'white' }}>{message.title}</h3>
                      <div className="flex items-center space-x-4 text-sm mb-3" style={{ color: '#8b9aab' }}>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{message.sender}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{message.place}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{new Date(message.datetime).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {message.attachments.length > 0 && (
                        <div className="flex items-center space-x-1 text-sm" style={{ color: '#8b9aab' }}>
                          <Paperclip className="w-4 h-4" />
                          <span>{message.attachments.length} załącznik(ów)</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="space-y-8">
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Aktualności wojskowe</h2>
              <div className="space-y-6">
                {newsFeed.map((news) => (
                  <div key={news.id} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(news.type)}`}>
                        {news.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(news.priority)}`}>
                        {news.priority}
                      </span>
                    </div>
                    <h3 className="font-bold mb-2 text-lg" style={{ color: 'white' }}>{news.title}</h3>
                    <p className="mb-3" style={{ color: '#8b9aab' }}>{news.content}</p>
                    <span className="text-sm" style={{ color: '#8b9aab' }}>
                      {news.timestamp.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-8">
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Nadchodzące wydarzenia</h2>
              <div className="space-y-4">
                {calendarEvents.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`}></div>
                        <span className="text-sm font-medium text-gray-600">{event.type}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <h3 className="font-bold mb-2 text-lg" style={{ color: 'white' }}>{event.title}</h3>
                    <div className="flex items-center space-x-4 text-sm" style={{ color: '#8b9aab' }}>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Performance Heatmap */}
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="w-6 h-6" style={{ color: '#6b7c8f' }} />
                <h2 className="text-xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Mapa cieplna aktywności</h2>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {Array.from({ length: 35 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-8 rounded ${
                      Math.random() > 0.7 ? 'bg-green-500' : 
                      Math.random() > 0.4 ? 'bg-yellow-400' : 
                      'bg-gray-200'
                    }`}
                    title={`Styczeń ${i + 1}, 2024`}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-200 rounded"></div>
                  <span>Brak aktywności</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span>Średnia aktywność</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Wysoka aktywność</span>
                </div>
              </div>
            </div>

            {/* Group Comparison */}
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Porównanie z grupą</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">#{groupComparison.rank}</div>
                  <div className="text-sm" style={{ color: '#8b9aab' }}>Pozycja w rankingu</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{groupComparison.percentile}%</div>
                  <div className="text-sm" style={{ color: '#8b9aab' }}>Percentyl</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{groupComparison.totalReservists}</div>
                  <div className="text-sm" style={{ color: '#8b9aab' }}>Łącznie rezerwistów</div>
                </div>
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <div className="flex items-center space-x-3 mb-6">
                <Brain className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Analityka predykcyjna</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span style={{ color: '#8b9aab' }}>Prawdopodobieństwo wezwania</span>
                  <span className="text-2xl font-bold text-orange-600">{predictiveData.nextExerciseProbability}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${predictiveData.nextExerciseProbability}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-2" style={{ color: '#8b9aab' }}>{predictiveData.recommendation}</p>
              </div>
            </div>

            {/* Attendance Trends */}
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Trendy frekwencji</h2>
              </div>
              <div className="grid grid-cols-6 gap-4">
                {['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze'].map((month, index) => (
                  <div key={month} className="text-center">
                    <div className="text-sm text-gray-600 mb-2">{month}</div>
                    <div className="bg-gray-200 rounded h-24 flex items-end">
                      <div 
                        className="bg-green-500 rounded w-full"
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{Math.floor(Math.random() * 40 + 60)}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Time Analytics */}
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <div className="flex items-center space-x-3 mb-6">
                <Timer className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Analityka czasu odpowiedzi</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{responseAnalytics.average}h</div>
                  <div className="text-sm text-gray-600">Średni czas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{responseAnalytics.fastest}h</div>
                  <div className="text-sm text-gray-600">Najszybszy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{responseAnalytics.slowest}h</div>
                  <div className="text-sm text-gray-600">Najwolniejszy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">#{responseAnalytics.rank}</div>
                  <div className="text-sm text-gray-600">Ranking</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-8">
            {/* Military Unit Chat */}
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <div className="flex items-center space-x-3 mb-6">
                <MessageCircle className="w-6 h-6" style={{ color: '#6b7c8f' }} />
                <h2 className="text-xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Czat Jednostki Wojskowej</h2>
                <div className="flex items-center space-x-1 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                  <Lock className="w-3 h-3" />
                  <span>Szyfrowany</span>
                </div>
                <div className="flex items-center space-x-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                  <Shield className="w-3 h-3" />
                  <span>Tylko jednostka</span>
                </div>
              </div>
              
              {/* Chat Topics */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tematy do dyskusji:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-2">Wyposażenie i umundurowanie</h4>
                    <p className="text-sm text-blue-700">Dyskusje o nowym wyposażeniu, wymianie umundurowania, problemach z rozmiarami</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="font-medium text-green-900 mb-2">Ćwiczenia i szkolenia</h4>
                    <p className="text-sm text-green-700">Planowanie ćwiczeń, wymiana doświadczeń, koordynacja działań</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <h4 className="font-medium text-orange-900 mb-2">Logistyka i transport</h4>
                    <p className="text-sm text-orange-700">Organizacja transportu, logistyka ćwiczeń, koordynacja dojazdów</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h4 className="font-medium text-purple-900 mb-2">Wsparcie techniczne</h4>
                    <p className="text-sm text-purple-700">Problemy techniczne, wsparcie IT, aktualizacje systemów</p>
                  </div>
                </div>
              </div>
              
              {/* Quick Suggestions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Szybkie sugestie pytań:</h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setNewChatMessage("Gdzie mogę wymienić buty wojskowe na większy rozmiar?")}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    Wymiana butów
                  </button>
                  <button 
                    onClick={() => setNewChatMessage("Jakie są procedury otrzymania nowego umundurowania?")}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm hover:bg-green-200 transition-colors"
                  >
                    Nowe umundurowanie
                  </button>
                  <button 
                    onClick={() => setNewChatMessage("Kto ma informacje o harmonogramie ćwiczeń na przyszły miesiąc?")}
                    className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm hover:bg-orange-200 transition-colors"
                  >
                    Harmonogram ćwiczeń
                  </button>
                  <button 
                    onClick={() => setNewChatMessage("Gdzie mogę zgłosić problem z wyposażeniem?")}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm hover:bg-red-200 transition-colors"
                  >
                    Problem z wyposażeniem
                  </button>
                  <button 
                    onClick={() => setNewChatMessage("Czy ktoś wie o zmianach w procedurach bezpieczeństwa?")}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm hover:bg-purple-200 transition-colors"
                  >
                    Procedury bezpieczeństwa
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Brak wiadomości w czacie</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {msg.sender.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold" style={{ color: 'white' }}>{msg.sender}</span>
                          <span className="text-xs" style={{ color: '#8b9aab' }}>{msg.timestamp.toLocaleTimeString()}</span>
                        </div>
                        {msg.type === 'invitation' && msg.invitation ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-blue-900">{msg.invitation.title}</span>
                            </div>
                            <p className="text-sm text-blue-800 mb-2">{msg.invitation.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-blue-600">
                              <span>{msg.invitation.date}</span>
                              <span>{msg.invitation.location}</span>
                              <span>{msg.invitation.type}</span>
                            </div>
                            <div className="flex space-x-2 mt-3">
                              <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                Tak
                              </button>
                              <button className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">
                                <XCircle className="w-3 h-3 inline mr-1" />
                                Nie
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p style={{ color: '#8b9aab' }}>{msg.message}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Napisz wiadomość..."
                  className="flex-1 px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ backgroundColor: '#1a2332', borderColor: '#5a6b7d', color: 'white' }}
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Friends & Connections */}
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Znajomi i połączenia</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reservists.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Brak znajomych w systemie</p>
                  </div>
                ) : (
                  reservists.map((reservist) => (
                    <div key={reservist.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${reservist.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div className="flex-1">
                          <h3 className="font-semibold" style={{ color: 'white' }}>{reservist.name}</h3>
                          <p className="text-sm" style={{ color: '#8b9aab' }}>{reservist.rank} • {reservist.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: '#8b9aab' }}>{reservist.mutualFriends} wspólnych znajomych</span>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                          <MessageCircle className="w-3 h-3 inline mr-1" />
                          Wiadomość
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Battalion Transfers */}
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <div className="flex items-center space-x-3 mb-6">
                <UserCog className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Transfery batalionów</h2>
              </div>
              
              <div className="space-y-4">
                {battalionTransfers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserCog className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Brak aktywnych transferów</p>
                  </div>
                ) : (
                  battalionTransfers.map((transfer) => (
                    <div key={transfer.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">Transfer do {transfer.toUnit}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transfer.status === 'approved' ? 'bg-green-100 text-green-600' :
                          transfer.status === 'rejected' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {transfer.status === 'approved' ? 'Zatwierdzony' :
                         transfer.status === 'rejected' ? 'Odrzucony' : 'Oczekujący'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Z: {transfer.fromUnit}</p>
                      <p className="text-sm text-gray-600 mb-3">Powód: {transfer.reason}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {transfer.createdAt.toLocaleDateString()}
                        </span>
                        {transfer.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              Zatwierdź
                            </button>
                            <button className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">
                              <XCircle className="w-3 h-3 inline mr-1" />
                              Odrzuć
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-8">
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Osiągnięcia i odznaki</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`border-2 rounded-xl p-6 ${
                      achievement.earned 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${
                        achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        <div className={achievement.earned ? 'text-yellow-600' : 'text-gray-400'}>
                          {achievement.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg ${
                          achievement.earned ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm ${
                          achievement.earned ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>
                        {achievement.earned && achievement.earnedDate && (
                          <p className="text-xs text-yellow-600 mt-1">
                            Zdobyte: {achievement.earnedDate.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${
                          achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                        }`}>
                          {achievement.points}
                        </span>
                        <p className="text-xs text-gray-500">pkt</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress Tab - Game-style Achievements & Military Thoughts */}
        {activeTab === 'progress' && (
          <div className="space-y-8">
            {/* Military Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-2xl shadow-xl border p-6" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#8b9aab' }}>Poziom wojskowy</p>
                    <p className="text-3xl font-bold" style={{ color: 'white' }}>Lvl 47</p>
                    <p className="text-sm" style={{ color: '#8b9aab' }}>2340/2500 XP</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '93.6%' }}></div>
                </div>
              </div>

              <div className="rounded-2xl shadow-xl border p-6" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#8b9aab' }}>Osiągnięcia</p>
                    <p className="text-3xl font-bold" style={{ color: 'white' }}>12</p>
                    <p className="text-sm" style={{ color: '#8b9aab' }}>z 25 możliwych</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl shadow-xl border p-6" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#8b9aab' }}>Specjalizacja</p>
                    <p className="text-2xl font-bold" style={{ color: 'white' }}>Strzelec</p>
                    <p className="text-sm" style={{ color: '#8b9aab' }}>85% biegłości</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl shadow-xl border p-6" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#8b9aab' }}>Ranking</p>
                    <p className="text-3xl font-bold" style={{ color: 'white' }}>#15</p>
                    <p className="text-sm" style={{ color: '#8b9aab' }}>w batalionie</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Military Skills Progress */}
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Rozwój Umiejętności Wojskowych</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'Strzelectwo', level: 85, xp: 850, nextLevel: 1000, color: 'bg-red-500', icon: <Target className="w-6 h-6" /> },
                  { name: 'Taktyka', level: 78, xp: 780, nextLevel: 900, color: 'bg-blue-500', icon: <Brain className="w-6 h-6" /> },
                  { name: 'Dowodzenie', level: 92, xp: 920, nextLevel: 1000, color: 'bg-green-500', icon: <Crown className="w-6 h-6" /> },
                  { name: 'Technologia', level: 45, xp: 450, nextLevel: 600, color: 'bg-purple-500', icon: <Activity className="w-6 h-6" /> },
                  { name: 'Fizyczność', level: 88, xp: 880, nextLevel: 1000, color: 'bg-orange-500', icon: <Zap className="w-6 h-6" /> },
                  { name: 'Komunikacja', level: 76, xp: 760, nextLevel: 900, color: 'bg-pink-500', icon: <MessageSquare className="w-6 h-6" /> }
                ].map((skill, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{skill.icon}</span>
                        <div>
                          <h3 className="font-semibold" style={{ color: 'white' }}>{skill.name}</h3>
                          <p className="text-sm" style={{ color: '#8b9aab' }}>Poziom {skill.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: 'white' }}>{skill.level}%</div>
                        <div className="text-xs" style={{ color: '#8b9aab' }}>{skill.xp}/{skill.nextLevel} XP</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className={`${skill.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Do następnego poziomu: {skill.nextLevel - skill.xp} XP</span>
                      <span>{Math.round((skill.xp / skill.nextLevel) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Military Achievements */}
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <div className="flex items-center space-x-3 mb-6">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <h2 className="text-xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Osiągnięcia Wojskowe</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Mistrz Strzelania', description: 'Najlepszy wynik na strzelnicy', icon: <Target className="w-6 h-6" />, earned: true, date: '15.01.2024', points: 100, rarity: 'legendary' },
                  { title: 'Wzorowy Żołnierz', description: '100% frekwencja przez 3 miesiące', icon: <Star className="w-6 h-6" />, earned: true, date: '10.01.2024', points: 150, rarity: 'epic' },
                  { title: 'Lider Zespołu', description: 'Przewodzenie w 5 ćwiczeniach', icon: <Crown className="w-6 h-6" />, earned: true, date: '05.01.2024', points: 200, rarity: 'epic' },
                  { title: 'Specjalista Technologii', description: 'Ukończenie kursu IT wojskowego', icon: <Activity className="w-6 h-6" />, earned: false, date: null, points: 300, rarity: 'rare' },
                  { title: 'Medal Odwagi', description: 'Wykazanie się w trudnej sytuacji', icon: <Award className="w-6 h-6" />, earned: false, date: null, points: 500, rarity: 'legendary' },
                  { title: 'Ekspert Taktyki', description: 'Najlepszy wynik w ćwiczeniach taktycznych', icon: <Brain className="w-6 h-6" />, earned: false, date: null, points: 250, rarity: 'rare' }
                ].map((achievement, index) => (
                  <div key={index} className={`border-2 rounded-xl p-4 ${
                    achievement.earned 
                      ? achievement.rarity === 'legendary' ? 'border-yellow-400 bg-yellow-50' :
                        achievement.rarity === 'epic' ? 'border-purple-400 bg-purple-50' :
                        'border-blue-400 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <h3 className={`font-bold ${
                          achievement.earned ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm ${
                          achievement.earned ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-600' :
                          achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {achievement.rarity === 'legendary' ? 'Legendarny' :
                           achievement.rarity === 'epic' ? 'Epicki' : 'Rzadki'}
                        </span>
                        <span className="text-xs text-gray-500">{achievement.points} pkt</span>
                      </div>
                      {achievement.earned && (
                        <div className="text-right">
                          <div className="text-xs text-green-600 font-medium">Zdobyte</div>
                          <div className="text-xs text-gray-500">{achievement.date}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Military Thoughts & Reflections */}
            <div className="rounded-2xl shadow-xl border p-8" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
              <div className="flex items-center space-x-3 mb-6">
                <MessageCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Refleksje Wojskowe</h2>
              </div>
              
              <div className="space-y-6">
                {/* Add New Thought */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Dodaj nową refleksję</h3>
                  <textarea
                    placeholder="Opisz swoje przemyślenia z ostatnich ćwiczeń, lekcje, które wyniosłeś, lub cele na przyszłość..."
                    className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Zapisz refleksję
                    </button>
                  </div>
                </div>

                {/* Recent Thoughts */}
                <div className="space-y-4">
                  <h3 className="font-semibold" style={{ color: 'white' }}>Ostatnie refleksje</h3>
                  {[
                    {
                      date: '20.01.2024',
                      title: 'Ćwiczenia taktyczne - lekcje',
                      content: 'Dzisiejsze ćwiczenia pokazały mi, jak ważna jest komunikacja w zespole. Muszę popracować nad przekazywaniem informacji w stresie.',
                      tags: ['taktyka', 'komunikacja', 'stres'],
                      mood: 'reflective'
                    },
                    {
                      date: '18.01.2024',
                      title: 'Cel na przyszły miesiąc',
                      content: 'Chcę poprawić swoje umiejętności strzeleckie. Planuję dodatkowe treningi na strzelnicy i pracę nad techniką.',
                      tags: ['strzelectwo', 'cele', 'trening'],
                      mood: 'motivated'
                    },
                    {
                      date: '15.01.2024',
                      title: 'Osiągnięcie - Mistrz Strzelania',
                      content: 'Wreszcie udało się! Miesiące treningów przyniosły efekt. Najważniejsze było opanowanie oddechu i koncentracja.',
                      tags: ['osiągnięcie', 'strzelectwo', 'sukces'],
                      mood: 'proud'
                    }
                  ].map((thought, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold" style={{ color: 'white' }}>{thought.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            thought.mood === 'reflective' ? 'bg-blue-100 text-blue-600' :
                            thought.mood === 'motivated' ? 'bg-green-100 text-green-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {thought.mood === 'reflective' ? 'Refleksyjny' :
                             thought.mood === 'motivated' ? 'Zmotywowany' : 'Dumny'}
                          </span>
                          <span className="text-xs" style={{ color: '#8b9aab' }}>{thought.date}</span>
                        </div>
                      </div>
                      <p className="text-sm mb-3" style={{ color: '#8b9aab' }}>{thought.content}</p>
                      <div className="flex flex-wrap gap-1">
                        {thought.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>{selectedMessage.title}</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Od:</label>
                    <p className="text-gray-900">{selectedMessage.sender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telefon:</label>
                    <p className="text-gray-900">{selectedMessage.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Miejsce:</label>
                    <p className="text-gray-900">{selectedMessage.place}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data:</label>
                    <p className="text-gray-900">{new Date(selectedMessage.datetime).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Wiadomość:</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.body}</p>
                  </div>
                </div>
                
                {selectedMessage.attachments.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Załączniki:</label>
                    <div className="mt-2 space-y-2">
                      {selectedMessage.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                          <Paperclip className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-600 hover:underline cursor-pointer">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Status indicator */}
                {selectedMessage.status && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">Status odpowiedzi:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedMessage.status === 'acknowledged' 
                          ? 'bg-green-100 text-green-600' 
                          : selectedMessage.status === 'declined'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {selectedMessage.status === 'acknowledged' ? 'Potwierdzono obecność' : 
                         selectedMessage.status === 'declined' ? 'Zgłoszono nieobecność' : 'Oczekuje na odpowiedź'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={async () => {
                      try {
                        // Send response to server
                        await respondToMessage(selectedMessage.id, 'acknowledged');
                        
                        // Update local messages state
                        setMessages(prev => prev.map(msg => 
                          msg.id === selectedMessage.id 
                            ? { ...msg, status: 'acknowledged' }
                            : msg
                        ));
                        
                        // Add success notification
                        const newNotification: Notification = {
                          id: Date.now().toString(),
                          title: 'Odpowiedź wysłana',
                          message: `Potwierdziłeś obecność na: ${selectedMessage.title}`,
                          timestamp: new Date(),
                          type: 'info',
                          read: false
                        };
                        setNotifications(prev => [newNotification, ...prev]);
                        
                        // Close modal
                        setSelectedMessage(null);
                      } catch (error) {
                        console.error('Error responding to message:', error);
                        // Still close modal but show error
                        setSelectedMessage(null);
                      }
                    }}
                    disabled={selectedMessage.status === 'acknowledged' || selectedMessage.status === 'declined'}
                    className={`flex-1 px-6 py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 ${
                      selectedMessage.status === 'acknowledged' || selectedMessage.status === 'declined'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>
                      {selectedMessage.status === 'acknowledged' ? 'Już potwierdzono' : 'Potwierdź obecność'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      if (selectedMessage.status === 'acknowledged' || selectedMessage.status === 'declined') {
                        return;
                      }
                      setShowDeclineReason(true);
                    }}
                    disabled={selectedMessage.status === 'acknowledged' || selectedMessage.status === 'declined'}
                    className={`flex-1 px-6 py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 ${
                      selectedMessage.status === 'acknowledged' || selectedMessage.status === 'declined'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                    <span>
                      {selectedMessage.status === 'declined' ? 'Już odrzucono' : 'Nie mogę uczestniczyć'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {showDeclineReason && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl shadow-2xl max-w-lg w-full" style={{ backgroundColor: '#2a3441', borderColor: '#5a6b7d' }}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Zgłoszenie nieobecności</h2>
                <button
                  onClick={() => {
                    setShowDeclineReason(false);
                    setDeclineReason('');
                    setDeclineCategory('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">Ważne informacje</span>
                  </div>
                  <p className="text-red-700 text-sm">
                    Proszę podać powód nieobecności na: <strong>{selectedMessage.title}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategoria powodu
                  </label>
                  <select
                    value={declineCategory}
                    onChange={(e) => setDeclineCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Wybierz kategorię</option>
                    <option value="health">Problemy zdrowotne</option>
                    <option value="work">Konflikt z pracą</option>
                    <option value="family">Sprawy rodzinne</option>
                    <option value="transport">Problemy z transportem</option>
                    <option value="personal">Sprawy osobiste</option>
                    <option value="other">Inne</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Szczegółowy powód nieobecności *
                  </label>
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    placeholder="Opisz szczegółowo powód swojej nieobecności..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 znaków. Informacja zostanie przekazana do dowództwa.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDeclineReason(false);
                      setDeclineReason('');
                      setDeclineCategory('');
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={async () => {
                      if (!declineReason.trim() || declineReason.trim().length < 10) {
                        alert('Proszę podać szczegółowy powód nieobecności (minimum 10 znaków)');
                        return;
                      }
                      if (!declineCategory) {
                        alert('Proszę wybrać kategorię powodu');
                        return;
                      }

                      try {
                        // Send response to server with reason
                        await respondToMessage(selectedMessage.id, 'declined');
                        
                        // Update local messages state
                        setMessages(prev => prev.map(msg => 
                          msg.id === selectedMessage.id 
                            ? { ...msg, status: 'declined' }
                            : msg
                        ));
                        
                        // Add success notification with reason
                        const newNotification: Notification = {
                          id: Date.now().toString(),
                          title: 'Nieobecność zgłoszona',
                          message: `Zgłosiłeś nieobecność na: ${selectedMessage.title}. Powód: ${declineCategory}`,
                          timestamp: new Date(),
                          type: 'info',
                          read: false
                        };
                        setNotifications(prev => [newNotification, ...prev]);
                        
                        // Close modals
                        setShowDeclineReason(false);
                        setSelectedMessage(null);
                        setDeclineReason('');
                        setDeclineCategory('');
                      } catch (error) {
                        console.error('Error responding to message:', error);
                        setShowDeclineReason(false);
                        setSelectedMessage(null);
                      }
                    }}
                    disabled={!declineReason.trim() || declineReason.trim().length < 10 || !declineCategory}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Zgłoś nieobecność</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
