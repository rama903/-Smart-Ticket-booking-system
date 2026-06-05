/* ─── DATA & STATE MANAGEMENT ────────────────────── */
const EVENTS = [
  { id: 1, genre: "Concert", title: "Arijit Singh Live", date: "14 Jun 2026", venue: "HICC, Hyderabad", price: 1499 },
  { id: 2, genre: "Movie", title: "Kalki 3.0 – Premiere", date: "20 Jun 2026", venue: "INOX GVK One", price: 499 },
  { id: 3, genre: "Comedy", title: "Kenny Sebastian Stand-Up", date: "28 Jun 2026", venue: "Shilpakala Vedika", price: 799 },
  { id: 4, genre: "Sport", title: "IPL Final 2026", date: "30 Jun 2026", venue: "Uppal Stadium", price: 2999 },
];

// Structural array mapping state to randomly taken seats
const takenSeats = new Set();
let selectedSeats = [];
let selectedEvent = null;

/* ─── INITIALIZATION ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  generateRandomTakenSeats();
  renderEvents();
});

function generateRandomTakenSeats() {
  takenSeats.clear();
  for (let i = 0; i < 18; i++) {
    takenSeats.add(Math.floor(Math.random() * 60));
  }
}

/* ─── EVENT RENDERING & SELECTION ────────────────── */
function renderEvents() {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;
  
  grid.innerHTML = EVENTS.map(ev => `
    <div class="event-card" id="ev${ev.id}" onclick="selectEvent(${ev.id})">
      <div class="check-mark">✓</div>
      <div class="badge">${ev.genre}</div>
      <h3>${ev.title}</h3>
      <div class="meta">📅 ${ev.date}<br>📍 ${ev.venue}</div>
      <div class="price">₹${ev.price.toLocaleString()}</div>
    </div>
  `).join('');
}

function selectEvent(id) {
  document.querySelectorAll('.event-card').forEach(c => c.classList.remove('selected'));
  
  const selectedEl = document.getElementById('ev' + id);
  if (selectedEl) {
    selectedEl.classList.add('selected');
  }
  selectedEvent = EVENTS.find(e => e.id === id);
}

/* ─── SEAT MAP ENGINE ────────────────────────────── */
function buildSeatMap() {
  const map = document.getElementById('seatMap');
  if (!map) return;
  
  map.innerHTML = '';
  const sections = [
    { label: 'Premium (Front)', rows: 2, cols: 10, offset: 0 },
    { label: 'Standard', rows: 3, cols: 12, offset: 20 },
    { label: 'Economy (Back)', rows: 2, cols: 14, offset: 56 },
  ];

  sections.forEach(sec => {
    let html = `<div class="seat-section"><div class="seat-section-label">${sec.label}</div>`;
    
    for (let r = 0; r < sec.rows; r++) {
      html += `<div class="seat-row">`;
      for (let c = 0; c < sec.cols; c++) {
        const idx = sec.offset + r * sec.cols + c;
        const id = `seat-${idx}`;
        const isTaken = takenSeats.has(idx);
        const cls = isTaken ? 'taken' : '';
        const lbl = String.fromCharCode(65 + r) + (c + 1);
        
        html += `
          <div class="seat ${cls}" id="${id}" data-idx="${idx}" onclick="toggleSeat(${idx},'${lbl}')">
            ${lbl}
          </div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
    map.innerHTML += html;
  });
}

function toggleSeat(idx, lbl) {
  if (takenSeats.has(idx)) return;
  
  const el = document.getElementById('seat-' + idx);
  const pos = selectedSeats.findIndex(s => s.idx === idx);
  
  if (pos > -1) {
    selectedSeats.splice(pos, 1);
    if (el) el.classList.remove('selected');
  } else {
    if (selectedSeats.length >= 6) { 
      alert('Max 6 seats per booking.'); 
      return; 
    }
    selectedSeats.push({ idx, lbl });
    if (el) el.classList.add('selected');
  }
  
  document.getElementById('seatCount').textContent = `${selectedSeats.length} selected`;
}

/* ─── WIZARD SYSTEM NAVIGATION ───────────────────── */
function goStep(n) {
  // Validation Gates
  if (n === 2 && !selectedEvent) { 
    alert('Please select an event first.'); 
    return; 
  }
  if (n === 3 && selectedSeats.length === 0) { 
    alert('Please select at least one seat.'); 
    return; 
  }
  if (n === 4) {
    const fname = document.getElementById('fname').value.trim();
    const lname = document.getElementById('lname').value.trim();
    const email = document.getElementById('email').value.trim();
    const pay = document.getElementById('payment').value;
    
    if (!fname || !lname || !email || !pay) { 
      alert('Please fill in all fields.'); 
      return; 
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { 
      alert('Please enter a valid email.'); 
      return; 
    }
    buildSummary();
  }

  // Toggle DOM Visibility Layouts
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  
  const targetSection = n === 'done' ? 'stepDone' : 'step' + n;
  document.getElementById(targetSection).classList.add('active');

  // Sync Progress Indicators
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('s' + i);
    const ln = document.getElementById('l' + i);
    if (!el) continue;
    
    el.classList.remove('active', 'done');
    if (ln) ln.classList.remove('done');
    
    if (typeof n === 'number') {
      if (i < n) { 
        el.classList.add('done'); 
        el.textContent = '✓'; 
        if (ln) ln.classList.add('done'); 
      } else if (i === n) {
        el.classList.add('active');
        el.textContent = i;
      }
    }
  }

  if (n === 2) buildSeatMap();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── TRANSACTION COMPILATION ────────────────────── */
function buildSummary() {
  const fname = document.getElementById('fname').value.trim();
  const lname = document.getElementById('lname').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const pay = document.getElementById('payment').value;
  const seats = selectedSeats.map(s => s.lbl).join(', ');
  const total = selectedEvent.price * selectedSeats.length;

  document.getElementById('summaryBox').innerHTML = `
    <div class="summary-row"><span class="key">Event</span><span class="val">${selectedEvent.title}</span></div>
    <div class="summary-row"><span class="key">Date & Venue</span><span class="val">${selectedEvent.date}<br>${selectedEvent.venue}</span></div>
    <div class="summary-row"><span class="key">Seats</span><span class="val">${seats}</span></div>
    <div class="summary-row"><span class="key">Name</span><span class="val">${fname} ${lname}</span></div>
    <div class="summary-row"><span class="key">Email</span><span class="val">${email}</span></div>
    ${phone ? `<div class="summary-row"><span class="key">Phone</span><span class="val">${phone}</span></div>` : ''}
    <div class="summary-row"><span class="key">Payment</span><span class="val">${pay}</span></div>
    <div class="summary-row"><span class="key">Price per Seat</span><span class="val">₹${selectedEvent.price.toLocaleString()}</span></div>
    <div class="summary-row total-row"><span class="key">TOTAL</span><span class="val">₹${total.toLocaleString()}</span></div>
  `;
}

function confirmBooking() {
  const fname = document.getElementById('fname').value.trim();
  const lname = document.getElementById('lname').value.trim();
  const seats = selectedSeats.map(s => s.lbl).join(', ');
  const total = selectedEvent.price * selectedSeats.length;
  const refId = 'TZ-' + Date.now().toString(36).toUpperCase();

  document.getElementById('ticketDisplay').innerHTML = `
    <div class="ticket-header">
      ${selectedEvent.title}
      <span class="ticket-id">${refId}</span>
    </div>
    <div class="ticket-row"><span class="k">Date</span><span class="v">${selectedEvent.date}</span></div>
    <div class="ticket-row"><span class="k">Venue</span><span class="v">${selectedEvent.venue}</span></div>
    <div class="ticket-row"><span class="k">Seats</span><span class="v">${seats}</span></div>
    <div class="ticket-row"><span class="k">Name</span><span class="v">${fname} ${lname}</span></div>
    <div class="ticket-row"><span class="k">Amount Paid</span><span class="v" style="color:var(--accent)">₹${total.toLocaleString()}</span></div>
  `;

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('stepDone').classList.add('active');
  
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('s' + i);
    const ln = document.getElementById('l' + i);
    if (el) { el.classList.remove('active'); el.classList.add('done'); el.textContent = '✓'; }
    if (ln) ln.classList.add('done');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── RESET TRANSACTION ENGINE ───────────────────── */
function resetAll() {
  selectedEvent = null;
  selectedSeats = [];
  
  document.getElementById('fname').value = '';
  document.getElementById('lname').value = '';
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('payment').value = '';
  document.getElementById('seatCount').textContent = '0 selected';
  document.querySelectorAll('.event-card').forEach(c => c.classList.remove('selected'));
  
  generateRandomTakenSeats();

  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('s' + i);
    const ln = document.getElementById('l' + i);
    if (el) { el.classList.remove('done', 'active'); el.textContent = i; }
    if (ln) ln.classList.remove('done');
  }
  
  document.getElementById('s1').classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('step1').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
