// LocalStorage Fallback & Offline/Vercel Persistence Engine for SmartFood ERP

const INITIAL_PARTICIPANTS = [
  { id: 1, participant_code: 'dprii-001', name: 'Hafiz', department: 'DPR II', category: 'Peserta', dietary_type: 'Reguler', allergies: 'Tidak ada', daily_quota: 5, status: 'active' },
  { id: 2, participant_code: 'dprii-002', name: 'Viko', department: 'DPR II', category: 'Peserta', dietary_type: 'Reguler', allergies: 'Tidak ada', daily_quota: 5, status: 'active' },
  { id: 3, participant_code: 'dprii-003', name: 'Tiyan', department: 'DPR II', category: 'Peserta', dietary_type: 'Reguler', allergies: 'Tidak ada', daily_quota: 5, status: 'active' },
  { id: 4, participant_code: 'dprii-004', name: 'Sarah', department: 'DPR II', category: 'Peserta', dietary_type: 'Reguler', allergies: 'Tidak ada', daily_quota: 5, status: 'active' },
  { id: 5, participant_code: 'dprii-005', name: 'Rizka', department: 'DPR II', category: 'Peserta', dietary_type: 'Reguler', allergies: 'Tidak ada', daily_quota: 5, status: 'active' },
  { id: 6, participant_code: 'dprii-006', name: 'Zahra', department: 'DPR II', category: 'Peserta', dietary_type: 'Reguler', allergies: 'Tidak ada', daily_quota: 5, status: 'active' }
];

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Snack Biskuit', icon: '🍪', description: 'Biskuit manis dan cookies renyah' },
  { id: 2, name: 'Snack Jagung', icon: '🌽', description: 'Snack ekstrudat rasa jagung bakar & keju' },
  { id: 3, name: 'Snack Gurih', icon: '🍝', description: 'Makaroni pedas, keripik & camilan asin' },
  { id: 4, name: 'Biskuit Manis', icon: '🍘', description: 'Malkist, crackers bertabur gula dan kelapa' },
  { id: 5, name: 'Cokelat Wafer', icon: '🍫', description: 'Wafer berlapis cokelat tebal & karamel' },
  { id: 6, name: 'Snack Keju', icon: '🧀', description: 'Snack bola keju & stick keju gurih' },
  { id: 7, name: 'Makanan Berat', icon: '🍱', description: 'Nasi kotak, bento, dan hidangan utama' },
  { id: 8, name: 'Minuman Segar', icon: '🧃', description: 'Kopi, teh kemasan, susu & air mineral' }
];

const INITIAL_FOODS = [
  { id: 1, name: 'Good Time', category: 'Snack Biskuit', unit: 'bungkus', icon: '🍪', total_consumed: 9 },
  { id: 2, name: 'Momogi', category: 'Snack Jagung', unit: 'pcs', icon: '🌽', total_consumed: 9 },
  { id: 3, name: 'Makaroni', category: 'Snack Gurih', unit: 'bungkus', icon: '🍝', total_consumed: 5 },
  { id: 4, name: 'Malkist Kelapa', category: 'Biskuit Manis', unit: 'bungkus', icon: '🍘', total_consumed: 5 },
  { id: 5, name: 'Beng-Beng', category: 'Cokelat Wafer', unit: 'pcs', icon: '🍫', total_consumed: 0 },
  { id: 6, name: 'Chiki Balls', category: 'Snack Keju', unit: 'bungkus', icon: '🧀', total_consumed: 0 }
];

const INITIAL_LOGS = [
  { id: 1, participant_code: 'dprii-001', participant_name: 'Hafiz', food_id: 1, food_name: 'Good Time', quantity: 3, timestamp: '14:00:10', notes: 'Camilan pagi & siang' },
  { id: 2, participant_code: 'dprii-001', participant_name: 'Hafiz', food_id: 2, food_name: 'Momogi', quantity: 2, timestamp: '14:05:00', notes: 'Teman ngobrol' },
  { id: 3, participant_code: 'dprii-001', participant_name: 'Hafiz', food_id: 3, food_name: 'Makaroni', quantity: 2, timestamp: '14:10:00', notes: 'Makaroni pedas' },
  { id: 4, participant_code: 'dprii-001', participant_name: 'Hafiz', food_id: 4, food_name: 'Malkist Kelapa', quantity: 1, timestamp: '14:15:00', notes: 'Camilan sore' },

  { id: 5, participant_code: 'dprii-002', participant_name: 'Viko', food_id: 2, food_name: 'Momogi', quantity: 3, timestamp: '14:02:00', notes: 'Momogi jagung bakar' },
  { id: 6, participant_code: 'dprii-002', participant_name: 'Viko', food_id: 1, food_name: 'Good Time', quantity: 2, timestamp: '14:12:00', notes: 'Good time choco' },
  { id: 7, participant_code: 'dprii-002', participant_name: 'Viko', food_id: 3, food_name: 'Makaroni', quantity: 1, timestamp: '14:20:00', notes: 'Makaroni gurih' },

  { id: 8, participant_code: 'dprii-003', participant_name: 'Tiyan', food_id: 4, food_name: 'Malkist Kelapa', quantity: 2, timestamp: '14:03:00', notes: 'Malkist manis' },
  { id: 9, participant_code: 'dprii-003', participant_name: 'Tiyan', food_id: 1, food_name: 'Good Time', quantity: 2, timestamp: '14:08:00', notes: 'Good time' },
  { id: 10, participant_code: 'dprii-003', participant_name: 'Tiyan', food_id: 2, food_name: 'Momogi', quantity: 1, timestamp: '14:16:00', notes: 'Snack momogi' },

  { id: 11, participant_code: 'dprii-004', participant_name: 'Sarah', food_id: 3, food_name: 'Makaroni', quantity: 2, timestamp: '14:04:00', notes: 'Makaroni pedas' },
  { id: 12, participant_code: 'dprii-004', participant_name: 'Sarah', food_id: 1, food_name: 'Good Time', quantity: 1, timestamp: '14:09:00', notes: 'Good time' },
  { id: 13, participant_code: 'dprii-004', participant_name: 'Sarah', food_id: 2, food_name: 'Momogi', quantity: 1, timestamp: '14:18:00', notes: 'Momogi' },

  { id: 14, participant_code: 'dprii-005', participant_name: 'Rizka', food_id: 2, food_name: 'Momogi', quantity: 2, timestamp: '14:06:00', notes: 'Momogi cokelat' },
  { id: 15, participant_code: 'dprii-005', participant_name: 'Rizka', food_id: 4, food_name: 'Malkist Kelapa', quantity: 1, timestamp: '14:14:00', notes: 'Malkist' },

  { id: 16, participant_code: 'dprii-006', participant_name: 'Zahra', food_id: 1, food_name: 'Good Time', quantity: 1, timestamp: '14:07:00', notes: 'Good time cookies' },
  { id: 17, participant_code: 'dprii-006', participant_name: 'Zahra', food_id: 4, food_name: 'Malkist Kelapa', quantity: 1, timestamp: '14:22:00', notes: 'Malkist kelapa' }
];

class LocalStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem('smartfood_participants')) {
      localStorage.setItem('smartfood_participants', JSON.stringify(INITIAL_PARTICIPANTS));
    }
    if (!localStorage.getItem('smartfood_foods')) {
      localStorage.setItem('smartfood_foods', JSON.stringify(INITIAL_FOODS));
    }
    if (!localStorage.getItem('smartfood_categories')) {
      localStorage.setItem('smartfood_categories', JSON.stringify(INITIAL_CATEGORIES));
    }
    // ⚠️ PENTING: Jangan pre-load INITIAL_LOGS hardcoded ke localStorage!
    // Data konsumsi makanan hanya boleh berasal dari server (SQLite).
    // localStorage logs hanya dipakai saat server offline.
    // Data akan di-sync dari server saat getFoodRecap() berhasil dipanggil.
    if (!localStorage.getItem('smartfood_food_logs')) {
      localStorage.setItem('smartfood_food_logs', JSON.stringify([]));
    }
  }

  syncFromServer(serverData) {
    if (!serverData) return;
    // Server is the single source of truth — overwrite local cache with server data
    localStorage.setItem('smartfood_server_synced', 'true');

    // Sync leaderboard / consumption data FROM server into local cache
    if (serverData.leaderboard) {
      // Build food_logs cache from server breakdown so offline reads are consistent
      const logsFromServer = [];
      let logId = 1;
      if (serverData.participants_breakdown) {
        for (const code of Object.keys(serverData.participants_breakdown)) {
          const bd = serverData.participants_breakdown[code];
          if (bd && bd.history) {
            for (const h of bd.history) {
              logsFromServer.push({
                id: h.id || logId++,
                participant_code: code,
                participant_name: bd.participant ? bd.participant.name : code,
                food_id: h.food_id || null,
                food_name: h.food_name,
                quantity: h.quantity,
                timestamp: h.timestamp,
                notes: h.notes || ''
              });
            }
          }
        }
      }
      // Replace local logs with server-authoritative data
      localStorage.setItem('smartfood_food_logs', JSON.stringify(logsFromServer));
    }

    if (serverData.food_stats) {
      // Sync food list (without overriding user-added foods in edge cases)
      const serverFoods = serverData.food_stats.map(f => ({
        id: f.id,
        name: f.name,
        category: f.category,
        unit: f.unit,
        icon: f.icon,
        total_consumed: f.total_eaten || 0
      }));
      localStorage.setItem('smartfood_foods', JSON.stringify(serverFoods));
    }
  }

  saveParticipants(list) {
    if (list && list.length) {
      localStorage.setItem('smartfood_participants', JSON.stringify(list));
    }
  }

  getParticipants(filters = {}) {
    let list = JSON.parse(localStorage.getItem('smartfood_participants') || '[]');
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(s) || p.participant_code.toLowerCase().includes(s));
    }
    return list;
  }

  addParticipant(data) {
    const list = this.getParticipants();
    const newId = list.length > 0 ? Math.max(...list.map(p => p.id || 0)) + 1 : 1;
    const newP = {
      id: newId,
      participant_code: data.participant_code,
      name: data.name,
      department: data.department || 'DPR II',
      category: data.category || 'Peserta',
      phone: data.phone || '',
      email: data.email || '',
      dietary_type: data.dietary_type || 'Reguler',
      allergies: data.allergies || 'Tidak ada',
      daily_quota: Number(data.daily_quota) || 5,
      status: 'active'
    };
    list.push(newP);
    localStorage.setItem('smartfood_participants', JSON.stringify(list));
    return { success: true, message: `Peserta '${data.name}' berhasil ditambahkan!`, id: newId };
  }

  // Category Methods
  getCategories() {
    const categories = JSON.parse(localStorage.getItem('smartfood_categories') || '[]');
    const foods = JSON.parse(localStorage.getItem('smartfood_foods') || '[]');
    return categories.map(c => {
      const count = foods.filter(f => (f.category || '').toLowerCase() === (c.name || '').toLowerCase()).length;
      return { ...c, food_count: count };
    });
  }

  addCategory(data) {
    const categories = JSON.parse(localStorage.getItem('smartfood_categories') || '[]');
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id || 0)) + 1 : 1;
    const newCat = {
      id: newId,
      name: data.name.trim(),
      icon: (data.icon || '🏷️').trim(),
      description: (data.description || '').trim()
    };
    categories.push(newCat);
    localStorage.setItem('smartfood_categories', JSON.stringify(categories));
    return { success: true, message: `Kategori '${data.name}' berhasil ditambahkan!`, id: newId };
  }

  updateCategory(id, data) {
    let categories = JSON.parse(localStorage.getItem('smartfood_categories') || '[]');
    let foods = JSON.parse(localStorage.getItem('smartfood_foods') || '[]');
    const idx = categories.findIndex(c => c.id === Number(id));
    if (idx !== -1) {
      const oldName = categories[idx].name;
      const newName = (data.name || oldName).trim();
      categories[idx] = {
        ...categories[idx],
        name: newName,
        icon: data.icon ? data.icon.trim() : categories[idx].icon,
        description: data.description !== undefined ? data.description.trim() : categories[idx].description
      };
      localStorage.setItem('smartfood_categories', JSON.stringify(categories));

      // Reassign foods if category name changed
      if (oldName !== newName) {
        foods = foods.map(f => (f.category || '').toLowerCase() === oldName.toLowerCase() ? { ...f, category: newName } : f);
        localStorage.setItem('smartfood_foods', JSON.stringify(foods));
      }
      return { success: true, message: `Kategori '${newName}' berhasil diperbarui!` };
    }
    return { success: false, message: 'Kategori tidak ditemukan' };
  }

  deleteCategory(id) {
    let categories = JSON.parse(localStorage.getItem('smartfood_categories') || '[]');
    const cat = categories.find(c => c.id === Number(id));
    if (cat) {
      categories = categories.filter(c => c.id !== Number(id));
      localStorage.setItem('smartfood_categories', JSON.stringify(categories));
      // Reassign foods to Snack
      let foods = JSON.parse(localStorage.getItem('smartfood_foods') || '[]');
      foods = foods.map(f => (f.category || '').toLowerCase() === cat.name.toLowerCase() ? { ...f, category: 'Snack' } : f);
      localStorage.setItem('smartfood_foods', JSON.stringify(foods));
      return { success: true, message: 'Kategori berhasil dihapus!' };
    }
    return { success: false, message: 'Kategori tidak ditemukan' };
  }

  getFoods(filters = {}) {
    let foods = JSON.parse(localStorage.getItem('smartfood_foods') || '[]');
    const logs = JSON.parse(localStorage.getItem('smartfood_food_logs') || '[]');
    let result = foods.map(f => {
      const total = logs.filter(l => l.food_id === f.id || l.food_name === f.name).reduce((sum, l) => sum + (Number(l.quantity) || 1), 0);
      return { ...f, total_consumed: total };
    });

    if (filters.category && filters.category !== 'all' && filters.category.trim()) {
      result = result.filter(f => (f.category || '').toLowerCase() === filters.category.trim().toLowerCase());
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(f => (f.name || '').toLowerCase().includes(q) || (f.category || '').toLowerCase().includes(q));
    }

    if (filters.sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'newest') {
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else {
      result.sort((a, b) => b.total_consumed - a.total_consumed);
    }

    return result;
  }

  addFood(data) {
    const foods = JSON.parse(localStorage.getItem('smartfood_foods') || '[]');
    const newId = foods.length > 0 ? Math.max(...foods.map(f => f.id || 0)) + 1 : 1;
    const newF = {
      id: newId,
      name: data.name.trim(),
      category: (data.category || 'Snack').trim(),
      unit: (data.unit || 'pcs').trim(),
      icon: (data.icon || '🍪').trim(),
      total_consumed: 0
    };
    foods.push(newF);
    localStorage.setItem('smartfood_foods', JSON.stringify(foods));
    return { success: true, message: `Makanan '${data.name}' berhasil ditambahkan!`, id: newId };
  }

  updateFood(id, data) {
    let foods = JSON.parse(localStorage.getItem('smartfood_foods') || '[]');
    const idx = foods.findIndex(f => f.id === Number(id));
    if (idx !== -1) {
      foods[idx] = {
        ...foods[idx],
        name: (data.name || foods[idx].name).trim(),
        category: (data.category || foods[idx].category).trim(),
        unit: (data.unit || foods[idx].unit).trim(),
        icon: (data.icon || foods[idx].icon).trim()
      };
      localStorage.setItem('smartfood_foods', JSON.stringify(foods));
      return { success: true, message: `Makanan '${foods[idx].name}' berhasil diperbarui!` };
    }
    return { success: false, message: 'Makanan tidak ditemukan' };
  }

  deleteFood(id) {
    let foods = JSON.parse(localStorage.getItem('smartfood_foods') || '[]');
    foods = foods.filter(f => f.id !== Number(id));
    localStorage.setItem('smartfood_foods', JSON.stringify(foods));
    return { success: true };
  }

  recordConsumption(data) {
    const participants = this.getParticipants();
    const p = participants.find(item => item.participant_code.toLowerCase() === data.participantCode.toLowerCase());
    const foods = this.getFoods();
    const f = foods.find(item => item.id === Number(data.foodId));

    if (!p) return { success: false, message: 'Peserta tidak ditemukan.' };
    if (!f) return { success: false, message: 'Makanan tidak valid.' };

    const logs = JSON.parse(localStorage.getItem('smartfood_food_logs') || '[]');
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newLog = {
      id: logs.length + 1,
      participant_id: p.id,
      participant_code: p.participant_code,
      participant_name: p.name,
      food_id: f.id,
      food_name: f.name,
      quantity: Number(data.quantity) || 1,
      timestamp: timeStr,
      notes: data.notes || `Makan ${data.quantity || 1} ${f.unit} ${f.name}`
    };

    logs.unshift(newLog);
    localStorage.setItem('smartfood_food_logs', JSON.stringify(logs));

    return {
      success: true,
      message: `Berhasil mencatat: ${p.name} makan ${data.quantity || 1} ${f.unit} ${f.name}!`,
      participant: p,
      food: f,
      quantity: data.quantity
    };
  }

  getFoodRecap() {
    const foods = this.getFoods();
    const participants = this.getParticipants();
    const logs = JSON.parse(localStorage.getItem('smartfood_food_logs') || '[]');

    // Food Stats
    const foodStats = foods.map(f => {
      const foodLogs = logs.filter(l => l.food_id === f.id || l.food_name === f.name);
      const total = foodLogs.reduce((sum, l) => sum + (Number(l.quantity) || 1), 0);
      const uniqueConsumers = new Set(foodLogs.map(l => l.participant_code)).size;
      return {
        ...f,
        total_eaten: total,
        total_consumers: uniqueConsumers
      };
    }).sort((a, b) => b.total_eaten - a.total_eaten);

    const totalFoodEaten = foodStats.reduce((acc, f) => acc + f.total_eaten, 0);

    // Leaderboard
    const leaderboard = participants.map(p => {
      const pLogs = logs.filter(l => l.participant_code === p.participant_code);
      const totalItems = pLogs.reduce((sum, l) => sum + (Number(l.quantity) || 1), 0);
      return {
        ...p,
        total_items_eaten: totalItems,
        total_eating_events: pLogs.length,
        last_eaten_time: pLogs.length > 0 ? pLogs[0].timestamp : '-'
      };
    }).sort((a, b) => b.total_items_eaten - a.total_items_eaten).map((p, idx) => {
      const rank = idx + 1;
      let badge = `${rank}`;
      if (rank === 1) badge = '🥇 Juara 1';
      else if (rank === 2) badge = '🥈 Juara 2';
      else if (rank === 3) badge = '🥉 Juara 3';
      return { rank, badge, ...p };
    });

    // Breakdown per participant
    const participantsBreakdown = {};
    for (const p of leaderboard) {
      const pLogs = logs.filter(l => l.participant_code === p.participant_code);
      const itemsMap = {};
      for (const log of pLogs) {
        if (!itemsMap[log.food_name]) {
          const f = foods.find(x => x.name === log.food_name) || { icon: '🍪', unit: 'pcs' };
          itemsMap[log.food_name] = {
            name: log.food_name,
            icon: f.icon || '🍪',
            unit: f.unit || 'pcs',
            quantity: 0
          };
        }
        itemsMap[log.food_name].quantity += Number(log.quantity) || 1;
      }

      participantsBreakdown[p.participant_code] = {
        participant: p,
        total_eaten: p.total_items_eaten,
        items: Object.values(itemsMap).sort((a, b) => b.quantity - a.quantity),
        history: pLogs.slice(0, 10)
      };
    }

    return {
      total_food_eaten: totalFoodEaten,
      food_stats: foodStats,
      leaderboard: leaderboard,
      participants_breakdown: participantsBreakdown,
      recent_snack_logs: logs.slice(0, 10)
    };
  }

  getParticipantDetail(code) {
    const recap = this.getFoodRecap();
    return { success: true, data: recap.participants_breakdown[code] };
  }

  resetParticipant(code) {
    let logs = JSON.parse(localStorage.getItem('smartfood_food_logs') || '[]');
    logs = logs.filter(l => l.participant_code.toLowerCase() !== code.toLowerCase());
    localStorage.setItem('smartfood_food_logs', JSON.stringify(logs));
    return { success: true, message: `Konsumsi makanan untuk peserta '${code}' berhasil dikembalikan ke 0!` };
  }

  resetAllFoods() {
    localStorage.setItem('smartfood_food_logs', JSON.stringify([]));
    return { success: true, message: 'Seluruh konsumsi peserta berhasil dikembalikan ke 0!' };
  }

  setFoodQuantity(code, foodId, targetQuantity) {
    const qty = Number(targetQuantity);
    const fid = Number(foodId);
    let logs = JSON.parse(localStorage.getItem('smartfood_food_logs') || '[]');
    const foods = this.getFoods();
    const f = foods.find(x => x.id === fid) || { name: 'Makanan', unit: 'pcs' };
    const participants = this.getParticipants();
    const p = participants.find(x => x.participant_code.toLowerCase() === code.toLowerCase()) || { name: code };

    // Remove old logs for this participant and food
    logs = logs.filter(l => !(l.participant_code.toLowerCase() === code.toLowerCase() && (l.food_id === fid || l.food_name === f.name)));

    if (qty > 0) {
      logs.unshift({
        id: Date.now(),
        participant_id: p.id,
        participant_code: code,
        participant_name: p.name,
        food_id: fid,
        food_name: f.name,
        quantity: qty,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        notes: `Koreksi: ${qty} ${f.unit || 'pcs'} ${f.name}`
      });
    }

    localStorage.setItem('smartfood_food_logs', JSON.stringify(logs));
    return {
      success: true,
      message: qty <= 0 
        ? `Konsumsi ${f.name} untuk ${p.name} berhasil dikembalikan ke 0!` 
        : `Konsumsi ${f.name} untuk ${p.name} berhasil diubah menjadi ${qty} ${f.unit || 'pcs'}!`
    };
  }

  deleteFoodLog(id) {
    let logs = JSON.parse(localStorage.getItem('smartfood_food_logs') || '[]');
    logs = logs.filter(l => l.id !== Number(id));
    localStorage.setItem('smartfood_food_logs', JSON.stringify(logs));
    return { success: true };
  }

  resetLocal() {
    // Reset hanya metadata lokal (participants, foods, categories) ke default awal.
    // Data konsumsi (food_logs) dikosongkan — akan di-sync ulang dari server saat reload.
    localStorage.setItem('smartfood_participants', JSON.stringify(INITIAL_PARTICIPANTS));
    localStorage.setItem('smartfood_foods', JSON.stringify(INITIAL_FOODS));
    localStorage.setItem('smartfood_food_logs', JSON.stringify([]));
    localStorage.removeItem('smartfood_server_synced');
  }
}

window.localStore = new LocalStore();
