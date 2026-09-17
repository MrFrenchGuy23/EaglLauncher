const App = {
  clients: [],
  servers: [],
  ported: [],
  favorites: { servers: [], clients: [] },
  activity: [],
  stats: {},

  ICO: {
    pickaxe: 'ico-pickaxe', compass: 'ico-compass', axe: 'ico-axe', gem: 'ico-gem',
    star: 'ico-star', shield: 'ico-shield', bolt: 'ico-bolt', target: 'ico-target',
    clock: 'ico-clock', puzzle: 'ico-puzzle', sword: 'ico-sword', fire: 'ico-fire',
    crown: 'ico-crown', crystal: 'ico-crystal', skull: 'ico-skull', heart: 'ico-heart',
    nether: 'ico-nether', ender: 'ico-ender'
  },
  GM: {
    Survival: 'ico-survival', PvP: 'ico-pvp', SMP: 'ico-smp', Anarchy: 'ico-anarchy',
    Lifesteal: 'ico-lifesteal', Minigames: 'ico-minigames', OneBlock: 'ico-oneblock',
    Network: 'ico-network', Creative: 'ico-survival', Prison: 'ico-skull',
    Skyblock: 'ico-oneblock', Factions: 'ico-sword', Vanilla: 'ico-survival'
  },
  TAG: {
    pvp: 'ico-pvp', survival: 'ico-survival', smp: 'ico-smp', anarchy: 'ico-anarchy',
    lifesteal: 'ico-lifesteal', minigames: 'ico-minigames', oneblock: 'ico-oneblock',
    network: 'ico-network', community: 'ico-smp', featured: 'ico-star',
    economy: 'ico-gem', vanilla: 'ico-survival', arena: 'ico-target',
    duels: 'ico-sword', cracked: 'ico-shield', combat: 'ico-sword',
    prison: 'ico-skull', skyblock: 'ico-oneblock', crossplay: 'ico-globe',
    medieval: 'ico-crown', chill: 'ico-survival', events: 'ico-star',
    asia: 'ico-globe', europe: 'ico-globe', hardcore: 'ico-skull',
    education: 'ico-info', classic: 'ico-clock', custom: 'ico-puzzle'
  },

  svg(id, cls) {
    return `<svg class="${cls || ''}"><use href="#${id}"/></svg>`;
  },

  clientIco(c) { return this.svg(this.ICO[c.icon] || 'ico-gamepad', 'card-emoji'); },
  gmIco(gm) { return this.svg(this.GM[gm] || 'ico-gamepad', 'feat-gm-icon'); },
  tagIco(t) { return this.svg(this.TAG[t] || 'ico-info', 'icon-tag'); },
  metaIco(id) { return this.svg(id, 'icon-meta'); },

  async init() {
    this.bindSidebar();
    this.bindKeyboard();
    await this.loadData();
    this.renderAll();
  },

  bindSidebar() {
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
      btn.addEventListener('click', () => this.showTab(btn.dataset.tab));
    });
  },

  bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'Escape') { this.closeModal(); return; }
      if (e.key === '/') { e.preventDefault(); this.focusSearch(); return; }
      const tabMap = { '1': 'home', '2': 'clients', '3': 'servers', '4': 'ported', '5': 'play', '6': 'docs' };
      if (tabMap[e.key]) this.showTab(tabMap[e.key]);
    });
  },

  focusSearch() {
    const tab = document.querySelector('.content.active');
    if (!tab) return;
    const input = tab.querySelector('input[type="text"]');
    if (input) input.focus();
  },

  showTab(tab) {
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.sidebar-btn[data-tab="${tab}"]`)?.classList.add('active');
    document.getElementById(`tab-${tab}`)?.classList.add('active');
    if (tab === 'home') this.renderHome();
    if (tab === 'clients') this.renderClients();
    if (tab === 'servers') this.renderServers();
    if (tab === 'ported') this.renderPorted();
    if (tab === 'play') this.renderQuickPlay();
  },

  async loadData() {
    try {
      const [c, s, p, a, st] = await Promise.all([
        fetch('/api/clients').then(r => r.json()),
        fetch('/api/servers').then(r => r.json()),
        fetch('/api/ported').then(r => r.json()),
        fetch('/api/activity').then(r => r.json()),
        fetch('/api/stats').then(r => r.json())
      ]);
      this.clients = [...(c.builtIn || []), ...(c.custom || [])];
      this.favorites.clients = c.favorites || [];
      this.servers = [...(s.builtIn || []), ...(s.custom || [])];
      this.ported = p.clients || [];
      this.favorites.servers = s.favorites || [];
      this.activity = a;
      this.stats = st;
    } catch { this.showToast('Failed to load data', 'error'); }
  },

  renderAll() { this.renderHome(); this.updateStats(); },

  updateStats() {
    const s = this.stats;
    const totalClients = s.totalClients || 0;
    const totalServers = s.totalServers || 0;
    const e = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v ?? 0; };
    e('stat-clients', totalClients); e('stat-servers', totalServers);
    e('home-clients', totalClients); e('home-servers', totalServers);
    e('home-favs', this.favorites.servers.length + this.favorites.clients.length);
    e('home-activity', s.recentActivity);
    const hc = document.getElementById('hero-client-count');
    const sc = document.getElementById('hero-server-count');
    if (hc) hc.textContent = totalClients;
    if (sc) sc.textContent = totalServers;
  },

  renderHome() {
    this.updateStats();
    const featured = this.servers.filter(s => s.tags?.includes('featured')).slice(0, 8);
    const fc = document.getElementById('featured-servers');
    if (!featured.length) {
      fc.innerHTML = `<p class="empty-state">${this.svg('ico-globe', 'icon-empty')} No featured servers</p>`;
    } else {
      fc.innerHTML = featured.map(s => `
        <div class="feat-srv" onclick="App.copyAddr('${this.e(s.address)}')">
          ${this.gmIco(s.gameMode)}
          <div>
            <div class="feat-name">${this.e(s.name)}</div>
            <div class="feat-meta">
              <span class="feat-tag">${this.e(s.gameMode)}</span>
              <span>v${this.e(s.version)}</span>
            </div>
          </div>
        </div>`).join('');
    }

    const ac = document.getElementById('home-activity-list');
    if (!this.activity.length) {
      ac.innerHTML = `<p class="empty-state">${this.svg('ico-info', 'icon-empty')} No recent activity</p>`;
    } else {
      ac.innerHTML = this.activity.slice(0, 12).map(a => `
        <div class="act-item">
          <div class="act-dot ${a.type || 'default'}"></div>
          <span>${this.e(a.text)}</span>
          <span class="act-time">${this.ago(a.time)}</span>
        </div>`).join('');
    }
  },

  renderClients() {
    const list = this.filterClients();
    const c = document.getElementById('clients-list');
    if (!list.length) {
      c.innerHTML = `<p class="empty-state">${this.svg('ico-search', 'icon-empty')} No clients match your filters</p>`;
      return;
    }
    c.innerHTML = list.map(cl => `
      <div class="card">
        <div class="card-top">
          <div class="card-name">${this.clientIco(cl)} ${this.e(cl.name)}</div>
          <span class="card-badge badge-${cl.category}">${cl.category}</span>
        </div>
        <div class="card-desc">${this.e(cl.description)}</div>
        <div class="card-meta">
          <span>${this.metaIco('ico-gamepad')} v${this.e(cl.version)}</span>
          <span>${this.metaIco(cl.type === 'wasm' ? 'ico-bolt' : 'ico-info')} ${cl.type.toUpperCase()}</span>
          ${cl.author ? `<span>${this.metaIco('ico-star')} ${this.e(cl.author)}</span>` : ''}
          ${cl.size ? `<span>${this.metaIco('ico-copy')} ${cl.size}</span>` : ''}
        </div>
        <div class="card-actions">
          <button class="btn-play-sm" onclick="App.launchClient('${this.e(cl.url)}')">
            ${this.svg('ico-play', 'icon-btn')} Play
          </button>
          <button class="btn-fav ${this.favorites.clients.includes(cl.id) ? 'on' : ''}" onclick="App.toggleFav('clients','${cl.id}')">
            ${this.svg(this.favorites.clients.includes(cl.id) ? 'ico-star-f' : 'ico-star-o', 'icon-fav')}
          </button>
          ${!cl.builtIn ? `<button class="btn-del" onclick="App.deleteClient('${cl.id}')">${this.svg('ico-trash', 'icon-del')}</button>` : ''}
        </div>
      </div>`).join('');
  },

  renderServers() {
    const list = this.filterServerList();
    const c = document.getElementById('servers-list');
    if (!list.length) {
      c.innerHTML = `<p class="empty-state">${this.svg('ico-search', 'icon-empty')} No servers match your filters</p>`;
      return;
    }
    c.innerHTML = list.map(s => `
      <div class="card">
        <div class="card-top">
          <div class="card-name">${this.svg('ico-globe', 'card-emoji')} ${this.e(s.name)}</div>
          <span class="card-badge badge-${s.builtIn ? 'builtin' : 'user'}">${s.builtIn ? 'listed' : 'custom'}</span>
        </div>
        <div class="card-desc">${this.e(s.description)}</div>
        <div class="card-meta">
          <span>${this.svg(this.GM[s.gameMode] || 'ico-gamepad', 'icon-meta')} ${this.e(s.gameMode)}</span>
          <span>${this.metaIco('ico-gamepad')} v${this.e(s.version)}</span>
          <span>${this.metaIco('ico-link')} ${this.e(s.address)}</span>
        </div>
        <div class="card-tags">
          ${(s.tags || []).map(t => `<span class="tag">${this.tagIco(t)} ${this.e(t)}</span>`).join('')}
        </div>
        <div class="card-actions">
          <button class="btn-copy" onclick="App.copyAddr('${this.e(s.address)}')">${this.svg('ico-copy', 'icon-btn')} Copy IP</button>
          <button class="btn-play-sm" onclick="App.connectServer('${this.e(s.address)}')">${this.svg('ico-play', 'icon-btn')} Join</button>
          <button class="btn-fav ${this.favorites.servers.includes(s.id) ? 'on' : ''}" onclick="App.toggleFav('servers','${s.id}')">
            ${this.svg(this.favorites.servers.includes(s.id) ? 'ico-star-f' : 'ico-star-o', 'icon-fav')}
          </button>
          ${!s.builtIn ? `<button class="btn-del" onclick="App.deleteServer('${s.id}')">${this.svg('ico-trash', 'icon-del')}</button>` : ''}
        </div>
      </div>`).join('');
  },

  renderPorted() {
    const list = this.filterPortedList();
    const c = document.getElementById('ported-list');
    if (!list.length) {
      c.innerHTML = `<p class="empty-state">${this.svg('ico-search', 'icon-empty')} No ported clients match your filters</p>`;
      return;
    }
    c.innerHTML = list.map(cl => `
      <div class="card">
        <div class="card-top">
          <div class="card-name">${this.clientIco(cl)} ${this.e(cl.name)}</div>
          <div style="display:flex;align-items:center;gap:6px">
            ${cl.experimental ? `<span class="ported-experimental">${this.svg('ico-alert', 'icon-sm')} Experimental</span>` : ''}
            <span class="ported-mcver">MC ${this.e(cl.mcVersion || cl.version)}</span>
          </div>
        </div>
        <div class="card-desc">${this.e(cl.description)}</div>
        <div class="card-meta">
          <span>${this.metaIco(cl.type === 'wasm' ? 'ico-bolt' : 'ico-info')} ${cl.type.toUpperCase()}</span>
          <span>${this.metaIco('ico-star')} ${this.e(cl.author)}</span>
          ${cl.size ? `<span>${this.metaIco('ico-copy')} ${cl.size}</span>` : ''}
        </div>
        <div class="ported-features">
          ${(cl.features || []).map(f => `<span class="ported-feat">${this.e(f)}</span>`).join('')}
        </div>
        <div class="card-actions">
          <button class="btn-play-sm" onclick="App.launchClient('${this.e(cl.url)}')">
            ${this.svg('ico-play', 'icon-btn')} Play
          </button>
          <button class="btn-fav ${this.favorites.clients.includes(cl.id) ? 'on' : ''}" onclick="App.toggleFav('clients','${cl.id}')">
            ${this.svg(this.favorites.clients.includes(cl.id) ? 'ico-star-f' : 'ico-star-o', 'icon-fav')}
          </button>
        </div>
      </div>`).join('');
  },

  filterPortedList() {
    let l = [...this.ported];
    const q = document.getElementById('ported-search')?.value?.toLowerCase() || '';
    const v = document.getElementById('ported-filter-version')?.value || '';
    const t = document.getElementById('ported-filter-type')?.value || '';
    if (q) l = l.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || (c.features || []).some(f => f.toLowerCase().includes(q)));
    if (v) l = l.filter(c => c.mcVersion === v || c.version === v);
    if (t) l = l.filter(c => c.type === t);
    return l;
  },

  renderQuickPlay() {
    const cs = document.getElementById('quickplay-client');
    const ss = document.getElementById('quickplay-server');
    cs.innerHTML = this.clients.map(c => `<option value="${this.e(c.url)}">${this.e(c.name)} (${c.version})</option>`).join('');
    ss.innerHTML = this.servers.map(s => `<option value="${this.e(s.address)}">${this.e(s.name)} — ${s.address}</option>`).join('');
  },

  showDocsSection(id, btn) {
    document.querySelectorAll('.docs-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.docs-nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`docs-${id}`)?.classList.add('active');
    btn?.classList.add('active');
  },

  filterClients() {
    let l = [...this.clients];
    const q = document.getElementById('client-search')?.value?.toLowerCase() || '';
    const v = document.getElementById('client-filter-version')?.value || '';
    const t = document.getElementById('client-filter-type')?.value || '';
    const cat = document.getElementById('client-filter-category')?.value || '';
    if (q) l = l.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    if (v) l = l.filter(c => c.version === v);
    if (t) l = l.filter(c => c.type === t);
    if (cat) l = l.filter(c => c.category === cat);
    return l;
  },

  filterServerList() {
    let l = [...this.servers];
    const q = document.getElementById('server-search')?.value?.toLowerCase() || '';
    const m = document.getElementById('server-filter-mode')?.value || '';
    const v = document.getElementById('server-filter-version')?.value || '';
    if (q) l = l.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
    if (m) l = l.filter(s => s.gameMode === m || s.tags?.includes(m.toLowerCase()));
    if (v) l = l.filter(s => s.version === v);
    return l;
  },

  launchClient(url) {
    window.open(url, '_blank');
    this.showToast('Client opened in new tab', 'success', 'ico-check');
    this.localActivity('Launched a client', 'play');
  },

  copyAddr(addr) {
    navigator.clipboard.writeText(addr).then(() => {
      this.showToast(`Copied: ${addr}`, 'success', 'ico-copy');
    }).catch(() => {
      const t = document.createElement('textarea');
      t.value = addr; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
      this.showToast(`Copied: ${addr}`, 'success', 'ico-copy');
    });
  },

  connectServer(addr) {
    const c = this.clients.find(cl => cl.version === '1.8.8' && cl.type === 'js') || this.clients[0];
    if (c) {
      window.open(c.url, '_blank');
      this.showToast(`Client opened! Connect to: ${addr}`, 'info', 'ico-link');
      this.localActivity(`Joining server: ${addr}`, 'play');
    } else this.showToast('No client available', 'error', 'ico-alert');
  },

  quickPlay() {
    const cu = document.getElementById('quickplay-client')?.value;
    const sa = document.getElementById('quickplay-server')?.value;
    if (!cu) { this.showToast('Select a client', 'warning', 'ico-alert'); return; }
    window.open(cu, '_blank');
    this.showToast(`Quick play! Connect to: ${sa}`, 'info', 'ico-bolt');
    this.localActivity(`Quick play → ${sa}`, 'play');
  },

  async toggleFav(type, id) {
    try {
      const r = await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id }) });
      const d = await r.json();
      this.favorites[type] = d.favorites;
      this.renderAll();
    } catch {}
  },

  async deleteClient(id) {
    if (!confirm('Remove this custom client?')) return;
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    this.clients = this.clients.filter(c => c.id !== id);
    this.renderClients();
    this.showToast('Client removed', 'success', 'ico-check');
  },

  async deleteServer(id) {
    if (!confirm('Remove this custom server?')) return;
    await fetch(`/api/servers/${id}`, { method: 'DELETE' });
    this.servers = this.servers.filter(s => s.id !== id);
    this.renderServers();
    this.showToast('Server removed', 'success', 'ico-check');
  },

  showAddClientModal() {
    this.showModal('Add Custom Client', `
      <div class="fg"><label>Client Name</label><input id="ac-name" placeholder="My Custom Client"></div>
      <div class="fg"><label>Client URL</label><input id="ac-url" placeholder="https://example.com/client.html"></div>
      <div class="fg-row">
        <div class="fg"><label>Version</label><input id="ac-ver" value="1.8.8"></div>
        <div class="fg"><label>Type</label><select id="ac-type"><option value="js">JavaScript</option><option value="wasm">WebAssembly</option></select></div>
      </div>
      <div class="fg-row">
        <div class="fg"><label>Category</label><select id="ac-cat"><option value="custom">Custom</option><option value="official">Official</option><option value="legacy">Legacy</option></select></div>
        <div class="fg"><label>Author</label><input id="ac-author" value="User"></div>
      </div>
      <div class="fg"><label>Description</label><input id="ac-desc" placeholder="A cool client"></div>
      <div class="form-btns">
        <button class="btn-cancel" onclick="App.closeModal()">Cancel</button>
        <button class="btn-add" onclick="App.addClient()">${this.svg('ico-plus', 'icon-btn')} Add Client</button>
      </div>
    `);
  },

  async addClient() {
    const name = document.getElementById('ac-name').value.trim();
    const url = document.getElementById('ac-url').value.trim();
    if (!name || !url) { this.showToast('Name and URL required', 'warning', 'ico-alert'); return; }
    const r = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url, version: document.getElementById('ac-ver').value.trim(), type: document.getElementById('ac-type').value,
        category: document.getElementById('ac-cat').value, author: document.getElementById('ac-author').value.trim(),
        description: document.getElementById('ac-desc').value.trim() }) });
    const cl = await r.json();
    this.clients.push(cl);
    this.closeModal(); this.renderClients();
    this.showToast(`Added "${name}"`, 'success', 'ico-check');
  },

  showAddServerModal() {
    this.showModal('Add Custom Server', `
      <div class="fg"><label>Server Name</label><input id="as-name" placeholder="My Server"></div>
      <div class="fg"><label>WebSocket Address</label><input id="as-addr" placeholder="wss://myserver.example.com"></div>
      <div class="fg-row">
        <div class="fg"><label>Version</label><select id="as-ver"><option value="1.8.8">1.8.8</option><option value="1.12.2">1.12.2</option><option value="1.5.2">1.5.2</option></select></div>
        <div class="fg"><label>Game Mode</label><input id="as-gm" placeholder="Survival, PvP, etc."></div>
      </div>
      <div class="fg"><label>Description</label><input id="as-desc" placeholder="A great server"></div>
      <div class="fg"><label>Tags (comma-separated)</label><input id="as-tags" placeholder="survival, pvp, community"></div>
      <div class="form-btns">
        <button class="btn-cancel" onclick="App.closeModal()">Cancel</button>
        <button class="btn-add" onclick="App.addServer()">${this.svg('ico-plus', 'icon-btn')} Add Server</button>
      </div>
    `);
  },

  async addServer() {
    const name = document.getElementById('as-name').value.trim();
    const address = document.getElementById('as-addr').value.trim();
    if (!name || !address) { this.showToast('Name and address required', 'warning', 'ico-alert'); return; }
    if (!address.startsWith('wss://') && !address.startsWith('ws://')) { this.showToast('Address must start with wss:// or ws://', 'warning', 'ico-alert'); return; }
    const r = await fetch('/api/servers', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, address, version: document.getElementById('as-ver').value, gameMode: document.getElementById('as-gm').value.trim(),
        description: document.getElementById('as-desc').value.trim(), tags: document.getElementById('as-tags').value.split(',').map(t => t.trim()).filter(Boolean) }) });
    const s = await r.json();
    this.servers.push(s);
    this.closeModal(); this.renderServers();
    this.showToast(`Added "${name}"`, 'success', 'ico-check');
  },

  showModal(title, html) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },
  closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); },

  localActivity(text, type) {
    this.activity.unshift({ text, type, time: new Date().toISOString() });
    if (this.activity.length > 50) this.activity.pop();
    this.renderHome();
  },

  showToast(msg, type = 'info', iconId) {
    let c = document.getElementById('toast-container');
    if (!c) { c = document.createElement('div'); c.id = 'toast-container'; c.className = 'toast-container'; document.body.appendChild(c); }
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `${iconId ? this.svg(iconId, 'toast-icon') : ''}<span>${this.e(msg)}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; setTimeout(() => t.remove(), 300); }, 3500);
  },

  ago(iso) {
    const d = Date.now() - new Date(iso).getTime();
    const s = Math.floor(d / 1000);
    if (s < 60) return 'now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  },

  e(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
};

document.addEventListener('DOMContentLoaded', () => App.init());