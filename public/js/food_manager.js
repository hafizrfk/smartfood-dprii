// Food Management, Leaderboard (Klasemen) & Snack Recap Module for SmartFood ERP (Dark Mode)

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

        // Auto select first participant in dropdown
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
    // 1. Top 3 Podium (3D Cyber Dark Theme)
    const podiumContainer = document.getElementById('podium-cards-container');
    if (podiumContainer && leaderboard.length >= 3) {
      const rank1 = leaderboard[0];
      const rank2 = leaderboard[1];
      const rank3 = leaderboard[2];

      podiumContainer.innerHTML = `
        <!-- Rank 2: Silver -->
        <div class="podium-silver p-5 rounded-3xl flex flex-col items-center text-center relative order-2 md:order-1 pt-7 backdrop-blur-xl">
          <div class="absolute -top-3.5 px-3.5 py-0.5 rounded-full bg-slate-800 border border-slate-500 text-xs font-black text-slate-200 shadow-md">
            🥈 JUARA 2
          </div>
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-500 text-white flex items-center justify-center text-2xl font-black mb-2 shadow-lg shadow-slate-900/50 border border-slate-400/30">
            ${rank2.name.substring(0, 2).toUpperCase()}
          </div>
          <div class="font-black text-lg text-white">${rank2.name}</div>
          <div class="text-xs font-mono text-slate-400 font-bold">${rank2.participant_code}</div>
          <div class="mt-3 px-3.5 py-1.5 bg-slate-900/80 rounded-xl border border-slate-700/60 shadow-inner text-xs font-black text-slate-300">
            Total: <span class="text-base text-sky-400 font-black">${rank2.total_items_eaten}</span> Makanan
          </div>
          <button onclick="foodManagerModule.openEditParticipantModal('${rank2.participant_code}')" class="mt-2.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-all flex items-center gap-1">
            <i class="fa-solid fa-pen-to-square"></i> Koreksi
          </button>
        </div>

        <!-- Rank 1: Gold Champion -->
        <div class="podium-gold p-6 rounded-3xl flex flex-col items-center text-center relative order-1 md:order-2 transform md:-translate-y-3 pt-8 backdrop-blur-xl">
          <div class="absolute -top-4 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/30 animate-pulse">
            🥇 TOP EATER #1
          </div>
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center text-3xl font-black mb-2 shadow-xl shadow-amber-500/25 border-2 border-yellow-200">
            ${rank1.name.substring(0, 2).toUpperCase()}
          </div>
          <div class="font-black text-xl text-white tracking-wide">${rank1.name}</div>
          <div class="text-xs font-mono text-amber-300/80 font-bold">${rank1.participant_code}</div>
          <div class="mt-3 px-4 py-1.5 bg-slate-950/80 rounded-xl border border-amber-500/40 shadow-inner text-xs font-black text-amber-200">
            Total: <span class="text-xl text-emerald-400 font-black">${rank1.total_items_eaten}</span> Makanan
          </div>
          <button onclick="foodManagerModule.openEditParticipantModal('${rank1.participant_code}')" class="mt-2.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-all flex items-center gap-1">
            <i class="fa-solid fa-pen-to-square"></i> Koreksi
          </button>
        </div>

        <!-- Rank 3: Bronze -->
        <div class="podium-bronze p-5 rounded-3xl flex flex-col items-center text-center relative order-3 pt-7 backdrop-blur-xl">
          <div class="absolute -top-3.5 px-3.5 py-0.5 rounded-full bg-orange-950 border border-orange-500 text-xs font-black text-orange-200 shadow-md">
            🥉 JUARA 3
          </div>
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-800 to-orange-600 text-white flex items-center justify-center text-2xl font-black mb-2 shadow-lg shadow-orange-950/50 border border-orange-400/30">
            ${rank3.name.substring(0, 2).toUpperCase()}
          </div>
          <div class="font-black text-lg text-white">${rank3.name}</div>
          <div class="text-xs font-mono text-orange-300/80 font-bold">${rank3.participant_code}</div>
          <div class="mt-3 px-3.5 py-1.5 bg-slate-900/80 rounded-xl border border-orange-600/50 shadow-inner text-xs font-black text-orange-200">
            Total: <span class="text-base text-orange-400 font-black">${rank3.total_items_eaten}</span> Makanan
          </div>
          <button onclick="foodManagerModule.openEditParticipantModal('${rank3.participant_code}')" class="mt-2.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-all flex items-center gap-1">
            <i class="fa-solid fa-pen-to-square"></i> Koreksi
          </button>
        </div>
      `;
    }

    // 2. Full Leaderboard Table (Dark Cyber Style)
    const tbody = document.getElementById('leaderboard-tbody');
    if (tbody) {
      tbody.innerHTML = leaderboard.map(p => {
        let medalBadge = '';
        if (p.rank === 1) medalBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">🥇 1</span>';
        else if (p.rank === 2) medalBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-black bg-slate-500/20 text-slate-300 border border-slate-400/40">🥈 2</span>';
        else if (p.rank === 3) medalBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-black bg-orange-500/20 text-orange-300 border border-orange-500/40">🥉 3</span>';
        else medalBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 font-mono border border-slate-700">${p.rank}</span>`;

        return `
          <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 transition-all text-sm">
            <td class="py-3.5 px-4 text-center">${medalBadge}</td>
            <td class="py-3.5 px-4 font-mono font-bold text-xs text-sky-400">${p.participant_code}</td>
            <td class="py-3.5 px-4 font-black text-white flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center text-xs font-black border border-slate-700">
                ${p.name.substring(0, 1)}
              </span>
              <span>${p.name}</span>
            </td>
            <td class="py-3.5 px-4 text-center">
              <span class="px-3 py-1 rounded-full text-xs font-black ${p.total_items_eaten > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500 border border-slate-700'}">
                ${p.total_items_eaten} Makanan
              </span>
            </td>
            <td class="py-3.5 px-4 text-center text-xs text-slate-400 font-medium">
              ${p.total_eating_events || 0} Kali
            </td>
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="foodManagerModule.viewParticipantDetail('${p.participant_code}')" title="Lihat Rincian" class="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-xs rounded-lg transition-all flex items-center gap-1">
                  <i class="fa-solid fa-eye"></i> Detail
                </button>
                <button onclick="foodManagerModule.openEditParticipantModal('${p.participant_code}')" title="Edit / Koreksi Makanan" class="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-lg transition-all flex items-center gap-1">
                  <i class="fa-solid fa-pen-to-square"></i> Koreksi
                </button>
                <button onclick="foodManagerModule.resetParticipantAllFoods('${p.participant_code}', '${p.name}')" title="Kembalikan ke 0" class="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-lg transition-all flex items-center gap-1">
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
        <div class="glass-panel p-4 rounded-2xl border border-slate-800/80 shadow-lg flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-2xl shadow-inner">
                ${f.icon || '🍪'}
              </div>
              <div>
                <h4 class="font-black text-base text-white">${f.name}</h4>
                <span class="text-[11px] font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/50 px-2 py-0.5 rounded">${f.category || 'Snack'}</span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-2xl font-black text-emerald-400">${f.total_eaten}</span>
              <span class="text-[11px] text-slate-400 block">${f.unit || 'pcs'}</span>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800/80">
            <div class="flex items-center justify-between text-xs text-slate-400 font-bold mb-1.5">
              <span>Konsumen: <b class="text-white">${f.total_consumers || 0}</b> Orang</span>
              <span class="text-emerald-400">${pct}% Total</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
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
      container.innerHTML = '<div class="text-sm text-slate-400 p-6 text-center">Silakan pilih peserta di atas untuk melihat apa saja makanan yang dia makan.</div>';
      return;
    }

    const p = breakdown.participant;
    const items = breakdown.items || [];
    const history = breakdown.history || [];

    container.innerHTML = `
      <div class="glass-panel p-6 rounded-3xl border border-sky-500/30 bg-slate-900/80 shadow-2xl space-y-6">
        
        <!-- Header Profil Peserta & Total -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-sky-500/20 border border-sky-400/30">
              ${p.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2.5">
                <h3 class="text-2xl font-black text-white">${p.name}</h3>
                <span class="px-3 py-0.5 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  ${p.badge}
                </span>
              </div>
              <div class="text-xs text-slate-400 font-mono font-bold mt-1">ID: <span class="text-sky-400">${p.participant_code}</span> • Divisi: ${p.department}</div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800 shadow-inner text-left sm:text-right">
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Makanan Dimakan</div>
              <div class="text-3xl font-black text-emerald-400">${breakdown.total_eaten} <span class="text-sm font-bold text-slate-400">Porsi / Pcs</span></div>
            </div>
            
            <button onclick="foodManagerModule.openEditParticipantModal('${p.participant_code}')" class="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex flex-col items-center gap-1 active:scale-95">
              <i class="fa-solid fa-sliders text-base"></i>
              <span>Koreksi</span>
            </button>
          </div>
        </div>

        <!-- Rincian Menu yang Dimakan dengan Kontrol Cepat -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <i class="fa-solid fa-cookie-bite text-amber-400 text-sm"></i>
              Rincian Makanan yang Dimakan oleh ${p.name}:
            </h4>
            <span class="text-[11px] text-slate-400">Gunakan tombol + / - / Set 0 untuk mengoreksi</span>
          </div>

          ${items.length === 0 ? `
            <div class="p-8 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 text-center text-sm text-slate-400">
              <i class="fa-solid fa-bowl-rice text-3xl mb-2 text-slate-600 block"></i>
              Belum ada makanan yang dicatat untuk ${p.name}. (Total: 0)
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              ${items.map(item => `
                <div class="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/90 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <span class="text-2xl">${item.icon || '🍪'}</span>
                      <div>
                        <div class="font-black text-sm text-white">${item.name}</div>
                        <div class="text-xs font-bold text-emerald-400">${item.quantity} ${item.unit || 'pcs'}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Quick Action Buttons: [-] [+] and [Set 0] -->
                  <div class="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-1 text-xs">
                    <div class="flex items-center gap-1">
                      <button onclick="foodManagerModule.adjustFoodQuantity('${p.participant_code}', ${item.id}, ${item.quantity - 1})" class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-black flex items-center justify-center transition-all" title="Kurangi 1">
                        -
                      </button>
                      <button onclick="foodManagerModule.adjustFoodQuantity('${p.participant_code}', ${item.id}, ${item.quantity + 1})" class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-black flex items-center justify-center transition-all" title="Tambah 1">
                        +
                      </button>
                    </div>

                    <button onclick="foodManagerModule.adjustFoodQuantity('${p.participant_code}', ${item.id}, 0)" class="px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[11px] border border-rose-500/30 transition-all flex items-center gap-1" title="Kembalikan snack ini ke 0">
                      <i class="fa-solid fa-rotate-left"></i> Set 0
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Tombol Aksi: Reset Total Peserta Ini ke 0 -->
        <div class="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-slate-400">
            Ingin mengosongkan seluruh catatan konsumsi ${p.name}?
          </div>
          <div class="flex items-center gap-2">
            <button onclick="foodManagerModule.resetParticipantAllFoods('${p.participant_code}', '${p.name}')" class="px-4 py-2 bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 transition-all flex items-center gap-1.5 active:scale-95">
              <i class="fa-solid fa-trash-can"></i> Kembalikan Semua Makanan ${p.name} ke 0
            </button>
          </div>
        </div>

        <!-- Riwayat Waktu Konsumsi -->
        ${history.length > 0 ? `
          <div class="pt-2">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 mb-2.5">
              <i class="fa-solid fa-clock-rotate-left text-sky-400 mr-1"></i> Log Riwayat Pengambilan Makanan Terakhir:
            </h4>
            <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              ${history.map(h => `
                <div class="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs">
                  <div class="flex items-center gap-2.5">
                    <span>${h.icon || '🍪'}</span>
                    <span class="font-bold text-white">${h.food_name} (${h.quantity} ${h.unit || 'pcs'})</span>
                    <span class="text-slate-400">• ${h.notes || '-'}</span>
                  </div>
                  <div class="flex items-center gap-2.5">
                    <span class="font-mono text-slate-400 font-bold">${h.timestamp.split(' ')[1] || h.timestamp}</span>
                    <button onclick="foodManagerModule.deleteConsumptionLog(${h.id})" class="text-rose-400 hover:text-rose-300 p-1" title="Hapus catatan ini">
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
          backgroundColor: ['#f59e0b', '#10b981', '#38bdf8', '#ec4899', '#a855f7', '#64748b', '#14b8a6'],
          borderWidth: 2,
          borderColor: '#0d1322'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: { size: 11 },
              color: '#94a3b8'
            }
          }
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
          confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
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
        window.showToast(res.message || 'Gagal me-reset klasemen', 'error');
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

    if (container) {
      const allFoods = this.foodsList;
      const currentItemsMap = {};
      (breakdown.items || []).forEach(it => { currentItemsMap[it.id] = it.quantity; });

      container.innerHTML = allFoods.map(f => {
        const currentQty = currentItemsMap[f.id] || 0;
        return `
          <div class="flex items-center justify-between p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">${f.icon || '🍪'}</span>
              <div>
                <div class="font-black text-sm text-white">${f.name}</div>
                <div class="text-[11px] text-slate-400">${f.category || 'Snack'} (${f.unit || 'pcs'})</div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <input type="number" id="input-edit-food-${f.id}" value="${currentQty}" min="0" max="999" class="w-20 text-center font-black text-sm px-2 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none">
              <button type="button" onclick="document.getElementById('input-edit-food-${f.id}').value = 0" class="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-lg transition-all" title="Ubah langsung ke 0">
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
