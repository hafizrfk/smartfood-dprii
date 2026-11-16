// Dashboard Analytics & KPI Module for SmartFood ERP

let sessionDonutChart = null;
let deptBarChart = null;

const dashboardModule = {
  currentDate: '',

  init() {
    this.currentDate = document.getElementById('global-date-picker')?.value || new Date().toISOString().split('T')[0];
    this.loadDashboardData();
  },

  async loadDashboardData() {
    const dateInput = document.getElementById('global-date-picker');
    const selectedDate = dateInput ? dateInput.value : this.currentDate;

    try {
      const res = await window.api.getDashboard(selectedDate);
      if (res.success && res.data) {
        this.renderStats(res.data);
        this.renderSessionCards(res.data.sessions);
        this.renderCharts(res.data);
        this.renderLiveFeed(res.data.recent_logs);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      window.showToast('Gagal memuat data dashboard: ' + err.message, 'error');
    }
  },

  renderStats(data) {
    const elParticipants = document.getElementById('stat-total-participants');
    const elConsumed = document.getElementById('stat-total-consumed');
    const elCost = document.getElementById('stat-total-cost');
    const elDoubleBlocked = document.getElementById('stat-double-blocked');

    if (elParticipants) elParticipants.textContent = data.total_participants;
    if (elConsumed) elConsumed.textContent = data.total_portions_consumed + ' Porsi';
    if (elCost) elCost.textContent = 'Rp ' + Number(data.total_cost).toLocaleString('id-ID');
    if (elDoubleBlocked) elDoubleBlocked.textContent = data.total_double_blocked + ' Percobaan';
  },

  renderSessionCards(sessions) {
    const container = document.getElementById('dashboard-session-cards');
    if (!container) return;

    container.innerHTML = sessions.map(session => {
      const menu = session.menu || {};
      const target = menu.target_portions || 30;
      const consumed = session.total_portions || 0;
      const pct = Math.min(100, Math.round((consumed / target) * 100));

      let badgeColor = 'bg-gray-100 text-gray-700';
      let statusText = 'Mendatang';
      if (session.is_active) {
        badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse';
        statusText = '🟢 Sedang Buka';
      } else if (consumed > 0) {
        badgeColor = 'bg-blue-100 text-blue-800 border border-blue-200';
        statusText = 'Selesai';
      }

      return `
        <div class="glass-panel p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor}">
                ${statusText}
              </span>
              <span class="text-xs font-mono text-gray-500 font-medium">
                <i class="fa-regular fa-clock mr-1"></i>${session.start_time} - ${session.end_time}
              </span>
            </div>

            <h3 class="text-lg font-black text-gray-900">${session.name}</h3>
            <p class="text-xs text-gray-500 mt-1 line-clamp-1" title="${menu.menu_title || 'Belum diatur'}">
              <i class="fa-solid fa-utensils mr-1 text-gray-400"></i>${menu.menu_title || 'Belum diatur'}
            </p>

            <div class="mt-4">
              <div class="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                <span>Porsi Terambil: <b class="text-emerald-700">${consumed}</b> / ${target}</span>
                <span>${pct}%</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div class="bg-gradient-to-r from-emerald-500 to-green-600 h-2.5 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Sisa di Buffet: <b class="text-gray-900">${session.remaining_portions} Porsi</b></span>
            <span>Biaya: <b class="text-gray-900">Rp ${Number(session.estimated_cost).toLocaleString('id-ID')}</b></span>
          </div>
        </div>
      `;
    }).join('');
  },

  renderCharts(data) {
    const donutCtx = document.getElementById('chart-session-donut')?.getContext('2d');
    const barCtx = document.getElementById('chart-dept-bar')?.getContext('2d');

    if (donutCtx) {
      if (sessionDonutChart) sessionDonutChart.destroy();
      const labels = data.sessions.map(s => s.name);
      const values = data.sessions.map(s => s.total_portions);

      sessionDonutChart = new Chart(donutCtx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
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
          cutout: '68%'
        }
      });
    }

    if (barCtx) {
      if (deptBarChart) deptBarChart.destroy();
      const labels = data.department_stats.map(d => d.department.length > 14 ? d.department.substring(0, 14) + '...' : d.department);
      const totalMembers = data.department_stats.map(d => d.total_members);
      const eatenMembers = data.department_stats.map(d => d.eaten_members);

      deptBarChart = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Sudah Makan',
              data: eatenMembers,
              backgroundColor: '#10b981',
              borderRadius: 6
            },
            {
              label: 'Total Peserta',
              data: totalMembers,
              backgroundColor: '#e2e8f0',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          },
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
            x: { ticks: { font: { size: 10 } } }
          }
        }
      });
    }
  },

  renderLiveFeed(logs) {
    const container = document.getElementById('dashboard-live-feed');
    if (!container) return;

    if (!logs || logs.length === 0) {
      container.innerHTML = '<div class="text-xs text-gray-400 py-6 text-center">Belum ada peserta yang check-in hari ini.</div>';
      return;
    }

    container.innerHTML = logs.map(log => {
      const isSuccess = log.status === 'SUCCESS' || log.status === 'OVERRIDE_APPROVED';
      const time = log.timestamp.split(' ')[1] || log.timestamp;
      const initials = log.participant_name.split(' ').map(n => n[0]).slice(0, 2).join('');

      return `
        <div class="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-slate-50 transition-all">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full ${isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'} flex items-center justify-center font-black text-xs">
              ${initials}
            </div>
            <div>
              <div class="text-xs font-bold text-gray-900">${log.participant_name}</div>
              <div class="text-[11px] text-gray-500">${log.department} • <span class="font-medium text-gray-700">${log.session_name}</span></div>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[11px] font-mono font-bold text-gray-700 block">${time}</span>
            <span class="text-[10px] font-semibold ${isSuccess ? 'text-emerald-700' : 'text-rose-600'}">
              ${isSuccess ? '✔ Porsi Diambil' : '✖ Ditolak Dobel'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }
};

window.dashboardModule = dashboardModule;
