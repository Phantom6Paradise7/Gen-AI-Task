const KEY = 'qr-links-v1';
const EXAMPLE = { name: 'Google AI Mode', url: 'https://www.google.com/search?udm=50' };
const $ = id => document.getElementById(id);
let items = [];

try { items = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
if (!Array.isArray(items)) { items = [{ id: uid(), ...EXAMPLE }]; persist(); }

function uid() { return Math.random().toString(36).slice(2, 10); }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }

// Turn input into a valid http(s) link or return null
function normalize(raw) {
  let s = raw.trim();
  if (!s) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = 'https://' + s;
  try {
    const u = new URL(s);
    if (!/^https?:$/.test(u.protocol)) return null;
    if (!u.hostname.includes('.') && u.hostname !== 'localhost') return null;
    return s;
  } catch (e) { return null; }
}

function defaultName(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return url; }
}

// Draw the QR to a PNG data URL (the QR stores the link itself, so scanning opens it directly)
function qrDataUrl(text, size) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount(), m = 4;
  const scale = Math.max(1, Math.ceil(size / (n + m * 2)));
  const c = document.createElement('canvas');
  c.width = c.height = (n + m * 2) * scale;
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#000';
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++)
    if (qr.isDark(r, k)) x.fillRect((k + m) * scale, (r + m) * scale, scale, scale);
  return c.toDataURL('image/png');
}

function img(url, size, alt) {
  const i = new Image();
  i.alt = alt;
  i.src = qrDataUrl(url, size);
  return i;
}

function showPreview(item) {
  const box = $('qrbox');
  box.textContent = '';
  const i = img(item.url, 600, 'QR code for ' + item.name);
  i.addEventListener('click', () => openZoom(item));
  box.appendChild(i);
  $('cur').textContent = item.url;
}

function render() {
  const ul = $('list');
  ul.textContent = '';
  if (!items.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'Nothing saved yet. Generate a QR code and it will show up here.';
    ul.appendChild(p);
    return;
  }
  items.forEach(item => {
    const li = document.createElement('li');

    const meta = document.createElement('div');
    meta.className = 'meta';
    const name = document.createElement('input');
    name.type = 'text';
    name.value = item.name;
    name.setAttribute('aria-label', 'Name for ' + item.url);
    name.addEventListener('input', () => { item.name = name.value; persist(); });
    const link = document.createElement('a');
    link.href = item.url; link.target = '_blank'; link.rel = 'noopener';
    link.textContent = item.url;
    meta.append(name, link);

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.title = 'Click to zoom';
    thumb.appendChild(img(item.url, 300, 'QR code for ' + item.name));
    thumb.addEventListener('click', () => openZoom(item));

    const del = document.createElement('button');
    del.className = 'del';
    del.type = 'button';
    del.textContent = 'Delete';
    del.addEventListener('click', () => {
      items = items.filter(x => x.id !== item.id);
      persist(); render();
    });

    li.append(meta, thumb, del);
    ul.appendChild(li);
  });
}

// Zoom dialog
let zoomed = null;
function openZoom(item) {
  zoomed = item;
  $('dTitle').textContent = item.name || defaultName(item.url);
  $('dUrl').textContent = item.url;
  $('dImg').src = qrDataUrl(item.url, 1000);
  $('dlg').showModal();
}
$('dClose').onclick = () => $('dlg').close();
$('dlg').addEventListener('click', e => { if (e.target === $('dlg')) $('dlg').close(); });
$('dDl').onclick = () => {
  if (!zoomed) return;
  const a = document.createElement('a');
  a.href = qrDataUrl(zoomed.url, 1000);
  a.download = (zoomed.name || 'qr').replace(/[^\w-]+/g, '_') + '.png';
  a.click();
};

function generate(raw, name) {
  const err = $('err');
  err.textContent = '';
  if (typeof qrcode === 'undefined') { err.textContent = 'The QR library could not load. Check your internet connection and reload.'; return; }
  const url = normalize(raw);
  if (!url) { err.textContent = 'Enter a valid link, like google.com or https://example.com/page.'; return; }
  let item = items.find(x => x.url === url);
  if (!item) {
    item = { id: uid(), name: name || defaultName(url), url };
    items.unshift(item);
  }
  try { showPreview(item); } catch (e) { items = items.filter(x => x !== item); err.textContent = 'That link is too long to fit in a QR code.'; return; }
  persist(); render();
}

$('f').addEventListener('submit', e => { e.preventDefault(); generate($('url').value); });
$('ex').addEventListener('click', () => { $('url').value = EXAMPLE.url; generate(EXAMPLE.url, EXAMPLE.name); });

render();
if (items.length && typeof qrcode !== 'undefined') showPreview(items[0]);
