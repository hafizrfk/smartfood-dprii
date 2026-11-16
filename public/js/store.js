// LocalStorage Fallback & Offline/Vercel Persistence Engine for SmartFood ERP

const INITIAL_PARTICIPANTS = [
  { id: 1, participant_code: 'dprii-001', name: 'Hafiz', department: 'DPR II', category: 'Peserta', dietary_type: 'Reguler', allergies: 'Tidak ada', daily_quota: 5, status: 'active' },
  { id: 2, participant_code: 'dprii-002', name: 'Viko', department: 'DPR II', category: 'Peserta', dietary_type: 'Reguler', allergies: 'Tidak ada', daily_quota: 5, status: 'active' },
  { id: 3, participant_code: 'dprii-003', name: 'Tiyan', department: 'DPR II', category: 'Peserta', dietary_type: 'Reguler', allergies: 'Tidak ada', daily_quota: 5, status: 'active' },
  { id: 4, participant_code: 'dprii-004', name: 'Sarah', department: 'DPR II', category: 'Peserta', dietary_type: 'Reguler', allergies: 'Tidak ada', daily_quota: 5, status: 'active' },
  { id: 5, participant_code: 'dprii-005', name: 'Rizka', department: 'DPR II', category: 'Peserta', dietary_type: 'Reguler', allergies: 'Tidak ada', daily_quota: 5, status: 'active' },
  { id: 6, participant_code: 'dprii-006', name: 'Zahra', department: 'DPR II', category: 'Peserta', dietary_type: 'Reguler', allergies: 'Tidak ada', daily_quota: 5, status: 'active' }
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
    if (!localStorage.getItem('smartfood_food_logs')) {
      localStorage.setItem('smartfood_food_logs', JSON.stringify(INITIAL_LOGS));
    }
  }

  syncFromServer(serverData) {
    if (serverData && serverData.leaderboard) {
      // Keep local in sync with server if online
      localStorage.setItem('smartfood_server_synced', 'true');
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

  getFoods() {
    const foods = JSON.parse(localStorage.getItem('smartfood_foods') || '[]');
    const logs = JSON.parse(localStorage.getItem('smartfood_food_logs') || '[]');
    return foods.map(f => {
      const total = logs.filter(l => l.food_id === f.id).reduce((sum, l) => sum + (Number(l.quantity) || 1), 0);
      return { ...f, total_consumed: total };
    });
  }

  addFood(data) {
    const foods = JSON.parse(localStorage.getItem('smartfood_foods') || '[]');
    const newId = foods.length > 0 ? Math.max(...foods.map(f => f.id || 0)) + 1 : 1;
    const newF = {
      id: newId,
      name: data.name,
      category: data.category || 'Snack',
      unit: data.unit || 'pcs',
      icon: data.icon || '🍪',
      total_consumed: 0
    };
    foods.push(newF);
    localStorage.setItem('smartfood_foods', JSON.stringify(foods));
    return { success: true, message: `Makanan '${data.name}' berhasil ditambahkan!`, id: newId };
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

  resetLocal() {
    localStorage.setItem('smartfood_participants', JSON.stringify(INITIAL_PARTICIPANTS));
    localStorage.setItem('smartfood_foods', JSON.stringify(INITIAL_FOODS));
    localStorage.setItem('smartfood_food_logs', JSON.stringify(INITIAL_LOGS));
  }
}

window.localStore = new LocalStore();
