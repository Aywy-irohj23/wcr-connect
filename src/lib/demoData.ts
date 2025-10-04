// INSANE Demo Data Generator for WCR Connect
// This creates mind-blowing demo data to impress viewers

export const generateInsaneDemoData = () => {
  const now = new Date();
  
  // INSANE Real-time Stats
  const stats = {
    totalMessages: Math.floor(Math.random() * 50) + 150,
    pendingMessages: Math.floor(Math.random() * 20) + 5,
    confirmedResponses: Math.floor(Math.random() * 200) + 300,
    declinedResponses: Math.floor(Math.random() * 30) + 10,
    activeUsers: Math.floor(Math.random() * 100) + 200,
    urgentMessages: Math.floor(Math.random() * 10) + 2
  };

  // INSANE Live Activity Feed
  const activities = [
    {
      id: 1,
      type: 'urgent',
      message: 'Pilne wezwanie dla grupy AR - ćwiczenia w Poznaniu',
      timestamp: new Date(now.getTime() - Math.random() * 300000),
      user: 'Jan Kowalski',
      status: 'confirmed'
    },
    {
      id: 2,
      type: 'info',
      message: 'Nowa wiadomość od WCR - aktualizacja procedur',
      timestamp: new Date(now.getTime() - Math.random() * 600000),
      user: 'Anna Nowak',
      status: 'pending'
    },
    {
      id: 3,
      type: 'training',
      message: 'Ćwiczenia planowe - potwierdzenie obecności',
      timestamp: new Date(now.getTime() - Math.random() * 900000),
      user: 'Piotr Wiśniewski',
      status: 'declined'
    },
    {
      id: 4,
      type: 'urgent',
      message: 'Pilne wezwanie - ćwiczenia w Warszawie',
      timestamp: new Date(now.getTime() - Math.random() * 1200000),
      user: 'Michał Kowalczyk',
      status: 'confirmed'
    }
  ];

  // INSANE Security Events
  const securityEvents = [
    {
      id: 1,
      type: 'login',
      message: 'Udane logowanie - admin',
      timestamp: new Date(now.getTime() - Math.random() * 1800000),
      severity: 'low'
    },
    {
      id: 2,
      type: 'failed_login',
      message: 'Nieudana próba logowania - IP: 192.168.1.100',
      timestamp: new Date(now.getTime() - Math.random() * 2400000),
      severity: 'medium'
    },
    {
      id: 3,
      type: 'session_timeout',
      message: 'Sesja wygasła - użytkownik nieaktywny',
      timestamp: new Date(now.getTime() - Math.random() * 3000000),
      severity: 'medium'
    }
  ];

  // INSANE Performance Metrics
  const performance = {
    responseTime: Math.floor(Math.random() * 50) + 25, // ms
    uptime: 99.9 + Math.random() * 0.1,
    activeConnections: Math.floor(Math.random() * 50) + 100,
    dataTransferred: Math.floor(Math.random() * 1000) + 500 // MB
  };

  // INSANE Geographic Data
  const locations = [
    { name: 'Warszawa', users: 45, messages: 23, status: 'active' },
    { name: 'Kraków', users: 32, messages: 18, status: 'active' },
    { name: 'Gdańsk', users: 28, messages: 15, status: 'active' },
    { name: 'Poznań', users: 25, messages: 12, status: 'warning' },
    { name: 'Wrocław', users: 22, messages: 8, status: 'active' }
  ];

  // INSANE Message Types Distribution
  const messageTypes = [
    { type: 'Informacja', count: 45, percentage: 35 },
    { type: 'Ćwiczenia planowe', count: 32, percentage: 25 },
    { type: 'Pilne wezwanie', count: 28, percentage: 22 },
    { type: 'Aktualizacja', count: 23, percentage: 18 }
  ];

  return {
    stats,
    activities,
    securityEvents,
    performance,
    locations,
    messageTypes,
    lastUpdated: now
  };
};

// INSANE Real-time Data Simulator
export class InsaneDataSimulator {
  private interval: NodeJS.Timeout | null = null;
  private callbacks: ((data: any) => void)[] = [];

  start(callback: (data: any) => void) {
    this.callbacks.push(callback);
    
    if (!this.interval) {
      this.interval = setInterval(() => {
        const data = generateInsaneDemoData();
        this.callbacks.forEach(cb => cb(data));
      }, 2000); // Update every 2 seconds for INSANE real-time effect
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.callbacks = [];
  }
}

export const insaneDataSimulator = new InsaneDataSimulator();

