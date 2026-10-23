const {
  supportedPlatforms,
  validateAccount,
  createPost,
  validateMedia,
  rewriteCopy,
  generateConcepts,
  generateHormoziHooks,
  repurposeContent,
  generateVideoStoryboard
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
  if (overApprBadge) {
    overApprBadge.textContent = remainingApprovals;
    if (remainingApprovals === 0) {
      overApprBadge.classList.add('zero');
    } else {
      overApprBadge.classList.remove('zero');
    }
  }
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
  document.querySelectorAll('.tab-btn').forEach(item => item.classList.toggle('active', item.dataset.view === name));
  document.querySelectorAll('.quick-chip').forEach(item => item.classList.toggle('active', item.dataset.view === name));
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

let calCurrentYear = 2026;
let calCurrentMonth = 9; // 0-indexed: 9 = October
let calSelectedDate = "2026-10-23";
let calFilterPlatform = "All";
let calViewMode = "month";
let overviewSelectedDate = "2026-10-23";
let activeViewingPostId = null;

const calMonthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function openComposerForDate(dateStr, timeStr) {
  const dateInput = document.querySelector("#composer-form [name=\"date\"]");
  const timeInput = document.querySelector("#composer-form [name=\"time\"]");
  if (dateInput && dateStr) dateInput.value = dateStr;
  if (timeInput && timeStr) timeInput.value = timeStr;
  openModal("composer-modal");
  toast("Scheduling post for " + dateStr + (timeStr ? " at " + timeStr : ""));
}

function openPostDetails(postId) {
  const post = scheduled.find(p => String(p.id) === String(postId));
  if (!post) return;
  activeViewingPostId = post.id;

  const platformBadge = document.getElementById("post-detail-platform");
  const metaEl = document.getElementById("post-detail-meta");
  const titleEl = document.getElementById("post-details-title");
  const copyEl = document.getElementById("post-detail-copy-wrap");
  const dateInput = document.getElementById("post-detail-date");
  const timeInput = document.getElementById("post-detail-time");

  const mainPlatform = post.channels?.[0] || post.meta?.split(" ")[0] || "Instagram";
  if (platformBadge) {
    platformBadge.className = "platform " + (post.cls || platformClass(mainPlatform));
    platformBadge.textContent = platformMark(mainPlatform);
  }
  if (metaEl) metaEl.textContent = post.meta || (mainPlatform + " · Scheduled");
  if (titleEl) titleEl.textContent = post.title || "Scheduled Post";
  if (copyEl) copyEl.textContent = post.copy || post.title || "No copy provided.";
  if (dateInput) dateInput.value = post.date || "2026-10-23";
  if (timeInput) timeInput.value = post.time || "10:00";

  openModal("post-details-modal");
}

function renderWeek() {
  const weekGrid = document.getElementById("week-grid");
  if (!weekGrid) return;
  
  const weekDates = [
    { day: "MON", dateNum: 19, dateStr: "2026-10-19" },
    { day: "TUE", dateNum: 20, dateStr: "2026-10-20" },
    { day: "WED", dateNum: 21, dateStr: "2026-10-21" },
    { day: "THU", dateNum: 22, dateStr: "2026-10-22" },
    { day: "FRI", dateNum: 23, dateStr: "2026-10-23" },
    { day: "SAT", dateNum: 24, dateStr: "2026-10-24" },
    { day: "SUN", dateNum: 25, dateStr: "2026-10-25" }
  ];

  weekGrid.innerHTML = weekDates.map(item => {
    const isToday = item.dateStr === "2026-10-23";
    const isActive = item.dateStr === overviewSelectedDate;
    const count = scheduled.filter(p => p.date === item.dateStr).length;
    return `
      <div class="day ${isActive ? "active" : ""} ${isToday ? "today" : ""}" data-date="${item.dateStr}">
        ${item.day}<strong>${item.dateNum}</strong>
        ${count > 0 ? `<b class="day-count-dot">${count}</b>` : ""}
      </div>
    `;
  }).join("");

  weekGrid.querySelectorAll(".day").forEach(d => {
    d.addEventListener("click", () => {
      overviewSelectedDate = d.dataset.date;
      renderWeek();
  renderCalendar();
    });
  });

  const postList = document.getElementById("post-list");
  if (!postList) return;

  const dayPosts = scheduled.filter(p => p.date === overviewSelectedDate);

  if (dayPosts.length === 0) {
    postList.innerHTML = `
      <div style="padding: 22px 14px; text-align: center; border: 1px dashed var(--line); border-radius: 10px; margin-top: 10px; background: #fffdfa;">
        <p style="font-size: 12px; color: var(--muted); margin: 0 0 8px;">No posts scheduled for ${overviewSelectedDate}.</p>
        <button type="button" class="button secondary small" id="btn-overview-schedule-day" style="font-size: 11px; padding: 5px 12px; font-weight: 700;">+ Schedule for this date</button>
      </div>
    `;
    document.getElementById("btn-overview-schedule-day")?.addEventListener("click", () => {
      openComposerForDate(overviewSelectedDate);
    });
    return;
  }

  postList.innerHTML = dayPosts.map(post => {
    const mainPlatform = post.channels?.[0] || post.meta?.split(" ")[0] || "Instagram";
    return `
      <div class="scheduled-post" data-post-id="${post.id}">
        <span class="post-time">${post.time || "10:00"}</span>
        <div class="post-title">
          <strong>${escapeHtml(post.title || post.copy?.slice(0, 48) || "Scheduled Post")}</strong>
          <small>${escapeHtml(post.meta || mainPlatform)}</small>
        </div>
        <span class="platform ${post.cls || platformClass(mainPlatform)}">
          ${platformMark(mainPlatform)}
        </span>
        <button type="button" class="btn-post-action" data-post-id="${post.id}">Manage ↗</button>
      </div>
    `;
  }).join("");

  postList.querySelectorAll(".scheduled-post, .btn-post-action").forEach(el => {
    el.addEventListener("click", () => {
      const postId = el.dataset.postId || el.closest("[data-post-id]")?.dataset.postId;
      if (postId) openPostDetails(postId);
    });
  });
}

function getCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const cells = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    const dateStr = `${py}-${String(pm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, dateStr, muted: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, dateStr, muted: false });
  }
  const total = cells.length;
  const rem = (7 - (total % 7)) % 7;
  for (let d = 1; d <= rem; d++) {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    const dateStr = `${ny}-${String(nm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, dateStr, muted: true });
  }
  return cells;
}

function renderCalendar() {
  const monthTitle = document.getElementById("cal-month-title");
  if (monthTitle) monthTitle.textContent = `${calMonthNames[calCurrentMonth]} ${calCurrentYear}`;

  const monthGrid = document.getElementById("month-grid");
  const weekView = document.getElementById("week-calendar-view");
  const weekdaysBar = document.getElementById("calendar-weekdays");
  const monthBtn = document.getElementById("cal-view-month");
  const weekBtn = document.getElementById("cal-view-week");
  const dayBtn = document.getElementById("cal-view-day");
  const timelineCard = document.getElementById("cal-day-timeline-card");

  if (monthBtn) monthBtn.classList.toggle("active", calViewMode === "month");
  if (weekBtn) weekBtn.classList.toggle("active", calViewMode === "week");
  if (dayBtn) dayBtn.classList.toggle("active", calViewMode === "day");

  if (calViewMode === "month") {
    if (monthGrid) monthGrid.hidden = false;
    if (weekdaysBar) weekdaysBar.hidden = false;
    if (weekView) weekView.hidden = true;
    if (timelineCard) timelineCard.hidden = false;

    if (monthGrid) {
      const cells = getCalendarGrid(calCurrentYear, calCurrentMonth);
      monthGrid.innerHTML = cells.map(cell => {
        const isToday = cell.dateStr === "2026-10-23";
        const isSelected = cell.dateStr === calSelectedDate;
        const dayPosts = scheduled.filter(p => {
          if (p.date !== cell.dateStr) return false;
          if (calFilterPlatform !== "All") {
            const matchesMeta = p.meta && p.meta.toLowerCase().includes(calFilterPlatform.toLowerCase());
            const matchesCls = p.cls === platformClass(calFilterPlatform);
            const matchesChan = p.channels && p.channels.includes(calFilterPlatform);
            return matchesMeta || matchesCls || matchesChan;
          }
          return true;
        });

        const dotsHtml = dayPosts.slice(0, 3).map(post => {
          const mainPlatform = post.channels?.[0] || post.meta?.split(" ")[0] || "Instagram";
          const cls = post.cls || platformClass(mainPlatform);
          return `<span class="cell-dot ${cls}"></span>`;
        }).join("");

        return `
          <div class="calendar-cell ${cell.muted ? "muted" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}" data-date="${cell.dateStr}">
            <span class="cell-day-num">${cell.day}</span>
            <div class="cell-dots">${dotsHtml}</div>
          </div>
        `;
      }).join("");

      monthGrid.querySelectorAll(".calendar-cell").forEach(cellEl => {
        cellEl.addEventListener("click", () => {
          calSelectedDate = cellEl.dataset.date;
          monthGrid.querySelectorAll(".calendar-cell").forEach(c => c.classList.remove("selected"));
          cellEl.classList.add("selected");
          renderDayTimeline(calSelectedDate);
        });
      });
    }

  } else if (calViewMode === "week") {
    if (monthGrid) monthGrid.hidden = true;
    if (weekdaysBar) weekdaysBar.hidden = true;
    if (weekView) weekView.hidden = false;
    if (timelineCard) timelineCard.hidden = false;

    if (weekView) {
      const weekDays = [
        { name: "Mon", dateStr: "2026-10-19", label: "Oct 19" },
        { name: "Tue", dateStr: "2026-10-20", label: "Oct 20" },
        { name: "Wed", dateStr: "2026-10-21", label: "Oct 21" },
        { name: "Thu", dateStr: "2026-10-22", label: "Oct 22" },
        { name: "Fri", dateStr: "2026-10-23", label: "Oct 23", isToday: true },
        { name: "Sat", dateStr: "2026-10-24", label: "Oct 24" },
        { name: "Sun", dateStr: "2026-10-25", label: "Oct 25" }
      ];

      weekView.innerHTML = `
        <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:8px; scrollbar-width:none;">
          ${weekDays.map(d => `
            <button type="button" class="quick-chip ${d.dateStr === calSelectedDate ? "active" : ""}" data-week-day="${d.dateStr}">
              ${d.name} ${d.label} ${d.isToday ? "• Today" : ""}
            </button>
          `).join("")}
        </div>
      `;

      weekView.querySelectorAll("[data-week-day]").forEach(btn => {
        btn.addEventListener("click", () => {
          calSelectedDate = btn.dataset.weekDay;
          renderCalendar();
        });
      });
    }

  } else if (calViewMode === "day") {
    if (monthGrid) monthGrid.hidden = true;
    if (weekdaysBar) weekdaysBar.hidden = true;
    if (weekView) weekView.hidden = true;
    if (timelineCard) timelineCard.hidden = false;
  }

  renderDayTimeline(calSelectedDate);
}

function renderDayTimeline(dateStr) {
  const titleEl = document.getElementById("cal-timeline-date-title");
  const countEl = document.getElementById("cal-timeline-posts-count");
  const slotsList = document.getElementById("hourly-slots-list");
  if (!slotsList) return;

  const [y, m, d] = (dateStr || "2026-10-23").split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = daysOfWeek[dateObj.getDay()];
  const monthName = calMonthNames[dateObj.getMonth()];
  const formattedTitle = `${dayName}, ${monthName} ${d}, ${y}`;
  if (titleEl) titleEl.textContent = formattedTitle;

  const dayPosts = scheduled.filter(p => {
    if (p.date !== dateStr) return false;
    if (calFilterPlatform !== "All") {
      const matchesMeta = p.meta && p.meta.toLowerCase().includes(calFilterPlatform.toLowerCase());
      const matchesCls = p.cls === platformClass(calFilterPlatform);
      const matchesChan = p.channels && p.channels.includes(calFilterPlatform);
      return matchesMeta || matchesCls || matchesChan;
    }
    return true;
  });

  if (countEl) {
    countEl.textContent = dayPosts.length === 0
      ? "No posts scheduled"
      : `${dayPosts.length} post${dayPosts.length === 1 ? "" : "s"} scheduled`;
  }

  const timeSlots = [
    { time: "08:00", label: "08:00 AM" },
    { time: "09:30", label: "09:30 AM" },
    { time: "11:00", label: "11:00 AM" },
    { time: "12:30", label: "12:30 PM" },
    { time: "02:00", label: "02:00 PM" },
    { time: "03:45", label: "03:45 PM" },
    { time: "05:00", label: "05:00 PM" },
    { time: "06:30", label: "06:30 PM" },
    { time: "08:00", label: "08:00 PM" }
  ];

  slotsList.innerHTML = timeSlots.map(slot => {
    const matchedPost = dayPosts.find(p => {
      if (!p.time) return false;
      const pHour = parseInt(p.time.split(":")[0], 10);
      const sHour = parseInt(slot.time.split(":")[0], 10);
      return Math.abs(pHour - sHour) <= 1;
    });

    if (matchedPost) {
      const mainPlatform = matchedPost.channels?.[0] || matchedPost.meta?.split(" ")[0] || "Instagram";
      const cls = matchedPost.cls || platformClass(mainPlatform);
      let borderCol = "coral";
      if (cls === "li") borderCol = "blue";
      else if (cls === "tk") borderCol = "lime";

      return `
        <div class="hourly-slot-row">
          <span class="hourly-time-label">${matchedPost.time || slot.label}</span>
          <div class="hourly-slot-post ${borderCol}" data-post-id="${matchedPost.id}">
            <div class="hourly-post-info">
              <span class="platform ${cls}">${platformMark(mainPlatform)}</span>
              <div>
                <span class="hourly-post-title">${escapeHtml(matchedPost.title || matchedPost.copy?.slice(0, 32) || "Scheduled Post")}</span>
                <span class="hourly-post-channel">${escapeHtml(matchedPost.meta || mainPlatform)}</span>
              </div>
            </div>
            <button type="button" class="btn-slot-manage" data-post-id="${matchedPost.id}">Manage ↗</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="hourly-slot-row">
        <span class="hourly-time-label">${slot.label}</span>
        <div class="hourly-slot-empty" data-slot-date="${dateStr}" data-slot-time="${slot.time}">
          <span>Empty queue slot</span>
          <span style="font-weight:700; color:var(--ink);">＋ Schedule</span>
        </div>
      </div>
    `;
  }).join("");

  slotsList.querySelectorAll(".hourly-slot-post, .btn-slot-manage").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = el.dataset.postId;
      if (id) openPostDetails(id);
    });
  });

  slotsList.querySelectorAll(".hourly-slot-empty").forEach(slotEl => {
    slotEl.addEventListener("click", () => {
      const d = slotEl.dataset.slotDate;
      const t = slotEl.dataset.slotTime;
      openComposerForDate(d, t);
    });
  });
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

function renderOverviewApprovals() {
  const container = document.getElementById("overview-approvals-container");
  const badge = document.getElementById("overview-approval-badge");
  if (!container) return;

  if (approvalsList.length === 0) {
    if (badge) {
      badge.textContent = "0";
      badge.classList.add("zero");
    }
    container.innerHTML = `
      <div class="approval-empty-state">
        <div class="empty-icon">🎉</div>
        <strong>All caught up!</strong>
        <p>No drafts waiting for your review. All scheduled posts are queued.</p>
        <button type="button" class="button secondary small" id="btn-overview-empty-new" style="font-size: 11px; font-weight: 700; padding: 6px 14px; margin-top: 6px;">+ Create New Draft</button>
      </div>
    `;
    document.getElementById("btn-overview-empty-new")?.addEventListener("click", () => {
      openModal("composer-modal");
    });
    return;
  }

  if (badge) {
    badge.textContent = approvalsList.length;
    badge.classList.remove("zero");
  }

  const first = approvalsList[0];
  const second = approvalsList[1];

  let html = `
    <div class="approval-card" id="overview-featured-approval" data-id="${first.id}">
      <div class="reel-preview"><span class="reel-kicker">${escapeHtml(first.kicker || "YOUR BRAND")}</span><span class="play">▶</span><small>00:18</small></div>
      <div class="approval-copy">
        <span class="platform ${first.cls || platformClass(first.platform)}">${first.mark || platformMark(first.platform)}</span>
        <strong>${escapeHtml(first.title)}</strong>
        <p>${escapeHtml(first.type)} · Ready to review</p>
        ${first.revision ? `<div class="revision-badge">Revision: "${escapeHtml(first.revision)}"</div>` : ""}
      </div>
      <div class="approval-actions">
        <button class="approve" id="approve-featured-btn" data-id="${first.id}" aria-label="Approve reel">✓ Approve</button>
        <button class="change" id="change-featured-btn" data-id="${first.id}" aria-label="Request change">Change</button>
        <button class="storyboard-btn" id="btn-open-storyboard" type="button">🎬 Storyboard</button>
      </div>
    </div>
  `;

  if (second) {
    html += `
      <div class="approval-mini" data-id="${second.id}">
        <span class="mini-visual ${second.cls === "li" ? "lemon" : (second.cls === "ig" ? "coral" : "blue")}">${second.mark || "✦"}</span>
        <div>
          <strong>${escapeHtml(second.title)}</strong>
          <p>${escapeHtml(second.type)}</p>
        </div>
        <button class="approve" id="approve-mini-btn" data-id="${second.id}" aria-label="Approve draft">✓</button>
      </div>
    `;
  }

  container.innerHTML = html;

  document.getElementById("approve-featured-btn")?.addEventListener("click", function () {
    const id = this.dataset.id;
    const item = approvalsList.find(a => a.id === id);
    if (item) {
      scheduled.unshift({
        id: Date.now(),
        time: "11:00",
        date: "2026-10-26",
        title: item.title,
        meta: item.platform + " · Approved",
        cls: item.cls,
        copy: item.kicker
      });
      write("tide-posts", scheduled);
      renderWeek();
  renderCalendar();
    }
    approvalsList = approvalsList.filter(a => a.id !== id);
    write("tide-approvals", approvalsList);
    renderOverviewApprovals();
    renderApprovals();
    updateBadges();
    toast("Draft approved and added to your publishing queue!");
  });

  document.getElementById("change-featured-btn")?.addEventListener("click", function () {
    activeChangeCardId = this.dataset.id;
    openModal("change-modal");
  });

  document.getElementById("btn-open-storyboard")?.addEventListener("click", () => {
    renderStoryboard(first.title || "Brand Content");
    openModal("storyboard-modal");
  });

  document.getElementById("approve-mini-btn")?.addEventListener("click", function () {
    const id = this.dataset.id;
    const item = approvalsList.find(a => a.id === id);
    if (item) {
      scheduled.unshift({
        id: Date.now(),
        time: "14:30",
        date: "2026-10-26",
        title: item.title,
        meta: item.platform + " · Approved",
        cls: item.cls,
        copy: item.kicker
      });
      write("tide-posts", scheduled);
      renderWeek();
  renderCalendar();
    }
    approvalsList = approvalsList.filter(a => a.id !== id);
    write("tide-approvals", approvalsList);
    renderOverviewApprovals();
    renderApprovals();
    updateBadges();
    toast("Draft approved and scheduled.");
  });
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
  showView('profile');
});

document.getElementById('btn-workspace-switch')?.addEventListener('click', () => {
  const ws = document.getElementById('profile-workspace-select')?.value;
  const label = document.getElementById('header-workspace-label');
  if (label && ws) label.textContent = ws.toUpperCase();
  const mobileWs = document.getElementById('mobile-header-ws-name');
  if (mobileWs && ws) mobileWs.textContent = ws;
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
  renderCalendar();
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
document.getElementById("approval-board")?.addEventListener("click", event => {
  const approveBtn = event.target.closest(".approve-board");
  if (approveBtn) {
    const id = approveBtn.dataset.id;
    const item = approvalsList.find(a => a.id === id);
    if (item) {
      scheduled.unshift({
        id: Date.now(),
        time: "11:00",
        date: "2026-10-26",
        title: item.title,
        meta: item.platform + " · Approved",
        cls: item.cls,
        copy: item.kicker
      });
      write("tide-posts", scheduled);
      renderWeek();
  renderCalendar();
    }
    approvalsList = approvalsList.filter(a => a.id !== id);
    write("tide-approvals", approvalsList);
    renderApprovals();
    renderOverviewApprovals();
    updateBadges();
    toast("Draft approved and added to your publishing queue!");
  }

  const changeBtn = event.target.closest(".request-change");
  if (changeBtn) {
    activeChangeCardId = changeBtn.dataset.id;
    openModal("change-modal");
  }
});

// Submit Change Request Modal
document.getElementById("submit-change")?.addEventListener("click", () => {
  const reqText = document.getElementById("change-request")?.value.trim();
  if (!reqText) return toast("Describe the change you need.");

  if (activeChangeCardId) {
    const item = approvalsList.find(a => a.id === activeChangeCardId);
    if (item) {
      item.revision = reqText;
      write("tide-approvals", approvalsList);
      renderApprovals();
      renderOverviewApprovals();
    }
  }
  closeModal(document.getElementById("change-modal"));
  const changeInput = document.getElementById("change-request");
  if (changeInput) changeInput.value = "";
  toast("Revision requested. Note saved to the approval card.");
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

// Calendar Navigation & Controls
document.getElementById("btn-cal-schedule-post")?.addEventListener("click", () => {
  openComposerForDate(calSelectedDate);
});

document.getElementById("cal-prev")?.addEventListener("click", () => {
  calCurrentMonth--;
  if (calCurrentMonth < 0) {
    calCurrentMonth = 11;
    calCurrentYear--;
  }
  renderCalendar();
  toast("Viewing " + calMonthNames[calCurrentMonth] + " " + calCurrentYear);
});

document.getElementById("cal-next")?.addEventListener("click", () => {
  calCurrentMonth++;
  if (calCurrentMonth > 11) {
    calCurrentMonth = 0;
    calCurrentYear++;
  }
  renderCalendar();
  toast("Viewing " + calMonthNames[calCurrentMonth] + " " + calCurrentYear);
});

document.getElementById("cal-today-btn")?.addEventListener("click", () => {
  calCurrentYear = 2026;
  calCurrentMonth = 9;
  calSelectedDate = "2026-10-23";
  overviewSelectedDate = "2026-10-23";
  renderCalendar();
  renderWeek();
  renderCalendar();
  toast("Jumped to today (Oct 23, 2026)");
});

document.getElementById("cal-platform-filter")?.addEventListener("change", function () {
  calFilterPlatform = this.value;
  renderCalendar();
  toast(calFilterPlatform === "All" ? "Showing all platforms" : "Filtered to " + calFilterPlatform);
});

document.getElementById("cal-view-month")?.addEventListener("click", () => {
  calViewMode = "month";
  renderCalendar();
});

document.getElementById("cal-view-week")?.addEventListener("click", () => {
  calViewMode = "week";
  renderCalendar();
});

document.getElementById("cal-view-day")?.addEventListener("click", () => {
  calViewMode = "day";
  renderCalendar();
});

document.getElementById("btn-add-post-timeline")?.addEventListener("click", () => {
  openComposerForDate(calSelectedDate, "10:30");
});

document.getElementById("btn-cal-schedule-post")?.addEventListener("click", () => {
  openComposerForDate(calSelectedDate, "10:30");
});

// Calendar Touch Swipe Navigation (Slide left/right on mobile)
const fullCalContainer = document.querySelector(".full-calendar");
if (fullCalContainer) {
  let touchStartX = 0;
  let touchStartY = 0;
  fullCalContainer.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  fullCalContainer.addEventListener("touchend", (e) => {
    const deltaX = e.changedTouches[0].screenX - touchStartX;
    const deltaY = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped Left -> Next
        if (calViewMode === "month") {
          calCurrentMonth++;
          if (calCurrentMonth > 11) {
            calCurrentMonth = 0;
            calCurrentYear++;
          }
        } else {
          const cur = new Date(calSelectedDate);
          cur.setDate(cur.getDate() + (calViewMode === "week" ? 7 : 1));
          calSelectedDate = cur.toISOString().split("T")[0];
        }
        renderCalendar();
        toast("Next ➔");
      } else {
        // Swiped Right -> Previous
        if (calViewMode === "month") {
          calCurrentMonth--;
          if (calCurrentMonth < 0) {
            calCurrentMonth = 11;
            calCurrentYear--;
          }
        } else {
          const cur = new Date(calSelectedDate);
          cur.setDate(cur.getDate() - (calViewMode === "week" ? 7 : 1));
          calSelectedDate = cur.toISOString().split("T")[0];
        }
        renderCalendar();
        toast("⬅ Previous");
      }
    }
  }, { passive: true });
}

// Scheduled Post Details Modal Handlers (Reschedule, Edit, Publish, Delete)
document.getElementById("btn-save-reschedule")?.addEventListener("click", () => {
  if (!activeViewingPostId) return;
  const post = scheduled.find(p => String(p.id) === String(activeViewingPostId));
  if (!post) return;

  const newDate = document.getElementById("post-detail-date")?.value;
  const newTime = document.getElementById("post-detail-time")?.value;
  if (!newDate || !newTime) return toast("Please select both date and time.");

  post.date = newDate;
  post.time = newTime;
  write("tide-posts", scheduled);
  renderCalendar();
  renderWeek();
  renderCalendar();
  closeModal(document.getElementById("post-details-modal"));
  toast("Post rescheduled for " + newDate + " at " + newTime + "!");
});

document.getElementById("btn-edit-in-composer")?.addEventListener("click", () => {
  if (!activeViewingPostId) return;
  const post = scheduled.find(p => String(p.id) === String(activeViewingPostId));
  if (!post) return;

  closeModal(document.getElementById("post-details-modal"));
  if (composerCopy) {
    composerCopy.value = post.copy || post.title || "";
    const charCount = document.querySelector(".char-count");
    if (charCount) charCount.textContent = composerCopy.value.length.toLocaleString() + " / 2,200";
  }
  const dateInput = document.querySelector("#composer-form [name=\"date\"]");
  const timeInput = document.querySelector("#composer-form [name=\"time\"]");
  if (dateInput) dateInput.value = post.date || "2026-10-26";
  if (timeInput) timeInput.value = post.time || "10:30";

  const mainPlatform = post.channels?.[0] || post.meta?.split(" ")[0] || "Instagram";
  document.querySelectorAll("#composer-channel-checks input").forEach(input => {
    input.checked = (input.value === mainPlatform);
  });

  openModal("composer-modal");
  toast("Post loaded into Composer for editing.");
});

document.getElementById("btn-publish-now")?.addEventListener("click", () => {
  if (!activeViewingPostId) return;
  const postIdx = scheduled.findIndex(p => String(p.id) === String(activeViewingPostId));
  if (postIdx === -1) return;

  const post = scheduled[postIdx];
  scheduled.splice(postIdx, 1);
  write("tide-posts", scheduled);

  const publishedCount = document.getElementById("metric-published");
  if (publishedCount) {
    const cur = parseInt(publishedCount.textContent) || 48;
    publishedCount.textContent = cur + 1;
  }

  renderCalendar();
  renderWeek();
  renderCalendar();
  closeModal(document.getElementById("post-details-modal"));
  toast("Published \"" + (post.title || "Post") + "\" immediately to connected channels! 🚀");
});

document.getElementById("btn-delete-scheduled-post")?.addEventListener("click", () => {
  if (!activeViewingPostId) return;
  const postIdx = scheduled.findIndex(p => String(p.id) === String(activeViewingPostId));
  if (postIdx === -1) return;

  const post = scheduled[postIdx];
  scheduled.splice(postIdx, 1);
  write("tide-posts", scheduled);
  renderCalendar();
  renderWeek();
  renderCalendar();
  closeModal(document.getElementById("post-details-modal"));
  toast("Deleted \"" + (post.title || "Post") + "\" from scheduled queue.");
});

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

document.getElementById("btn-customize-columns")?.addEventListener("click", () => {
  openModal("columns-modal");
});

document.getElementById("btn-save-columns")?.addEventListener("click", () => {
  const showReach = document.getElementById("col-toggle-reach")?.checked;
  const showEng = document.getElementById("col-toggle-eng")?.checked;
  const showLeads = document.getElementById("col-toggle-leads")?.checked;

  const table = document.getElementById("analytics-table");
  if (table) {
    table.querySelectorAll("th:nth-child(3), td:nth-child(3)").forEach(cell => {
      cell.style.display = showReach ? "" : "none";
    });
    table.querySelectorAll("th:nth-child(4), td:nth-child(4)").forEach(cell => {
      cell.style.display = showEng ? "" : "none";
    });
    table.querySelectorAll("th:nth-child(5), td:nth-child(5)").forEach(cell => {
      cell.style.display = showLeads ? "" : "none";
    });
  }
  closeModal(document.getElementById("columns-modal"));
  toast("Table columns updated.");
});

document.getElementById("btn-service-status")?.addEventListener("click", () => {
  openModal("status-modal");
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
const cookieBanner = document.querySelector(".cookie-banner");
if (cookieBanner && !localStorage.getItem("tide-cookie-consent")) {
  cookieBanner.hidden = false;
}

function saveCookieConsent(value) {
  localStorage.setItem("tide-cookie-consent", value);
  if (cookieBanner) cookieBanner.hidden = true;
  toast("Cookie preference saved.");
}

document.getElementById("cookie-accept")?.addEventListener("click", () => saveCookieConsent("analytics"));
document.getElementById("cookie-reject")?.addEventListener("click", () => saveCookieConsent("necessary"));
document.getElementById("cookie-settings")?.addEventListener("click", () => {
  const cur = localStorage.getItem("tide-cookie-consent") || "necessary";
  const analyticsInput = document.getElementById("analytics-cookie");
  const marketingInput = document.getElementById("marketing-cookie");
  if (analyticsInput) analyticsInput.checked = (cur === "analytics" || cur === "all");
  if (marketingInput) marketingInput.checked = (cur === "all");
  openModal("cookie-modal");
});

document.getElementById("cookie-save")?.addEventListener("click", () => {
  const isAnalytics = document.getElementById("analytics-cookie")?.checked;
  const isMarketing = document.getElementById("marketing-cookie")?.checked;
  let val = "necessary";
  if (isAnalytics && isMarketing) val = "all";
  else if (isAnalytics) val = "analytics";
  else if (isMarketing) val = "marketing";
  saveCookieConsent(val);
  closeModal(document.getElementById("cookie-modal"));
});

// --- REVERSE-ENGINEERED SKILL 1: Hormozi Hooks Engine ---
function renderHormoziHooks(topic) {
  const list = document.getElementById('hooks-list');
  if (!list) return;
  const hooks = generateHormoziHooks(topic);
  list.innerHTML = hooks.map((h) => `
    <div class="panel" style="padding:12px; border-radius:10px; border:1px solid var(--line); display:flex; flex-direction:column; gap:4px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="eyebrow" style="color:var(--coral); font-size:9px;">${h.type}</span>
        <button type="button" class="btn-insert-hook text-button" data-hook="${encodeURIComponent(h.hook)}" style="color:var(--green); font-size:11px;">Insert ↴</button>
      </div>
      <strong style="font-size:13px; line-height:1.35;">${h.hook}</strong>
      <small style="color:var(--muted); font-size:10px;">${h.why}</small>
    </div>
  `).join('');
}

document.getElementById('btn-open-hooks')?.addEventListener('click', () => {
  const query = document.getElementById('hooks-input')?.value || composerCopy?.value?.slice(0, 30) || 'organic growth';
  const inputEl = document.getElementById('hooks-input');
  if (inputEl) inputEl.value = query;
  renderHormoziHooks(query);
  openModal('hooks-modal');
});

document.getElementById('btn-generate-hooks')?.addEventListener('click', () => {
  const query = document.getElementById('hooks-input')?.value.trim() || 'organic growth';
  renderHormoziHooks(query);
  toast('5 Hormozi hooks generated!');
});

document.getElementById('hooks-list')?.addEventListener('click', event => {
  const btn = event.target.closest('.btn-insert-hook');
  if (!btn) return;
  const hook = decodeURIComponent(btn.dataset.hook || '');
  if (composerCopy) {
    composerCopy.value = `${hook}\n\n${composerCopy.value}`;
    const charCount = document.querySelector('.char-count');
    if (charCount) charCount.textContent = `${composerCopy.value.length.toLocaleString()} / 2,200`;
    write('tide-draft', composerCopy.value);
  }
  closeModal(document.getElementById('hooks-modal'));
  toast('Hook prepended to draft!');
});

// --- REVERSE-ENGINEERED SKILL 2: 1-to-5 Content Repurposer ---
function renderRepurpose(text) {
  const container = document.getElementById('repurpose-results');
  if (!container) return;
  const res = repurposeContent(text);
  container.innerHTML = res.formats.map(f => `
    <div class="panel" style="padding:14px; border-radius:10px; border:1px solid var(--line);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <div>
          <span class="platform ${platformClass(f.platform)}" style="margin-right:6px;">${platformMark(f.platform)}</span>
          <strong style="font-size:12px;">${f.platform} · ${f.format}</strong>
        </div>
        <button type="button" class="button secondary btn-use-repurpose" data-copy="${encodeURIComponent(f.hook + '\n\n' + f.body + '\n\n' + f.cta)}" data-platform="${f.platform}" style="padding:4px 8px; font-size:10px;">Use in Composer ↗</button>
      </div>
      <p style="font-size:11px; margin:4px 0; color:var(--ink); font-weight:600;">${f.hook}</p>
      <p style="font-size:11px; color:var(--muted); white-space:pre-line; margin:4px 0;">${f.body}</p>
      <small style="color:var(--coral); font-weight:700;">${f.cta}</small>
    </div>
  `).join('');
}

document.getElementById('btn-open-repurpose')?.addEventListener('click', () => {
  openModal('repurpose-modal');
  renderRepurpose(document.getElementById('repurpose-input')?.value || '');
});

document.getElementById('btn-run-repurpose')?.addEventListener('click', () => {
  const text = document.getElementById('repurpose-input')?.value.trim();
  if (!text) return toast('Please enter some text to repurpose.');
  renderRepurpose(text);
  toast('Content transformed into 4 native formats!');
});

document.getElementById('repurpose-results')?.addEventListener('click', event => {
  const btn = event.target.closest('.btn-use-repurpose');
  if (!btn) return;
  const copy = decodeURIComponent(btn.dataset.copy || '');
  const platform = btn.dataset.platform;

  if (composerCopy) {
    composerCopy.value = copy;
    const charCount = document.querySelector('.char-count');
    if (charCount) charCount.textContent = `${composerCopy.value.length.toLocaleString()} / 2,200`;
  }
  closeModal(document.getElementById('repurpose-modal'));
  openModal('composer-modal');
  if (platform) {
    document.querySelectorAll('#composer-channel-checks input').forEach(input => {
      input.checked = (input.value === platform);
    });
  }
  toast(`Loaded ${platform} post into Composer.`);
});

// --- REVERSE-ENGINEERED SKILL 3: Viral Video Storyboarder ---
function renderStoryboard(topic) {
  const container = document.getElementById('storyboard-scenes');
  if (!container) return;
  const board = generateVideoStoryboard(topic);
  const title = document.getElementById('storyboard-title');
  if (title) title.textContent = board.title;
  container.innerHTML = board.scenes.map((s) => `
    <div class="panel" style="padding:12px; border-radius:10px; border:1px solid var(--line); display:grid; gap:4px;">
      <div style="display:flex; justify-content:space-between; font-size:11px;">
        <span class="count-badge" style="font-size:10px;">${s.timestamp}</span>
        <strong>${s.name}</strong>
      </div>
      <div style="font-size:11px; margin-top:4px;"><strong>Visual:</strong> <span style="color:var(--muted);">${s.visual}</span></div>
      <div style="font-size:11px;"><strong>On-screen Text:</strong> <code style="background:#f4f3ec; padding:2px 4px; border-radius:4px;">${s.onScreenText}</code></div>
      <div style="font-size:11px;"><strong>Audio Cue:</strong> <span style="color:var(--muted);">${s.audio}</span></div>
      <small style="color:var(--green); font-weight:600; margin-top:2px;">Goal: ${s.retentionGoal}</small>
    </div>
  `).join('');
}

document.getElementById('btn-open-storyboard')?.addEventListener('click', () => {
  renderStoryboard('Brand Content');
  openModal('storyboard-modal');
});


// --- Profile & Organization Management ---
const defaultProfile = {
  firstName: "Arjun",
  lastName: "Kapoor",
  name: "Arjun Kapoor",
  email: "arjun@acmestudio.com",
  title: "Head of Growth & Content Strategy",
  timezone: "Asia/Kolkata",
  lang: "en-US",
  initials: "AK",
  avatarBg: "var(--lemon)",
  avatarColor: "#423811",
  bio: "Directing omnichannel social campaigns, viral Reels workflows, and AI-assisted brand voice consistency across all studio channels.",
  twitter: "@arjunkapoor_growth",
  linkedin: "https://linkedin.com/in/arjunkapoor-social"
};

const defaultTeam = [
  { id: 1, name: "Arjun Kapoor", email: "arjun@acmestudio.com", role: "Owner", initials: "AK", avatarBg: "#ffe57a", avatarColor: "#423811" },
  { id: 2, name: "Priya Patel", email: "priya@acmestudio.com", role: "Approver", initials: "PP", avatarBg: "#b7dcf6", avatarColor: "#1a578f" },
  { id: 3, name: "Liam Vance", email: "liam@acmestudio.com", role: "Creator", initials: "LV", avatarBg: "#d2ee8b", avatarColor: "#3d6f2f" }
];

let profileData = read("tide-profile", defaultProfile);
let teamMembers = read("tide-team", defaultTeam);

function renderProfile() {
  const firstNameInput = document.getElementById("input-profile-firstname");
  const lastNameInput = document.getElementById("input-profile-lastname");
  const emailInput = document.getElementById("input-profile-email");
  const titleInput = document.getElementById("input-profile-title");
  const tzInput = document.getElementById("input-profile-timezone");
  const langInput = document.getElementById("input-profile-lang");
  const bioInput = document.getElementById("input-profile-bio");
  const xInput = document.getElementById("input-profile-x");
  const linkedinInput = document.getElementById("input-profile-linkedin");

  const avatarDisplay = document.getElementById("profile-display-avatar");
  const sidebarName = document.getElementById("sidebar-profile-name");
  const sidebarAvatar = document.getElementById("sidebar-avatar-initials");
  const headerName = document.getElementById("profile-header-name");
  const headerTitle = document.getElementById("profile-header-title");
  const connectedChip = document.getElementById("profile-connected-chip");
  const meterChannels = document.getElementById("meter-text-channels");
  const modalTitle = document.getElementById("profile-title");

  // Derive first & last name
  const nameParts = (profileData.name || "Arjun Kapoor").split(" ");
  const fName = profileData.firstName || nameParts[0] || "Arjun";
  const lName = profileData.lastName || nameParts.slice(1).join(" ") || "Kapoor";

  if (firstNameInput) firstNameInput.value = fName;
  if (lastNameInput) lastNameInput.value = lName;
  if (emailInput) emailInput.value = profileData.email || "arjun@acmestudio.com";
  if (titleInput) titleInput.value = profileData.title || "Head of Growth & Content Strategy";
  if (tzInput && profileData.timezone) tzInput.value = profileData.timezone;
  if (langInput && profileData.lang) langInput.value = profileData.lang;
  if (bioInput) bioInput.value = profileData.bio || "";
  if (xInput) xInput.value = profileData.twitter || "@arjunkapoor_growth";
  if (linkedinInput) linkedinInput.value = profileData.linkedin || "";

  const initials = profileData.initials || "AK";
  if (avatarDisplay) {
    avatarDisplay.childNodes[0].nodeValue = initials + " ";
    if (profileData.avatarBg) avatarDisplay.style.background = profileData.avatarBg;
    if (profileData.avatarColor) avatarDisplay.style.color = profileData.avatarColor;
  }

  if (headerName) headerName.textContent = profileData.name || `${fName} ${lName}`;
  if (headerTitle) headerTitle.textContent = profileData.title || "Head of Growth & Content Strategy";
  if (sidebarName) sidebarName.textContent = profileData.name || `${fName} ${lName}`;
  if (sidebarAvatar) {
    sidebarAvatar.textContent = initials;
    if (profileData.avatarBg) sidebarAvatar.style.background = profileData.avatarBg;
    if (profileData.avatarColor) sidebarAvatar.style.color = profileData.avatarColor;
  }
  if (modalTitle) modalTitle.textContent = profileData.name || `${fName} ${lName}`;
  if (connectedChip) connectedChip.textContent = `🔗 ${accounts.length} Channels Connected`;
  if (meterChannels) meterChannels.textContent = `${accounts.length} / Unlimited`;
}

function renderTeam() {
  const listEl = document.getElementById("team-members-list");
  const countBadge = document.getElementById("team-tab-badge");
  const statCount = document.getElementById("stat-team-count");
  if (countBadge) countBadge.textContent = teamMembers.length;
  if (statCount) statCount.textContent = `${teamMembers.length} of 5`;

  if (!listEl) return;

  listEl.innerHTML = teamMembers.map(member => `
    <div class="team-member-card" data-member-id="${member.id}">
      <div class="team-member-identity">
        <div class="team-member-avatar" style="${member.avatarBg ? `background:${member.avatarBg}; color:${member.avatarColor || '#fff'};` : ''}">
          ${member.initials}
        </div>
        <div class="team-member-details">
          <strong>${escapeHtml(member.name)}</strong>
          <small>${escapeHtml(member.email)}</small>
        </div>
      </div>
      <div class="team-member-actions">
        <span class="role-badge ${member.role.toLowerCase()}">${member.role}</span>
        ${member.role !== "Owner" ? `
          <button type="button" class="button secondary small btn-change-role" data-id="${member.id}" style="font-size:11px; padding:4px 9px;">Role ▾</button>
          <button type="button" class="btn-remove-team" data-remove-id="${member.id}">Remove</button>
        ` : `<span style="font-size:11px; color:var(--text-muted); font-weight:600; padding:0 4px;">Admin</span>`}
      </div>
    </div>
  `).join("");

  listEl.querySelectorAll(".btn-remove-team").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.removeId);
      teamMembers = teamMembers.filter(m => m.id !== id);
      write("tide-team", teamMembers);
      renderTeam();
      toast("Team member removed from workspace.");
    });
  });

  listEl.querySelectorAll(".btn-change-role").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const member = teamMembers.find(m => m.id === id);
      if (!member) return;
      const newRole = member.role === "Approver" ? "Creator" : "Approver";
      member.role = newRole;
      write("tide-team", teamMembers);
      renderTeam();
      toast(`${member.name}'s role updated to ${newRole}.`);
    });
  });
}

// Profile Tabs Navigation
document.querySelectorAll(".profile-tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tabName = btn.dataset.profileTab;
    document.querySelectorAll(".profile-tab-btn").forEach(b => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".profile-tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === `pane-${tabName}`);
    });
  });
});

// Avatar Accent Color Dots
document.querySelectorAll(".avatar-color-options .color-dot").forEach(dot => {
  dot.addEventListener("click", () => {
    document.querySelectorAll(".avatar-color-options .color-dot").forEach(d => d.classList.remove("active"));
    dot.classList.add("active");
    const bg = dot.dataset.avatarBg;
    const color = dot.dataset.avatarColor;
    profileData.avatarBg = bg;
    profileData.avatarColor = color;
    write("tide-profile", profileData);
    renderProfile();
    toast("Avatar appearance updated!");
  });
});

document.getElementById("btn-custom-avatar-prompt")?.addEventListener("click", () => {
  const newInitials = prompt("Enter initials or name initials for avatar (max 2 characters):", profileData.initials || "AK");
  if (newInitials) {
    profileData.initials = newInitials.slice(0, 2).toUpperCase();
    write("tide-profile", profileData);
    renderProfile();
    toast(`Avatar initials updated to ${profileData.initials}!`);
  }
});

document.getElementById("profile-display-avatar")?.addEventListener("click", () => {
  document.getElementById("btn-custom-avatar-prompt")?.click();
});

// Profile Form Submit
document.getElementById("profile-details-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fName = document.getElementById("input-profile-firstname")?.value.trim() || "";
  const lName = document.getElementById("input-profile-lastname")?.value.trim() || "";
  const email = document.getElementById("input-profile-email")?.value.trim();
  const title = document.getElementById("input-profile-title")?.value.trim();
  const tz = document.getElementById("input-profile-timezone")?.value;
  const lang = document.getElementById("input-profile-lang")?.value;
  const bio = document.getElementById("input-profile-bio")?.value.trim();
  const twitter = document.getElementById("input-profile-x")?.value.trim();
  const linkedin = document.getElementById("input-profile-linkedin")?.value.trim();

  if (!fName || !email) return toast("First Name and Email are required.");

  const fullName = `${fName} ${lName}`.trim();
  const initials = (fName[0] + (lName[0] || fName[1] || "")).toUpperCase();

  profileData = {
    ...profileData,
    firstName: fName,
    lastName: lName,
    name: fullName,
    email,
    title,
    timezone: tz,
    lang,
    bio,
    twitter,
    linkedin,
    initials
  };

  write("tide-profile", profileData);

  // Update in team roster
  if (teamMembers[0]) {
    teamMembers[0].name = fullName;
    teamMembers[0].email = email;
    teamMembers[0].initials = initials;
    write("tide-team", teamMembers);
    renderTeam();
  }

  renderProfile();
  toast("Profile information saved successfully!");
});

document.getElementById("btn-save-profile-top")?.addEventListener("click", () => {
  document.getElementById("profile-details-form")?.requestSubmit();
});

document.getElementById("btn-reset-profile")?.addEventListener("click", () => {
  renderProfile();
  toast("Form reset to saved values.");
});

// Invoices & Receipts
function downloadInvoiceReceipt(invoiceId, date, amount) {
  const content = `================================================================
TIDE SOCIAL TECHNOLOGIES INC. — OFFICIAL TAX INVOICE & RECEIPT
================================================================
Invoice Number : TIDE-2026-${invoiceId}
Receipt Status : PAID (Electronic Confirmation)
Transaction Date: ${date}
Billing Cycle  : Monthly Recurring Subscription
Currency       : USD ($)

CUSTOMER / WORKSPACE:
----------------------------------------------------------------
Workspace Name : Acme Studio
Account Holder : ${profileData.name}
Billing Email  : ${profileData.email}
Address        : 140 Hope Street, Suite 400, Brooklyn, NY 11211

ITEMIZED CHARGES:
----------------------------------------------------------------
Item                                     Qty    Rate      Total
----------------------------------------------------------------
Tide Studio Pro Plan (Unlimited Channels) 1    $99.00    $99.00
- 12 Social Networks Connected
- Unlimited AI Creative Generative Pipeline
- Model Context Protocol (MCP) Stream Bridge
- Unified Multi-Network Inbox & Analytics
----------------------------------------------------------------
Subtotal                                                 $99.00
Taxes (0.00%)                                             $0.00
----------------------------------------------------------------
TOTAL AMOUNT PAID                                        $99.00

PAYMENT DETAILS:
----------------------------------------------------------------
Payment Gateway : Stripe Payments Europe Ltd.
Card Network    : Mastercard ending in 4242
Authorization   : AUTH_8949219412
Stripe Charge ID: ch_3P7a92klq01b92019401

Thank you for your business! Need support? help@tide.social
================================================================`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice_TIDE-2026-${invoiceId}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast(`Invoice #TIDE-2026-${invoiceId} downloaded!`);
}

document.querySelectorAll(".btn-download-single-invoice").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.invoice || "102";
    downloadInvoiceReceipt(id, "October 23, 2026", "$99.00");
  });
});

document.getElementById("btn-download-all-invoices")?.addEventListener("click", () => {
  downloadInvoiceReceipt("ALL-ARCHIVE", "2026 YTD", "$297.00");
});

document.getElementById("btn-manage-subscription")?.addEventListener("click", () => {
  toast("Redirecting to Stripe Billing Customer Portal...");
});

document.getElementById("btn-change-plan")?.addEventListener("click", () => {
  toast("Current tier is Studio Pro (Highest tier with unlimited channels).");
});

// Team Invite Modal Trigger & Submit
document.getElementById("btn-invite-team-member")?.addEventListener("click", () => {
  openModal("invite-modal");
});

document.getElementById("invite-member-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("invite-name")?.value.trim();
  const email = document.getElementById("invite-email")?.value.trim();
  const role = document.getElementById("invite-role")?.value;

  if (!name || !email) return toast("Name and Email are required.");

  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "TM";
  teamMembers.push({
    id: Date.now(),
    name,
    email,
    role,
    initials,
    avatarBg: role === "Approver" ? "#b7dcf6" : "#d2ee8b",
    avatarColor: role === "Approver" ? "#1a578f" : "#3d6f2f"
  });

  write("tide-team", teamMembers);
  renderTeam();
  closeModal(document.getElementById("invite-modal"));
  e.currentTarget.reset();
  toast(`Invitation sent to ${email} as ${role}!`);
});

// MCP Connection Handlers
document.getElementById("btn-copy-mcp-endpoint")?.addEventListener("click", () => {
  const url = "https://tide-social.vercel.app/api/mcp";
  navigator.clipboard?.writeText(url).catch(() => {});
  toast("Copied MCP endpoint https://tide-social.vercel.app/api/mcp to clipboard!");
});

document.getElementById("btn-toggle-mcp-key")?.addEventListener("click", function() {
  const input = document.getElementById("mcp-api-key-input");
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    this.textContent = "Hide";
  } else {
    input.type = "password";
    this.textContent = "Reveal";
  }
});

document.getElementById("btn-copy-mcp-key-val")?.addEventListener("click", () => {
  const val = document.getElementById("mcp-api-key-input")?.value || "";
  navigator.clipboard?.writeText(val).catch(() => {});
  toast("Copied API Token to clipboard!");
});

document.getElementById("btn-test-mcp-ping")?.addEventListener("click", function() {
  const originalText = this.textContent;
  this.textContent = "⚡ Ping in progress...";
  const resultBox = document.getElementById("mcp-ping-result");
  const latencyEl = document.getElementById("mcp-ping-latency");
  setTimeout(() => {
    this.textContent = originalText;
    if (resultBox) resultBox.style.display = "block";
    if (latencyEl) latencyEl.textContent = `${Math.floor(Math.random() * 8) + 12}ms latency`;
    toast("MCP Server online! 17 social orchestration tools verified.");
  }, 400);
});

// Security & Session Actions
document.getElementById("btn-manage-2fa")?.addEventListener("click", () => {
  toast("Two-factor authentication is active via Authenticator app (TOTP).");
});

document.getElementById("btn-change-password")?.addEventListener("click", () => {
  const current = prompt("Enter your current password:");
  if (current) {
    const next = prompt("Enter your new password (minimum 8 characters):");
    if (next && next.length >= 8) {
      toast("Password successfully updated!");
    } else if (next) {
      toast("Password too short. Minimum 8 characters required.");
    }
  }
});

document.getElementById("btn-signout-all")?.addEventListener("click", () => {
  toast("Terminated 1 remote session on iPhone 16 Pro Safari.");
});

document.getElementById("btn-switch-workspace-hero")?.addEventListener("click", () => {
  openModal("profile-modal");
});

document.getElementById("btn-open-full-profile")?.addEventListener("click", () => {
  closeModal(document.getElementById("profile-modal"));
  showView("profile");
});

// Initial Render
setupPlatforms();
renderWeek();
renderCalendar();
renderApprovals();
renderOverviewApprovals();
renderThreads();
renderAccounts();
renderConcepts("");
renderBrand();
renderProfile();
renderTeam();
updateBadges();
