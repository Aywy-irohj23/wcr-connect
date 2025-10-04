import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createMessage, getAdminMessages } from "../lib/api";
import { clearToken } from "../lib/auth";
import { socket } from "../lib/socket";
import { Settings, LogOut, Send, History, Users, MapPin, Calendar, Link, Paperclip, CheckCircle, XCircle, Clock, TrendingUp, Activity, Shield, BarChart3, MessageCircle, Download, FileText, Eye, Target } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Dashboard from "../components/Dashboard";
import SearchBar from "../components/SearchBar";
import NotificationCenter from "../components/NotificationCenter";

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
  stats?: {
    total: number;
    acknowledged: number;
    declined: number;
  };
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  messagesSent: number;
  responseRate: number;
  systemUptime: number;
  lastActivity: Date;
}

interface UserActivity {
  id: string;
  name: string;
  rank: string;
  unit: string;
  lastLogin: Date;
  messagesReceived: number;
  responseRate: number;
  status: 'online' | 'offline' | 'away';
}

interface SystemAnalytics {
  messageVolume: { date: string; count: number }[];
  responseRates: { group: string; rate: number }[];
  userEngagement: { user: string; score: number }[];
  systemHealth: { metric: string; value: number; status: 'good' | 'warning' | 'critical' }[];
}

interface ReportData {
  id: string;
  title: string;
  type: 'attendance' | 'performance' | 'engagement' | 'system';
  generatedAt: Date;
  data: any;
  status: 'ready' | 'generating' | 'error';
}

export default function Admin() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'messages' | 'create' | 'analytics' | 'personnel' | 'community' | 'reports'>('dashboard');
  const [searchFilters, setSearchFilters] = useState<any>({});
  const navigate = useNavigate();

  // Enhanced Admin Features State
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 156,
    activeUsers: 89,
    messagesSent: 1247,
    responseRate: 87.3,
    systemUptime: 99.8,
    lastActivity: new Date()
  });

  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics>({
    messageVolume: [],
    responseRates: [],
    userEngagement: [],
    systemHealth: []
  });

  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  // Form state
  const [form, setForm] = useState({
    type: "Informacja",
    group: "all",
    additionalRecipients: "",
    title: "",
    sender: "WCR",
    phone: "",
    datetime: new Date(),
    place: "",
    body: "",
    links: "",
    attachments: "",
    required: false
  });

  useEffect(() => {
    loadMessages();
    
    // Socket listener for new messages
    socket.on("message:new", () => {
      loadMessages();
    });

    return () => {
      socket.off("message:new");
    };
  }, []);

  const loadMessages = async () => {
    try {
      const data = await getAdminMessages();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const messageData = {
        type: form.type,
        title: form.title,
        body: form.body,
        sender: form.sender,
        phone: form.phone,
        place: form.place,
        datetime: form.datetime instanceof Date ? form.datetime.toISOString() : new Date().toISOString(),
        attachments: form.attachments ? form.attachments.split(";").map(s => s.trim()).filter(Boolean) : [],
        target: {
          group: form.group,
          individuals: form.additionalRecipients ? form.additionalRecipients.split(",").map(s => s.trim()).filter(Boolean) : []
        },
        required: form.required
      };

      await createMessage(messageData);
      setToast("Message sent successfully!");
      setTimeout(() => setToast(""), 3000);
      
      // Reset form
      setForm({
        type: "Informacja",
        group: "all",
        additionalRecipients: "",
        title: "",
        sender: "WCR",
        phone: "",
        datetime: new Date(),
        place: "",
        body: "",
        links: "",
        attachments: "",
        required: false
      });
      
      loadMessages();
    } catch (error) {
      console.error("Failed to create message:", error);
      setToast("Failed to send message");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Ćwiczenia planowe": return "bg-green-100 text-green-800";
      case "Pilne wezwanie": return "bg-red-100 text-red-800";
      case "Informacja": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f1419' }}>
        {/* Header */}
        <div className="shadow-lg border-b" style={{ backgroundColor: '#2a3441', borderColor: '#6b7c8f' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="w-64 h-64 flex items-center justify-center">
                  <img 
                    src="/src/assets/51a0c983-862f-436f-9140-f8ef760dc1d2-removebg-preview.ico" 
                    alt="WCR Logo" 
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-6 h-6" style={{ color: '#6b7c8f' }} />
                  <h1 className="text-2xl font-bold" style={{ color: 'white', fontFamily: 'Titillium Web, sans-serif' }}>Panel administracyjny</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationCenter />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl transition-colors"
                  style={{ 
                    color: '#6b7c8f',
                    fontFamily: 'Cooper Hewitt, sans-serif'
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
                  <div className="flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Wyloguj</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: '#0f1419' }}>
        {/* INSANE Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-2 rounded-2xl" style={{ backgroundColor: '#2a3441' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'dashboard' 
                  ? 'shadow-lg' 
                  : ''
              }`}
              style={{
                backgroundColor: activeTab === 'dashboard' ? '#6b7c8f' : 'transparent',
                color: activeTab === 'dashboard' ? 'white' : '#8b9aab',
                fontFamily: 'Cooper Hewitt, sans-serif',
                border: activeTab === 'dashboard' ? '2px solid #5a6b7d' : '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'dashboard') {
                  e.currentTarget.style.backgroundColor = '#5a6b7d';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.border = '2px solid #6b7c8f';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'dashboard') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#8b9aab';
                  e.currentTarget.style.border = '2px solid transparent';
                }
              }}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'create' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Utwórz wiadomość</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'messages' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historia</span>
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
              onClick={() => setActiveTab('personnel')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'personnel' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Personel</span>
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
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'reports' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Raporty</span>
            </button>
          </div>
        </div>

        {/* INSANE Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <Dashboard />
          </div>
        )}

        {/* INSANE Search Bar */}
        {activeTab === 'messages' && (
          <div className="space-y-8">
            <SearchBar 
              onSearch={(filters) => setSearchFilters(filters)}
              onClear={() => setSearchFilters({})}
            />
          </div>
        )}

        {/* INSANE Create Message Tab */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Create Message Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center space-x-2 mb-8">
              <Send className="w-6 h-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">Utwórz nową wiadomość</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typ
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Informacja">Informacja</option>
                    <option value="Ćwiczenia planowe">Ćwiczenia planowe</option>
                    <option value="Pilne wezwanie">Pilne wezwanie</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grupa
                  </label>
                  <select
                    value={form.group}
                    onChange={(e) => setForm({...form, group: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="AR">Only AR</option>
                    <option value="PR">Only PR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Recipients (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.additionalRecipients}
                  onChange={(e) => setForm({...form, additionalRecipients: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user1, user2, user3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Message title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sender
                  </label>
                  <input
                    type="text"
                    value={form.sender}
                    onChange={(e) => setForm({...form, sender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Data i czas</span>
                    </div>
                  </label>
                  <DatePicker
                    selected={form.datetime}
                    onChange={(date) => setForm({...form, datetime: date || new Date()})}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholderText="Wybierz datę i czas"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Miejsce</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={form.place}
                    onChange={(e) => setForm({...form, place: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Lokalizacja spotkania"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <span>Treść wiadomości *</span>
                  </div>
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.body}
                  onChange={(e) => setForm({...form, body: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Wprowadź treść wiadomości"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Link className="w-4 h-4" />
                    <span>Linki (oddzielone średnikami)</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={form.links}
                  onChange={(e) => setForm({...form, links: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com; https://another.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4" />
                    <span>Załączniki (oddzielone średnikami)</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={form.attachments}
                  onChange={(e) => setForm({...form, attachments: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="dokument.pdf; obraz.jpg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={form.required}
                  onChange={(e) => setForm({...form, required: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
                  Wymagana obecność
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Wysyłanie...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Send className="w-5 h-5 mr-2" />
                    Wyślij wiadomość
                  </span>
                )}
              </button>
            </form>
          </div>

          </div>
        )}

        {/* INSANE Messages History Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-8">
            {/* Message History */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center space-x-2 mb-8">
              <History className="w-6 h-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">Historia wiadomości</h2>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(message.type)}`}>
                      {message.type}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">{message.title}</h3>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p><strong>Od:</strong> {message.sender}</p>
                    {message.place && <p><strong>Miejsce:</strong> {message.place}</p>}
                    <p><strong>Grupa docelowa:</strong> {message.target.group === "all" ? "Wszystkie grupy" : message.target.group}</p>
                  </div>
                  
                  {message.stats && (
                    <div className="flex space-x-4 text-sm">
                      <span className="flex items-center text-green-600 font-medium">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {message.stats.acknowledged} potwierdzonych
                      </span>
                      <span className="flex items-center text-red-600 font-medium">
                        <XCircle className="w-4 h-4 mr-1" />
                        {message.stats.declined} odrzuconych
                      </span>
                      <span className="flex items-center text-gray-600 font-medium">
                        <Clock className="w-4 h-4 mr-1" />
                        Łącznie: {message.stats.total}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Łącznie użytkowników</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aktywni użytkownicy</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats.activeUsers}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Wiadomości wysłane</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats.messagesSent}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Send className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Wskaźnik odpowiedzi</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats.responseRate}%</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Message Volume Chart */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Wolumen wiadomości</h2>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xs text-gray-500 mb-2">{['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'][i]}</div>
                    <div className="bg-gray-200 rounded h-24 flex items-end">
                      <div 
                        className="bg-blue-500 rounded w-full"
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{Math.floor(Math.random() * 50 + 10)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Rates by Group */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Wskaźniki odpowiedzi według grup</h2>
              </div>
              <div className="space-y-4">
                {['AR', 'PR', 'TAR', 'Wszystkie'].map((group, index) => (
                  <div key={group} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{group}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full"
                          style={{ width: `${Math.random() * 40 + 60}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {Math.floor(Math.random() * 40 + 60)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Personnel Analytics Tab */}
        {activeTab === 'personnel' && (
          <div className="space-y-8">
            {/* Personnel Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Łącznie żołnierzy</p>
                    <p className="text-3xl font-bold text-gray-900">156</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aktywni w treningach</p>
                    <p className="text-3xl font-bold text-gray-900">89</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nowe specjalizacje</p>
                    <p className="text-3xl font-bold text-gray-900">23</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Średni poziom</p>
                    <p className="text-3xl font-bold text-gray-900">Lvl 42</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Personnel Skills Matrix */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Macierz Umiejętności Żołnierzy</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personnel List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Żołnierze i ich umiejętności</h3>
                  {[
                    { name: 'Kapral Jan Kowalski', rank: 'Kapral', unit: '1. Batalion', skills: { shooting: 85, tactics: 78, leadership: 92, tech: 45 }, level: 47, xp: 2340, nextLevel: 2500 },
                    { name: 'Starszy Kapral Anna Nowak', rank: 'Starszy Kapral', unit: '2. Batalion', skills: { shooting: 92, tactics: 88, leadership: 95, tech: 78 }, level: 52, xp: 2890, nextLevel: 3000 },
                    { name: 'Kapral Piotr Wiśniewski', rank: 'Kapral', unit: '1. Batalion', skills: { shooting: 78, tactics: 82, leadership: 65, tech: 95 }, level: 45, xp: 2100, nextLevel: 2300 },
                    { name: 'Kapral Marcin Lewandowski', rank: 'Kapral', unit: '3. Batalion', skills: { shooting: 88, tactics: 85, leadership: 72, tech: 88 }, level: 49, xp: 2560, nextLevel: 2700 },
                    { name: 'Starszy Kapral Tomasz Zieliński', rank: 'Starszy Kapral', unit: '2. Batalion', skills: { shooting: 95, tactics: 92, leadership: 88, tech: 65 }, level: 55, xp: 3200, nextLevel: 3400 }
                  ].map((soldier, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{soldier.name}</h4>
                          <p className="text-sm text-gray-600">{soldier.rank} • {soldier.unit}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">Lvl {soldier.level}</div>
                          <div className="text-xs text-gray-500">{soldier.xp}/{soldier.nextLevel} XP</div>
                        </div>
                      </div>
                      
                      {/* XP Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(soldier.xp / soldier.nextLevel) * 100}%` }}
                        ></div>
                      </div>
                      
                      {/* Skills */}
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(soldier.skills).map(([skill, value]) => (
                          <div key={skill} className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 capitalize">{skill === 'tech' ? 'Technologia' : skill === 'tactics' ? 'Taktyka' : skill === 'leadership' ? 'Dowodzenie' : 'Strzelectwo'}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    value >= 90 ? 'bg-green-500' : 
                                    value >= 70 ? 'bg-blue-500' : 
                                    value >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${value}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-gray-700">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Recommendations */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Rekomendacje AI</h3>
                  
                  {/* Specialization Recommendations */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AI</span>
                      </div>
                      <h4 className="font-semibold text-purple-900">Specjalizacje rekomendowane</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">Operator Dronów</span>
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Wysokie dopasowanie</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">Piotr Wiśniewski - umiejętności techniczne: 95/100</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">95% dopasowania</span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">Dowódca Zespołu</span>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Średnie dopasowanie</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">Anna Nowak - umiejętności dowodzenia: 95/100</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '88%' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">88% dopasowania</span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">Snajper</span>
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">Niskie dopasowanie</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">Tomasz Zieliński - umiejętności strzeleckie: 95/100</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">75% dopasowania</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Training Recommendations */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AI</span>
                      </div>
                      <h4 className="font-semibold text-green-900">Rekomendacje treningowe</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <h5 className="font-medium text-gray-900 mb-1">Trening Technologii Wojskowej</h5>
                        <p className="text-xs text-gray-600 mb-2">Dla: Marcin Lewandowski, Piotr Wiśniewski</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Priorytet: Wysoki</span>
                          <span className="text-xs text-gray-500">Następny kurs: 15.02.2024</span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <h5 className="font-medium text-gray-900 mb-1">Kurs Dowodzenia</h5>
                        <p className="text-xs text-gray-600 mb-2">Dla: Jan Kowalski, Anna Nowak</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Priorytet: Średni</span>
                          <span className="text-xs text-gray-500">Następny kurs: 22.02.2024</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Career Path Suggestions */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AI</span>
                      </div>
                      <h4 className="font-semibold text-orange-900">Ścieżki kariery</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-orange-200">
                        <h5 className="font-medium text-gray-900 mb-1">Ścieżka: Specjalista Technologii</h5>
                        <p className="text-xs text-gray-600 mb-2">Piotr Wiśniewski → Operator Dronów → Specjalista Cyberbezpieczeństwa</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">Czas: 6-12 miesięcy</span>
                          <span className="text-xs text-gray-500">Potencjał: 95%</span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-orange-200">
                        <h5 className="font-medium text-gray-900 mb-1">Ścieżka: Dowódca</h5>
                        <p className="text-xs text-gray-600 mb-2">Anna Nowak → Dowódca Zespołu → Dowódca Plutonu</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Czas: 12-18 miesięcy</span>
                          <span className="text-xs text-gray-500">Potencjał: 88%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Analytics */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Analityka Treningów</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Training Performance */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Wydajność Treningów</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Strzelectwo', performance: 87, trend: 'up', change: '+5%' },
                      { name: 'Taktyka', performance: 82, trend: 'up', change: '+3%' },
                      { name: 'Technologia', performance: 76, trend: 'up', change: '+8%' },
                      { name: 'Dowodzenie', performance: 91, trend: 'stable', change: '0%' }
                    ].map((training, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{training.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                training.performance >= 90 ? 'bg-green-500' : 
                                training.performance >= 80 ? 'bg-blue-500' : 
                                training.performance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${training.performance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{training.performance}%</span>
                          <span className={`text-xs ${
                            training.trend === 'up' ? 'text-green-600' : 
                            training.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {training.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specialization Distribution */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Rozkład Specjalizacji</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Strzelec', count: 45, percentage: 28.8 },
                      { name: 'Operator Dronów', count: 23, percentage: 14.7 },
                      { name: 'Dowódca', count: 18, percentage: 11.5 },
                      { name: 'Specjalista IT', count: 15, percentage: 9.6 },
                      { name: 'Medyk', count: 12, percentage: 7.7 },
                      { name: 'Inne', count: 43, percentage: 27.6 }
                    ].map((spec, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{spec.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${spec.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{spec.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Achievements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ostatnie Osiągnięcia</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Mistrz Strzelania', user: 'Tomasz Zieliński', date: '2 dni temu', type: 'achievement' },
                      { name: 'Certyfikat Dronów', user: 'Piotr Wiśniewski', date: '5 dni temu', type: 'certification' },
                      { name: 'Kurs Dowodzenia', user: 'Anna Nowak', date: '1 tydzień temu', type: 'training' },
                      { name: 'Specjalista IT', user: 'Marcin Lewandowski', date: '2 tygodnie temu', type: 'specialization' }
                    ].map((achievement, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{achievement.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            achievement.type === 'achievement' ? 'bg-yellow-100 text-yellow-600' :
                            achievement.type === 'certification' ? 'bg-blue-100 text-blue-600' :
                            achievement.type === 'training' ? 'bg-green-100 text-green-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {achievement.type === 'achievement' ? 'Osiągnięcie' :
                             achievement.type === 'certification' ? 'Certyfikat' :
                             achievement.type === 'training' ? 'Trening' : 'Specjalizacja'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{achievement.user}</p>
                        <p className="text-xs text-gray-500">{achievement.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-8">
            {/* User Management */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Zarządzanie użytkownikami</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${
                        Math.random() > 0.5 ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Użytkownik {i + 1}</h3>
                        <p className="text-sm text-gray-600">Kapral • 1. Batalion</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Ostatnie logowanie: 2h temu</span>
                      <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                        <Eye className="w-3 h-3 inline mr-1" />
                        Zobacz
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Stan systemu</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dostępność systemu</span>
                    <span className="text-green-600 font-semibold">99.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Czas odpowiedzi</span>
                    <span className="text-green-600 font-semibold">120ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Aktywne sesje</span>
                    <span className="text-blue-600 font-semibold">89</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Wiadomości w kolejce</span>
                    <span className="text-yellow-600 font-semibold">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Błędy systemu</span>
                    <span className="text-red-600 font-semibold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ostatnia aktualizacja</span>
                    <span className="text-gray-600 font-semibold">2 min temu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            {/* Report Generation */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Generowanie raportów</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="bg-blue-500 text-white p-6 rounded-xl hover:bg-blue-600 transition-colors">
                  <div className="flex flex-col items-center space-y-3">
                    <Users className="w-8 h-8" />
                    <div className="text-center">
                      <h3 className="font-semibold">Raport frekwencji</h3>
                      <p className="text-sm opacity-90">Statystyki obecności</p>
                    </div>
                  </div>
                </button>
                
                <button className="bg-green-500 text-white p-6 rounded-xl hover:bg-green-600 transition-colors">
                  <div className="flex flex-col items-center space-y-3">
                    <TrendingUp className="w-8 h-8" />
                    <div className="text-center">
                      <h3 className="font-semibold">Raport wydajności</h3>
                      <p className="text-sm opacity-90">Analiza wyników</p>
                    </div>
                  </div>
                </button>
                
                <button className="bg-purple-500 text-white p-6 rounded-xl hover:bg-purple-600 transition-colors">
                  <div className="flex flex-col items-center space-y-3">
                    <MessageCircle className="w-8 h-8" />
                    <div className="text-center">
                      <h3 className="font-semibold">Raport komunikacji</h3>
                      <p className="text-sm opacity-90">Analiza wiadomości</p>
                    </div>
                  </div>
                </button>
                
                <button className="bg-orange-500 text-white p-6 rounded-xl hover:bg-orange-600 transition-colors">
                  <div className="flex flex-col items-center space-y-3">
                    <BarChart3 className="w-8 h-8" />
                    <div className="text-center">
                      <h3 className="font-semibold">Raport systemowy</h3>
                      <p className="text-sm opacity-90">Stan systemu</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <History className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Ostatnie raporty</h2>
              </div>
              
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Raport frekwencji - Styczeń 2024</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                        Gotowy
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Wygenerowany: {new Date().toLocaleDateString()}</p>
                    <div className="flex items-center space-x-2">
                      <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                        <Download className="w-3 h-3 inline mr-1" />
                        Pobierz PDF
                      </button>
                      <button className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600">
                        <Eye className="w-3 h-3 inline mr-1" />
                        Podgląd
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg z-50 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
