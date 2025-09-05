const API_BASE = 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      return { data };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async login(email: string, password: string, role: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  }

  async signup(userData: any) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async getPatients() {
    return this.request('/patients');
  }

  async getPatientSchedule(patientId: string) {
    return this.request(`/patients/${patientId}/schedule`);
  }

  async getPatientSessions(patientId: string) {
    return this.request(`/patients/${patientId}/sessions`);
  }

  async submitSessionFeedback(patientId: string, sessionId: string, feedback: any) {
    return this.request(`/patients/${patientId}/sessions/${sessionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  async getRegimens() {
    return this.request('/regimens');
  }

  async createRegimen(regimen: any) {
    return this.request('/regimens', {
      method: 'POST',
      body: JSON.stringify(regimen),
    });
  }

  async assignRegimen(regimenId: string, patientId: string, startDate: string) {
    return this.request(`/regimens/${regimenId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ patientId, startDate }),
    });
  }

  async getTodaysSessions() {
    return this.request('/sessions/today');
  }

  async getSessionDetails(sessionId: string) {
    return this.request(`/sessions/${sessionId}`);
  }

  async completeSession(sessionId: string, data: any) {
    return this.request(`/sessions/${sessionId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPatientAnalytics(patientId: string) {
    return this.request(`/analytics/patient/${patientId}`);
  }

  async getCenterAnalytics() {
    return this.request('/analytics/center');
  }
}

export default new ApiClient();