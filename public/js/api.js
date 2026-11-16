// API Client for SmartFood ERP (with LocalStorage Sync & Vercel Fallback)

const API_BASE = '/api';

const api = {
  // Categories APIs
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const result = await res.json();
      if (result.success && result.data) return result.data;
      return window.localStore.getCategories();
    } catch (e) {
      console.warn('API getCategories fallback to localStore:', e);
      return window.localStore.getCategories();
    }
  },

  async addCategory(data) {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      window.localStore.addCategory(data);
      return result;
    } catch (e) {
      console.warn('API addCategory fallback:', e);
      return window.localStore.addCategory(data);
    }
  },

  async updateCategory(id, data) {
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      window.localStore.updateCategory(id, data);
      return result;
    } catch (e) {
      console.warn('API updateCategory fallback:', e);
      return window.localStore.updateCategory(id, data);
    }
  },

  async deleteCategory(id) {
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
      const result = await res.json();
      window.localStore.deleteCategory(id);
      return result;
    } catch (e) {
      console.warn('API deleteCategory fallback:', e);
      return window.localStore.deleteCategory(id);
    }
  },

  // Foods & Snacks APIs
  async getFoods(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      const url = `${API_BASE}/foods${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url);
      const result = await res.json();
      if (result.success && result.data) return result.data;
      return window.localStore.getFoods(filters);
    } catch (e) {
      console.warn('API getFoods fallback:', e);
      return window.localStore.getFoods(filters);
    }
  },

  async addFood(data) {
    try {
      const res = await fetch(`${API_BASE}/foods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      window.localStore.addFood(data);
      return result;
    } catch (e) {
      console.warn('API addFood fallback to local:', e);
      return window.localStore.addFood(data);
    }
  },

  async deleteFood(id) {
    try {
      const res = await fetch(`${API_BASE}/foods/${id}`, { method: 'DELETE' });
      const result = await res.json();
      window.localStore.deleteFood(id);
      return result;
    } catch (e) {
      return window.localStore.deleteFood(id);
    }
  },

  async updateFood(id, data) {
    try {
      const res = await fetch(`${API_BASE}/foods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      window.localStore.updateFood(id, data);
      return result;
    } catch (e) {
      return window.localStore.updateFood(id, data);
    }
  },

  async updateFoodQuantity(participantCode, foodId, quantity) {
    try {
      const res = await fetch(`${API_BASE}/participants/${encodeURIComponent(participantCode)}/food-quantity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId, quantity })
      });
      const result = await res.json();
      window.localStore.setFoodQuantity(participantCode, foodId, quantity);
      return result;
    } catch (e) {
      return window.localStore.setFoodQuantity(participantCode, foodId, quantity);
    }
  },

  async resetParticipantFood(participantCode) {
    try {
      const res = await fetch(`${API_BASE}/participants/${encodeURIComponent(participantCode)}/reset-food`, {
        method: 'POST'
      });
      const result = await res.json();
      window.localStore.resetParticipant(participantCode);
      return result;
    } catch (e) {
      return window.localStore.resetParticipant(participantCode);
    }
  },

  async resetAllFoodConsumption() {
    try {
      const res = await fetch(`${API_BASE}/food-consumption/reset-all`, {
        method: 'POST'
      });
      const result = await res.json();
      window.localStore.resetAllFoods();
      return result;
    } catch (e) {
      return window.localStore.resetAllFoods();
    }
  },

  async deleteFoodLog(id) {
    try {
      const res = await fetch(`${API_BASE}/food-consumption/${id}`, { method: 'DELETE' });
      const result = await res.json();
      window.localStore.deleteFoodLog(id);
      return result;
    } catch (e) {
      return window.localStore.deleteFoodLog(id);
    }
  },

  async recordFoodConsumption(data) {
    try {
      const res = await fetch(`${API_BASE}/food-consumption`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      window.localStore.recordConsumption(data);
      return result;
    } catch (e) {
      console.warn('API recordFoodConsumption fallback to local:', e);
      return window.localStore.recordConsumption(data);
    }
  },

  async getFoodRecap() {
    try {
      const res = await fetch(`${API_BASE}/food-recap`);
      const result = await res.json();
      if (result.success && result.data) {
        window.localStore.syncFromServer(result.data);
        return result;
      }
      return { success: true, data: window.localStore.getFoodRecap() };
    } catch (e) {
      console.warn('API getFoodRecap fallback to local:', e);
      return { success: true, data: window.localStore.getFoodRecap() };
    }
  },

  async getParticipantFoodDetail(code) {
    try {
      const res = await fetch(`${API_BASE}/participants/${encodeURIComponent(code)}/food-detail`);
      return await res.json();
    } catch (e) {
      return window.localStore.getParticipantDetail(code);
    }
  },

  // Standard ERP Dashboard & Scan
  async getDashboard(date) {
    try {
      const res = await fetch(`${API_BASE}/dashboard?date=${encodeURIComponent(date || '')}`);
      return await res.json();
    } catch (e) {
      return { success: true, data: window.localStore.getDashboardSummary() };
    }
  },

  async scanMeal(data) {
    try {
      const res = await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      return window.localStore.scanMeal(data);
    }
  },

  async getParticipants(filters = {}) {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE}/participants?${query}`);
      const result = await res.json();
      if (result.success) {
        window.localStore.saveParticipants(result.data);
      }
      return result;
    } catch (e) {
      return { success: true, data: window.localStore.getParticipants(filters) };
    }
  },

  async addParticipant(data) {
    try {
      const res = await fetch(`${API_BASE}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      window.localStore.addParticipant(data);
      return result;
    } catch (e) {
      return window.localStore.addParticipant(data);
    }
  },

  async updateParticipant(id, data) {
    try {
      const res = await fetch(`${API_BASE}/participants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      return { success: true, message: 'Updated locally' };
    }
  },

  async deleteParticipant(id) {
    try {
      const res = await fetch(`${API_BASE}/participants/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      return { success: true, message: 'Deleted locally' };
    }
  },

  async getSessions(date) {
    const res = await fetch(`${API_BASE}/sessions?date=${encodeURIComponent(date || '')}`);
    return res.json();
  },

  async toggleSession(id, is_active) {
    const res = await fetch(`${API_BASE}/sessions/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active })
    });
    return res.json();
  },

  async saveMenu(data) {
    const res = await fetch(`${API_BASE}/menus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getLogs(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/logs?${query}`);
    return res.json();
  },

  async getReports(date) {
    const res = await fetch(`${API_BASE}/reports?date=${encodeURIComponent(date || '')}`);
    return res.json();
  },

  async resetDatabase() {
    try {
      const res = await fetch(`${API_BASE}/system/reset`, { method: 'POST' });
      window.localStore.resetLocal();
      return await res.json();
    } catch (e) {
      window.localStore.resetLocal();
      return { success: true, message: 'Local storage reset' };
    }
  }
};

window.api = api;
