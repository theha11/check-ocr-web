const path = require('path');
const fs = require('fs');

function openDatabase() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  const dbPath = path.join(dataDir, 'db.json');

  if (!fs.existsSync(dbPath)) {
    const initial = {
      nextUserId: 1,
      nextHistoryId: 1,
      users: [],
      histories: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2));
  }

  function read() {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }

  function write(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  }

  return {
    getUserByUsername(username) {
      const d = read();
      return d.users.find(u => u.username === username) || null;
    },
    getUserById(id) {
      const d = read();
      return d.users.find(u => u.id === id) || null;
    },
    createUser(username, password_hash) {
      const d = read();
      if (d.users.find(u => u.username === username)) {
        const err = new Error('username exists');
        err.code = 'UNIQUE';
        throw err;
      }
      const user = { id: d.nextUserId++, username, password_hash, created_at: new Date().toISOString() };
      d.users.push(user);
      write(d);
      return { id: user.id, username: user.username };
    },
    getHistoryById(id) {
      const d = read();
      return d.histories.find(h => h.id === parseInt(id)) || null;
    },
    addHistory(userId, content, meta) {
      const d = read();
      const hist = { id: d.nextHistoryId++, user_id: userId, content, meta: meta || null, created_at: new Date().toISOString() };
      d.histories.push(hist);
      write(d);
      return hist;
    },
    getHistoriesByUser(userId) {
      const d = read();
      return d.histories.filter(h => h.user_id === userId).sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
    },
    deleteHistory(id) {
      const d = read();
      const index = d.histories.findIndex(h => h.id === parseInt(id));
      if (index !== -1) {
        d.histories.splice(index, 1);
        write(d);
        return true;
      }
      return false;
    },
    updateHistory(id, content, meta) {
      const d = read();
      const history = d.histories.find(h => h.id === parseInt(id));
      if (history) {
        history.content = content;
        if (meta !== undefined) {
          history.meta = meta;
        }
        history.updated_at = new Date().toISOString();
        write(d);
        return history;
      }
      return null;
    }
  };
}

module.exports = { openDatabase };
