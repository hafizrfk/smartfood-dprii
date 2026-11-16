// Main Application Orchestrator for SmartFood ERP

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-slate-800 text-white'
  };

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-info-circle'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transform transition-all duration-300 translate-y-2 opacity-0 text-sm font-semibold ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} text-base"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  // Auto remove after 3.5s
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
window.showToast = showToast;

function switchTab(tabId) {
  const actualTabId = tabId === 'scanner' ? 'foods' : tabId;

  // Hide all sections
  const sections = document.querySelectorAll('.tab-content');
  sections.forEach(sec => sec.classList.add('hidden'));

  // Show target section
  const target = document.getElementById(`tab-${actualTabId}`);
  if (target) {
    target.classList.remove('hidden');
  }

  // Update active nav button
  const navBtns = document.querySelectorAll('.nav-tab-btn');
  navBtns.forEach(btn => {
    if (btn.dataset.tab === actualTabId || (tabId === 'scanner' && btn.dataset.tab === 'foods')) {
      btn.className = 'nav-tab-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500/50 transition-all';
    } else {
      btn.className = 'nav-tab-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all';
    }
  });

  // Module triggers
  if (actualTabId === 'dashboard') {
    if (window.foodManagerModule) window.foodManagerModule.loadFoodData();
    if (window.dashboardModule) window.dashboardModule.loadDashboardData();
  } else if (actualTabId === 'foods') {
    if (window.foodsCatalogModule) window.foodsCatalogModule.loadCatalog();
    if (tabId === 'scanner') {
      const scannerSection = document.getElementById('collapsible-scanner-section');
      if (scannerSection && scannerSection.classList.contains('hidden')) {
        window.foodsCatalogModule.toggleScanner();
      }
      const input = document.getElementById('scan-input');
      if (input) setTimeout(() => input.focus(), 100);
      if (window.scannerModule) window.scannerModule.refreshRecentLogs();
    }
  } else if (actualTabId === 'participants' && window.participantsModule) {
    window.participantsModule.loadParticipants();
  } else if (actualTabId === 'logs' && window.logsModule) {
    window.logsModule.loadLogs();
  }
}
window.switchTab = switchTab;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Date Picker with today
  const datePicker = document.getElementById('global-date-picker');
  const todayStr = new Date().toISOString().split('T')[0];
  if (datePicker) {
    datePicker.value = todayStr;
    datePicker.addEventListener('change', () => {
      // Reload active modules
      if (window.dashboardModule) window.dashboardModule.loadDashboardData();
      if (window.logsModule) window.logsModule.loadLogs();
      if (window.foodManagerModule) window.foodManagerModule.loadFoodData();
      if (window.foodsCatalogModule) window.foodsCatalogModule.loadCatalog();
    });
  }

  // 2. Setup Live Clock (WIB)
  setInterval(() => {
    const clockEl = document.getElementById('live-clock');
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    }
  }, 1000);

  // 3. Tab navigation clicks
  const navBtns = document.querySelectorAll('.nav-tab-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // 4. Keyboard Shortcuts: F2 to open Foods Catalog immediately
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault();
      switchTab('foods');
    }
  });

  // 5. Initialize Modules
  if (window.foodManagerModule) window.foodManagerModule.init();
  if (window.foodsCatalogModule) window.foodsCatalogModule.init();
  if (window.dashboardModule) window.dashboardModule.init();
  if (window.scannerModule) window.scannerModule.init();
  if (window.participantsModule) window.participantsModule.init();
  if (window.logsModule) window.logsModule.init();

  // 6. Sound toggle
  const soundToggle = document.getElementById('setting-sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('change', (e) => {
      window.soundFx.enabled = e.target.checked;
      showToast(`Efek suara scanner ${e.target.checked ? 'diaktifkan' : 'dinonaktifkan'}.`, 'info');
    });
  }

  // 7. Reset DB button
  const resetBtn = document.getElementById('btn-reset-db');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('PERINGATAN: Apakah Anda yakin ingin me-reset database ke data awal bawaan demo?')) {
        try {
          const res = await window.api.resetDatabase();
          if (res.success) {
            showToast('Database berhasil di-reset dengan 25 peserta dan log baru!', 'success');
            setTimeout(() => window.location.reload(), 1000);
          }
        } catch (err) {
          showToast('Gagal reset database: ' + err.message, 'error');
        }
      }
    });
  }

  // 8. Auto sync polling (every 20s)
  setInterval(() => {
    // Only background poll if not on scanner tab typing
    const activeTab = document.querySelector('.nav-tab-btn.bg-blue-600')?.dataset?.tab;
    if (activeTab === 'dashboard' && window.dashboardModule) {
      window.dashboardModule.loadDashboardData();
    }
  }, 20000);
});
