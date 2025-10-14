// Simple in-memory audit log store
// In a real application, this would be a database

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ip: string;
  userAgent: string;
}

class AuditStore {
  private logs: AuditLog[] = [];

  addLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const auditLog: AuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(auditLog);
    console.log('📝 Audit log added:', auditLog.id);
    
    return auditLog;
  }

  getLogsByUser(userId: string): AuditLog[] {
    return this.logs.filter(log => log.userId === userId);
  }

  getLogsByAction(action: string): AuditLog[] {
    return this.logs.filter(log => log.action === action);
  }

  getAllLogs(): AuditLog[] {
    return [...this.logs];
  }

  getLogById(id: string): AuditLog | undefined {
    return this.logs.find(log => log.id === id);
  }

  clearLogs(): void {
    this.logs = [];
    console.log('🗑️ All audit logs cleared');
  }
}

export const auditStore = new AuditStore();
