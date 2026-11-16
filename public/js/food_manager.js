// Food Management, Leaderboard (Klasemen) & Snack Recap Module for SmartFood ERP

let foodDonutChart = null;

const foodManagerModule = {
  currentRecap: null,
  foodsList: [],

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

        // Auto select first participant in dropdown (Juara 1: Hafiz)
        if (res.data.leaderboard && res.data.leaderboard.length > 0) {
          const detailSelect = document.getElementById('select-participant-detail');
          if (detailSelect && !detailSelect.value) {
            detailSelect.value = res.data.leaderboard[0].participant_code;
          }
          this.renderParticipantDetail(detailSelect?.value || res.data.leaderboard[0].participant_code);
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
              <span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                ${p.total_items_eaten} Makanan
              </span>
            </td>
            <td class="py-3 px-4 text-center text-xs text-gray-500 font-medium">
              ${p.total_eating_events || 0} Kali
            </td>
            <td class="py-3 px-4 text-right">
              <button onclick="foodManagerModule.viewParticipantDetail('${p.participant_code}')" class="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1 ml-auto">
                <i class="fa-solid fa-eye"></i> Detail
              </button>
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

          <div class="bg-white px-5 py-3 rounded-2xl border border-blue-200 shadow-xs text-left sm:text-right">
            <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Makanan Dimakan</div>
            <div class="text-3xl font-black text-emerald-600">${breakdown.total_eaten} <span class="text-sm font-bold text-gray-600">Porsi / Pcs</span></div>
          </div>
        </div>

        <!-- Rincian Apa Saja yang Dimakan -->
        <div>
          <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-1.5">
            <i class="fa-solid fa-cookie-bite text-amber-500"></i>
            Rincian Menu Makanan yang Dimakan oleh ${p.name}:
          </h4>

          ${items.length === 0 ? `
            <div class="text-sm text-gray-400 py-4 text-center">Belum ada makanan yang dicatat untuk peserta ini.</div>
          ` : `
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              ${items.map(item => `
                <div class="p-3.5 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                  <div class="text-2xl">${item.icon || '🍪'}</div>
                  <div>
                    <div class="font-black text-sm text-gray-900">${item.name}</div>
                    <div class="text-xs font-bold text-emerald-600">${item.quantity} ${item.unit || 'pcs'}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Riwayat Waktu Konsumsi -->
        ${history.length > 0 ? `
          <div class="pt-4 border-t border-blue-100">
            <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 mb-2.5">
              <i class="fa-solid fa-clock-rotate-left text-blue-500 mr-1"></i> Riwayat Konsumsi Terakhir:
            </h4>
            <div class="space-y-1.5">
              ${history.map(h => `
                <div class="flex items-center justify-between px-3 py-2 bg-white/80 rounded-xl border border-gray-100 text-xs">
                  <div class="flex items-center gap-2">
                    <span>${h.icon || '🍪'}</span>
                    <span class="font-bold text-gray-900">${h.food_name} (${h.quantity} ${h.unit || 'pcs'})</span>
                    <span class="text-gray-400">• ${h.notes || '-'}</span>
                  </div>
                  <span class="font-mono text-gray-500 font-bold">${h.timestamp.split(' ')[1] || h.timestamp}</span>
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
          backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#64748b'],
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
        
        // Confetti!
        if (typeof confetti === 'function') {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
        }

        // Reset qty & notes
        document.getElementById('quick-log-qty').value = '1';
        document.getElementById('quick-log-notes').value = '';

        // Reload data
        this.loadFoodData();
      } else {
        window.showToast(res.message || 'Gagal mencatat makanan', 'error');
      }
    } catch (err) {
      window.showToast('Gagal: ' + err.message, 'error');
    }
  },

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
