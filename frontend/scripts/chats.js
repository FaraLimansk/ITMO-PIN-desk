// ===== DATA =====

const API_BASE_URL = 'http://localhost:8080/api';

let currentUser = {
  id: 1,
  name: 'Гость',
  short: 'Г',
  color: '#0033A0',
  role: 'student'
};

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
let pollInterval = null;
let lastMessageId = null;

// ===== API CALLS =====

async function apiCall(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
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

// ===== MESSAGES =====

async function loadMessages() {
  try {
    const messages = await apiCall('/chat/messages?limit=100');
    generalChat.messages = messages.map(m => ({
      id: m.id,
      from: String(m.senderId),
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
    await apiCall('/chat/messages', {
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
      const messages = await apiCall('/chat/messages?limit=10');
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

function renderChatList() {
  const body = document.getElementById('chat-list-body');
  const chats = [generalChat];

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
  const sender = '';
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

    const avatarBg = member ? member.color : '#64748B';
    const avatarShort = member ? member.short : '??';
    const isTeacher = member && member.role === 'teacher';

    let replyHtml = '';
    if (msg.replyTo) {
      const orig = msgs.find(m => m.id === msg.replyTo);
      if (orig) {
        const origMember = getMember(orig.from, currentChat);
        replyHtml = `<div class="reply-to"><b>${origMember ? origMember.name.split(' ')[0] : 'Вы'}</b>: ${orig.text.slice(0,60)}${orig.text.length > 60 ? '…' : ''}</div>`;
      }
    }

    let reactHtml = '';
    if (msg.reactions) {
      reactHtml = msg.reactions.map(r =>
        `<div class="msg-reaction">${r.emoji} <span>${r.count}</span></div>`
      ).join('');
    }

    const nameHtml = !isOut && !isContinuation
      ? `<div class="msg-sender ${isTeacher ? 'teacher' : ''}">${member ? member.name : 'Неизвестен'}</div>`
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
          <div class="msg-meta">
            <div class="msg-time">${msg.time}${msg.edited ? ' (ред.)' : ''}</div>
            ${isOut ? `<button class="msg-delete" onclick="deleteMessage(${msg.id})" title="Удалить">×</button>` : ''}
          </div>
        </div>
      </div>`;
  });

  container.innerHTML = html;
  container.scrollTop = container.scrollHeight;
}

// ===== ACTIONS =====

function openChat(id) {
  currentChat = generalChat;
  currentChat.unread = 0;
  cancelReply();
  renderChatList();
  renderHeader();
  renderMessages();
}

function filterChats() {
  renderChatList();
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

async function deleteMessage(msgId) {
  if (!confirm('Удалить сообщение?')) return;

  try {
    await apiCall(`/chat/messages/${msgId}`, {
      method: 'DELETE'
    });
    await loadMessages();
  } catch (e) {
    console.error('Failed to delete message:', e);
    alert('Не удалось удалить сообщение');
  }
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

function loadUserInfo() {
  const token = localStorage.getItem('jwt_token');
  if (!token) return;
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(token.split('.')[1]))));
    const name = payload.name || payload.email?.split('@')[0] || 'Пользователь';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('ava-name').textContent = name;
    document.getElementById('ava-initials').textContent = initials;
  } catch (e) {
    console.error('Failed to load user info:', e);
  }
}

function logout() {
  stopPolling();
  localStorage.removeItem('jwt_token');
  window.location.href = 'login.html';
}

// ===== INIT =====

async function init() {
  loadUserInfo();
  await loadMessages();
  renderChatList();
  renderHeader();
  renderMessages();
  startPolling();
}

init();

window.addEventListener('beforeunload', stopPolling);
