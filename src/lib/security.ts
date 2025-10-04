// Security audit logging for military communication system

interface SecurityEvent {
  id: string;
  timestamp: Date;
  eventType: 'login' | 'logout' | 'failed_login' | 'session_timeout' | 'password_change' | 'access_denied';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityAudit {
  private events: SecurityEvent[] = [];

  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      ...event
    };

    this.events.push(securityEvent);
    
    // In a real system, this would be sent to a secure logging service
    console.log('🔒 Security Event:', securityEvent);
    
    // Store in localStorage for demo purposes
    this.storeEvent(securityEvent);
  }

  private generateId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private storeEvent(event: SecurityEvent) {
    const stored = localStorage.getItem('security_audit_log');
    const events = stored ? JSON.parse(stored) : [];
    events.push(event);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('security_audit_log', JSON.stringify(events));
  }

  getEvents(): SecurityEvent[] {
    const stored = localStorage.getItem('security_audit_log');
    return stored ? JSON.parse(stored) : [];
  }

  getEventsBySeverity(severity: SecurityEvent['severity']): SecurityEvent[] {
    return this.getEvents().filter(event => event.severity === severity);
  }

  getRecentEvents(hours: number = 24): SecurityEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.getEvents().filter(event => new Date(event.timestamp) > cutoff);
  }

  // Security risk assessment
  assessRisk(): {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const recentEvents = this.getRecentEvents(24);
    const failedLogins = recentEvents.filter(e => e.eventType === 'failed_login').length;
    const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length;
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (failedLogins > 10) {
      issues.push(`Wysoka liczba nieudanych prób logowania: ${failedLogins}`);
      recommendations.push('Rozważ włączenie dodatkowego uwierzytelniania dwuskładnikowego');
      riskLevel = 'high';
    }

    if (criticalEvents > 0) {
      issues.push(`Krytyczne zdarzenia bezpieczeństwa: ${criticalEvents}`);
      recommendations.push('Natychmiastowe przeglądanie i odpowiedź na zdarzenia krytyczne');
      riskLevel = 'critical';
    }

    if (failedLogins > 5 && failedLogins <= 10) {
      issues.push(`Umiarkowana liczba nieudanych prób logowania: ${failedLogins}`);
      recommendations.push('Monitoruj dalsze próby nieautoryzowanego dostępu');
      riskLevel = 'medium';
    }

    return { riskLevel, issues, recommendations };
  }
}

export const securityAudit = new SecurityAudit();

// Helper functions for common security events
export const logLogin = (userId: string, ipAddress?: string) => {
  securityAudit.logEvent({
    eventType: 'login',
    userId,
    ipAddress,
    userAgent: navigator.userAgent,
    details: 'Successful user login',
    severity: 'low'
  });
};

export const logFailedLogin = (username: string, ipAddress?: string) => {
  securityAudit.logEvent({
    eventType: 'failed_login',
    userId: username,
    ipAddress,
    userAgent: navigator.userAgent,
    details: `Failed login attempt for user: ${username}`,
    severity: 'medium'
  });
};

export const logLogout = (userId: string) => {
  securityAudit.logEvent({
    eventType: 'logout',
    userId,
    details: 'User logout',
    severity: 'low'
  });
};

export const logSessionTimeout = (userId: string) => {
  securityAudit.logEvent({
    eventType: 'session_timeout',
    userId,
    details: 'Session expired due to inactivity',
    severity: 'medium'
  });
};

export const logAccessDenied = (userId: string, resource: string) => {
  securityAudit.logEvent({
    eventType: 'access_denied',
    userId,
    details: `Access denied to resource: ${resource}`,
    severity: 'high'
  });
};

