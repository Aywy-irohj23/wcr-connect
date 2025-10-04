import { useState, useEffect } from "react";
import { Users, MessageSquare, CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, Activity, Shield, Globe, Zap } from "lucide-react";
import { generateInsaneDemoData, insaneDataSimulator } from "../lib/demoData";

interface DashboardStats {
  totalMessages: number;
  pendingMessages: number;
  confirmedResponses: number;
  declinedResponses: number;
  activeUsers: number;
  urgentMessages: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    pendingMessages: 0,
    confirmedResponses: 0,
    declinedResponses: 0,
    activeUsers: 0,
    urgentMessages: 0
  });

  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // INSANE initial data load
    const timer = setTimeout(() => {
      const data = generateInsaneDemoData();
      setStats(data.stats);
      setLiveData(data);
      setLoading(false);
      setIsLive(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLive) {
      // INSANE real-time data updates
      insaneDataSimulator.start((data) => {
        setStats(data.stats);
        setLiveData(data);
      });
    }

    return () => {
      insaneDataSimulator.stop();
    };
  }, [isLive]);

  const statCards = [
    {
      title: "Wszystkie wiadomości",
      value: stats.totalMessages,
      icon: MessageSquare,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Oczekujące",
      value: stats.pendingMessages,
      icon: Clock,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Potwierdzone",
      value: stats.confirmedResponses,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Odrzucone",
      value: stats.declinedResponses,
      icon: XCircle,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Aktywni użytkownicy",
      value: stats.activeUsers,
      icon: Users,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Pilne wiadomości",
      value: stats.urgentMessages,
      icon: AlertTriangle,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-16 h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Przegląd systemu komunikacji wojskowej</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          <span>Ostatnia aktualizacja: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">jednostki</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-700">{stat.title}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className={`h-2 rounded-full ${stat.color} transition-all duration-500`}
                style={{ width: `${Math.min((stat.value / 200) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* INSANE Live Activity Feed */}
      {liveData && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Live Activity</h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">LIVE</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Ostatnia aktualizacja: {liveData.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {liveData.activities.map((activity: any, index: number) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'urgent' ? 'bg-red-500' :
                  activity.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{activity.user}</span>
                    <span>{activity.timestamp.toLocaleTimeString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activity.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      activity.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {activity.status === 'confirmed' ? 'Potwierdzono' :
                       activity.status === 'declined' ? 'Odrzucono' : 'Oczekuje'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INSANE Performance Metrics */}
      {liveData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Czas odpowiedzi</span>
                <span className="text-lg font-bold text-blue-600">{liveData.performance.responseTime}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Dostępność</span>
                <span className="text-lg font-bold text-green-600">{liveData.performance.uptime.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aktywne połączenia</span>
                <span className="text-lg font-bold text-purple-600">{liveData.performance.activeConnections}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Lokalizacje</h3>
            </div>
            <div className="space-y-3">
              {liveData.locations.map((location: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      location.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">{location.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {location.users} użytkowników
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Szybkie akcje</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 font-medium">Nowa wiadomość</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">Zarządzaj użytkownikami</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700 font-medium">Raport aktywności</span>
          </button>
        </div>
      </div>
    </div>
  );
}
