'use strict';

const STORAGE_KEY = 'failTemuDuga.profile.v1';
const fields = [...document.querySelectorAll('[data-save]')];
const checks = [...document.querySelectorAll('#tocGrid input[type="checkbox"]')];

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    fields.forEach((field) => {
      if (typeof saved[field.dataset.save] === 'string') field.value = saved[field.dataset.save];
    });
    if (Array.isArray(saved.checks)) checks.forEach((box, i) => { box.checked = Boolean(saved.checks[i]); });
  } catch (error) {
    console.warn('Maklumat tempatan tidak dapat dibaca.', error);
  }
  updateProgress();
}

function saveProfile() {
  const profile = {};
  fields.forEach((field) => { profile[field.dataset.save] = field.value; });
  profile.checks = checks.map((box) => box.checked);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    document.getElementById('saveStatus').textContent = 'Maklumat disimpan pada peranti ini.';
  } catch (error) {
    document.getElementById('saveStatus').textContent = 'Simpanan automatik tidak tersedia dalam pelayar ini.';
  }
}

function updateProgress() {
  const done = checks.filter((box) => box.checked).length;
  document.getElementById('progressText').textContent = `${done} / ${checks.length}`;
  document.getElementById('progressBar').style.width = `${checks.length ? done / checks.length * 100 : 0}%`;
}

fields.forEach((field) => field.addEventListener('input', saveProfile));
checks.forEach((box) => box.addEventListener('change', () => { updateProgress(); saveProfile(); }));

document.getElementById('clearBtn').addEventListener('click', () => {
  if (!window.confirm('Kosongkan semua maklumat kulit fail dan tanda senarai semak?')) return;
  fields.forEach((field) => { field.value = ''; });
  checks.forEach((box) => { box.checked = false; });
  saveProfile();
  updateProgress();
});

document.getElementById('printBtn').addEventListener('click', () => window.print());

const imageInput = document.getElementById('imageInput');
imageInput.addEventListener('change', (event) => {
  const grid = document.getElementById('imageGrid');
  [...event.target.files].forEach((file) => {
    if (!file.type.startsWith('image/')) return;
    const card = document.createElement('article');
    card.className = 'image-card';
    const img = document.createElement('img');
    img.alt = file.name;
    img.src = URL.createObjectURL(file);
    const caption = document.createElement('p');
    caption.textContent = file.name;
    card.append(img, caption);
    grid.append(card);
  });
  event.target.value = '';
});

const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
fileInput.addEventListener('change', (event) => {
  const chosen = [...event.target.files];
  if (!chosen.length) return;
  const empty = fileList.querySelector('.empty-state');
  if (empty) empty.remove();
  chosen.forEach((file) => {
    const item = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = `${file.name} · ${formatBytes(file.size)}`;
    const download = document.createElement('button');
    download.type = 'button';
    download.textContent = 'Muat turun salinan';
    download.addEventListener('click', () => {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    });
    item.append(name, download);
    fileList.append(item);
  });
  event.target.value = '';
});

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getYouTubeEmbed(rawUrl) {
  try {
    const url = new URL(rawUrl);
    let id = '';
    if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
      else if (url.pathname.startsWith('/embed/')) id = url.pathname.split('/')[2] || '';
      else if (url.pathname.startsWith('/shorts/')) id = url.pathname.split('/')[2] || '';
    }
    return /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : '';
  } catch {
    return '';
  }
}

document.getElementById('videoForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('videoUrl');
  const embedUrl = getYouTubeEmbed(input.value.trim());
  if (!embedUrl) {
    window.alert('Sila masukkan pautan YouTube yang sah. Pautan Google Drive/Vimeo tidak disokong untuk pratonton automatik.');
    return;
  }
  const card = document.createElement('article');
  card.className = 'video-card';
  const frame = document.createElement('iframe');
  frame.src = embedUrl;
  frame.title = 'Video latihan temu duga';
  frame.loading = 'lazy';
  frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  frame.allowFullscreen = true;
  const caption = document.createElement('p');
  caption.textContent = 'Video latihan temu duga';
  card.append(frame, caption);
  document.getElementById('videoGrid').append(card);
  input.value = '';
});

loadProfile();
