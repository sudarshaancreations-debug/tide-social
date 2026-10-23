const {
  supportedPlatforms,
  validateAccount,
  createPost,
  validateMedia,
  rewriteCopy,
  generateConcepts
} = window.SocialCore;

const seedAccounts = [
  { platform: 'Instagram', handle: '@acmestudio', audience: '42.8K followers', cls: 'ig', status: 'Healthy', tokenExpires: '60 days' },
  { platform: 'LinkedIn', handle: 'ACME Studio', audience: '18.2K followers', cls: 'li', status: 'Healthy', tokenExpires: '90 days' },
  { platform: 'TikTok', handle: '@acme.studio', audience: '31.4K followers', cls: 'tk', status: 'Healthy', tokenExpires: '45 days' },
  { platform: 'Facebook', handle: 'ACME Studio', audience: '12.7K followers', cls: 'fb', status: 'Healthy', tokenExpires: '120 days' }
];

const seedPosts = [
  { id: 1, time: '09:30', date: '2026-10-23', title: 'The 10-minute content system', meta: 'Instagram · Reel', cls: 'ig', copy: 'The 10-minute content system that gave us our Fridays back.' },
  { id: 2, time: '12:00', date: '2026-10-24', title: 'What 183 posts taught us', meta: 'LinkedIn · Carousel', cls: 'li', copy: 'What 183 posts taught us about consistency vs quality.' },
  { id: 3, time: '16:45', date: '2026-10-25', title: 'A week behind the scenes', meta: 'TikTok · Video', cls: 'tk', copy: 'Behind our weekly planning ritual at ACME.' }
];

const seedApprovals = [
  { id: 'appr-1', kicker: 'YOUR BRAND DOESN’T NEED MORE CONTENT.', type: 'Instagram reel', title: 'What your content is really missing', platform: 'Instagram', cls: 'ig', mark: 'IG', revision: null },
  { id: 'appr-2', kicker: '5 HOOKS THAT STOP THE SCROLL', type: 'LinkedIn carousel', title: 'Five hooks that earn attention', platform: 'LinkedIn', cls: 'li', mark: 'in', revision: null },
  { id: 'appr-3', kicker: 'THE 10-MINUTE CONTENT SYSTEM', type: 'TikTok video', title: 'A calmer way to stay consistent', platform: 'TikTok', cls: 'tk', mark: '♪', revision: null }
];

const seedThreads = [
  { id: 'th-1', initials: 'JM', name: '@julesmakes', message: 'Can you send me the template?', platform: 'Instagram', time: '2m', tone: 'coral', intent: 'Lead', reply: 'Absolutely — here’s the complete content planning template. I’d love to hear what you build with it.', replies: [], handled: false },
  { id: 'th-2', initials: 'SL', name: 'Sarah Lin', message: 'This breakdown is so useful — saving it.', platform: 'LinkedIn', time: '18m', tone: 'blue', intent: 'Positive', reply: 'So glad it was useful, Sarah. The save is the highest compliment — thank you.', replies: [], handled: false },
  { id: 'th-3', initials: 'TK', name: '@theokitchen', message: 'Where can I find the full guide?', platform: 'TikTok', time: '42m', tone: 'lime', intent: 'Lead', reply: 'It’s ready for you. I’ll send the full guide by DM so it’s easy to find later.', replies: [], handled: false },
  { id: 'th-4', initials: 'MC', name: 'Maya Chen', message: 'Do you work with agencies too?', platform: 'Instagram', time: '1h', tone: 'lemon', intent: 'Lead', reply: 'Yes — agencies can manage unlimited client channels with separate approvals and brand rules.', replies: [], handled: false }
];

const defaultBrand = {
  voice: {
    title: 'Warm expert, never guru',
    desc: 'Direct, generous, quietly opinionated. Short sentences. No hustle language.'
  },
  guardrails: {
    title: 'Claims we never make',
    desc: 'No guaranteed growth, fake urgency, competitor attacks, or unsupported statistics.'
  },
  visuals: {
    title: 'Coral, ink, paper',
    desc: 'Editorial layouts, candid people, natural light. Avoid glossy stock imagery.'
  },
  score: 92
};

const months = ['August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026'];
let currentMonthIdx = 2; // October 2026

const platformClass = platform => ({
  Instagram: 'ig',
  LinkedIn: 'li',
  TikTok: 'tk',
  Facebook: 'fb',
  Threads: 'th',
  X: 'tk',
  YouTube: 'coral',
  Pinterest: 'coral',
  Bluesky: 'blue',
  Mastodon: 'blue'
}[platform] || 'fb');

const platformMark = platform => ({
  Instagram: 'IG',
  LinkedIn: 'in',
  TikTok: '♪',
  Facebook: 'f',
  Threads: '@',
  X: '𝕏',
  YouTube: '▶',
  Pinterest: 'P',
  Bluesky: 'B',
  Mastodon: 'M'
}[platform] || platform.slice(0, 2));

const read = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage write error', err);
  }
};

let accounts = read('tide-accounts', seedAccounts);
let scheduled = read('tide-posts', seedPosts);
let approvalsList = read('tide-approvals', seedApprovals);
let threadsList = read('tide-threads', seedThreads);
let brandData = read('tide-brand', defaultBrand);
let activeAccountIndex = null;
let activeChangeCardId = null;
let currentInboxFilter = 'All';
let unreadOnlyFilter = false;
let uploadedMediaFile = null;

function toast(message) {
  const el = document.querySelector('.toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
}

function updateBadges() {
  const remainingApprovals = approvalsList.length;
  const unreadInbox = threadsList.filter(t => !t.handled).length;
  
  const apprBadge = document.getElementById('approvals-badge');
  const overApprBadge = document.getElementById('overview-approval-badge');
  const apprFilter = document.getElementById('approvals-filter-count');
  if (apprBadge) apprBadge.textContent = remainingApprovals;
  if (overApprBadge) overApprBadge.textContent = remainingApprovals;
  if (apprFilter) apprFilter.textContent = `${remainingApprovals} awaiting review`;

  const inboxBadge = document.getElementById('inbox-badge');
  const overInboxBadge = document.getElementById('overview-inbox-badge');
  const inboxUnread = document.getElementById('inbox-unread-count');
  const inboxSummaryNew = document.getElementById('inbox-summary-new');
  if (inboxBadge) inboxBadge.textContent = unreadInbox;
  if (overInboxBadge) overInboxBadge.textContent = `${unreadInbox} new`;
  if (inboxUnread) inboxUnread.textContent = `${unreadInbox} unread`;
  if (inboxSummaryNew) inboxSummaryNew.textContent = unreadInbox;

  const publishedCount = document.getElementById('metric-published');
  if (publishedCount) publishedCount.textContent = 48 + (3 - remainingApprovals);

  const profileCount = document.getElementById('profile-connected-count');
  if (profileCount) profileCount.textContent = accounts.length;
}

function showView(name) {
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `view-${name}`));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === name));
  const view = document.querySelector(`#view-${name}`);
  const titleEl = document.querySelector('#page-title');
  if (titleEl && view) titleEl.textContent = view.dataset.title || 'Tide Social';
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  modal.querySelector('button:not(.modal-close), input, textarea, select')?.focus();
}

function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
}

function renderWeek() {
  const weekGrid = document.getElementById('week-grid');
  if (!weekGrid) return;
  const days = [['MON', 19], ['TUE', 20], ['WED', 21], ['THU', 22], ['FRI', 23], ['SAT', 24], ['SUN', 25]];
  weekGrid.innerHTML = days.map(([day, date]) => `
    <div class="day ${date === 23 ? 'today' : ''}">
      ${day}<strong>${date}</strong>
    </div>
  `).join('');

  const postList = document.getElementById('post-list');
  if (!postList) return;
  postList.innerHTML = scheduled.slice(0, 5).map(post => `
    <div class="scheduled-post">
      <span class="post-time">${post.time || '10:00'}</span>
      <div class="post-title">
        <strong>${post.title || post.copy?.slice(0, 48) || 'Scheduled Post'}</strong>
        <small>${post.meta || (post.channels ? post.channels.join(' · ') : 'Instagram')}</small>
      </div>
      <span class="platform ${post.cls || platformClass(post.channels?.[0] || 'Instagram')}">
        ${platformMark(post.channels?.[0] || post.meta?.split(' ')[0] || 'Instagram')}
      </span>
    </div>
  `).join('');
}

function renderCalendar() {
  const monthTitle = document.getElementById('cal-month-title');
  if (monthTitle) monthTitle.textContent = months[currentMonthIdx];

  const monthGrid = document.getElementById('month-grid');
  if (!monthGrid) return;
  const cells = [];
  for (let index = 28; index <= 38; index++) cells.push({ day: index > 30 ? index - 30 : index, muted: true });
  for (let day = 1; day <= 31; day++) cells.push({ day, muted: false });
  for (let day = 1; day <= 7; day++) cells.push({ day, muted: true });
  
  const events = {
    5: ['Launch story', ''],
    9: ['Founder lesson', 'blue'],
    14: ['Carousel', ''],
    18: ['Top post remix', 'blue'],
    23: ['3 posts scheduled', ''],
    27: ['Product reel', 'blue']
  };

  monthGrid.innerHTML = cells.slice(0, 42).map(cell => {
    const event = !cell.muted && events[cell.day];
    return `
      <div class="calendar-cell ${cell.muted ? 'muted' : ''}">
        ${cell.day}
        ${event ? `<div class="calendar-event ${event[1]}">${event[0]}</div>` : ''}
      </div>
    `;
  }).join('');
}

function renderApprovals() {
  const board = document.getElementById('approval-board');
  if (!board) return;
  if (approvalsList.length === 0) {
    board.innerHTML = `
      <div class="panel" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <h3>All caught up! 🎉</h3>
        <p style="color: var(--muted); margin-top: 6px;">All pending drafts have been approved and added to your publishing queue.</p>
      </div>
    `;
    return;
  }

  board.innerHTML = approvalsList.map((item) => `
    <article class="board-card" data-appr-id="${item.id}">
      <div class="board-art">${item.kicker}</div>
      <div class="board-body">
        <span class="platform ${item.cls || platformClass(item.platform)}">${item.mark || platformMark(item.platform)}</span>
        <h3>${item.title}</h3>
        <p>${item.type} · Ready to review</p>
        ${item.revision ? `<div class="revision-badge">Revision: "${item.revision}"</div>` : ''}
        <div class="board-actions" style="margin-top: 12px;">
          <button type="button" class="button secondary request-change" data-id="${item.id}">Change</button>
          <button type="button" class="button primary approve-board" data-id="${item.id}">Approve ✓</button>
        </div>
      </div>
    </article>
  `).join('');
}

function renderThreads(filter = 'All', search = '') {
  const threadList = document.getElementById('thread-list');
  if (!threadList) return;

  const filtered = threadsList.filter(t => {
    const matchFilter = (filter === 'All' || t.platform === filter);
    const matchUnread = unreadOnlyFilter ? !t.handled : true;
    const matchSearch = (!search || t.name.toLowerCase().includes(search.toLowerCase()) || t.message.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchUnread && matchSearch;
  });

  if (filtered.length === 0) {
    threadList.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--muted); font-size: 11px;">No conversations found</div>`;
    return;
  }

  threadList.innerHTML = filtered.map((thread, index) => `
    <button class="thread ${index === 0 ? 'active' : ''}" type="button" data-thread-id="${thread.id}">
      <span class="avatar thread-avatar ${thread.tone}">${thread.initials}</span>
      <span class="thread-copy">
        <span><strong>${thread.name}</strong><time>${thread.time}</time></span>
        <small>
          <i class="platform ${platformClass(thread.platform)}">${platformMark(thread.platform)}</i>
          ${thread.platform}
          <b>${thread.intent}</b>
        </small>
        <p>${thread.message}</p>
      </span>
      ${!thread.handled ? `<i class="unread-dot" aria-label="Unread"></i>` : ''}
    </button>
  `).join('');

  if (filtered[0]) {
    renderConversation(filtered[0].id);
  }
}

function renderConversation(threadId) {
  const thread = threadsList.find(t => t.id === threadId);
  const container = document.getElementById('active-conversation');
  if (!container || !thread) return;

  const repliesHtml = (thread.replies || []).map(r => `
    <div class="bubble-row" style="margin-top: 10px; justify-content: flex-end;">
      <div>
        <span class="message-bubble" style="background: var(--ink); color: #fff; border-radius: 12px 12px 4px 12px;">${r.text}</span>
        <time style="text-align: right;">${r.time}</time>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="conversation-head">
      <div>
        <span class="avatar thread-avatar ${thread.tone}">${thread.initials}</span>
        <span>
          <strong>${thread.name}</strong>
          <small><i class="platform ${platformClass(thread.platform)}">${platformMark(thread.platform)}</i>${thread.platform} · Public comment</small>
        </span>
      </div>
      <div>
        <button type="button" class="resolve-button" data-thread-id="${thread.id}">
          ${thread.handled ? 'Handled ✓' : 'Mark done ✓'}
        </button>
      </div>
    </div>
    <div class="conversation-body">
      <div class="conversation-date">Today</div>
      <div class="social-context">
        <span class="context-art">CONTENT<br>SYSTEM</span>
        <div>
          <span>Commented on your post</span>
          <strong>The 10-minute content system</strong>
          <small>Published today · 09:30</small>
        </div>
      </div>
      <div class="bubble-row">
        <span class="avatar thread-avatar ${thread.tone}">${thread.initials}</span>
        <div>
          <span class="message-bubble incoming">${thread.message}</span>
          <time>${thread.time} ago</time>
        </div>
      </div>
      ${repliesHtml}
      <div class="ai-draft">
        <div>
          <span>✦</span>
          <strong>Drafted in your brand voice</strong>
          <button type="button" id="btn-regenerate-reply" data-thread-id="${thread.id}">Regenerate</button>
        </div>
        <textarea id="active-reply-text" aria-label="Reply to ${thread.name}">${thread.reply}</textarea>
        <div class="draft-actions">
          <button type="button" id="btn-add-link">＋ Add link</button>
          <button type="button" id="btn-saved-reply">⌁ Saved reply</button>
          <span></span>
          <small>Only sends when you approve</small>
          <button type="button" class="send-reply" data-thread-id="${thread.id}">Send reply ↗</button>
        </div>
      </div>
    </div>
    <aside class="conversation-foot">
      <div>
        <span class="avatar thread-avatar ${thread.tone}">${thread.initials}</span>
        <p>
          <strong>${thread.intent === 'Lead' ? 'Potential lead' : 'Engaged follower'}</strong><br>
          ${thread.intent === 'Lead' ? 'Asked a product or resource question' : 'Regularly saves educational content'}
        </p>
      </div>
      <button type="button" class="btn-view-audience-profile" data-name="${thread.name}" data-intent="${thread.intent}">View profile →</button>
    </aside>
  `;
}

function renderAccounts() {
  const accountCount = document.getElementById('account-count');
  const healthyCount = document.getElementById('healthy-count');
  if (accountCount) accountCount.textContent = accounts.length;
  if (healthyCount) healthyCount.textContent = accounts.filter(a => a.status === 'Healthy').length;

  const featured = ['Instagram', 'LinkedIn', 'Threads'];
  const capacityEl = document.getElementById('platform-capacity');
  if (capacityEl) {
    capacityEl.innerHTML = featured.map(platform => {
      const count = accounts.filter(account => account.platform === platform).length;
      return `
        <article class="platform-capacity-card" data-platform="${platform}" style="cursor: pointer;">
          <span class="platform ${platformClass(platform)}">${platformMark(platform)}</span>
          <div>
            <strong>${platform}</strong>
            <small>${count} connected · No limit</small>
          </div>
          <b>＋</b>
        </article>
      `;
    }).join('') + `
      <article class="all-platforms" style="cursor: pointer;" data-platform="TikTok">
        <span>+9</span>
        <div><strong>More networks</strong><small>12 platforms supported</small></div>
        <b>∞</b>
      </article>
    `;
  }

  const listEl = document.getElementById('accounts-list');
  if (listEl) {
    listEl.innerHTML = accounts.map((account, index) => `
      <div class="account-row">
        <span class="platform ${account.cls || platformClass(account.platform)}">${platformMark(account.platform)}</span>
        <div>
          <strong>${account.handle}</strong>
          <small>${account.platform} · ${account.audience || 'Connected'}</small>
        </div>
        <span class="${account.status === 'Healthy' ? 'status-ok' : 'status-warn'}">● ${account.status || 'Healthy'}</span>
        <small>Token valid: ${account.tokenExpires || '60 days'}</small>
        <button type="button" class="btn-account-options" aria-label="Options for ${account.handle}" data-index="${index}">•••</button>
      </div>
    `).join('');
  }

  const composerChecks = document.getElementById('composer-channel-checks');
  if (composerChecks) {
    composerChecks.innerHTML = accounts.map((account, index) => `
      <label>
        <input type="checkbox" value="${account.platform}" ${index === 0 ? 'checked' : ''}>
        <span class="platform ${account.cls || platformClass(account.platform)}">${platformMark(account.platform)}</span>
        ${account.handle}
      </label>
    `).join('');
  }
}

function setupPlatforms() {
  const grid = document.getElementById('platform-grid');
  if (!grid) return;
  grid.innerHTML = supportedPlatforms.map((platform, index) => `
    <button type="button" class="platform-choice ${index === 0 ? 'active' : ''}" data-platform="${platform}">
      ${platform}
    </button>
  `).join('');
}

function renderConcepts(promptText) {
  const list = document.getElementById('idea-results-list');
  if (!list) return;
  const concepts = generateConcepts(promptText);
  list.innerHTML = concepts.map((item, index) => `
    <div class="idea-card">
      <span>0${index + 1}</span>
      <div>
        <strong>${item.title}</strong>
        <p>${item.format} · ${item.voice}</p>
      </div>
      <button type="button" class="btn-use-idea" data-copy="${encodeURIComponent(item.copy)}" data-platform="${item.platform}">Use</button>
    </div>
  `).join('');
}

function renderBrand() {
  const scoreEl = document.getElementById('brand-score-display');
  const voiceTitle = document.getElementById('brand-voice-title');
  const voiceDesc = document.getElementById('brand-voice-desc');
  const guardsTitle = document.getElementById('brand-guardrails-title');
  const guardsDesc = document.getElementById('brand-guardrails-desc');
  const visualsTitle = document.getElementById('brand-visuals-title');
  const visualsDesc = document.getElementById('brand-visuals-desc');

  if (scoreEl) scoreEl.innerHTML = `${brandData.score}<small>%</small>`;
  if (voiceTitle) voiceTitle.textContent = brandData.voice.title;
  if (voiceDesc) voiceDesc.textContent = brandData.voice.desc;
  if (guardsTitle) guardsTitle.textContent = brandData.guardrails.title;
  if (guardsDesc) guardsDesc.textContent = brandData.guardrails.desc;
  if (visualsTitle) visualsTitle.textContent = brandData.visuals.title;
  if (visualsDesc) visualsDesc.textContent = brandData.visuals.desc;
}

// Global Event Listeners
document.querySelectorAll('[data-view]').forEach(button => {
  button.addEventListener('click', () => showView(button.dataset.view));
});

document.querySelectorAll('[data-view-link]').forEach(button => {
  button.addEventListener('click', () => showView(button.dataset.viewLink));
});

document.querySelectorAll('[data-open]').forEach(button => {
  button.addEventListener('click', () => openModal(button.dataset.open));
});

document.querySelectorAll('[data-close]').forEach(button => {
  button.addEventListener('click', () => closeModal(button.closest('.modal')));
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal(modal);
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') document.querySelectorAll('.modal:not([hidden])').forEach(closeModal);
});

const mobileMenu = document.querySelector('.mobile-menu');
if (mobileMenu) {
  mobileMenu.addEventListener('click', () => {
    document.querySelector('.sidebar')?.classList.toggle('open');
  });
}

// Profile Modal & Sidebar Click
document.getElementById('sidebar-profile-btn')?.addEventListener('click', () => {
  openModal('profile-modal');
});

document.getElementById('btn-workspace-switch')?.addEventListener('click', () => {
  const ws = document.getElementById('profile-workspace-select')?.value;
  const label = document.getElementById('header-workspace-label');
  if (label && ws) label.textContent = ws.toUpperCase();
  closeModal(document.getElementById('profile-modal'));
  toast(`Switched workspace to ${ws}`);
});

// Notifications
document.getElementById('notification-button')?.addEventListener('click', () => {
  openModal('notification-modal');
});

document.getElementById('btn-clear-notifications')?.addEventListener('click', () => {
  const dot = document.getElementById('notif-badge-dot');
  if (dot) dot.style.display = 'none';
  const list = document.getElementById('notification-list');
  if (list) list.innerHTML = `<div style="text-align: center; color: var(--muted); padding: 20px;">All caught up! No unread notifications.</div>`;
  closeModal(document.getElementById('notification-modal'));
  toast('All notifications marked as read.');
});

// Service Status
document.getElementById('btn-service-status')?.addEventListener('click', () => {
  openModal('status-modal');
});

// Capacity card click -> open add channel modal
document.getElementById('platform-capacity')?.addEventListener('click', event => {
  const card = event.target.closest('[data-platform]');
  if (card) {
    const platform = card.dataset.platform;
    openModal('account-modal');
    document.querySelectorAll('.platform-choice').forEach(choice => {
      choice.classList.toggle('active', choice.dataset.platform === platform);
    });
  }
});

// Platform selection in Add Channel modal
document.getElementById('platform-grid')?.addEventListener('click', event => {
  const choice = event.target.closest('.platform-choice');
  if (!choice) return;
  document.querySelectorAll('.platform-choice').forEach(item => item.classList.remove('active'));
  choice.classList.add('active');
});

// Add Channel Form Submit
document.getElementById('account-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const platform = document.querySelector('.platform-choice.active')?.dataset.platform || 'Instagram';
  const handleInput = form.get('handle');
  const result = validateAccount(platform, handleInput);

  if (!result.valid) return toast(result.error);
  if (accounts.some(acc => acc.platform === platform && acc.handle.toLowerCase() === result.handle.toLowerCase())) {
    return toast('That account is already connected.');
  }

  accounts.push({
    platform,
    handle: result.handle,
    audience: '0 followers (New)',
    cls: platformClass(platform),
    status: 'Healthy',
    tokenExpires: '90 days'
  });
  write('tide-accounts', accounts);
  renderAccounts();
  updateBadges();
  closeModal(document.getElementById('account-modal'));
  event.currentTarget.reset();
  toast(`${result.handle} connected successfully! Live token verified.`);
});

// Manage Channel Modal
document.getElementById('accounts-list')?.addEventListener('click', event => {
  const btn = event.target.closest('.btn-account-options');
  if (!btn) return;
  activeAccountIndex = Number(btn.dataset.index);
  const acc = accounts[activeAccountIndex];
  if (!acc) return;

  const detailsEl = document.getElementById('channel-options-details');
  if (detailsEl) {
    detailsEl.innerHTML = `
      <strong>${acc.handle} (${acc.platform})</strong>
      <span>Status: <b style="color: var(--green);">${acc.status}</b></span>
      <span>OAuth token: Valid for ${acc.tokenExpires || '60 days'}</span>
      <span>API rate limit: 98% capacity remaining</span>
    `;
  }
  openModal('channel-options-modal');
});

document.getElementById('btn-reconnect-channel')?.addEventListener('click', () => {
  if (activeAccountIndex !== null && accounts[activeAccountIndex]) {
    accounts[activeAccountIndex].status = 'Healthy';
    accounts[activeAccountIndex].tokenExpires = '90 days';
    write('tide-accounts', accounts);
    renderAccounts();
    closeModal(document.getElementById('channel-options-modal'));
    toast('Token re-verified. OAuth session refreshed.');
  }
});

document.getElementById('btn-disconnect-channel')?.addEventListener('click', () => {
  if (activeAccountIndex !== null && accounts[activeAccountIndex]) {
    const handle = accounts[activeAccountIndex].handle;
    accounts.splice(activeAccountIndex, 1);
    write('tide-accounts', accounts);
    renderAccounts();
    updateBadges();
    closeModal(document.getElementById('channel-options-modal'));
    toast(`Disconnected ${handle}.`);
  }
});

// Composer logic
const composerCopy = document.querySelector('[name="copy"]');
if (composerCopy) {
  composerCopy.value = read('tide-draft', '');
  const charCount = document.querySelector('.char-count');
  if (charCount) charCount.textContent = `${composerCopy.value.length.toLocaleString()} / 2,200`;

  composerCopy.addEventListener('input', () => {
    if (charCount) charCount.textContent = `${composerCopy.value.length.toLocaleString()} / 2,200`;
    const saveState = document.getElementById('save-state');
    if (saveState) saveState.textContent = 'Saving…';
    clearTimeout(composerCopy.saveTimer);
    composerCopy.saveTimer = setTimeout(() => {
      write('tide-draft', composerCopy.value);
      if (saveState) saveState.textContent = 'Draft saved';
    }, 400);
  });
}

// AI Rewrite buttons in Composer
document.querySelectorAll('[data-rewrite]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!composerCopy) return;
    const action = btn.dataset.rewrite;
    composerCopy.value = rewriteCopy(composerCopy.value, action);
    const charCount = document.querySelector('.char-count');
    if (charCount) charCount.textContent = `${composerCopy.value.length.toLocaleString()} / 2,200`;
    write('tide-draft', composerCopy.value);
    toast(`Applied AI rewrite: ${btn.textContent.trim()}`);
  });
});

// Composer Media Upload & Preflight
const mediaDrop = document.getElementById('composer-media-drop');
const fileInput = document.getElementById('composer-file-input');
const mediaPreview = document.getElementById('media-preview-container');

if (mediaDrop && fileInput) {
  mediaDrop.addEventListener('click', () => fileInput.click());
  mediaDrop.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') fileInput.click();
  });

  fileInput.addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleMediaFile(file);
  });

  mediaDrop.addEventListener('dragover', e => {
    e.preventDefault();
    mediaDrop.style.background = '#fcf8ee';
  });
  mediaDrop.addEventListener('dragleave', () => {
    mediaDrop.style.background = '';
  });
  mediaDrop.addEventListener('drop', e => {
    e.preventDefault();
    mediaDrop.style.background = '';
    const file = e.dataTransfer.files?.[0];
    if (file) handleMediaFile(file);
  });
}

function handleMediaFile(file) {
  const result = validateMedia(file);
  if (!result.valid) {
    return toast(result.error);
  }
  uploadedMediaFile = file;
  if (mediaPreview) {
    mediaPreview.hidden = false;
    const url = URL.createObjectURL(file);
    mediaPreview.innerHTML = `
      <img src="${url}" alt="Media preview">
      <div class="media-meta">
        <strong>${file.name} (${result.sizeMB} MB)</strong>
        <small>✓ Preflight passed: ${result.ratioCheck}</small>
      </div>
      <button type="button" id="btn-remove-media">✕ Remove</button>
    `;
    document.getElementById('btn-remove-media')?.addEventListener('click', () => {
      uploadedMediaFile = null;
      mediaPreview.hidden = true;
      mediaPreview.innerHTML = '';
      if (fileInput) fileInput.value = '';
      toast('Media removed.');
    });
  }
  toast(result.status);
}

// Composer Form Submit
document.getElementById('composer-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const channels = [...event.currentTarget.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.value);
  const copy = form.get('copy');
  const date = form.get('date');
  const time = form.get('time');

  const result = createPost(copy, channels, date, time);
  if (!result.valid) return toast(result.error);

  scheduled.unshift({
    ...result.post,
    title: result.post.copy.slice(0, 48),
    meta: channels.join(' · '),
    cls: platformClass(channels[0])
  });

  write('tide-posts', scheduled);
  write('tide-draft', '');
  if (composerCopy) composerCopy.value = '';
  uploadedMediaFile = null;
  if (mediaPreview) {
    mediaPreview.hidden = true;
    mediaPreview.innerHTML = '';
  }
  renderWeek();
  closeModal(document.getElementById('composer-modal'));
  toast(`Post scheduled for ${result.post.date} at ${result.post.time}!`);
});

// AI Creative Studio Prompts
document.getElementById('chip-url')?.addEventListener('click', () => {
  const ideaArea = document.getElementById('idea');
  if (ideaArea) {
    ideaArea.value = 'https://acme.studio/blog/how-we-scaled-organic-reach-without-ads';
    toast('URL loaded. Click "Generate concepts" to transform it.');
  }
});

document.getElementById('chip-top')?.addEventListener('click', () => {
  const ideaArea = document.getElementById('idea');
  if (ideaArea) {
    ideaArea.value = 'The 10-minute content system that gave us our Fridays back (84K reach)';
    toast('Top post loaded into prompt.');
  }
});

document.getElementById('chip-media')?.addEventListener('click', () => {
  openModal('composer-modal');
  fileInput?.click();
});

document.getElementById('btn-generate-concepts')?.addEventListener('click', () => {
  const ideaArea = document.getElementById('idea');
  const prompt = ideaArea?.value.trim() || 'Organic growth and founder lessons';
  renderConcepts(prompt);
  toast('3 brand-aligned concepts generated!');
});

// "Use" idea card -> populate composer
document.getElementById('idea-results-list')?.addEventListener('click', event => {
  const btn = event.target.closest('.btn-use-idea');
  if (!btn) return;
  const copy = decodeURIComponent(btn.dataset.copy || '');
  const platform = btn.dataset.platform;

  if (composerCopy) {
    composerCopy.value = copy;
    const charCount = document.querySelector('.char-count');
    if (charCount) charCount.textContent = `${composerCopy.value.length.toLocaleString()} / 2,200`;
  }
  openModal('composer-modal');
  if (platform) {
    document.querySelectorAll('#composer-channel-checks input').forEach(input => {
      input.checked = (input.value === platform);
    });
  }
  toast('Concept loaded into Composer.');
});

// Approvals page logic
document.getElementById('approval-board')?.addEventListener('click', event => {
  const approveBtn = event.target.closest('.approve-board');
  if (approveBtn) {
    const id = approveBtn.dataset.id;
    const item = approvalsList.find(a => a.id === id);
    if (item) {
      scheduled.unshift({
        id: Date.now(),
        time: '11:00',
        date: '2026-10-26',
        title: item.title,
        meta: `${item.platform} · Approved`,
        cls: item.cls,
        copy: item.kicker
      });
      write('tide-posts', scheduled);
      renderWeek();
    }
    approvalsList = approvalsList.filter(a => a.id !== id);
    write('tide-approvals', approvalsList);
    renderApprovals();
    updateBadges();
    toast('Draft approved and added to your publishing queue!');
  }

  const changeBtn = event.target.closest('.request-change');
  if (changeBtn) {
    activeChangeCardId = changeBtn.dataset.id;
    openModal('change-modal');
  }
});

// Overview featured approval buttons
document.getElementById('approve-featured-btn')?.addEventListener('click', function () {
  this.textContent = 'Approved ✓';
  this.disabled = true;
  approvalsList = approvalsList.filter(a => a.id !== 'appr-1');
  write('tide-approvals', approvalsList);
  updateBadges();
  renderApprovals();
  toast('Reel approved and scheduled.');
});

document.getElementById('approve-mini-btn')?.addEventListener('click', function () {
  this.textContent = '✓ Done';
  this.disabled = true;
  approvalsList = approvalsList.filter(a => a.id !== 'appr-2');
  write('tide-approvals', approvalsList);
  updateBadges();
  renderApprovals();
  toast('LinkedIn carousel approved.');
});

document.querySelector('[data-target="featured"]')?.addEventListener('click', () => {
  activeChangeCardId = 'appr-1';
  openModal('change-modal');
});

// Submit Change Request Modal
document.getElementById('submit-change')?.addEventListener('click', () => {
  const reqText = document.getElementById('change-request')?.value.trim();
  if (!reqText) return toast('Describe the change you need.');

  if (activeChangeCardId) {
    const item = approvalsList.find(a => a.id === activeChangeCardId);
    if (item) {
      item.revision = reqText;
      write('tide-approvals', approvalsList);
      renderApprovals();
    }
  }
  closeModal(document.getElementById('change-modal'));
  const changeInput = document.getElementById('change-request');
  if (changeInput) changeInput.value = '';
  toast('Revision requested. Note saved to the approval card.');
});

// Unified Inbox logic
document.getElementById('thread-list')?.addEventListener('click', event => {
  const selected = event.target.closest('[data-thread-id]');
  if (!selected) return;
  document.querySelectorAll('.thread').forEach(th => th.classList.remove('active'));
  selected.classList.add('active');
  renderConversation(selected.dataset.threadId);
});

document.getElementById('thread-search')?.addEventListener('input', event => {
  const query = event.target.value;
  renderThreads(currentInboxFilter, query);
});

document.getElementById('thread-filter-toggle')?.addEventListener('click', function () {
  unreadOnlyFilter = !unreadOnlyFilter;
  this.style.background = unreadOnlyFilter ? 'var(--coral)' : '#fff';
  this.style.color = unreadOnlyFilter ? '#fff' : 'inherit';
  renderThreads(currentInboxFilter, document.getElementById('thread-search')?.value || '');
  toast(unreadOnlyFilter ? 'Showing unread conversations only' : 'Showing all conversations');
});

document.getElementById('inbox-filter-btn')?.addEventListener('click', function () {
  const filters = ['All', 'Instagram', 'LinkedIn', 'TikTok'];
  const nextIdx = (filters.indexOf(currentInboxFilter) + 1) % filters.length;
  currentInboxFilter = filters[nextIdx];
  this.textContent = `Channel: ${currentInboxFilter} ⌄`;
  renderThreads(currentInboxFilter, document.getElementById('thread-search')?.value || '');
  toast(`Filtered inbox by ${currentInboxFilter}`);
});

document.getElementById('active-conversation')?.addEventListener('click', event => {
  const sendBtn = event.target.closest('.send-reply');
  if (sendBtn) {
    const threadId = sendBtn.dataset.threadId;
    const thread = threadsList.find(t => t.id === threadId);
    const textarea = document.getElementById('active-reply-text');
    const replyText = textarea?.value.trim();
    if (!replyText) return toast('Please enter a reply message.');

    if (thread) {
      thread.replies = thread.replies || [];
      thread.replies.push({ text: replyText, time: 'Just now' });
      thread.handled = true;
      thread.reply = '';
      write('tide-threads', threadsList);
      renderConversation(threadId);
      renderThreads(currentInboxFilter, document.getElementById('thread-search')?.value || '');
      updateBadges();
      toast('Reply sent and conversation marked handled!');
    }
  }

  const resolveBtn = event.target.closest('.resolve-button');
  if (resolveBtn) {
    const threadId = resolveBtn.dataset.threadId;
    const thread = threadsList.find(t => t.id === threadId);
    if (thread) {
      thread.handled = true;
      write('tide-threads', threadsList);
      renderConversation(threadId);
      renderThreads(currentInboxFilter, document.getElementById('thread-search')?.value || '');
      updateBadges();
      toast('Conversation marked done.');
    }
  }

  const regenBtn = event.target.closest('#btn-regenerate-reply');
  if (regenBtn) {
    const threadId = regenBtn.dataset.threadId;
    const thread = threadsList.find(t => t.id === threadId);
    if (thread) {
      thread.reply = `Thanks for connecting! I've sent the complete step-by-step breakdown directly to your inbox. Let us know if you have any questions along the way.`;
      const textarea = document.getElementById('active-reply-text');
      if (textarea) textarea.value = thread.reply;
      toast('Fresh brand-voice reply generated.');
    }
  }

  if (event.target.closest('#btn-add-link')) {
    const textarea = document.getElementById('active-reply-text');
    if (textarea) {
      textarea.value += ' https://acme.studio/resources';
      toast('Resource link inserted.');
    }
  }

  if (event.target.closest('#btn-saved-reply')) {
    const textarea = document.getElementById('active-reply-text');
    if (textarea) {
      textarea.value = `Hey there! Thanks so much for reaching out. You can find our complete system guide at https://acme.studio/guide`;
      toast('Saved snippet inserted.');
    }
  }

  const viewProf = event.target.closest('.btn-view-audience-profile');
  if (viewProf) {
    const name = viewProf.dataset.name;
    const intent = viewProf.dataset.intent;
    const profContent = document.getElementById('audience-profile-content');
    if (profContent) {
      profContent.innerHTML = `
        <div style="font-size:12px; display:grid; gap:6px;">
          <div><strong>User:</strong> <span>${name}</span></div>
          <div><strong>Intent:</strong> <span style="color:var(--coral); font-weight:700;">${intent}</span></div>
          <div><strong>Past Engagement:</strong> <span>3 comments, 5 saves, 1 DM inquiry</span></div>
          <div><strong>Status:</strong> <span>Qualified Lead (Sales handoff available)</span></div>
        </div>
      `;
    }
    openModal('audience-profile-modal');
  }
});

// Calendar Month Navigation & Toggle
document.getElementById('cal-prev')?.addEventListener('click', () => {
  if (currentMonthIdx > 0) {
    currentMonthIdx--;
    renderCalendar();
    toast(`Viewing ${months[currentMonthIdx]}`);
  }
});

document.getElementById('cal-next')?.addEventListener('click', () => {
  if (currentMonthIdx < months.length - 1) {
    currentMonthIdx++;
    renderCalendar();
    toast(`Viewing ${months[currentMonthIdx]}`);
  }
});

const monthBtn = document.getElementById('cal-view-month');
const weekBtn = document.getElementById('cal-view-week');
const monthGrid = document.getElementById('month-grid');
const weekView = document.getElementById('week-calendar-view');

if (monthBtn && weekBtn) {
  monthBtn.addEventListener('click', () => {
    monthBtn.classList.add('active');
    weekBtn.classList.remove('active');
    if (monthGrid) monthGrid.hidden = false;
    if (weekView) weekView.hidden = true;
  });

  weekBtn.addEventListener('click', () => {
    weekBtn.classList.add('active');
    monthBtn.classList.remove('active');
    if (monthGrid) monthGrid.hidden = true;
    if (weekView) {
      weekView.hidden = false;
      const days = ['Mon Oct 19', 'Tue Oct 20', 'Wed Oct 21', 'Thu Oct 22', 'Thu Oct 23', 'Sat Oct 24', 'Sun Oct 25'];
      weekView.innerHTML = days.map((day, idx) => `
        <div class="week-col">
          <div class="week-col-head"><span>${day}</span><b>${idx === 4 ? 'Today' : ''}</b></div>
          ${scheduled[idx] ? `
            <div class="calendar-event blue" style="margin-top: 4px;">
              <strong>${scheduled[idx].time || '10:00'}</strong>: ${scheduled[idx].title || scheduled[idx].copy?.slice(0, 24)}
            </div>
          ` : `<small style="color: var(--muted);">No posts</small>`}
        </div>
      `).join('');
    }
  });
}

// Brand Brain Edit Logic
let activeBrandField = null;
document.querySelectorAll('.btn-edit-brand').forEach(btn => {
  btn.addEventListener('click', () => {
    activeBrandField = btn.dataset.brandField;
    const titleInput = document.getElementById('brand-edit-title');
    const contentInput = document.getElementById('brand-edit-content');
    const modalTitle = document.getElementById('brand-modal-title');

    if (activeBrandField === 'voice') {
      if (modalTitle) modalTitle.textContent = 'Edit brand voice';
      if (titleInput) titleInput.value = brandData.voice.title;
      if (contentInput) contentInput.value = brandData.voice.desc;
    } else if (activeBrandField === 'guardrails') {
      if (modalTitle) modalTitle.textContent = 'Edit brand guardrails';
      if (titleInput) titleInput.value = brandData.guardrails.title;
      if (contentInput) contentInput.value = brandData.guardrails.desc;
    } else if (activeBrandField === 'visuals') {
      if (modalTitle) modalTitle.textContent = 'Edit visual aesthetic';
      if (titleInput) titleInput.value = brandData.visuals.title;
      if (contentInput) contentInput.value = brandData.visuals.desc;
    }
    openModal('brand-modal');
  });
});

document.getElementById('brand-modal-save')?.addEventListener('click', () => {
  const title = document.getElementById('brand-edit-title')?.value.trim();
  const desc = document.getElementById('brand-edit-content')?.value.trim();
  if (!title || !desc) return toast('Please fill in both fields.');

  if (activeBrandField && brandData[activeBrandField]) {
    brandData[activeBrandField].title = title;
    brandData[activeBrandField].desc = desc;
    write('tide-brand', brandData);
    renderBrand();
    closeModal(document.getElementById('brand-modal'));
    toast('Brand Brain updated and synced to all generation workflows!');
  }
});

document.getElementById('btn-rescan-brand')?.addEventListener('click', function () {
  this.textContent = 'Scanning website…';
  this.disabled = true;
  setTimeout(() => {
    brandData.score = 96;
    write('tide-brand', brandData);
    renderBrand();
    this.textContent = 'Rescan website';
    this.disabled = false;
    toast('Website rescanned! Brand confidence increased to 96%.');
  }, 1200);
});

// Analytics Export (.csv)
document.getElementById('btn-export-report')?.addEventListener('click', () => {
  const rows = [
    ['Post Title', 'Platform', 'Reach', 'Engagement Rate', 'Leads Generated'],
    ['The content system that gave us Fridays back', 'Instagram', '84210', '11.8%', '126'],
    ['Stop measuring consistency like this', 'LinkedIn', '42662', '9.4%', '88'],
    ['Behind our weekly planning ritual', 'TikTok', '37901', '8.9%', '47'],
    ['How to build an audience without burnout', 'Threads', '29140', '7.4%', '38']
  ];
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'tide_social_analytics_report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast('Report exported to tide_social_analytics_report.csv');
});

// Analytics Refresh & Column toggle
document.getElementById('btn-refresh-analytics')?.addEventListener('click', function () {
  this.textContent = 'Syncing APIs…';
  setTimeout(() => {
    this.textContent = 'Refresh data';
    const audGrowth = document.getElementById('metric-aud-growth');
    const leads = document.getElementById('metric-leads-count');
    if (audGrowth) audGrowth.textContent = '+13,290';
    if (leads) leads.textContent = '342';
    toast('Analytics synced live with Meta & LinkedIn APIs.');
  }, 900);
});

document.getElementById('btn-customize-columns')?.addEventListener('click', () => {
  toast('Showing all standard metrics: Reach, Engagement, and Attributed Leads.');
});

// Analytics Period Select
document.getElementById('pulse-period-select')?.addEventListener('change', function () {
  const reach = document.getElementById('metric-reach');
  const eng = document.getElementById('metric-engagement');
  if (this.value === '7') {
    if (reach) reach.textContent = '76.2K';
    if (eng) eng.textContent = '9.1%';
    toast('Showing last 7 days of performance');
  } else {
    if (reach) reach.textContent = '284.7K';
    if (eng) eng.textContent = '8.6%';
    toast('Showing last 30 days of performance');
  }
});

// Policy Dialogs
const policies = {
  privacy: [
    'Privacy policy',
    '<h3>Data we process</h3><p>We process account details, content you create, social account identifiers, publishing results, and support messages to provide the service. Connected-platform tokens are encrypted with AES-256 and passwords are never collected.</p><h3>Your control</h3><p>You can export or delete workspace data, revoke a social connection, restrict AI use, and request access or correction. Content is not used to train shared models without explicit opt-in.</p><h3>Retention & transfers</h3><p>Workspace data is retained while your account is active and removed after the documented deletion window. Vendors are contractually limited to providing infrastructure, analytics, support, and model processing.</p>'
  ],
  cookies: [
    'Cookie policy',
    '<h3>Necessary storage</h3><p>Authentication, security, consent choices, autosaved drafts, and core product preferences. These are required for Tide to work.</p><h3>Optional analytics</h3><p>With consent, anonymous product events help us understand which flows are useful. Tide does not use advertising cookies or sell personal information.</p><h3>Change your choice</h3><p>Open Cookie settings from this footer at any time. Your latest preference replaces the previous one.</p>'
  ],
  terms: [
    'Terms of service',
    '<h3>Your content</h3><p>You keep ownership of content you provide. You grant Tide only the rights needed to create, transform, schedule, and publish it at your direction.</p><h3>Platform rules</h3><p>You are responsible for having permission to connect accounts and for complying with each social platform’s rules. Tide may pause risky automation to protect your accounts.</p><h3>Service limits</h3><p>Publishing depends on third-party APIs. Tide reports confirmed, failed, and unknown outcomes separately and never treats an unverified publish as successful.</p>'],
  security: [
    'Security overview',
    '<h3>Designed for least privilege</h3><p>OAuth tokens are encrypted, scoped per channel, and revocable. Sensitive operations are logged. Team access supports roles and approval boundaries.</p><h3>Operational safeguards</h3><p>Monitoring, dependency review, backups, incident response, and recovery testing protect service continuity. Responsible disclosures receive a tracked human response.</p>'
  ]
};

document.querySelectorAll('[data-policy]').forEach(button => {
  button.addEventListener('click', () => {
    const [title, content] = policies[button.dataset.policy];
    const pTitle = document.getElementById('policy-title');
    const pContent = document.getElementById('policy-content');
    if (pTitle) pTitle.textContent = title;
    if (pContent) pContent.innerHTML = content;
    openModal('policy-modal');
  });
});

// Cookie Consent Logic
const cookieBanner = document.querySelector('.cookie-banner');
if (cookieBanner && !localStorage.getItem('tide-cookie-consent')) {
  cookieBanner.hidden = false;
}
function saveCookieConsent(value) {
  localStorage.setItem('tide-cookie-consent', value);
  if (cookieBanner) cookieBanner.hidden = true;
  toast('Cookie preference saved.');
}
document.getElementById('cookie-accept')?.addEventListener('click', () => saveCookieConsent('analytics'));
document.getElementById('cookie-reject')?.addEventListener('click', () => saveCookieConsent('necessary'));
document.getElementById('cookie-settings')?.addEventListener('click', () => openModal('cookie-modal'));
document.getElementById('cookie-save')?.addEventListener('click', () => {
  const isAnalytics = document.getElementById('analytics-cookie')?.checked;
  saveCookieConsent(isAnalytics ? 'analytics' : 'necessary');
  closeModal(document.getElementById('cookie-modal'));
});

// Initial Render
setupPlatforms();
renderWeek();
renderCalendar();
renderApprovals();
renderThreads();
renderAccounts();
renderConcepts('');
renderBrand();
updateBadges();
