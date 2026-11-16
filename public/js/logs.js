// Meal Logs & Audit Trail Module for SmartFood ERP

const logsModule = {
  logsData: [],

  init() {
    this.bindEvents();
    this.loadLogs();
  },

  bindEvents() {
    const search = document.getElementById('filter-log-search');
    const session = document.getElementById('filter-log-session');
    const status = document.getElementById('filter-log-status');

    const trigger = () => this.loadLogs();

    if (search) search.addEventListener('input', debounce(trigger, 300));
    if (session) session.addEventListener('change', trigger);
    if (status) status.addEventListener('change', trigger);
  },

  async loadLogs() {
    const dateInput = document.getElementById('global-date-picker');
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    const search = document.getElementById('filter-log-search')?.value || '';
    const sessionId = document.getElementById('filter-log-session')?.value || '';
    const status = document.getElementById('filter-log-status')?.value || '';

    try {
      const res = await window.api.getLogs({
        date: selectedDate,
        search,
        sessionId,
        status,
        limit: 150
      });

      if (res.success) {
        this.logsData = res.data || [];
        this.renderTable(this.logsData);
      }
    } catch (err) {
      console.error('Error loading logs:', err);
      window.showToast('Gagal memuat log: ' + err.message, 'error');
    }
  },

  renderTable(logs) {
    const tbody = document.getElementById('logs-tbody');
    const countBadge = document.getElementById('logs-total-count');
    if (countBadge) countBadge.textContent = `${logs.length} Log`;

    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-gray-400 text-sm">
            <i class="fa-solid fa-clipboard-list text-2xl mb-2 block"></i>
            Tidak ada riwayat transaksi makan yang sesuai kriteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = logs.map(l => {
      const time = l.timestamp.split(' ')[1] || l.timestamp;
      let statusBadge = '';

      if (l.status === 'SUCCESS') {
        statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">✔ Sukses (1 Porsi)</span>';
      } else if (l.status === 'OVERRIDE_APPROVED') {
        statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">⚡ Override Panitia</span>';
      } else {
        statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">✖ Duplikat Ditolak</span>';
      }

      return `
        <tr class="border-b border-gray-100 hover:bg-slate-50/70 transition-all text-sm">
          <td class="py-3 px-4 font-mono font-bold text-xs text-gray-700">${time}</td>
          <td class="py-3 px-4">
            <span class="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              ${l.participant_code}
            </span>
          </td>
          <td class="py-3 px-4">
            <div class="font-bold text-gray-900">${l.participant_name}</div>
            <div class="text-xs text-gray-500">${l.department}</div>
          </td>
          <td class="py-3 px-4">
            <span class="font-semibold text-gray-800">${l.session_name}</span>
          </td>
          <td class="py-3 px-4">${statusBadge}</td>
          <td class="py-3 px-4 text-xs text-gray-600 max-w-xs truncate" title="${l.notes || ''}">
            ${l.notes || '-'}
          </td>
          <td class="py-3 px-4 text-xs text-gray-500">${l.scanned_by || 'Gate 1'}</td>
        </tr>
      `;
    }).join('');
  },

  exportLogs() {
    if (this.logsData.length === 0) {
      window.showToast('Tidak ada data log untuk diekspor.', 'warning');
      return;
    }

    if (window.XLSX) {
      const exportList = this.logsData.map(l => ({
        'Waktu': l.timestamp,
        'Kode Peserta': l.participant_code,
        'Nama Peserta': l.participant_name,
        'Departemen': l.department,
        'Sesi Makan': l.session_name,
        'Status': l.status === 'SUCCESS' ? 'Sukses' : l.status === 'OVERRIDE_APPROVED' ? 'Override Disetujui' : 'Duplikat Ditolak',
        'Porsi': l.portion_count,
        'Catatan': l.notes || '',
        'Petugas / Gate': l.scanned_by || 'Gate 1'
      }));

      const ws = XLSX.utils.json_to_sheet(exportList);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Log Konsumsi');
      XLSX.writeFile(wb, `Log_Konsumsi_SmartFood_${new Date().toISOString().split('T')[0]}.xlsx`);
      window.showToast('Laporan log berhasil didownload!', 'success');
    }
  }
};

window.logsModule = logsModule;
