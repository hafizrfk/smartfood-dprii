// Meal Sessions & Catering Menus Module for SmartFood ERP

const sessionsModule = {
  sessionsData: [],

  init() {
    this.bindEvents();
    this.loadSessions();
  },

  bindEvents() {
    const form = document.getElementById('menu-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveMenuData();
      });
    }
  },

  async loadSessions() {
    const dateInput = document.getElementById('global-date-picker');
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    try {
      const res = await window.api.getSessions(selectedDate);
      if (res.success) {
        this.sessionsData = res.data || [];
        this.renderSessionCards(this.sessionsData);
        this.populateScannerSessionDropdown(this.sessionsData);
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
      window.showToast('Gagal memuat sesi: ' + err.message, 'error');
    }
  },

  populateScannerSessionDropdown(sessions) {
    const select = document.getElementById('scanner-session-select');
    if (!select) return;

    select.innerHTML = '<option value="">Otomatis Deteksi Berdasarkan Jam</option>';
    sessions.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.name} (${s.start_time} - ${s.end_time})${s.is_active ? ' [AKTIF]' : ''}`;
      select.appendChild(opt);
    });
  },

  renderSessionCards(sessions) {
    const container = document.getElementById('sessions-cards-grid');
    if (!container) return;

    container.innerHTML = sessions.map(s => {
      const menu = s.menu || {
        menu_title: 'Belum ada menu diatur',
        menu_description: 'Klik tombol di bawah untuk memasukkan menu katering hari ini.',
        vendor_name: 'Mitra Catering',
        cost_per_portion: 30000,
        target_portions: 30,
        notes: ''
      };

      const eaten = s.stats ? s.stats.total_portions : 0;
      const target = menu.target_portions || 30;
      const remaining = Math.max(0, target - eaten);
      const isBuffetLow = remaining <= 5 && remaining > 0;
      const isBuffetOut = remaining === 0;

      return `
        <div class="glass-panel p-6 rounded-2xl border ${s.is_active ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-gray-200'} shadow-sm flex flex-col justify-between">
          <div>
            <!-- Header -->
            <div class="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-xl font-black text-gray-900">${s.name}</h3>
                  <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">${s.code}</span>
                </div>
                <div class="text-xs text-gray-500 font-medium mt-1">
                  <i class="fa-regular fa-clock mr-1 text-gray-400"></i>${s.start_time} - ${s.end_time} WIB
                </div>
              </div>
              
              <!-- Active Toggle Switch -->
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold ${s.is_active ? 'text-emerald-700' : 'text-gray-400'}">
                  ${s.is_active ? 'BUKA' : 'TUTUP'}
                </span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" onchange="sessionsModule.toggleSession(${s.id}, this.checked)" class="sr-only peer" ${s.is_active ? 'checked' : ''}>
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <!-- Menu Card -->
            <div class="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div class="flex items-start justify-between">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Menu Katering
                  </span>
                  <h4 class="font-bold text-gray-900 text-base mt-1.5">${menu.menu_title}</h4>
                  <p class="text-xs text-gray-600 mt-1">${menu.menu_description || '-'}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200 text-xs">
                <div>
                  <span class="text-gray-500 block">Vendor Katering:</span>
                  <b class="text-gray-800">${menu.vendor_name || 'Mitra'}</b>
                </div>
                <div>
                  <span class="text-gray-500 block">Biaya per Porsi:</span>
                  <b class="text-emerald-700">Rp ${Number(menu.cost_per_portion).toLocaleString('id-ID')}</b>
                </div>
              </div>
            </div>

            <!-- Stock / Buffet Status -->
            <div class="mt-4">
              <div class="flex items-center justify-between text-xs mb-1.5">
                <span class="font-bold text-gray-700">Porsi Terdistribusi: <b class="text-emerald-700">${eaten}</b> / ${target}</span>
                <span class="font-bold ${isBuffetOut ? 'text-rose-600' : isBuffetLow ? 'text-amber-600' : 'text-emerald-600'}">
                  ${isBuffetOut ? '⚠️ Habis' : `Sisa ${remaining} Porsi`}
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div class="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500" style="width: ${Math.min(100, (eaten / target) * 100)}%"></div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <button onclick="sessionsModule.openMenuModal(${s.id}, '${s.name}')" class="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-all">
              <i class="fa-solid fa-pen-to-square"></i> Atur Menu Katering
            </button>
            <button onclick="window.switchTab('scanner'); document.getElementById('scanner-session-select').value='${s.id}';" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all">
              <i class="fa-solid fa-qrcode"></i> Buka Gate Scan Sesi Ini
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  async toggleSession(id, isActive) {
    try {
      const res = await window.api.toggleSession(id, isActive);
      if (res.success) {
        window.showToast(res.message, 'success');
        this.loadSessions();
      }
    } catch (err) {
      window.showToast('Gagal mengubah status sesi: ' + err.message, 'error');
    }
  },

  openMenuModal(sessionId, sessionName) {
    const s = this.sessionsData.find(item => item.id === sessionId);
    if (!s) return;

    const dateInput = document.getElementById('global-date-picker');
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    document.getElementById('menu-session-id').value = sessionId;
    document.getElementById('menu-session-name').textContent = sessionName;
    document.getElementById('menu-date').value = selectedDate;

    const menu = s.menu || {};
    document.getElementById('menu-title-input').value = menu.menu_title || '';
    document.getElementById('menu-desc-input').value = menu.menu_description || '';
    document.getElementById('menu-vendor-input').value = menu.vendor_name || 'Berkah Catering Prima';
    document.getElementById('menu-cost-input').value = menu.cost_per_portion || 35000;
    document.getElementById('menu-portions-input').value = menu.target_portions || 30;
    document.getElementById('menu-notes-input').value = menu.notes || '';

    document.getElementById('menu-modal').classList.remove('hidden');
  },

  closeMenuModal() {
    document.getElementById('menu-modal').classList.add('hidden');
  },

  async saveMenuData() {
    const data = {
      meal_session_id: document.getElementById('menu-session-id').value,
      date: document.getElementById('menu-date').value,
      menu_title: document.getElementById('menu-title-input').value,
      menu_description: document.getElementById('menu-desc-input').value,
      vendor_name: document.getElementById('menu-vendor-input').value,
      cost_per_portion: document.getElementById('menu-cost-input').value,
      target_portions: document.getElementById('menu-portions-input').value,
      notes: document.getElementById('menu-notes-input').value
    };

    try {
      const res = await window.api.saveMenu(data);
      if (res.success) {
        window.showToast('Menu katering berhasil disimpan!', 'success');
        this.closeMenuModal();
        this.loadSessions();
        if (window.dashboardModule) window.dashboardModule.loadDashboardData();
      }
    } catch (err) {
      window.showToast('Gagal menyimpan menu: ' + err.message, 'error');
    }
  }
};

window.sessionsModule = sessionsModule;
