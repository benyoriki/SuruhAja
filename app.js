/* SuruhAja — database lokal (localStorage). Ganti DEFAULT di bawah untuk mengubah data awal. */
const KEY = 'suruhaja_v1';
const DEFAULT = {
  s: { brand: 'SuruhAja', wa: '6281234567890', area: 'Bekasi & sekitarnya', pin: '1234' },
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
    ['Kapan bayar?', 'Setelah tugas selesai dan kamu menerima foto bukti. Untuk belanja, uang barang dibahas dulu di chat.'],
    ['Area layanan?', 'Utama di area yang tertera di bawah halaman. Di luar itu, tanya dulu lewat WhatsApp.'],
    ['Apakah data saya aman?', 'Data pesanan di situs ini tersimpan di perangkatmu sendiri (localStorage). Detail sensitif cukup dibahas lewat chat.']
  ],
  orders: []
};
const $ = s => document.querySelector(s);
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = n => 'Rp' + Number(n).toLocaleString('id-ID');
let db;
function load() { try { db = JSON.parse(localStorage.getItem(KEY)) || structuredClone(DEFAULT); } catch (e) { db = structuredClone(DEFAULT); } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { alert('Penyimpanan lokal penuh atau diblokir browser.'); } }
const waUrl = (txt = 'Halo, saya mau tanya layanan suruhan.') => `https://wa.me/${db.s.wa}?text=${encodeURIComponent(txt)}`;

function render() {
  document.title = `${db.s.brand} — Tulis urusanmu, kami yang jalan`;
  $('#brand').textContent = db.s.brand;
  $('#foot-area').textContent = 'Melayani ' + db.s.area;
  $('#yr').textContent = new Date().getFullYear();
  $('#wa-bar').href = waUrl();
  $('#svc-grid').innerHTML = db.prices.map(p => `<button class="svc" data-id="${p.id}"><span class="ic">${p.ic}</span><h3>${esc(p.n)}</h3><p>${esc(p.d)}</p><span class="pr">mulai ${rp(p.p)} <small>${esc(p.u)}</small></span></button>`).join('');
  $('#f-svc').innerHTML = db.prices.map(p => `<option value="${p.id}">${esc(p.n)}</option>`).join('');
  $('#testi').innerHTML = db.testi.map(t => `<div class="q"><i>★★★★★</i><p>${esc(t.t)}</p><b>${esc(t.n)}</b></div>`).join('');
  $('#faq-list').innerHTML = db.faq.map(f => `<details><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`).join('');
  estimate();
}
function estimate() {
  const p = db.prices.find(x => x.id === $('#f-svc').value);
  $('#est').textContent = p ? `Perkiraan mulai ${rp(p.p)}. Tarif akhir disepakati di WhatsApp.` : '';
}

// Contoh tugas bergulir di placeholder + chip
const EX = ['Beli galon dan antar ke rumah…', 'Antre ambil nomor di kantor pos…', 'Titip beli obat di apotek terdekat…', 'Bantu rapikan dan angkat barang gudang…'];
let ei = 0;
setInterval(() => { if (document.activeElement !== $('#f-task')) $('#f-task').placeholder = EX[++ei % EX.length]; }, 2600);
$('#chips').innerHTML = ['Beli galon', 'Antar dokumen', 'Antre urus berkas'].map(c => `<button type="button">${c}</button>`).join('');
$('#chips').onclick = e => { if (e.target.tagName === 'BUTTON') { $('#f-task').value = e.target.textContent + ' '; $('#f-task').focus(); } };
$('#svc-grid').onclick = e => {
  const b = e.target.closest('.svc'); if (!b) return;
  $('#f-svc').value = b.dataset.id; estimate();
  $('#order').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#f-task').focus();
};
$('#f-svc').onchange = estimate;

$('#order').onsubmit = e => {
  e.preventDefault();
  const p = db.prices.find(x => x.id === $('#f-svc').value);
  const o = {
    code: 'SA-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
    at: new Date().toISOString(), status: 'Baru',
    name: $('#f-name').value.trim(), svc: p.n, task: $('#f-task').value.trim(),
    loc: $('#f-loc').value.trim(), when: $('#f-when').value
  };
  db.orders.unshift(o); save();
  const msg = `Halo ${db.s.brand}, saya ${o.name}.\nKode: ${o.code}\nLayanan: ${o.svc}\nTugas: ${o.task}\nLokasi: ${o.loc}\nJadwal: ${o.when}\nMohon info tarifnya ya 🙏`;
  const d = $('#done'); d.hidden = false;
  d.innerHTML = `Suruhan tercatat. Kode pesananmu<br><b>${o.code}</b><br><small>Simpan kode ini untuk cek status.</small><br><a class="btn" target="_blank" rel="noopener" href="${waUrl(msg)}">Lanjut ke WhatsApp</a>`;
  e.target.reset(); estimate();
};

$('#check').onsubmit = e => {
  e.preventDefault();
  const o = db.orders.find(x => x.code === $('#c-code').value.trim().toUpperCase());
  $('#c-out').textContent = o ? `${o.code}: ${o.svc}, status ${o.status}.` : 'Kode tidak ditemukan di perangkat ini. Cek lagi penulisannya, atau tanya lewat WhatsApp.';
};

// Admin
const dlg = $('#dlg');
$('#admin-btn').onclick = () => {
  const pin = prompt('Masukkan PIN admin'); if (pin === null) return;
  if (pin !== db.s.pin) return alert('PIN salah.');
  adminView(); dlg.showModal();
};
function adminView() {
  const st = ['Baru', 'Diproses', 'Selesai', 'Batal'];
  dlg.innerHTML = `<h3>Panel admin</h3>
  <p>${db.orders.length} pesanan, ${db.orders.filter(o => o.status === 'Baru').length} baru. Data tersimpan di browser ini saja.</p>
  <div style="overflow:auto"><table><tr><th>Kode</th><th>Pesanan</th><th>Status</th><th></th></tr>
  ${db.orders.map(o => `<tr><td>${o.code}<br><small>${new Date(o.at).toLocaleDateString('id-ID')}</small></td><td><b>${esc(o.name)}</b>, ${esc(o.svc)}<br>${esc(o.task)}<br><small>${esc(o.loc)}, ${esc(o.when)}</small></td>
  <td><select data-st="${o.code}">${st.map(s => `<option${s === o.status ? ' selected' : ''}>${s}</option>`).join('')}</select></td><td><button class="link" data-del="${o.code}">Hapus</button></td></tr>`).join('') || '<tr><td colspan="4">Belum ada pesanan.</td></tr>'}</table></div>
  <h3 style="margin-top:1.2rem">Pengaturan</h3>
  <div class="row"><label>Nama brand<input id="a-brand" value="${esc(db.s.brand)}"></label><label>Nomor WhatsApp (628…)<input id="a-wa" value="${esc(db.s.wa)}"></label>
  <label>Area layanan<input id="a-area" value="${esc(db.s.area)}"></label><label>PIN admin<input id="a-pin" value="${esc(db.s.pin)}"></label></div>
  <h3 style="margin-top:1.2rem">Tarif mulai dari (Rp)</h3>
  <div class="row">${db.prices.map(p => `<label>${esc(p.n)}<input type="number" min="0" step="1000" data-pr="${p.id}" value="${p.p}"></label>`).join('')}</div>
  <div class="ad"><button class="btn" data-a="save">Simpan</button><button class="btn" data-a="export">Ekspor JSON</button><button class="btn x" data-a="reset">Reset data</button><button class="btn" data-a="close">Tutup</button></div>`;
}
dlg.onchange = e => { const c = e.target.dataset.st; if (c) { db.orders.find(o => o.code === c).status = e.target.value; save(); } };
dlg.onclick = e => {
  const t = e.target;
  if (t.dataset.del && confirm('Hapus pesanan ini?')) { db.orders = db.orders.filter(o => o.code !== t.dataset.del); save(); adminView(); }
  const a = t.dataset.a; if (!a) return;
  if (a === 'close') dlg.close();
  if (a === 'save') {
    db.s.brand = $('#a-brand').value.trim() || 'SuruhAja'; db.s.wa = $('#a-wa').value.replace(/\D/g, '');
    db.s.area = $('#a-area').value.trim(); db.s.pin = $('#a-pin').value.trim() || '1234';
    dlg.querySelectorAll('[data-pr]').forEach(i => { db.prices.find(p => p.id === i.dataset.pr).p = Math.max(0, +i.value || 0); });
    save(); render(); dlg.close();
  }
  if (a === 'export') {
    const l = document.createElement('a'); l.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' })); l.download = 'suruhaja-data.json'; l.click();
  }
  if (a === 'reset' && confirm('Hapus SEMUA data lokal dan kembali ke bawaan?')) { localStorage.removeItem(KEY); load(); render(); dlg.close(); }
};
load(); render();
