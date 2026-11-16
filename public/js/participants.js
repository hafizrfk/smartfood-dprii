// Participant Management & QR Badge Printing Module

const participantsModule = {
  participantsData: [],

  init() {
    this.bindEvents();
    this.loadParticipants();
  },

  bindEvents() {
    const searchInput = document.getElementById('filter-participant-search');
    const deptSelect = document.getElementById('filter-participant-dept');
    const catSelect = document.getElementById('filter-participant-cat');
    const dietSelect = document.getElementById('filter-participant-diet');

    const triggerFilter = () => this.loadParticipants();

    if (searchInput) searchInput.addEventListener('input', debounce(triggerFilter, 300));
    if (deptSelect) deptSelect.addEventListener('change', triggerFilter);
    if (catSelect) catSelect.addEventListener('change', triggerFilter);
    if (dietSelect) dietSelect.addEventListener('change', triggerFilter);

    // Form submit
    const form = document.getElementById('participant-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveParticipant();
      });
    }

    // CSV File input
    const csvInput = document.getElementById('csv-file-input');
    if (csvInput) {
      csvInput.addEventListener('change', (e) => this.handleCsvImport(e));
    }
  },

  async loadParticipants() {
    const search = document.getElementById('filter-participant-search')?.value || '';
    const department = document.getElementById('filter-participant-dept')?.value || '';
    const category = document.getElementById('filter-participant-cat')?.value || '';
    const dietary = document.getElementById('filter-participant-diet')?.value || '';

    try {
      const res = await window.api.getParticipants({ search, department, category, dietary });
      if (res.success) {
        this.participantsData = res.data || [];
        this.renderTable(this.participantsData);
        this.populateDepartmentFilter(this.participantsData);
      }
    } catch (err) {
      console.error('Error loading participants:', err);
      window.showToast('Gagal memuat peserta: ' + err.message, 'error');
    }
  },

  populateDepartmentFilter(list) {
    const deptSelect = document.getElementById('filter-participant-dept');
    if (!deptSelect || deptSelect.dataset.populated === 'true') return;

    const depts = Array.from(new Set(list.map(p => p.department))).filter(Boolean);
    depts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      deptSelect.appendChild(opt);
    });
    deptSelect.dataset.populated = 'true';
  },

  renderTable(list) {
    const tbody = document.getElementById('participants-tbody');
    const countBadge = document.getElementById('participants-total-count');
    if (countBadge) countBadge.textContent = `${list.length} Peserta`;

    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-gray-400 text-sm">
            <i class="fa-solid fa-users-slash text-2xl mb-2 block"></i>
            Tidak ada data peserta yang cocok dengan filter pencarian.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(p => {
      const initials = p.name.split(' ').map(n => n[0]).slice(0, 2).join('');
      const hasAllergy = p.allergies && p.allergies.toLowerCase() !== 'tidak ada';

      return `
        <tr class="border-b border-gray-100 hover:bg-slate-50/70 transition-all text-sm">
          <td class="py-3 px-4">
            <span class="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200">
              ${p.participant_code}
            </span>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                ${initials}
              </div>
              <div>
                <div class="font-bold text-gray-900">${p.name}</div>
                <div class="text-xs text-gray-500">${p.email || p.phone || '-'}</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 text-gray-700 font-medium">${p.department}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${
              p.category === 'VIP' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
              p.category === 'Panitia' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              'bg-blue-100 text-blue-800 border border-blue-200'
            }">
              ${p.category}
            </span>
          </td>
          <td class="py-3 px-4">
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-gray-800">${p.dietary_type}</span>
              ${hasAllergy ? `
                <span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                  <i class="fa-solid fa-triangle-exclamation"></i> ${p.allergies}
                </span>
              ` : `
                <span class="text-[11px] text-gray-400">Tidak ada alergi</span>
              `}
            </div>
          </td>
          <td class="py-3 px-4 text-center">
            <span class="font-bold text-gray-800">${p.daily_quota} Porsi</span>
          </td>
          <td class="py-3 px-4 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="participantsModule.printSingleBadge(${p.id})" title="Cetak Kartu & QR" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <i class="fa-solid fa-id-badge"></i>
              </button>
              <button onclick="participantsModule.quickScanTest('${p.participant_code}')" title="Test Scan Langsung" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                <i class="fa-solid fa-qrcode"></i>
              </button>
              <button onclick="participantsModule.openEditModal(${p.id})" title="Edit Data" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button onclick="participantsModule.deleteParticipant(${p.id}, '${p.name}')" title="Hapus" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openAddModal() {
    const form = document.getElementById('participant-form');
    if (form) form.reset();

    document.getElementById('participant-id').value = '';
    document.getElementById('modal-participant-title').textContent = 'Tambah Peserta Baru';
    
    // Auto generate next code for DPR II
    const nextNum = String(this.participantsData.length + 1).padStart(3, '0');
    document.getElementById('p-code').value = `dprii-${nextNum}`;
    const deptInput = document.getElementById('p-dept');
    if (deptInput && !deptInput.value) deptInput.value = 'DPR II';

    document.getElementById('participant-modal').classList.remove('hidden');
  },

  openEditModal(id) {
    const p = this.participantsData.find(item => item.id === id);
    if (!p) return;

    document.getElementById('participant-id').value = p.id;
    document.getElementById('modal-participant-title').textContent = 'Edit Data Peserta';
    document.getElementById('p-code').value = p.participant_code;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-dept').value = p.department;
    document.getElementById('p-cat').value = p.category;
    document.getElementById('p-phone').value = p.phone || '';
    document.getElementById('p-email').value = p.email || '';
    document.getElementById('p-diet').value = p.dietary_type;
    document.getElementById('p-allergies').value = p.allergies || 'Tidak ada';
    document.getElementById('p-quota').value = p.daily_quota || 3;
    document.getElementById('p-notes').value = p.notes || '';

    document.getElementById('participant-modal').classList.remove('hidden');
  },

  closeModal() {
    document.getElementById('participant-modal').classList.add('hidden');
  },

  async saveParticipant() {
    const id = document.getElementById('participant-id').value;
    const data = {
      participant_code: document.getElementById('p-code').value,
      name: document.getElementById('p-name').value,
      department: document.getElementById('p-dept').value,
      category: document.getElementById('p-cat').value,
      phone: document.getElementById('p-phone').value,
      email: document.getElementById('p-email').value,
      dietary_type: document.getElementById('p-diet').value,
      allergies: document.getElementById('p-allergies').value,
      daily_quota: document.getElementById('p-quota').value,
      notes: document.getElementById('p-notes').value,
      status: 'active'
    };

    try {
      if (id) {
        const res = await window.api.updateParticipant(id, data);
        if (res.success) {
          window.showToast('Data peserta berhasil diperbarui!', 'success');
        }
      } else {
        const res = await window.api.addParticipant(data);
        if (res.success) {
          window.showToast('Peserta baru berhasil ditambahkan!', 'success');
        }
      }
      this.closeModal();
      this.loadParticipants();
      if (window.foodManagerModule) window.foodManagerModule.loadFoodData();
    } catch (err) {
      window.showToast('Gagal menyimpan: ' + err.message, 'error');
    }
  },

  async deleteParticipant(id, name) {
    if (!confirm(`Apakah Anda yakin ingin menghapus peserta "${name}"? Seluruh data log peserta ini akan terhapus.`)) {
      return;
    }

    try {
      const res = await window.api.deleteParticipant(id);
      if (res.success) {
        window.showToast(`Peserta "${name}" berhasil dihapus.`, 'info');
        this.loadParticipants();
      }
    } catch (err) {
      window.showToast('Gagal menghapus: ' + err.message, 'error');
    }
  },

  quickScanTest(code) {
    window.switchTab('scanner');
    const input = document.getElementById('scan-input');
    if (input) {
      input.value = code;
      window.scannerModule.executeScan(code);
    }
  },

  // ID Badge Printing with Real QR Codes
  printSingleBadge(id) {
    const p = this.participantsData.find(item => item.id === id);
    if (!p) return;
    this.renderBadgesForPrint([p]);
  },

  printAllBadges() {
    if (this.participantsData.length === 0) {
      window.showToast('Tidak ada data peserta untuk dicetak.', 'warning');
      return;
    }
    this.renderBadgesForPrint(this.participantsData);
  },

  renderBadgesForPrint(list) {
    const printContainer = document.getElementById('print-area');
    if (!printContainer) return;

    printContainer.innerHTML = `
      <div class="no-print mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
        <div>
          <h3 class="font-bold text-blue-900">Preview Kartu ID & QR Code Peserta</h3>
          <p class="text-xs text-blue-700">Siap dicetak dengan format kartu lanyard (2 kolom). Klik tombol Cetak untuk membuka dialog print browser.</p>
        </div>
        <div class="flex gap-2">
          <button onclick="window.print()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow">
            <i class="fa-solid fa-print mr-1.5"></i>Cetak Sekarang (Print)
          </button>
          <button onclick="document.getElementById('badge-preview-modal').classList.add('hidden')" class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-lg">
            Tutup
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center" id="badges-grid">
      </div>
    `;

    const grid = document.getElementById('badges-grid');

    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'id-card-badge p-4 bg-white border border-gray-300 rounded-2xl flex flex-col items-center justify-between';
      card.innerHTML = `
        <div class="w-full text-center pb-2 border-b border-gray-200">
          <div class="badge-hole mb-2"></div>
          <div class="text-[10px] font-bold tracking-widest uppercase text-blue-800">SMARTFOOD ERP</div>
          <div class="text-xs font-black text-gray-900">TECH SUMMIT & BOOTCAMP 2026</div>
        </div>

        <div class="my-3 flex flex-col items-center">
          <div id="qrcode-${p.participant_code}" class="p-2 bg-white rounded-xl border border-gray-200 shadow-sm"></div>
          <div class="font-mono font-bold text-xs tracking-wider text-gray-700 mt-2">${p.participant_code}</div>
        </div>

        <div class="w-full text-center pt-2 border-t border-gray-200">
          <div class="font-black text-base text-gray-900 truncate">${p.name}</div>
          <div class="text-xs font-semibold text-gray-600">${p.department}</div>
          <div class="mt-2 flex items-center justify-center gap-1.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">${p.category}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">${p.dietary_type}</span>
          </div>
          ${p.allergies && p.allergies.toLowerCase() !== 'tidak ada' ? `
            <div class="mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ⚠️ Alergi: ${p.allergies}
            </div>
          ` : ''}
        </div>
      `;
      grid.appendChild(card);

      // Generate real QR code in this div
      setTimeout(() => {
        const qrContainer = document.getElementById(`qrcode-${p.participant_code}`);
        if (qrContainer && window.QRCode) {
          qrContainer.innerHTML = '';
          new QRCode(qrContainer, {
            text: p.participant_code,
            width: 110,
            height: 110,
            colorDark: '#0f172a',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
          });
        }
      }, 50);
    });

    document.getElementById('badge-preview-modal').classList.remove('hidden');
  },

  // Export to Excel / CSV
  exportData() {
    if (this.participantsData.length === 0) {
      window.showToast('Tidak ada data peserta untuk diekspor.', 'warning');
      return;
    }

    if (window.XLSX) {
      const exportList = this.participantsData.map(p => ({
        'Kode Peserta': p.participant_code,
        'Nama Lengkap': p.name,
        'Departemen / Divisi': p.department,
        'Kategori': p.category,
        'No Telepon': p.phone,
        'Email': p.email,
        'Preferensi Diet': p.dietary_type,
        'Alergi / Pantangan': p.allergies,
        'Kuota Harian': p.daily_quota,
        'Status': p.status
      }));

      const ws = XLSX.utils.json_to_sheet(exportList);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Daftar Peserta');
      XLSX.writeFile(wb, `Data_Peserta_SmartFood_${new Date().toISOString().split('T')[0]}.xlsx`);
      window.showToast('File Excel berhasil didownload!', 'success');
    }
  },

  // Batch CSV Import
  handleCsvImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) {
          window.showToast('File CSV kosong atau tidak valid.', 'warning');
          return;
        }

        // Parse header and rows
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
        let successCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length >= 3) {
            const rowData = {
              participant_code: cols[0],
              name: cols[1],
              department: cols[2],
              category: cols[3] || 'Peserta',
              phone: cols[4] || '',
              email: cols[5] || '',
              dietary_type: cols[6] || 'Reguler',
              allergies: cols[7] || 'Tidak ada',
              daily_quota: Number(cols[8]) || 3,
              status: 'active'
            };

            await window.api.addParticipant(rowData);
            successCount++;
          }
        }

        window.showToast(`Berhasil mengimpor ${successCount} data peserta!`, 'success');
        this.loadParticipants();
      } catch (err) {
        console.error('CSV import error:', err);
        window.showToast('Gagal memproses file CSV: ' + err.message, 'error');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  }
};

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.participantsModule = participantsModule;
