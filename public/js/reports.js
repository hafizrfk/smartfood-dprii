// Analytics, Food Waste & Financial Report Module for SmartFood ERP

let dietaryPieChart = null;

const reportsModule = {
  reportData: null,

  init() {
    this.loadReport();
  },

  async loadReport() {
    const dateInput = document.getElementById('global-date-picker');
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    try {
      const res = await window.api.getReports(selectedDate);
      if (res.success && res.data) {
        this.reportData = res.data;
        this.renderWasteAnalysis(res.data);
        this.renderSessionFinancials(res.data.session_cost_analysis);
        this.renderDepartmentMatrix(res.data.department_matrix);
        this.renderDietaryChart(res.data.dietary_breakdown);
      }
    } catch (err) {
      console.error('Error loading report:', err);
      window.showToast('Gagal memuat laporan: ' + err.message, 'error');
    }
  },

  renderWasteAnalysis(data) {
    const sessions = data.session_cost_analysis || [];
    const totalOrdered = sessions.reduce((acc, s) => acc + s.ordered_portions, 0);
    const totalConsumed = sessions.reduce((acc, s) => acc + s.consumed_portions, 0);
    const totalWasted = sessions.reduce((acc, s) => acc + s.wasted_portions, 0);
    const totalConsumedCost = sessions.reduce((acc, s) => acc + s.consumed_cost, 0);
    const totalWastedCost = sessions.reduce((acc, s) => acc + s.wasted_cost, 0);
    const efficiency = totalOrdered > 0 ? Math.round((totalConsumed / totalOrdered) * 100) : 0;

    const elEfficiency = document.getElementById('report-efficiency-rate');
    const elConsumedCost = document.getElementById('report-consumed-cost');
    const elWastedCost = document.getElementById('report-wasted-cost');
    const elWastedPortions = document.getElementById('report-wasted-portions');

    if (elEfficiency) elEfficiency.textContent = `${efficiency}%`;
    if (elConsumedCost) elConsumedCost.textContent = `Rp ${totalConsumedCost.toLocaleString('id-ID')}`;
    if (elWastedCost) elWastedCost.textContent = `Rp ${totalWastedCost.toLocaleString('id-ID')}`;
    if (elWastedPortions) elWastedPortions.textContent = `${totalWasted} Porsi Sisa`;
  },

  renderSessionFinancials(sessions) {
    const tbody = document.getElementById('report-session-tbody');
    if (!tbody) return;

    tbody.innerHTML = sessions.map(s => {
      const effClass = s.efficiency_percentage >= 80 ? 'text-emerald-700 bg-emerald-50' : s.efficiency_percentage >= 50 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50';

      return `
        <tr class="border-b border-gray-100 hover:bg-slate-50/70 transition-all text-sm">
          <td class="py-3 px-4 font-bold text-gray-900">${s.session_name}</td>
          <td class="py-3 px-4 text-xs text-gray-600">${s.menu_title}</td>
          <td class="py-3 px-4 font-mono text-xs">Rp ${s.cost_per_portion.toLocaleString('id-ID')}</td>
          <td class="py-3 px-4 text-center font-semibold text-gray-700">${s.ordered_portions}</td>
          <td class="py-3 px-4 text-center font-bold text-emerald-700">${s.consumed_portions}</td>
          <td class="py-3 px-4 text-center font-bold text-rose-600">${s.wasted_portions}</td>
          <td class="py-3 px-4 font-mono font-bold text-gray-800">Rp ${s.consumed_cost.toLocaleString('id-ID')}</td>
          <td class="py-3 px-4 font-mono font-bold text-rose-700">Rp ${s.wasted_cost.toLocaleString('id-ID')}</td>
          <td class="py-3 px-4 text-center">
            <span class="px-2.5 py-1 rounded-full text-xs font-black ${effClass}">
              ${s.efficiency_percentage}%
            </span>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderDepartmentMatrix(matrix) {
    const tbody = document.getElementById('report-dept-tbody');
    if (!tbody) return;

    tbody.innerHTML = matrix.map(m => {
      const totalPossible = m.total_members * 4;
      const totalTaken = (m.breakfast_count || 0) + (m.lunch_count || 0) + (m.snack_count || 0) + (m.dinner_count || 0);
      const participationRate = totalPossible > 0 ? Math.round((totalTaken / totalPossible) * 100) : 0;

      return `
        <tr class="border-b border-gray-100 hover:bg-slate-50/70 transition-all text-sm">
          <td class="py-3 px-4 font-bold text-gray-900">${m.department}</td>
          <td class="py-3 px-4 text-center font-semibold text-gray-700">${m.total_members} Orang</td>
          <td class="py-3 px-4 text-center font-medium">${m.breakfast_count || 0}</td>
          <td class="py-3 px-4 text-center font-medium">${m.lunch_count || 0}</td>
          <td class="py-3 px-4 text-center font-medium">${m.snack_count || 0}</td>
          <td class="py-3 px-4 text-center font-medium">${m.dinner_count || 0}</td>
          <td class="py-3 px-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <span class="text-xs font-bold text-gray-800">${participationRate}%</span>
              <div class="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div class="bg-blue-600 h-2 rounded-full" style="width: ${participationRate}%"></div>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderDietaryChart(dietList) {
    const ctx = document.getElementById('chart-dietary-breakdown')?.getContext('2d');
    if (!ctx) return;

    if (dietaryPieChart) dietaryPieChart.destroy();

    const labels = dietList.map(d => d.dietary_type);
    const data = dietList.map(d => d.count);

    dietaryPieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  },

  exportReport() {
    if (!this.reportData || !window.XLSX) {
      window.showToast('Data laporan belum siap diekspor.', 'warning');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Sheet 1: Financials
    const financeData = this.reportData.session_cost_analysis.map(s => ({
      'Sesi Makan': s.session_name,
      'Menu Katering': s.menu_title,
      'Biaya / Porsi': s.cost_per_portion,
      'Porsi Dipesan': s.ordered_portions,
      'Porsi Dikonsumsi': s.consumed_portions,
      'Porsi Sisa (Waste)': s.wasted_portions,
      'Biaya Efektif (Rp)': s.consumed_cost,
      'Biaya Terbuang (Rp)': s.wasted_cost,
      'Efisiensi (%)': s.efficiency_percentage
    }));
    const ws1 = XLSX.utils.json_to_sheet(financeData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Analisis Biaya & Waste');

    // Sheet 2: Department Matrix
    const deptData = this.reportData.department_matrix.map(m => ({
      'Departemen': m.department,
      'Total Anggota': m.total_members,
      'Sarapan': m.breakfast_count,
      'Makan Siang': m.lunch_count,
      'Snack Sore': m.snack_count,
      'Makan Malam': m.dinner_count
    }));
    const ws2 = XLSX.utils.json_to_sheet(deptData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Matriks Kehadiran Divisi');

    XLSX.writeFile(wb, `Laporan_SmartFood_ERP_${this.reportData.date}.xlsx`);
    window.showToast('Laporan Analitik Excel berhasil didownload!', 'success');
  }
};

window.reportsModule = reportsModule;
