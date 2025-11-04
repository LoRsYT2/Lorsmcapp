const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'applications.json');


// Ensure data directory and DB file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, '[]', 'utf8');
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));


// Accept application submissions at /api/submit
app.post('/api/submit', (req, res) => {
  try {
    const payload = req.body;
    // Basic validation
    const applicantName = (payload && (payload.name || payload.username)) || null;
    if (!payload || !applicantName || !payload.discord) {
      return res.status(400).json({ ok:false, error: 'Missing required fields (name, discord).' });
    }
    const applications = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const entry = {
      name: applicantName,
      id: Date.now(),
      receivedAt: new Date().toISOString(),
      ...payload
    };
    applications.push(entry);
    fs.writeFileSync(DB_FILE, JSON.stringify(applications, null, 2), 'utf8');
    res.json({ ok: true, entry });
  } catch (err) {
    console.error('Error saving application', err);
    res.status(500).json({ ok:false, error: 'Internal server error' });
  }
});

// Simple endpoint to list applications (no auth) - you can remove or protect later
app.get('/api/list', (req, res) => {
  try {
    const applications = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    res.json({ ok:true, count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ ok:false, error: 'Could not read DB' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
