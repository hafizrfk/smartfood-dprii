const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------
// Food & Snack Monitoring Endpoints
// -------------------------------------------------------------

// Get list of foods with total eaten count
app.get('/api/foods', (req, res) => {
  try {
    const foods = db.getFoods();
    res.json({ success: true, data: foods });
  } catch (err) {
    console.error('Error fetching foods:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add new food item
app.post('/api/foods', (req, res) => {
  try {
    const { name, category, unit, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Nama makanan wajib diisi.' });
    }

    const result = db.addFood({ name, category, unit, icon });
    res.status(201).json({ success: true, id: result.lastInsertRowid, message: `Makanan '${name}' berhasil ditambahkan!` });
  } catch (err) {
    console.error('Error adding food:', err);
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, error: 'Jenis makanan ini sudah ada.' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete food item
app.delete('/api/foods/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    db.deleteFood(id);
    res.json({ success: true, message: 'Jenis makanan berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleting food:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Record participant consuming food/snack
app.post('/api/food-consumption', (req, res) => {
  try {
    const { participantCode, foodId, quantity, notes } = req.body;
    if (!participantCode || !foodId) {
      return res.status(400).json({ success: false, error: 'Kode peserta dan makanan wajib dipilih.' });
    }

    const result = db.recordFoodConsumption({
      participantCode,
      foodId: Number(foodId),
      quantity: Number(quantity) || 1,
      notes
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (err) {
    console.error('Error recording food consumption:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get comprehensive food recap & leaderboard
app.get('/api/food-recap', (req, res) => {
  try {
    const recap = db.getFoodRecap();
    res.json({ success: true, data: recap });
  } catch (err) {
    console.error('Error fetching food recap:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get individual food breakdown for a specific participant
app.get('/api/participants/:code/food-detail', (req, res) => {
  try {
    const recap = db.getFoodRecap();
    const detail = recap.participants_breakdown[req.params.code];
    if (!detail) {
      return res.status(404).json({ success: false, message: 'Data peserta tidak ditemukan dalam rekap.' });
    }
    res.json({ success: true, data: detail });
  } catch (err) {
    console.error('Error fetching participant detail:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// Core ERP Endpoints
// -------------------------------------------------------------

// Dashboard KPI & Live Feed
app.get('/api/dashboard', (req, res) => {
  try {
    const date = req.query.date || db.getTodayStr();
    const data = db.getDashboardSummary(date);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching dashboard:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Barcode / QR Code Scanner Endpoint
app.post('/api/scan', (req, res) => {
  try {
    const { participantCode, sessionId, overrideApproved, notes, scannedBy } = req.body;
    const result = db.processMealScan({
      participantCode,
      sessionId: sessionId ? Number(sessionId) : null,
      overrideApproved: Boolean(overrideApproved),
      notes,
      scannedBy: scannedBy || 'Terminal Scan 1'
    });

    res.json(result);
  } catch (err) {
    console.error('Error processing scan:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Participants Management
app.get('/api/participants', (req, res) => {
  try {
    const { search, department, category, dietary } = req.query;
    const participants = db.getParticipants({ search, department, category, dietary });
    res.json({ success: true, count: participants.length, data: participants });
  } catch (err) {
    console.error('Error getting participants:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/participants', (req, res) => {
  try {
    const { participant_code, name } = req.body;
    if (!participant_code || !name) {
      return res.status(400).json({ success: false, error: 'Kode peserta dan nama wajib diisi.' });
    }

    const result = db.addParticipant(req.body);
    res.status(201).json({ success: true, id: result.lastInsertRowid, message: `Peserta '${name}' berhasil ditambahkan!` });
  } catch (err) {
    console.error('Error adding participant:', err);
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, error: `Kode '${req.body.participant_code}' sudah digunakan.` });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/participants/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    db.updateParticipant(id, req.body);
    res.json({ success: true, message: 'Data peserta berhasil diperbarui!' });
  } catch (err) {
    console.error('Error updating participant:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/participants/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    db.deleteParticipant(id);
    res.json({ success: true, message: 'Peserta berhasil dihapus dari sistem.' });
  } catch (err) {
    console.error('Error deleting participant:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Meal Sessions & Menus
app.get('/api/sessions', (req, res) => {
  try {
    const date = req.query.date || db.getTodayStr();
    const sessions = db.getSessionsWithMenus(date);
    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error('Error getting sessions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sessions/:id/toggle', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { is_active } = req.body;
    db.toggleSessionActive(id, is_active);
    res.json({ success: true, message: `Sesi berhasil di-${is_active ? 'buka' : 'tutup'}!` });
  } catch (err) {
    console.error('Error toggling session:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/menus', (req, res) => {
  try {
    const { date, meal_session_id, menu_title } = req.body;
    if (!date || !meal_session_id || !menu_title) {
      return res.status(400).json({ success: false, error: 'Tanggal, sesi makan, dan nama menu wajib diisi.' });
    }

    db.saveMenu(req.body);
    res.json({ success: true, message: 'Menu katering berhasil disimpan!' });
  } catch (err) {
    console.error('Error saving menu:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Consumption Audit Logs
app.get('/api/logs', (req, res) => {
  try {
    const { date, sessionId, status, search, limit, offset } = req.query;
    const logs = db.getLogs({
      date: date || db.getTodayStr(),
      sessionId: sessionId || '',
      status: status || '',
      search: search || '',
      limit: Number(limit) || 100,
      offset: Number(offset) || 0
    });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    console.error('Error getting logs:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Analytics & Financial Report
app.get('/api/reports', (req, res) => {
  try {
    const date = req.query.date || db.getTodayStr();
    const report = db.getAnalyticsReport(date);
    res.json({ success: true, data: report });
  } catch (err) {
    console.error('Error getting reports:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Settings & System Reset
app.post('/api/system/reset', (req, res) => {
  try {
    const result = db.resetAndSeed();
    res.json(result);
  } catch (err) {
    console.error('Error resetting database:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback to index.html for SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export app for Vercel serverless functions
module.exports = app;

// Start Server locally if not running in Vercel serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SmartFood ERP Server running on: http://localhost:${PORT}`);
    console.log(`👥 Monitoring Konsumsi Makanan DPR II Siap Digunakan`);
    console.log(`====================================================`);
  });
}
