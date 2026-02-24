// ===== DATA =====
const ME = { id: 'ai', name: 'Алексей Иванов', short: 'АИ', color: '#0033A0', role: 'student' };

const chats = [
  {
    id: 'group-k3241',
    type: 'group',
    name: 'K3241 — Алгоритмы',
    icon: '📖',
    color: '#0033A0',
    sub: '12 участников',
    unread: 3,
    pinned: 'Контрольная №2 перенесена на 28 февраля. Место — ауд. 305.',
    members: [
      { id: 'sd', name: 'Смирнов Д.В.', short: 'СД', color: '#E4002B', role: 'teacher', online: true },
      { id: 'ai', name: 'Алексей Иванов', short: 'АИ', color: '#0033A0', role: 'student', online: true },
      { id: 'mp', name: 'Мария Петрова', short: 'МП', color: '#7C3AED', role: 'student', online: true },
      { id: 'dk', name: 'Дмитрий Козлов', short: 'ДК', color: '#0A6B3A', role: 'student', online: false },
      { id: 'as', name: 'Анна Сидорова', short: 'АС', color: '#B94A00', role: 'student', online: false },
      { id: 'if', name: 'Игорь Фёдоров', short: 'ИФ', color: '#BE185D', role: 'student', online: true },
    ],
    messages: [
      { id: 1, from: 'sd', text: 'Коллеги, напоминаю — контрольная работа перенесена на 28 февраля. Аудитория 305, время 10:00.', time: '09:15', date: 'Вчера', pinned: true },
      { id: 2, from: 'mp', text: 'Дмитрий Вячеславович, а разрешите шпаргалки?', time: '09:23', date: 'Вчера' },
      { id: 3, from: 'sd', text: 'Только конспект на одном листе А4 😄', time: '09:31', date: 'Вчера', replyTo: 2 },
      { id: 4, from: 'dk', text: 'Где методичка по теме 7? Не могу найти в материалах', time: '11:04', date: 'Вчера' },
      { id: 5, from: 'sd', text: 'Загрузил вчера в раздел «Материалы» — папка «Лекции», тема 7–9.', time: '11:22', date: 'Вчера', replyTo: 4 },
      { id: 6, from: 'ai', text: 'Спасибо! Нашёл', time: '11:25', date: 'Вчера' },
      { id: 7, from: 'as', text: 'Кто идёт на консультацию 25 февраля? Можем вместе разобрать лаб. 3', time: '14:40', date: 'Вчера', reactions: [{ emoji: '✋', count: 3 }] },
      { id: 8, from: 'ai', text: 'Я иду! Записался', time: '14:55', date: 'Вчера' },
      { id: 9, from: 'if', text: 'Тоже иду', time: '15:02', date: 'Вчера' },
      { id: 10, from: 'sd', text: 'Отлично, до встречи 25-го. Подготовьте вопросы по тем местам, где были ошибки в лаб. 2.', time: '15:15', date: 'Вчера' },
      { id: 11, from: 'mp', text: 'Все файлы по лаб. 3 у кого есть? Можете скинуть тесты?', time: '09:10', date: 'Сегодня' },
      { id: 12, from: 'ai', text: 'Скину в личку', time: '09:18', date: 'Сегодня', replyTo: 11 },
      { id: 13, from: 'sd', text: '📢 Напоминание: лаб. 3 дедлайн 28 февраля. После этой даты не принимается.', time: '10:00', date: 'Сегодня', system: true },
    ]
  },
  {
    id: 'group-k3241-math',
    type: 'group',
    name: 'K3241 — Матанализ',
    icon: '📐',
    color: '#0A6B3A',
    sub: '12 участников',
    unread: 0,
    pinned: null,
    members: [
      { id: 'pe', name: 'Петрова Е.А.', short: 'ПЕ', color: '#0A6B3A', role: 'teacher', online: false },
      { id: 'ai', name: 'Алексей Иванов', short: 'АИ', color: '#0033A0', role: 'student', online: true },
    ],
    messages: [
      { id: 1, from: 'pe', text: 'Добрый день! Следующее занятие переносится в ауд. 201.', time: '14:00', date: 'Вчера' },
      { id: 2, from: 'ai', text: 'Понял, спасибо!', time: '14:05', date: 'Вчера' },
    ]
  },
  {
    id: 'dm-sd',
    type: 'dm',
    name: 'Смирнов Д.В.',
    short: 'СД',
    color: '#E4002B',
    role: 'teacher',
    sub: 'Преподаватель · онлайн',
    online: true,
    unread: 1,
    pinned: null,
    members: [
      { id: 'sd', name: 'Смирнов Д.В.', short: 'СД', color: '#E4002B', role: 'teacher', online: true },
      { id: 'ai', name: 'Алексей Иванов', short: 'АИ', color: '#0033A0', role: 'student', online: true },
    ],
    messages: [
      { id: 1, from: 'ai', text: 'Дмитрий Вячеславович, добрый день! Можно уточнить — лабораторную №3 можно сдать на консультации 25-го?', time: '16:30', date: 'Вчера' },
      { id: 2, from: 'sd', text: 'Да, приходите. Только подготовьтесь к вопросам по алгоритму Дейкстры 😊', time: '16:45', date: 'Вчера' },
      { id: 3, from: 'ai', text: 'Отлично, спасибо! Буду готов.', time: '16:47', date: 'Вчера' },
      { id: 4, from: 'sd', text: 'Кстати, посмотрел вашу лаб. 2 — хорошая работа, но в функции обхода BFS есть небольшая неточность с очередью. Разберём на консультации.', time: '09:05', date: 'Сегодня' },
    ]
  },
  {
    id: 'dm-mp',
    type: 'dm',
    name: 'Мария Петрова',
    short: 'МП',
    color: '#7C3AED',
    role: 'student',
    sub: 'Студент K3241 · онлайн',
    online: true,
    unread: 0,
    pinned: null,
    members: [
      { id: 'mp', name: 'Мария Петрова', short: 'МП', color: '#7C3AED', role: 'student', online: true },
      { id: 'ai', name: 'Алексей Иванов', short: 'АИ', color: '#0033A0', role: 'student', online: true },
    ],
    messages: [
      { id: 1, from: 'mp', text: 'Лёш, скинь тесты для лаб. 3 пожалуйста 🙏', time: '09:18', date: 'Сегодня' },
      { id: 2, from: 'ai', text: 'Да, щас найду и скину', time: '09:20', date: 'Сегодня' },
    ]
  },
];

let currentChat = chats[0];
let replyTarget = null;
let membersOpen = false;

// ===== RENDER CHAT LIST =====
function renderChatList(filter = '') {
  const body = document.getElementById('chat-list-body');
  const groups = chats.filter(c => c.type === 'group' && c.name.toLowerCase().includes(filter.toLowerCase()));
  const dms    = chats.filter(c => c.type === 'dm'    && c.name.toLowerCase().includes(filter.toLowerCase()));

  let html = '';

  if (groups.length) {
    html += `<div class="cls-section-label">Групповые чаты</div>`;
    html += groups.map(c => chatItemHtml(c)).join('');
  }
  if (dms.length) {
    html += `<div class="cls-section-label">Личные сообщения</div>`;
    html += dms.map(c => chatItemHtml(c)).join('');
  }

  body.innerHTML = html;
}

function chatItemHtml(c) {
  const lastMsg = c.messages[c.messages.length - 1];
  const preview = lastMsg ? getPreviewText(lastMsg, c) : 'Нет сообщений';
  const isActive = currentChat.id === c.id;
  const isUnread = c.unread > 0;

  if (c.type === 'group') {
    return `
      <div class="chat-item ${isActive ? 'active' : ''}" onclick="openChat('${c.id}')">
        <div class="ci-ava" style="background:${c.color};font-size:18px">${c.icon}</div>
        <div class="ci-info">
          <div class="ci-name">${c.name}</div>
          <div class="ci-preview ${isUnread ? 'unread' : ''}">${preview}</div>
        </div>
        <div class="ci-meta">
          <div class="ci-time">${lastMsg ? lastMsg.time : ''}</div>
          ${isUnread ? `<div class="ci-badge">${c.unread}</div>` : ''}
        </div>
      </div>`;
  } else {
    return `
      <div class="chat-item ${isActive ? 'active' : ''}" onclick="openChat('${c.id}')">
        <div class="ci-ava dm" style="background:${c.color}">
          ${c.short}
          ${c.online ? '<div class="online-dot"></div>' : ''}
        </div>
        <div class="ci-info">
          <div class="ci-name">${c.name}</div>
          <div class="ci-preview ${isUnread ? 'unread' : ''}">${preview}</div>
        </div>
        <div class="ci-meta">
          <div class="ci-time">${lastMsg ? lastMsg.time : ''}</div>
          ${isUnread ? `<div class="ci-badge red">${c.unread}</div>` : ''}
        </div>
      </div>`;
  }
}

function getPreviewText(msg, chat) {
  const sender = msg.from === ME.id ? 'Вы' : getMember(msg.from, chat)?.name.split(' ')[0] || '';
  const text = msg.system ? '📢 ' + msg.text : msg.text;
  return sender ? `${sender}: ${text}` : text;
}

function getMember(id, chat) {
  return (chat || currentChat).members.find(m => m.id === id);
}

// ===== RENDER CHAT HEADER =====
function renderHeader() {
  const c = currentChat;
  const hdr = document.getElementById('chat-header');

  let avaHtml = '';
  if (c.type === 'group') {
    avaHtml = `<div class="ch-ava" style="background:${c.color};font-size:16px">${c.icon}</div>`;
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
      <button class="ch-btn" title="Поиск">🔍</button>
      ${c.type === 'group' ? `<button class="ch-btn" title="Участники" onclick="toggleMembers()">👥</button>` : ''}
      <button class="ch-btn" title="Ещё">⋯</button>
    </div>`;

  // pinned
  const pinBar = document.getElementById('pinned-bar');
  if (c.pinned) {
    pinBar.style.display = 'flex';
    pinBar.innerHTML = `
      <span class="pin-label">📌 Закреплено</span>
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
    const isOut = msg.from === ME.id;
    const member = getMember(msg.from, currentChat);
    const isContinuation = lastFrom === msg.from && lastDate === msg.date && !msg.system;
    lastDate = msg.date;
    lastFrom = msg.from;

    // date divider
    if (i === 0 || msgs[i-1].date !== msg.date) {
      html += `<div class="date-divider"><span>${msg.date}</span></div>`;
      lastFrom = null;
    }

    if (msg.system) {
      html += `
        <div class="msg-row" style="justify-content:center;margin:8px 0">
          <div class="msg-bubble system">📢 ${msg.text}</div>
        </div>`;
      lastFrom = null;
      return;
    }

    const avatarBg = member ? member.color : '#64748B';
    const avatarShort = member ? member.short : '??';
    const isTeacher = member && member.role === 'teacher';

    // reply
    let replyHtml = '';
    if (msg.replyTo) {
      const orig = msgs.find(m => m.id === msg.replyTo);
      if (orig) {
        const origMember = getMember(orig.from, currentChat);
        replyHtml = `<div class="reply-to"><b>${origMember ? origMember.name.split(' ')[0] : 'Вы'}</b>: ${orig.text.slice(0,60)}${orig.text.length > 60 ? '…' : ''}</div>`;
      }
    }

    // reactions
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
          <div class="msg-time">${msg.time}</div>
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
  currentChat = chats.find(c => c.id === id);
  currentChat.unread = 0;
  cancelReply();
  renderChatList();
  renderHeader();
  renderMessages();
  renderMembers();
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

function sendMessage() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text) return;

  const newMsg = {
    id: currentChat.messages.length + 1,
    from: ME.id,
    text,
    time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
    date: 'Сегодня',
  };
  if (replyTarget) newMsg.replyTo = replyTarget;

  currentChat.messages.push(newMsg);
  input.value = '';
  input.style.height = 'auto';
  cancelReply();
  renderMessages();
  renderChatList();
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

// ===== INIT =====
renderChatList();
renderHeader();
renderMessages();