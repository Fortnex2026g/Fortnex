// ========== FORTNEX - PLAYABLE PROTOTYPE ==========

// ========== KONTA ==========
const ADMIN_EMAIL = 'mn867199@gmail.com';
const ADMIN_PASS = 'Hejter10?!';

function getAccounts() {
  const raw = localStorage.getItem('fortnex_accounts');
  if (!raw) {
    const accounts = {
      [ADMIN_EMAIL]: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASS,
        name: 'Admin',
        vnex: 10000,
        isAdmin: true
      }
    };
    localStorage.setItem('fortnex_accounts', JSON.stringify(accounts));
    return accounts;
  }
  // Upewnij się że admin zawsze istnieje i ma 10k
  const accounts = JSON.parse(raw);
  if (!accounts[ADMIN_EMAIL]) {
    accounts[ADMIN_EMAIL] = {
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
      name: 'Admin',
      vnex: 10000,
      isAdmin: true
    };
    localStorage.setItem('fortnex_accounts', JSON.stringify(accounts));
  }
  return accounts;
}

function saveAccounts(accounts) {
  localStorage.setItem('fortnex_accounts', JSON.stringify(accounts));
}

function setCurrentUser(user) {
  localStorage.setItem('fortnex_current', JSON.stringify(user));
}

function getCurrentUser() {
  const raw = localStorage.getItem('fortnex_current');
  return raw ? JSON.parse(raw) : null;
}

// Init
getAccounts();

// Fullscreen
function goFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

// ========== AUDIO ==========
const lobbyMusic = document.getElementById('lobby-music');
let musicStarted = false;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playLobbyMusic() {
  if (!lobbyMusic) return;
  lobbyMusic.volume = 0.35;
  lobbyMusic.play().catch(() => {});
}

function stopLobbyMusic() {
  if (!lobbyMusic) return;
  lobbyMusic.pause();
  lobbyMusic.currentTime = 0;
}

// Proste dźwięki gry (generowane)
function playShootSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(180, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.08);
}

function playHitSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.12);
}

function playBuildSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, audioCtx.currentTime);
  osc.frequency.setValueAtTime(180, audioCtx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

// Start muzyki lobby po pierwszym kliknięciu (wymaganie przeglądarek)
document.addEventListener('click', () => {
  if (!document.fullscreenElement) goFullscreen();
  if (!musicStarted) {
    musicStarted = true;
    initAudio();
    playLobbyMusic();
  }
}, { once: true });

// ========== LOBBY UI ==========
const menuBtns = document.querySelectorAll('.menu-btn');
const tabs = document.querySelectorAll('.tab-content');
const overlayPanels = document.getElementById('overlay-panels');
menuBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    menuBtns.forEach(b => b.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    const tabEl = document.getElementById('tab-' + tab);
    if (tabEl) tabEl.classList.add('active');
    // play = pokaż stage, reszta = overlay
    if (overlayPanels) {
      if (tab === 'play') overlayPanels.classList.remove('open');
      else overlayPanels.classList.add('open');
    }
  });
});

document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
  });
});

// Friends list storage (Fortnite-style: add friend first, then invite)
function getFriends() {
  try { return JSON.parse(localStorage.getItem('fortnex_friends') || '[]'); } catch(e) { return []; }
}
function saveFriends(list) {
  localStorage.setItem('fortnex_friends', JSON.stringify(list));
}

// Buy pass
const PASS_SKINS = ['cien_ulicy','neonowa_furia','krol_osiedla','ostatni_lowca','wiezien_seweryn'];
const SHOP_SKINS = ['shop_female','shop_male'];

document.getElementById('buy-pass').addEventListener('click', () => {
  const user = getCurrentUser();
  if (!user) return;
  const accounts = getAccounts();
  const acc = accounts[user.email];
  if (!acc) return;
  if (acc.hasPass) { alert('Masz już karnet!'); return; }
  if ((acc.vnex || 0) < 800) { alert('Za mało V-nex!'); return; }
  acc.vnex -= 800;
  acc.hasPass = true;
  acc.ownedSkins = acc.ownedSkins || ['bambika'];
  PASS_SKINS.forEach(s => { if (!acc.ownedSkins.includes(s)) acc.ownedSkins.push(s); });
  saveAccounts(accounts);
  setCurrentUser(acc);
  document.getElementById('v-nex-count').textContent = acc.vnex;
  refreshLockerUI();
  alert('Karnet kupiony! Skiny z karnetu odblokowane w szafce.');
});

// Shop
function openItemPreview(el) {
  const modal = document.getElementById('item-preview-modal');
  const stage = document.getElementById('ipm-stage');
  const title = document.getElementById('ipm-title');
  const desc = document.getElementById('ipm-desc');
  const rarity = document.getElementById('ipm-rarity');
  const type = document.getElementById('ipm-type');
  if (!modal || !stage) return;

  title.textContent = el.dataset.title || el.querySelector('.shop-name,.bp-name')?.textContent || 'Przedmiot';
  desc.textContent = el.dataset.desc || 'Kosmetyk Fortnex';
  const prev = el.dataset.preview || 'skin';
  type.textContent = prev === 'skin' ? 'SKIN' : prev === 'pickaxe' ? 'KILOF' : prev === 'glider' ? 'LOTNIA' : prev === 'emote' ? 'EMOTKA' : 'KOSMETYK';

  rarity.textContent = el.classList.contains('legendary') ? 'LEGENDARNY' : el.classList.contains('epic') ? 'EPICKI' : 'RZADKI';
  rarity.className = 'ipm-rarity' + (el.classList.contains('legendary') ? ' legendary' : el.classList.contains('epic') ? ' epic' : '');

  stage.innerHTML = '';
  if (prev === 'emote') {
    const big = document.createElement('div');
    big.className = 'emote-big';
    const raw = el.querySelector('.bp-preview.emote-prev, .emote-prev, .bp-preview');
    big.textContent = (raw && raw.textContent.trim()) ? raw.textContent.trim() : '💃';
    stage.appendChild(big);
    const note = document.createElement('p');
    note.style.cssText = 'color:#aaa;font-size:13px;margin-top:8px';
    note.textContent = 'W lobby / meczu: klawisz B albo przycisk EMOTKA';
    stage.appendChild(note);
  } else {
    const src = el.querySelector('.shop-preview, .bp-preview, .bp-icon');
    if (src) {
      const clone = src.cloneNode(true);
      clone.style.height = 'auto';
      clone.style.margin = '0';
      clone.style.background = 'transparent';
      clone.style.transform = 'scale(1.4)';
      stage.appendChild(clone);
    }
  }

  let buyBtn = modal.querySelector('.ipm-buy');
  if (buyBtn) buyBtn.remove();
  if (el.classList.contains('shop-item') && el.dataset.price) {
    buyBtn = document.createElement('button');
    buyBtn.className = 'ipm-buy';
    buyBtn.textContent = 'KUP ZA ' + el.dataset.price + ' V-NEX';
    buyBtn.onclick = (e) => {
      e.stopPropagation();
      purchaseShopItem(el);
      closeItemPreview();
    };
    modal.querySelector('.ipm-card').appendChild(buyBtn);
  }

  modal.classList.remove('hidden');
}
function closeItemPreview() {
  document.getElementById('item-preview-modal')?.classList.add('hidden');
}

function purchaseShopItem(item) {
  const price = parseInt(item.dataset.price);
  const user = getCurrentUser();
  if (!user) return;
  const accounts = getAccounts();
  const acc = accounts[user.email];
  if (!acc) return;
  if ((acc.vnex || 0) < price) { alert('Za mało V-nex!'); return; }
  acc.vnex -= price;
  if (item.dataset.skin) {
    acc.ownedSkins = acc.ownedSkins || ['bambika'];
    if (!acc.ownedSkins.includes(item.dataset.skin)) acc.ownedSkins.push(item.dataset.skin);
    acc.skin = item.dataset.skin;
  }
  saveAccounts(accounts);
  setCurrentUser(acc);
  document.getElementById('v-nex-count').textContent = acc.vnex;
  if (item.dataset.skin) updateLobbySkin(item.dataset.skin);
  alert('Kupiono: ' + (item.dataset.title || item.querySelector('.shop-name')?.textContent));
}

document.querySelectorAll('.shop-item').forEach(item => {
  item.addEventListener('click', () => openItemPreview(item));
});
document.querySelectorAll('.bp-slot.previewable').forEach(item => {
  item.addEventListener('click', () => openItemPreview(item));
});
document.getElementById('ipm-close')?.addEventListener('click', (e) => {
  e.preventDefault(); e.stopPropagation();
  closeItemPreview();
});
document.getElementById('ipm-close-bar')?.addEventListener('click', (e) => {
  e.preventDefault(); e.stopPropagation();
  closeItemPreview();
});
document.getElementById('item-preview-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'item-preview-modal') closeItemPreview();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeItemPreview();
});

function getOwnedSkins(acc) {
  let owned = new Set(acc.ownedSkins || ['bambika']);
  owned.add('bambika');
  if (acc.hasPass) PASS_SKINS.forEach(s => owned.add(s));
  // admin ma wszystko
  try {
    if (acc.email === ADMIN_EMAIL) {
      PASS_SKINS.forEach(s => owned.add(s));
      SHOP_SKINS.forEach(s => owned.add(s));
      acc.hasPass = true;
    }
  } catch(e) {}
  return owned;
}

function refreshLockerUI() {
  const user = getCurrentUser();
  if (!user) return;
  const accounts = getAccounts();
  const acc = accounts[user.email] || user;
  acc.ownedSkins = acc.ownedSkins || ['bambika'];
  // wyczyść nielegalne skiny z owned jeśli ktoś wcześniej dostał przez bug (nie admin)
  if (acc.email !== ADMIN_EMAIL && !acc.hasPass) {
    acc.ownedSkins = acc.ownedSkins.filter(s => !PASS_SKINS.includes(s));
    if (!acc.ownedSkins.includes('bambika')) acc.ownedSkins.unshift('bambika');
    if (PASS_SKINS.includes(acc.skin)) acc.skin = 'bambika';
    saveAccounts(Object.assign(accounts, { [acc.email]: acc }));
    setCurrentUser(acc);
  }
  const owned = getOwnedSkins(acc);
  document.querySelectorAll('.locker-item[data-skin]').forEach(item => {
    const skin = item.dataset.skin;
    const ok = owned.has(skin);
    item.classList.toggle('locked', !ok);
    item.classList.toggle('equipped', acc.skin === skin);
    let badge = item.querySelector('.equipped-badge');
    if (acc.skin === skin) {
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'equipped-badge';
        badge.textContent = 'WYPOSAŻONY';
        item.appendChild(badge);
      }
    } else if (badge) badge.remove();
  });
}

// Szafka – tylko owned
document.querySelectorAll('.locker-item[data-skin]').forEach(item => {
  item.addEventListener('click', () => {
    const skin = item.dataset.skin;
    const user = getCurrentUser();
    if (!user) return;
    const accounts = getAccounts();
    const acc = accounts[user.email];
    if (!acc) return;
    const owned = getOwnedSkins(acc);
    if (!owned.has(skin)) {
      if (PASS_SKINS.includes(skin)) alert('Ten skin jest w karnecie — kup karnet (800 V-nex), żeby go odblokować.');
      else if (SHOP_SKINS.includes(skin)) alert('Ten skin jest w sklepie — kup go, żeby założyć.');
      else alert('Nie masz tego skina.');
      return;
    }
    acc.skin = skin;
    saveAccounts(accounts);
    setCurrentUser(acc);
    refreshLockerUI();
    updateLobbySkin(skin);
  });
});


// ========== EMOTKI ==========
let lobbyEmoteTimer = null;
function playLobbyEmote() {
  if (!lobby3d.char) {
    const u = getCurrentUser();
    initLobby3D(u?.skin || 'bambika');
  }
  lobby3d.dancing = true;
  clearTimeout(lobbyEmoteTimer);
  lobbyEmoteTimer = setTimeout(() => { lobby3d.dancing = false; }, 4000);
}
document.getElementById('lobby-emote-btn')?.addEventListener('click', playLobbyEmote);
// B w lobby
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === (keyBinds?.emote || 'b')) {
    const lobbyEl = document.getElementById('lobby');
    if (lobbyEl && lobbyEl.classList.contains('active')) {
      playLobbyEmote();
    }
  }
});


// ========== MULTIPLAYER — jak Fortnite: znajomy → zaproszenie → ekipa ==========
const net = {
  peer: null,
  host: false,
  roomCode: null,
  conns: {},
  members: [],
  remoteMeshes: {},
  remoteState: {},
  lastSend: 0,
  matchStarted: false,
  myId: null,
  friendCode: null,
  pendingInvite: null,
  myReady: false,
  readyMap: {}  // peerId -> bool
};

function partyName() {
  const u = getCurrentUser();
  return (u && (u.name || u.email?.split('@')[0])) || 'Gracz';
}
function partySkin() {
  const u = getCurrentUser();
  return (u && u.skin) || 'bambika';
}
function nameToPeerId(name) {
  let n = String(name || '').trim().toLowerCase();
  n = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  n = n.replace(/[^a-z0-9]/g, '');
  return 'fortnex-n-' + (n || 'gracz').slice(0, 24);
}

function genCode(n) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < (n || 4); i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
function netBroadcast(msg) {
  const data = JSON.stringify(msg);
  Object.values(net.conns).forEach(c => {
    if (c && c.open) try { c.send(data); } catch (e) {}
  });
}
function netSendTo(conn, msg) {
  if (conn && conn.open) try { conn.send(JSON.stringify(msg)); } catch (e) {}
}

function partyList() {
  const me = { id: net.myId || 'me', name: partyName() + (net.host ? ' ★' : ''), skin: partySkin() };
  const list = [];
  const seen = new Set();
  [me, ...net.members].forEach(m => {
    const id = m.id || m.name;
    if (seen.has(id)) return;
    seen.add(id);
    list.push(m);
  });
  return list;
}
function isPlayerReady(id) {
  if (!id || id === net.myId || id === 'me') return !!net.myReady;
  return !!net.readyMap[id];
}
function allPartyReady() {
  const list = partyList();
  if (list.length < 1) return !!net.myReady;
  // solo: must ready yourself
  if (!net.roomCode || list.length === 1) return !!net.myReady;
  return list.every(m => isPlayerReady(m.id));
}
function updateReadyUI() {
  const st = document.getElementById('fn-ready-status');
  const btn = document.getElementById('btn-ready-toggle');
  if (st) {
    st.textContent = net.myReady ? 'Gotowy' : 'Niegotowy';
    st.classList.toggle('is-ready', !!net.myReady);
  }
  if (btn) {
    btn.textContent = net.myReady ? 'NIEGOTOWY' : 'GOTOWY';
    btn.classList.toggle('is-ready', !!net.myReady);
  }
  const play = document.getElementById('play-btn');
  const hint = document.getElementById('play-ready-hint');
  const readyAll = allPartyReady();
  if (play) {
    const inParty = !!(net.roomCode && partyList().length > 1);
    // Solo: zawsze można kliknąć GRAJ
    // Party: zablokowane tylko dla gościa albo gdy nie wszyscy gotowi
    if (!inParty) {
      play.disabled = false;
    } else {
      play.disabled = !readyAll || !net.host;
    }
  }
  if (hint) {
    if (!net.myReady) hint.textContent = 'Kliknij GOTOWY przy postaci';
    else if (!allPartyReady()) hint.textContent = 'Czekaj aż cała ekipa będzie gotowa';
    else if (net.roomCode && !net.host) hint.textContent = 'Gotowi! Czekaj aż lider odpali mecz';
    else hint.textContent = 'Wszyscy gotowi — można grać!';
  }
  const line = document.getElementById('party-ready-line');
  if (line) {
    const list = partyList();
    const parts = list.map(m => {
      const ok = isPlayerReady(m.id);
      return (m.name.replace(' ★','')) + (ok ? ' ✓' : ' …');
    });
    line.textContent = list.length ? ('Gotowość: ' + parts.join(' | ')) : 'Gotowość: —';
  }
}
function updatePartyUI() {
  const status = document.getElementById('party-status');
  const slots = document.getElementById('party-slots');
  const countEl = document.querySelector('.fn-party-count');
  const list = partyList();
  if (status) {
    if (!net.roomCode && list.length <= 1) status.textContent = 'Nie jesteś w ekipie — zaproś znajomego z listy';
    else status.textContent = `Ekipa ${list.length}/4 • ${list.map(m => m.name).join(', ')}` + (net.host ? ' • Ty jesteś liderem' : '');
  }
  if (countEl) countEl.textContent = '👥 ' + Math.max(0, list.length - 1);
  if (slots) {
    slots.querySelectorAll('.party-slot').forEach((el, i) => {
      if (list[i]) {
        const ready = isPlayerReady(list[i].id);
        el.className = 'party-slot filled' + (i > 0 ? ' remote' : '') + (ready ? ' ready-yes' : ' ready-no');
        el.textContent = list[i].name + (ready ? ' ✓' : '');
      } else {
        el.className = 'party-slot empty';
        el.textContent = '+';
      }
    });
  }
  updateReadyUI();
}
function setMyReady(val) {
  net.myReady = !!val;
  netBroadcast({ t: 'ready', id: net.myId, ready: net.myReady, name: partyName() });
  updatePartyUI();
  // auto-start gdy host i wszyscy gotowi? tylko informuj — host klika GRAJ
}
function tryAutoStartIfAllReady() {
  // opcjonalnie: host auto nie — Fortnite czeka na queue. U nas host klika GRAJ.
}


function renderFriendsList() {
  const box = document.getElementById('friends-list');
  if (!box) return;
  const friends = getFriends();
  box.innerHTML = '';
  if (!friends.length) {
    box.innerHTML = '<div class="friends-empty">Brak znajomych — dodaj zioma po nazwie gracza</div>';
    return;
  }
  friends.forEach((f, idx) => {
    const item = document.createElement('div');
    item.className = 'friend-item';
    item.innerHTML = `
      <div class="friend-avatar">${(f.name || '?')[0].toUpperCase()}</div>
      <div class="friend-meta">
        <div class="friend-name">${f.name}</div>
        </div>
      <div class="friend-status">Znajomy</div>
      <button class="invite-btn" data-idx="${idx}">ZAPROŚ DO EKIPY</button>`;
    box.appendChild(item);
  });
  box.querySelectorAll('.invite-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = getFriends()[parseInt(btn.dataset.idx, 10)];
      if (f) inviteFriendToParty(f);
    });
  });
}

function ensureOnlinePeer(cb) {
  if (typeof Peer === 'undefined') {
    alert('Brak połączenia sieciowego (PeerJS). Sprawdź internet.');
    return;
  }
  const display = partyName();
  const nameEl = document.getElementById('my-display-name');
  if (nameEl) nameEl.textContent = display;
  const pill = document.getElementById('online-pill');
  const peerId = nameToPeerId(display);

  if (net.peer && net.myId === peerId) {
    cb && cb();
    return;
  }
  try { if (net.peer) net.peer.destroy(); } catch (e) {}
  net.peer = null;
  net.myId = null;

  net.peer = new Peer(peerId, { debug: 0 });
  net.peer.on('open', (id) => {
    net.myId = id;
    if (pill) { pill.textContent = 'Online'; pill.classList.add('on'); }
    updatePartyUI();
    cb && cb();
  });
  net.peer.on('connection', (conn) => {
    wireConn(conn);
  });
  net.peer.on('error', (err) => {
    console.error(err);
    if (pill) { pill.textContent = 'Błąd sieci'; pill.classList.remove('on'); }
    // nazwa zajęta / konflikt — spróbuj z sufiksem
    if (err && err.type === 'unavailable-id') {
      try { net.peer.destroy(); } catch (e) {}
      net.peer = new Peer(peerId + '-' + Math.floor(Math.random()*90+10), { debug: 0 });
      net.peer.on('open', (id) => {
        net.myId = id;
        if (pill) { pill.textContent = 'Online'; pill.classList.add('on'); }
        cb && cb();
      });
      net.peer.on('connection', wireConn);
    }
  });
}

function wireConn(conn) {
  conn.on('open', () => {
    net.conns[conn.peer] = conn;
  });
  conn.on('data', (raw) => {
    let msg;
    try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return; }
    handleNetMsg(msg, conn);
  });
  conn.on('close', () => {
    delete net.conns[conn.peer];
    net.members = net.members.filter(m => m.id !== conn.peer);
    if (net.remoteMeshes[conn.peer] && scene) {
      scene.remove(net.remoteMeshes[conn.peer]);
      delete net.remoteMeshes[conn.peer];
    }
    delete net.remoteState[conn.peer];
    updatePartyUI();
  });
}

function handleNetMsg(msg, conn) {
  if (!msg || !msg.t) return;

  // Zaproszenie do ekipy (jak w Fortnite)
  if (msg.t === 'partyInvite') {
    net.pendingInvite = { from: msg.from, room: msg.room, fromName: msg.fromName, conn };
    const toast = document.getElementById('party-invite-toast');
    const fromEl = document.getElementById('pit-from');
    if (fromEl) fromEl.textContent = msg.fromName || 'Gracz';
    if (toast) toast.classList.remove('hidden');
    return;
  }

  if (msg.t === 'join' && net.host) {
    const m = msg.member || {};
    m.id = conn.peer;
    if (!net.members.find(x => x.id === m.id) && net.members.length < 3) {
      net.members.push(m);
    }
    net.readyMap[m.id] = false;
    netBroadcast({ t: 'roster', members: net.members, host: { id: net.myId, name: partyName(), skin: partySkin() } });
    netSendTo(conn, { t: 'welcome', code: net.roomCode, members: net.members, readyMap: { ...net.readyMap, [net.myId]: net.myReady } });
    netSendTo(conn, { t: 'ready', id: net.myId, ready: net.myReady, name: partyName() });
    updatePartyUI();
  }
  if (msg.t === 'welcome' && !net.host) {
    net.roomCode = msg.code;
    net.members = msg.members || [];
    if (msg.readyMap) net.readyMap = { ...msg.readyMap };
    net.myReady = false; // dołączasz — musisz sam kliknąć gotowy
    updatePartyUI();
  }
  if (msg.t === 'roster') {
    net.members = msg.members || [];
    updatePartyUI();
  }
  if (msg.t === 'ready') {
    if (msg.id) net.readyMap[msg.id] = !!msg.ready;
    updatePartyUI();
    return;
  }
  if (msg.t === 'startMatch') {
    if (!net.host && !net.matchStarted) {
      net.matchStarted = true;
      beginMatchFromNet();
    }
  }
  if (msg.t === 'state' && msg.id && msg.id !== net.myId) {
    net.remoteState[msg.id] = msg;
    ensureRemoteMesh(msg);
  }
}

function ensureRemoteMesh(st) {
  if (!scene || typeof THREE === 'undefined') return;
  if (!net.remoteMeshes[st.id]) {
    const mesh = makeChar(st.skin || 'bambika');
    scene.add(mesh);
    net.remoteMeshes[st.id] = mesh;
  }
  const mesh = net.remoteMeshes[st.id];
  if (!mesh) return;
  mesh.position.set(st.x || 0, 0, st.z || 0);
  mesh.rotation.y = st.yaw || 0;
  mesh.visible = st.hp === undefined || st.hp > 0;
}

function ensurePartyAsHost(cb) {
  ensureOnlinePeer(() => {
    if (net.host && net.roomCode) {
      cb && cb();
      return;
    }
    net.host = true;
    net.roomCode = genCode(4);
    // party uses same peer; members connect to our friend id and join party
    updatePartyUI();
    cb && cb();
  });
}

function inviteFriendToParty(friend) {
  if (!friend || !friend.name) {
    alert('Brak nazwy znajomego.');
    return;
  }
  ensurePartyAsHost(() => {
    const targetId = nameToPeerId(friend.name);
    let conn = Object.values(net.conns).find(c => c.peer === targetId);
    const sendInv = (c) => {
      netSendTo(c, {
        t: 'partyInvite',
        from: net.myId,
        fromName: partyName(),
        room: net.roomCode
      });
      const st = document.getElementById('party-status');
      if (st) st.textContent = 'Wysłano zaproszenie do ' + friend.name + '...';
    };
    if (conn && conn.open) {
      sendInv(conn);
      return;
    }
    conn = net.peer.connect(targetId, { reliable: true });
    wireConn(conn);
    conn.on('open', () => sendInv(conn));
    conn.on('error', () => {
      alert(friend.name + ' jest offline albo ma inną nazwę. Musi mieć otwarte Fortnex w lobby pod tą samą nazwą.');
    });
    // PeerJS czasem nie emituje error — timeout
    setTimeout(() => {
      if (!conn.open) {
        alert(friend.name + ' nie odpowiada. Niech wejdzie do lobby Fortnex (ta sama nazwa konta).');
      }
    }, 5000);
  });
}

function acceptPartyInvite() {
  const inv = net.pendingInvite;
  const toast = document.getElementById('party-invite-toast');
  if (toast) toast.classList.add('hidden');
  if (!inv) return;
  ensureOnlinePeer(() => {
    net.host = false;
    net.roomCode = inv.room;
    // Połącz z hostem
    const hostPeerId = inv.from;
    let conn = net.conns[hostPeerId];
    if (!conn || !conn.open) {
      conn = net.peer.connect(hostPeerId, { reliable: true });
      wireConn(conn);
      conn.on('open', () => {
        netSendTo(conn, { t: 'join', member: { id: net.myId, name: partyName(), skin: partySkin() } });
        document.getElementById('party-status').textContent = 'Dołączono do ekipy!';
        updatePartyUI();
      });
    } else {
      netSendTo(conn, { t: 'join', member: { id: net.myId, name: partyName(), skin: partySkin() } });
      updatePartyUI();
    }
    net.pendingInvite = null;
  });
}

function declinePartyInvite() {
  net.pendingInvite = null;
  document.getElementById('party-invite-toast')?.classList.add('hidden');
}

function leaveParty() {
  Object.values(net.conns).forEach(c => { try { c.close(); } catch(e) {} });
  net.conns = {};
  net.members = [];
  net.roomCode = null;
  net.host = false;
  net.matchStarted = false;
  net.myReady = false;
  net.readyMap = {};
  updatePartyUI();
  document.getElementById('party-status').textContent = 'Opuszczono ekipę';
}

function beginMatchFromNet() {
  goFullscreen();
  stopLobbyMusic();
  document.getElementById('lobby')?.classList.remove('active');
  const loading = document.getElementById('loading');
  loading?.classList.add('active');
  const txt = document.getElementById('loading-text');
  const sub = document.getElementById('loading-sub');
  if (txt) txt.textContent = 'Dołączanie do ekipy...';
  if (sub) sub.textContent = 'Ten sam mecz ze znajomymi';
  setTimeout(() => {
    loading?.classList.remove('active');
    document.getElementById('game')?.classList.add('active');
    startGame();
  }, 1200);
}

// UI handlers — znajomi
document.getElementById('add-friend-btn')?.addEventListener('click', () => {
  const name = document.getElementById('friend-name')?.value.trim();
  if (!name) { alert('Wpisz nazwę gracza'); return; }
  if (name.toLowerCase() === partyName().toLowerCase()) {
    alert('Nie możesz dodać siebie');
    return;
  }
  const list = getFriends();
  if (list.some(f => f.name.toLowerCase() === name.toLowerCase())) {
    alert('Już masz tego znajomego');
    return;
  }
  list.push({ name });
  saveFriends(list);
  document.getElementById('friend-name').value = '';
  renderFriendsList();
});

document.getElementById('pit-accept')?.addEventListener('click', acceptPartyInvite);
document.getElementById('pit-decline')?.addEventListener('click', declinePartyInvite);
document.getElementById('btn-leave-party')?.addEventListener('click', leaveParty);
document.getElementById('btn-ready-toggle')?.addEventListener('click', () => {
  setMyReady(!net.myReady);
});


// Auto online po lobby
setTimeout(() => {
  renderFriendsList();
  ensureOnlinePeer();
}, 500);

// ========== START MATCH ==========
const lobby = document.getElementById('lobby');
const loading = document.getElementById('loading');
const gameScreen = document.getElementById('game');

document.getElementById('play-btn').addEventListener('click', () => {
  const inParty = !!(net.roomCode && partyList().length > 1);

  // Solo: GRAJ od razu (auto-gotowy)
  if (!inParty) {
    net.myReady = true;
    updateReadyUI();
  } else {
    if (!net.myReady) {
      // auto klik gotowy przy starcie też dla wygody? nie — wymagaj gotowości w party
      alert('Najpierw kliknij GOTOWY przy postaci (zielony).');
      return;
    }
    if (!allPartyReady()) {
      alert('Nie wszyscy w ekipie są gotowi.');
      return;
    }
    if (net.host) {
      net.matchStarted = true;
      netBroadcast({ t: 'startMatch' });
    } else {
      alert('Tylko lider ekipy klika GRAJ. Jak wszyscy są gotowi — lider startuje.');
      return;
    }
  }
  goFullscreen();
  stopLobbyMusic();
  lobby.classList.remove('active');
  loading.classList.add('active');

  const steps = [
    { p: 10, text: 'Łączenie z serwerami Fortnex...', sub: 'Szukanie wolnego lobby' },
    { p: 25, text: 'Dobieranie graczy...', sub: 'Squad • boty uzupełniają skład' },
    { p: 45, text: 'Ładowanie mapy...', sub: 'Zielone Wzgórza • Farmy Słoneczników • Market Nex' },
    { p: 65, text: 'Przygotowywanie busa bojowego...', sub: 'Wszyscy gracze wsiadają na pokład' },
    { p: 85, text: 'Synchronizacja ekwipunku...', sub: 'Kilof gotowy • loot na mapie' },
    { p: 100, text: 'Startujemy!', sub: 'Powodzenia w Fortnex' }
  ];
  const tips = [
    'Wskazówka: Z busa skaczysz Spacją',
    'Wskazówka: Podnoś loot klawiszem E',
    'Wskazówka: Buduj 1/2/3, edytuj G',
    'Wskazówka: Potki dają tarczę, apteczka leczy HP',
    'Wskazówka: Po powaleniu drużyna może Cię odrodzić kartą'
  ];

  const txt = document.getElementById('loading-text');
  const sub = document.getElementById('loading-sub');
  const pct = document.getElementById('loading-percent');
  const fill = document.getElementById('loading-fill');
  const tip = document.getElementById('loading-tip');
  let i = 0;
  if (tip) tip.textContent = tips[Math.floor(Math.random() * tips.length)];
  if (fill) fill.style.width = '0%';
  if (pct) pct.textContent = '0%';

  const interval = setInterval(() => {
    if (i >= steps.length) return;
    const s = steps[i];
    if (txt) txt.textContent = s.text;
    if (sub) sub.textContent = s.sub;
    if (pct) pct.textContent = s.p + '%';
    if (fill) fill.style.width = s.p + '%';
    i++;
  }, 700);

  setTimeout(() => {
    clearInterval(interval);
    if (fill) fill.style.width = '100%';
    if (pct) pct.textContent = '100%';
    setTimeout(() => {
      loading.classList.remove('active');
      gameScreen.classList.add('active');
      startGame(); // dopiero tu bus
    }, 400);
  }, 700 * steps.length + 200);
});

document.getElementById('exit-game').addEventListener('click', returnToLobby);
document.getElementById('return-lobby').addEventListener('click', returnToLobby);
document.getElementById('win-lobby').addEventListener('click', returnToLobby);

// Zagraj ponownie po śmierci = oglądanie + szukanie nowej gry
document.getElementById('spectate-btn').addEventListener('click', () => {
  // Jeśli jest aktywna karta – odrodzenie w najbliższym busie restartu (symulacja drużyny)
  if (player && player.rebootCard && player.rebootCard.timer > 0 && REBOOT_VANS.length) {
    let best = REBOOT_VANS[0], bestD = 1e9;
    REBOOT_VANS.forEach(v => {
      const d = Math.hypot(v.x - player.rebootCard.x, v.y - player.rebootCard.y);
      if (d < bestD) { bestD = d; best = v; }
    });
    player.x = best.x;
    player.y = best.y;
    player.hp = 100;
    player.shield = 0;
    player.knocked = false;
    player.weapon = null;
    player.ammo = 0;
    player.reserve = 0;
    player.rebootCard = null;
    gameOver = false;
    gamePhase = 'ground';
    document.getElementById('death-screen').classList.add('hidden');
    document.getElementById('spectate-info').style.display = 'none';
    addKillFeed('Odrodzenie w busie: ' + best.name);
    updateHUD();
    return;
  }
  // Brak karty – oglądanie / nowy mecz
  document.getElementById('spectate-info').style.display = 'block';
  document.getElementById('spectate-info').textContent = 'Brak karty – oglądasz mecz / szukanie nowej gry...';
  document.getElementById('spectate-btn').disabled = true;
  document.getElementById('spectate-btn').textContent = 'OCZEKIWANIE...';
  setTimeout(() => {
    document.getElementById('death-screen').classList.add('hidden');
    document.getElementById('spectate-info').style.display = 'none';
    document.getElementById('spectate-btn').disabled = false;
    document.getElementById('spectate-btn').textContent = 'ZAGRAJ PONOWNIE';
    startGame();
  }, 3500);
});

// Zagraj ponownie po wygranej
document.getElementById('win-again').addEventListener('click', () => {
  document.getElementById('win-screen').classList.add('hidden');
  startGame();
});

// ========== WEAPONS ==========
const WEAPONS = {
  scar:   { name: 'SCAR', dmg: 36, fireRate: 180, mag: 30, reserve: 90, speed: 80, range: 120, spread: 0.02, rarity: 'legendary' },
  mka:    { name: 'Mka', dmg: 30, fireRate: 160, mag: 30, reserve: 90, speed: 75, range: 110, spread: 0.03, rarity: 'epic' },
  p90:    { name: 'P90', dmg: 17, fireRate: 70, mag: 40, reserve: 120, speed: 65, range: 70, spread: 0.06, rarity: 'epic' },
  pump:   { name: 'Szybka Pompa', dmg: 90, fireRate: 900, mag: 5, reserve: 15, speed: 70, range: 35, spread: 0.1, pellets: 8, rarity: 'rare' },
  spaz:   { name: 'Spaz', dmg: 110, fireRate: 1200, mag: 5, reserve: 10, speed: 70, range: 32, spread: 0.09, pellets: 10, rarity: 'legendary' },
  sniper: { name: 'Snajperka', dmg: 105, fireRate: 1500, mag: 1, reserve: 15, speed: 140, range: 250, spread: 0.005, rarity: 'epic' },
  rifle:  { name: 'Karabin', dmg: 25, fireRate: 150, mag: 30, reserve: 60, speed: 70, range: 100, spread: 0.04, rarity: 'rare' },
  pickaxe:{ name: 'Kilof', dmg: 20, fireRate: 450, mag: 999, reserve: 999, speed: 40, range: 8, spread: 0.02, rarity: 'default', melee: true }
};

const HEALS = {
  minipot: { name: 'Mała potka', shield: 25, hp: 0 },
  bigpot:  { name: 'Duża potka', shield: 50, hp: 0 },
  medkit:  { name: 'Apteczka', shield: 0, hp: 100 },
  bandages:{ name: 'Bandaże', shield: 0, hp: 15 }
};

const BOT_NICKS = [
  'SewerynFan','NexKiller','OsiedleKing','PompkaPL','NoBuildGod','Karambit','TiltedDrop','BusJumper',
  'StrefaEdge','LootGoblin','MordoGG','VNexFarmer','OnePump','Cranked90','TryhardPL','FortnexPro',
  'SpazEnjoyer','P90Spray','SniperDiff','EditGod','HotDropHero','SafeZoneRat','ThirdParty','WKeyWarrior'
];

const MAP_POIS = [
  { name: 'Zielone Wzgórza', x: -75, z: -85, style: 'town' },
  { name: 'Stara Fabryka', x: 95, z: -65, style: 'factory' },
  { name: 'Market Nex', x: 0, z: 5, style: 'retail' },
  { name: 'Port Rybacki', x: -95, z: 85, style: 'dock' },
  { name: 'Wieża Górska', x: 105, z: 95, style: 'tower' },
  { name: 'Farmy Słoneczników', x: -45, z: 45, style: 'farm' },
  { name: 'Dworzec Zachodni', x: 55, z: -25, style: 'station' },
  { name: 'Motel Przy drodze', x: -55, z: 15, style: 'motel' }
];

let REBOOT_VANS = [];
let scene, camera, renderer, clock, canvas;
let playerMesh, busMesh, zoneMesh, weaponMesh;
let botMeshes = [], bulletMeshes = [], structureMeshes = [], lootMeshes = [], vanMeshes = [];
let yaw = 0, pitch = 0;
let pointerLocked = false;
let animId = null;
let player = null;
let bots = [];
let bus = null;
let keys = {};
let mouse = { down: false, x: 0, y: 0 };
let gamePhase = 'bus';
let gameOver = false;
let bullets = [];
let structures = [];
let loots = [];
let aliveCount = 0;
let killCount = 0;
let zoneTimer = 45;
let zoneRadius = 100;
let zoneDamageTimer = 0;
let zoneInterval = null;

function resize3D() {
  if (!renderer || !camera || !canvas) return;
  let w = canvas.clientWidth || 0;
  let h = canvas.clientHeight || 0;
  if (w < 16 || h < 16) {
    w = window.innerWidth || 800;
    h = window.innerHeight || 600;
  }
  renderer.setSize(w, h, false);
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// Skiny Fortnex (kolory / styl w meczu 3D)
const SKINS = {
  bambika: {
    name: 'Bambika', gender: 'male',
    body: 0x4a6fa5, accent: 0x2c3e50, skin: 0xffdbac, legs: 0x1a252f, hair: 0x3b2f2f
  },
  cien_ulicy: {
    name: 'Cień Ulicy', gender: 'male',
    body: 0x222222, accent: 0x444444, skin: 0xc68642, legs: 0x111111, hair: 0x111111
  },
  neonowa_furia: {
    name: 'Neonowa Furia', gender: 'female',
    body: 0xff2d95, accent: 0x00f0ff, skin: 0xffdbac, legs: 0x1a0033, hair: 0xff00aa
  },
  krol_osiedla: {
    name: 'Król Osiedla', gender: 'male',
    body: 0xffd700, accent: 0x1a1a1a, skin: 0xc68642, legs: 0x222222, hair: 0x1a1a1a
  },
  ostatni_lowca: {
    name: 'Ostatni Łowca', gender: 'male',
    body: 0x2d5a27, accent: 0x8b4513, skin: 0xe0ac69, legs: 0x3d2914, hair: 0x4a3728
  },
  wiezien_seweryn: {
    name: 'WIĘZIEŃ SEWERYN', gender: 'male',
    body: 0xff6b00, accent: 0xffffff, skin: 0xe0ac69, legs: 0xff6b00, hair: 0xc4a35a
  },
  shop_female: {
    name: 'Raiderka Fortnex', gender: 'female',
    body: 0x9c3b2e, accent: 0x5c4033, skin: 0xd4a574, legs: 0x5c4a3a, hair: 0x1a120e,
    goggles: true, facepaint: true, style: 'raider_f'
  },
  shop_male: {
    name: 'Trooper Fortnex', gender: 'male',
    body: 0x4a5c28, accent: 0xc4b896, skin: 0x5c3a2a, legs: 0x8a7a3a, hair: 0x1a1a1a,
    helmet: true, scarf: true, style: 'raider_m'
  }
};

function makeChar(skinId) {
  // Stylizowany humanoid bliższy proporcjom Fortnite (duża głowa, atletyczna sylwetka)
  // To NIE jest Unreal — ale maksymalnie w tym kierunku w Three.js
  const s = SKINS[skinId] || SKINS.bambika;
  const female = (s.gender === 'female');
  const g = new THREE.Group();
  const mat = (c, opts = {}) => new THREE.MeshStandardMaterial({
    color: c,
    roughness: opts.roughness ?? 0.48,
    metalness: opts.metalness ?? 0.05,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.em ?? 0
  });

  // Proporcje FN-like: większa głowa, krótsze nogi względem torsu, wyraźne barki
  const scale = 1.0;
  const shoulderX = female ? 0.36 : 0.44;
  const bodyW = female ? 0.44 : 0.56;
  const bodyD = female ? 0.28 : 0.34;
  const legLen = 0.68;
  const torsoH = female ? 0.58 : 0.66;

  // === STOPY ===
  const bootCol = 0x2a2218;
  const footL = new THREE.Mesh(new THREE.BoxGeometry(female ? 0.15 : 0.18, 0.12, 0.30), mat(bootCol, { roughness: 0.85 }));
  footL.position.set(-0.13, 0.06, 0.05);
  const footR = footL.clone(); footR.position.x = 0.13;

  // === NOGI (cylindry + udo szersze) ===
  const legMat = mat(s.legs, { roughness: 0.7 });
  const thighL = new THREE.Mesh(new THREE.CylinderGeometry(female ? 0.10 : 0.12, female ? 0.09 : 0.11, legLen * 0.55, 12), legMat);
  thighL.position.set(-0.13, 0.42, 0);
  const thighR = thighL.clone(); thighR.position.x = 0.13;
  const calfL = new THREE.Mesh(new THREE.CylinderGeometry(female ? 0.075 : 0.09, female ? 0.08 : 0.095, legLen * 0.45, 12), legMat);
  calfL.position.set(-0.13, 0.18, 0);
  const calfR = calfL.clone(); calfR.position.x = 0.13;

  // nakolanniki
  const kneeL = new THREE.Mesh(new THREE.CylinderGeometry(female ? 0.105 : 0.125, female ? 0.105 : 0.125, 0.1, 10), mat(s.accent || 0x444, { metalness: 0.2, roughness: 0.6 }));
  kneeL.position.set(-0.13, 0.30, 0.01);
  const kneeR = kneeL.clone(); kneeR.position.x = 0.13;

  // === BIODRA ===
  const hips = new THREE.Mesh(
    new THREE.SphereGeometry(female ? 0.22 : 0.24, 12, 10),
    legMat
  );
  hips.position.y = 0.78;
  hips.scale.set(female ? 1.15 : 1.05, 0.55, 0.85);

  // === TORS (trapez: szerszy u góry u mężczyzn) ===
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW, torsoH, bodyD),
    mat(s.body, { roughness: 0.5 })
  );
  body.position.y = 1.22;
  // klatka
  const chest = new THREE.Mesh(
    new THREE.SphereGeometry(female ? 0.20 : 0.26, 14, 12),
    mat(s.body, { roughness: 0.48 })
  );
  chest.position.y = 1.42;
  chest.scale.set(bodyW / 0.42, female ? 0.5 : 0.58, bodyD / 0.32);

  // pasek
  const belt = new THREE.Mesh(
    new THREE.TorusGeometry(bodyW * 0.48, 0.035, 8, 20),
    mat(s.accent || 0x333, { metalness: 0.35, roughness: 0.45 })
  );
  belt.position.y = 0.92;
  belt.rotation.x = Math.PI / 2;

  // === RAMIONA ===
  const armLG = new THREE.Group(); armLG.position.set(-shoulderX, 1.52, 0);
  const upperArmL = new THREE.Mesh(new THREE.CylinderGeometry(female ? 0.065 : 0.085, female ? 0.06 : 0.075, 0.38, 10), mat(s.body));
  upperArmL.position.y = -0.16;
  armLG.add(upperArmL);
  const foreArmL = new THREE.Mesh(new THREE.CylinderGeometry(female ? 0.055 : 0.07, female ? 0.05 : 0.06, 0.34, 10), mat(s.body));
  foreArmL.position.y = -0.48;
  armLG.add(foreArmL);
  const handL = new THREE.Mesh(new THREE.SphereGeometry(female ? 0.055 : 0.065, 10, 8), mat(s.skin, { roughness: 0.55 }));
  handL.position.y = -0.68;
  armLG.add(handL);

  const armRG = new THREE.Group(); armRG.position.set(shoulderX, 1.52, 0);
  const upperArmR = upperArmL.clone(); armRG.add(upperArmR);
  const foreArmR = foreArmL.clone(); armRG.add(foreArmR);
  const handR = handL.clone(); armRG.add(handR);

  // barki
  const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(female ? 0.08 : 0.1, 10, 8), mat(s.body));
  shoulderL.position.set(-shoulderX, 1.52, 0);
  const shoulderR = shoulderL.clone(); shoulderR.position.x = shoulderX;

  // === SZYJA + GŁOWA (większa — styl FN) ===
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.14, 12), mat(s.skin, { roughness: 0.55 }));
  neck.position.y = 1.62;

  const headR = female ? 0.28 : 0.30;
  const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 20, 16), mat(s.skin, { roughness: 0.52 }));
  head.position.y = 1.92;
  head.scale.set(0.95, 1.05, 0.9);

  // włosy / czapka bazowa
  const hair = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.05, 16, 12), mat(s.hair, { roughness: 0.75 }));
  hair.position.y = 2.02;
  hair.scale.set(1.02, 0.55, 1.05);

  // twarz — oczy + białka
  const eyeWhiteL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mat(0xf5f5f5, { roughness: 0.3 }));
  eyeWhiteL.position.set(-0.09, 1.94, headR * 0.78);
  eyeWhiteL.scale.set(1, 0.85, 0.5);
  const eyeWhiteR = eyeWhiteL.clone(); eyeWhiteR.position.x = 0.09;
  const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), mat(0x1a1208, { roughness: 0.2 }));
  pupilL.position.set(-0.09, 1.94, headR * 0.88);
  const pupilR = pupilL.clone(); pupilR.position.x = 0.09;

  // nos
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), mat(s.skin, { roughness: 0.55 }));
  nose.position.set(0, 1.88, headR * 0.85);
  nose.scale.set(0.7, 1, 0.9);

  // usta
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), mat(0x8a4050, { roughness: 0.6 }));
  mouth.position.set(0, 1.78, headR * 0.82);

  const parts = [
    footL, footR, thighL, thighR, calfL, calfR, kneeL, kneeR,
    hips, body, chest, belt, armLG, armRG, shoulderL, shoulderR,
    neck, head, hair, eyeWhiteL, eyeWhiteR, pupilL, pupilR, nose, mouth
  ];

  // —— detale shop / legenda ——
  if (s.goggles || skinId === 'shop_female') {
    const gogBand = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 8, 20), mat(0x333333, { metalness: 0.4 }));
    gogBand.position.set(0, 2.0, 0.05);
    gogBand.rotation.x = Math.PI / 2;
    const lensL = new THREE.Mesh(new THREE.CircleGeometry(0.07, 12), mat(0x88aacc, { metalness: 0.7, roughness: 0.25, emissive: 0x224455, em: 0.2 }));
    lensL.position.set(-0.08, 2.0, headR * 0.75);
    const lensR = lensL.clone(); lensR.position.x = 0.08;
    const braid = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.5, 8), mat(s.hair));
    braid.position.set(0.2, 1.75, -0.08);
    parts.push(gogBand, lensL, lensR, braid);
  }
  if (s.facepaint || skinId === 'shop_female') {
    const paint = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.035, 0.03), mat(0x1a1a1a));
    paint.position.set(0, 1.86, headR * 0.9);
    parts.push(paint);
  }
  if (s.helmet || skinId === 'shop_male') {
    const helm = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.12, 16, 12), mat(0x3d3428, { roughness: 0.8 }));
    helm.position.y = 2.0;
    helm.scale.set(1.05, 0.55, 1.05);
    const brim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 16), mat(0x2a2418, { roughness: 0.7 }));
    brim.position.set(0, 1.98, 0.02);
    brim.rotation.x = Math.PI / 2;
    const gogM = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.028, 8, 16), mat(0xb0c0d0, { metalness: 0.55, roughness: 0.3 }));
    gogM.position.set(0, 1.96, 0.12);
    gogM.rotation.x = Math.PI / 2;
    parts.push(helm, brim, gogM);
  }
  if (s.scarf || skinId === 'shop_male') {
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.055, 8, 14), mat(0xc4b896, { roughness: 0.7 }));
    scarf.position.set(0, 1.68, 0.04);
    scarf.rotation.x = Math.PI / 2;
    parts.push(scarf);
  }
  if (skinId === 'shop_male') {
    // tatuaż FORTNEX na ramieniu
    const tat = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.12), mat(0x1a1a1a));
    tat.position.set(shoulderX + 0.06, 1.4, 0.05);
    parts.push(tat);
  }
  if (skinId === 'wiezien_seweryn') {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 0.02, 0.12, bodyD + 0.02), mat(0xffffff));
    stripe.position.y = 1.28;
    parts.push(stripe);
  }

  parts.forEach(m => {
    m.traverse?.(ch => { if (ch.isMesh) { ch.castShadow = true; ch.receiveShadow = true; } });
    if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; }
    g.add(m);
  });

  // Postura FN lobby
  if (female) {
    armLG.rotation.set(0.15, 0.1, 0.25);
    armRG.rotation.set(0.15, -0.1, -0.25);
  } else {
    armLG.rotation.set(0.2, 0.05, 0.45);
    armRG.rotation.set(0.2, -0.05, -0.45);
  }

  g.scale.setScalar(scale);
  g.userData.skinId = skinId;
  g.userData.gender = female ? 'female' : 'male';
  g.userData.armL = armLG;
  g.userData.armR = armRG;
  g.userData.legL = thighL;
  g.userData.legR = thighR;
  return g;
}

function getEquippedSkin() {
  try {
    const u = getCurrentUser();
    if (u && u.skin && SKINS[u.skin]) return u.skin;
  } catch(e) {}
  return 'bambika';
}


function makeNoiseTexture(w, h, baseRGB, variance, opts={}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const [br, bg, bb] = baseRGB;
  const tile = opts.tile || false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      let n = (Math.random() - 0.5) * variance;
      // lekki wzór kratki / trawy
      if (opts.mode === 'grass') {
        n += Math.sin(x * 0.4) * 4 + Math.cos(y * 0.35) * 4;
        if ((x + y) % 7 === 0) n -= 12;
      } else if (opts.mode === 'sand') {
        n += Math.sin(x * 0.2 + y * 0.15) * 8;
      } else if (opts.mode === 'brick') {
        const bx = Math.floor(x / 8), by = Math.floor(y / 4);
        n += ((bx + by) % 2) * 18;
        if (x % 8 === 0 || y % 4 === 0) n -= 40;
      } else if (opts.mode === 'wood') {
        n += Math.sin(y * 0.5) * 20 + Math.sin(x * 0.05) * 8;
      } else if (opts.mode === 'rock') {
        n += ((x * 13 + y * 7) % 17) - 8;
      } else if (opts.mode === 'metal') {
        n += Math.sin(x * 0.8) * 10;
      }
      img.data[i]     = Math.max(0, Math.min(255, br + n));
      img.data[i + 1] = Math.max(0, Math.min(255, bg + n * 0.9));
      img.data[i + 2] = Math.max(0, Math.min(255, bb + n * 0.7));
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (opts.repeat) tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  return tex;
}

function buildWorld() {
  // PROSTY, stabilny świat — bez canvas-tekstur (te psuły iPada)
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.Fog(0x87CEEB, 80, 280);

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const sun = new THREE.DirectionalLight(0xfff5e0, 0.9);
  sun.position.set(50, 80, 30);
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xb0d8ff, 0x4a7a30, 0.55));

  // trawa
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(180, 48),
    new THREE.MeshLambertMaterial({ color: 0x3d9a3a })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);

  // ziemia na brzegu
  const dirt = new THREE.Mesh(
    new THREE.RingGeometry(140, 180, 48),
    new THREE.MeshLambertMaterial({ color: 0xc2a46a })
  );
  dirt.rotation.x = -Math.PI / 2;
  dirt.position.y = 0.05;
  scene.add(dirt);

  // POI — proste kolorowe budynki
  const wallColors = [0xc4a574, 0xd9c4a0, 0x8B4513, 0xb0b0b0, 0xe8e0d0];
  const roofColors = [0xb33a2e, 0x3a5a8c, 0x5a5a5a, 0x8B2500];
  MAP_POIS.forEach((poi, pi) => {
    const group = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.4, 16),
      new THREE.MeshLambertMaterial({ color: 0x888880 })
    );
    base.position.y = 0.2;
    group.add(base);
    const n = 4 + (pi % 3);
    for (let i = 0; i < n; i++) {
      const h = 3 + Math.random() * 6;
      const w = 2.5 + Math.random() * 3;
      const d = 2.5 + Math.random() * 3;
      const px = (Math.random() - 0.5) * 10;
      const pz = (Math.random() - 0.5) * 10;
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshLambertMaterial({ color: wallColors[(pi + i) % wallColors.length] })
      );
      wall.position.set(px, h / 2, pz);
      group.add(wall);
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.4, 0.35, d + 0.4),
        new THREE.MeshLambertMaterial({ color: roofColors[i % roofColors.length] })
      );
      roof.position.set(px, h + 0.2, pz);
      group.add(roof);
    }
    group.position.set(poi.x, 0, poi.z);
    scene.add(group);
  });

  // drzewa
  for (let i = 0; i < 60; i++) {
    const tx = (Math.random() - 0.5) * 300;
    const tz = (Math.random() - 0.5) * 300;
    if (Math.hypot(tx, tz) < 25) continue;
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 2.2, 6),
      new THREE.MeshLambertMaterial({ color: 0x5c3a1e })
    );
    trunk.position.set(tx, 1.1, tz);
    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 6, 6),
      new THREE.MeshLambertMaterial({ color: 0x2d8a2a })
    );
    leaves.position.set(tx, 2.9, tz);
    scene.add(trunk);
    scene.add(leaves);
  }

  // skały
  for (let i = 0; i < 15; i++) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.8 + Math.random(), 0),
      new THREE.MeshLambertMaterial({ color: 0x777770 })
    );
    rock.position.set((Math.random() - 0.5) * 280, 0.5, (Math.random() - 0.5) * 280);
    scene.add(rock);
  }

  // reboot vans
  REBOOT_VANS = [];
  vanMeshes = [];
  MAP_POIS.forEach(poi => {
    const van = { x: poi.x + 8, z: poi.z + 8, name: poi.name };
    REBOOT_VANS.push(van);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 2.2, 4.5),
      new THREE.MeshLambertMaterial({ color: 0x00c8e0 })
    );
    mesh.position.set(van.x, 1.1, van.z);
    scene.add(mesh);
    vanMeshes.push(mesh);
  });

  // strefa
  const zoneGeo = new THREE.RingGeometry(99, 101, 64);
  zoneMesh = new THREE.Mesh(zoneGeo, new THREE.MeshBasicMaterial({
    color: 0xcc00ff, side: THREE.DoubleSide, transparent: true, opacity: 0.55
  }));
  zoneMesh.rotation.x = -Math.PI / 2;
  zoneMesh.position.y = 0.5;
  scene.add(zoneMesh);
}

function startGame() {
  canvas = document.getElementById('game-canvas');
  if (animId) cancelAnimationFrame(animId);

  // NAJPIERW zabij lobby WebGL — na iPadzie max 1 kontekst
  stopLobby3D();

  net.remoteMeshes = {};
  net.remoteState = {};

  if (typeof THREE === 'undefined') {
    alert('Brak silnika 3D (Three.js). Odśwież stronę.');
    return;
  }

  // Upewnij się że ekran gry jest widoczny PRZED tworzeniem WebGL
  document.getElementById('loading')?.classList.remove('active');
  document.getElementById('game')?.classList.add('active');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x5eb0ff);
  camera = new THREE.PerspectiveCamera(70, 1, 0.1, 600);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1);

  try {
    if (renderer) {
      try { renderer.dispose(); renderer.forceContextLoss?.(); } catch (e) {}
      renderer = null;
    }
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: false,
      powerPreference: isMobile ? 'default' : 'high-performance',
      failIfMajorPerformanceCaveat: false
    });
  } catch (err) {
    console.error(err);
    alert('WebGL nie wystartował na tym urządzeniu. Odśwież stronę i spróbuj ponownie.\n' + (err.message || err));
    return;
  }

  const gl = renderer.getContext && renderer.getContext();
  if (!gl) {
    alert('WebGL kontekst pusty. Zamknij inne karty z grą i odśwież.');
    return;
  }
  renderer.setClearColor(0x87CEEB, 1);
  renderer.shadowMap.enabled = false; // stabilniej na wszystkich urządzeniach
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2));
  try { renderer.outputEncoding = THREE.sRGBEncoding; } catch (e) {}

  resize3D();
  window.addEventListener('resize', resize3D);
  setTimeout(resize3D, 50);
  setTimeout(resize3D, 200);
  setTimeout(resize3D, 500);
  clock = new THREE.Clock();

  try {
    buildWorld();
  } catch (err) {
    console.error('buildWorld', err);
    // awaryjne proste światło + podłoga
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const g = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshBasicMaterial({ color: 0x3a9a3a })
    );
    g.rotation.x = -Math.PI / 2;
    scene.add(g);
  }

  player = {
    x: 0, y: 0, z: 0,
    hp: 100, shield: 0,
    speed: 0.18, baseSpeed: 0.18,
    weapon: 'pickaxe', ammo: 999, reserve: 999,
    lastShot: 0, buildType: 1,
    crouching: false, jumping: false, jumpVel: 0,
    knocked: false, knockTimer: 0,
    rebootCard: null,
    inBus: true, skydive: false, height: 40,
    mats: { wood: 150, stone: 100, metal: 50 },
    emoting: false,
    emoteTimer: 0,
    sprinting: false
  };
  yaw = 0; pitch = 0.15;

  player.skin = getEquippedSkin();
  try {
    playerMesh = makeChar(player.skin);
  } catch (e) {
    console.warn('makeChar fail', e);
    playerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.8, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x4a6fa5 })
    );
    playerMesh.position.y = 0.9;
  }
  playerMesh.visible = true;
  scene.add(playerMesh);
  // broń przy ręce
  weaponMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.35 })
  );
  weaponMesh.position.set(0.45, 1.35, -0.35);
  playerMesh.add(weaponMesh);


  // bus
  busMesh = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(14, 3.2, 5), new THREE.MeshLambertMaterial({ color: 0xf5f5f5 }));
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.8, 5.2), new THREE.MeshLambertMaterial({ color: 0xff6b00 }));
  stripe.position.y = 0.2;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(3, 1.5, 4.2), new THREE.MeshLambertMaterial({ color: 0x66bbee }));
  cabin.position.set(5, 1.0, 0);
  const balloon = new THREE.Mesh(new THREE.SphereGeometry(2.5, 12, 12), new THREE.MeshLambertMaterial({ color: 0xff6b00 }));
  balloon.position.set(-5, 4.0, 0);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6), new THREE.MeshLambertMaterial({ color: 0x333333 }));
  rope.position.set(-5, 2.2, 0);
  busMesh.add(body); busMesh.add(stripe); busMesh.add(cabin); busMesh.add(balloon); busMesh.add(rope);
  bus = { x: -150, z: 0, speed: 0.35, angle: 0 };
  busMesh.position.set(bus.x, 35, bus.z);
  scene.add(busMesh);

  bots = [];
  botMeshes.forEach(m => scene.remove(m));
  botMeshes = [];
  const botCount = (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1) ? 12 : 24;
  for (let i = 0; i < botCount; i++) {
    const bot = createBot();
    bots.push(bot);
    const skinKeys = Object.keys(SKINS);
    bot.skin = skinKeys[Math.floor(Math.random() * skinKeys.length)];
    const m = makeChar(bot.skin);
    m.position.set(bot.x, 0, bot.z);
    scene.add(m);
    botMeshes.push(m);
  }

  bullets = [];
  bulletMeshes.forEach(m => scene.remove(m));
  bulletMeshes = [];
  structures = [];
  structureMeshes.forEach(m => scene.remove(m));
  structureMeshes = [];
  loots = [];
  lootMeshes.forEach(m => scene.remove(m));
  lootMeshes = [];

  // world loot
  const gunIds = ['scar','mka','p90','pump','spaz','sniper'];
  const healIds = ['minipot','bigpot','medkit','bandages'];
  for (let i = 0; i < 50; i++) {
    const x = (Math.random()-0.5)*300;
    const z = (Math.random()-0.5)*300;
    if (Math.random() < 0.55) {
      const id = gunIds[Math.floor(Math.random()*gunIds.length)];
      spawnLoot(x, z, 'weapon', id);
    } else {
      spawnLoot(x, z, healIds[Math.floor(Math.random()*healIds.length)]);
    }
  }

  aliveCount = 29;
  killCount = 0;
  zoneTimer = 45;
  zoneRadius = 100;
  zoneDamageTimer = 0;
  gameOver = false;
  gamePhase = 'bus';

  document.getElementById('death-screen').classList.add('hidden');
  document.getElementById('win-screen').classList.add('hidden');
  document.getElementById('kill-feed').innerHTML = '';
  updateHUD();

  // input
  keys = {};
  window.onkeydown = e => {
    if (typeof listeningAction !== 'undefined' && listeningAction) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
    keys[k] = true;
    if (k === ' ') keys[' '] = true;
    if (e.key === '1') player.buildType = 1;
    if (e.key === '2') player.buildType = 2;
    if (e.key === '3') player.buildType = 3;
    if (k === (keyBinds?.reload || 'r')) reload();
    if (k === (keyBinds?.interact || 'e')) pickupLoot();
    if ((k === (keyBinds?.jump || ' ') || k === 'spacebar') && gamePhase === 'bus') jumpFromBus();
    else if ((k === (keyBinds?.jump || ' ') || k === 'spacebar') && gamePhase === 'ground' && !player.jumping && !player.knocked) {
      player.jumping = true; player.jumpVel = 0.28;
    }
    if (k === (keyBinds?.crouch || 'c') || k === 'control') {
      player.crouching = true;
      player.speed = player.baseSpeed * 0.5;
    }
    if (k === (keyBinds?.edit || 'g')) editNearestStructure();
    if (k === (keyBinds?.build || 'f') && gamePhase === 'ground') build();
    if ((k === (keyBinds?.emote || 'b')) && gamePhase === 'ground' && !player.knocked && !player.emoting) {
      player.emoting = true;
      player.emoteTimer = 3.5;
    }
  };
  window.onkeyup = e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
    keys[k] = false;
    if (k === (keyBinds?.crouch || 'c') || k === 'control') {
      player.crouching = false;
      player.speed = player.baseSpeed;
    }
  };

  canvas.onclick = () => {
    canvas.requestPointerLock && canvas.requestPointerLock();
  };
  document.onpointerlockchange = () => {
    pointerLocked = document.pointerLockElement === canvas;
  };
  document.onmousemove = e => {
    if (!pointerLocked && gamePhase === 'ground') {
      // soft aim without lock
    }
    if (pointerLocked || gameScreen.classList.contains('active')) {
      if (pointerLocked) {
        yaw -= e.movementX * 0.0025;
        pitch -= e.movementY * 0.002;
        pitch = Math.max(-1.2, Math.min(1.2, pitch));
      }
    }
  };
  canvas.onmousedown = () => { mouse.down = true; };
  canvas.onmouseup = () => { mouse.down = false; };

  // mobile
  const btnShoot = document.getElementById('btn-shoot');
  if (btnShoot) {
    btnShoot.ontouchstart = e => { e.preventDefault(); mouse.down = true; };
    btnShoot.ontouchend = () => { mouse.down = false; };
    const bb = document.getElementById('btn-build');
    if (bb) bb.ontouchstart = e => { e.preventDefault(); build(); };
    const br = document.getElementById('btn-reload');
    if (br) br.ontouchstart = e => { e.preventDefault(); reload(); };
    const bj = document.getElementById('btn-jump');
    if (bj) bj.ontouchstart = e => {
      e.preventDefault();
      if (gamePhase === 'bus') jumpFromBus();
      else if (!player.jumping) { player.jumping = true; player.jumpVel = 0.28; }
    };
    const bc = document.getElementById('btn-crouch');
    if (bc) {
      bc.ontouchstart = e => { e.preventDefault(); player.crouching = true; player.speed = player.baseSpeed * 0.5; };
      bc.ontouchend = () => { player.crouching = false; player.speed = player.baseSpeed; };
    }
    const be = document.getElementById('btn-edit');
    if (be) be.ontouchstart = e => { e.preventDefault(); editNearestStructure(); };
  }

  const zoneInterval = setInterval(() => {
    if (gameOver || !gameScreen.classList.contains('active')) { clearInterval(zoneInterval); return; }
    if (gamePhase !== 'ground') return;
    zoneTimer--;
    if (zoneTimer <= 0) {
      zoneRadius = Math.max(18, zoneRadius - 12);
      zoneTimer = 35;
      if (zoneMesh) {
        scene.remove(zoneMesh);
        const zg = new THREE.RingGeometry(zoneRadius - 0.8, zoneRadius, 64);
        zoneMesh = new THREE.Mesh(zg, new THREE.MeshBasicMaterial({ color: 0xaa00ff, side: THREE.DoubleSide, transparent: true, opacity: 0.55 }));
        zoneMesh.rotation.x = -Math.PI / 2;
        zoneMesh.position.y = 0.3;
        scene.add(zoneMesh);
      }
    }
    const zt = document.getElementById('zone-timer');
    if (zt) zt.textContent = zoneRadius < 25 ? 'STREFA!' : `Strefa za ${zoneTimer}s`;
  }, 1000);

  loop();
}

function createBot() {
  const nick = BOT_NICKS[Math.floor(Math.random() * BOT_NICKS.length)];
  const tag = Math.floor(Math.random() * 90 + 10);
  return {
    x: (Math.random()-0.5)*200,
    z: (Math.random()-0.5)*200,
    y: 0, hp: 100, shield: Math.random() < 0.35 ? 50 : 0,
    angle: Math.random()*Math.PI*2,
    speed: 0.09 + Math.random()*0.07,
    lastShot: 0,
    lastHeal: 0,
    lastBuild: 0,
    mats: 80 + Math.floor(Math.random()*40),
    color: new THREE.Color().setHSL(Math.random(), 0.7, 0.45).getHex(),
    state: 'wander',
    name: nick + tag,
    inBus: true, skydive: false, height: 40
  };
}

function botFindTarget(bot) {
  let best = null, bestD = 38;
  // inni boty
  for (const other of bots) {
    if (other === bot || other.hp <= 0 || other.inBus || other.skydive) continue;
    const d = Math.hypot(other.x - bot.x, other.z - bot.z);
    if (d < bestD) { bestD = d; best = { kind: 'bot', ref: other, dist: d }; }
  }
  // gracz
  if (player && !gameOver && !player.knocked) {
    const d = Math.hypot(player.x - bot.x, player.z - bot.z);
    if (d < bestD) { bestD = d; best = { kind: 'player', ref: player, dist: d }; }
  }
  return best;
}

function botShootAt(bot, tx, tz) {
  const now = Date.now();
  if (now - bot.lastShot < 420 + Math.random() * 200) return;
  bot.lastShot = now;
  const d = Math.hypot(tx - bot.x, tz - bot.z) || 1;
  // lekki spread
  const spread = 0.12;
  const vx = (tx - bot.x) / d * 0.95 + (Math.random()-0.5)*spread;
  const vz = (tz - bot.z) / d * 0.95 + (Math.random()-0.5)*spread;
  const b = {
    x: bot.x, y: 1.4, z: bot.z,
    vx, vy: 0, vz,
    dmg: 11 + Math.floor(Math.random()*5),
    life: 55, fromPlayer: false, owner: bot
  };
  bullets.push(b);
  const bm = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xff5252 })
  );
  bm.position.set(b.x, b.y, b.z);
  scene.add(bm);
  bulletMeshes.push(bm);
}

function botTryHeal(bot) {
  const now = Date.now();
  if (bot.hp >= 75) return;
  if (now - bot.lastHeal < 4000) return;
  if (Math.random() > 0.02) return; // nie co klatkę
  bot.lastHeal = now;
  if (bot.hp < 40) {
    bot.hp = Math.min(100, bot.hp + 40); // apteczka-like
  } else {
    bot.hp = Math.min(100, bot.hp + 15); // bandaż
  }
  if (bot.shield < 50 && Math.random() < 0.4) {
    bot.shield = Math.min(100, bot.shield + 25);
  }
}

function botTryBuild(bot, threatDist) {
  const now = Date.now();
  if (bot.mats < 10) return;
  if (now - bot.lastBuild < 2800) return;
  // buduj gdy niski HP albo bliska walka
  if (bot.hp > 55 && threatDist > 14) return;
  if (Math.random() > 0.03) return;
  bot.lastBuild = now;
  bot.mats -= 10;
  const bx = bot.x + Math.sin(bot.angle) * 2.2;
  const bz = bot.z + Math.cos(bot.angle) * 2.2;
  const s = { x: bx, z: bz, type: 1, hp: 120, angle: bot.angle, edited: false, editVariant: 0 };
  structures.push(s);
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2.5, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.85 })
  );
  mesh.position.set(bx, 1.25, bz);
  mesh.rotation.y = bot.angle;
  scene.add(mesh);
  structureMeshes.push(mesh);
}


function spawnLoot(x, z, type, weaponId) {
  const l = { x, z, type, weaponId: weaponId || null };
  loots.push(l);
  let col = 0xffcc00;
  if (type === 'weapon') {
    const r = WEAPONS[weaponId]?.rarity;
    col = r === 'legendary' ? 0xffcc00 : r === 'epic' ? 0xb026ff : 0x4da6ff;
  } else if (type === 'minipot' || type === 'bigpot') col = 0x2979ff;
  else if (type === 'medkit' || type === 'bandages') col = 0x00c853;
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 10, 10),
    new THREE.MeshBasicMaterial({ color: col })
  );
  m.position.set(x, 0.5, z);
  scene.add(m);
  lootMeshes.push(m);
}

function jumpFromBus() {
  if (gamePhase !== 'bus' || !player || !player.inBus) return;
  player.inBus = false;
  player.skydive = true;
  player.height = 38;
  gamePhase = 'skydive';
  if (playerMesh) { playerMesh.visible = true; playerMesh.position.y = 0; }
}

function reload() {
  if (!player.weapon || !WEAPONS[player.weapon] || WEAPONS[player.weapon].melee) return;
  const w = WEAPONS[player.weapon];
  if (player.ammo < w.mag && player.reserve > 0) {
    const need = w.mag - player.ammo;
    const take = Math.min(need, player.reserve);
    player.ammo += take;
    player.reserve -= take;
    updateHUD();
  }
}

function equipWeapon(id) {
  const w = WEAPONS[id];
  if (!w) return;
  player.weapon = id;
  player.ammo = w.mag;
  player.reserve = w.reserve;
  if (weaponMesh && w) {
    const cols = { legendary: 0xffcc00, epic: 0xb026ff, rare: 0x4da6ff, default: 0x888888 };
    weaponMesh.material.color.setHex(cols[w.rarity] || 0x333333);
    weaponMesh.scale.set(1, 1, w.melee ? 0.7 : 1.2);
  }
  updateHUD();
}

function pickupLoot() {
  for (let i = loots.length - 1; i >= 0; i--) {
    const l = loots[i];
    const d = Math.hypot(l.x - player.x, l.z - player.z);
    if (d < 3) {
      if (l.type === 'weapon' && l.weaponId) equipWeapon(l.weaponId);
      else if (l.type === 'minipot') player.shield = Math.min(100, player.shield + 25);
      else if (l.type === 'bigpot') player.shield = Math.min(100, player.shield + 50);
      else if (l.type === 'medkit') player.hp = 100;
      else if (l.type === 'bandages') player.hp = Math.min(100, player.hp + 15);
      scene.remove(lootMeshes[i]);
      lootMeshes.splice(i, 1);
      loots.splice(i, 1);
      updateHUD();
      break;
    }
  }
}

function shoot() {
  if (gamePhase !== 'ground' || player.knocked || gameOver || player.emoting) return;
  if (!player.weapon || !WEAPONS[player.weapon]) return;
  const w = WEAPONS[player.weapon];
  const now = Date.now();
  if (now - player.lastShot < w.fireRate) return;
  if (!w.melee && player.ammo <= 0) return;
  player.lastShot = now;
  if (!w.melee) player.ammo--;
  if (typeof playShootSound === 'function') playShootSound();

  const dir = new THREE.Vector3(-Math.sin(yaw), -Math.sin(pitch)*0.5, -Math.cos(yaw)).normalize();
  const pellets = w.pellets || 1;
  for (let i = 0; i < pellets; i++) {
    const spread = w.spread || 0.02;
    const d = dir.clone();
    d.x += (Math.random()-0.5)*spread*2;
    d.y += (Math.random()-0.5)*spread;
    d.z += (Math.random()-0.5)*spread*2;
    d.normalize();
    const b = {
      x: player.x, y: player.height * 0.02 + 1.5, z: player.z,
      vx: d.x * (w.speed * 0.08),
      vy: d.y * (w.speed * 0.08),
      vz: d.z * (w.speed * 0.08),
      dmg: w.dmg, life: w.range * 0.4, fromPlayer: true
    };
    bullets.push(b);
    const bm = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffe082 })
    );
    bm.position.set(b.x, b.y, b.z);
    scene.add(bm);
    bulletMeshes.push(bm);
  }
  updateHUD();
}

function build() {
  if (gamePhase !== 'ground' || player.knocked) return;
  const cost = 10;
  if (player.mats.wood < cost) return;
  player.mats.wood -= cost;
  if (typeof playBuildSound === 'function') playBuildSound();
  const dist = 3;
  const bx = player.x - Math.sin(yaw) * dist;
  const bz = player.z - Math.cos(yaw) * dist;
  const s = { x: bx, z: bz, type: player.buildType, hp: 150, angle: yaw, edited: false, editVariant: 0 };
  structures.push(s);
  let mesh;
  if (s.type === 1) {
    mesh = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 0.3), new THREE.MeshLambertMaterial({ color: 0x8B5A2B }));
    mesh.position.set(bx, 1.25, bz);
    mesh.rotation.y = yaw;
  } else if (s.type === 2) {
    mesh = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 3), new THREE.MeshLambertMaterial({ color: 0x6B4226 }));
    mesh.position.set(bx, 0.1, bz);
  } else {
    mesh = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 3), new THREE.MeshLambertMaterial({ color: 0xA07040 }));
    mesh.position.set(bx, 0.8, bz);
    mesh.rotation.x = -0.5;
    mesh.rotation.y = yaw;
  }
  scene.add(mesh);
  structureMeshes.push(mesh);
  updateHUD();
}

function editNearestStructure() {
  let nearest = -1, nd = 5;
  structures.forEach((s, i) => {
    const d = Math.hypot(s.x - player.x, s.z - player.z);
    if (d < nd) { nd = d; nearest = i; }
  });
  if (nearest < 0) return;
  const s = structures[nearest];
  s.edited = true;
  s.editVariant = ((s.editVariant || 0) + 1) % 4;
  if (typeof playBuildSound === 'function') playBuildSound();
}

function addKillFeed(text) {
  const feed = document.getElementById('kill-feed');
  if (!feed) return;
  const el = document.createElement('div');
  el.textContent = text;
  feed.prepend(el);
  setTimeout(() => el.remove(), 3500);
}

function showHitMarker() {
  const el = document.getElementById('hit-marker');
  if (!el) return;
  el.classList.remove('hidden');
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
  setTimeout(() => el.classList.add('hidden'), 220);
}
function flashDamage() {
  const v = document.getElementById('damage-vignette');
  if (!v) return;
  v.classList.add('on');
  setTimeout(() => v.classList.remove('on'), 200);
}
function setPhaseHUD(text) {
  const el = document.getElementById('hud-phase');
  if (el) el.textContent = text;
}
function updateHUD() {
  if (!player) return;
  document.getElementById('hp-fill').style.width = Math.max(0, player.hp) + '%';
  document.getElementById('hp-text').textContent = Math.max(0, Math.floor(player.hp));
  document.getElementById('shield-fill').style.width = player.shield + '%';
  document.getElementById('shield-text').textContent = Math.floor(player.shield);
  document.getElementById('alive-count').textContent = aliveCount;
  document.getElementById('kill-count').textContent = killCount;
  if (!player.mats) player.mats = { wood: 150, stone: 100, metal: 50 };
  document.getElementById('mat-wood').textContent = player.mats.wood;
  document.getElementById('mat-stone').textContent = player.mats.stone;
  document.getElementById('mat-metal').textContent = player.mats.metal;
  const w = player.weapon && WEAPONS[player.weapon];
  document.getElementById('weapon-name').textContent = w ? w.name : 'Kilof';
  document.getElementById('weapon-ammo').textContent = (w && !w.melee) ? `${player.ammo} / ${player.reserve}` : '∞';
}

function die(reason) {
  if (!player.knocked) {
    player.knocked = true;
    player.knockTimer = 25;
    player.hp = 0;
    player.speed = player.baseSpeed * 0.2;
    addKillFeed('Powalony przez ' + reason);
    updateHUD();
    return;
  }
  fullyEliminate(reason);
}

function dropPlayerLoot(x, z) {
  if (player.weapon && player.weapon !== 'pickaxe' && WEAPONS[player.weapon]) {
    spawnLoot(x, z, 'weapon', player.weapon);
  }
  spawnLoot(x + 1, z, 'ammo');
}

function fullyEliminate(reason) {
  gameOver = true;
  dropPlayerLoot(player.x, player.z);
  player.rebootCard = { x: player.x, z: player.z, timer: 100, name: 'Gracz' };
  document.getElementById('death-reason').textContent = 'Zabił Cię: ' + reason;
  document.getElementById('final-kills').textContent = killCount;
  document.getElementById('death-screen').classList.remove('hidden');
  const info = document.getElementById('spectate-info');
  if (info) {
    info.style.display = 'block';
    info.textContent = 'Karta odrodzenia 100s — ODRODŹ przy busie restartu';
  }
}

function win() {
  gameOver = true;
  document.getElementById('win-kills').textContent = killCount;
  document.getElementById('win-screen').classList.remove('hidden');
  const user = getCurrentUser();
  if (user) {
    const accounts = getAccounts();
    const acc = accounts[user.email];
    if (acc) {
      acc.vnex = (acc.vnex || 0) + 50;
      saveAccounts(accounts);
      setCurrentUser(acc);
      document.getElementById('v-nex-count').textContent = acc.vnex;
    }
  }
}

function update() {
  if (!player || !scene) return;
  const dt = Math.min(clock.getDelta(), 0.05);

  // BUS
  if (gamePhase === 'bus') {
    bus.x += Math.cos(bus.angle) * bus.speed;
    bus.z += Math.sin(bus.angle) * bus.speed * 0.3;
    busMesh.position.set(bus.x, 35, bus.z);
    busMesh.rotation.y = -bus.angle;
    player.x = bus.x; player.z = bus.z; player.height = 35;
    bots.forEach(b => {
      if (b.inBus) {
        b.x = bus.x + (Math.random()-0.5)*2;
        b.z = bus.z + (Math.random()-0.5)*2;
        if (bus.x > -50 && Math.random() < 0.01) { b.inBus = false; b.skydive = true; b.height = 35; }
      }
    });
    if (bus.x > 120) {
      jumpFromBus();
      bots.forEach(b => { b.inBus = false; b.skydive = true; b.height = 30 + Math.random()*10; });
    }
    const zt = document.getElementById('zone-timer');
    if (zt) zt.textContent = 'SPACJA = SKOCZ Z BUSA';
    setPhaseHUD('BUS BOJOWY');
    updateCamera();
    return;
  }

  // SKYDIVE
  if (gamePhase === 'skydive') {
    player.height -= 0.35;
    let dx = 0, dz = 0;
    if (keys[keyBinds?.up || 'w'] || keys['arrowup']) { dx -= Math.sin(yaw); dz -= Math.cos(yaw); }
    if (keys[keyBinds?.down || 's'] || keys['arrowdown']) { dx += Math.sin(yaw); dz += Math.cos(yaw); }
    if (keys[keyBinds?.left || 'a'] || keys['arrowleft']) { dx -= Math.cos(yaw); dz += Math.sin(yaw); }
    if (keys[keyBinds?.right || 'd'] || keys['arrowright']) { dx += Math.cos(yaw); dz -= Math.sin(yaw); }
    if (dx || dz) {
      const len = Math.hypot(dx, dz);
      player.x += (dx/len) * 0.35;
      player.z += (dz/len) * 0.35;
    }
    bots.forEach(b => {
      if (b.skydive) {
        b.height -= 0.3;
        b.x += (Math.random()-0.5)*0.2;
        b.z += (Math.random()-0.5)*0.2;
        if (b.height <= 0) { b.skydive = false; b.height = 0; }
      }
    });
    if (player.height <= 0) {
      player.height = 0;
      player.skydive = false;
      gamePhase = 'ground';
      setPhaseHUD('WALKA');
      if (!player.mats) player.mats = { wood: 150, stone: 100, metal: 50 };
    }
    const zt = document.getElementById('zone-timer');
    if (zt) zt.textContent = 'Spadasz... WASD steruj';
    setPhaseHUD('SPADANIE');
    updateCamera();
    return;
  }

  if (gameOver) return;

  // emotka w meczu
  if (player.emoting) {
    player.emoteTimer -= dt;
    if (playerMesh) {
      playerMesh.rotation.y += 0.1;
      playerMesh.position.y = Math.abs(Math.sin(Date.now() / 120)) * 0.3;
      const sw = Math.sin(Date.now() / 80) * 0.8;
      if (playerMesh.userData.armL) playerMesh.userData.armL.rotation.x = sw;
      if (playerMesh.userData.armR) playerMesh.userData.armR.rotation.x = -sw;
    }
    if (player.emoteTimer <= 0) {
      player.emoting = false;
      if (playerMesh) {
        playerMesh.rotation.y = yaw;
        playerMesh.position.y = 0;
        if (playerMesh.userData.armL) playerMesh.userData.armL.rotation.x = 0;
        if (playerMesh.userData.armR) playerMesh.userData.armR.rotation.x = 0;
      }
    }
  }

  // knock
  if (player.knocked) {
    player.knockTimer -= dt;
    if (player.knockTimer <= 0) fullyEliminate('Wykrwawienie');
  }

  // movement
  let dx = 0, dz = 0;
  if (keys[keyBinds?.up || 'w'] || keys['arrowup']) { dx -= Math.sin(yaw); dz -= Math.cos(yaw); }
  if (keys[keyBinds?.down || 's'] || keys['arrowdown']) { dx += Math.sin(yaw); dz += Math.cos(yaw); }
  if (keys[keyBinds?.left || 'a'] || keys['arrowleft']) { dx -= Math.cos(yaw); dz += Math.sin(yaw); }
  if (keys[keyBinds?.right || 'd'] || keys['arrowright']) { dx += Math.cos(yaw); dz -= Math.sin(yaw); }
  player.sprinting = !!(keys['shift'] && !player.crouching && !player.knocked);
  const spd = player.speed * (player.sprinting ? 1.55 : 1);
  if (dx || dz) {
    const len = Math.hypot(dx, dz);
    player.x += (dx/len) * spd;
    player.z += (dz/len) * spd;
  }

  // jump
  if (player.jumping) {
    player.height += player.jumpVel;
    player.jumpVel -= 0.015;
    if (player.height <= 0) { player.height = 0; player.jumping = false; player.jumpVel = 0; }
  }

  // shoot
  if (mouse.down) shoot();

  // zone damage
  const distC = Math.hypot(player.x, player.z);
  if (distC > zoneRadius) {
    zoneDamageTimer++;
    if (zoneDamageTimer % 30 === 0) {
      if (player.shield > 0) player.shield = Math.max(0, player.shield - 4);
      else player.hp -= 4;
      updateHUD();
      if (player.hp <= 0) die('Strefa');
    }
  } else zoneDamageTimer = 0;

  // bots AI — walka gracz+boty, heal, budowanie
  bots.forEach((bot, idx) => {
    if (bot.hp <= 0) return;
    if (bot.skydive || bot.inBus) return;

    botTryHeal(bot);

    const target = botFindTarget(bot);
    if (target) {
      const tx = target.kind === 'player' ? target.ref.x : target.ref.x;
      const tz = target.kind === 'player' ? target.ref.z : target.ref.z;
      bot.angle = Math.atan2(tx - bot.x, tz - bot.z);
      const dist = target.dist;

      // strafe / dystans
      if (dist > 12) {
        bot.x += Math.sin(bot.angle) * bot.speed;
        bot.z += Math.cos(bot.angle) * bot.speed;
      } else if (dist < 6) {
        bot.x -= Math.sin(bot.angle) * bot.speed * 0.7;
        bot.z -= Math.cos(bot.angle) * bot.speed * 0.7;
      } else {
        // lekki straf
        bot.x += Math.cos(bot.angle) * bot.speed * 0.45 * (idx % 2 ? 1 : -1);
        bot.z -= Math.sin(bot.angle) * bot.speed * 0.45 * (idx % 2 ? 1 : -1);
      }

      if (dist < 32) botShootAt(bot, tx, tz);
      botTryBuild(bot, dist);
    } else {
      // błądzą / idą do strefy
      const dc = Math.hypot(bot.x, bot.z);
      if (dc > zoneRadius - 5) {
        bot.angle = Math.atan2(-bot.x, -bot.z);
        bot.x += Math.sin(bot.angle) * bot.speed;
        bot.z += Math.cos(bot.angle) * bot.speed;
      } else {
        bot.x += Math.sin(bot.angle) * bot.speed * 0.45;
        bot.z += Math.cos(bot.angle) * bot.speed * 0.45;
        if (Math.random() < 0.02) bot.angle += (Math.random() - 0.5) * 2;
      }
    }

    // obrażenia od strefy u botów
    if (Math.hypot(bot.x, bot.z) > zoneRadius) {
      bot.hp -= 0.08;
      if (bot.hp <= 0) {
        aliveCount = Math.max(1, aliveCount - 1);
        updateHUD();
      }
    }

    if (botMeshes[idx]) {
      botMeshes[idx].position.set(bot.x, 0, bot.z);
      botMeshes[idx].rotation.y = bot.angle;
      botMeshes[idx].visible = bot.hp > 0;
    }
  });

  // bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx; b.y += b.vy; b.z += b.vz;
    b.life--;
    if (bulletMeshes[i]) bulletMeshes[i].position.set(b.x, b.y, b.z);
    if (b.life <= 0 || b.y < 0) {
      scene.remove(bulletMeshes[i]);
      bulletMeshes.splice(i, 1);
      bullets.splice(i, 1);
      continue;
    }
    if (!b.fromPlayer) {
      const d = Math.hypot(b.x - player.x, b.z - player.z);
      if (d < 1.2 && Math.abs(b.y - 1.2) < 1.5) {
        if (player.knocked) { fullyEliminate(b.owner?.name || 'Bot'); }
        else {
          if (player.shield > 0) player.shield = Math.max(0, player.shield - b.dmg);
          else player.hp -= b.dmg;
          flashDamage();
          updateHUD();
          if (player.hp <= 0) die(b.owner?.name || 'Bot');
        }
        scene.remove(bulletMeshes[i]);
        bulletMeshes.splice(i, 1);
        bullets.splice(i, 1);
        continue;
      }
      // bot vs bot
      let hitBot = false;
      for (let j = 0; j < bots.length; j++) {
        const bot = bots[j];
        if (bot.hp <= 0 || bot === b.owner) continue;
        const bd = Math.hypot(b.x - bot.x, b.z - bot.z);
        if (bd < 1.3) {
          if (bot.shield > 0) bot.shield = Math.max(0, bot.shield - b.dmg);
          else bot.hp -= b.dmg;
          hitBot = true;
          if (bot.hp <= 0) {
            aliveCount = Math.max(1, aliveCount - 1);
            addKillFeed(`${b.owner?.name || 'Bot'} ➔ ${bot.name}`);
            spawnLoot(bot.x, bot.z, 'weapon', ['scar','mka','p90','pump'][Math.floor(Math.random()*4)]);
            updateHUD();
            if (aliveCount <= 1 && !gameOver) win();
          }
          break;
        }
      }
      if (hitBot) {
        scene.remove(bulletMeshes[i]);
        bulletMeshes.splice(i, 1);
        bullets.splice(i, 1);
        continue;
      }
    } else {
      for (let j = 0; j < bots.length; j++) {
        const bot = bots[j];
        if (bot.hp <= 0) continue;
        const d = Math.hypot(b.x - bot.x, b.z - bot.z);
        if (d < 1.3) {
          bot.hp -= b.dmg;
          showHitMarker();
          if (typeof playHitSound === 'function') playHitSound();
          scene.remove(bulletMeshes[i]);
          bulletMeshes.splice(i, 1);
          bullets.splice(i, 1);
          if (bot.hp <= 0) {
            killCount++;
            aliveCount--;
            addKillFeed(`Ty ➔ ${bot.name}`);
            spawnLoot(bot.x, bot.z, 'weapon', ['scar','mka','p90','pump'][Math.floor(Math.random()*4)]);
            updateHUD();
            if (aliveCount <= 1) win();
          }
          break;
        }
      }
    }
  }

  // player mesh
  playerMesh.position.set(player.x, player.height * 0.02, player.z);
  playerMesh.rotation.y = yaw;
  playerMesh.scale.y = player.crouching ? 0.7 : 1;

  // multiplayer sync out
  if (net.roomCode && player && Date.now() - net.lastSend > 80) {
    net.lastSend = Date.now();
    netBroadcast({
      t: 'state',
      id: net.myId,
      name: partyName(),
      skin: player.skin || partySkin(),
      x: player.x, z: player.z, yaw: yaw,
      hp: player.hp, shield: player.shield
    });
  }
  // update remote meshes from state
  if (net.roomCode) {
    Object.values(net.remoteState).forEach(st => ensureRemoteMesh(st));
  }

  updateCamera();
}

function updateCamera() {
  if (gamePhase === 'bus' && bus) {
    // Widok cinematic: bus + mapa pod spodem
    const bx = bus.x || 0, bz = bus.z || 0;
    camera.position.set(bx - 22, 55, bz + 20);
    camera.lookAt(bx + 8, 10, bz);
    if (playerMesh) playerMesh.visible = false;
    return;
  }
  if (playerMesh) playerMesh.visible = !(player && player.inBus);
  const dist = gamePhase === 'skydive' ? 10 : 5.5;
  const height = gamePhase === 'skydive' ? player.height * 0.08 + 3 : 2.4;
  const lookY = gamePhase === 'skydive' ? player.height * 0.05 + 1 : 1.5;
  const cx = player.x + Math.sin(yaw) * dist * Math.cos(pitch * 0.5);
  const cy = height + Math.sin(pitch) * 2.5 + (player.jumping ? player.height * 0.05 : 0);
  const cz = player.z + Math.cos(yaw) * dist * Math.cos(pitch * 0.5);
  camera.position.lerp(new THREE.Vector3(cx, cy, cz), 0.2);
  camera.lookAt(player.x, lookY, player.z);
}

function loop() {
  animId = requestAnimationFrame(loop);
  if (!gameScreen || !gameScreen.classList.contains('active')) return;
  try {
    if (typeof update === 'function') update();
  } catch (e) {
    console.warn('update error', e);
  }
  try {
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  } catch (e) {
    console.warn('render error', e);
  }
}

// patch returnToLobby to cleanup 3D
const _origReturn = typeof returnToLobby === 'function' ? returnToLobby : null;
function returnToLobby() {
  gameScreen.classList.remove('active');
  document.getElementById('death-screen').classList.add('hidden');
  document.getElementById('win-screen').classList.add('hidden');
  document.getElementById('spectate-info').style.display = 'none';
  lobby.classList.add('active');
  if (animId) cancelAnimationFrame(animId);
  if (document.exitPointerLock) document.exitPointerLock();
  playLobbyMusic();
}

// ========== LOGIN SYSTEM ==========
const loginScreen = document.getElementById('login-screen');
const lobbyEl = document.getElementById('lobby');

const LOBBY_SKIN_NAMES = {
  bambika: 'Bambika',
  cien_ulicy: 'Cień Ulicy',
  neonowa_furia: 'Neonowa Furia',
  krol_osiedla: 'Król Osiedla',
  ostatni_lowca: 'Ostatni Łowca',
  wiezien_seweryn: 'WIĘZIEŃ SEWERYN',
  shop_female: 'Raiderka Fortnex',
  shop_male: 'Trooper Fortnex'
};

let lobby3d = { renderer: null, scene: null, camera: null, char: null, anim: null, dancing: false, t: 0 };

function stopLobby3D() {
  if (lobby3d.anim) cancelAnimationFrame(lobby3d.anim);
  lobby3d.anim = null;
  if (lobby3d.renderer) {
    try {
      const r = lobby3d.renderer;
      if (lobby3d.scene) {
        lobby3d.scene.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose?.();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose?.());
            else obj.material.dispose?.();
          }
        });
      }
      r.dispose();
      if (r.forceContextLoss) r.forceContextLoss();
      const gl = r.getContext?.();
      if (gl) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
      if (r.domElement && r.domElement !== canvas) {
        // lobby canvas - clear
      }
    } catch (e) { console.warn('lobby dispose', e); }
  }
  lobby3d.renderer = null;
  lobby3d.scene = null;
  lobby3d.camera = null;
  lobby3d.char = null;
  document.getElementById('lobby-canvas')?.classList.remove('has-3d');
  document.querySelector('.lobby-3d-wrap')?.classList.remove('has-3d');
}

function initLobby3D(skinId) {
  const canvas = document.getElementById('lobby-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  // CSS skin zawsze zostaje jako fallback
  stopLobby3D();
  const w = canvas.clientWidth || 280;
  const h = canvas.clientHeight || 340;
  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 50);
  camera.position.set(0, 2.2, 5.5);
  camera.lookAt(0, 1.2, 0);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'default' });
  } catch (e) {
    console.warn('Lobby 3D niedostępne', e);
    return;
  }
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(4, 8, 5);
  sun.castShadow = true;
  scene.add(sun);

  // platforma
  const plat = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.5, 0.15, 48),
    new THREE.MeshStandardMaterial({ color: 0x00b4ff, metalness: 0.5, roughness: 0.3, emissive: 0x003355 })
  );
  plat.position.y = 0.05;
  plat.receiveShadow = true;
  scene.add(plat);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.45, 0.04, 8, 48),
    new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00a0ff, metalness: 0.8 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.14;
  scene.add(ring);

  const id = skinId && SKINS[skinId] ? skinId : 'bambika';
  const char = makeChar(id);
  char.position.y = 0.12;
  scene.add(char);

  lobby3d = { renderer, scene, camera, char, anim: null, dancing: false, t: 0 };
  canvas.classList.add('has-3d');
  document.querySelector('.lobby-3d-wrap')?.classList.add('has-3d');

  function loop() {
    lobby3d.anim = requestAnimationFrame(loop);
    lobby3d.t += 0.016;
    if (lobby3d.char) {
      if (lobby3d.dancing) {
        // emotka: ruch rąk / podskok, BEZ obracania postaci
        const swing = Math.sin(lobby3d.t * 10) * 0.7;
        if (lobby3d.char.userData.armL) lobby3d.char.userData.armL.rotation.x = swing;
        if (lobby3d.char.userData.armR) lobby3d.char.userData.armR.rotation.x = -swing;
        lobby3d.char.position.y = 0.12 + Math.abs(Math.sin(lobby3d.t * 8)) * 0.25;
      } else {
        // skin stoi nieruchomo — nie kręci się
        lobby3d.char.rotation.y = 0;
        if (lobby3d.char.userData.armL) lobby3d.char.userData.armL.rotation.x = 0;
        if (lobby3d.char.userData.armR) lobby3d.char.userData.armR.rotation.x = 0;
        lobby3d.char.position.y = 0.12;
      }
    }
    renderer.render(scene, camera);
  }
  loop();
}

function updateLobbySkin(skinId) {
  const id = skinId && LOBBY_SKIN_NAMES[skinId] ? skinId : 'bambika';
  const nameEl = document.getElementById('lobby-skin-name');
  if (nameEl) nameEl.textContent = LOBBY_SKIN_NAMES[id] || 'Bambika';
  const cssChar = document.getElementById('lobby-css-char');
  if (cssChar) cssChar.setAttribute('data-skin', id);
  // 3D lobby (opcjonalne — jak padnie, CSS i tak widać)
  if (document.getElementById('lobby')?.classList.contains('active')) {
    try { initLobby3D(id); } catch (e) { console.warn(e); }
  } else {
    lobby3d._pendingSkin = id;
  }
}

function showLobby(user) {
  loginScreen.classList.remove('active');
  lobbyEl.classList.add('active');
  document.getElementById('player-name-display').textContent = user.name || user.email.split('@')[0];
  document.getElementById('v-nex-count').textContent = user.vnex;
  setCurrentUser(user);
  updateLobbySkin(user.skin || 'bambika');
  setTimeout(() => initLobby3D(user.skin || 'bambika'), 50);
  setTimeout(() => refreshLockerUI(), 100);
}

// Auto-login if already logged in this session
(function checkSession() {
  const user = getCurrentUser();
  if (user) {
    // Odśwież dane z accounts
    const accounts = getAccounts();
    const fresh = accounts[user.email];
    if (fresh) {
      showLobby(fresh);
      return;
    }
  }
  // Pokaż login
  loginScreen.classList.add('active');
  lobbyEl.classList.remove('active');
})();

document.getElementById('login-btn').addEventListener('click', () => {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = 'Wpisz e-mail i hasło';
    return;
  }

  const accounts = getAccounts();
  const acc = accounts[email];

  if (!acc || acc.password !== password) {
    errorEl.textContent = 'Błędny e-mail lub hasło';
    return;
  }

  showLobby(acc);
  initAudio();
  playLobbyMusic();
});

document.getElementById('register-btn').addEventListener('click', () => {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = 'Wpisz e-mail i hasło aby utworzyć konto';
    return;
  }
  if (password.length < 4) {
    errorEl.textContent = 'Hasło musi mieć min. 4 znaki';
    return;
  }

  const accounts = getAccounts();
  if (accounts[email]) {
    errorEl.textContent = 'Konto z tym e-mailem już istnieje';
    return;
  }

  const newUser = {
    email,
    password,
    name: email.split('@')[0],
    vnex: 0,
    hasPass: false,
    ownedSkins: ['bambika'],
    isAdmin: false
  };
  accounts[email] = newUser;
  saveAccounts(accounts);
  showLobby(newUser);
  initAudio();
  playLobbyMusic();
});

// Enter key on login
document.getElementById('login-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('login-btn').click();
});

// ========== USTAWIENIA & BINDS ==========
const DEFAULT_BINDS = {
  up: 'w', down: 's', left: 'a', right: 'd',
  jump: ' ', crouch: 'c', reload: 'r', interact: 'e',
  build: 'f', edit: 'g', emote: 'b'
};

let keyBinds = { ...DEFAULT_BINDS };
let graphicsQuality = 'medium';
let graphicsShadows = true;
let graphicsParticles = true;

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('fortnex_settings') || '{}');
    if (s.binds) keyBinds = { ...DEFAULT_BINDS, ...s.binds };
    if (s.quality) graphicsQuality = s.quality;
    if (typeof s.shadows === 'boolean') graphicsShadows = s.shadows;
    if (typeof s.particles === 'boolean') graphicsParticles = s.particles;
  } catch(e) {}
  // UI
  const q = document.getElementById('setting-quality');
  const sh = document.getElementById('setting-shadows');
  const par = document.getElementById('setting-particles');
  if (q) q.value = graphicsQuality;
  if (sh) sh.checked = graphicsShadows;
  if (par) par.checked = graphicsParticles;
  // Bind buttons
  document.querySelectorAll('.bind-row').forEach(row => {
    const action = row.dataset.action;
    const btn = row.querySelector('.bind-btn');
    if (btn && keyBinds[action]) {
      btn.textContent = keyBinds[action] === ' ' ? 'SPACE' : keyBinds[action].toUpperCase();
    }
  });
}

function saveSettings() {
  localStorage.setItem('fortnex_settings', JSON.stringify({
    binds: keyBinds,
    quality: graphicsQuality,
    shadows: graphicsShadows,
    particles: graphicsParticles
  }));
}

loadSettings();

// Quality change
document.getElementById('setting-quality')?.addEventListener('change', (e) => {
  graphicsQuality = e.target.value;
  saveSettings();
});
document.getElementById('setting-shadows')?.addEventListener('change', (e) => {
  graphicsShadows = e.target.checked;
  saveSettings();
});
document.getElementById('setting-particles')?.addEventListener('change', (e) => {
  graphicsParticles = e.target.checked;
  saveSettings();
});

// Rebinding
let listeningAction = null;
document.querySelectorAll('.bind-row').forEach(row => {
  const btn = row.querySelector('.bind-btn');
  btn.addEventListener('click', () => {
    document.querySelectorAll('.bind-btn').forEach(b => b.classList.remove('listening'));
    listeningAction = row.dataset.action;
    btn.classList.add('listening');
    btn.textContent = '...';
  });
});

window.addEventListener('keydown', (e) => {
  if (!listeningAction) return;
  e.preventDefault();
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
  const display = key === ' ' ? 'SPACE' : key.toUpperCase();
  keyBinds[listeningAction] = key === 'spacebar' ? ' ' : key;
  const row = document.querySelector(`.bind-row[data-action="${listeningAction}"]`);
  if (row) {
    const btn = row.querySelector('.bind-btn');
    btn.textContent = display;
    btn.classList.remove('listening');
  }
  listeningAction = null;
  saveSettings();
}, true);

document.getElementById('reset-binds')?.addEventListener('click', () => {
  keyBinds = { ...DEFAULT_BINDS };
  saveSettings();
  loadSettings();
});

// Override movement keys to use binds (hook into existing keys object via aliases)
const origKeydown = window.onkeydown;
