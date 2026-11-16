const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Support Vercel serverless /tmp directory or local data directory
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || Boolean(process.env.NOW_REGION);
const DATA_DIR = isVercel ? '/tmp' : path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create DATA_DIR, using fallback memory/tmp:', e);
  }
}

const DB_PATH = path.join(DATA_DIR, 'meal_erp.db');
let db;

try {
  db = new Database(DB_PATH);
} catch (err) {
  console.warn('Failed to open database file, falling back to in-memory SQLite:', err);
  db = new Database(':memory:');
}

// Enable foreign keys & WAL mode
try {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
} catch (e) {
  // Pragma may fail in some memory/read-only contexts, safely ignore
}

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      department TEXT NOT NULL DEFAULT 'DPR II',
      category TEXT NOT NULL DEFAULT 'Peserta',
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      dietary_type TEXT NOT NULL DEFAULT 'Reguler',
      allergies TEXT DEFAULT 'Tidak ada',
      daily_quota INTEGER NOT NULL DEFAULT 3,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      category TEXT DEFAULT 'Snack',
      unit TEXT DEFAULT 'pcs',
      icon TEXT DEFAULT '🍪',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      icon TEXT DEFAULT '🏷️',
      description TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_consumption_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
      participant_code TEXT NOT NULL,
      participant_name TEXT NOT NULL,
      food_id INTEGER NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
      food_name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      date TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS meal_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      max_quota_per_person INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS daily_menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      meal_session_id INTEGER NOT NULL REFERENCES meal_sessions(id) ON DELETE CASCADE,
      menu_title TEXT NOT NULL,
      menu_description TEXT,
      vendor_name TEXT DEFAULT 'Catering Mitra Utama',
      cost_per_portion REAL NOT NULL DEFAULT 30000,
      target_portions INTEGER NOT NULL DEFAULT 100,
      notes TEXT,
      UNIQUE(date, meal_session_id)
    );

    CREATE TABLE IF NOT EXISTS meal_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
      participant_code TEXT NOT NULL,
      meal_session_id INTEGER NOT NULL REFERENCES meal_sessions(id),
      daily_menu_id INTEGER REFERENCES daily_menus(id),
      date TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      portion_count INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL,
      notes TEXT,
      scanned_by TEXT DEFAULT 'Gate 1 (Utama)'
    );

    CREATE INDEX IF NOT EXISTS idx_food_logs_part ON food_consumption_logs(participant_id);
    CREATE INDEX IF NOT EXISTS idx_food_logs_food ON food_consumption_logs(food_id);
    CREATE INDEX IF NOT EXISTS idx_participants_code ON participants(participant_code);
  `);

  // Check if system_settings has initial config
  const existingConfig = db.prepare('SELECT value FROM system_settings WHERE key = ?').get('event_name');
  if (!existingConfig) {
    seedInitialData();
  }

  // Ensure default categories exist
  seedDefaultCategories();
}

const DEFAULT_CATEGORIES = [
  { name: 'Snack Biskuit', icon: '🍪', description: 'Biskuit manis dan cookies renyah' },
  { name: 'Snack Jagung', icon: '🌽', description: 'Snack ekstrudat rasa jagung bakar & keju' },
  { name: 'Snack Gurih', icon: '🍝', description: 'Makaroni pedas, keripik & camilan asin' },
  { name: 'Biskuit Manis', icon: '🍘', description: 'Malkist, crackers bertabur gula dan kelapa' },
  { name: 'Cokelat Wafer', icon: '🍫', description: 'Wafer berlapis cokelat tebal & karamel' },
  { name: 'Snack Keju', icon: '🧀', description: 'Snack bola keju & stick keju gurih' },
  { name: 'Makanan Berat', icon: '🍱', description: 'Nasi kotak, bento, dan hidangan utama' },
  { name: 'Minuman Segar', icon: '🧃', description: 'Kopi, teh kemasan, susu & air mineral' }
];

function seedDefaultCategories() {
  try {
    const count = db.prepare('SELECT COUNT(*) as count FROM food_categories').get().count;
    if (count === 0) {
      const insertCat = db.prepare('INSERT OR IGNORE INTO food_categories (name, icon, description) VALUES (?, ?, ?)');
      for (const c of DEFAULT_CATEGORIES) {
        insertCat.run(c.name, c.icon, c.description);
      }
    }
  } catch (err) {
    console.error('Error seeding default categories:', err);
  }
}

function getTodayStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function seedInitialData() {
  console.log('Seeding initial data for SmartFood ERP (DPR II Monitoring)...');

  // 1. Settings
  const insertSetting = db.prepare('INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)');
  insertSetting.run('event_name', 'Monitoring Konsumsi Makanan & Snack DPR II');
  insertSetting.run('organization', 'DPR II Team');
  insertSetting.run('currency', 'IDR');
  insertSetting.run('audio_alert_enabled', 'true');
  insertSetting.run('auto_session_detect', 'true');

  // 2. Participants Requested by User:
  // dprii-001 = Hafiz
  // dprii-002 = Viko
  // dprii-003 = Tiyan
  // dprii-004 = Sarah
  // dprii-005 = Rizka
  // dprii-006 = Zahra
  const targetParticipants = [
    { code: 'dprii-001', name: 'Hafiz', dept: 'DPR II', cat: 'Peserta', phone: '08123456701', diet: 'Reguler', allergy: 'Tidak ada' },
    { code: 'dprii-002', name: 'Viko', dept: 'DPR II', cat: 'Peserta', phone: '08123456702', diet: 'Reguler', allergy: 'Tidak ada' },
    { code: 'dprii-003', name: 'Tiyan', dept: 'DPR II', cat: 'Peserta', phone: '08123456703', diet: 'Reguler', allergy: 'Tidak ada' },
    { code: 'dprii-004', name: 'Sarah', dept: 'DPR II', cat: 'Peserta', phone: '08123456704', diet: 'Reguler', allergy: 'Tidak ada' },
    { code: 'dprii-005', name: 'Rizka', dept: 'DPR II', cat: 'Peserta', phone: '08123456705', diet: 'Reguler', allergy: 'Tidak ada' },
    { code: 'dprii-006', name: 'Zahra', dept: 'DPR II', cat: 'Peserta', phone: '08123456706', diet: 'Reguler', allergy: 'Tidak ada' }
  ];

  const insertP = db.prepare(`
    INSERT OR REPLACE INTO participants (participant_code, name, department, category, phone, email, dietary_type, allergies, daily_quota, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 5, 'active')
  `);

  for (const p of targetParticipants) {
    const email = `${p.name.toLowerCase()}@dprii.org`;
    insertP.run(p.code, p.name, p.dept, p.cat, p.phone, email, p.diet, p.allergy);
  }

  // 3. Food Items Requested by User:
  // good time, momogi, makaroni, malkist kelapa, etc.
  const targetFoods = [
    { name: 'Good Time', category: 'Snack Biskuit', unit: 'bungkus', icon: '🍪' },
    { name: 'Momogi', category: 'Snack Jagung', unit: 'pcs', icon: '🌽' },
    { name: 'Makaroni', category: 'Snack Gurih', unit: 'bungkus', icon: '🍝' },
    { name: 'Malkist Kelapa', category: 'Biskuit Manis', unit: 'bungkus', icon: '🍘' },
    { name: 'Beng-Beng', category: 'Cokelat Wafer', unit: 'pcs', icon: '🍫' },
    { name: 'Chiki Balls', category: 'Snack Keju', unit: 'bungkus', icon: '🧀' }
  ];

  const insertFood = db.prepare(`
    INSERT OR REPLACE INTO food_items (name, category, unit, icon)
    VALUES (?, ?, ?, ?)
  `);

  for (const f of targetFoods) {
    insertFood.run(f.name, f.category, f.unit, f.icon);
  }

  // 4. Sample Consumption Records for Realistic Leaderboard & Food Recap
  const today = getTodayStr();
  const allP = db.prepare('SELECT id, participant_code, name FROM participants').all();
  const allF = db.prepare('SELECT id, name FROM food_items').all();

  const pMap = {};
  allP.forEach(p => { pMap[p.participant_code] = p; });

  const fMap = {};
  allF.forEach(f => { fMap[f.name] = f; });

  const sampleConsumptions = [
    // Hafiz (dprii-001): 8 total (Juara 1)
    { code: 'dprii-001', food: 'Good Time', qty: 3, notes: 'Camilan pagi & siang' },
    { code: 'dprii-001', food: 'Momogi', qty: 2, notes: 'Teman ngobrol' },
    { code: 'dprii-001', food: 'Makaroni', qty: 2, notes: 'Makaroni pedas' },
    { code: 'dprii-001', food: 'Malkist Kelapa', qty: 1, notes: 'Camilan sore' },

    // Viko (dprii-002): 6 total (Juara 2)
    { code: 'dprii-002', food: 'Momogi', qty: 3, notes: 'Momogi jagung bakar' },
    { code: 'dprii-002', food: 'Good Time', qty: 2, notes: 'Good time choco dip' },
    { code: 'dprii-002', food: 'Makaroni', qty: 1, notes: 'Makaroni gurih' },

    // Tiyan (dprii-003): 5 total (Juara 3)
    { code: 'dprii-003', food: 'Malkist Kelapa', qty: 2, notes: 'Malkist kelapa manis' },
    { code: 'dprii-003', food: 'Good Time', qty: 2, notes: 'Good time biskuit' },
    { code: 'dprii-003', food: 'Momogi', qty: 1, notes: 'Snack momogi' },

    // Sarah (dprii-004): 4 total
    { code: 'dprii-004', food: 'Makaroni', qty: 2, notes: 'Makaroni pedas' },
    { code: 'dprii-004', food: 'Good Time', qty: 1, notes: 'Good time' },
    { code: 'dprii-004', food: 'Momogi', qty: 1, notes: 'Momogi keju' },

    // Rizka (dprii-005): 3 total
    { code: 'dprii-005', food: 'Momogi', qty: 2, notes: 'Momogi cokelat' },
    { code: 'dprii-005', food: 'Malkist Kelapa', qty: 1, notes: 'Malkist kelapa' },

    // Zahra (dprii-006): 2 total
    { code: 'dprii-006', food: 'Good Time', qty: 1, notes: 'Good time cookies' },
    { code: 'dprii-006', food: 'Malkist Kelapa', qty: 1, notes: 'Malkist' }
  ];

  const insertFoodLog = db.prepare(`
    INSERT INTO food_consumption_logs (participant_id, participant_code, participant_name, food_id, food_name, quantity, date, timestamp, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?)
  `);

  for (const c of sampleConsumptions) {
    const p = pMap[c.code];
    const f = fMap[c.food];
    if (p && f) {
      insertFoodLog.run(p.id, p.participant_code, p.name, f.id, f.name, c.qty, today, c.notes);
    }
  }

  // 5. Standard Meal Sessions
  const insertSession = db.prepare(`
    INSERT OR REPLACE INTO meal_sessions (id, code, name, start_time, end_time, max_quota_per_person, is_active, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSession.run(1, 'BREAKFAST', 'Sarapan Pagi', '06:30', '09:00', 1, 1, 1);
  insertSession.run(2, 'LUNCH', 'Makan Siang', '11:30', '14:00', 1, 1, 2);
  insertSession.run(3, 'SNACK', 'Snack & Coffee Break', '15:30', '16:45', 1, 1, 3);
  insertSession.run(4, 'DINNER', 'Makan Malam', '18:30', '21:00', 1, 1, 4);

  console.log('Database successfully initialized and seeded with DPR II participants & snacks!');
}

// -------------------------------------------------------------
// Food Categories APIs
// -------------------------------------------------------------

function getCategories() {
  return db.prepare(`
    SELECT c.*, COUNT(f.id) AS food_count
    FROM food_categories c
    LEFT JOIN food_items f ON LOWER(f.category) = LOWER(c.name)
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all();
}

function addCategory({ name, icon = '🏷️', description = '' }) {
  const stmt = db.prepare(`
    INSERT INTO food_categories (name, icon, description)
    VALUES (?, ?, ?)
  `);
  return stmt.run(name.trim(), (icon || '🏷️').trim(), (description || '').trim());
}

function updateCategory(id, { name, icon, description }) {
  const oldCat = db.prepare('SELECT name FROM food_categories WHERE id = ?').get(Number(id));
  const newName = name.trim();
  const stmt = db.prepare(`
    UPDATE food_categories
    SET name = ?, icon = COALESCE(?, icon), description = COALESCE(?, description)
    WHERE id = ?
  `);
  const res = stmt.run(newName, icon ? icon.trim() : null, description !== undefined ? description.trim() : null, Number(id));

  // If category name changed, also update foods belonging to this category
  if (oldCat && oldCat.name !== newName) {
    db.prepare('UPDATE food_items SET category = ? WHERE LOWER(category) = LOWER(?)').run(newName, oldCat.name);
  }
  return res;
}

function deleteCategory(id) {
  const cat = db.prepare('SELECT name FROM food_categories WHERE id = ?').get(Number(id));
  if (cat) {
    // Reassign foods in this category to 'Snack' so they aren't unassigned
    db.prepare("UPDATE food_items SET category = 'Snack' WHERE LOWER(category) = LOWER(?)").run(cat.name);
  }
  return db.prepare('DELETE FROM food_categories WHERE id = ?').run(Number(id));
}

// -------------------------------------------------------------
// Food Items & Consumption Log APIs
// -------------------------------------------------------------

function getFoods(filters = {}) {
  let query = `
    SELECT f.*, COALESCE(SUM(l.quantity), 0) AS total_consumed
    FROM food_items f
    LEFT JOIN food_consumption_logs l ON f.id = l.food_id
    WHERE 1=1
  `;
  const params = [];

  if (filters.category && filters.category !== 'all' && filters.category.trim()) {
    query += ' AND LOWER(f.category) = LOWER(?)';
    params.push(filters.category.trim());
  }

  if (filters.search && filters.search.trim()) {
    query += ' AND (LOWER(f.name) LIKE ? OR LOWER(f.category) LIKE ?)';
    const term = `%${filters.search.trim().toLowerCase()}%`;
    params.push(term, term);
  }

  query += ' GROUP BY f.id';

  if (filters.sortBy === 'name') {
    query += ' ORDER BY f.name ASC';
  } else if (filters.sortBy === 'newest') {
    query += ' ORDER BY f.id DESC';
  } else {
    query += ' ORDER BY total_consumed DESC, f.name ASC';
  }

  return db.prepare(query).all(...params);
}

function addFood({ name, category = 'Snack', unit = 'pcs', icon = '🍪' }) {
  const stmt = db.prepare(`
    INSERT INTO food_items (name, category, unit, icon)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(name.trim(), category.trim(), unit.trim(), icon.trim());
}

function deleteFood(id) {
  const fid = Number(id);
  // Also clean up any consumption logs for this food item
  db.prepare('DELETE FROM food_consumption_logs WHERE food_id = ?').run(fid);
  return db.prepare('DELETE FROM food_items WHERE id = ?').run(fid);
}

function updateFood(id, { name, category, unit, icon }) {
  const fid = Number(id);
  const oldFood = db.prepare('SELECT name FROM food_items WHERE id = ?').get(fid);
  const newName = name.trim();
  const stmt = db.prepare(`
    UPDATE food_items
    SET name = ?, category = ?, unit = ?, icon = ?
    WHERE id = ?
  `);
  const res = stmt.run(newName, (category || 'Snack').trim(), (unit || 'pcs').trim(), (icon || '🍪').trim(), fid);

  // If food name changed, sync in consumption logs
  if (oldFood && oldFood.name !== newName) {
    db.prepare('UPDATE food_consumption_logs SET food_name = ? WHERE food_id = ?').run(newName, fid);
  }
  return res;
}

function updateFoodConsumptionLog(id, { quantity, notes }) {
  const qty = Number(quantity);
  if (qty <= 0) {
    return db.prepare('DELETE FROM food_consumption_logs WHERE id = ?').run(Number(id));
  }
  const stmt = db.prepare(`
    UPDATE food_consumption_logs
    SET quantity = ?, notes = COALESCE(?, notes)
    WHERE id = ?
  `);
  return stmt.run(qty, notes || null, Number(id));
}

function deleteFoodConsumptionLog(id) {
  return db.prepare('DELETE FROM food_consumption_logs WHERE id = ?').run(Number(id));
}

// Reset food consumption for a specific participant (kembalikan ke 0)
function resetParticipantFood(participantCode) {
  const code = (participantCode || '').trim();
  const participant = db.prepare('SELECT * FROM participants WHERE UPPER(participant_code) = UPPER(?)').get(code);
  if (!participant) {
    return { success: false, message: `Peserta '${code}' tidak ditemukan.` };
  }
  const stmt = db.prepare('DELETE FROM food_consumption_logs WHERE UPPER(participant_code) = UPPER(?)');
  const result = stmt.run(code);
  return {
    success: true,
    message: `Konsumsi makanan untuk ${participant.name} (${code}) berhasil dikembalikan ke 0!`,
    deleted_rows: result.changes
  };
}

// Reset ALL participants' food consumption back to 0 (Kembalikan ke 0 untuk semua peserta)
function resetAllFoodConsumption() {
  const result = db.prepare('DELETE FROM food_consumption_logs').run();
  return {
    success: true,
    message: 'Seluruh data konsumsi makanan peserta berhasil dikembalikan ke 0! Klasemen dimulai dari awal.',
    deleted_rows: result.changes
  };
}

// Set or adjust a participant's specific food quantity (misal Good Time diubah ke 0 atau angka lain)
function setParticipantFoodQuantity(participantCode, foodId, targetQuantity) {
  const code = (participantCode || '').trim();
  const qty = Number(targetQuantity);
  const fid = Number(foodId);

  const participant = db.prepare('SELECT * FROM participants WHERE UPPER(participant_code) = UPPER(?)').get(code);
  if (!participant) {
    return { success: false, message: `Peserta '${code}' tidak ditemukan.` };
  }

  const food = db.prepare('SELECT * FROM food_items WHERE id = ?').get(fid);
  if (!food) {
    return { success: false, message: 'Jenis makanan tidak ditemukan.' };
  }

  // Delete existing records for this participant and food
  db.prepare('DELETE FROM food_consumption_logs WHERE UPPER(participant_code) = UPPER(?) AND food_id = ?').run(code, fid);

  if (qty > 0) {
    const today = getTodayStr();
    db.prepare(`
      INSERT INTO food_consumption_logs (participant_id, participant_code, participant_name, food_id, food_name, quantity, date, timestamp, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?)
    `).run(
      participant.id,
      participant.participant_code,
      participant.name,
      food.id,
      food.name,
      qty,
      today,
      `Koreksi manual: ${qty} ${food.unit || 'pcs'} ${food.name}`
    );
  }

  return {
    success: true,
    message: qty <= 0 
      ? `Konsumsi ${food.name} untuk ${participant.name} berhasil dikembalikan ke 0!`
      : `Konsumsi ${food.name} untuk ${participant.name} berhasil diubah menjadi ${qty} ${food.unit || 'pcs'}!`,
    participant,
    food,
    new_quantity: qty
  };
}

function recordFoodConsumption({ participantCode, foodId, quantity = 1, notes = '' }) {
  const code = (participantCode || '').trim();
  const qty = Math.max(1, Number(quantity) || 1);
  const today = getTodayStr();

  const participant = db.prepare('SELECT * FROM participants WHERE UPPER(participant_code) = UPPER(?)').get(code);
  if (!participant) {
    return { success: false, message: `Peserta dengan ID '${code}' tidak ditemukan.` };
  }

  const food = db.prepare('SELECT * FROM food_items WHERE id = ?').get(Number(foodId));
  if (!food) {
    return { success: false, message: 'Jenis makanan yang dipilih tidak valid.' };
  }

  const stmt = db.prepare(`
    INSERT INTO food_consumption_logs (participant_id, participant_code, participant_name, food_id, food_name, quantity, date, timestamp, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?)
  `);

  const result = stmt.run(
    participant.id,
    participant.participant_code,
    participant.name,
    food.id,
    food.name,
    qty,
    today,
    notes || `Makan ${qty} ${food.unit || 'pcs'} ${food.name}`
  );

  return {
    success: true,
    message: `Berhasil mencatat: ${participant.name} makan ${qty} ${food.unit || 'pcs'} ${food.name}!`,
    log_id: result.lastInsertRowid,
    participant,
    food,
    quantity: qty
  };
}

// Comprehensive Food Recap & Leaderboard (Klasemen)
function getFoodRecap() {
  // 1. Food stats: e.g. Good Time dimakan berapa, Momogi berapa, dll.
  const foodStats = db.prepare(`
    SELECT f.id, f.name, f.category, f.unit, f.icon,
           COALESCE(SUM(l.quantity), 0) AS total_eaten,
           COUNT(DISTINCT l.participant_id) AS total_consumers
    FROM food_items f
    LEFT JOIN food_consumption_logs l ON f.id = l.food_id
    GROUP BY f.id
    ORDER BY total_eaten DESC, f.name ASC
  `).all();

  const totalFoodEaten = foodStats.reduce((acc, f) => acc + f.total_eaten, 0);

  // 2. Leaderboard (Klasemen): Siapa yang makan makanan paling banyak
  const leaderboardRaw = db.prepare(`
    SELECT p.id, p.participant_code, p.name, p.department, p.category,
           COALESCE(SUM(l.quantity), 0) AS total_items_eaten,
           COUNT(l.id) AS total_eating_events,
           MAX(l.timestamp) AS last_eaten_time
    FROM participants p
    LEFT JOIN food_consumption_logs l ON p.id = l.participant_id
    WHERE p.status = 'active'
    GROUP BY p.id
    ORDER BY total_items_eaten DESC, p.name ASC
  `).all();

  // Assign rankings (1, 2, 3...) and medal badges
  const leaderboard = leaderboardRaw.map((p, index) => {
    const rank = index + 1;
    let badge = `${rank}`;
    if (rank === 1) badge = '🥇 Juara 1';
    else if (rank === 2) badge = '🥈 Juara 2';
    else if (rank === 3) badge = '🥉 Juara 3';

    return {
      rank,
      badge,
      ...p
    };
  });

  // 3. Detail breakdown per participant for the dropdown
  const participantsBreakdown = {};
  for (const p of leaderboard) {
    const items = db.prepare(`
      SELECT f.id, f.name, f.icon, f.unit,
             SUM(l.quantity) AS quantity
      FROM food_consumption_logs l
      JOIN food_items f ON l.food_id = f.id
      WHERE l.participant_id = ?
      GROUP BY f.id
      ORDER BY quantity DESC
    `).all(p.id);

    const history = db.prepare(`
      SELECT l.id, l.food_name, l.quantity, l.timestamp, l.notes, f.icon, f.unit
      FROM food_consumption_logs l
      LEFT JOIN food_items f ON l.food_id = f.id
      WHERE l.participant_id = ?
      ORDER BY l.id DESC
      LIMIT 10
    `).all(p.id);

    participantsBreakdown[p.participant_code] = {
      participant: p,
      total_eaten: p.total_items_eaten,
      items: items,
      history: history
    };
  }

  // Recent 10 snack logs
  const recentSnackLogs = db.prepare(`
    SELECT l.*, f.icon, f.unit
    FROM food_consumption_logs l
    LEFT JOIN food_items f ON l.food_id = f.id
    ORDER BY l.id DESC
    LIMIT 10
  `).all();

  return {
    total_food_eaten: totalFoodEaten,
    food_stats: foodStats,
    leaderboard: leaderboard,
    participants_breakdown: participantsBreakdown,
    recent_snack_logs: recentSnackLogs
  };
}

// -------------------------------------------------------------
// Existing Participants & Dashboard Summary APIs
// -------------------------------------------------------------

function getDashboardSummary(selectedDate = getTodayStr()) {
  const totalParticipants = db.prepare("SELECT COUNT(*) AS total FROM participants WHERE status = 'active'").get().total;
  const currentSessions = db.prepare('SELECT * FROM meal_sessions ORDER BY order_index ASC').all();

  const sessionStats = currentSessions.map(session => {
    const menu = db.prepare('SELECT * FROM daily_menus WHERE date = ? AND meal_session_id = ?').get(selectedDate, session.id) || {
      menu_title: 'Snack & Prasmanan DPR II',
      cost_per_portion: 15000,
      target_portions: totalParticipants
    };

    const consumed = db.prepare(`
      SELECT COUNT(DISTINCT participant_id) AS count,
             COALESCE(SUM(portion_count), 0) AS total_portions
      FROM meal_logs
      WHERE date = ? AND meal_session_id = ? AND status IN ('SUCCESS', 'OVERRIDE_APPROVED')
    `).get(selectedDate, session.id);

    const doubleRejected = db.prepare(`
      SELECT COUNT(*) AS count
      FROM meal_logs
      WHERE date = ? AND meal_session_id = ? AND status = 'REJECTED_DOUBLE'
    `).get(selectedDate, session.id).count;

    return {
      ...session,
      menu,
      consumed_count: consumed.count,
      total_portions: consumed.total_portions,
      double_rejected: doubleRejected,
      remaining_portions: Math.max(0, menu.target_portions - consumed.total_portions),
      attendance_rate: totalParticipants > 0 ? Math.round((consumed.count / totalParticipants) * 100) : 0,
      estimated_cost: consumed.total_portions * menu.cost_per_portion
    };
  });

  const totalPortionsConsumedToday = sessionStats.reduce((acc, s) => acc + s.total_portions, 0);
  const totalCostToday = sessionStats.reduce((acc, s) => acc + s.estimated_cost, 0);
  const totalDoubleBlockedToday = sessionStats.reduce((acc, s) => acc + s.double_rejected, 0);

  const recentLogs = db.prepare(`
    SELECT l.*, p.name AS participant_name, p.department, p.dietary_type, p.allergies, s.name AS session_name
    FROM meal_logs l
    JOIN participants p ON l.participant_id = p.id
    JOIN meal_sessions s ON l.meal_session_id = s.id
    WHERE l.date = ?
    ORDER BY l.id DESC
    LIMIT 8
  `).all(selectedDate);

  const deptStats = db.prepare(`
    SELECT p.department,
           COUNT(DISTINCT p.id) AS total_members,
           COUNT(DISTINCT CASE WHEN l.status IN ('SUCCESS', 'OVERRIDE_APPROVED') THEN l.participant_id END) AS eaten_members
    FROM participants p
    LEFT JOIN meal_logs l ON p.id = l.participant_id AND l.date = ?
    WHERE p.status = 'active'
    GROUP BY p.department
    ORDER BY total_members DESC
  `).all(selectedDate);

  // Also include food recap in dashboard summary!
  const foodRecap = getFoodRecap();

  return {
    date: selectedDate,
    total_participants: totalParticipants,
    total_portions_consumed: totalPortionsConsumedToday,
    total_cost: totalCostToday,
    total_double_blocked: totalDoubleBlockedToday,
    sessions: sessionStats,
    recent_logs: recentLogs,
    department_stats: deptStats,
    food_recap: foodRecap
  };
}

function processMealScan({ participantCode, sessionId, overrideApproved = false, notes = '', scannedBy = 'Gate 1' }) {
  const code = (participantCode || '').trim();
  const today = getTodayStr();

  if (!code) {
    return { success: false, reason: 'INVALID_CODE', message: 'Kode peserta tidak boleh kosong.' };
  }

  const participant = db.prepare('SELECT * FROM participants WHERE UPPER(participant_code) = UPPER(?)').get(code);
  if (!participant) {
    return {
      success: false,
      reason: 'NOT_FOUND',
      message: `Peserta dengan ID '${code}' tidak terdaftar.`
    };
  }

  if (participant.status !== 'active') {
    return {
      success: false,
      reason: 'INACTIVE',
      message: `Peserta '${participant.name}' berstatus nonaktif.`,
      participant
    };
  }

  let targetSession = null;
  if (sessionId) {
    targetSession = db.prepare('SELECT * FROM meal_sessions WHERE id = ?').get(sessionId);
  } else {
    const nowTime = new Date().toTimeString().substring(0, 5);
    targetSession = db.prepare(`
      SELECT * FROM meal_sessions 
      WHERE is_active = 1 
      ORDER BY 
        CASE WHEN ? BETWEEN start_time AND end_time THEN 0 ELSE 1 END,
        order_index ASC
      LIMIT 1
    `).get(nowTime);
  }

  if (!targetSession) {
    return {
      success: false,
      reason: 'NO_SESSION',
      message: 'Tidak ada sesi yang aktif saat ini.',
      participant
    };
  }

  const menu = db.prepare('SELECT * FROM daily_menus WHERE date = ? AND meal_session_id = ?').get(today, targetSession.id) || {
    id: null,
    menu_title: 'Snack & Makanan DPR II',
    cost_per_portion: 15000,
    target_portions: 30
  };

  const existingClaim = db.prepare(`
    SELECT * FROM meal_logs 
    WHERE participant_id = ? AND meal_session_id = ? AND date = ? 
      AND status IN ('SUCCESS', 'OVERRIDE_APPROVED')
    ORDER BY id DESC LIMIT 1
  `).get(participant.id, targetSession.id, today);

  if (existingClaim && !overrideApproved) {
    const insertLog = db.prepare(`
      INSERT INTO meal_logs (participant_id, participant_code, meal_session_id, daily_menu_id, date, timestamp, portion_count, status, notes, scanned_by)
      VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'), 0, 'REJECTED_DOUBLE', ?, ?)
    `);
    insertLog.run(
      participant.id, participant.participant_code, targetSession.id, menu.id, today,
      `Klaim ganda dicegah. Terakhir scan pada ${existingClaim.timestamp}`,
      scannedBy
    );

    return {
      success: false,
      reason: 'ALREADY_CLAIMED',
      message: `DOUBLE CLAIM: ${participant.name} sudah mengambil makanan di sesi ${targetSession.name}!`,
      lastClaimTime: existingClaim.timestamp,
      participant,
      session: targetSession,
      menu
    };
  }

  const logStatus = overrideApproved ? 'OVERRIDE_APPROVED' : 'SUCCESS';
  const logNote = overrideApproved 
    ? (notes || 'Porsi tambahan disetujui panitia')
    : (notes || 'Check-in berhasil via Barcode/QR Scanner');

  const insertLog = db.prepare(`
    INSERT INTO meal_logs (participant_id, participant_code, meal_session_id, daily_menu_id, date, timestamp, portion_count, status, notes, scanned_by)
    VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'), 1, ?, ?, ?)
  `);

  const result = insertLog.run(
    participant.id, participant.participant_code, targetSession.id, menu.id, today,
    logStatus, logNote, scannedBy
  );

  return {
    success: true,
    reason: logStatus,
    message: overrideApproved 
      ? `PORSI TAMBAHAN DISETUJUI untuk ${participant.name}`
      : `BERHASIL! Silakan ambil makanan untuk ${participant.name}`,
    log_id: result.lastInsertRowid,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    participant,
    session: targetSession,
    menu,
    has_allergy: participant.allergies && participant.allergies.toLowerCase() !== 'tidak ada',
    allergy_warning: participant.allergies,
    dietary_type: participant.dietary_type
  };
}

function getParticipants({ search = '', department = '', category = '', dietary = '' } = {}) {
  let query = 'SELECT * FROM participants WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (participant_code LIKE ? OR name LIKE ? OR phone LIKE ? OR email LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  if (department) {
    query += ' AND department = ?';
    params.push(department);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (dietary) {
    query += ' AND dietary_type = ?';
    params.push(dietary);
  }

  query += ' ORDER BY id ASC';
  return db.prepare(query).all(...params);
}

function addParticipant(data) {
  const stmt = db.prepare(`
    INSERT INTO participants (participant_code, name, department, category, phone, email, dietary_type, allergies, daily_quota, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    data.participant_code.trim(),
    data.name.trim(),
    (data.department || 'DPR II').trim(),
    data.category || 'Peserta',
    data.phone || '',
    data.email || '',
    data.dietary_type || 'Reguler',
    data.allergies || 'Tidak ada',
    Number(data.daily_quota) || 5,
    data.status || 'active',
    data.notes || ''
  );
}

function updateParticipant(id, data) {
  const stmt = db.prepare(`
    UPDATE participants
    SET participant_code = ?, name = ?, department = ?, category = ?, phone = ?, email = ?,
        dietary_type = ?, allergies = ?, daily_quota = ?, status = ?, notes = ?
    WHERE id = ?
  `);
  return stmt.run(
    data.participant_code.trim(),
    data.name.trim(),
    (data.department || 'DPR II').trim(),
    data.category || 'Peserta',
    data.phone || '',
    data.email || '',
    data.dietary_type || 'Reguler',
    data.allergies || 'Tidak ada',
    Number(data.daily_quota) || 5,
    data.status || 'active',
    data.notes || '',
    id
  );
}

function deleteParticipant(id) {
  return db.prepare('DELETE FROM participants WHERE id = ?').run(id);
}

function getSessionsWithMenus(date = getTodayStr()) {
  const sessions = db.prepare('SELECT * FROM meal_sessions ORDER BY order_index ASC').all();
  return sessions.map(session => {
    const menu = db.prepare('SELECT * FROM daily_menus WHERE date = ? AND meal_session_id = ?').get(date, session.id);
    const count = db.prepare(`
      SELECT COUNT(DISTINCT participant_id) AS total_eaten,
             COALESCE(SUM(portion_count), 0) AS total_portions
      FROM meal_logs
      WHERE date = ? AND meal_session_id = ? AND status IN ('SUCCESS', 'OVERRIDE_APPROVED')
    `).get(date, session.id);

    return {
      ...session,
      menu: menu || null,
      stats: count
    };
  });
}

function saveMenu(data) {
  const stmt = db.prepare(`
    INSERT INTO daily_menus (date, meal_session_id, menu_title, menu_description, vendor_name, cost_per_portion, target_portions, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(date, meal_session_id) DO UPDATE SET
      menu_title = excluded.menu_title,
      menu_description = excluded.menu_description,
      vendor_name = excluded.vendor_name,
      cost_per_portion = excluded.cost_per_portion,
      target_portions = excluded.target_portions,
      notes = excluded.notes
  `);
  return stmt.run(
    data.date,
    Number(data.meal_session_id),
    data.menu_title.trim(),
    data.menu_description || '',
    data.vendor_name || 'Vendor Mitra',
    Number(data.cost_per_portion) || 0,
    Number(data.target_portions) || 30,
    data.notes || ''
  );
}

function toggleSessionActive(sessionId, isActive) {
  return db.prepare('UPDATE meal_sessions SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, sessionId);
}

function getLogs({ date = getTodayStr(), sessionId = '', status = '', search = '', limit = 100, offset = 0 } = {}) {
  let query = `
    SELECT l.*, p.name AS participant_name, p.department, p.dietary_type, p.allergies, s.name AS session_name
    FROM meal_logs l
    JOIN participants p ON l.participant_id = p.id
    JOIN meal_sessions s ON l.meal_session_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (date) {
    query += ' AND l.date = ?';
    params.push(date);
  }

  if (sessionId) {
    query += ' AND l.meal_session_id = ?';
    params.push(sessionId);
  }

  if (status) {
    query += ' AND l.status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (p.name LIKE ? OR p.participant_code LIKE ? OR p.department LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY l.id DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(...params);
}

function getAnalyticsReport(date = getTodayStr()) {
  const sessions = db.prepare('SELECT * FROM meal_sessions ORDER BY order_index ASC').all();
  const participants = db.prepare("SELECT * FROM participants WHERE status = 'active'").all();
  const totalParticipants = participants.length;

  const departmentMatrix = db.prepare(`
    SELECT p.department,
           COUNT(DISTINCT p.id) AS total_members,
           COUNT(DISTINCT CASE WHEN l.meal_session_id = 1 AND l.status IN ('SUCCESS', 'OVERRIDE_APPROVED') THEN l.participant_id END) AS breakfast_count,
           COUNT(DISTINCT CASE WHEN l.meal_session_id = 2 AND l.status IN ('SUCCESS', 'OVERRIDE_APPROVED') THEN l.participant_id END) AS lunch_count,
           COUNT(DISTINCT CASE WHEN l.meal_session_id = 3 AND l.status IN ('SUCCESS', 'OVERRIDE_APPROVED') THEN l.participant_id END) AS snack_count,
           COUNT(DISTINCT CASE WHEN l.meal_session_id = 4 AND l.status IN ('SUCCESS', 'OVERRIDE_APPROVED') THEN l.participant_id END) AS dinner_count
    FROM participants p
    LEFT JOIN meal_logs l ON p.id = l.participant_id AND l.date = ?
    WHERE p.status = 'active'
    GROUP BY p.department
    ORDER BY total_members DESC
  `).all(date);

  const dietaryBreakdown = db.prepare(`
    SELECT dietary_type, COUNT(*) AS count
    FROM participants
    WHERE status = 'active'
    GROUP BY dietary_type
    ORDER BY count DESC
  `).all();

  const sessionCostAnalysis = sessions.map(session => {
    const menu = db.prepare('SELECT * FROM daily_menus WHERE date = ? AND meal_session_id = ?').get(date, session.id) || {
      menu_title: 'Menu Katering',
      cost_per_portion: 15000,
      target_portions: totalParticipants
    };

    const eaten = db.prepare(`
      SELECT COALESCE(SUM(portion_count), 0) AS total_portions
      FROM meal_logs
      WHERE date = ? AND meal_session_id = ? AND status IN ('SUCCESS', 'OVERRIDE_APPROVED')
    `).get(date, session.id).total_portions;

    const orderedPortions = menu.target_portions;
    const wastedPortions = Math.max(0, orderedPortions - eaten);

    return {
      session_name: session.name,
      menu_title: menu.menu_title,
      cost_per_portion: menu.cost_per_portion,
      ordered_portions: orderedPortions,
      consumed_portions: eaten,
      wasted_portions: wastedPortions,
      consumed_cost: eaten * menu.cost_per_portion,
      wasted_cost: wastedPortions * menu.cost_per_portion,
      total_budget: orderedPortions * menu.cost_per_portion,
      efficiency_percentage: orderedPortions > 0 ? Math.round((eaten / orderedPortions) * 100) : 0
    };
  });

  const foodRecap = getFoodRecap();

  return {
    date,
    total_participants: totalParticipants,
    department_matrix: departmentMatrix,
    dietary_breakdown: dietaryBreakdown,
    session_cost_analysis: sessionCostAnalysis,
    food_recap: foodRecap
  };
}

function resetAndSeed() {
  db.exec(`
    DROP TABLE IF EXISTS food_consumption_logs;
    DROP TABLE IF EXISTS food_items;
    DROP TABLE IF EXISTS food_categories;
    DROP TABLE IF EXISTS meal_logs;
    DROP TABLE IF EXISTS daily_menus;
    DROP TABLE IF EXISTS meal_sessions;
    DROP TABLE IF EXISTS participants;
    DROP TABLE IF EXISTS system_settings;
  `);
  initDatabase();
  return { success: true, message: 'Database berhasil di-reset dengan data peserta DPR II dan daftar makanan!' };
}

// Initialize on startup
initDatabase();

module.exports = {
  db,
  getTodayStr,
  getDashboardSummary,
  processMealScan,
  getParticipants,
  addParticipant,
  updateParticipant,
  deleteParticipant,
  getSessionsWithMenus,
  saveMenu,
  toggleSessionActive,
  getLogs,
  getAnalyticsReport,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getFoods,
  addFood,
  updateFood,
  deleteFood,
  recordFoodConsumption,
  updateFoodConsumptionLog,
  deleteFoodConsumptionLog,
  resetParticipantFood,
  resetAllFoodConsumption,
  setParticipantFoodQuantity,
  getFoodRecap,
  resetAndSeed
};
