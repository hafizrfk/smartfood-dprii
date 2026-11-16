// Terminal Scanner Module for SmartFood ERP

let html5QrCodeScanner = null;
let isCameraScanning = false;

const scannerModule = {
  currentPendingCode: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const input = document.getElementById('scan-input');
    const btn = document.getElementById('btn-submit-scan');
    const toggleCamBtn = document.getElementById('btn-toggle-camera');

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.executeScan(input.value);
        }
      });
    }

    if (btn) {
      btn.addEventListener('click', () => {
        this.executeScan(input.value);
      });
    }

    if (toggleCamBtn) {
      toggleCamBtn.addEventListener('click', () => {
        this.toggleCamera();
      });
    }
  },

  async executeScan(code, override = false, overrideNotes = '') {
    const input = document.getElementById('scan-input');
    const trimmedCode = (code || '').trim();
    if (!trimmedCode) {
      window.showToast('Silakan masukkan atau scan kode ID peserta!', 'warning');
      return;
    }

    const sessionSelect = document.getElementById('scanner-session-select');
    const selectedSessionId = sessionSelect ? sessionSelect.value : '';

    try {
      const res = await window.api.scanMeal({
        participantCode: trimmedCode,
        sessionId: selectedSessionId,
        overrideApproved: override,
        notes: overrideNotes,
        scannedBy: 'Terminal Gate 1'
      });

      this.renderScanResult(res, trimmedCode);

      // Clear input and keep focus for next queue person
      if (input) {
        input.value = '';
        input.focus();
      }

      // Refresh recent logs ticker
      this.refreshRecentLogs();
      if (window.dashboardModule) {
        window.dashboardModule.loadDashboardData();
      }
    } catch (err) {
      console.error('Scan execution error:', err);
      window.showToast('Gagal memproses scan: ' + err.message, 'error');
    }
  },

  renderScanResult(res, scannedCode) {
    const container = document.getElementById('scan-result-card');
    if (!container) return;

    if (res.success) {
      // Audio cue
      window.soundFx.playSuccess();

      // Confetti burst for pleasant staff feedback
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      const p = res.participant;
      const isOverride = res.reason === 'OVERRIDE_APPROVED';
      const hasAllergy = res.has_allergy;

      container.className = 'glass-panel p-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 shadow-xl scan-pulse-success transition-all';
      container.innerHTML = `
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-5">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-emerald-200">
              <i class="fa-solid fa-check"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isOverride ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}">
                  ${isOverride ? 'PORSI TAMBAHAN (OVERRIDE)' : 'CHECK-IN MAKAN BERHASIL'}
                </span>
                <span class="text-xs text-gray-500 font-medium"><i class="fa-regular fa-clock mr-1"></i>${res.timestamp} WIB</span>
              </div>
              <h2 class="text-2xl font-black text-gray-900">${p.name}</h2>
              <div class="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-gray-600">
                <span class="font-mono font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800">${p.participant_code}</span>
                <span>•</span>
                <span class="font-medium text-gray-700">${p.department}</span>
                <span>•</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">${p.category}</span>
              </div>
            </div>
          </div>

          <div class="w-full md:w-auto text-left md:text-right border-t md:border-t-0 md:border-l border-emerald-200 pt-4 md:pt-0 md:pl-6">
            <div class="text-xs font-semibold uppercase tracking-wider text-emerald-800">Sesi & Menu</div>
            <div class="text-base font-bold text-gray-900 mt-0.5">${res.session.name}</div>
            <div class="text-xs text-gray-600 max-w-xs mt-1 truncate" title="${res.menu.menu_title}">${res.menu.menu_title}</div>
            <div class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">
              <i class="fa-solid fa-utensils"></i> Silakan Ambil 1 Porsi
            </div>
          </div>
        </div>

        ${hasAllergy ? `
          <div class="mt-5 p-3.5 bg-amber-500/10 border-2 border-amber-500 rounded-xl flex items-start gap-3 text-amber-900 animate-pulse">
            <i class="fa-solid fa-triangle-exclamation text-2xl text-amber-600 mt-0.5"></i>
            <div>
              <div class="font-black text-sm uppercase tracking-wide text-amber-900">PERINGATAN DIET & ALERGI PESERTA!</div>
              <div class="text-sm font-semibold mt-0.5">Preferensi: <span class="underline">${p.dietary_type}</span> | Catatan Alergi: <span class="bg-amber-200 px-1.5 py-0.5 rounded font-bold">${p.allergies}</span></div>
              <div class="text-xs text-amber-800 mt-1">Petugas katering wajib memastikan porsi bebas dari alergen yang tertera di atas.</div>
            </div>
          </div>
        ` : ''}
      `;
    } else {
      // Failed / Rejected
      if (res.reason === 'ALREADY_CLAIMED') {
        window.soundFx.playAlertDuplicate();
        this.currentPendingCode = scannedCode;

        container.className = 'glass-panel p-6 rounded-2xl border-2 border-rose-500 bg-rose-50/60 shadow-xl scan-shake-error transition-all';
        container.innerHTML = `
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-5">
              <div class="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-400 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-rose-200">
                <i class="fa-solid fa-ban"></i>
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                    DOUBLE CLAIM DETECTED (DITOLAK)
                  </span>
                </div>
                <h2 class="text-2xl font-black text-rose-900">${res.participant.name}</h2>
                <div class="text-sm text-rose-700 font-medium mt-1">
                  Peserta ini <span class="font-bold underline">sudah pernah mengambil makanan</span> pada sesi <b>${res.session.name}</b>!
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Waktu scan sebelumnya: <span class="font-mono font-bold text-gray-800">${res.lastClaimTime}</span>
                </div>
              </div>
            </div>

            <div class="w-full md:w-auto text-left md:text-right border-t md:border-t-0 md:border-l border-rose-200 pt-4 md:pt-0 md:pl-6">
              <div class="text-xs font-bold text-rose-800 uppercase mb-2">Otorisasi Panitia</div>
              <button onclick="scannerModule.openOverrideModal('${res.participant.participant_code}', '${res.participant.name}')" class="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                <i class="fa-solid fa-shield-halved"></i>
                Beri Porsi Tambahan (Override)
              </button>
            </div>
          </div>
        `;
      } else {
        // Not found or inactive
        window.soundFx.playErrorNotFound();
        container.className = 'glass-panel p-6 rounded-2xl border-2 border-amber-500 bg-amber-50/60 shadow-xl scan-shake-error transition-all';
        container.innerHTML = `
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-amber-200">
              <i class="fa-solid fa-circle-question"></i>
            </div>
            <div>
              <div class="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 inline-block mb-1">
                KODE TIDAK TERDAFTAR
              </div>
              <h3 class="text-xl font-bold text-gray-900">ID Peserta "${scannedCode}" Tidak Ditemukan</h3>
              <p class="text-sm text-gray-600 mt-1">Pastikan barcode/QR code sudah benar atau daftarkan peserta terlebih dahulu di menu Master Data Peserta.</p>
            </div>
          </div>
        `;
      }
    }
  },

  openOverrideModal(code, name) {
    const modal = document.getElementById('override-modal');
    const modalName = document.getElementById('override-modal-name');
    const modalCode = document.getElementById('override-modal-code');
    const modalNote = document.getElementById('override-modal-notes');

    if (modal && modalName && modalCode) {
      modalName.textContent = name;
      modalCode.textContent = code;
      if (modalNote) modalNote.value = 'Disetujui panitia: Permintaan porsi tambahan';
      modal.classList.remove('hidden');
    }
  },

  closeOverrideModal() {
    const modal = document.getElementById('override-modal');
    if (modal) modal.classList.add('hidden');
  },

  confirmOverride() {
    const modalCode = document.getElementById('override-modal-code');
    const modalNote = document.getElementById('override-modal-notes');
    const code = modalCode ? modalCode.textContent : this.currentPendingCode;
    const note = modalNote ? modalNote.value : 'Porsi tambahan disetujui';

    this.closeOverrideModal();
    if (code) {
      this.executeScan(code, true, note);
    }
  },

  async toggleCamera() {
    const readerElem = document.getElementById('qr-camera-reader');
    const btn = document.getElementById('btn-toggle-camera');

    if (isCameraScanning) {
      if (html5QrCodeScanner) {
        await html5QrCodeScanner.stop();
        html5QrCodeScanner = null;
      }
      isCameraScanning = false;
      readerElem.classList.add('hidden');
      btn.innerHTML = '<i class="fa-solid fa-camera mr-2"></i>Buka Kamera QR Scanner';
      btn.className = 'px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-xl shadow transition-all flex items-center';
    } else {
      readerElem.classList.remove('hidden');
      btn.innerHTML = '<i class="fa-solid fa-camera-slash mr-2"></i>Tutup Kamera';
      btn.className = 'px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-xl shadow transition-all flex items-center';

      try {
        html5QrCodeScanner = new Html5Qrcode('qr-camera-reader');
        isCameraScanning = true;
        await html5QrCodeScanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            // Success QR Scan
            this.executeScan(decodedText);
          },
          (errorMessage) => {
            // Frame parse error, ignore normal empty frames
          }
        );
      } catch (err) {
        console.error('Camera init error:', err);
        window.showToast('Gagal membuka kamera: ' + err.message, 'error');
        readerElem.classList.add('hidden');
        isCameraScanning = false;
        btn.innerHTML = '<i class="fa-solid fa-camera mr-2"></i>Buka Kamera QR Scanner';
      }
    }
  },

  async refreshRecentLogs() {
    const container = document.getElementById('terminal-recent-logs');
    if (!container) return;

    try {
      const res = await window.api.getLogs({ limit: 5 });
      if (res.success && res.data) {
        if (res.data.length === 0) {
          container.innerHTML = '<div class="text-sm text-gray-400 py-4 text-center">Belum ada aktivitas scan hari ini.</div>';
          return;
        }

        container.innerHTML = res.data.map(log => {
          const isSuccess = log.status === 'SUCCESS' || log.status === 'OVERRIDE_APPROVED';
          const time = log.timestamp.split(' ')[1] || log.timestamp;
          return `
            <div class="flex items-center justify-between p-3 rounded-xl border ${isSuccess ? 'bg-white border-gray-100 hover:border-emerald-200' : 'bg-rose-50/50 border-rose-100'} transition-all">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg ${isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} flex items-center justify-center text-xs font-bold">
                  <i class="fa-solid ${isSuccess ? 'fa-check' : 'fa-xmark'}"></i>
                </div>
                <div>
                  <div class="text-sm font-bold text-gray-900">${log.participant_name} <span class="font-mono text-xs text-gray-500 font-normal">(${log.participant_code})</span></div>
                  <div class="text-xs text-gray-500">${log.department} • <span class="font-semibold text-gray-700">${log.session_name}</span></div>
                </div>
              </div>
              <div class="text-right">
                <span class="px-2 py-0.5 rounded text-[11px] font-bold ${log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : log.status === 'OVERRIDE_APPROVED' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}">
                  ${log.status === 'SUCCESS' ? 'BERHASIL' : log.status === 'OVERRIDE_APPROVED' ? 'OVERRIDE' : 'DUPLIKAT DITOLAK'}
                </span>
                <div class="text-[11px] text-gray-400 font-mono mt-0.5">${time}</div>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (e) {
      console.warn('Failed refreshing recent logs in terminal:', e);
    }
  }
};

window.scannerModule = scannerModule;
