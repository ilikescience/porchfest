/* Porchfest mobile web app. */
(() => {
  const { FESTIVAL, PORCHES, SCHEDULE, PORCH_BY_ID } = window.PorchfestData;

  // ---------- State ----------
  const state = {
    tab: 'now',
    userPos: null,                 // {lat, lng}
    nowMinutes: liveMinutes(),     // minutes since midnight (today)
    demo: loadDemoTime(),          // null | minutes
    saved: loadSaved(),            // Set of act ids
    genre: 'All',
    query: '',
    map: null,
    markers: new Map(),            // porchId -> Leaflet marker
    userMarker: null,
  };

  // ---------- Utilities ----------
  function liveMinutes() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
  function effectiveNow() { return state.demo ?? liveMinutes(); }

  function fmtTime(min) {
    let h = Math.floor(min / 60) % 24;
    const m = Math.floor(min % 60);
    const am = h < 12;
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${m.toString().padStart(2,'0')} ${am ? 'AM' : 'PM'}`;
  }
  function fmtTimeShort(min) {
    const t = fmtTime(min);
    return t.replace(':00 ', ' '); // "12 PM"
  }
  function hourLabel(min) {
    const h = Math.floor(min / 60);
    const am = h < 12;
    const h12 = ((h + 11) % 12) + 1;
    return `${h12} ${am ? 'AM' : 'PM'}`;
  }

  // Haversine in meters
  function dist(a, b) {
    if (!a || !b) return null;
    const toRad = d => d * Math.PI / 180;
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const la1 = toRad(a.lat), la2 = toRad(b.lat);
    const x = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function fmtDist(m) {
    if (m == null) return null;
    const ft = m * 3.28084;
    if (ft < 800) return `${Math.round(ft / 10) * 10} ft`;
    const mi = m / 1609.34;
    return `${mi.toFixed(mi < 10 ? 1 : 0)} mi`;
  }
  function walkMins(m) {
    if (m == null) return null;
    return Math.max(1, Math.round(m / 80)); // ~80 m/min walking
  }
  function statusOf(act, now) {
    if (now >= act.start && now < act.end) return 'live';
    if (act.start - now > 0 && act.start - now <= 30) return 'soon';
    if (act.end <= now) return 'past';
    return 'upcoming';
  }

  // ---------- Persistence ----------
  function loadSaved() {
    try { return new Set(JSON.parse(localStorage.getItem('porchfest:saved') || '[]')); }
    catch { return new Set(); }
  }
  function saveSaved() { localStorage.setItem('porchfest:saved', JSON.stringify([...state.saved])); }
  function loadDemoTime() {
    const v = localStorage.getItem('porchfest:demo');
    return v == null ? null : parseInt(v, 10);
  }
  function setDemo(min) {
    state.demo = min;
    if (min == null) localStorage.removeItem('porchfest:demo');
    else localStorage.setItem('porchfest:demo', String(min));
  }

  // ---------- Tab Bar ----------
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  function switchTab(name) {
    state.tab = name;
    document.querySelectorAll('.tab').forEach(b => {
      const active = b.dataset.tab === name;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('hidden', v.dataset.view !== name);
    });
    if (name === 'map') {
      requestAnimationFrame(() => {
        if (!state.map) initMap();
        else state.map.invalidateSize();
        renderMap();
      });
    } else if (name === 'sched') {
      renderSchedule();
    } else if (name === 'saved') {
      renderSaved();
    } else if (name === 'now') {
      renderNow();
    }
  }

  // ---------- Geolocation ----------
  const locBtn = document.getElementById('locBtn');
  const locToast = document.createElement('div');
  locToast.className = 'loc-toast';
  locToast.hidden = true;
  document.body.appendChild(locToast);

  function showToast(html, dismissable = true) {
    locToast.innerHTML = html + (dismissable ? '<button class="loc-toast-x" aria-label="Dismiss">×</button>' : '');
    locToast.hidden = false;
    const x = locToast.querySelector('.loc-toast-x');
    if (x) x.addEventListener('click', () => { locToast.hidden = true; });
  }

  function getPosition(options) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  function isPermissionDenied(err) {
    return err?.code === 1; // GeolocationPositionError.PERMISSION_DENIED
  }

  function updateUserMarker() {
    if (!state.map || !state.userPos) return;
    const latLng = [state.userPos.lat, state.userPos.lng];
    if (!state.userMarker) {
      state.userMarker = L.marker(latLng, {
        icon: L.divIcon({ className: '', html: '<div class="user-pin"></div>', iconSize: [16,16], iconAnchor: [8,8] })
      }).addTo(state.map);
    } else {
      state.userMarker.setLatLng(latLng);
    }
  }

  function setUserPosition(pos, centerMap = true) {
    state.userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    locBtn.classList.remove('denied');
    locBtn.classList.add('active');
    locToast.hidden = true;
    renderAll();
    updateUserMarker();
    if (centerMap && state.map) {
      state.map.setView([state.userPos.lat, state.userPos.lng], 16);
    }
  }

  async function requestLocation() {
    if (!navigator.geolocation) {
      showToast("Location isn't available in this browser.");
      return;
    }
    if (!window.isSecureContext) {
      showToast("Location needs a secure (https://) connection.");
      return;
    }

    locBtn.classList.remove('denied');
    locBtn.setAttribute('aria-busy', 'true');
    showToast('Finding your location…', false);

    try {
      const pos = await getPosition({ enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 })
        .catch(err => {
          if (isPermissionDenied(err)) throw err;
          return getPosition({ enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 });
        });
      setUserPosition(pos);
    } catch (err) {
      locBtn.classList.remove('active');
      if (isPermissionDenied(err)) {
        locBtn.classList.add('denied');
        showToast(
          "Location is blocked for this site. In Safari, set Location to <strong>Allow</strong> for this site " +
          "and make sure Safari itself can use Location Services, then try again."
        );
      } else if (err.code === 2) {
        showToast("Your device can't determine its location right now. Try again outside or with Wi-Fi on.");
      } else if (err.code === 3) {
        showToast("Location timed out. Try again from somewhere with a clearer GPS signal.");
      } else {
        showToast("Couldn't get your location: " + (err.message || 'Unknown location error.'));
      }
    } finally {
      locBtn.removeAttribute('aria-busy');
    }
  }
  locBtn.addEventListener('click', requestLocation);

  // ---------- Hero / clock ----------
  const heroStatus = document.getElementById('heroStatus');
  const heroTitle = document.getElementById('heroTitle');
  const heroSub = document.getElementById('heroSub');
  const clockText = document.getElementById('clockText');
  const liveDot = document.getElementById('liveDot');
  const topbarSub = document.getElementById('topbarSub');
  const demoBtn = document.getElementById('demoBtn');
  const demoBar = document.getElementById('demoBar');
  const demoSlider = document.getElementById('demoSlider');
  const demoTimeEl = document.getElementById('demoTime');
  const demoReset = document.getElementById('demoReset');

  function isFestivalDay() {
    const today = new Date().toISOString().slice(0,10);
    return today === FESTIVAL.date;
  }

  function renderHero() {
    const now = effectiveNow();
    const isLive = now >= FESTIVAL.startMinutes && now < FESTIVAL.endMinutes;
    const today = isFestivalDay() || state.demo != null;
    const startLabel = fmtTimeShort(FESTIVAL.startMinutes);
    const endLabel = fmtTimeShort(FESTIVAL.endMinutes);

    clockText.textContent = fmtTime(now);
    liveDot.classList.toggle('off', !isLive);

    if (isLive) {
      heroStatus.textContent = '● Live now';
      heroTitle.textContent = "Porchfest is on";
      heroSub.textContent = `Music until ${endLabel}`;
    } else if (today && now < FESTIVAL.startMinutes) {
      const mins = FESTIVAL.startMinutes - now;
      const h = Math.floor(mins / 60), m = mins % 60;
      heroStatus.textContent = 'Today';
      heroTitle.textContent = 'Tuning up…';
      heroSub.textContent = `Music starts in ${h ? h + 'h ' : ''}${m}m`;
    } else if (today) {
      heroStatus.textContent = "That's a wrap";
      heroTitle.textContent = "See you next year";
      heroSub.textContent = "Thanks for porching with us.";
    } else {
      heroStatus.textContent = 'Save the date';
      heroTitle.textContent = FESTIVAL.dateLabel;
      heroSub.textContent = `Music ${startLabel}–${endLabel}`;
    }
    topbarSub.textContent = `Montclair · ${FESTIVAL.dateLabel.replace(/^\w+, /, '')}`;
  }

  demoBtn.addEventListener('click', () => {
    demoBar.classList.toggle('hidden');
    if (state.demo == null) {
      // Default to mid-festival
      const def = 13 * 60; // 1:00 PM
      demoSlider.value = def;
      setDemo(def);
    }
    onDemoChange();
  });
  demoSlider.addEventListener('input', () => {
    setDemo(parseInt(demoSlider.value, 10));
    onDemoChange();
  });
  demoReset.addEventListener('click', () => {
    setDemo(null);
    demoBar.classList.add('hidden');
    onDemoChange();
  });
  function onDemoChange() {
    if (state.demo != null) {
      demoSlider.value = state.demo;
      demoTimeEl.textContent = fmtTime(state.demo);
    }
    renderAll();
  }
  // restore demo bar visibility
  if (state.demo != null) {
    demoBar.classList.remove('hidden');
    demoSlider.value = state.demo;
    demoTimeEl.textContent = fmtTime(state.demo);
  }

  // ---------- Now view ----------
  const nowCards = document.getElementById('nowCards');
  const nextCards = document.getElementById('nextCards');
  const nowCount = document.getElementById('nowCount');
  const nextCount = document.getElementById('nextCount');
  const finaleCard = document.getElementById('finaleCard');

  function renderNow() {
    renderHero();
    const now = effectiveNow();
    const live = SCHEDULE.filter(a => now >= a.start && now < a.end);
    const next = SCHEDULE.filter(a => a.start > now && a.start - now <= 90)
                          .slice().sort((a,b) => a.start - b.start);
    sortByDistance(live);
    sortByDistance(next);

    nowCount.textContent = live.length;
    nextCount.textContent = next.length;
    nowCards.innerHTML = live.length
      ? live.slice(0, 8).map(actCard).join('')
      : `<div class="empty">No porches playing right this minute. Try Up next →</div>`;
    nextCards.innerHTML = next.length
      ? next.slice(0, 10).map(actCard).join('')
      : `<div class="empty">Nothing coming up in the next 90 minutes.</div>`;

    if (FESTIVAL.finale) {
      finaleCard.innerHTML = `
        <h3>${FESTIVAL.finale.name}</h3>
        <div class="when">${fmtTimeShort(FESTIVAL.finale.startMinutes)} – ${fmtTimeShort(FESTIVAL.finale.endMinutes)}</div>
        <div class="where">${FESTIVAL.finale.venue} · ${FESTIVAL.finale.address}</div>
      `;
    } else {
      finaleCard.innerHTML = '';
      finaleCard.hidden = true;
    }

    // Wire card clicks
    nowCards.querySelectorAll('[data-act]').forEach(el => el.addEventListener('click', e => onActClick(e, el)));
    nextCards.querySelectorAll('[data-act]').forEach(el => el.addEventListener('click', e => onActClick(e, el)));
  }

  function sortByDistance(list) {
    if (!state.userPos) return;
    list.sort((a, b) => (dist(state.userPos, a.porch) ?? 9e9) - (dist(state.userPos, b.porch) ?? 9e9));
  }

  function actCard(a) {
    const now = effectiveNow();
    const status = statusOf(a, now);
    const d = state.userPos ? dist(state.userPos, a.porch) : null;
    const minsLeft = a.end - now;
    const minsTo = a.start - now;
    const timeChip = status === 'live'
      ? `<span class="card-time live"><span class="lamp"></span>LIVE · ${minsLeft}m left</span>`
      : status === 'soon'
      ? `<span class="card-time soon"><span class="lamp"></span>In ${minsTo} min</span>`
      : `<span class="card-time">${fmtTime(a.start)}</span>`;
    const distChip = d != null
      ? `<span class="card-dist">📍 ${fmtDist(d)} · ${walkMins(d)} min walk</span>`
      : `<span class="card-dist">${a.porch.area}</span>`;
    const saved = state.saved.has(a.id);
    return `
      <article class="card" data-act="${a.id}">
        ${timeChip}
        <div class="card-artist">${escape(a.artist)}</div>
        <div class="card-meta">
          ${a.genre ? `<span>${escape(a.genre)}</span><span class="sep">·</span>` : ''}
          <span>${escape(a.porch.address)}</span>
        </div>
        <div class="card-row">
          ${distChip}
          <button class="card-save ${saved ? 'on' : ''}" data-save="${a.id}" aria-label="Save">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </article>
    `;
  }

  function onActClick(e, el) {
    const saveBtn = e.target.closest('[data-save]');
    if (saveBtn) {
      toggleSaved(saveBtn.dataset.save);
      e.stopPropagation();
      return;
    }
    openSheet(el.dataset.act);
  }

  function toggleSaved(id) {
    if (state.saved.has(id)) state.saved.delete(id);
    else state.saved.add(id);
    saveSaved();
    renderAll();
  }

  // ---------- Schedule view ----------
  const scheduleList = document.getElementById('scheduleList');
  const searchInput = document.getElementById('searchInput');
  const genreChips = document.getElementById('genreChips');
  searchInput.addEventListener('input', () => { state.query = searchInput.value.trim().toLowerCase(); renderSchedule(); });

  function uniqueGenres() {
    const g = new Set(SCHEDULE.map(a => a.genre).filter(Boolean));
    return ['All', ...[...g].sort()];
  }
  function renderGenres() {
    const genres = uniqueGenres();
    if (genres.length <= 1) {
      genreChips.hidden = true;
      genreChips.innerHTML = '';
      return;
    }
    genreChips.hidden = false;
    genreChips.innerHTML = genres.map(g =>
      `<button class="chip ${g === state.genre ? 'active' : ''}" data-genre="${escape(g)}">${escape(g)}</button>`
    ).join('');
    genreChips.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
      state.genre = c.dataset.genre;
      renderGenres();
      renderSchedule();
    }));
  }

  function renderSchedule() {
    renderGenres();
    const now = effectiveNow();
    const q = state.query;
    const filtered = SCHEDULE.filter(a => {
      if (state.genre !== 'All' && a.genre !== state.genre) return false;
      if (!q) return true;
      return a.artist.toLowerCase().includes(q)
        || a.genre.toLowerCase().includes(q)
        || a.porch.address.toLowerCase().includes(q)
        || a.porch.area.toLowerCase().includes(q);
    });

    const byHour = new Map();
    for (const a of filtered) {
      const key = Math.floor(a.start / 60) * 60;
      if (!byHour.has(key)) byHour.set(key, []);
      byHour.get(key).push(a);
    }
    const hours = [...byHour.keys()].sort((a,b) => a - b);
    if (!hours.length) {
      scheduleList.innerHTML = `<div class="empty" style="flex:0 0 auto">No matching shows.</div>`;
      return;
    }
    scheduleList.innerHTML = hours.map(h => `
      <div class="time-header">${hourLabel(h)} <span class="line"></span></div>
      ${byHour.get(h).map(a => row(a, now)).join('')}
    `).join('');
    scheduleList.querySelectorAll('.row').forEach(r => r.addEventListener('click', e => onActClick(e, r)));
  }

  function row(a, now) {
    const status = statusOf(a, now);
    const d = state.userPos ? dist(state.userPos, a.porch) : null;
    const saved = state.saved.has(a.id);
    return `
      <div class="row" data-act="${a.id}">
        <div class="row-time ${status}">
          <div class="h">${fmtTime(a.start).split(' ')[0]}</div>
          <div class="m">${fmtTime(a.start).split(' ')[1]}</div>
        </div>
        <div class="row-body">
          <div class="row-artist">${escape(a.artist)}</div>
          <div class="row-meta">
            ${a.genre ? `<span class="tag">${escape(a.genre)}</span>` : ''}
            <span>${escape(a.porch.address)}</span>
            ${d != null ? `<span class="sep">·</span><span>${fmtDist(d)}</span>` : `<span class="sep">·</span><span>${escape(a.porch.area)}</span>`}
          </div>
        </div>
        <button class="row-save ${saved ? 'on' : ''}" data-save="${a.id}" aria-label="Save">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
    `;
  }

  // ---------- Saved view ----------
  const savedList = document.getElementById('savedList');
  function renderSaved() {
    const now = effectiveNow();
    const items = SCHEDULE.filter(a => state.saved.has(a.id));
    if (!items.length) {
      savedList.innerHTML = `
        <div class="empty" style="margin: 30px 16px;">
          <strong>No saved shows yet.</strong><br/>
          Tap the bookmark on any show to build your day.
        </div>`;
      return;
    }
    savedList.innerHTML = items.map(a => row(a, now)).join('');
    savedList.querySelectorAll('.row').forEach(r => r.addEventListener('click', e => onActClick(e, r)));
  }

  // ---------- Map view ----------
  function initMap() {
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([FESTIVAL.center.lat, FESTIVAL.center.lng], 14);
    state.map = map;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
    L.control.attribution({ position: 'bottomleft' })
      .addAttribution('© OpenStreetMap, © CARTO')
      .addTo(map);
    document.getElementById('recenterBtn').addEventListener('click', () => {
      if (state.userPos) {
        map.setView([state.userPos.lat, state.userPos.lng], 16);
      } else {
        requestLocation();
      }
    });
  }

  function renderMap() {
    if (!state.map) return;
    const now = effectiveNow();
    for (const porch of PORCHES) {
      const acts = SCHEDULE.filter(a => a.porchId === porch.id);
      const live = acts.find(a => now >= a.start && now < a.end);
      const soon = acts.find(a => a.start > now && a.start - now <= 30);
      const status = live ? 'live' : soon ? 'up' : 'past';
      const html = `<div class="porch-pin ${status}" title="${porch.address}"></div>`;
      const icon = L.divIcon({ className: '', html, iconSize: [22,22], iconAnchor: [11,11] });
      const existing = state.markers.get(porch.id);
      if (existing) {
        existing.setIcon(icon);
      } else {
        const m = L.marker([porch.lat, porch.lng], { icon }).addTo(state.map);
        const next = live || soon || acts.slice().sort((a,b) => Math.abs(a.start - now) - Math.abs(b.start - now))[0];
        if (next) m.on('click', () => openSheet(next.id));
        state.markers.set(porch.id, m);
      }
    }
    updateUserMarker();
  }

  // ---------- Bottom sheet ----------
  const sheet = document.getElementById('sheet');
  const sheetBackdrop = document.getElementById('sheetBackdrop');
  const sheetBody = document.getElementById('sheetBody');
  sheetBackdrop.addEventListener('click', closeSheet);
  function openSheet(actId) {
    const a = SCHEDULE.find(x => x.id === actId);
    if (!a) return;
    const now = effectiveNow();
    const status = statusOf(a, now);
    const d = state.userPos ? dist(state.userPos, a.porch) : null;
    const saved = state.saved.has(a.id);
    const sameLater = SCHEDULE.filter(x => x.porchId === a.porchId && x.id !== a.id)
                              .sort((a,b) => a.start - b.start);
    const lat = a.porch.lat, lng = a.porch.lng;
    const whenChip =
      status === 'live' ? `<span class="when live">● Live now · until ${fmtTime(a.end)}</span>` :
      status === 'soon' ? `<span class="when soon">Starts in ${a.start - now} min</span>` :
      status === 'past' ? `<span class="when">Ended ${now - a.end} min ago</span>` :
      `<span class="when">${fmtTime(a.start)} – ${fmtTime(a.end)}</span>`;
    sheetBody.innerHTML = `
      <h3>${escape(a.artist)}</h3>
      ${a.genre ? `<div class="meta"><strong>${escape(a.genre)}</strong></div>` : ''}
      ${whenChip}
      <div class="meta">📍 ${escape(a.porch.address)}${a.porch.area ? ' · ' + escape(a.porch.area) : ''}</div>
      ${d != null ? `<div class="meta">~${fmtDist(d)} · about ${walkMins(d)} min walk</div>` : ``}
      <div class="actions">
        <a class="btn" href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 20l-6-3V4l6 3 6-3 6 3v13l-6-3-6 3z"/><path d="M9 7v13M15 4v13"/></svg>
          Walk here
        </a>
        <button class="btn primary" data-save-sheet="${a.id}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          ${saved ? 'Saved' : 'Save show'}
        </button>
      </div>
      ${sameLater.length ? `
        <div class="also">
          <h4>Also on this porch</h4>
          <div class="also-list">
            ${sameLater.map(x => `
              <button class="also-row" data-act-jump="${x.id}">
                <span class="a">${escape(x.artist)}</span>
                <span class="t">${fmtTime(x.start)}</span>
              </button>
            `).join('')}
          </div>
        </div>` : ``}
    `;
    sheet.classList.remove('hidden');
    sheetBackdrop.classList.remove('hidden');
    sheetBody.querySelector(`[data-save-sheet="${a.id}"]`)?.addEventListener('click', () => {
      toggleSaved(a.id);
      openSheet(a.id);
    });
    sheetBody.querySelectorAll('[data-act-jump]').forEach(el => {
      el.addEventListener('click', () => openSheet(el.dataset.actJump));
    });
  }
  function closeSheet() {
    sheet.classList.add('hidden');
    sheetBackdrop.classList.add('hidden');
  }

  // ---------- Render orchestration ----------
  function renderAll() {
    renderNow();
    if (state.tab === 'sched') renderSchedule();
    if (state.tab === 'saved') renderSaved();
    if (state.tab === 'map' && state.map) renderMap();
  }

  // Clock tick (keep "now" cards & live status fresh)
  setInterval(() => {
    if (state.demo == null) {
      state.nowMinutes = liveMinutes();
      renderAll();
    } else {
      // just refresh the clock
      clockText.textContent = fmtTime(effectiveNow());
    }
  }, 30000);

  // ---------- Small util ----------
  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ---------- Boot ----------
  renderAll();
})();
