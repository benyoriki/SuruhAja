/* SuruhAja — data lokal (localStorage). Ubah DEFAULT untuk data awal. Kompatibel Chrome 109 (Windows 7). */
var KEY = 'suruhaja_v2', OLD = 'suruhaja_v1';
var DEFAULT = {
  s: { brand: 'SuruhAja', wa: '6289688338182', area: 'Bekasi & sekitarnya', pin: '1234' },
  prices: [
    { id: 'antar', ic: '📦', n: 'Antar barang', d: 'Paket, dokumen, bekal ketinggalan, titipan.', p: 15000, u: '/antar' },
    { id: 'beli', ic: '🛒', n: 'Belikan sesuatu', d: 'Galon, makanan, obat, kebutuhan harian.', p: 12000, u: '/belanja' },
    { id: 'antre', ic: '⏳', n: 'Antre & urus', d: 'Antre loket, bank, fotokopi, urus berkas.', p: 35000, u: '/jam' },
    { id: 'beres', ic: '🧹', n: 'Beberes & bantu rumah', d: 'Bersih-bersih, angkat barang, rapikan.', p: 50000, u: '/jam' },
    { id: 'cari', ic: '🔎', n: 'Cari barang', d: 'Keliling toko untuk barang yang susah dicari.', p: 30000, u: '/tugas' },
    { id: 'lain', ic: '✨', n: 'Lainnya', d: 'Selama halal dan aman, ceritakan saja.', p: 20000, u: '/tugas' }
  ],
  testi: [
    { n: 'Rina, Bekasi', t: 'Galon habis jam 9 malam, 20 menit sudah sampai. Tarifnya jelas dari awal.' },
    { n: 'Dimas, Jakarta Timur', t: 'Minta tolong antre urus berkas. Dapat foto bukti dan kabar tiap tahap.' },
    { n: 'Bu Lilis, Bekasi', t: 'Dibantu angkat dan rapikan gudang kecil. Sopan dan rapi kerjanya.' }
  ],
  faq: [
    ['Apa saja yang bisa disuruh?', 'Hampir semua tugas harian yang halal dan aman: antar, beli, antre, beberes, cari barang. Kami menolak tugas yang melanggar hukum, membahayakan, atau merugikan orang lain.'],
    ['Bagaimana tarifnya?', 'Harga di situs adalah tarif mulai dari. Tarif akhir disepakati di WhatsApp sebelum tugas dikerjakan.'],
    ['Kapan bayar?', 'Setelah tugas selesai dan kamu menerima foto bukti. Untuk belanja, uang barang dibahas dulu di chat dan dihitung terpisah dari jasa.'],
    ['Area layanan?', 'Utama di area yang tertera di bawah halaman. Di luar itu, tanya dulu lewat WhatsApp.'],
    ['Apakah data saya aman?', 'Data pesanan di situs ini tersimpan di perangkatmu sendiri (localStorage). Detail sensitif cukup dibahas lewat chat.']
  ],
  exp: [], orders: []
};
var $ = function (s) { return document.querySelector(s); };
var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
var N = function (v) { return Math.max(0, Math.round(Number(v)) || 0); };
var rp = function (n) { return (n < 0 ? '-' : '') + 'Rp' + Math.abs(n).toLocaleString('id-ID'); };
var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
var fmtDT = function (i) { return new Date(i).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); };
var db;
function norm(o) {
  o.fee = N(o.fee); o.goods = N(o.goods); o.fuel = N(o.fuel); o.other = N(o.other); o.km = Number(o.km) || 0;
  o.pay = o.pay || 'Belum'; o.from = o.from || ''; o.to = o.to || ''; o.log = o.log || []; o.status = o.status || 'Baru'; return o;
}
function load() {
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
  if (!db) {
    db = clone(DEFAULT);
    try { var old = JSON.parse(localStorage.getItem(OLD)); if (old && old.orders) db.orders = old.orders; } catch (e) {}
  }
  db.exp = db.exp || []; db.orders = (db.orders || []).map(norm);
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { alert('Penyimpanan lokal penuh atau diblokir browser.'); } }
function waUrl(txt) { return 'https://wa.me/' + db.s.wa + '?text=' + encodeURIComponent(txt || 'Halo ' + db.s.brand + ', saya mau tanya layanan suruhan.'); }

/* ---------- Halaman publik ---------- */
function render() {
  document.title = db.s.brand + ' — Jasa Suruhan Harian | Tulis urusanmu, kami yang jalan';
  $('#brand').textContent = db.s.brand; $('#foot-area').textContent = 'Melayani ' + db.s.area; $('#yr').textContent = new Date().getFullYear();
  $('#wa-bar').href = waUrl(); $('#wa-hero').href = waUrl();
  $('#svc-grid').innerHTML = db.prices.map(function (p) { return '<button class="svc" data-id="' + p.id + '"><span class="ic">' + p.ic + '</span><h3>' + esc(p.n) + '</h3><p>' + esc(p.d) + '</p><span class="pr">mulai ' + rp(p.p) + ' <small>' + esc(p.u) + '</small></span></button>'; }).join('');
  $('#f-svc').innerHTML = db.prices.map(function (p) { return '<option value="' + p.id + '">' + esc(p.n) + '</option>'; }).join('');
  $('#testi').innerHTML = db.testi.map(function (t) { return '<div class="q"><i>★★★★★</i><p>' + esc(t.t) + '</p><b>' + esc(t.n) + '</b></div>'; }).join('');
  $('#faq-list').innerHTML = db.faq.map(function (f) { return '<details><summary>' + esc(f[0]) + '</summary><p>' + esc(f[1]) + '</p></details>'; }).join('');
  estimate();
}
function estimate() {
  var p = db.prices.filter(function (x) { return x.id === $('#f-svc').value; })[0];
  $('#est').textContent = p ? 'Perkiraan mulai ' + rp(p.p) + '. Tarif akhir disepakati di WhatsApp.' : '';
}
var EX = ['Beli galon dan antar ke rumah…', 'Antre ambil nomor di kantor pos…', 'Titip beli obat di apotek terdekat…', 'Bantu rapikan dan angkat barang gudang…'], ei = 0;
setInterval(function () { if (document.activeElement !== $('#f-task')) $('#f-task').placeholder = EX[++ei % EX.length]; }, 2600);
$('#chips').innerHTML = ['Beli galon', 'Antar dokumen', 'Antre urus berkas'].map(function (c) { return '<button type="button">' + c + '</button>'; }).join('');
$('#chips').onclick = function (e) { if (e.target.tagName === 'BUTTON') { $('#f-task').value = e.target.textContent + ' '; $('#f-task').focus(); } };
$('#svc-grid').onclick = function (e) {
  var b = e.target.closest('.svc'); if (!b) return;
  $('#f-svc').value = b.dataset.id; estimate();
  $('#order').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#f-task').focus();
};
$('#f-svc').onchange = estimate;
$('#order').onsubmit = function (e) {
  e.preventDefault();
  var p = db.prices.filter(function (x) { return x.id === $('#f-svc').value; })[0];
  var o = norm({ code: 'SA-' + Math.random().toString(36).slice(2, 6).toUpperCase(), at: new Date().toISOString(), status: 'Baru',
    name: $('#f-name').value.trim(), svc: p.n, task: $('#f-task').value.trim(), loc: $('#f-loc').value.trim(), when: $('#f-when').value });
  o.log.push({ t: o.at, x: 'Pesanan dibuat' });
  db.orders.unshift(o); save();
  var msg = 'Halo ' + db.s.brand + ', saya ' + o.name + '.\nKode: ' + o.code + '\nLayanan: ' + o.svc + '\nTugas: ' + o.task + '\nLokasi: ' + o.loc + '\nJadwal: ' + o.when + '\nMohon info tarifnya ya 🙏';
  var d = $('#done'); d.hidden = false;
  d.innerHTML = 'Suruhan tercatat. Kode pesananmu<br><b>' + o.code + '</b><br><small>Simpan kode ini untuk cek status.</small><br><a class="btn" target="_blank" rel="noopener" href="' + waUrl(msg) + '">Lanjut ke WhatsApp</a>';
  e.target.reset(); estimate();
};
$('#check').onsubmit = function (e) {
  e.preventDefault();
  var c = $('#c-code').value.trim().toUpperCase(), o = db.orders.filter(function (x) { return x.code === c; })[0];
  $('#c-out').textContent = o ? o.code + ': ' + o.svc + ', status ' + o.status + (o.log.length ? '. Terakhir: ' + o.log[o.log.length - 1].x : '') + '.' : 'Kode tidak ditemukan di perangkat ini. Cek penulisannya, atau tanya lewat WhatsApp.';
};

/* ---------- Admin: pesanan, keuangan, perjalanan ---------- */
var dlg = $('#dlg'), tab = 'ord', openSet = {}, month = 'all', ST = ['Baru', 'Diproses', 'Selesai', 'Batal'];
$('#admin-btn').onclick = function () {
  var pin = prompt('Masukkan PIN admin'); if (pin === null) return;
  if (pin !== db.s.pin) return alert('PIN salah.');
  adminView(); dlg.showModal();
};
function calc(o) { var cost = o.fuel + o.other; return { fee: o.fee, cost: cost, net: o.fee - cost, talangan: o.goods, total: o.fee + o.goods }; }
function mOf(o) { return (o.doneAt || o.at || '').slice(0, 7); }
function mLabel(m) { return new Date(m + '-15').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }); }
function calcHTML(o) {
  var c = calc(o);
  return 'Pelanggan membayar: <b>' + rp(c.total) + '</b> (jasa ' + rp(c.fee) + ' + uang barang ' + rp(c.talangan) + ')<br>Biaya jalan: ' + rp(c.cost) + ' (bensin/ongkos ' + rp(o.fuel) + ' + lain ' + rp(o.other) + ')<br>Penghasilan bersih: <b>' + rp(c.net) + '</b> = jasa − biaya jalan';
}
function adminView() {
  var tabs = [['ord', 'Pesanan'], ['fin', 'Keuangan'], ['set', 'Pengaturan']];
  var body = tab === 'ord' ? vOrders() : tab === 'fin' ? vFinance() : vSettings();
  dlg.innerHTML = '<h3>Panel admin</h3><div class="tabs">' + tabs.map(function (t) { return '<button data-tab="' + t[0] + '" class="' + (tab === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>' + body + '<div class="ad"><button class="btn" data-a="close">Tutup</button></div>';
}
function vOrders() {
  var h = '<p>' + db.orders.length + ' pesanan, ' + db.orders.filter(function (o) { return o.status === 'Baru'; }).length + ' baru. Pesanan dari WhatsApp bisa dicatat lewat tombol di bawah.</p><div class="ad"><button class="btn" data-a="new">+ Catat pesanan manual</button></div><div style="margin-top:.8rem">';
  h += db.orders.map(function (o) {
    var c = calc(o);
    return '<details class="ord" data-c="' + o.code + '"' + (openSet[o.code] ? ' open' : '') + '><summary><b>' + o.code + ' · ' + esc(o.name) + '</b><small>' + esc(o.svc) + ' · ' + o.status + ' · bersih ' + rp(c.net) + ' · ' + (o.pay === 'Lunas' ? 'Lunas' : 'Belum bayar') + '</small></summary><div class="in">' +
      '<div class="f3"><label>Nama<input data-k="name" value="' + esc(o.name) + '"></label><label>Layanan<select data-k="svc">' + db.prices.map(function (p) { return '<option' + (p.n === o.svc ? ' selected' : '') + '>' + esc(p.n) + '</option>'; }).join('') + '</select></label><label>Lokasi<input data-k="loc" value="' + esc(o.loc) + '"></label></div>' +
      '<label>Tugas<textarea data-k="task" rows="2">' + esc(o.task) + '</textarea></label>' +
      '<div class="f3"><label>Status<select data-k="status">' + ST.map(function (s) { return '<option' + (s === o.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></label><label>Pembayaran<select data-k="pay"><option' + (o.pay === 'Belum' ? ' selected' : '') + '>Belum</option><option' + (o.pay === 'Lunas' ? ' selected' : '') + '>Lunas</option></select></label></div>' +
      '<h4>Hitungan (Rp)</h4><div class="f3"><label>Tarif jasa<input type="number" min="0" step="1000" data-k="fee" data-m value="' + o.fee + '"></label><label>Uang barang (talangan)<input type="number" min="0" step="1000" data-k="goods" data-m value="' + o.goods + '"></label><label>Bensin / ongkos<input type="number" min="0" step="500" data-k="fuel" data-m value="' + o.fuel + '"></label><label>Biaya lain<input type="number" min="0" step="500" data-k="other" data-m value="' + o.other + '"></label></div>' +
      '<div class="calc">' + calcHTML(o) + '</div>' +
      '<h4>Perjalanan</h4><div class="f3"><label>Dari<input data-k="from" value="' + esc(o.from) + '" placeholder="Titik awal"></label><label>Ke<input data-k="to" value="' + esc(o.to) + '" placeholder="Tujuan"></label><label>Jarak (km)<input type="number" min="0" step="0.1" data-k="km" value="' + o.km + '"></label></div>' +
      '<ul class="log">' + (o.log.map(function (l, i) { return '<li><small>' + fmtDT(l.t) + '</small> ' + esc(l.x) + ' <button data-dl="' + o.code + '|' + i + '" title="Hapus">✕</button></li>'; }).join('') || '<li><small>Belum ada catatan perjalanan</small></li>') + '</ul>' +
      '<div class="qa">' + ['Berangkat', 'Tiba di lokasi', 'Beli barang', 'Antre', 'Dalam perjalanan kembali', 'Selesai & foto bukti dikirim'].map(function (q) { return '<button data-ql="' + o.code + '|' + q + '">' + q + '</button>'; }).join('') + '</div>' +
      '<div class="check" style="max-width:none;margin:0"><input data-lt placeholder="Catatan perjalanan sendiri…"><button class="mini" data-al="' + o.code + '">Tambah</button></div>' +
      '<div class="ad"><button class="btn" data-sv="' + o.code + '">Simpan pesanan</button><button class="mini x" data-del="' + o.code + '">Hapus</button></div></div></details>';
  }).join('') || '<p>Belum ada pesanan.</p>';
  return h + '</div>';
}
function inRange(o) { return o.status === 'Selesai' && (month === 'all' || mOf(o) === month); }
function vFinance() {
  var done = db.orders.filter(function (o) { return o.status === 'Selesai'; });
  var ms = []; done.concat(db.exp.map(function (e) { return { at: e.date }; })).forEach(function (o) { var m = (o.doneAt || o.at || '').slice(0, 7); if (m && ms.indexOf(m) < 0) ms.push(m); }); ms.sort().reverse();
  var L = db.orders.filter(inRange), E = db.exp.filter(function (e) { return month === 'all' || e.date.slice(0, 7) === month; });
  var sum = function (a, f) { return a.reduce(function (s, x) { return s + f(x); }, 0); };
  var fee = sum(L, function (o) { return o.fee; }), cost = sum(L, function (o) { return o.fuel + o.other; }), ex = sum(E, function (e) { return e.amt; }), gd = sum(L, function (o) { return o.goods; });
  var net = fee - cost - ex, due = sum(L.filter(function (o) { return o.pay !== 'Lunas'; }), function (o) { return o.fee + o.goods; });
  var h = '<label style="max-width:260px">Periode<select data-month><option value="all">Semua waktu</option>' + ms.map(function (m) { return '<option value="' + m + '"' + (m === month ? ' selected' : '') + '>' + mLabel(m) + '</option>'; }).join('') + '</select></label>';
  h += '<div class="kpis"><div class="kpi"><small>Pendapatan jasa</small><b>' + rp(fee) + '</b></div><div class="kpi r"><small>Biaya jalan (bensin, ongkos, lain)</small><b>' + rp(cost) + '</b></div><div class="kpi r"><small>Pengeluaran umum</small><b>' + rp(ex) + '</b></div><div class="kpi g"><small>Laba bersih</small><b>' + rp(net) + '</b></div><div class="kpi"><small>Tugas selesai</small><b>' + L.length + '</b></div><div class="kpi"><small>Rata-rata bersih / tugas</small><b>' + rp(L.length ? Math.round((fee - cost) / L.length) : 0) + '</b></div><div class="kpi"><small>Uang talangan (bukan penghasilan)</small><b>' + rp(gd) + '</b></div><div class="kpi r"><small>Belum dibayar pelanggan</small><b>' + rp(due) + '</b></div></div>';
  h += '<p class="fine" style="font-size:.8rem;color:var(--mute)">Rumus: Laba bersih = Tarif jasa − Bensin/ongkos − Biaya lain − Pengeluaran umum. Uang barang yang kamu talangi dikembalikan pelanggan, jadi tidak dihitung sebagai penghasilan. Hanya pesanan berstatus Selesai yang dihitung.</p>';
  h += '<h4>Rincian per pesanan</h4><div class="tbl"><table><tr><th>Kode</th><th>Layanan</th><th class="n">Jasa</th><th class="n">Biaya</th><th class="n">Bersih</th><th class="n">Km</th><th>Bayar</th></tr>' + (L.map(function (o) { var c = calc(o); return '<tr><td>' + o.code + '<br><small>' + esc(o.name) + '</small></td><td>' + esc(o.svc) + '</td><td class="n">' + rp(c.fee) + '</td><td class="n">' + rp(c.cost) + '</td><td class="n"><b>' + rp(c.net) + '</b></td><td class="n">' + o.km + '</td><td>' + o.pay + '</td></tr>'; }).join('') || '<tr><td colspan="7">Belum ada pesanan selesai di periode ini.</td></tr>') + '</table></div>';
  var by = {}; L.forEach(function (o) { var b = by[o.svc] = by[o.svc] || { n: 0, f: 0, c: 0 }; b.n++; b.f += o.fee; b.c += o.fuel + o.other; });
  h += '<h4>Per layanan</h4><div class="tbl"><table><tr><th>Layanan</th><th class="n">Tugas</th><th class="n">Jasa</th><th class="n">Bersih</th></tr>' + (Object.keys(by).map(function (k) { return '<tr><td>' + esc(k) + '</td><td class="n">' + by[k].n + '</td><td class="n">' + rp(by[k].f) + '</td><td class="n">' + rp(by[k].f - by[k].c) + '</td></tr>'; }).join('') || '<tr><td colspan="4">-</td></tr>') + '</table></div>';
  if (month === 'all' && ms.length) {
    h += '<h4>Per bulan</h4><div class="tbl"><table><tr><th>Bulan</th><th class="n">Tugas</th><th class="n">Jasa</th><th class="n">Biaya</th><th class="n">Pengeluaran umum</th><th class="n">Laba bersih</th></tr>' + ms.map(function (m) {
      var l = done.filter(function (o) { return mOf(o) === m; }), f = sum(l, function (o) { return o.fee; }), c = sum(l, function (o) { return o.fuel + o.other; }), x = sum(db.exp.filter(function (e) { return e.date.slice(0, 7) === m; }), function (e) { return e.amt; });
      return '<tr><td>' + mLabel(m) + '</td><td class="n">' + l.length + '</td><td class="n">' + rp(f) + '</td><td class="n">' + rp(c) + '</td><td class="n">' + rp(x) + '</td><td class="n"><b>' + rp(f - c - x) + '</b></td></tr>'; }).join('') + '</table></div>';
  }
  h += '<h4>Pengeluaran umum (pulsa, servis motor, dll)</h4><div class="tbl"><table>' + (E.map(function (e) { return '<tr><td>' + esc(e.date) + '</td><td>' + esc(e.ket) + '</td><td class="n">' + rp(e.amt) + '</td><td><button class="mini x" data-de="' + e.id + '">Hapus</button></td></tr>'; }).join('') || '<tr><td>Belum ada.</td></tr>') + '</table></div>';
  h += '<div class="f3" style="margin-top:.6rem"><label>Tanggal<input type="date" id="e-d" value="' + new Date().toISOString().slice(0, 10) + '"></label><label>Keterangan<input id="e-k" placeholder="Pulsa / servis motor"></label><label>Jumlah (Rp)<input type="number" min="0" step="1000" id="e-a"></label></div><div class="ad"><button class="btn" data-a="addexp">Tambah pengeluaran</button><button class="btn" data-a="csv">Ekspor CSV (Excel)</button></div>';
  return h;
}
function vSettings() {
  return '<div class="f3"><label>Nama brand<input id="a-brand" value="' + esc(db.s.brand) + '"></label><label>Nomor WhatsApp (628…)<input id="a-wa" value="' + esc(db.s.wa) + '"></label><label>Area layanan<input id="a-area" value="' + esc(db.s.area) + '"></label><label>PIN admin<input id="a-pin" value="' + esc(db.s.pin) + '"></label></div><h4>Tarif mulai dari (Rp)</h4><div class="f3">' +
    db.prices.map(function (p) { return '<label>' + esc(p.n) + '<input type="number" min="0" step="1000" data-pr="' + p.id + '" value="' + p.p + '"></label>'; }).join('') +
    '</div><div class="ad"><button class="btn" data-a="save">Simpan pengaturan</button><button class="btn" data-a="export">Ekspor JSON (cadangan)</button><button class="btn" data-a="import">Impor JSON</button><button class="btn x" data-a="reset">Reset semua</button></div><input type="file" id="imp" accept=".json,application/json" hidden>';
}
function grab(box) { // simpan semua field pesanan dari satu <details>
  var o = db.orders.filter(function (x) { return x.code === box.dataset.c; })[0], was = o.status;
  box.querySelectorAll('[data-k]').forEach(function (i) { var k = i.dataset.k; o[k] = i.hasAttribute('data-m') ? N(i.value) : k === 'km' ? Number(i.value) || 0 : i.value; });
  if (o.status === 'Selesai' && was !== 'Selesai') { o.doneAt = new Date().toISOString(); o.log.push({ t: o.doneAt, x: 'Pesanan selesai' }); }
  return o;
}
function logAdd(code, txt) { var o = db.orders.filter(function (x) { return x.code === code; })[0]; o.log.push({ t: new Date().toISOString(), x: txt }); }
function keepOpen() { dlg.querySelectorAll('details.ord').forEach(function (d) { openSet[d.dataset.c] = d.open; }); }
dlg.addEventListener('input', function (e) {
  if (!e.target.hasAttribute('data-m')) return;
  var box = e.target.closest('details'), t = { fee: 0, goods: 0, fuel: 0, other: 0 };
  box.querySelectorAll('[data-m]').forEach(function (i) { t[i.dataset.k] = N(i.value); });
  box.querySelector('.calc').innerHTML = calcHTML(t);
});
dlg.addEventListener('change', function (e) { if (e.target.hasAttribute('data-month')) { month = e.target.value; adminView(); }
  if (e.target.id === 'imp' && e.target.files[0]) { var r = new FileReader(); r.onload = function () { try { var d = JSON.parse(r.result); if (!d.orders || !d.prices) throw 0; if (!confirm('Timpa data sekarang dengan file ini?')) return; db = d; load2(); save(); render(); adminView(); } catch (x) { alert('File tidak valid.'); } }; r.readAsText(e.target.files[0]); } });
function load2() { db.exp = db.exp || []; db.orders = (db.orders || []).map(norm); }
dlg.addEventListener('click', function (e) {
  var t = e.target, d = t.dataset;
  if (d.tab) { keepOpen(); tab = d.tab; return adminView(); }
  if (d.sv) { var o = grab(t.closest('details')); save(); keepOpen(); openSet[o.code] = true; return adminView(); }
  if (d.del) { if (confirm('Hapus pesanan ' + d.del + '?')) { db.orders = db.orders.filter(function (o) { return o.code !== d.del; }); save(); adminView(); } return; }
  if (d.ql || d.al) {
    var box = t.closest('details'), c = (d.ql || d.al).split('|')[0], txt = d.ql ? d.ql.split('|')[1] : box.querySelector('[data-lt]').value.trim();
    if (!txt) return; grab(box); logAdd(c, txt); save(); keepOpen(); openSet[c] = true; return adminView();
  }
  if (d.dl) { var p = d.dl.split('|'), od = db.orders.filter(function (x) { return x.code === p[0]; })[0]; grab(t.closest('details')); od.log.splice(+p[1], 1); save(); keepOpen(); openSet[p[0]] = true; return adminView(); }
  if (d.de) { db.exp = db.exp.filter(function (x) { return String(x.id) !== d.de; }); save(); return adminView(); }
  var a = d.a; if (!a) return;
  if (a === 'close') dlg.close();
  if (a === 'new') { var n = norm({ code: 'SA-' + Math.random().toString(36).slice(2, 6).toUpperCase(), at: new Date().toISOString(), status: 'Diproses', name: 'Pelanggan baru', svc: db.prices[0].n, task: '', loc: '', when: 'Secepatnya' }); n.log.push({ t: n.at, x: 'Dicatat manual' }); db.orders.unshift(n); save(); openSet[n.code] = true; adminView(); }
  if (a === 'addexp') { var am = N($('#e-a').value), k = $('#e-k').value.trim(); if (!am || !k) return alert('Isi keterangan dan jumlah.'); db.exp.push({ id: Date.now(), date: $('#e-d').value, ket: k, amt: am }); save(); adminView(); }
  if (a === 'save') {
    db.s.brand = $('#a-brand').value.trim() || 'SuruhAja'; db.s.wa = $('#a-wa').value.replace(/\D/g, ''); db.s.area = $('#a-area').value.trim(); db.s.pin = $('#a-pin').value.trim() || '1234';
    dlg.querySelectorAll('[data-pr]').forEach(function (i) { db.prices.filter(function (p) { return p.id === i.dataset.pr; })[0].p = N(i.value); });
    save(); render(); alert('Tersimpan.');
  }
  if (a === 'export') { dl('suruhaja-cadangan.json', JSON.stringify(db, null, 2), 'application/json'); }
  if (a === 'import') $('#imp').click();
  if (a === 'csv') {
    var rows = [['Kode', 'Tanggal', 'Selesai', 'Nama', 'Layanan', 'Status', 'Bayar', 'Tarif jasa', 'Uang barang', 'Bensin/ongkos', 'Biaya lain', 'Bersih', 'Km', 'Dari', 'Ke', 'Perjalanan']];
    db.orders.forEach(function (o) { rows.push([o.code, o.at.slice(0, 10), (o.doneAt || '').slice(0, 10), o.name, o.svc, o.status, o.pay, o.fee, o.goods, o.fuel, o.other, calc(o).net, o.km, o.from, o.to, o.log.map(function (l) { return fmtDT(l.t) + ' ' + l.x; }).join(' > ')]); });
    dl('keuangan-suruhaja.csv', '\ufeff' + rows.map(function (r) { return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n'), 'text/csv');
  }
  if (a === 'reset' && confirm('Hapus SEMUA data lokal (pesanan & keuangan)?')) { localStorage.removeItem(KEY); load(); render(); dlg.close(); }
});
function dl(name, txt, type) { var l = document.createElement('a'); l.href = URL.createObjectURL(new Blob([txt], { type: type })); l.download = name; document.body.appendChild(l); l.click(); l.remove(); }

/* ---------- PWA ---------- */
var deferred, hp = $('#help');
window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; $('#install-btn').classList.add('on'); });
window.addEventListener('appinstalled', function () { $('#install-btn').classList.remove('on'); deferred = null; });
$('#install-btn').onclick = function () { if (deferred) { deferred.prompt(); deferred = null; $('#install-btn').classList.remove('on'); } else helpOpen(); };
$('#help-btn').onclick = helpOpen;
function helpOpen() {
  hp.innerHTML = '<div class="help"><h3>Pasang SuruhAja sebagai aplikasi</h3><h4>Android (Chrome)</h4><ol><li>Buka situs ini di Chrome.</li><li>Ketuk menu ⋮ lalu pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.</li><li>Ikon SuruhAja muncul di layar HP.</li></ol><h4>Windows 7 / 10 / 11 (Chrome atau Edge)</h4><ol><li>Buka situs ini di Chrome atau Edge. Windows 7 butuh Chrome/Edge versi 109 (versi terakhir untuk Windows 7).</li><li>Klik ikon pasang di kanan address bar, atau menu ⋮ → <b>Instal SuruhAja</b> (Chrome: <i>Simpan dan bagikan → Instal</i>).</li><li>Aplikasi terbuka di jendela sendiri dan bisa dipasang ke Taskbar.</li></ol><p class="fine" style="font-size:.8rem">Setelah terpasang, tampilan tetap bisa dibuka saat offline, namun mengirim pesanan ke WhatsApp butuh internet.</p><div class="ad"><button class="btn" data-x>Mengerti</button></div></div>';
  hp.showModal();
}
hp.onclick = function (e) { if (e.target.hasAttribute('data-x') || e.target === hp) hp.close(); };
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
load(); render();
