const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// GET /api/admin/db/raw - JSON endpoint to fetch table schema & rows
router.get('/raw', async (req, res) => {
  try {
    const db = getDb();
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    
    const selectedTable = req.query.table || (tables[0] ? tables[0].name : null);
    let rows = [];
    let columns = [];
    let totalCount = 0;

    if (selectedTable) {
      const countRes = await db.get(`SELECT COUNT(*) as c FROM "${selectedTable}"`);
      totalCount = countRes ? countRes.c : 0;
      rows = await db.all(`SELECT * FROM "${selectedTable}" LIMIT 100`);
      if (rows.length > 0) {
        columns = Object.keys(rows[0]);
      } else {
        const tableInfo = await db.all(`PRAGMA table_info("${selectedTable}")`);
        columns = tableInfo.map(col => col.name);
      }
    }

    const tablesSummary = await Promise.all(tables.map(async (t) => {
      const cnt = await db.get(`SELECT COUNT(*) as c FROM "${t.name}"`);
      return { name: t.name, count: cnt ? cnt.c : 0 };
    }));

    res.json({
      tables: tablesSummary,
      currentTable: selectedTable,
      columns,
      rows,
      totalCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/db/query - Run custom SELECT query
router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string required' });
    }
    
    // Safety check for simple query execution in admin viewer
    const trimmed = query.trim().toUpperCase();
    const db = getDb();
    
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA') || trimmed.startsWith('EXPLAIN')) {
      const rows = await db.all(query);
      return res.json({ success: true, rows, count: rows.length });
    } else {
      const result = await db.run(query);
      return res.json({ success: true, result });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/admin/db - HTML Database Browser Interface
router.get('/', async (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SQLite Database Viewer | Personal Finance Assistant</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #0f172a;
      --panel-bg: rgba(30, 41, 59, 0.8);
      --card-bg: #1e293b;
      --border-color: #334155;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --emerald: #10b981;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
    body { background-color: var(--bg-dark); color: var(--text-main); height: 100vh; display: flex; flex-direction: column; overflow: hidden; }

    header {
      background: var(--card-bg);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-container { display: flex; align-items: center; gap: 0.75rem; }
    .logo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    h1 { font-size: 1.25rem; font-weight: 600; background: linear-gradient(to right, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    .db-path { font-size: 0.85rem; color: var(--text-muted); background: #090d16; padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid var(--border-color); font-family: monospace; }

    .main-container { flex: 1; display: flex; overflow: hidden; }

    sidebar {
      width: 260px;
      background: var(--card-bg);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      padding: 1rem 0;
    }

    .sidebar-title { padding: 0 1.25rem 0.75rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; }

    .table-list { list-style: none; overflow-y: auto; flex: 1; }
    .table-item {
      padding: 0.75rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      border-left: 3px solid transparent;
      transition: all 0.2s ease;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .table-item:hover { background: rgba(255,255,255,0.03); color: var(--text-main); }
    .table-item.active { background: rgba(99, 102, 241, 0.12); color: #818cf8; border-left-color: var(--accent); font-weight: 600; }

    .badge { background: #334155; color: var(--text-muted); font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 12px; font-weight: 500; }
    .table-item.active .badge { background: var(--accent); color: #fff; }

    content { flex: 1; display: flex; flex-direction: column; padding: 1.5rem; overflow: hidden; background: #0b1120; }

    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 1rem; }
    .table-heading { font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }

    .search-box {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      outline: none;
      width: 260px;
      font-size: 0.875rem;
    }
    .search-box:focus { border-color: var(--accent); }

    .query-section { margin-bottom: 1rem; display: flex; gap: 0.5rem; }
    .query-input {
      flex: 1;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      color: #38bdf8;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.85rem;
      outline: none;
    }
    .btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn:hover { background: var(--accent-hover); }

    .table-wrapper {
      flex: 1;
      overflow: auto;
      background: var(--card-bg);
      border-radius: 10px;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
    }

    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
    th {
      background: #0f172a;
      padding: 0.85rem 1rem;
      color: var(--text-muted);
      font-weight: 600;
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 10;
      white-space: nowrap;
    }
    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #283548;
      color: #e2e8f0;
      white-space: nowrap;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    tr:hover td { background: rgba(255,255,255,0.02); }

    .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); }

    .json-cell { font-family: monospace; font-size: 0.75rem; color: #a7f3d0; background: rgba(16,185,129,0.1); padding: 0.2rem 0.4rem; border-radius: 4px; }
  </style>
</head>
<body>

  <header>
    <div class="logo-container">
      <div class="logo-icon">⚡</div>
      <h1>SQLite Database Viewer</h1>
    </div>
    <div class="db-path">backend/data/database.sqlite</div>
  </header>

  <div class="main-container">
    <sidebar>
      <div class="sidebar-title">Tables Overview</div>
      <ul class="table-list" id="tableList">
        <li class="table-item">Loading tables...</li>
      </ul>
    </sidebar>

    <content>
      <div class="toolbar">
        <div class="table-heading" id="tableTitle">Select a Table</div>
        <input type="text" class="search-box" id="searchInput" placeholder="Filter rows in view..." onkeyup="filterRows()">
      </div>

      <div class="query-section">
        <input type="text" class="query-input" id="queryInput" placeholder="SELECT * FROM users WHERE email LIKE '%@gmail.com'">
        <button class="btn" onclick="executeCustomQuery()">Run SQL</button>
      </div>

      <div class="table-wrapper">
        <table id="dataTable">
          <thead id="tableHead"></thead>
          <tbody id="tableBody"></tbody>
        </table>
        <div id="emptyMessage" class="empty-state" style="display:none;">No records found in this table.</div>
      </div>
    </content>
  </div>

  <script>
    let currentData = { columns: [], rows: [] };
    let activeTable = '';

    async function loadDatabaseData(table = '') {
      try {
        const res = await fetch('/api/admin/db/raw' + (table ? '?table=' + encodeURIComponent(table) : ''));
        const data = await res.json();
        
        renderSidebar(data.tables, data.currentTable);
        activeTable = data.currentTable;
        document.getElementById('tableTitle').innerHTML = \`📄 Table: <span style="color:var(--accent); font-weight:700;">\${data.currentTable}</span> (\${data.totalCount} rows)\`;
        document.getElementById('queryInput').value = \`SELECT * FROM \${data.currentTable} LIMIT 50\`;
        
        currentData.columns = data.columns;
        currentData.rows = data.rows;
        renderTable(data.columns, data.rows);
      } catch (err) {
        alert('Failed to load database: ' + err.message);
      }
    }

    function renderSidebar(tables, currentTable) {
      const ul = document.getElementById('tableList');
      ul.innerHTML = tables.map(t => \`
        <li class="table-item \${t.name === currentTable ? 'active' : ''}" onclick="loadDatabaseData('\${t.name}')">
          <span>\${t.name}</span>
          <span class="badge">\${t.count}</span>
        </li>
      \`).join('');
    }

    function renderTable(columns, rows) {
      const head = document.getElementById('tableHead');
      const body = document.getElementById('tableBody');
      const empty = document.getElementById('emptyMessage');

      if (!columns || columns.length === 0) {
        head.innerHTML = '';
        body.innerHTML = '';
        empty.style.display = 'block';
        return;
      }

      empty.style.display = rows.length === 0 ? 'block' : 'none';

      head.innerHTML = '<tr>' + columns.map(c => \`<th>\${c}</th>\`).join('') + '</tr>';
      
      body.innerHTML = rows.map(r => {
        return '<tr>' + columns.map(c => {
          let val = r[c];
          if (val === null || val === undefined) return '<td style="color: #64748b; font-style: italic;">null</td>';
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
            return \`<td><span class="json-cell">\${escapeHtml(val)}</span></td>\`;
          }
          return \`<td title="\${escapeHtml(String(val))}">\${escapeHtml(String(val))}</td>\`;
        }).join('') + '</tr>';
      }).join('');
    }

    function filterRows() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      const filtered = currentData.rows.filter(r => {
        return Object.values(r).some(val => String(val).toLowerCase().includes(query));
      });
      renderTable(currentData.columns, filtered);
    }

    async function executeCustomQuery() {
      const query = document.getElementById('queryInput').value;
      if (!query) return;

      try {
        const res = await fetch('/api/admin/db/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        const data = await res.json();
        
        if (!data.success) {
          alert('Query Error: ' + (data.error || 'Unknown error'));
          return;
        }

        if (data.rows) {
          const cols = data.rows.length > 0 ? Object.keys(data.rows[0]) : [];
          currentData.columns = cols;
          currentData.rows = data.rows;
          document.getElementById('tableTitle').innerHTML = \`🔍 Query Output (\${data.rows.length} rows)\`;
          renderTable(cols, data.rows);
        } else {
          alert('Query executed successfully!');
          loadDatabaseData(activeTable);
        }
      } catch (err) {
        alert('Query execution failed: ' + err.message);
      }
    }

    function escapeHtml(text) {
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    loadDatabaseData();
  </script>
</body>
</html>`;

  res.send(html);
});

module.exports = router;
