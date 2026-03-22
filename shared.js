// ============================================================
// PETAL RUSH — Shared Utilities (shared.js)
// ============================================================

// ---- Page Navigation ----------------------------------------
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${name}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item, .bn-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === name);
  });

  closeSidebar();

  if (typeof window[`onPageShow_${name}`] === 'function') {
    window[`onPageShow_${name}`]();
  }
}

// ---- Toast Notifications ------------------------------------
function showToast(msg, type = 'info') {
  const colors = {
    success: '#22c55e', error: '#ef4444', info: '#3b82f6', warn: '#f59e0b'
  };
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };
  const toast = document.createElement('div');
  toast.className = 'pr-toast';
  toast.innerHTML = `<span>${icons[type]||'💬'}</span> <span>${msg}</span>`;
  toast.style.cssText = `
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(20px);
    background:${colors[type]||colors.info}; color:#fff; padding:12px 20px; border-radius:12px;
    font-size:14px; font-weight:600; z-index:99999; box-shadow:0 8px 32px rgba(0,0,0,.25);
    display:flex; align-items:center; gap:8px; opacity:0; transition:all .3s ease;
    max-width:90vw; white-space:nowrap;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ---- Formatters ---------------------------------------------
function fmtINR(n) {
  if (n == null || isNaN(n)) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function fmtDate(ts) {
  if (!ts) return '—';
  const d = ts instanceof Date ? ts : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateTime(ts) {
  if (!ts) return '—';
  const d = ts instanceof Date ? ts : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function cap(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---- Tabs ---------------------------------------------------
function initTabs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const buttons = container.querySelectorAll('.tab-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      container.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.toggle('active', p.dataset.tab === tab);
      });
    });
  });
  // Activate first
  if (buttons.length > 0) buttons[0].click();
}

// ---- Sidebar ------------------------------------------------
function initSidebar() {
  const overlay = document.getElementById('sidebarOverlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);
}

// ---- Modals -------------------------------------------------
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// Close modal on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal')) closeModal(e.target.id);
});

// ---- QR Code ------------------------------------------------
function renderQR(containerId, text, size = 160) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    new QRCode(el, { text, width: size, height: size, correctLevel: QRCode.CorrectLevel.M });
  } else {
    el.textContent = text;
  }
}

// ---- Status Badge -------------------------------------------
function statusBadge(status) {
  const map = {
    pending:   { color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
    confirmed: { color: '#3b82f6', bg: '#dbeafe', label: 'Confirmed' },
    packed:    { color: '#8b5cf6', bg: '#ede9fe', label: 'Packed' },
    shipped:   { color: '#06b6d4', bg: '#cffafe', label: 'Shipped' },
    delivered: { color: '#22c55e', bg: '#dcfce7', label: 'Delivered' },
    cancelled: { color: '#ef4444', bg: '#fee2e2', label: 'Cancelled' },
    active:    { color: '#22c55e', bg: '#dcfce7', label: 'Active' },
    suspended: { color: '#ef4444', bg: '#fee2e2', label: 'Suspended' },
    rejected:  { color: '#ef4444', bg: '#fee2e2', label: 'Rejected' },
    pending_approval: { color: '#f59e0b', bg: '#fef3c7', label: 'Pending Approval' },
    completed: { color: '#22c55e', bg: '#dcfce7', label: 'Completed' },
    held:      { color: '#ef4444', bg: '#fee2e2', label: 'Held' },
  };
  const s = map[status] || { color: '#6b7280', bg: '#f3f4f6', label: cap(status||'unknown') };
  return `<span class="status-badge" style="color:${s.color};background:${s.bg};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">${s.label}</span>`;
}

// ---- Order Progress -----------------------------------------
function orderProgressBar(status) {
  const steps = ['pending','confirmed','packed','shipped','delivered'];
  const idx = steps.indexOf(status);
  if (status === 'cancelled') {
    return `<div class="order-progress cancelled"><span>❌ Cancelled</span></div>`;
  }
  return `<div class="order-progress">
    ${steps.map((s, i) => `
      <div class="progress-step ${i <= idx ? 'done' : ''} ${i === idx ? 'current' : ''}">
        <div class="step-dot">${i < idx ? '✓' : i+1}</div>
        <div class="step-label">${cap(s)}</div>
      </div>
      ${i < steps.length-1 ? `<div class="progress-line ${i < idx ? 'done' : ''}"></div>` : ''}
    `).join('')}
  </div>`;
}

// ---- Category Emoji -----------------------------------------
function catEmoji(c) {
  const m = { roses:'🌹', lilies:'🌸', bouquets:'💐', seasonal:'🌼', exotic:'🌺', other:'🌷' };
  return m[c] || '🌷';
}

// ---- Countdown Timer ----------------------------------------
function startCountdown(targetTime, elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const target = new Date(targetTime);
  const tick = () => {
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) { el.textContent = 'Arriving soon'; return; }
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `${m}m ${s}s`;
    setTimeout(tick, 1000);
  };
  tick();
}

// ---- Invoice Builder ----------------------------------------
function buildInvoiceHTML(order, profile) {
  const products = Array.isArray(order.products) ? order.products : [];
  const subtotal = products.reduce((s, p) => s + (p.price * p.qty), 0);
  const delivery = 40;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + gst;

  return `
    <div id="invoice-content" style="font-family:'Nunito',sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;color:#1a1a2e;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;border-bottom:3px solid #e91e8c;padding-bottom:16px;">
        <div>
          <h1 style="color:#e91e8c;margin:0;font-size:28px;">🌸 Petal Rush</h1>
          <p style="color:#666;margin:4px 0 0;font-size:12px;">Order Flowers Like Never Before</p>
        </div>
        <div style="text-align:right;">
          <p style="font-weight:700;margin:0;">INVOICE</p>
          <p style="color:#666;margin:4px 0 0;font-size:12px;">#${order.id.slice(0,8).toUpperCase()}</p>
          <p style="color:#666;margin:0;font-size:12px;">${fmtDate(order.created_at)}</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
        <div>
          <p style="font-weight:700;color:#e91e8c;margin:0 0 8px;">Billed To</p>
          <p style="margin:0;">${profile?.name || 'Customer'}</p>
          <p style="margin:0;color:#666;font-size:13px;">${profile?.email || ''}</p>
          <p style="margin:4px 0 0;color:#666;font-size:13px;">${order.address?.text || ''}</p>
        </div>
        <div>
          <p style="font-weight:700;color:#e91e8c;margin:0 0 8px;">Order Details</p>
          <p style="margin:0;font-size:13px;">Status: ${statusBadge(order.status)}</p>
          <p style="margin:4px 0 0;color:#666;font-size:13px;">Payment: ${cap(order.payment_mode)}</p>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#fce4ec;">
            <th style="padding:10px;text-align:left;font-size:13px;">Item</th>
            <th style="padding:10px;text-align:center;font-size:13px;">Qty</th>
            <th style="padding:10px;text-align:right;font-size:13px;">Price</th>
            <th style="padding:10px;text-align:right;font-size:13px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr style="border-bottom:1px solid #f3e5f5;">
              <td style="padding:10px;font-size:13px;">${p.name}</td>
              <td style="padding:10px;text-align:center;font-size:13px;">${p.qty}</td>
              <td style="padding:10px;text-align:right;font-size:13px;">${fmtINR(p.price)}</td>
              <td style="padding:10px;text-align:right;font-size:13px;">${fmtINR(p.price * p.qty)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;">
        <div style="width:240px;">
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;">
            <span>Subtotal</span><span>${fmtINR(subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;">
            <span>Delivery</span><span>${fmtINR(delivery)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;">
            <span>GST (5%)</span><span>${fmtINR(gst)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:16px;font-weight:800;border-top:2px solid #e91e8c;margin-top:6px;color:#e91e8c;">
            <span>Grand Total</span><span>${fmtINR(total)}</span>
          </div>
        </div>
      </div>
      <p style="text-align:center;color:#999;font-size:12px;margin-top:32px;">Thank you for choosing Petal Rush 🌸 Fresh · Fast · Beautiful</p>
    </div>
  `;
}

// ---- Init ---------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initDarkMode();
});
