import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMessages, respondToMessage } from "../lib/api";
import { clearToken } from "../lib/auth";
import { socket } from "../lib/socket";
import { Mail, LogOut, Filter, Calendar, MapPin, Phone, Paperclip, CheckCircle, XCircle, Clock, Bell, TrendingUp, Activity, BarChart3, Award, Zap, Search, Download, AlertTriangle, Shield, Target, Users, Timer, Globe, Star, Brain, TrendingDown, BarChart, PieChart, LineChart, BrainCircuit, Trophy, Medal, Crown, Flame, Rocket, Eye, BrainIcon, MessageCircle, UserPlus, Heart, Send, Lock, Key, UserCheck, UserX, MapPin as MapPinIcon, Gamepad2, Users2, UserCog, Star as StarIcon, ThumbsUp, ThumbsDown, Share2, Flag, Settings, Mic, MicOff, Video, VideoOff, Image, FileText, Smile, Frown, Meh } from "lucide-react";

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
  required: boolean;
  createdAt: string;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  type: 'announcement' | 'training' | 'general' | 'urgent';
  priority: 'high' | 'medium' | 'low';
}

interface PersonalStats {
  totalMessages: number;
  respondedMessages: number;
  attendanceRate: number;
  responseTime: number;
  rank: string;
  achievements: string[];
  streak: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

interface WeatherData {
  temperature: number;
  condition: string;
  windSpeed: number;
  visibility: number;
  militaryCondition: string;
}

interface HeatmapData {
  date: string;
  activity: number;
  level: 'low' | 'medium' | 'high' | 'max';
}

interface GroupComparison {
  rank: number;
  totalReservists: number;
  percentile: number;
  category: string;
  performance: {
    responseTime: number;
    attendance: number;
    participation: number;
  };
}

interface PredictiveData {
  nextExercise: string;
  probability: number;
  confidence: number;
  factors: string[];
}

interface AttendanceTrend {
  month: string;
  attendance: number;
  participation: number;
  responseTime: number;
}

interface ResponseAnalytics {
  averageTime: number;
  fastestTime: number;
  slowestTime: number;
  trend: 'improving' | 'stable' | 'declining';
  rank: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  senderRank: string;
  senderUnit: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'invitation';
  encrypted: boolean;
  invitation?: {
    type: 'paintball' | 'training' | 'social';
    title: string;
    date: string;
    location: string;
    participants: number;
    maxParticipants: number;
  };
}

interface Reservist {
  id: string;
  name: string;
  rank: string;
  unit: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen: Date;
  avatar: string;
  isFriend: boolean;
  mutualFriends: number;
}

interface BattalionTransfer {
  id: string;
  fromUnit: string;
  toUnit: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  approvedBy?: string;
  createdAt: Date;
}

export default function Inbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming">("all");
  const [activeTab, setActiveTab] = useState<'messages' | 'news' | 'dashboard' | 'analytics' | 'community'>('messages');
  const [toast, setToast] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [personalStats, setPersonalStats] = useState<PersonalStats>({
    totalMessages: 47,
    respondedMessages: 42,
    attendanceRate: 89,
    responseTime: 1.2,
    rank: "Kapral",
    achievements: ["Pierwsza odpowiedź", "Stały uczestnik", "Szybka reakcja"],
    streak: 12
  });
  const [achievements] = useState<Achievement[]>([
    { id: '1', name: 'Pierwsza odpowiedź', description: 'Odpowiedziałeś na pierwszą wiadomość', icon: 'Target', unlocked: true, progress: 100 },
    { id: '2', name: 'Stały uczestnik', description: 'Uczestniczysz w 10+ ćwiczeniach', icon: 'Award', unlocked: true, progress: 100 },
    { id: '3', name: 'Szybka reakcja', description: 'Odpowiadasz w ciągu 5 minut', icon: 'Zap', unlocked: true, progress: 100 },
    { id: '4', name: 'Weteran', description: '50+ wiadomości', icon: 'Shield', unlocked: false, progress: 94 },
    { id: '5', name: 'Perfekcjonista', description: '100% frekwencja przez miesiąc', icon: 'Star', unlocked: false, progress: 67 }
  ]);
  const [weatherData] = useState<WeatherData>({
    temperature: 12,
    condition: 'Częściowo zachmurzone',
    windSpeed: 15,
    visibility: 8,
    militaryCondition: 'Dobre warunki operacyjne'
  });
  const [emergencyAlert, setEmergencyAlert] = useState<string>("");
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showGroupStatusModal, setShowGroupStatusModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [weatherInput, setWeatherInput] = useState({ temperature: 12, condition: 'Częściowo zachmurzone', windSpeed: 15, visibility: 8 });
  const [groupData, setGroupData] = useState({ name: 'Grupa AR', members: 24, active: 18, status: 'Gotowa' });
  const [calendarEvent, setCalendarEvent] = useState({ title: '', date: '', location: '', type: 'Ćwiczenia' });
  const [profileData, setProfileData] = useState({ name: 'Jan Kowalski', rank: 'Kapral', unit: 'AR', phone: '+48 123 456 789' });
  const [attendanceData, setAttendanceData] = useState({ event: '', status: 'confirmed', notes: '' });
  
  // Advanced Analytics Data
  const [heatmapData] = useState<HeatmapData[]>([
    { date: '2024-01-01', activity: 3, level: 'high' },
    { date: '2024-01-02', activity: 1, level: 'low' },
    { date: '2024-01-03', activity: 4, level: 'max' },
    { date: '2024-01-04', activity: 2, level: 'medium' },
    { date: '2024-01-05', activity: 5, level: 'max' },
    { date: '2024-01-06', activity: 0, level: 'low' },
    { date: '2024-01-07', activity: 3, level: 'high' },
    { date: '2024-01-08', activity: 2, level: 'medium' },
    { date: '2024-01-09', activity: 4, level: 'max' },
    { date: '2024-01-10', activity: 1, level: 'low' },
    { date: '2024-01-11', activity: 3, level: 'high' },
    { date: '2024-01-12', activity: 2, level: 'medium' },
    { date: '2024-01-13', activity: 0, level: 'low' },
    { date: '2024-01-14', activity: 4, level: 'max' },
    { date: '2024-01-15', activity: 3, level: 'high' },
    { date: '2024-01-16', activity: 2, level: 'medium' },
    { date: '2024-01-17', activity: 1, level: 'low' },
    { date: '2024-01-18', activity: 5, level: 'max' },
    { date: '2024-01-19', activity: 3, level: 'high' },
    { date: '2024-01-20', activity: 2, level: 'medium' },
    { date: '2024-01-21', activity: 4, level: 'max' },
    { date: '2024-01-22', activity: 1, level: 'low' },
    { date: '2024-01-23', activity: 3, level: 'high' },
    { date: '2024-01-24', activity: 2, level: 'medium' },
    { date: '2024-01-25', activity: 0, level: 'low' },
    { date: '2024-01-26', activity: 4, level: 'max' },
    { date: '2024-01-27', activity: 3, level: 'high' },
    { date: '2024-01-28', activity: 2, level: 'medium' },
    { date: '2024-01-29', activity: 1, level: 'low' },
    { date: '2024-01-30', activity: 5, level: 'max' },
    { date: '2024-01-31', activity: 3, level: 'high' }
  ]);
  
  const [groupComparison] = useState<GroupComparison>({
    rank: 7,
    totalReservists: 156,
    percentile: 95,
    category: 'Elite',
    performance: {
      responseTime: 1.2,
      attendance: 89,
      participation: 92
    }
  });
  
  const [predictiveData] = useState<PredictiveData>({
    nextExercise: 'Ćwiczenia taktyczne AR',
    probability: 87,
    confidence: 94,
    factors: ['Wysoka frekwencja', 'Szybkie odpowiedzi', 'Aktywność w weekendy']
  });
  
  const [attendanceTrends] = useState<AttendanceTrend[]>([
    { month: 'Sierpień', attendance: 85, participation: 78, responseTime: 2.1 },
    { month: 'Wrzesień', attendance: 92, participation: 88, responseTime: 1.8 },
    { month: 'Październik', attendance: 89, participation: 85, responseTime: 1.5 },
    { month: 'Listopad', attendance: 94, participation: 91, responseTime: 1.3 },
    { month: 'Grudzień', attendance: 87, participation: 82, responseTime: 1.2 },
    { month: 'Styczeń', attendance: 89, participation: 86, responseTime: 1.2 }
  ]);
  
  const [responseAnalytics] = useState<ResponseAnalytics>({
    averageTime: 1.2,
    fastestTime: 0.3,
    slowestTime: 4.8,
    trend: 'improving',
    rank: 3
  });
  
  // Community & Chat Data
  const [chatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Anna Nowak',
      senderRank: 'Kapral',
      senderUnit: 'AR',
      content: 'Hej! Ktoś chce pograć w paintball w weekend?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'invitation',
      encrypted: true,
      invitation: {
        type: 'paintball',
        title: 'Paintball w Poznaniu',
        date: '2024-01-20',
        location: 'Poligon Paintball Poznań',
        participants: 8,
        maxParticipants: 12
      }
    },
    {
      id: '2',
      sender: 'Piotr Kowalczyk',
      senderRank: 'Sierżant',
      senderUnit: 'PR',
      content: 'Świetny pomysł! Jestem chętny 🎯',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      type: 'text',
      encrypted: true
    },
    {
      id: '3',
      sender: 'Michał Wiśniewski',
      senderRank: 'Kapral',
      senderUnit: 'AR',
      content: 'Może przenieść się do batalionu AR? Mamy lepsze warunki',
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      type: 'text',
      encrypted: true
    }
  ]);
  
  const [reservists] = useState<Reservist[]>([
    { id: '1', name: 'Anna Nowak', rank: 'Kapral', unit: 'AR', status: 'online', lastSeen: new Date(), avatar: 'AN', isFriend: true, mutualFriends: 5 },
    { id: '2', name: 'Piotr Kowalczyk', rank: 'Sierżant', unit: 'PR', status: 'online', lastSeen: new Date(), avatar: 'PK', isFriend: true, mutualFriends: 3 },
    { id: '3', name: 'Michał Wiśniewski', rank: 'Kapral', unit: 'AR', status: 'busy', lastSeen: new Date(Date.now() - 10 * 60 * 1000), avatar: 'MW', isFriend: false, mutualFriends: 2 },
    { id: '4', name: 'Katarzyna Zielińska', rank: 'Starszy kapral', unit: 'AR', status: 'offline', lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), avatar: 'KZ', isFriend: true, mutualFriends: 7 },
    { id: '5', name: 'Tomasz Lewandowski', rank: 'Kapral', unit: 'PR', status: 'online', lastSeen: new Date(), avatar: 'TL', isFriend: false, mutualFriends: 1 }
  ]);
  
  const [battalionTransfers] = useState<BattalionTransfer[]>([
    {
      id: '1',
      fromUnit: 'PR',
      toUnit: 'AR',
      reason: 'Chcę dołączyć do znajomych z AR',
      status: 'pending',
      requestedBy: 'Jan Kowalski',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      fromUnit: 'AR',
      toUnit: 'TAR',
      reason: 'Rozwój kariery w jednostce technicznej',
      status: 'approved',
      requestedBy: 'Anna Nowak',
      approvedBy: 'Dowódca AR',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ]);
  
  const [showChatModal, setShowChatModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedReservist, setSelectedReservist] = useState<Reservist | null>(null);
  
  const navigate = useNavigate();

  // News feed data
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
    },
    {
      id: '4',
      title: 'Pilne: Zmiany w harmonogramie',
      content: 'Wprowadzono pilne zmiany w harmonogramie ćwiczeń na styczeń. Proszę o sprawdzenie nowych terminów.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      type: 'urgent',
      priority: 'high'
    }
  ]);

  useEffect(() => {
    loadMessages();
    
    // Socket listener for new messages
    socket.on("message:new", (newMessage: Message) => {
      setMessages(prev => [newMessage, ...prev]);
      setToast("Nowa wiadomość otrzymana!");
      setTimeout(() => setToast(""), 3000);
    });

    // Emergency alert simulation
    const emergencyInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 10 seconds
        setEmergencyAlert("PILNE: Ćwiczenia alarmowe w regionie!");
        setTimeout(() => setEmergencyAlert(""), 5000);
      }
    }, 10000);

    return () => {
      socket.off("message:new");
      clearInterval(emergencyInterval);
    };
  }, []);

  const loadMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const handleRespond = async (messageId: string, action: "acknowledged" | "declined") => {
    const confirmed = window.confirm(
      action === "acknowledged" 
        ? "Are you sure you want to confirm attendance?" 
        : "Are you sure you cannot attend?"
    );
    
    if (!confirmed) return;

    try {
      await respondToMessage(messageId, action);
      setSelectedMessage(null);
      setToast(`Response recorded: ${action === "acknowledged" ? "Confirmed" : "Declined"}`);
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Failed to respond:", error);
      setToast("Failed to record response");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === "upcoming") {
      return new Date(msg.datetime) >= new Date();
    }
    if (searchQuery) {
      return msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             msg.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
             msg.sender.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Ćwiczenia planowe": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pilne wezwanie": return "bg-red-100 text-red-800 border-red-200";
      case "Informacja": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getNewsTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'text-blue-600 bg-blue-100';
      case 'announcement': return 'text-purple-600 bg-purple-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'general': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">WCR</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-6 h-6 text-gray-700" />
                <h1 className="text-2xl font-bold text-gray-900">Skrzynka odbiorcza</h1>
              </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Alert */}
        {emergencyAlert && (
          <div className="mb-6 bg-red-600 text-white p-4 rounded-2xl shadow-lg border border-red-500 animate-pulse">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-lg">ALERT PILNY</h3>
                <p className="text-red-100">{emergencyAlert}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'messages' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="w-5 h-5" />
              <span>Wiadomości</span>
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'news' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span>Aktualności</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'dashboard' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'analytics' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Brain className="w-5 h-5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'community' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Społeczność</span>
            </button>
          </div>
        </div>

        {/* Messages Tab */}
          {activeTab === 'messages' && (
              <>
                  {/* Search and Filter */}
                  <div className="mb-8">
                      <div className="flex flex-col sm:flex-row gap-4 mb-4">
                          <div className="flex-1 relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                  type="text"
                                  placeholder="Szukaj wiadomości..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                          </div>
                          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2">
                              <Download className="w-4 h-4" />
                              <span>Eksportuj</span>
                          </button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                          <button
                              onClick={() => setFilter("all")}
                              className={`px-4 sm:px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                                  filter === "all"
                                      ? "bg-black text-white shadow-lg"
                                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                              }`}
                          >
                              <Filter className="w-4 h-4" />
                              <span className="hidden sm:inline">Wszystkie wiadomości</span>
                              <span className="sm:hidden">Wszystkie</span>
                          </button>
                          <button
                              onClick={() => setFilter("upcoming")}
                              className={`px-4 sm:px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                                  filter === "upcoming"
                                      ? "bg-black text-white shadow-lg"
                                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                              }`}
                          >
                              <Clock className="w-4 h-4" />
                              <span className="hidden sm:inline">Nadchodzące</span>
                              <span className="sm:hidden">Nadchodzące</span>
                          </button>
                      </div>
                  </div>

                  {/* Messages grid */}
                  <div className="grid gap-6">
                      {filteredMessages.map((message) => (
                          <div
                              key={message.id}
                              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group"
                              onClick={() => setSelectedMessage(message)}
                          >
                              <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                      <div className="flex items-center space-x-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(message.type)}`}>
                  {message.type}
                </span>
                                          {message.required && (
                                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                    Required
                  </span>
                                          )}
                                      </div>

                                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                          {message.title}
                                      </h3>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                                          <div className="flex items-center">
                                              <span className="font-medium mr-2">Od:</span>
                                              <span>{message.sender}</span>
                                          </div>
                                          {message.place && (
                                              <div className="flex items-center">
                                                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                                  <span className="font-medium mr-2">Miejsce:</span>
                                                  <span>{message.place}</span>
                                              </div>
                                          )}
                                          <div className="flex items-center">
                                              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                              <span className="font-medium mr-2">Data:</span>
                                              <span>{new Date(message.datetime).toLocaleString()}</span>
                                          </div>
                                          {message.attachments.length > 0 && (
                                              <div className="flex items-center">
                                                  <Paperclip className="w-4 h-4 mr-2 text-gray-500" />
                                                  <span>{message.attachments.length} załącznik(ów)</span>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>

                  {filteredMessages.length === 0 && (
                      <div className="text-center py-16">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Mail className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-lg">Brak wiadomości</p>
                          <p className="text-gray-400 text-sm mt-2">Nowe wiadomości pojawią się tutaj</p>
                      </div>
                  )}
              </>
          )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-2 mb-6">
                <Bell className="w-6 h-6 text-gray-700" />
                <h2 className="text-2xl font-bold text-gray-900">Aktualności wojskowe</h2>
              </div>
              <div className="space-y-6">
                {newsFeed.map((news) => (
                  <div key={news.id} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getNewsTypeColor(news.type)}`}>
                        {news.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(news.priority)}`}>
                        {news.priority}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">{news.title}</h3>
                    <p className="text-gray-600 mb-3">{news.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {news.timestamp.toLocaleString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Aktualizacja</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Personal Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{personalStats.totalMessages}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600">Wiadomości</h3>
                <p className="text-xs text-gray-500 mt-1">Otrzymane</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{personalStats.respondedMessages}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600">Odpowiedzi</h3>
                <p className="text-xs text-gray-500 mt-1">Wysłane</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{personalStats.attendanceRate}%</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600">Frekwencja</h3>
                <p className="text-xs text-gray-500 mt-1">Średnia</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Timer className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{personalStats.responseTime}s</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600">Czas odpowiedzi</h3>
                <p className="text-xs text-gray-500 mt-1">Średni</p>
              </div>
            </div>

            {/* Rank and Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Award className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-900">Twój status</h2>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{personalStats.rank}</h3>
                  <p className="text-gray-600 mb-4">Stopień wojskowy</p>
                  <div className="bg-gray-200 rounded-full h-3 mb-2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full" style={{width: '75%'}}></div>
                  </div>
                  <p className="text-sm text-gray-500">Do następnego stopnia: 25%</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Osiągnięcia</h2>
                </div>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className={`p-4 rounded-xl border-2 transition-all ${
                      achievement.unlocked 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {achievement.icon === 'Target' && <Target className="w-5 h-5 text-gray-600" />}
                          {achievement.icon === 'Award' && <Award className="w-5 h-5 text-gray-600" />}
                          {achievement.icon === 'Zap' && <Zap className="w-5 h-5 text-gray-600" />}
                          {achievement.icon === 'Shield' && <Shield className="w-5 h-5 text-gray-600" />}
                          {achievement.icon === 'Star' && <Star className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${achievement.unlocked ? 'text-green-800' : 'text-gray-600'}`}>
                            {achievement.name}
                          </h4>
                          <p className="text-sm text-gray-500">{achievement.description}</p>
                        </div>
                        {achievement.unlocked ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="text-sm text-gray-400">{achievement.progress}%</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weather and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 cursor-pointer hover:shadow-2xl transition-all duration-200" onClick={() => setShowWeatherModal(true)}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Warunki operacyjne</h2>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Kliknij aby edytować</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{weatherData.temperature}°C</div>
                  <p className="text-gray-600 mb-4">{weatherData.condition}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="font-semibold text-gray-700">Wiatr</div>
                      <div className="text-gray-900">{weatherData.windSpeed} km/h</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="font-semibold text-gray-700">Widoczność</div>
                      <div className="text-gray-900">{weatherData.visibility} km</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-100 rounded-xl">
                    <p className="text-green-800 font-semibold">{weatherData.militaryCondition}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Zap className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-900">Szybkie akcje</h2>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowAttendanceModal(true)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Potwierdź wszystkie</span>
                  </button>
                  <button 
                    onClick={() => setShowGroupStatusModal(true)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Status grupy</span>
                  </button>
                  <button 
                    onClick={() => setShowCalendarModal(true)}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Kalendarz ćwiczeń</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Activity className="w-6 h-6 text-gray-700" />
                  <h2 className="text-xl font-bold text-gray-900">Ostatnia aktywność</h2>
                </div>
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Edytuj profil
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors" onClick={() => setShowAttendanceModal(true)}>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Potwierdziłeś obecność</p>
                    <p className="text-xs text-gray-500">Ćwiczenia w Poznaniu - 2 min temu</p>
                  </div>
                  <div className="text-xs text-gray-400">Kliknij aby edytować</div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Otrzymano wiadomość</p>
                    <p className="text-xs text-gray-500">Pilne wezwanie - 15 min temu</p>
                  </div>
                  <div className="text-xs text-gray-400">Tylko do odczytu</div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => setShowProfileModal(true)}>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Zaktualizowano profil</p>
                    <p className="text-xs text-gray-500">Dane kontaktowe - 1 godzina temu</p>
                  </div>
                  <div className="text-xs text-gray-400">Kliknij aby edytować</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Performance Heatmap */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Flame className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">Mapa aktywności</h2>
                <div className="ml-auto text-sm text-gray-500">Styczeń 2024</div>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['P', 'W', 'Ś', 'C', 'P', 'S', 'N'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {heatmapData.map((day, index) => (
                  <div
                    key={day.date}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-200 hover:scale-110 ${
                      day.level === 'max' ? 'bg-green-500 text-white' :
                      day.level === 'high' ? 'bg-green-400 text-white' :
                      day.level === 'medium' ? 'bg-green-300 text-gray-800' :
                      day.level === 'low' ? 'bg-green-100 text-gray-600' :
                      'bg-gray-100 text-gray-400'
                    }`}
                    title={`${day.date}: ${day.activity} aktywności`}
                  >
                    {day.activity}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <span>Mniej</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <div className="w-3 h-3 bg-green-300 rounded"></div>
                  <div className="w-3 h-3 bg-green-400 rounded"></div>
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                </div>
                <span>Więcej</span>
              </div>
            </div>

            {/* Group Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-900">Ranking w grupie</h2>
                </div>
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">#{groupComparison.rank}</h3>
                  <p className="text-gray-600 mb-1">z {groupComparison.totalReservists} rezerwistów</p>
                  <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    {groupComparison.category}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Czas odpowiedzi</span>
                    <span className="text-sm font-bold text-gray-900">{groupComparison.performance.responseTime}s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Frekwencja</span>
                    <span className="text-sm font-bold text-gray-900">{groupComparison.performance.attendance}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Uczestnictwo</span>
                    <span className="text-sm font-bold text-gray-900">{groupComparison.performance.participation}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">Analiza predykcyjna</h2>
                </div>
                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Następne ćwiczenie</h4>
                    <p className="text-sm text-gray-600 mb-2">{predictiveData.nextExercise}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${predictiveData.probability}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-purple-600">{predictiveData.probability}%</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Poziom pewności</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${predictiveData.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{predictiveData.confidence}%</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Czynniki wpływające</h4>
                    <div className="space-y-1">
                      {predictiveData.factors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Trends */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <LineChart className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Trendy uczestnictwa</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Frekwencja (ostatnie 6 miesięcy)</h3>
                  <div className="space-y-3">
                    {attendanceTrends.map((trend, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-16 text-sm font-semibold text-gray-700">{trend.month}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${trend.attendance}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-sm font-bold text-gray-900">{trend.attendance}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Czas odpowiedzi (minuty)</h3>
                  <div className="space-y-3">
                    {attendanceTrends.map((trend, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-16 text-sm font-semibold text-gray-700">{trend.month}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${(5 - trend.responseTime) * 20}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-sm font-bold text-gray-900">{trend.responseTime}s</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Response Analytics */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Timer className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Analiza czasu odpowiedzi</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Timer className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Średni czas</h3>
                  <p className="text-2xl font-bold text-gray-900">{responseAnalytics.averageTime}s</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Rocket className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Najszybszy</h3>
                  <p className="text-2xl font-bold text-gray-900">{responseAnalytics.fastestTime}s</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Najwolniejszy</h3>
                  <p className="text-2xl font-bold text-gray-900">{responseAnalytics.slowestTime}s</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Trend</h3>
                  <p className="text-lg font-bold text-green-600 capitalize">{responseAnalytics.trend}</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Ranking czasów odpowiedzi</h4>
                    <p className="text-sm text-gray-600">Jesteś w top {responseAnalytics.rank} najszybszych rezerwistów</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">#{responseAnalytics.rank}</div>
                    <div className="text-sm text-gray-500">z 156 rezerwistów</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Demo Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Eye className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-900">Widoczność systemu</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <span className="text-sm font-semibold text-gray-700">Status online</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-bold text-green-600">Aktywny</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <span className="text-sm font-semibold text-gray-700">Ostatnia aktywność</span>
                    <span className="text-sm font-bold text-blue-600">2 minuty temu</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <span className="text-sm font-semibold text-gray-700">Czas sesji</span>
                    <span className="text-sm font-bold text-purple-600">2h 34m</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Medal className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-900">Osiągnięcia specjalne</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Elite Responder</h4>
                      <p className="text-sm text-gray-600">Odpowiadasz w ciągu 2 minut</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                    <Shield className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Perfect Attendance</h4>
                      <p className="text-sm text-gray-600">100% frekwencja w tym miesiącu</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                    <Rocket className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Speed Demon</h4>
                      <p className="text-sm text-gray-600">Najszybsza odpowiedź: 0.3s</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-8">
            {/* Advanced Charts Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Interaktywne wykresy</h2>
                <div className="ml-auto text-sm text-gray-500">Dane w czasie rzeczywistym</div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Unit Distribution Chart */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Rozkład jednostek</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">AR (Aktywna Rezerwa)</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">PR (Pasywna Rezerwa)</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">35%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '35%'}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">TAR (Techniczna AR)</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">20%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '20%'}}></div>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline Chart */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Aktywność w czasie</h3>
                  <div className="space-y-2">
                    {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map((time, index) => (
                      <div key={time} className="flex items-center space-x-3">
                        <div className="w-12 text-xs text-gray-500">{time}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-500 h-3 rounded-full transition-all duration-300"
                            style={{width: `${Math.random() * 100}%`}}
                          ></div>
                        </div>
                        <div className="w-8 text-xs text-gray-500">{Math.floor(Math.random() * 50)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Secure Chat System */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chat Messages */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-900">Szyfrowany czat</h2>
                    <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      <Key className="w-3 h-3" />
                      <span>End-to-End</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowChatModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Otwórz pełny czat
                  </button>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-800">
                        {message.sender.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">{message.sender}</span>
                          <span className="text-xs text-gray-500">{message.senderRank}</span>
                          <span className="text-xs text-gray-500">{message.senderUnit}</span>
                          {message.encrypted && <Lock className="w-3 h-3 text-green-600" />}
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-sm text-gray-700">{message.content}</p>
                          {message.invitation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center space-x-2 mb-2">
                                <Gamepad2 className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold text-blue-800">{message.invitation.title}</span>
                              </div>
                              <div className="text-xs text-blue-600 space-y-1">
                                <div>📅 {message.invitation.date}</div>
                                <div>📍 {message.invitation.location}</div>
                                <div>👥 {message.invitation.participants}/{message.invitation.maxParticipants} uczestników</div>
                              </div>
                              <div className="flex space-x-2 mt-3">
                                <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700">
                                  Dołączam!
                                </button>
                                <button className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300">
                                  Nie mogę
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Napisz wiadomość..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Friends & Connections */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Users2 className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900">Znajomi</h2>
                  </div>
                  <button 
                    onClick={() => setShowFriendsModal(true)}
                    className="text-sm text-purple-600 hover:text-purple-800 font-semibold"
                  >
                    Znajdź znajomych
                  </button>
                </div>
                
                <div className="space-y-3">
                  {reservists.slice(0, 4).map((reservist) => (
                    <div key={reservist.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                         onClick={() => setSelectedReservist(reservist)}>
                      <div className="relative">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-800">
                          {reservist.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          reservist.status === 'online' ? 'bg-green-500' :
                          reservist.status === 'busy' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{reservist.name}</span>
                          {reservist.isFriend && <Heart className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reservist.rank} • {reservist.unit}
                        </div>
                        <div className="text-xs text-gray-400">
                          {reservist.mutualFriends} wspólnych znajomych
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">Batalion transfer</h4>
                  <p className="text-sm text-gray-600 mb-3">Chcesz dołączyć do znajomych w innej jednostce?</p>
                  <button 
                    onClick={() => setShowTransferModal(true)}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-xl hover:bg-purple-700 transition-colors text-sm font-semibold"
                  >
                    Złóż wniosek
                  </button>
                </div>
              </div>
            </div>

            {/* Battalion Transfers */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <UserCog className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">Transfery batalionów</h2>
              </div>
              
              <div className="space-y-4">
                {battalionTransfers.map((transfer) => (
                  <div key={transfer.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{transfer.requestedBy}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{transfer.fromUnit} → {transfer.toUnit}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        transfer.status === 'approved' ? 'bg-green-100 text-green-800' :
                        transfer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transfer.status === 'approved' ? 'Zatwierdzony' :
                         transfer.status === 'rejected' ? 'Odrzucony' :
                         'Oczekuje'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{transfer.reason}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{transfer.createdAt.toLocaleDateString()}</span>
                      {transfer.approvedBy && <span>Zatwierdził: {transfer.approvedBy}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message detail modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMessage.title}</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getTypeColor(selectedMessage.type)}`}>
                    {selectedMessage.type}
                  </span>
                  {selectedMessage.required && (
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
                      Required
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="font-semibold text-gray-700">Od:</span>
                    <p className="text-gray-900">{selectedMessage.sender}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-700">Telefon:</span>
                      </div>
                      <p className="text-gray-900">{selectedMessage.phone}</p>
                    </div>
                  )}
                  {selectedMessage.place && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-700">Miejsce:</span>
                      </div>
                      <p className="text-gray-900">{selectedMessage.place}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-700">Data:</span>
                    </div>
                    <p className="text-gray-900">{new Date(selectedMessage.datetime).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Wiadomość:</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedMessage.body}</p>
                  </div>
                </div>
                
                {selectedMessage.attachments.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Załączniki:</h3>
                    <div className="space-y-2">
                      {selectedMessage.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                          <Paperclip className="w-4 h-4 mr-3 text-blue-600" />
                          <span className="text-blue-700 font-medium">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
                <button
                  onClick={() => handleRespond(selectedMessage.id, "acknowledged")}
                  className="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Potwierdź obecność
                </button>
                <button
                  onClick={() => handleRespond(selectedMessage.id, "declined")}
                  className="flex-1 bg-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Nie mogę uczestniczyć
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weather Modal */}
      {showWeatherModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edytuj warunki operacyjne</h2>
              <button onClick={() => setShowWeatherModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Temperatura (°C)</label>
                <input
                  type="number"
                  value={weatherInput.temperature}
                  onChange={(e) => setWeatherInput({...weatherInput, temperature: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Warunki</label>
                <select
                  value={weatherInput.condition}
                  onChange={(e) => setWeatherInput({...weatherInput, condition: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Słonecznie">Słonecznie</option>
                  <option value="Częściowo zachmurzone">Częściowo zachmurzone</option>
                  <option value="Zachmurzone">Zachmurzone</option>
                  <option value="Deszcz">Deszcz</option>
                  <option value="Mgła">Mgła</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Wiatr (km/h)</label>
                  <input
                    type="number"
                    value={weatherInput.windSpeed}
                    onChange={(e) => setWeatherInput({...weatherInput, windSpeed: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Widoczność (km)</label>
                  <input
                    type="number"
                    value={weatherInput.visibility}
                    onChange={(e) => setWeatherInput({...weatherInput, visibility: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setWeatherData({...weatherData, ...weatherInput});
                    setShowWeatherModal(false);
                    setToast("Warunki operacyjne zaktualizowane!");
                    setTimeout(() => setToast(""), 3000);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Zapisz zmiany
                </button>
                <button
                  onClick={() => setShowWeatherModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Status Modal */}
      {showGroupStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Status grupy</h2>
              <button onClick={() => setShowGroupStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nazwa grupy</label>
                <input
                  type="text"
                  value={groupData.name}
                  onChange={(e) => setGroupData({...groupData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Członkowie</label>
                  <input
                    type="number"
                    value={groupData.members}
                    onChange={(e) => setGroupData({...groupData, members: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Aktywni</label>
                  <input
                    type="number"
                    value={groupData.active}
                    onChange={(e) => setGroupData({...groupData, active: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={groupData.status}
                  onChange={(e) => setGroupData({...groupData, status: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Gotowa">Gotowa</option>
                  <option value="W trakcie">W trakcie</option>
                  <option value="Niedostępna">Niedostępna</option>
                  <option value="Ćwiczenia">Ćwiczenia</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowGroupStatusModal(false);
                    setToast("Status grupy zaktualizowany!");
                    setTimeout(() => setToast(""), 3000);
                  }}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors"
                >
                  Zapisz zmiany
                </button>
                <button
                  onClick={() => setShowGroupStatusModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal - READ-ONLY for Reservists */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Kalendarz ćwiczeń</h2>
              <button onClick={() => setShowCalendarModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6">
              {/* Upcoming Events */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nadchodzące wydarzenia</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Ćwiczenia</span>
                      <span className="text-sm text-gray-500">15 stycznia 2024</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Ćwiczenia taktyczne AR</h4>
                    <p className="text-sm text-gray-600 mb-2">Poligon wojskowy w Poznaniu</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>08:00 - 16:00</span>
                      <span>Grupa AR</span>
                      <span className="text-green-600 font-semibold">Potwierdzone</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Szkolenie</span>
                      <span className="text-sm text-gray-500">22 stycznia 2024</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Szkolenie z obsługi sprzętu</h4>
                    <p className="text-sm text-gray-600 mb-2">Centrum szkoleniowe WCR</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>09:00 - 15:00</span>
                      <span>Wszystkie grupy</span>
                      <span className="text-yellow-600 font-semibold">Oczekuje potwierdzenia</span>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Alarm</span>
                      <span className="text-sm text-gray-500">28 stycznia 2024</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Ćwiczenia alarmowe</h4>
                    <p className="text-sm text-gray-600 mb-2">Region Wielkopolski</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>06:00 - 18:00</span>
                      <span>AR + PR</span>
                      <span className="text-red-600 font-semibold">Pilne</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Szybkie akcje</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      setShowAttendanceModal(true);
                      setShowCalendarModal(false);
                    }}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    Potwierdź obecność
                  </button>
                  <button 
                    onClick={() => {
                      setToast("Kalendarz zsynchronizowany z urządzeniem!");
                      setTimeout(() => setToast(""), 3000);
                    }}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                  >
                    Synchronizuj
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="bg-gray-200 text-gray-800 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Zamknij kalendarz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edytuj profil</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Imię i nazwisko</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stopień</label>
                  <select
                    value={profileData.rank}
                    onChange={(e) => setProfileData({...profileData, rank: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Kapral">Kapral</option>
                    <option value="Starszy kapral">Starszy kapral</option>
                    <option value="Sierżant">Sierżant</option>
                    <option value="Starszy sierżant">Starszy sierżant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jednostka</label>
                  <select
                    value={profileData.unit}
                    onChange={(e) => setProfileData({...profileData, unit: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="AR">AR</option>
                    <option value="PR">PR</option>
                    <option value="TAR">TAR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setToast("Profil zaktualizowany!");
                    setTimeout(() => setToast(""), 3000);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Zapisz zmiany
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Potwierdź obecność</h2>
              <button onClick={() => setShowAttendanceModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Wydarzenie</label>
                <select
                  value={attendanceData.event}
                  onChange={(e) => setAttendanceData({...attendanceData, event: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Wybierz wydarzenie</option>
                  <option value="Ćwiczenia w Poznaniu">Ćwiczenia w Poznaniu</option>
                  <option value="Szkolenie AR">Szkolenie AR</option>
                  <option value="Spotkanie dowództwa">Spotkanie dowództwa</option>
                  <option value="Alarm ćwiczebny">Alarm ćwiczebny</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAttendanceData({...attendanceData, status: 'confirmed'})}
                    className={`p-3 rounded-xl border-2 transition-colors ${
                      attendanceData.status === 'confirmed' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-semibold">Potwierdzam</div>
                  </button>
                  <button
                    onClick={() => setAttendanceData({...attendanceData, status: 'declined'})}
                    className={`p-3 rounded-xl border-2 transition-colors ${
                      attendanceData.status === 'declined' 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <XCircle className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-semibold">Nie mogę</div>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notatki (opcjonalne)</label>
                <textarea
                  value={attendanceData.notes}
                  onChange={(e) => setAttendanceData({...attendanceData, notes: e.target.value})}
                  placeholder="Dodatkowe informacje..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAttendanceModal(false);
                    setToast("Obecność potwierdzona!");
                    setTimeout(() => setToast(""), 3000);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Zapisz odpowiedź
                </button>
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg z-50 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {toast}
        </div>
      )}
    </div>
  );
}
