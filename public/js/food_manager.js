// Food Management, Leaderboard (Klasemen) & Snack Recap Module for SmartFood ERP

let foodDonutChart = null;

const foodManagerModule = {
  currentRecap: null,
  foodsList: [],
  activeEditCode: null,

  init() {
    this.bindEvents();
    this.loadFoodData();
  },

  bindEvents() {
    // Quick food log form
    const logForm = document.getElementById('quick-food-log-form');
    if (logForm) {
      logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitFoodConsumption();
      });
    }

    // Add food form
    const addFoodForm = document.getElementById('add-food-form');
    if (addFoodForm) {
      addFoodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveNewFood();
      });
    }

    // Detail dropdown change
    const detailSelect = document.getElementById('select-participant-detail');
    if (detailSelect) {
      detailSelect.addEventListener('change', (e) => {
        this.renderParticipantDetail(e.target.value);
      });
    }
  },

  async loadFoodData() {
    try {
      const res = await window.api.getFoodRecap();
      if (res.success && res.data) {
        this.currentRecap = res.data;
        this.foodsList = res.data.food_stats || [];

        this.renderLeaderboard(res.data.leaderboard);
        this.renderFoodStats(res.data.food_stats, res.data.total_food_eaten);
        this.populateDropdowns(res.data.leaderboard, res.data.food_stats);
        this.renderChart(res.data.food_stats);

        // Auto select first participant in dropdown (Juara 1)
        if (res.data.leaderboard && res.data.leaderboard.length > 0) {
          const detailSelect = document.getElementById('select-participant-detail');
          const selected = detailSelect?.value || res.data.leaderboard[0].participant_code;
          if (detailSelect) detailSelect.value = selected;
          this.renderParticipantDetail(selected);
        }
      }
    } catch (err) {
      console.error('Error loading food data:', err);
    }
  },

  populateDropdowns(leaderboard, foods) {
    // Dropdown in Quick Log form
    const logPSelect = document.getElementById('quick-log-participant');
    if (logPSelect) {
      const currentVal = logPSelect.value;
      logPSelect.innerHTML = '<option value="">-- Pilih Peserta --</option>';
      leaderboard.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.participant_code;
        opt.textContent = `${p.participant_code} - ${p.name}`;
        logPSelect.appendChild(opt);
      });
      if (currentVal) logPSelect.value = currentVal;
    }

    // Dropdown food items in Quick Log form
    const logFSelect = document.getElementById('quick-log-food');
    if (logFSelect) {
      const currentVal = logFSelect.value;
      logFSelect.innerHTML = '<option value="">-- Pilih Jenis Makanan --</option>';
      foods.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = `${f.icon || '🍪'} ${f.name} (${f.category || 'Snack'})`;
        logFSelect.appendChild(opt);
      });
      if (currentVal) logFSelect.value = currentVal;
    }

    // Dropdown for Detail Breakdown
    const detailSelect = document.getElementById('select-participant-detail');
    if (detailSelect) {
      const currentVal = detailSelect.value;
      detailSelect.innerHTML = '<option value="">-- Pilih Peserta untuk Melihat Rincian --</option>';
      leaderboard.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.participant_code;
        opt.textContent = `${p.badge} : ${p.name} (${p.participant_code}) - Total: ${p.total_items_eaten} Makanan`;
        detailSelect.appendChild(opt);
      });
      if (currentVal) detailSelect.value = currentVal;
    }
  },

  renderLeaderboard(leaderboard) {
    // 1. Top 3 Podium
    const podiumContainer = document.getElementById('podium-cards-container');
    if (podiumContainer && leaderboard.length >= 3) {
      const rank1 = leaderboard[0];
      const rank2 = leaderboard[1];
      const rank3 = leaderboard[2];

      podiumContainer.innerHTML = `
        <!-- Rank 2: Silver -->
        <div class="glass-panel p-4 rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center text-center shadow-md relative order-2 md:order-1 pt-6">
          <div class="absolute -top-3.5 px-3 py-0.5 rounded-full bg-slate-200 border border-slate-400 text-xs font-black text-slate-800 shadow-xs">
            🥈 JUARA 2
          </div>
          <div class="w-14 h-14 rounded-2xl bg-slate-300 text-slate-700 flex items-center justify-center text-2xl font-black mb-2 shadow-inner">
            ${rank2.name.substring(0, 2).toUpperCase()}
          </div>
          <div class="font-black text-base text-gray-900">${rank2.name}</div>
          <div class="text-[11px] font-mono text-gray-500 font-bold">${rank2.participant_code}</div>
          <div class="mt-3 px-3 py-1 bg-white rounded-xl border border-slate-200 shadow-xs text-xs font-black text-slate-700">
            Total: <span class="text-base text-blue-600">${rank2.total_items_eaten}</span> Makanan
          </div>
          <button onclick="foodManagerModule.openEditParticipantModal('${rank2.participant_code}')" class="mt-2 text-[11px] font-bold text-amber-700 hover:underline">
            <i class="fa-solid fa-pen-to-square"></i> Koreksi Makanan
          </button>
        </div>

        <!-- Rank 1: Gold Champion -->
        <div class="glass-panel p-5 rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-yellow-100/60 flex flex-col items-center text-center shadow-xl relative order-1 md:order-2 transform md:-translate-y-2 pt-7">
          <div class="absolute -top-4 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 text-xs font-black uppercase tracking-wider shadow-md animate-bounce">
            🥇 TOP EATER #1
          </div>
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center text-3xl font-black mb-2 shadow-lg shadow-amber-200">
            ${rank1.name.substring(0, 2).toUpperCase()}
          </div>
          <div class="font-black text-lg text-gray-900">${rank1.name}</div>
          <div class="text-xs font-mono text-amber-800 font-bold">${rank1.participant_code}</div>
          <div class="mt-3 px-4 py-1.5 bg-white rounded-xl border border-amber-300 shadow-xs text-xs font-black text-amber-900">
            Total: <span class="text-lg text-emerald-600 font-black">${rank1.total_items_eaten}</span> Makanan
          </div>
          <button onclick="foodManagerModule.openEditParticipantModal('${rank1.participant_code}')" class="mt-2 text-[11px] font-bold text-amber-800 hover:underline">
            <i class="fa-solid fa-pen-to-square"></i> Koreksi Makanan
          </button>
        </div>

        <!-- Rank 3: Bronze -->
        <div class="glass-panel p-4 rounded-2xl border-2 border-amber-600/30 bg-gradient-to-b from-orange-50 to-amber-100/40 flex flex-col items-center text-center shadow-md relative order-3 pt-6">
          <div class="absolute -top-3.5 px-3 py-0.5 rounded-full bg-amber-200 border border-amber-400 text-xs font-black text-amber-900 shadow-xs">
            🥉 JUARA 3
          </div>
          <div class="w-14 h-14 rounded-2xl bg-amber-200 text-amber-800 flex items-center justify-center text-2xl font-black mb-2 shadow-inner">
            ${rank3.name.substring(0, 2).toUpperCase()}
          </div>
          <div class="font-black text-base text-gray-900">${rank3.name}</div>
          <div class="text-[11px] font-mono text-gray-500 font-bold">${rank3.participant_code}</div>
          <div class="mt-3 px-3 py-1 bg-white rounded-xl border border-amber-200 shadow-xs text-xs font-black text-amber-900">
            Total: <span class="text-base text-blue-600">${rank3.total_items_eaten}</span> Makanan
          </div>
          <button onclick="foodManagerModule.openEditParticipantModal('${rank3.participant_code}')" class="mt-2 text-[11px] font-bold text-amber-700 hover:underline">
            <i class="fa-solid fa-pen-to-square"></i> Koreksi Makanan
          </button>
        </div>
      `;
    }

    // 2. Full Leaderboard Table
    const tbody = document.getElementById('leaderboard-tbody');
    if (tbody) {
      tbody.innerHTML = leaderboard.map(p => {
        let medalBadge = '';
        if (p.rank === 1) medalBadge = '<span class="px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">🥇 1</span>';
        else if (p.rank === 2) medalBadge = '<span class="px-2 py-0.5 rounded-full text-xs font-black bg-slate-200 text-slate-800 border border-slate-300">🥈 2</span>';
        else if (p.rank === 3) medalBadge = '<span class="px-2 py-0.5 rounded-full text-xs font-black bg-orange-100 text-orange-900 border border-orange-300">🥉 3</span>';
        else medalBadge = `<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 font-mono">${p.rank}</span>`;

        return `
          <tr class="border-b border-gray-100 hover:bg-slate-50 transition-all text-sm">
            <td class="py-3 px-4 text-center">${medalBadge}</td>
            <td class="py-3 px-4 font-mono font-bold text-xs text-gray-600">${p.participant_code}</td>
            <td class="py-3 px-4 font-black text-gray-900 flex items-center gap-2">
              <span class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                ${p.name.substring(0, 1)}
              </span>
              <span>${p.name}</span>
            </td>
            <td class="py-3 px-4 text-center">
              <span class="px-3 py-1 rounded-full text-xs font-black ${p.total_items_eaten > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-500'}">
                ${p.total_items_eaten} Makanan
              </span>
            </td>
            <td class="py-3 px-4 text-center text-xs text-gray-500 font-medium">
              ${p.total_eating_events || 0} Kali
            </td>
            <td class="py-3 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="foodManagerModule.viewParticipantDetail('${p.participant_code}')" title="Lihat Rincian" class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1">
                  <i class="fa-solid fa-eye"></i> Detail
                </button>
                <button onclick="foodManagerModule.openEditParticipantModal('${p.participant_code}')" title="Edit / Koreksi Makanan" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-lg border border-amber-200 transition-all flex items-center gap-1">
                  <i class="fa-solid fa-pen-to-square"></i> Koreksi
                </button>
                <button onclick="foodManagerModule.resetParticipantAllFoods('${p.participant_code}', '${p.name}')" title="Kembalikan ke 0" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition-all flex items-center gap-1">
                  <i class="fa-solid fa-rotate-left"></i> Set 0
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  },

  renderFoodStats(foodStats, totalAll) {
    const container = document.getElementById('food-stats-grid');
    if (!container) return;

    container.innerHTML = foodStats.map(f => {
      const pct = totalAll > 0 ? Math.round((f.total_eaten / totalAll) * 100) : 0;
      return `
        <div class="glass-panel p-4 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shadow-xs">
                ${f.icon || '🍪'}
              </div>
              <div>
                <h4 class="font-black text-base text-gray-900">${f.name}</h4>
                <span class="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">${f.category || 'Snack'}</span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-2xl font-black text-emerald-600">${f.total_eaten}</span>
              <span class="text-[11px] text-gray-500 block">${f.unit || 'pcs'}</span>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-gray-100">
            <div class="flex items-center justify-between text-xs text-gray-500 font-bold mb-1">
              <span>Konsumen: ${f.total_consumers || 0} Orang</span>
              <span>${pct}% Total</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div class="bg-emerald-500 h-2 rounded-full" style="width: ${pct}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderParticipantDetail(participantCode) {
    const container = document.getElementById('participant-food-breakdown');
    if (!container || !this.currentRecap) return;

    const breakdown = this.currentRecap.participants_breakdown[participantCode];
    if (!breakdown) {
      container.innerHTML = '<div class="text-sm text-gray-400 p-6 text-center">Silakan pilih peserta di atas untuk melihat apa saja makanan yang dia makan.</div>';
      return;
    }

    const p = breakdown.participant;
    const items = breakdown.items || [];
    const history = breakdown.history || [];

    container.innerHTML = `
      <div class="glass-panel p-6 rounded-2xl border-2 border-blue-200 bg-blue-50/30 shadow-md space-y-6">
        
        <!-- Header Profil Peserta & Total -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-blue-100">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-md shadow-blue-200">
              ${p.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xl font-black text-gray-900">${p.name}</h3>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
                  ${p.badge}
                </span>
              </div>
              <div class="text-xs text-gray-500 font-mono font-bold mt-0.5">${p.participant_code} • Divisi: ${p.department}</div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="bg-white px-5 py-3 rounded-2xl border border-blue-200 shadow-xs text-left sm:text-right">
              <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Makanan Dimakan</div>
              <div class="text-3xl font-black text-emerald-600">${breakdown.total_eaten} <span class="text-sm font-bold text-gray-600">Porsi / Pcs</span></div>
            </div>
            
            <button onclick="foodManagerModule.openEditParticipantModal('${p.participant_code}')" class="px-3.5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow transition-all flex flex-col items-center gap-1">
              <i class="fa-solid fa-sliders text-base"></i>
              <span>Koreksi</span>
            </button>
          </div>
        </div>

        <!-- Rincian Menu yang Dimakan dengan Kontrol Cepat -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <i class="fa-solid fa-cookie-bite text-amber-500"></i>
              Rincian Makanan yang Dimakan oleh ${p.name}:
            </h4>
            <span class="text-[11px] text-gray-500">Gunakan tombol + / - / Set 0 untuk mengoreksi</span>
          </div>

          ${items.length === 0 ? `
            <div class="p-6 bg-white rounded-2xl border border-dashed border-gray-200 text-center text-sm text-gray-400">
              <i class="fa-solid fa-bowl-rice text-2xl mb-1 block"></i>
              Belum ada makanan yang dicatat untuk ${p.name}. (Total: 0)
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              ${items.map(item => `
                <div class="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <span class="text-2xl">${item.icon || '🍪'}</span>
                      <div>
                        <div class="font-black text-sm text-gray-900">${item.name}</div>
                        <div class="text-xs font-bold text-emerald-600">${item.quantity} ${item.unit || 'pcs'}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Quick Action Buttons: [-] [+] and [Set 0] -->
                  <div class="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-1 text-xs">
                    <div class="flex items-center gap-1">
                      <button onclick="foodManagerModule.adjustFoodQuantity('${p.participant_code}', ${item.id}, ${item.quantity - 1})" class="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center transition-all" title="Kurangi 1">
                        -
                      </button>
                      <button onclick="foodManagerModule.adjustFoodQuantity('${p.participant_code}', ${item.id}, ${item.quantity + 1})" class="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-black flex items-center justify-center transition-all" title="Tambah 1">
                        +
                      </button>
                    </div>

                    <button onclick="foodManagerModule.adjustFoodQuantity('${p.participant_code}', ${item.id}, 0)" class="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition-all flex items-center gap-1" title="Kembalikan snack ini ke 0">
                      <i class="fa-solid fa-rotate-left"></i> Set 0
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Tombol Aksi Bahaya: Reset Total Peserta Ini ke 0 -->
        <div class="pt-4 border-t border-blue-100 flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-gray-500">
            Ingin mengosongkan seluruh catatan konsumsi ${p.name}?
          </div>
          <div class="flex items-center gap-2">
            <button onclick="foodManagerModule.resetParticipantAllFoods('${p.participant_code}', '${p.name}')" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5">
              <i class="fa-solid fa-trash-can"></i> Kembalikan Semua Makanan ${p.name} ke 0
            </button>
          </div>
        </div>

        <!-- Riwayat Waktu Konsumsi -->
        ${history.length > 0 ? `
          <div class="pt-2">
            <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 mb-2.5">
              <i class="fa-solid fa-clock-rotate-left text-blue-500 mr-1"></i> Log Riwayat Pengambilan Makanan Terakhir:
            </h4>
            <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              ${history.map(h => `
                <div class="flex items-center justify-between px-3 py-2 bg-white/90 rounded-xl border border-gray-100 text-xs">
                  <div class="flex items-center gap-2">
                    <span>${h.icon || '🍪'}</span>
                    <span class="font-bold text-gray-900">${h.food_name} (${h.quantity} ${h.unit || 'pcs'})</span>
                    <span class="text-gray-400">• ${h.notes || '-'}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-gray-500 font-bold">${h.timestamp.split(' ')[1] || h.timestamp}</span>
                    <button onclick="foodManagerModule.deleteConsumptionLog(${h.id})" class="text-rose-500 hover:text-rose-700 p-1" title="Hapus catatan ini">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;
  },

  viewParticipantDetail(code) {
    const detailSelect = document.getElementById('select-participant-detail');
    if (detailSelect) {
      detailSelect.value = code;
      detailSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.renderParticipantDetail(code);
    }
  },

  renderChart(foodStats) {
    const ctx = document.getElementById('chart-food-recap-donut')?.getContext('2d');
    if (!ctx) return;

    if (foodDonutChart) foodDonutChart.destroy();

    const labels = foodStats.map(f => f.name);
    const data = foodStats.map(f => f.total_eaten);

    foodDonutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#64748b', '#14b8a6'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        },
        cutout: '65%'
      }
    });
  },

  async submitFoodConsumption() {
    const pCode = document.getElementById('quick-log-participant')?.value;
    const foodId = document.getElementById('quick-log-food')?.value;
    const quantity = document.getElementById('quick-log-qty')?.value;
    const notes = document.getElementById('quick-log-notes')?.value;

    if (!pCode || !foodId) {
      window.showToast('Silakan pilih peserta dan jenis makanan!', 'warning');
      return;
    }

    try {
      const res = await window.api.recordFoodConsumption({
        participantCode: pCode,
        foodId: Number(foodId),
        quantity: Number(quantity) || 1,
        notes: notes || ''
      });

      if (res.success) {
        window.soundFx.playSuccess();
        window.showToast(res.message, 'success');
        
        if (typeof confetti === 'function') {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
        }

        document.getElementById('quick-log-qty').value = '1';
        document.getElementById('quick-log-notes').value = '';

        this.loadFoodData();
      } else {
        window.showToast(res.message || 'Gagal mencatat makanan', 'error');
      }
    } catch (err) {
      window.showToast('Gagal: ' + err.message, 'error');
    }
  },

  // -------------------------------------------------------------
  // CRUD & Reset Operations (Kembalikan ke 0 / Koreksi Makanan)
  // -------------------------------------------------------------

  async adjustFoodQuantity(participantCode, foodId, newQuantity) {
    const qty = Math.max(0, Number(newQuantity));
    try {
      const res = await window.api.updateFoodQuantity(participantCode, foodId, qty);
      if (res.success) {
        window.showToast(res.message || 'Berhasil mengupdate jumlah makanan!', 'success');
        this.loadFoodData();
      } else {
        window.showToast(res.message || 'Gagal mengubah jumlah', 'error');
      }
    } catch (e) {
      window.showToast('Error: ' + e.message, 'error');
    }
  },

  async resetParticipantAllFoods(participantCode, name) {
    if (!confirm(`Apakah Anda yakin ingin MENGEMBALIKAN SEMUA MAKANAN ${name} (${participantCode}) KE 0? Seluruh riwayat makanan peserta ini akan dikosongkan.`)) {
      return;
    }

    try {
      const res = await window.api.resetParticipantFood(participantCode);
      if (res.success) {
        window.showToast(res.message, 'info');
        this.loadFoodData();
      } else {
        window.showToast(res.message || 'Gagal me-reset makanan', 'error');
      }
    } catch (e) {
      window.showToast('Error: ' + e.message, 'error');
    }
  },

  async resetAllParticipantsLeaderboard() {
    if (!confirm('PERINGATAN: Apakah Anda yakin ingin MENGEMBALIKAN KE 0 KONSUMSI SEMUA PESERTA? Klasemen akan dimulai dari awal (0).')) {
      return;
    }

    try {
      const res = await window.api.resetAllFoodConsumption();
      if (res.success) {
        window.showToast(res.message, 'success');
        this.loadFoodData();
      } else {
        window.showToast('Gagal me-reset klasemen', 'error');
      }
    } catch (e) {
      window.showToast('Error: ' + e.message, 'error');
    }
  },

  async deleteConsumptionLog(id) {
    if (!confirm('Hapus entri catatan makanan ini?')) return;
    try {
      const res = await window.api.deleteFoodLog(id);
      if (res.success) {
        window.showToast('Catatan berhasil dihapus!', 'info');
        this.loadFoodData();
      }
    } catch (e) {
      window.showToast('Gagal: ' + e.message, 'error');
    }
  },

  // Modal Koreksi Lengkap per Peserta
  openEditParticipantModal(participantCode) {
    if (!this.currentRecap) return;
    const breakdown = this.currentRecap.participants_breakdown[participantCode];
    if (!breakdown) return;

    this.activeEditCode = participantCode;
    const modal = document.getElementById('edit-participant-food-modal');
    const pName = document.getElementById('edit-modal-participant-name');
    const pCode = document.getElementById('edit-modal-participant-code');
    const container = document.getElementById('edit-modal-foods-list');

    if (pName) pName.textContent = breakdown.participant.name;
    if (pCode) pCode.textContent = breakdown.participant.participant_code;

    // Render each food item with direct number input
    if (container) {
      const allFoods = this.foodsList;
      const currentItemsMap = {};
      (breakdown.items || []).forEach(it => { currentItemsMap[it.id] = it.quantity; });

      container.innerHTML = allFoods.map(f => {
        const currentQty = currentItemsMap[f.id] || 0;
        return `
          <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-gray-200">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">${f.icon || '🍪'}</span>
              <div>
                <div class="font-black text-sm text-gray-900">${f.name}</div>
                <div class="text-[11px] text-gray-500">${f.category || 'Snack'} (${f.unit || 'pcs'})</div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <input type="number" id="input-edit-food-${f.id}" value="${currentQty}" min="0" max="999" class="w-20 text-center font-black text-sm px-2 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none">
              <button type="button" onclick="document.getElementById('input-edit-food-${f.id}').value = 0" class="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-lg transition-all" title="Ubah langsung ke 0">
                Set 0
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    if (modal) modal.classList.remove('hidden');
  },

  closeEditParticipantModal() {
    const modal = document.getElementById('edit-participant-food-modal');
    if (modal) modal.classList.add('hidden');
    this.activeEditCode = null;
  },

  setAllModalInputsToZero() {
    this.foodsList.forEach(f => {
      const input = document.getElementById(`input-edit-food-${f.id}`);
      if (input) input.value = 0;
    });
  },

  async saveParticipantFoodModalChanges() {
    if (!this.activeEditCode) return;
    const code = this.activeEditCode;

    try {
      for (const f of this.foodsList) {
        const input = document.getElementById(`input-edit-food-${f.id}`);
        if (input) {
          const qty = Number(input.value) || 0;
          await window.api.updateFoodQuantity(code, f.id, qty);
        }
      }

      window.showToast(`Konsumsi makanan untuk peserta '${code}' berhasil diperbarui!`, 'success');
      this.closeEditParticipantModal();
      this.loadFoodData();
    } catch (err) {
      window.showToast('Gagal menyimpan koreksi: ' + err.message, 'error');
    }
  },

  // Modal Tambah Makanan Baru
  openAddFoodModal() {
    const modal = document.getElementById('add-food-modal');
    if (modal) modal.classList.remove('hidden');
  },

  closeAddFoodModal() {
    const modal = document.getElementById('add-food-modal');
    if (modal) modal.classList.add('hidden');
  },

  async saveNewFood() {
    const name = document.getElementById('food-name-input')?.value;
    const category = document.getElementById('food-cat-input')?.value;
    const unit = document.getElementById('food-unit-input')?.value;
    const icon = document.getElementById('food-icon-input')?.value;

    if (!name || !name.trim()) {
      window.showToast('Nama makanan wajib diisi!', 'warning');
      return;
    }

    try {
      const res = await window.api.addFood({ name, category, unit, icon });
      if (res.success) {
        window.showToast(res.message || `Makanan '${name}' berhasil ditambahkan!`, 'success');
        this.closeAddFoodModal();
        this.loadFoodData();
      } else {
        window.showToast(res.error || 'Gagal menambahkan makanan', 'error');
      }
    } catch (err) {
      window.showToast('Gagal: ' + err.message, 'error');
    }
  }
};

window.foodManagerModule = foodManagerModule;
