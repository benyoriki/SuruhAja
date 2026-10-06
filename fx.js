/* SuruhAja — kalkulator tarif + efek gerak. Dimuat setelah app.js. */
(function () {
  var K = { svc: 'antar', qty: 5, stops: 1, load: 'ringan', when: 'jadwal' };
  var MODE = { antar: 'km', beli: 'km', antre: 'jam', beres: 'jam', cari: 'none', lain: 'none' };
  var STOPL = { antar: 'titik antar', beli: 'toko', cari: 'toko' };
  var LOADS = [['ringan', 'Ringan', 'Barang kecil'], ['sedang', 'Sedang', 'Beberapa barang'], ['berat', 'Berat', 'Banyak / berat']];
  var WHENS = [['jadwal', 'Terjadwal', 'Besok / atur jam'], ['hariini', 'Hari ini', 'Dalam beberapa jam'], ['segera', 'Segera', 'Kurang dari 1 jam']];
  var cur = 0, last = null, raf;
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var price = function () { return db.prices.filter(function (p) { return p.id === K.svc; })[0] || db.prices[0]; };

  function seg(el, items, key, big) {
    el.innerHTML = items.map(function (it) {
      var v = big ? it[0] : it.id, on = K[key] === v;
      return '<button type="button" data-v="' + v + '" class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '"><b>' + esc(big ? it[1] : it.n) + '</b>' + (big ? '<small>' + it[2] + '</small>' : '') + '</button>';
    }).join('');
  }
  function build() {
    if (!db.prices.some(function (p) { return p.id === K.svc; })) K.svc = db.prices[0].id;
    seg($('#k-svc'), db.prices, 'svc', false); seg($('#k-load'), LOADS, 'load', true); seg($('#k-when'), WHENS, 'when', true);
    var m = MODE[K.svc] || 'none', q = $('#k-qty');
    $('#k-qty-w').hidden = m === 'none'; $('#k-stops-w').hidden = !STOPL[K.svc];
    if (m === 'km') { q.min = 1; q.max = 30; $('#k-qty-l').textContent = '2. Jarak sekali jalan (km)'; }
    if (m === 'jam') { q.min = 1; q.max = 8; $('#k-qty-l').textContent = '2. Perkiraan durasi (jam)'; }
    K.qty = Math.min(Math.max(K.qty, +q.min || 1), +q.max || 30); q.value = K.qty;
    $('#k-stops-l').textContent = '3. Jumlah ' + (STOPL[K.svc] || 'titik');
    q.style.setProperty('--p', ((K.qty - q.min) / (q.max - q.min) * 100) + '%');
    var n = 0; $$('.calc-in .cf').forEach(function (cf) { if (cf.hidden) return; var l = cf.querySelector('.cl'); l.textContent = (++n) + '. ' + l.textContent.replace(/^\d+\.\s*/, ''); });
  }
  function compute() {
    var p = price(), c = db.calc, m = MODE[K.svc], L = [], t = 0, add = function (l, v) { L.push([l, v]); t += v; };
    if (m === 'km') { add('Tarif dasar (sampai ' + c.freeKm + ' km)', p.p); var x = Math.max(0, K.qty - c.freeKm); if (x) add('Jarak tambahan ' + x + ' km × ' + rp(c.perKm), x * c.perKm); }
    else if (m === 'jam') add('Tarif ' + K.qty + ' jam × ' + rp(p.p), p.p * K.qty);
    else add('Tarif dasar', p.p);
    if (STOPL[K.svc] && K.stops > 1) add((K.stops - 1) + ' ' + STOPL[K.svc] + ' tambahan', (K.stops - 1) * c.stop);
    if (c[K.load]) add('Beban ' + K.load, c[K.load]);
    if (c[K.when]) add(K.when === 'segera' ? 'Layanan segera' : 'Layanan hari ini', c[K.when]);
    return { L: L, total: Math.round(t / 500) * 500 };
  }
  function summary() {
    var m = MODE[K.svc], s = [price().n];
    if (m === 'km') s.push('±' + K.qty + ' km'); if (m === 'jam') s.push(K.qty + ' jam');
    if (STOPL[K.svc] && K.stops > 1) s.push(K.stops + ' ' + STOPL[K.svc]);
    s.push('beban ' + K.load); s.push(K.when === 'jadwal' ? 'terjadwal' : K.when === 'hariini' ? 'hari ini' : 'segera');
    return s.join(', ');
  }
  function count(to) {
    cancelAnimationFrame(raf); var from = cur, t0 = performance.now();
    (function f(t) { var k = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - k, 3); cur = Math.round(from + (to - from) * e); $('#k-total').textContent = rp(cur); if (k < 1) raf = requestAnimationFrame(f); })(t0);
  }
  function update() {
    var r = compute(), sm = summary(); last = { total: r.total, sum: sm };
    $('#k-qty-o').textContent = K.qty + (MODE[K.svc] === 'jam' ? ' jam' : ' km'); $('#k-stops').textContent = K.stops;
    $('#k-sum').textContent = sm; count(r.total);
    $('#k-lines').innerHTML = r.L.map(function (l) { return '<li><span>' + esc(l[0]) + '</span><b>' + rp(l[1]) + '</b></li>'; }).join('');
    $('#k-wa').href = waUrl('Halo ' + db.s.brand + ', saya mau pesan:\n' + sm + '\nEstimasi tarif: ' + rp(r.total) + ' (di luar harga barang)\nMohon konfirmasi tarif ya 🙏');
  }
  function bindCalc() {
    var box = $('#kalkulator'); if (box.dataset.b) return; box.dataset.b = 1;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.seg button'), st = e.target.closest('[data-step]');
      if (b) { var id = b.parentNode.id; if (id === 'k-svc') { K.svc = b.dataset.v; K.stops = 1; K.qty = MODE[K.svc] === 'jam' ? 2 : 5; } else K[id === 'k-load' ? 'load' : 'when'] = b.dataset.v; build(); update(); }
      if (st) { K.stops = Math.min(8, Math.max(1, K.stops + +st.dataset.step)); update(); }
    });
    $('#k-qty').addEventListener('input', function (e) { K.qty = +e.target.value; e.target.style.setProperty('--p', ((K.qty - e.target.min) / (e.target.max - e.target.min) * 100) + '%'); update(); });
    $('#k-order').onclick = function () {
      $('#f-svc').value = K.svc; estimate();
      $('#f-task').value = '[' + last.sum + ', estimasi ' + rp(last.total) + '] ';
      $('#order').scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(function () { $('#f-task').focus(); }, 500);
    };
  }
  /* ---- reveal, count-up, tilt, marquee ---- */
  var io, io2;
  function reveal() {
    var sel = ['.sec .eyebrow', '.sec h2', '.sec .sub', '.why>div', '.show', '.q', '.faq details', '.steps li', '.stat', '.calc-in', '.calc-out', '.check', '.cta h2', '.cta .btn'];
    $$(sel.join(',')).forEach(function (el, i) { if (!el.classList.contains('rv') && !el.dataset.r) { el.classList.add('rv'); el.dataset.r = 1; el.style.setProperty('--d', ((Array.prototype.indexOf.call(el.parentNode.children, el) % 6) * .08) + 's'); } });
    var items = $$('.rv:not([data-o])');
    if (!('IntersectionObserver' in window)) return items.forEach(function (el) { el.classList.remove('rv'); });
    io = io || new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; var el = e.target; io.unobserve(el); el.classList.add('in'); setTimeout(function () { el.classList.remove('rv', 'in'); }, 1100); }); }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { el.dataset.o = 1; io.observe(el); });
    io2 = io2 || new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; io2.unobserve(e.target); if (e.target.classList.contains('phone')) e.target.classList.add('play'); else countUp(e.target); }); }, { threshold: .4 });
    $$('.stat b, .phone').forEach(function (el) { if (!el.dataset.o2) { el.dataset.o2 = 1; io2.observe(el); } });
  }
  function countUp(el) {
    var to = +el.dataset.c, pre = el.dataset.pre || '', suf = el.dataset.suf || '', t0 = performance.now();
    (function f(t) { var k = Math.min(1, (t - t0) / 1200); el.textContent = pre + Math.round(to * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function tilt() {
    $$('.svc').forEach(function (c) {
      c.addEventListener('mousemove', function (e) { var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px'); c.style.setProperty('--ry', ((x / r.width - .5) * 7) + 'deg'); c.style.setProperty('--rx', ((.5 - y / r.height) * 7) + 'deg'); });
      c.addEventListener('mouseleave', function () { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
  }
  function marquee() {
    var w = $('.strip .wrap'); if (w.dataset.m) return; w.dataset.m = 1; var h = w.innerHTML; w.innerHTML = '<div class="mq">' + h + h + '</div>';
  }
  function stats() {
    var min = Math.min.apply(null, db.prices.map(function (p) { return p.p; }));
    $('#st-svc').dataset.c = db.prices.length; $('#st-svc').textContent = db.prices.length;
    $('#st-min').dataset.c = Math.round(min / 1000); $('#st-min').textContent = 'Rp' + Math.round(min / 1000) + 'rb';
  }
  function chrome() {
    if (document.body.dataset.ch) return; document.body.dataset.ch = 1;
    var pr = $('#prog'), de = document.documentElement;
    window.addEventListener('scroll', function () { pr.style.width = (de.scrollTop / Math.max(1, de.scrollHeight - de.clientHeight) * 100) + '%'; }, { passive: true });
    document.addEventListener('focusin', function (e) { if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) document.body.classList.add('kb'); });
    document.addEventListener('focusout', function () { document.body.classList.remove('kb'); });
    if ('IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) $$('.dock a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === e.target.dataset.dk); }); }); }, { rootMargin: '-45% 0px -50% 0px' });
      [['.hero', '#top'], ['#layanan', '#layanan'], ['#kalkulator', '#kalkulator']].forEach(function (t) { var el = $(t[0]); el.dataset.dk = t[1]; so.observe(el); });
    }
  }
  function init() {
    $$('.phone .bub').forEach(function (b, i) { b.style.setProperty('--i', i); });
    stats(); build(); update(); bindCalc(); tilt(); marquee(); reveal(); chrome();
  }
  window.afterRender = init; init();
})();
