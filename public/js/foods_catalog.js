// Foods Catalog & Category Management Module (Tab 2) for SmartFood ERP (Dark Mode)

const foodsCatalogModule = {
  currentCategory: 'all',
  currentSearch: '',
  currentSort: 'consumed',
  currentView: 'grid', // 'grid' | 'table'
  foodsList: [],
  categoriesList: [],
  activeEditFoodId: null,
  activeEditCatId: null,

  init() {
    this.bindEvents();
    this.loadCatalog();
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('foods-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearch = e.target.value;
        this.renderFoods();
      });
    }

    // Sort select
    const sortSelect = document.getElementById('foods-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.renderFoods();
      });
    }

    // Form Add Food
    const addFoodForm = document.getElementById('add-food-form');
    if (addFoodForm) {
      addFoodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveNewFood();
      });
    }

    // Form Edit Food
    const editFoodForm = document.getElementById('edit-food-form');
    if (editFoodForm) {
      editFoodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveEditFood();
      });
    }

    // Form Category (Add/Edit)
    const catForm = document.getElementById('category-form');
    if (catForm) {
      catForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveCategory();
      });
    }

    // Form Quick Log Food
    const quickLogForm = document.getElementById('modal-quick-log-form');
    if (quickLogForm) {
      quickLogForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveQuickFoodLog();
      });
    }
  },

  async loadCatalog() {
    try {
      const [catsRes, foodsRes] = await Promise.all([
        window.api.getCategories(),
        window.api.getFoods()
      ]);

      this.categoriesList = Array.isArray(catsRes) ? catsRes : (catsRes.data || []);
      this.foodsList = Array.isArray(foodsRes) ? foodsRes : (foodsRes.data || []);

      this.populateCategoryDropdowns();
      this.renderCategoryPills();
      this.renderStats();
      this.renderFoods();
    } catch (err) {
      console.error('Error loading foods catalog:', err);
    }
  },

  populateCategoryDropdowns() {
    const dropdownIds = ['food-cat-input', 'edit-food-cat-input'];
    dropdownIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const currentVal = el.value;
      el.innerHTML = this.categoriesList.map(c => `
        <option value="${c.name}">${c.icon || '🏷️'} ${c.name}</option>
      `).join('');
      if (currentVal) el.value = currentVal;
    });
  },

  renderStats() {
    const totalFoodsEl = document.getElementById('stat-total-foods');
    const totalCatsEl = document.getElementById('stat-total-categories');
    const totalConsumedEl = document.getElementById('stat-total-consumed');
    const topFavoriteEl = document.getElementById('stat-top-favorite');

    const totalFoods = this.foodsList.length;
    const totalCats = this.categoriesList.length;
    const totalConsumed = this.foodsList.reduce((acc, f) => acc + (Number(f.total_consumed) || 0), 0);

    const sortedByConsumed = [...this.foodsList].sort((a, b) => (b.total_consumed || 0) - (a.total_consumed || 0));
    const topFood = sortedByConsumed[0];

    if (totalFoodsEl) totalFoodsEl.textContent = totalFoods;
    if (totalCatsEl) totalCatsEl.textContent = totalCats;
    if (totalConsumedEl) totalConsumedEl.textContent = `${totalConsumed} pcs`;
    if (topFavoriteEl) {
      if (topFood && topFood.total_consumed > 0) {
        topFavoriteEl.textContent = `${topFood.icon || '🍪'} ${topFood.name} (${topFood.total_consumed})`;
      } else {
        topFavoriteEl.textContent = '-';
      }
    }
  },

  renderCategoryPills() {
    const container = document.getElementById('category-pills-container');
    if (!container) return;

    const totalAllFoods = this.foodsList.length;
    let html = `
      <button onclick="foodsCatalogModule.filterByCategory('all')" 
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${this.currentCategory === 'all' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'}">
        <i class="fa-solid fa-layer-group"></i>
        <span>Semua Makanan</span>
        <span class="px-1.5 py-0.2 rounded-md ${this.currentCategory === 'all' ? 'bg-black/20 text-slate-950' : 'bg-slate-900 text-amber-400'} text-[11px] font-black">${totalAllFoods}</span>
      </button>
    `;

    this.categoriesList.forEach(c => {
      const isSelected = this.currentCategory.toLowerCase() === c.name.toLowerCase();
      const count = this.foodsList.filter(f => (f.category || '').toLowerCase() === c.name.toLowerCase()).length;
      html += `
        <button onclick="foodsCatalogModule.filterByCategory('${c.name}')" 
                class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${isSelected ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'}">
          <span>${c.icon || '🏷️'}</span>
          <span>${c.name}</span>
          <span class="px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-black/20 text-slate-950' : 'bg-slate-900 text-slate-400'} text-[11px] font-black">${count}</span>
        </button>
      `;
    });

    html += `
      <button onclick="foodsCatalogModule.openCategoryModal()" 
              class="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1.5 whitespace-nowrap"
              title="Kelola & Tambah Kategori Baru">
        <i class="fa-solid fa-plus text-xs"></i>
        <span>Kategori</span>
      </button>
    `;

    container.innerHTML = html;
  },

  filterByCategory(categoryName) {
    this.currentCategory = categoryName;
    this.renderCategoryPills();
    this.renderFoods();
  },

  renderFoods() {
    let filtered = [...this.foodsList];

    // Category filter
    if (this.currentCategory && this.currentCategory !== 'all') {
      filtered = filtered.filter(f => (f.category || '').toLowerCase() === this.currentCategory.toLowerCase());
    }

    // Search filter
    if (this.currentSearch && this.currentSearch.trim()) {
      const q = this.currentSearch.trim().toLowerCase();
      filtered = filtered.filter(f => 
        (f.name || '').toLowerCase().includes(q) || 
        (f.category || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    if (this.currentSort === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (this.currentSort === 'newest') {
      filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else {
      filtered.sort((a, b) => (b.total_consumed || 0) - (a.total_consumed || 0));
    }

    const gridContainer = document.getElementById('foods-cards-grid');
    const tableContainer = document.getElementById('foods-table-view');
    const emptyState = document.getElementById('foods-empty-state');
    const countBadge = document.getElementById('foods-filtered-count');

    if (countBadge) {
      countBadge.textContent = `${filtered.length} makanan ditemukan`;
    }

    if (filtered.length === 0) {
      if (gridContainer) gridContainer.classList.add('hidden');
      if (tableContainer) tableContainer.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    // Render Grid
    if (gridContainer) {
      gridContainer.classList.remove('hidden');
      gridContainer.innerHTML = filtered.map(f => {
        const consumed = Number(f.total_consumed) || 0;
        return `
          <div class="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all group flex flex-col justify-between relative overflow-hidden">
            <!-- Background Ambient Glow -->
            <div class="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none"></div>

            <div>
              <!-- Top Row: Icon + Category Badge + Actions -->
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700/80 text-3xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  ${f.icon || '🍪'}
                </div>

                <div class="flex items-center gap-1.5">
                  <button onclick="foodsCatalogModule.openEditFoodModal(${f.id})" 
                          class="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-slate-700/80 flex items-center justify-center text-xs transition-all"
                          title="Edit Makanan">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button onclick="foodsCatalogModule.deleteFood(${f.id}, '${escapeHtml(f.name)}')" 
                          class="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 flex items-center justify-center text-xs transition-all"
                          title="Hapus Makanan">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>

              <!-- Food Details -->
              <div class="mb-3">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-amber-300 border border-slate-700">
                    ${escapeHtml(f.category || 'Snack')}
                  </span>
                  <span class="text-xs text-slate-400 font-mono">
                    Satuan: <strong class="text-slate-200">${escapeHtml(f.unit || 'pcs')}</strong>
                  </span>
                </div>
                <h3 class="text-lg font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
                  ${escapeHtml(f.name)}
                </h3>
              </div>
            </div>

            <!-- Bottom Row: Consumption Counter + Catat Makan Button -->
            <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
              <div class="flex flex-col">
                <span class="text-[10px] uppercase font-bold text-slate-400">Total Dimakan</span>
                <span class="text-base font-black ${consumed > 0 ? 'text-emerald-400' : 'text-slate-500'}">
                  ${consumed} <span class="text-xs font-semibold text-slate-400">${escapeHtml(f.unit || 'pcs')}</span>
                </span>
              </div>

              <button onclick="foodsCatalogModule.openQuickLogModal(${f.id})" 
                      class="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5">
                <i class="fa-solid fa-plus text-xs"></i>
                <span>Catat Makan</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Table
    if (tableContainer) {
      const tbody = document.getElementById('foods-table-tbody');
      if (tbody) {
        tbody.innerHTML = filtered.map(f => {
          const consumed = Number(f.total_consumed) || 0;
          return `
            <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
              <td class="py-3 px-4 text-center text-2xl">${f.icon || '🍪'}</td>
              <td class="py-3 px-4 font-black text-white">${escapeHtml(f.name)}</td>
              <td class="py-3 px-4">
                <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-800 text-amber-300 border border-slate-700">
                  ${escapeHtml(f.category || 'Snack')}
                </span>
              </td>
              <td class="py-3 px-4 text-slate-300 font-mono text-xs">${escapeHtml(f.unit || 'pcs')}</td>
              <td class="py-3 px-4 text-center">
                <span class="px-3 py-1 rounded-full text-xs font-black ${consumed > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}">
                  ${consumed} ${escapeHtml(f.unit || 'pcs')}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button onclick="foodsCatalogModule.openQuickLogModal(${f.id})" class="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1">
                    <i class="fa-solid fa-plus"></i> Catat
                  </button>
                  <button onclick="foodsCatalogModule.openEditFoodModal(${f.id})" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1">
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  <button onclick="foodsCatalogModule.deleteFood(${f.id}, '${escapeHtml(f.name)}')" class="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-lg transition-all flex items-center gap-1">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  },

  setView(viewType) {
    this.currentView = viewType;
    const grid = document.getElementById('foods-cards-grid');
    const table = document.getElementById('foods-table-view');
    const btnGrid = document.getElementById('btn-view-grid');
    const btnTable = document.getElementById('btn-view-table');

    if (viewType === 'grid') {
      if (grid) grid.classList.remove('hidden');
      if (table) table.classList.add('hidden');
      if (btnGrid) btnGrid.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 transition-all';
      if (btnTable) btnTable.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 hover:text-white transition-all';
    } else {
      if (grid) grid.classList.add('hidden');
      if (table) table.classList.remove('hidden');
      if (btnGrid) btnGrid.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 hover:text-white transition-all';
      if (btnTable) btnTable.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 transition-all';
    }
  },

  // -----------------------------------------------------------
  // Food CRUD Actions
  // -----------------------------------------------------------
  openAddFoodModal() {
    this.populateCategoryDropdowns();
    const modal = document.getElementById('add-food-modal');
    const nameInput = document.getElementById('food-name-input');
    if (nameInput) nameInput.value = '';
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
        await this.loadCatalog();
        if (window.foodManagerModule) window.foodManagerModule.loadFoodData();
      } else {
        window.showToast(res.error || 'Gagal menambahkan makanan', 'error');
      }
    } catch (err) {
      window.showToast('Gagal: ' + err.message, 'error');
    }
  },

  openEditFoodModal(id) {
    const food = this.foodsList.find(f => f.id === Number(id));
    if (!food) return;

    this.activeEditFoodId = food.id;
    this.populateCategoryDropdowns();

    const modal = document.getElementById('edit-food-item-modal');
    const idInput = document.getElementById('edit-food-id-input');
    const nameInput = document.getElementById('edit-food-name-input');
    const catInput = document.getElementById('edit-food-cat-input');
    const unitInput = document.getElementById('edit-food-unit-input');
    const iconInput = document.getElementById('edit-food-icon-input');

    if (idInput) idInput.value = food.id;
    if (nameInput) nameInput.value = food.name;
    if (catInput) catInput.value = food.category || 'Snack Biskuit';
    if (unitInput) unitInput.value = food.unit || 'pcs';
    if (iconInput) iconInput.value = food.icon || '🍪';

    if (modal) modal.classList.remove('hidden');
  },

  closeEditFoodModal() {
    const modal = document.getElementById('edit-food-item-modal');
    if (modal) modal.classList.add('hidden');
    this.activeEditFoodId = null;
  },

  async saveEditFood() {
    if (!this.activeEditFoodId) return;

    const id = this.activeEditFoodId;
    const name = document.getElementById('edit-food-name-input')?.value;
    const category = document.getElementById('edit-food-cat-input')?.value;
    const unit = document.getElementById('edit-food-unit-input')?.value;
    const icon = document.getElementById('edit-food-icon-input')?.value;

    if (!name || !name.trim()) {
      window.showToast('Nama makanan wajib diisi!', 'warning');
      return;
    }

    try {
      const res = await window.api.updateFood(id, { name, category, unit, icon });
      if (res.success) {
        window.showToast(res.message || `Makanan '${name}' berhasil diperbarui!`, 'success');
        this.closeEditFoodModal();
        await this.loadCatalog();
        if (window.foodManagerModule) window.foodManagerModule.loadFoodData();
      } else {
        window.showToast(res.error || 'Gagal memperbarui makanan', 'error');
      }
    } catch (err) {
      window.showToast('Gagal: ' + err.message, 'error');
    }
  },

  async deleteFood(id, name) {
    if (!confirm(`Apakah Anda yakin ingin MENGHAPUS makanan '${name}'? Semua riwayat konsumsi makanan ini juga akan terhapus.`)) {
      return;
    }

    try {
      const res = await window.api.deleteFood(id);
      if (res.success) {
        window.showToast(`Makanan '${name}' berhasil dihapus!`, 'info');
        await this.loadCatalog();
        if (window.foodManagerModule) window.foodManagerModule.loadFoodData();
      } else {
        window.showToast(res.error || 'Gagal menghapus makanan', 'error');
      }
    } catch (err) {
      window.showToast('Gagal: ' + err.message, 'error');
    }
  },

  // -----------------------------------------------------------
  // Category CRUD Actions
  // -----------------------------------------------------------
  openCategoryModal() {
    this.resetCategoryForm();
    this.renderCategoriesListInModal();
    const modal = document.getElementById('manage-categories-modal');
    if (modal) modal.classList.remove('hidden');
  },

  closeCategoryModal() {
    const modal = document.getElementById('manage-categories-modal');
    if (modal) modal.classList.add('hidden');
    this.activeEditCatId = null;
  },

  resetCategoryForm() {
    this.activeEditCatId = null;
    const formTitle = document.getElementById('cat-form-title');
    const submitBtn = document.getElementById('cat-form-submit-btn');
    const nameInput = document.getElementById('cat-name-input');
    const iconInput = document.getElementById('cat-icon-input');
    const descInput = document.getElementById('cat-desc-input');

    if (formTitle) formTitle.textContent = 'Tambah Kategori Baru';
    if (submitBtn) submitBtn.textContent = 'Simpan Kategori';
    if (nameInput) nameInput.value = '';
    if (iconInput) iconInput.value = '🏷️';
    if (descInput) descInput.value = '';
  },

  renderCategoriesListInModal() {
    const container = document.getElementById('modal-categories-list');
    if (!container) return;

    container.innerHTML = this.categoriesList.map(c => {
      const count = this.foodsList.filter(f => (f.category || '').toLowerCase() === c.name.toLowerCase()).length;
      return `
        <div class="flex items-center justify-between p-3 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${c.icon || '🏷️'}</span>
            <div>
              <div class="font-black text-sm text-white flex items-center gap-2">
                <span>${escapeHtml(c.name)}</span>
                <span class="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                  ${count} makanan
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">${escapeHtml(c.description || 'Tidak ada deskripsi')}</p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button onclick="foodsCatalogModule.editCategory(${c.id})" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs rounded-lg transition-all" title="Edit Kategori">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="foodsCatalogModule.deleteCategory(${c.id}, '${escapeHtml(c.name)}')" class="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-lg transition-all" title="Hapus Kategori">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  editCategory(id) {
    const cat = this.categoriesList.find(c => c.id === Number(id));
    if (!cat) return;

    this.activeEditCatId = cat.id;
    const formTitle = document.getElementById('cat-form-title');
    const submitBtn = document.getElementById('cat-form-submit-btn');
    const nameInput = document.getElementById('cat-name-input');
    const iconInput = document.getElementById('cat-icon-input');
    const descInput = document.getElementById('cat-desc-input');

    if (formTitle) formTitle.textContent = `Edit Kategori: ${cat.name}`;
    if (submitBtn) submitBtn.textContent = 'Perbarui Kategori';
    if (nameInput) nameInput.value = cat.name;
    if (iconInput) iconInput.value = cat.icon || '🏷️';
    if (descInput) descInput.value = cat.description || '';
  },

  async saveCategory() {
    const name = document.getElementById('cat-name-input')?.value;
    const icon = document.getElementById('cat-icon-input')?.value;
    const description = document.getElementById('cat-desc-input')?.value;

    if (!name || !name.trim()) {
      window.showToast('Nama kategori wajib diisi!', 'warning');
      return;
    }

    try {
      if (this.activeEditCatId) {
        // Edit existing
        const res = await window.api.updateCategory(this.activeEditCatId, { name, icon, description });
        if (res.success) {
          window.showToast(res.message || 'Kategori berhasil diperbarui!', 'success');
          this.resetCategoryForm();
          await this.loadCatalog();
          this.renderCategoriesListInModal();
        } else {
          window.showToast(res.error || 'Gagal memperbarui kategori', 'error');
        }
      } else {
        // Add new
        const res = await window.api.addCategory({ name, icon, description });
        if (res.success) {
          window.showToast(res.message || 'Kategori berhasil ditambahkan!', 'success');
          this.resetCategoryForm();
          await this.loadCatalog();
          this.renderCategoriesListInModal();
        } else {
          window.showToast(res.error || 'Gagal menambahkan kategori', 'error');
        }
      }
    } catch (err) {
      window.showToast('Gagal: ' + err.message, 'error');
    }
  },

  async deleteCategory(id, name) {
    if (!confirm(`Hapus kategori '${name}'? Makanan dalam kategori ini akan dialihkan ke kategori 'Snack'.`)) {
      return;
    }

    try {
      const res = await window.api.deleteCategory(id);
      if (res.success) {
        window.showToast(`Kategori '${name}' berhasil dihapus!`, 'info');
        await this.loadCatalog();
        this.renderCategoriesListInModal();
      } else {
        window.showToast(res.error || 'Gagal menghapus kategori', 'error');
      }
    } catch (err) {
      window.showToast('Gagal: ' + err.message, 'error');
    }
  },

  // -----------------------------------------------------------
  // Quick Log Modal from Food Card
  // -----------------------------------------------------------
  openQuickLogModal(foodId) {
    const food = this.foodsList.find(f => f.id === Number(foodId));
    if (!food) return;

    const modal = document.getElementById('quick-food-modal');
    const nameEl = document.getElementById('quick-food-modal-name');
    const iconEl = document.getElementById('quick-food-modal-icon');
    const unitEl = document.getElementById('quick-food-modal-unit');
    const foodIdInput = document.getElementById('quick-food-modal-food-id');
    const pSelect = document.getElementById('quick-food-modal-participant');

    if (nameEl) nameEl.textContent = food.name;
    if (iconEl) iconEl.textContent = food.icon || '🍪';
    if (unitEl) unitEl.textContent = food.unit || 'pcs';
    if (foodIdInput) foodIdInput.value = food.id;

    // Populate DPR II participants
    if (pSelect) {
      const participants = [
        { code: 'dprii-001', name: 'Hafiz' },
        { code: 'dprii-002', name: 'Viko' },
        { code: 'dprii-003', name: 'Tiyan' },
        { code: 'dprii-004', name: 'Sarah' },
        { code: 'dprii-005', name: 'Rizka' },
        { code: 'dprii-006', name: 'Zahra' }
      ];
      pSelect.innerHTML = participants.map(p => `
        <option value="${p.code}">${p.code} - ${p.name}</option>
      `).join('');
    }

    if (modal) modal.classList.remove('hidden');
  },

  closeQuickLogModal() {
    const modal = document.getElementById('quick-food-modal');
    if (modal) modal.classList.add('hidden');
  },

  async saveQuickFoodLog() {
    const foodId = document.getElementById('quick-food-modal-food-id')?.value;
    const participantCode = document.getElementById('quick-food-modal-participant')?.value;
    const quantity = document.getElementById('quick-food-modal-qty')?.value || 1;
    const notes = document.getElementById('quick-food-modal-notes')?.value || '';

    if (!participantCode || !foodId) {
      window.showToast('Pilih peserta terlebih dahulu!', 'warning');
      return;
    }

    try {
      const res = await window.api.recordFoodConsumption({
        participantCode,
        foodId: Number(foodId),
        quantity: Number(quantity),
        notes
      });

      if (res.success) {
        window.showToast(res.message, 'success');
        this.closeQuickLogModal();
        await this.loadCatalog();
        if (window.foodManagerModule) window.foodManagerModule.loadFoodData();
      } else {
        window.showToast(res.message || 'Gagal mencatat konsumsi', 'error');
      }
    } catch (err) {
      window.showToast('Gagal: ' + err.message, 'error');
    }
  },

  // -----------------------------------------------------------
  // Toggle Collapsible Scanner Section
  // -----------------------------------------------------------
  toggleScanner() {
    const scannerSection = document.getElementById('collapsible-scanner-section');
    const toggleBtn = document.getElementById('btn-toggle-scanner-section');
    if (!scannerSection) return;

    const isHidden = scannerSection.classList.contains('hidden');
    if (isHidden) {
      scannerSection.classList.remove('hidden');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-up mr-1.5"></i>Tutup Scanner';
        toggleBtn.className = 'px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center';
      }
      const scanInput = document.getElementById('scan-input');
      if (scanInput) setTimeout(() => scanInput.focus(), 100);
    } else {
      scannerSection.classList.add('hidden');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fa-solid fa-qrcode mr-1.5"></i>Buka Scanner Barcode';
        toggleBtn.className = 'px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs rounded-xl border border-emerald-500/30 transition-all flex items-center';
      }
    }
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.foodsCatalogModule = foodsCatalogModule;
