// ===== DATA =====

const API_BASE_URL = 'http://localhost:8080';

let currentUser = null;

// Общий чат для всех студентов и преподавателей
let generalChat = {
  id: 'general',
  type: 'group',
  name: 'Общий чат',
  icon: '',
  color: '#0033A0',
  sub: 'Студенты и преподаватели',
  unread: 0,
  pinned: null,
  members: [],
  messages: []
};

let currentChat = generalChat;
let replyTarget = null;
let membersOpen = false;
let pollInterval = null;
let lastMessageId = null;

// ===== API CALLS =====

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('jwt_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return null;
}

// ===== LOAD CURRENT USER =====

async function loadCurrentUser() {
  try {
    const user = await apiCall('/api/users/me');
    currentUser = {
      id: user.id,
      name: user.name,
      short: user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      color: '#0033A0',
      role: user.role.toLowerCase()
    };
    
    // Обновляем отображение в sidebar
    document.getElementById('ava-name').textContent = user.name;
    document.getElementById('ava-initials').textContent = currentUser.short;
  } catch (e) {
    console.error('Failed to load current user:', e);
    currentUser = {
      id: 1,
      name: 'Гость',
      short: 'Г',
      color: '#0033A0',
      role: 'student'
    };
  }
}

// ===== CHAT MEMBERS =====

async function loadChatMembers() {
  try {
    const users = await apiCall('/api/users/all');
    generalChat.members = users.map(u => ({
      id: u.id,
      name: u.name,
      short: u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      color: u.role === 'TEACHER' ? '#E4002B' : '#0033A0',
      role: u.role.toLowerCase(),
      online: true
    }));
  } catch (e) {
    console.error('Failed to load chat members:', e);
  }
}

// ===== MESSAGES =====

async function loadMessages() {
  try {
    const messages = await apiCall('/api/chat/messages?limit=100');
    generalChat.messages = messages.map(m => ({
      id: m.id,
      from: String(m.senderId),
      fromName: m.senderName,
      fromRole: m.senderRole || 'student',
      text: m.text,
      time: formatTime(m.createdAt),
      date: formatDate(m.createdAt),
      edited: m.edited
    }));

    if (generalChat.messages.length > 0) {
      lastMessageId = generalChat.messages[generalChat.messages.length - 1].id;
    }

    if (currentChat.id === 'general') {
      renderMessages();
    }
    renderChatList();
  } catch (e) {
    console.error('Failed to load messages:', e);
  }
}

async function sendMessage() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text) return;

  try {
    await apiCall('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ text })
    });

    input.value = '';
    input.style.height = 'auto';
    cancelReply();

    await loadMessages();
  } catch (e) {
    console.error('Failed to send message:', e);
    alert('Не удалось отправить сообщение');
  }
}

function startPolling() {
  pollInterval = setInterval(async () => {
    try {
      const messages = await apiCall('/api/chat/messages?limit=10');
      if (messages.length > 0) {
        const newLastId = messages[messages.length - 1].id;
        if (newLastId !== lastMessageId) {
          await loadMessages();
        }
      }
    } catch (e) {
      console.error('Polling error:', e);
    }
  }, 3000);
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

// ===== FORMAT HELPERS =====

function formatTime(dateTimeStr) {
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateTimeStr) {
  const date = new Date(dateTimeStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return date.toLocaleDateString('ru', { weekday: 'long' });
  return date.toLocaleDateString('ru', { day: 'numeric', month: 'long' });
}

// ===== RENDER CHAT LIST =====

function renderChatList(filter = '') {
  const body = document.getElementById('chat-list-body');
  const chats = [generalChat].filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));

  let html = '';

  if (chats.length) {
    html += `<div class="cls-section-label">Чаты</div>`;
    html += chats.map(c => chatItemHtml(c)).join('');
  }

  body.innerHTML = html;
}

function chatItemHtml(c) {
  const lastMsg = c.messages[c.messages.length - 1];
  const preview = lastMsg ? getPreviewText(lastMsg, c) : 'Нет сообщений';
  const isActive = currentChat.id === c.id;
  const isUnread = c.unread > 0;

  return `
    <div class="chat-item ${isActive ? 'active' : ''}" onclick="openChat('${c.id}')">
      <div class="ci-ava" style="background:${c.color};font-size:18px">${c.icon || '💬'}</div>
      <div class="ci-info">
        <div class="ci-name">${c.name}</div>
        <div class="ci-preview ${isUnread ? 'unread' : ''}">${preview}</div>
      </div>
      <div class="ci-meta">
        <div class="ci-time">${lastMsg ? lastMsg.time : ''}</div>
        ${isUnread ? `<div class="ci-badge">${c.unread}</div>` : ''}
      </div>
    </div>`;
}

function getPreviewText(msg, chat) {
  const sender = msg.from === String(currentUser?.id) ? 'Вы' : getMember(msg.from, chat)?.name.split(' ')[0] || '';
  const text = msg.text;
  return sender ? `${sender}: ${text}` : text;
}

function getMember(id, chat) {
  return (chat || currentChat).members.find(m => String(m.id) === String(id));
}

// ===== RENDER CHAT HEADER =====

function renderHeader() {
  const c = currentChat;
  const hdr = document.getElementById('chat-header');

  let avaHtml = '';
  if (c.type === 'group') {
    avaHtml = `<div class="ch-ava" style="background:${c.color};font-size:16px">${c.icon || '💬'}</div>`;
  } else {
    avaHtml = `<div class="ch-ava dm" style="background:${c.color}">${c.short}</div>`;
  }

  hdr.innerHTML = `
    <div class="ch-left">
      ${avaHtml}
      <div>
        <div class="ch-name">${c.name}</div>
        <div class="ch-sub">${c.sub}</div>
      </div>
    </div>
    <div class="ch-actions">
      <button class="ch-btn" title="Поиск"></button>
      ${c.type === 'group' ? `<button class="ch-btn" title="Участники" onclick="toggleMembers()"></button>` : ''}
      <button class="ch-btn" title="Ещё"></button>
    </div>`;

  const pinBar = document.getElementById('pinned-bar');
  if (c.pinned) {
    pinBar.style.display = 'flex';
    pinBar.innerHTML = `
      <span class="pin-label">Закреплено</span>
      <span class="pin-text">${c.pinned}</span>`;
  } else {
    pinBar.style.display = 'none';
  }
}

// ===== RENDER MESSAGES =====

function renderMessages() {
  const container = document.getElementById('messages');
  const msgs = currentChat.messages;
  let html = '';
  let lastDate = null;
  let lastFrom = null;

  msgs.forEach((msg, i) => {
    const isOut = String(msg.from) === String(currentUser?.id);
    const member = getMember(msg.from, currentChat);
    const isContinuation = lastFrom === msg.from && lastDate === msg.date && !msg.system;
    lastDate = msg.date;
    lastFrom = msg.from;

    if (i === 0 || msgs[i-1].date !== msg.date) {
      html += `<div class="date-divider"><span>${msg.date}</span></div>`;
      lastFrom = null;
    }

    if (msg.system) {
      html += `
        <div class="msg-row" style="justify-content:center;margin:8px 0">
          <div class="msg-bubble system">${msg.text}</div>
        </div>`;
      lastFrom = null;
      return;
    }

    // Используем данные из сообщения или из списка участников
    const senderName = msg.fromName || (member ? member.name : 'Неизвестен');
    const senderRole = (msg.fromRole || (member ? member.role : 'student')).toLowerCase();
    const avatarBg = member ? member.color : '#0033A0';
    const avatarShort = member ? member.short : senderName.substring(0, 2).toUpperCase();
    const isTeacher = senderRole === 'teacher';

    let replyHtml = '';
    if (msg.replyTo) {
      const orig = msgs.find(m => m.id === msg.replyTo);
      if (orig) {
        const origName = orig.fromName || (member ? member.name.split(' ')[0] : 'Вы');
        replyHtml = `<div class="reply-to"><b>${origName}</b>: ${orig.text.slice(0,60)}${orig.text.length > 60 ? '…' : ''}</div>`;
      }
    }

    let reactHtml = '';
    if (msg.reactions) {
      reactHtml = msg.reactions.map(r =>
        `<div class="msg-reaction">${r.emoji} <span>${r.count}</span></div>`
      ).join('');
    }

    const nameHtml = !isContinuation
      ? `<div class="msg-sender ${isTeacher ? 'teacher' : ''}">${senderName}</div>`
      : '';

    html += `
      <div class="msg-row ${isOut ? 'out' : 'in'} ${isContinuation ? 'continuation' : ''}">
        ${!isOut ? `<div class="msg-ava" style="background:${avatarBg}">${isContinuation ? '' : avatarShort}</div>` : ''}
        <div class="msg-content">
          ${nameHtml}
          <div class="msg-bubble ${isOut ? 'out' : isTeacher ? 'in teacher' : 'in'}"
               ondblclick="setReply(${msg.id})">
            ${replyHtml}
            ${msg.text}
          </div>
          ${reactHtml}
          <div class="msg-time">${msg.time}${msg.edited ? ' (ред.)' : ''}</div>
        </div>
      </div>`;
  });

  container.innerHTML = html;
  container.scrollTop = container.scrollHeight;
}

// ===== RENDER MEMBERS =====

function renderMembers() {
  const teachers = currentChat.members.filter(m => m.role === 'teacher');
  const students = currentChat.members.filter(m => m.role === 'student');

  let html = '';
  if (teachers.length) {
    html += `<div class="mp-section">Преподаватели</div>`;
    html += teachers.map(m => memberHtml(m)).join('');
  }
  if (students.length) {
    html += `<div class="mp-section">Студенты</div>`;
    html += students.map(m => memberHtml(m)).join('');
  }

  document.getElementById('members-list').innerHTML = html;
}

function memberHtml(m) {
  return `
    <div class="mp-member">
      <div class="mp-ava" style="background:${m.color}">
        ${m.short}
        <div class="mp-online" style="background:${m.online ? '#22C55E' : '#94A3B8'}"></div>
      </div>
      <div>
        <div class="mp-name">${m.name}</div>
        <div class="mp-role">${m.role === 'teacher' ? 'Преподаватель' : 'Студент'}</div>
      </div>
    </div>`;
}

// ===== ACTIONS =====

function openChat(id) {
  currentChat = generalChat;
  currentChat.unread = 0;
  cancelReply();
  renderChatList();
  renderHeader();
  renderMessages();
  if (membersOpen && currentChat.type !== 'group') toggleMembers(false);
}

function filterChats(val) {
  renderChatList(val);
}

function toggleMembers(forceClose) {
  if (forceClose === false || membersOpen) {
    membersOpen = false;
  } else {
    membersOpen = true;
    renderMembers();
  }
  document.getElementById('members-panel').classList.toggle('open', membersOpen);
}

function setReply(msgId) {
  const msg = currentChat.messages.find(m => m.id === msgId);
  if (!msg) return;
  replyTarget = msgId;
  const member = getMember(msg.from, currentChat);
  document.getElementById('reply-text').textContent = `↩ ${member ? member.name.split(' ')[0] : 'Вы'}: ${msg.text.slice(0, 60)}`;
  document.getElementById('reply-preview').classList.add('visible');
  document.getElementById('msg-input').focus();
}

function cancelReply() {
  replyTarget = null;
  document.getElementById('reply-preview').classList.remove('visible');
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function logout() {
  stopPolling();
  localStorage.removeItem('jwt_token');
  window.location.href = 'login.html';
}

// ===== INIT =====

async function init() {
  await loadCurrentUser();
  await loadChatMembers();
  await loadMessages();
  renderChatList();
  renderHeader();
  renderMessages();
  startPolling();
}

init();

window.addEventListener('beforeunload', stopPolling);
