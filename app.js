/**
 * KasKlien - Sistem Pencatatan Keuangan Berbasis Klien & Integrasi GitHub
 * Arsitektur: Vanilla ES6+ Single Page Application
 * Zero-Dependency, Offline-First, Secure GitHub REST API Integration
 */

// ==================== STORAGE & STATE MANAGER ====================
const DB_KEYS = {
  CLIENTS: 'kasklien_clients_v1',
  TRANSACTIONS: 'kasklien_transactions_v1',
  CATEGORIES: 'kasklien_categories_v1',
  SETTINGS: 'kasklien_settings_v1',
  AUDIT_LOGS: 'kasklien_audit_logs_v1',
  SYNC_QUEUE: 'kasklien_sync_queue_v1'
};

const DEFAULT_CATEGORIES = {
  inflow: [
    'Pembayaran Klien',
    'Honorarium Advokat',
    'Uang Operasional Klien',
    'Pengembalian Biaya Perkara',
    'Setoran Kas',
    'Lainnya'
  ],
  outflow: [
    'Biaya Pendaftaran / Pengadilan',
    'Belanja ATK & Berkas',
    'Transportasi & Akomodasi',
    'Honorarium Ahli / Saksi',
    'Pengiriman Uang',
    'Operasional Kantor',
    'Pengembalian Dana Klien',
    'Lainnya'
  ]
};

const DEFAULT_SETTINGS = {
  firmName: 'MINZATHU & MINZATHU LAW OFFICES',
  ownerName: 'Ahmad Subhan Suaib, S.H.',
  currency: 'IDR (Rp)',
  activeYear: '2026',
  theme: 'light',
  github: {
    repo: '',
    branch: 'main',
    dataFolder: 'data',
    token: ''
  }
};

// Initial Demo Data
const DEMO_CLIENTS = [
  {
    id: 'KLIEN-0001',
    name: 'Muh Nasrullah (Klien A)',
    refNumber: 'REF/2026/04/TNB-01',
    phone: '081342118899',
    email: 'nasrullah.tanambuah@gmail.com',
    address: 'Desa Tanambuah, Kec. Sampaga, Mamuju',
    notes: 'Perkara Administrasi & Litigasi Tata Usaha Pemerintahan Desa Sidang 8 April 2026',
    status: 'Aktif',
    createdAt: '2026-04-01T09:00:00'
  },
  {
    id: 'KLIEN-0002',
    name: 'CV Sinar Harapan (Klien B)',
    refNumber: 'REF/2026/01/SNH-09',
    phone: '085299447722',
    email: 'direksi.sinarharapan@gmail.com',
    address: 'Area Pertambangan & Logistik, Sulawesi Barat',
    notes: 'Konsultasi Hukum & Pemulihan Aset Alat Berat Tambang',
    status: 'Aktif',
    createdAt: '2026-01-15T11:30:00'
  },
  {
    id: 'KLIEN-0003',
    name: 'PT Surya Gasindo Sejahtra (Klien C)',
    refNumber: 'REF/2026/02/SGS-03',
    phone: '082199883311',
    email: 'legal@suryagasindo.co.id',
    address: 'Jl. Poros Mamuju - Kalukku KM 12',
    notes: 'Fasilitasi Regulasi Perizinan Distribusi Energi LPG BUMN',
    status: 'Aktif',
    createdAt: '2026-02-10T14:15:00'
  }
];

// Sample demo receipt (1x1 transparent PNG / demo SVG badge converted to data URL)
const SAMPLE_RECEIPT_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23f1f5f9"/><rect x="20" y="20" width="560" height="360" rx="12" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><text x="300" y="100" font-family="sans-serif" font-size="22" font-weight="bold" fill="%230f172a" text-anchor="middle">BUKTI RESI TRANSFER RESMI</text><line x1="60" y1="120" x2="540" y2="120" stroke="%23e2e8f0" stroke-width="2"/><text x="80" y="170" font-family="sans-serif" font-size="16" fill="%2364748b">Status: BERHASIL / VALID</text><text x="80" y="210" font-family="sans-serif" font-size="16" fill="%2364748b">Metode: Transfer Bank Antar-Rekening</text><text x="80" y="250" font-family="sans-serif" font-size="16" fill="%2364748b">Tercatat di Folder: /data/clients/klien-xxxx/receipts/</text><rect x="80" y="280" width="440" height="60" rx="8" fill="%23d1fae5"/><text x="300" y="318" font-family="sans-serif" font-size="18" font-weight="bold" fill="%23059669" text-anchor="middle">TERVERIFIKASI SISTEM KASKLIEN</text></svg>';

const DEMO_TRANSACTIONS = [
  {
    id: 'TRX-000001',
    clientId: 'KLIEN-0001',
    clientName: 'Muh Nasrullah (Klien A)',
    date: '2026-04-02',
    month: '04',
    year: '2026',
    inputDate: '2026-04-02',
    inputTime: '10:00:00',
    updatedDate: '2026-04-02',
    updatedTime: '10:00:00',
    type: 'UANG MASUK',
    category: 'Pembayaran Klien',
    amount: 35000000,
    paymentMethod: 'Transfer Bank',
    source: 'Rekening Bank BNI Klien',
    destination: 'Rekening Operasional Kantor Minzathu',
    refNumber: 'TRF-BNI-992100',
    notes: 'Tahap 1: Retainer Fee & Pengurusan Berkas Sidang Awal',
    status: 'Selesai',
    receipt: {
      fileName: '2026-04-02_TRX-000001_bukti-transfer-tahap1.svg',
      fileType: 'image/svg+xml',
      dataUrl: SAMPLE_RECEIPT_IMG,
      path: '/data/clients/klien-0001/receipts/2026-04-02_TRX-000001_bukti-transfer-tahap1.svg'
    },
    syncStatus: 'synced'
  },
  {
    id: 'TRX-000002',
    clientId: 'KLIEN-0001',
    clientName: 'Muh Nasrullah (Klien A)',
    date: '2026-04-05',
    month: '04',
    year: '2026',
    inputDate: '2026-04-05',
    inputTime: '14:20:00',
    updatedDate: '2026-04-05',
    updatedTime: '14:20:00',
    type: 'UANG KELUAR',
    category: 'Biaya Pendaftaran / Pengadilan',
    amount: 4500000,
    paymentMethod: 'Transfer Bank',
    source: 'Kas Kantor Minzathu',
    destination: 'Kepaniteraan PTUN / PN',
    refNumber: 'REG-PTUN-004',
    notes: 'Registrasi pendaftaran gugatan & legalisasi bukti rujukan LKPP',
    status: 'Selesai',
    receipt: {
      fileName: '2026-04-05_TRX-000002_resi-registrasi.svg',
      fileType: 'image/svg+xml',
      dataUrl: SAMPLE_RECEIPT_IMG,
      path: '/data/clients/klien-0001/receipts/2026-04-05_TRX-000002_resi-registrasi.svg'
    },
    syncStatus: 'synced'
  },
  {
    id: 'TRX-000003',
    clientId: 'KLIEN-0002',
    clientName: 'CV Sinar Harapan (Klien B)',
    date: '2026-01-20',
    month: '01',
    year: '2026',
    inputDate: '2026-01-20',
    inputTime: '09:15:00',
    updatedDate: '2026-01-20',
    updatedTime: '09:15:00',
    type: 'UANG MASUK',
    category: 'Honorarium Advokat',
    amount: 60000000,
    paymentMethod: 'Transfer Bank',
    source: 'Rekening Mandiri CV Sinar Harapan',
    destination: 'Kas Kantor Minzathu',
    refNumber: 'MDR-8812903',
    notes: 'Honor pendampingan hukum pemulihan alat berat tambang',
    status: 'Selesai',
    receipt: {
      fileName: '2026-01-20_TRX-000003_bukti-honor.svg',
      fileType: 'image/svg+xml',
      dataUrl: SAMPLE_RECEIPT_IMG,
      path: '/data/clients/klien-0002/receipts/2026-01-20_TRX-000003_bukti-honor.svg'
    },
    syncStatus: 'synced'
  },
  {
    id: 'TRX-000004',
    clientId: 'KLIEN-0002',
    clientName: 'CV Sinar Harapan (Klien B)',
    date: '2026-02-02',
    month: '02',
    year: '2026',
    inputDate: '2026-02-02',
    inputTime: '11:45:00',
    updatedDate: '2026-02-02',
    updatedTime: '11:45:00',
    type: 'UANG KELUAR',
    category: 'Transportasi & Akomodasi',
    amount: 12500000,
    paymentMethod: 'Transfer Bank',
    source: 'Kas Kantor Minzathu',
    destination: 'Tim Investigasi Lapangan Tambang',
    refNumber: 'TRV-09124',
    notes: 'Biaya investigasi lapangan ke lokasi penahanan unit tambang',
    status: 'Selesai',
    receipt: null,
    syncStatus: 'synced'
  },
  {
    id: 'TRX-000005',
    clientId: 'KLIEN-0003',
    clientName: 'PT Surya Gasindo Sejahtra (Klien C)',
    date: '2026-02-15',
    month: '02',
    year: '2026',
    inputDate: '2026-02-15',
    inputTime: '15:10:00',
    updatedDate: '2026-02-15',
    updatedTime: '15:10:00',
    type: 'UANG MASUK',
    category: 'Pembayaran Klien',
    amount: 45000000,
    paymentMethod: 'Transfer Bank',
    source: 'Rekening BCA PT Surya Gasindo',
    destination: 'Kas Kantor Minzathu',
    refNumber: 'BCA-841920',
    notes: 'Fasilitasi legal opinion & rekomendasi distribusi BUMN',
    status: 'Selesai',
    receipt: {
      fileName: '2026-02-15_TRX-000005_transfer-gasindo.svg',
      fileType: 'image/svg+xml',
      dataUrl: SAMPLE_RECEIPT_IMG,
      path: '/data/clients/klien-0003/receipts/2026-02-15_TRX-000005_transfer-gasindo.svg'
    },
    syncStatus: 'synced'
  },
  {
    id: 'TRX-000006',
    clientId: 'KLIEN-0003',
    clientName: 'PT Surya Gasindo Sejahtra (Klien C)',
    date: '2026-09-05',
    month: '09',
    year: '2026',
    inputDate: '2026-09-05',
    inputTime: '08:30:00',
    updatedDate: '2026-09-05',
    updatedTime: '08:30:00',
    type: 'UANG MASUK',
    category: 'Pembayaran Klien',
    amount: 25000000,
    paymentMethod: 'Transfer Bank',
    source: 'Rekening BCA PT Surya Gasindo',
    destination: 'Kas Kantor Minzathu',
    refNumber: 'BCA-991202',
    notes: 'Termin lanjutan pendampingan berkas verifikasi BUMN September 2026',
    status: 'Selesai',
    receipt: {
      fileName: '2026-09-05_TRX-000006_termin2.svg',
      fileType: 'image/svg+xml',
      dataUrl: SAMPLE_RECEIPT_IMG,
      path: '/data/clients/klien-0003/receipts/2026-09-05_TRX-000006_termin2.svg'
    },
    syncStatus: 'synced'
  },
  {
    id: 'TRX-000007',
    clientId: 'KLIEN-0003',
    clientName: 'PT Surya Gasindo Sejahtra (Klien C)',
    date: '2026-09-10',
    month: '09',
    year: '2026',
    inputDate: '2026-09-10',
    inputTime: '13:00:00',
    updatedDate: '2026-09-10',
    updatedTime: '13:00:00',
    type: 'UANG KELUAR',
    category: 'Operasional Kantor',
    amount: 6500000,
    paymentMethod: 'Cash',
    source: 'Kas Kantor Minzathu',
    destination: 'Vendor Notaris & Legalisasi Surat',
    refNumber: 'NOT-1009',
    notes: 'Biaya penerbitan akta notaris & verifikasi berkas izin niaga',
    status: 'Selesai',
    receipt: null,
    syncStatus: 'synced'
  }
];

class AppState {
  constructor() {
    this.clients = [];
    this.transactions = [];
    this.categories = { ...DEFAULT_CATEGORIES };
    this.settings = { ...DEFAULT_SETTINGS };
    this.auditLogs = [];
    this.syncQueue = [];
    this.currentView = 'dashboard';
    this.activeClientDetailId = null;
    this.lightboxData = null;
    this.lightboxScale = 1;
    this.lightboxRotate = 0;
  }

  init() {
    this.loadFromStorage();
    if (this.clients.length === 0 && this.transactions.length === 0) {
      this.seedDemoData();
    }
  }

  loadFromStorage() {
    try {
      const storedClients = localStorage.getItem(DB_KEYS.CLIENTS);
      const storedTx = localStorage.getItem(DB_KEYS.TRANSACTIONS);
      const storedCat = localStorage.getItem(DB_KEYS.CATEGORIES);
      const storedSet = localStorage.getItem(DB_KEYS.SETTINGS);
      const storedAudit = localStorage.getItem(DB_KEYS.AUDIT_LOGS);
      const storedQueue = localStorage.getItem(DB_KEYS.SYNC_QUEUE);

      if (storedClients) this.clients = JSON.parse(storedClients);
      if (storedTx) this.transactions = JSON.parse(storedTx);
      if (storedCat) this.categories = JSON.parse(storedCat);
      if (storedSet) this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSet) };
      if (storedAudit) this.auditLogs = JSON.parse(storedAudit);
      if (storedQueue) this.syncQueue = JSON.parse(storedQueue);
    } catch (e) {
      console.error("Gagal membaca LocalStorage:", e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(DB_KEYS.CLIENTS, JSON.stringify(this.clients));
      localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
      localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(this.categories));
      localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(this.settings));
      localStorage.setItem(DB_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(DB_KEYS.SYNC_QUEUE, JSON.stringify(this.syncQueue));
    } catch (e) {
      console.error("Gagal menyimpan ke LocalStorage:", e);
    }
  }

  seedDemoData() {
    this.clients = JSON.parse(JSON.stringify(DEMO_CLIENTS));
    this.transactions = JSON.parse(JSON.stringify(DEMO_TRANSACTIONS));
    this.logAudit('INIT', 'SYSTEM', 'Inisialisasi sistem dengan data contoh Minzathu & Minzathu Law Offices');
    this.saveToStorage();
  }

  purgeDemoData() {
    this.clients = [];
    this.transactions = [];
    this.auditLogs = [];
    this.syncQueue = [];
    this.logAudit('PURGE', 'SYSTEM', 'Semua data demo telah dibersihkan oleh pengguna');
    this.saveToStorage();
  }

  logAudit(action, entity, details) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry = {
      id: 'LOG-' + Date.now(),
      timestamp: `${dateStr} ${timeStr}`,
      action,
      entity,
      details,
      syncStatus: this.settings.github.token ? 'pending' : 'local'
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) this.auditLogs.pop(); // keep last 500
    this.saveToStorage();
  }
}

const state = new AppState();

// ==================== FORMATTERS & UTILS ====================
function formatRupiah(number) {
  if (number === null || number === undefined || isNaN(number)) return 'Rp 0';
  const val = Math.round(Number(number));
  const isNeg = val < 0;
  const absVal = Math.abs(val);
  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (isNeg ? '-Rp ' : 'Rp ') + formatted;
}

function parseRupiah(str) {
  if (!str) return 0;
  const cleaned = str.toString().replace(/[^0-9-]/g, '');
  return cleaned ? parseFloat(cleaned) : 0;
}

function generateClientId() {
  const count = state.clients.length + 1;
  let code = `KLIEN-${String(count).padStart(4, '0')}`;
  while (state.clients.some(c => c.id === code)) {
    code = `KLIEN-${String(parseInt(code.replace('KLIEN-', '')) + 1).padStart(4, '0')}`;
  }
  return code;
}

function generateTransactionId() {
  const count = state.transactions.length + 1;
  let code = `TRX-${String(count).padStart(6, '0')}`;
  while (state.transactions.some(t => t.id === code)) {
    code = `TRX-${String(parseInt(code.replace('TRX-', '')) + 1).padStart(6, '0')}`;
  }
  return code;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '✓';
  if (type === 'error') icon = '✖';
  if (type === 'warning') icon = '⚠';
  if (type === 'info') icon = 'ℹ';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// Client-side image compression
function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: reader.result, fileType: file.type });
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ dataUrl, fileType: 'image/jpeg' });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ==================== GITHUB API INTEGRATION ENGINE ====================
class GitHubService {
  constructor() {
    this.apiBase = 'https://api.github.com';
  }

  getHeaders() {
    const token = state.settings.github.token;
    return {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  }

  isConfigured() {
    return Boolean(state.settings.github.repo && state.settings.github.token);
  }

  async testConnection() {
    if (!this.isConfigured()) {
      throw new Error('Repository dan Personal Access Token belum diisi.');
    }
    const [owner, repo] = state.settings.github.repo.trim().split('/');
    if (!owner || !repo) {
      throw new Error('Format repository harus "owner/repository-name".');
    }

    const res = await fetch(`${this.apiBase}/repos/${owner}/${repo}`, {
      headers: this.getHeaders()
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Gagal menghubungi GitHub (${res.status})`);
    }

    const data = await res.json();
    return {
      name: data.full_name,
      private: data.private,
      permissions: data.permissions
    };
  }

  async getFileSha(path) {
    const [owner, repo] = state.settings.github.repo.trim().split('/');
    const branch = state.settings.github.branch || 'main';
    const res = await fetch(`${this.apiBase}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: this.getHeaders()
    });
    if (res.ok) {
      const file = await res.json();
      return file.sha;
    }
    return null;
  }

  async putFile(path, contentStr, commitMessage) {
    const [owner, repo] = state.settings.github.repo.trim().split('/');
    const branch = state.settings.github.branch || 'main';
    const sha = await this.getFileSha(path);

    // UTF-8 safe Base64 encoding
    const b64Content = btoa(unescape(encodeURIComponent(contentStr)));

    const body = {
      message: commitMessage,
      content: b64Content,
      branch: branch
    };
    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(`${this.apiBase}/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Gagal menulis file ke GitHub (${res.status})`);
    }

    return await res.json();
  }

  async getFileContent(path) {
    const [owner, repo] = state.settings.github.repo.trim().split('/');
    const branch = state.settings.github.branch || 'main';
    const res = await fetch(`${this.apiBase}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.content) {
      const cleanB64 = data.content.replace(/\s/g, '');
      const binaryString = atob(cleanB64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    }
    return null;
  }

  // Tarik seluruh data dari repository GitHub (Multi-perangkat: Mac -> iPhone)
  async pullFromGitHub() {
    if (!this.isConfigured()) {
      throw new Error('Konfigurasi GitHub belum lengkap.');
    }
    const [owner, repo] = state.settings.github.repo.trim().split('/');
    const branch = state.settings.github.branch || 'main';
    const baseFolder = state.settings.github.dataFolder || 'data';

    // 1. Baca settings
    try {
      const settingsStr = await this.getFileContent(`${baseFolder}/settings/settings.json`);
      if (settingsStr) {
        const parsed = JSON.parse(settingsStr);
        state.settings.firmName = parsed.firmName || state.settings.firmName;
        state.settings.ownerName = parsed.ownerName || state.settings.ownerName;
        state.settings.currency = parsed.currency || state.settings.currency;
        state.settings.activeYear = parsed.activeYear || state.settings.activeYear;
      }
    } catch (e) {
      console.warn('Gagal membaca settings:', e);
    }

    // 2. Baca daftar folder clients
    const res = await fetch(`${this.apiBase}/repos/${owner}/${repo}/contents/${baseFolder}/clients?ref=${branch}`, {
      headers: this.getHeaders()
    });

    if (!res.ok) {
      throw new Error(`Direktori ${baseFolder}/clients belum ditemukan di repository. Pastikan Anda sudah pernah melakukan unggah (push) data dari laptop/Macbook terlebih dahulu.`);
    }

    const items = await res.json();
    if (!Array.isArray(items)) {
      throw new Error('Format respons folder clients tidak valid.');
    }

    const pulledClients = [];
    let pulledTransactions = [];

    for (const item of items) {
      if (item.type === 'dir') {
        // Ambil client.json
        try {
          const clientStr = await this.getFileContent(`${item.path}/client.json`);
          if (clientStr) {
            pulledClients.push(JSON.parse(clientStr));
          }
        } catch (err) {
          console.warn(`Gagal membaca ${item.path}/client.json`, err);
        }

        // Ambil transactions.json
        try {
          const txStr = await this.getFileContent(`${item.path}/transactions.json`);
          if (txStr) {
            const txs = JSON.parse(txStr);
            if (Array.isArray(txs)) {
              pulledTransactions = pulledTransactions.concat(txs);
            }
          }
        } catch (err) {
          console.warn(`Gagal membaca ${item.path}/transactions.json`, err);
        }
      }
    }

    // 3. Ambil audit_log.json jika ada
    try {
      const auditStr = await this.getFileContent(`${baseFolder}/audit_log.json`);
      if (auditStr) {
        state.auditLogs = JSON.parse(auditStr);
      }
    } catch (e) {}

    if (pulledClients.length > 0 || pulledTransactions.length > 0) {
      state.clients = pulledClients;
      const txMap = new Map();
      pulledTransactions.forEach(t => txMap.set(t.id, t));
      state.transactions = Array.from(txMap.values());
      state.saveToStorage();
    }

    return {
      clientsCount: pulledClients.length,
      txCount: state.transactions.length
    };
  }

  // Push complete clients and transaction structures to GitHub
  async syncAllToGitHub() {
    if (!this.isConfigured()) {
      throw new Error('Konfigurasi GitHub belum lengkap.');
    }

    const baseFolder = state.settings.github.dataFolder || 'data';
    const stats = { clientsPushed: 0, txPushed: 0 };

    // 1. Push settings (SANITASI KEAMANAN: HAPUS TOKEN DARI KONTEN GITHUB)
    const settingsPath = `${baseFolder}/settings/settings.json`;
    const sanitizedSettings = {
      firmName: state.settings.firmName,
      ownerName: state.settings.ownerName,
      currency: state.settings.currency,
      activeYear: state.settings.activeYear,
      theme: state.settings.theme,
      github: {
        repo: state.settings.github.repo,
        branch: state.settings.github.branch || 'main',
        dataFolder: state.settings.github.dataFolder || 'data',
        token: '' // Token WAJIB kosong saat disimpan ke repository agar tidak memicu GitHub Secret Protection
      }
    };
    await this.putFile(
      settingsPath,
      JSON.stringify(sanitizedSettings, null, 2),
      'Update system and firm settings'
    );

    // 2. Push each client & transactions per folder:
    // /data/clients/{clientId}/client.json
    // /data/clients/{clientId}/transactions.json
    for (const client of state.clients) {
      const clientFolder = `${baseFolder}/clients/${client.id.toLowerCase()}`;
      
      // Save client.json
      await this.putFile(
        `${clientFolder}/client.json`,
        JSON.stringify(client, null, 2),
        `Update client profile for ${client.id}`
      );
      stats.clientsPushed++;

      // Save transactions.json for this client
      const clientTx = state.transactions.filter(t => t.clientId === client.id);
      await this.putFile(
        `${clientFolder}/transactions.json`,
        JSON.stringify(clientTx, null, 2),
        `Sync ${clientTx.length} transactions for ${client.id}`
      );
      stats.txPushed += clientTx.length;
    }

    // 3. Push audit log
    await this.putFile(
      `${baseFolder}/audit_log.json`,
      JSON.stringify(state.auditLogs, null, 2),
      'Update audit log'
    );

    return stats;
  }
}

const gitHubService = new GitHubService();

// ==================== RENDERING: MASTER DASHBOARD ====================
function renderDashboard() {
  const transactions = state.transactions;
  const clients = state.clients;

  const totalInflow = transactions
    .filter(t => t.type === 'UANG MASUK')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalOutflow = transactions
    .filter(t => t.type === 'UANG KELUAR')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netBalance = totalInflow - totalOutflow;

  // Monthly stats (current month)
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthTx = transactions.filter(t => t.date && t.date.startsWith(currentYearMonth));
  const thisMonthNominal = thisMonthTx.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Receipts count
  const receiptCount = transactions.filter(t => t.receipt && t.receipt.dataUrl).length;

  // DOM Updates
  document.getElementById('dashTotalInflow').textContent = formatRupiah(totalInflow);
  document.getElementById('dashInflowCount').textContent = `${transactions.filter(t => t.type === 'UANG MASUK').length} transaksi masuk`;

  document.getElementById('dashTotalOutflow').textContent = formatRupiah(totalOutflow);
  document.getElementById('dashOutflowCount').textContent = `${transactions.filter(t => t.type === 'UANG KELUAR').length} transaksi keluar`;

  const balanceEl = document.getElementById('dashNetBalance');
  balanceEl.textContent = formatRupiah(netBalance);
  if (netBalance < 0) {
    balanceEl.classList.remove('text-navy');
    balanceEl.classList.add('text-red');
    document.getElementById('dashBalanceStatus').textContent = 'Defisit kas';
  } else {
    balanceEl.classList.remove('text-red');
    document.getElementById('dashBalanceStatus').textContent = 'Kas surplus aman';
  }

  document.getElementById('dashClientCount').textContent = `${clients.length} Klien`;
  document.getElementById('dashMonthTxCount').textContent = `${thisMonthTx.length} Transaksi`;
  document.getElementById('dashMonthTxNominal').textContent = `Volume: ${formatRupiah(thisMonthNominal)}`;
  document.getElementById('dashReceiptCount').textContent = `${receiptCount} Berkas`;

  // Sidebar badge counts
  document.getElementById('badgeInflowCount').textContent = transactions.filter(t => t.type === 'UANG MASUK').length;
  document.getElementById('badgeOutflowCount').textContent = transactions.filter(t => t.type === 'UANG KELUAR').length;

  // Render Charts
  renderCashflowChart();
  renderCategoryChart();

  // Render Recent Transactions
  renderRecentTransactions();
}

function renderRecentTransactions() {
  const tbody = document.getElementById('dashRecentTxBody');
  const recent = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center p-4 text-muted">
          Belum ada transaksi. Silakan klik tombol <strong>+ Tambah Transaksi</strong>.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = recent.map(t => {
    const isIncome = t.type === 'UANG MASUK';
    const amountClass = isIncome ? 'text-green' : 'text-red';
    const typeBadge = isIncome ? '<span class="badge badge-green">Masuk</span>' : '<span class="badge badge-red">Keluar</span>';
    const receiptBadge = t.receipt && t.receipt.dataUrl
      ? `<button class="btn btn-xs btn-outline" onclick="openLightbox('${t.id}')">📎 Lihat Resi</button>`
      : '<span class="text-muted text-xs">-</span>';

    return `
      <tr>
        <td>
          <strong>${t.id}</strong><br>
          <small class="text-muted">${t.date}</small>
        </td>
        <td>
          <strong>${t.clientName}</strong><br>
          <small class="text-muted">${t.clientId}</small>
        </td>
        <td>
          ${typeBadge}
          <div class="text-xs text-secondary mt-1">${t.category}</div>
        </td>
        <td>
          <span>${t.notes || '-'}</span><br>
          <small class="text-muted">Ref: ${t.refNumber || '-'}</small>
        </td>
        <td class="text-right ${amountClass}">
          <strong>${formatRupiah(t.amount)}</strong>
        </td>
        <td>${receiptBadge}</td>
        <td class="text-center">
          <button class="btn btn-xs btn-outline" onclick="editTransaction('${t.id}')">✏️</button>
          <button class="btn btn-xs btn-outline text-red" onclick="deleteTransaction('${t.id}')">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Built-in Native Canvas Charts (Zero external dependencies)
function renderCashflowChart() {
  const canvas = document.getElementById('cashflowChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Handle high-DPI displays
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = (rect.width || 500) * dpr;
  canvas.height = 240 * dpr;
  ctx.scale(dpr, dpr);

  const width = canvas.width / dpr;
  const height = 240;

  // Month names
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const currentYear = state.settings.activeYear || '2026';

  const monthlyIn = new Array(12).fill(0);
  const monthlyOut = new Array(12).fill(0);

  state.transactions.forEach(t => {
    if (t.date && t.date.startsWith(currentYear)) {
      const m = parseInt(t.date.split('-')[1], 10) - 1;
      if (m >= 0 && m < 12) {
        if (t.type === 'UANG MASUK') monthlyIn[m] += Number(t.amount || 0);
        else monthlyOut[m] += Number(t.amount || 0);
      }
    }
  });

  const maxVal = Math.max(...monthlyIn, ...monthlyOut, 1000000);

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw Gridlines
  ctx.strokeStyle = document.body.classList.contains('dark-theme') ? '#1e293b' : '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 4; i++) {
    const y = 30 + (i * (height - 60) / 4);
    ctx.moveTo(40, y);
    ctx.lineTo(width - 20, y);
  }
  ctx.stroke();

  // Draw Bars
  const barWidth = Math.max(6, (width - 70) / (12 * 2.5));
  const groupSpacing = (width - 70) / 12;

  months.forEach((m, idx) => {
    const xBase = 50 + idx * groupSpacing;

    // Inflow bar (Green)
    const inH = (monthlyIn[idx] / maxVal) * (height - 70);
    const inY = height - 35 - inH;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(xBase, inY, barWidth, inH, [3, 3, 0, 0]);
    ctx.fill();

    // Outflow bar (Red)
    const outH = (monthlyOut[idx] / maxVal) * (height - 70);
    const outY = height - 35 - outH;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(xBase + barWidth + 2, outY, barWidth, outH, [3, 3, 0, 0]);
    ctx.fill();

    // Month Label
    ctx.fillStyle = document.body.classList.contains('dark-theme') ? '#94a3b8' : '#64748b';
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m, xBase + barWidth, height - 15);
  });
}

function renderCategoryChart() {
  const canvas = document.getElementById('categoryChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = (rect.width || 500) * dpr;
  canvas.height = 240 * dpr;
  ctx.scale(dpr, dpr);

  const width = canvas.width / dpr;
  const height = 240;

  // Aggregate category outflow
  const catSums = {};
  state.transactions.filter(t => t.type === 'UANG KELUAR').forEach(t => {
    const cat = t.category || 'Lainnya';
    catSums[cat] = (catSums[cat] || 0) + Number(t.amount || 0);
  });

  const sortedCats = Object.entries(catSums).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const total = sortedCats.reduce((acc, cur) => acc + cur[1], 0) || 1;

  ctx.clearRect(0, 0, width, height);

  if (sortedCats.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Belum ada transaksi pengeluaran.', width / 2, height / 2);
    return;
  }

  // Draw Horizontal Bar Distribution
  let startY = 30;
  const barMaxW = width - 180;
  const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#0f172a'];

  sortedCats.forEach(([cat, val], idx) => {
    const pct = ((val / total) * 100).toFixed(1);
    const barW = Math.max(10, (val / sortedCats[0][1]) * barMaxW);

    // Label
    ctx.fillStyle = document.body.classList.contains('dark-theme') ? '#f1f5f9' : '#0f172a';
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(cat.length > 18 ? cat.substring(0, 16) + '..' : cat, 20, startY + 12);

    // Bar
    ctx.fillStyle = colors[idx % colors.length];
    ctx.beginPath();
    ctx.roundRect(140, startY, barW, 16, 4);
    ctx.fill();

    // Value text
    ctx.fillStyle = document.body.classList.contains('dark-theme') ? '#94a3b8' : '#64748b';
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${formatRupiah(val)} (${pct}%)`, 140 + barW + 8, startY + 12);

    startY += 36;
  });
}

// ==================== RENDERING: DATA KLIEN ====================
function renderClientsView() {
  const container = document.getElementById('clientsGridContainer');
  const search = document.getElementById('clientFilterSearch').value.toLowerCase();
  const status = document.getElementById('clientFilterStatus').value;
  const sortBy = document.getElementById('clientSortBy').value;

  let list = [...state.clients];

  // Filters
  if (status !== 'all') {
    list = list.filter(c => c.status === status);
  }
  if (search) {
    list = list.filter(c =>
      c.name.toLowerCase().includes(search) ||
      (c.refNumber && c.refNumber.toLowerCase().includes(search)) ||
      (c.address && c.address.toLowerCase().includes(search)) ||
      (c.phone && c.phone.includes(search))
    );
  }

  // Calculate client balances
  const clientData = list.map(c => {
    const txs = state.transactions.filter(t => t.clientId === c.id);
    const totalIn = txs.filter(t => t.type === 'UANG MASUK').reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const totalOut = txs.filter(t => t.type === 'UANG KELUAR').reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const balance = totalIn - totalOut;
    return { ...c, totalIn, totalOut, balance, txCount: txs.length };
  });

  // Sorting
  if (sortBy === 'name_asc') clientData.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === 'name_desc') clientData.sort((a, b) => b.name.localeCompare(a.name));
  else if (sortBy === 'balance_desc') clientData.sort((a, b) => b.balance - a.balance);
  else if (sortBy === 'tx_desc') clientData.sort((a, b) => b.txCount - a.txCount);

  if (clientData.length === 0) {
    container.innerHTML = `
      <div class="content-card text-center p-4 w-100" style="grid-column: 1 / -1;">
        <span style="font-size: 2.5rem;">👥</span>
        <h4 class="mt-2">Tidak Ada Data Klien Ditemukan</h4>
        <p class="text-muted mt-1">Gunakan tombol di bawah untuk mendaftarkan klien baru.</p>
        <button class="btn btn-primary mt-3" onclick="openClientModal()">➕ Tambah Klien Baru</button>
      </div>
    `;
    return;
  }

  container.innerHTML = clientData.map(c => {
    const statusClass = c.status === 'Aktif' ? 'badge-green' : 'badge-silver';
    const balanceClass = c.balance >= 0 ? 'text-green' : 'text-red';

    return `
      <div class="client-card" onclick="openClientDetail('${c.id}')">
        <div>
          <div class="client-card-header">
            <div>
              <h3 class="client-card-title">${c.name}</h3>
              <span class="client-card-code">${c.id}</span>
            </div>
            <span class="badge ${statusClass}">${c.status}</span>
          </div>
          <p class="text-xs text-secondary mt-1">Ref: ${c.refNumber || '-'}</p>

          <div class="client-card-stats">
            <div class="stat-item">
              <span>Total Kas Masuk</span>
              <strong class="text-green">${formatRupiah(c.totalIn)}</strong>
            </div>
            <div class="stat-item">
              <span>Total Kas Keluar</span>
              <strong class="text-red">${formatRupiah(c.totalOut)}</strong>
            </div>
            <div class="stat-item" style="grid-column: 1 / -1; border-top: 1px solid var(--border-color); padding-top: 6px;">
              <span>Saldo Kas Klien</span>
              <strong class="${balanceClass}">${formatRupiah(c.balance)}</strong>
            </div>
          </div>
        </div>

        <div class="client-card-footer">
          <small class="text-muted">${c.txCount} Transaksi Dicatat</small>
          <button class="btn btn-xs btn-outline" onclick="event.stopPropagation(); openClientDetail('${c.id}')">
            Buka Buku Kas →
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== RENDERING: DETAIL KLIEN KHUSUS ====================
function openClientDetail(clientId) {
  state.activeClientDetailId = clientId;
  navigateTo('client-detail');
  renderClientDetailView();
}

function renderClientDetailView() {
  const client = state.clients.find(c => c.id === state.activeClientDetailId);
  if (!client) {
    navigateTo('clients');
    return;
  }

  document.getElementById('clientDetailName').textContent = client.name;
  document.getElementById('clientDetailId').textContent = client.id;
  document.getElementById('clientDetailStatus').textContent = client.status;
  document.getElementById('clientDetailStatus').className = `badge ${client.status === 'Aktif' ? 'badge-green' : 'badge-silver'}`;
  document.getElementById('clientDetailMeta').textContent = `Nomor Ref: ${client.refNumber || '-'} | Terdaftar: ${client.createdAt ? client.createdAt.substring(0, 10) : '-'}`;

  document.getElementById('clientDetailPhone').textContent = client.phone || '-';
  document.getElementById('clientDetailEmail').textContent = client.email || '-';
  document.getElementById('clientDetailAddress').textContent = client.address || '-';
  document.getElementById('clientDetailNotes').textContent = client.notes || '-';
  document.getElementById('clientDetailFolderNote').textContent = `Folder GitHub: /data/clients/${client.id.toLowerCase()}/`;

  // Financial totals for this client
  const clientTxs = state.transactions.filter(t => t.clientId === client.id);
  const totalIn = clientTxs.filter(t => t.type === 'UANG MASUK').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalOut = clientTxs.filter(t => t.type === 'UANG KELUAR').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const balance = totalIn - totalOut;

  document.getElementById('clientDetailTotalIn').textContent = formatRupiah(totalIn);
  document.getElementById('clientDetailCountIn').textContent = `${clientTxs.filter(t => t.type === 'UANG MASUK').length} kali penerimaan kas`;

  document.getElementById('clientDetailTotalOut').textContent = formatRupiah(totalOut);
  document.getElementById('clientDetailCountOut').textContent = `${clientTxs.filter(t => t.type === 'UANG KELUAR').length} kali pengeluaran kas`;

  const balEl = document.getElementById('clientDetailBalance');
  balEl.textContent = formatRupiah(balance);
  balEl.className = `stat-value ${balance >= 0 ? 'text-green' : 'text-red'}`;

  // Transactions list
  const tbody = document.getElementById('clientTxTableBody');
  if (clientTxs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center p-4 text-muted">
          Belum ada transaksi untuk ${client.name}.<br>
          Gunakan tombol <strong>Kas Masuk</strong> atau <strong>Kas Keluar</strong> di atas.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = clientTxs.map(t => {
    const isIncome = t.type === 'UANG MASUK';
    const amountClass = isIncome ? 'text-green' : 'text-red';
    const typeBadge = isIncome ? '<span class="badge badge-green">Masuk</span>' : '<span class="badge badge-red">Keluar</span>';
    const receiptBadge = t.receipt && t.receipt.dataUrl
      ? `<button class="btn btn-xs btn-outline" onclick="openLightbox('${t.id}')">📎 Resi</button>`
      : '<span class="text-muted text-xs">-</span>';

    return `
      <tr>
        <td>
          <strong>${t.id}</strong><br>
          <small class="text-muted">${t.date}</small>
        </td>
        <td>${typeBadge}</td>
        <td>${t.category}</td>
        <td>
          <span>${t.notes || '-'}</span><br>
          <small class="text-muted">Ref: ${t.refNumber || '-'}</small>
        </td>
        <td class="text-right ${amountClass}">
          <strong>${formatRupiah(t.amount)}</strong>
        </td>
        <td><small>${t.paymentMethod || '-'}</small></td>
        <td>${receiptBadge}</td>
        <td class="text-center">
          <button class="btn btn-xs btn-outline" onclick="editTransaction('${t.id}')">✏️</button>
          <button class="btn btn-xs btn-outline text-red" onclick="deleteTransaction('${t.id}')">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==================== RENDERING: TRANSAKSI (SEMUA) ====================
function renderTransactionsView() {
  // Populate filter dropdowns
  populateClientFilterDropdown();
  populateCategoryFilterDropdown();

  applyTransactionFilters();
}

function populateClientFilterDropdown() {
  const select = document.getElementById('filterTxClient');
  const current = select.value;
  select.innerHTML = '<option value="all">Semua Klien</option>' +
    state.clients.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('');
  if (current) select.value = current;
}

function populateCategoryFilterDropdown() {
  const select = document.getElementById('filterTxCategory');
  const current = select.value;
  const allCats = Array.from(new Set([...state.categories.inflow, ...state.categories.outflow]));
  select.innerHTML = '<option value="all">Semua Kategori</option>' +
    allCats.map(c => `<option value="${c}">${c}</option>`).join('');
  if (current) select.value = current;
}

function applyTransactionFilters() {
  const clientFilter = document.getElementById('filterTxClient').value;
  const typeFilter = document.getElementById('filterTxType').value;
  const catFilter = document.getElementById('filterTxCategory').value;
  const yearFilter = document.getElementById('filterTxYear').value;
  const monthFilter = document.getElementById('filterTxMonth').value;
  const startDate = document.getElementById('filterTxStartDate').value;
  const endDate = document.getElementById('filterTxEndDate').value;
  const methodFilter = document.getElementById('filterTxMethod').value;
  const minAmount = parseFloat(document.getElementById('filterTxMinAmount').value) || 0;
  const maxAmount = parseFloat(document.getElementById('filterTxMaxAmount').value) || Infinity;

  let filtered = [...state.transactions];

  if (clientFilter !== 'all') filtered = filtered.filter(t => t.clientId === clientFilter);
  if (typeFilter !== 'all') filtered = filtered.filter(t => t.type === typeFilter);
  if (catFilter !== 'all') filtered = filtered.filter(t => t.category === catFilter);
  if (yearFilter !== 'all') filtered = filtered.filter(t => t.year === yearFilter || (t.date && t.date.startsWith(yearFilter)));
  if (monthFilter !== 'all') filtered = filtered.filter(t => t.month === monthFilter || (t.date && t.date.split('-')[1] === monthFilter));
  if (startDate) filtered = filtered.filter(t => t.date >= startDate);
  if (endDate) filtered = filtered.filter(t => t.date <= endDate);
  if (methodFilter !== 'all') filtered = filtered.filter(t => t.paymentMethod === methodFilter);
  if (minAmount > 0) filtered = filtered.filter(t => Number(t.amount) >= minAmount);
  if (maxAmount < Infinity) filtered = filtered.filter(t => Number(t.amount) <= maxAmount);

  // Calculate summary metrics
  const totalIn = filtered.filter(t => t.type === 'UANG MASUK').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalOut = filtered.filter(t => t.type === 'UANG KELUAR').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const balance = totalIn - totalOut;

  document.getElementById('filterSumCount').textContent = `${filtered.length} Transaksi`;
  document.getElementById('filterSumInflow').textContent = formatRupiah(totalIn);
  document.getElementById('filterSumOutflow').textContent = formatRupiah(totalOut);
  document.getElementById('filterSumBalance').textContent = formatRupiah(balance);

  // Render Table
  const tbody = document.getElementById('allTxTableBody');
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center p-4 text-muted">
          Tidak ada transaksi yang cocok dengan kriteria filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const isIncome = t.type === 'UANG MASUK';
    const amountClass = isIncome ? 'text-green' : 'text-red';
    const typeBadge = isIncome ? '<span class="badge badge-green">Masuk</span>' : '<span class="badge badge-red">Keluar</span>';
    const receiptBadge = t.receipt && t.receipt.dataUrl
      ? `<button class="btn btn-xs btn-outline" onclick="openLightbox('${t.id}')">📎 Resi</button>`
      : '<span class="text-muted text-xs">-</span>';

    return `
      <tr>
        <td>
          <strong>${t.id}</strong><br>
          <small class="text-muted">${t.date}</small>
        </td>
        <td>
          <a href="javascript:void(0)" onclick="openClientDetail('${t.clientId}')">
            <strong>${t.clientName}</strong>
          </a><br>
          <small class="text-muted">${t.clientId}</small>
        </td>
        <td>${typeBadge}</td>
        <td>${t.category}</td>
        <td>
          <span>${t.notes || '-'}</span><br>
          <small class="text-muted">Ref: ${t.refNumber || '-'}</small>
        </td>
        <td class="text-right ${amountClass}">
          <strong>${formatRupiah(t.amount)}</strong>
        </td>
        <td><small>${t.paymentMethod || '-'}</small></td>
        <td>${receiptBadge}</td>
        <td class="text-center">
          <button class="btn btn-xs btn-outline" onclick="editTransaction('${t.id}')">✏️</button>
          <button class="btn btn-xs btn-outline text-red" onclick="deleteTransaction('${t.id}')">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==================== RENDERING: LAPORAN KEUANGAN ====================
function renderReportsView() {
  // Populate Client Select
  const select = document.getElementById('reportClientSelect');
  select.innerHTML = '<option value="all">Semua Klien (Konsolidasi)</option>' +
    state.clients.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('');

  generateReportSheet();
}

function generateReportSheet() {
  const repType = document.getElementById('reportTypeSelect').value;
  const selectedClient = document.getElementById('reportClientSelect').value;
  const year = document.getElementById('reportYearSelect').value;
  const month = document.getElementById('reportMonthSelect').value;

  let reportTransactions = [...state.transactions];

  if (selectedClient !== 'all') {
    reportTransactions = reportTransactions.filter(t => t.clientId === selectedClient);
  }

  if (year !== 'all') {
    reportTransactions = reportTransactions.filter(t => t.year === year || (t.date && t.date.startsWith(year)));
  }

  if (month !== 'all') {
    reportTransactions = reportTransactions.filter(t => t.month === month || (t.date && t.date.split('-')[1] === month));
  }

  // Update Letterhead Titles
  document.getElementById('reportFirmName').textContent = state.settings.firmName || 'MINZATHU & MINZATHU LAW OFFICES';
  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthText = month === 'all' ? 'TAHUN ' + year : `${monthNames[parseInt(month)]} ${year}`.toUpperCase();
  document.getElementById('reportTitleHeader').textContent = `LAPORAN KEUANGAN KAS — ${monthText}`;

  const clientText = selectedClient === 'all'
    ? 'Konsolidasi Seluruh Klien'
    : (state.clients.find(c => c.id === selectedClient)?.name || selectedClient);
  document.getElementById('reportSubHeader').textContent = clientText;

  const now = new Date();
  document.getElementById('reportGeneratedDate').textContent = `Dicetak otomatis: ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ${now.toLocaleTimeString('id-ID')}`;

  // Totals
  const totalIn = reportTransactions.filter(t => t.type === 'UANG MASUK').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalOut = reportTransactions.filter(t => t.type === 'UANG KELUAR').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const net = totalIn - totalOut;

  document.getElementById('repTotalIn').textContent = formatRupiah(totalIn);
  document.getElementById('repTotalOut').textContent = formatRupiah(totalOut);
  document.getElementById('repNetBalance').textContent = formatRupiah(net);

  document.getElementById('repFootTotalIn').textContent = formatRupiah(totalIn);
  document.getElementById('repFootTotalOut').textContent = formatRupiah(totalOut);
  document.getElementById('repFootBalance').textContent = formatRupiah(net);

  // Table Body
  const tbody = document.getElementById('reportBodyTable');
  if (reportTransactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center p-3 text-muted">
          Tidak ada mutasi transaksi untuk periode atau filter yang dipilih.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = reportTransactions.map((t, idx) => {
    const isIncome = t.type === 'UANG MASUK';
    const inStr = isIncome ? formatRupiah(t.amount) : '-';
    const outStr = !isIncome ? formatRupiah(t.amount) : '-';

    return `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td>${t.date}</td>
        <td>${t.id}</td>
        <td><strong>${t.clientName}</strong></td>
        <td>${t.category}</td>
        <td>${t.notes || '-'}</td>
        <td class="text-right ${isIncome ? 'text-green font-weight-bold' : ''}">${inStr}</td>
        <td class="text-right ${!isIncome ? 'text-red font-weight-bold' : ''}">${outStr}</td>
      </tr>
    `;
  }).join('');
}

// ==================== RENDERING: REKAP SEMUA KLIEN ====================
function renderClientRecapView() {
  const tbody = document.getElementById('recapTableBody');
  let grandIn = 0;
  let grandOut = 0;
  let grandTx = 0;

  const rows = state.clients.map(c => {
    const txs = state.transactions.filter(t => t.clientId === c.id);
    const totalIn = txs.filter(t => t.type === 'UANG MASUK').reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const totalOut = txs.filter(t => t.type === 'UANG KELUAR').reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const balance = totalIn - totalOut;

    grandIn += totalIn;
    grandOut += totalOut;
    grandTx += txs.length;

    const statusBadge = c.status === 'Aktif' ? '<span class="badge badge-green">Aktif</span>' : '<span class="badge badge-silver">Selesai</span>';

    return `
      <tr>
        <td><code>${c.id}</code></td>
        <td>
          <a href="javascript:void(0)" onclick="openClientDetail('${c.id}')">
            <strong>${c.name}</strong>
          </a>
        </td>
        <td><small>${c.refNumber || '-'}</small></td>
        <td>${statusBadge}</td>
        <td class="text-right text-green"><strong>${formatRupiah(totalIn)}</strong></td>
        <td class="text-right text-red"><strong>${formatRupiah(totalOut)}</strong></td>
        <td class="text-right ${balance >= 0 ? 'text-navy' : 'text-red'}">
          <strong>${formatRupiah(balance)}</strong>
        </td>
        <td class="text-center">${txs.length}</td>
        <td class="text-center">
          <button class="btn btn-xs btn-outline" onclick="openClientDetail('${c.id}')">Detail →</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rows.join('') || `<tr><td colspan="9" class="text-center p-3 text-muted">Belum ada klien.</td></tr>`;

  document.getElementById('recapGrandTotalIn').textContent = formatRupiah(grandIn);
  document.getElementById('recapGrandTotalOut').textContent = formatRupiah(grandOut);
  document.getElementById('recapGrandBalance').textContent = formatRupiah(grandIn - grandOut);
  document.getElementById('recapGrandTxCount').textContent = grandTx;
}

// ==================== RENDERING: AUDIT LOG ====================
function renderAuditLogView() {
  const tbody = document.getElementById('auditLogTableBody');
  if (state.auditLogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-muted">Belum ada riwayat perubahan.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.auditLogs.map(log => {
    let actionBadge = 'badge-navy';
    if (log.action === 'CREATE') actionBadge = 'badge-green';
    if (log.action === 'DELETE') actionBadge = 'badge-red';
    if (log.action === 'UPDATE') actionBadge = 'badge-gold';

    return `
      <tr>
        <td><small>${log.timestamp}</small></td>
        <td><span class="badge ${actionBadge}">${log.action}</span></td>
        <td><strong>${log.entity}</strong></td>
        <td>${log.details}</td>
        <td><span class="badge badge-silver">${log.syncStatus || 'local'}</span></td>
      </tr>
    `;
  }).join('');
}

// ==================== RENDERING: BACKUP STATS ====================
function renderBackupView() {
  document.getElementById('backupStatClients').textContent = `${state.clients.length} Klien`;
  document.getElementById('backupStatTx').textContent = `${state.transactions.length} Transaksi`;
  const receipts = state.transactions.filter(t => t.receipt && t.receipt.dataUrl).length;
  document.getElementById('backupStatReceipts').textContent = `${receipts} Berkas Resi`;
}

// ==================== LIGHTBOX MODAL ====================
function openLightbox(txId) {
  const tx = state.transactions.find(t => t.id === txId);
  if (!tx || !tx.receipt || !tx.receipt.dataUrl) {
    showToast('Transaksi ini tidak memiliki berkas bukti / resi.', 'warning');
    return;
  }

  state.lightboxData = tx;
  state.lightboxScale = 1;
  state.lightboxRotate = 0;

  document.getElementById('lbReceiptTitle').textContent = `Bukti: ${tx.receipt.fileName || 'Berkas Resi'}`;
  document.getElementById('lbTxCode').textContent = tx.id;
  document.getElementById('lbClientName').textContent = tx.clientName;
  document.getElementById('lbTxDate').textContent = tx.date;
  document.getElementById('lbTxTypeBadge').textContent = tx.type;
  document.getElementById('lbTxTypeBadge').className = `badge ${tx.type === 'UANG MASUK' ? 'badge-green' : 'badge-red'}`;
  document.getElementById('lbTxAmount').textContent = formatRupiah(tx.amount);
  document.getElementById('lbTxAmount').className = tx.type === 'UANG MASUK' ? 'text-green' : 'text-red';
  document.getElementById('lbTxCategory').textContent = tx.category;
  if (tx.receipt && tx.receipt.receiptType) {
    document.getElementById('lbReceiptTitle').textContent = `Bukti: ${tx.receipt.receiptType} (${tx.receipt.fileName})`;
  }
  document.getElementById('lbTxNotes').textContent = tx.notes || '-';
  document.getElementById('lbFileName').textContent = tx.receipt.fileName || '-';

  const downloadLink = document.getElementById('lbDownloadLink');
  downloadLink.href = tx.receipt.dataUrl;
  downloadLink.download = tx.receipt.fileName || `bukti-${tx.id}.jpg`;

  const isPdf = tx.receipt.fileType === 'application/pdf' || (tx.receipt.fileName && tx.receipt.fileName.endsWith('.pdf'));
  const imgEl = document.getElementById('lbImage');
  const pdfViewer = document.getElementById('lbPdfViewer');
  const pdfFrame = document.getElementById('lbPdfFrame');

  if (isPdf) {
    imgEl.style.display = 'none';
    pdfViewer.style.display = 'block';
    pdfFrame.src = tx.receipt.dataUrl;
  } else {
    pdfViewer.style.display = 'none';
    imgEl.style.display = 'block';
    imgEl.src = tx.receipt.dataUrl;
    applyLightboxTransform();
  }

  document.getElementById('modalLightbox').style.display = 'flex';
}

function closeLightbox() {
  document.getElementById('modalLightbox').style.display = 'none';
  state.lightboxData = null;
}

function applyLightboxTransform() {
  const imgEl = document.getElementById('lbImage');
  if (imgEl) {
    imgEl.style.transform = `scale(${state.lightboxScale}) rotate(${state.lightboxRotate}deg)`;
  }
}

// ==================== CLIENT CRUD ====================
function openClientModal(client = null) {
  const form = document.getElementById('clientForm');
  form.reset();

  if (client) {
    document.getElementById('modalClientTitle').textContent = 'Edit Data Klien';
    document.getElementById('formClientId').value = client.id;
    document.getElementById('formClientCode').value = client.id;
    document.getElementById('formClientName').value = client.name;
    document.getElementById('formClientRef').value = client.refNumber || '';
    document.getElementById('formClientPhone').value = client.phone || '';
    document.getElementById('formClientEmail').value = client.email || '';
    document.getElementById('formClientAddress').value = client.address || '';
    document.getElementById('formClientNotes').value = client.notes || '';
    document.getElementById('formClientStatus').value = client.status || 'Aktif';
  } else {
    document.getElementById('modalClientTitle').textContent = 'Tambah Klien Baru';
    document.getElementById('formClientId').value = '';
    document.getElementById('formClientCode').value = generateClientId();
    document.getElementById('formClientStatus').value = 'Aktif';
  }

  document.getElementById('modalClient').style.display = 'flex';
}

function closeClientModal() {
  document.getElementById('modalClient').style.display = 'none';
}

document.getElementById('clientForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('formClientId').value;
  const isEdit = Boolean(id);

  const clientData = {
    id: isEdit ? id : document.getElementById('formClientCode').value,
    name: document.getElementById('formClientName').value.trim(),
    refNumber: document.getElementById('formClientRef').value.trim(),
    phone: document.getElementById('formClientPhone').value.trim(),
    email: document.getElementById('formClientEmail').value.trim(),
    address: document.getElementById('formClientAddress').value.trim(),
    notes: document.getElementById('formClientNotes').value.trim(),
    status: document.getElementById('formClientStatus').value,
    createdAt: isEdit ? (state.clients.find(c => c.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString()
  };

  if (!clientData.name) {
    showToast('Nama klien tidak boleh kosong.', 'error');
    return;
  }

  if (isEdit) {
    const idx = state.clients.findIndex(c => c.id === id);
    if (idx !== -1) {
      state.clients[idx] = clientData;
      // Also update clientName in transactions
      state.transactions.forEach(t => {
        if (t.clientId === id) t.clientName = clientData.name;
      });
      state.logAudit('UPDATE', 'CLIENT', `Memperbarui data klien ${clientData.name} (${id})`);
      showToast(`Data klien ${clientData.name} berhasil diperbarui.`);
    }
  } else {
    state.clients.push(clientData);
    state.logAudit('CREATE', 'CLIENT', `Menambahkan klien baru ${clientData.name} (${clientData.id})`);
    showToast(`Klien baru ${clientData.name} berhasil ditambahkan.`);
  }

  state.saveToStorage();
  closeClientModal();
  renderClientsView();
  renderDashboard();
  if (state.currentView === 'client-detail') renderClientDetailView();
});

// Edit current client from Detail view
document.getElementById('btnEditCurrentClient').addEventListener('click', () => {
  const client = state.clients.find(c => c.id === state.activeClientDetailId);
  if (client) openClientModal(client);
});

// ==================== TRANSACTION CRUD ====================
let pendingReceipt = null;

function openTransactionModal(tx = null, prefilledType = null, prefilledClientId = null) {
  const form = document.getElementById('txForm');
  form.reset();
  pendingReceipt = null;
  const previewCard = document.getElementById('receiptPreviewCard');
  if (previewCard) previewCard.style.display = 'none';
  const receiptTypeSelect = document.getElementById('formTxReceiptType');
  if (receiptTypeSelect) receiptTypeSelect.value = 'Resi Pengiriman / Bukti Transfer';

  // Populate Clients in dropdown
  const clientSelect = document.getElementById('formTxClientSelect');
  clientSelect.innerHTML = '<option value="">-- Pilih Klien --</option>' +
    state.clients.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('');

  if (tx) {
    document.getElementById('modalTxTitle').textContent = `Edit Transaksi ${tx.id}`;
    document.getElementById('formTxId').value = tx.id;
    if (tx.type === 'UANG MASUK') document.getElementById('radioInflow').checked = true;
    else document.getElementById('radioOutflow').checked = true;

    updateCategoryOptions(tx.type);

    clientSelect.value = tx.clientId;
    document.getElementById('formTxDate').value = tx.date;
    document.getElementById('formTxAmountRaw').value = tx.amount;
    document.getElementById('formTxAmountDisplay').value = formatRupiah(tx.amount).replace('Rp ', '');
    document.getElementById('formTxCategory').value = tx.category;
    document.getElementById('formTxMethod').value = tx.paymentMethod || 'Transfer Bank';
    document.getElementById('formTxRef').value = tx.refNumber || '';
    document.getElementById('formTxSource').value = tx.source || '';
    document.getElementById('formTxDestination').value = tx.destination || '';
    document.getElementById('formTxNotes').value = tx.notes || '';

    if (tx.receipt && tx.receipt.dataUrl) {
      pendingReceipt = { ...tx.receipt };
      const previewCard = document.getElementById('receiptPreviewCard');
      if (previewCard) {
        previewCard.style.display = 'flex';
        document.getElementById('selectedReceiptFileName').textContent = tx.receipt.fileName;
        document.getElementById('receiptTypeBadge').textContent = tx.receipt.receiptType || 'Bukti Transaksi';
        document.getElementById('receiptSizeBadge').textContent = tx.receipt.sizeStr || 'Tersimpan';
        const isPdf = (tx.receipt.fileType === 'application/pdf') || (tx.receipt.fileName && tx.receipt.fileName.endsWith('.pdf'));
        const thumb = document.getElementById('receiptThumbImg');
        const pdfIcon = document.getElementById('receiptPdfIcon');
        if (isPdf) {
          thumb.style.display = 'none';
          pdfIcon.style.display = 'block';
        } else {
          thumb.style.display = 'block';
          thumb.src = tx.receipt.dataUrl;
          pdfIcon.style.display = 'none';
        }
      }
      if (document.getElementById('formTxReceiptType')) {
        document.getElementById('formTxReceiptType').value = tx.receipt.receiptType || 'Resi Pengiriman / Bukti Transfer';
      }
    }
  } else {
    document.getElementById('modalTxTitle').textContent = 'Tambah Transaksi Baru';
    document.getElementById('formTxId').value = '';

    const defaultType = prefilledType || 'UANG MASUK';
    if (defaultType === 'UANG MASUK') document.getElementById('radioInflow').checked = true;
    else document.getElementById('radioOutflow').checked = true;

    updateCategoryOptions(defaultType);

    if (prefilledClientId) {
      clientSelect.value = prefilledClientId;
    }

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('formTxDate').value = today;
    document.getElementById('formTxAmountRaw').value = '0';
    document.getElementById('formTxAmountDisplay').value = '';
  }

  document.getElementById('modalTransaction').style.display = 'flex';
}

function closeTransactionModal() {
  document.getElementById('modalTransaction').style.display = 'none';
  pendingReceipt = null;
}

function updateCategoryOptions(type) {
  const catSelect = document.getElementById('formTxCategory');
  const catList = type === 'UANG MASUK' ? state.categories.inflow : state.categories.outflow;
  catSelect.innerHTML = catList.map(c => `<option value="${c}">${c}</option>`).join('');
}

// Live Rupiah input formatting
document.getElementById('formTxAmountDisplay').addEventListener('input', (e) => {
  const raw = parseRupiah(e.target.value);
  document.getElementById('formTxAmountRaw').value = raw;
  if (raw > 0) {
    e.target.value = raw.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  } else {
    e.target.value = '';
  }
});

// Switch categories when radio changes
document.querySelectorAll('input[name="txTypeRadio"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    updateCategoryOptions(e.target.value);
  });
});

// Helper untuk memproses berkas resi/foto kamera
async function processSelectedReceiptFile(file) {
  if (!file) return;

  try {
    showToast('Memproses dan mengompres dokumen bukti...', 'info');
    const { dataUrl, fileType } = await compressImage(file);
    const dateVal = document.getElementById('formTxDate').value || new Date().toISOString().split('T')[0];
    const txIdVal = document.getElementById('formTxId').value || generateTransactionId();
    const ext = file.name ? file.name.split('.').pop() : (fileType === 'application/pdf' ? 'pdf' : 'jpg');
    const safeName = `${dateVal}_${txIdVal}_bukti.${ext}`;
    const receiptType = document.getElementById('formTxReceiptType').value || 'Bukti Transaksi';

    const sizeInKb = Math.round((dataUrl.length * 3 / 4) / 1024);

    pendingReceipt = {
      fileName: safeName,
      fileType: fileType,
      dataUrl: dataUrl,
      receiptType: receiptType,
      sizeStr: `${sizeInKb} KB`,
      path: `/data/clients/klien-xxxx/receipts/${safeName}`
    };

    const previewCard = document.getElementById('receiptPreviewCard');
    if (previewCard) previewCard.style.display = 'flex';
    document.getElementById('selectedReceiptFileName').textContent = safeName;
    document.getElementById('receiptTypeBadge').textContent = receiptType;
    document.getElementById('receiptSizeBadge').textContent = `${sizeInKb} KB (Terkoreksi)`;

    const isPdf = fileType === 'application/pdf';
    const thumb = document.getElementById('receiptThumbImg');
    const pdfIcon = document.getElementById('receiptPdfIcon');
    if (isPdf) {
      thumb.style.display = 'none';
      pdfIcon.style.display = 'block';
    } else {
      thumb.style.display = 'block';
      thumb.src = dataUrl;
      pdfIcon.style.display = 'none';
    }

    showToast('✓ Bukti transaksi berhasil disiapkan dan dikompres.');
  } catch (err) {
    console.error(err);
    showToast('Gagal memproses gambar/resi.', 'error');
  }
}

// 1. Ambil Foto Kamera Smartphone
const btnCapture = document.getElementById('btnCapturePhoto');
if (btnCapture) {
  btnCapture.addEventListener('click', () => {
    document.getElementById('formTxCameraInput').click();
  });
}
const camInput = document.getElementById('formTxCameraInput');
if (camInput) {
  camInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedReceiptFile(e.target.files[0]);
    }
  });
}

// 2. Pilih dari Galeri / Berkas PDF
document.getElementById('btnSelectReceipt').addEventListener('click', () => {
  document.getElementById('formTxReceiptFile').click();
});
document.getElementById('formTxReceiptFile').addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    processSelectedReceiptFile(e.target.files[0]);
  }
});

// 3. Lihat Preview Cepat Bukti yang Sedang Aktif
const btnPrevCur = document.getElementById('btnPreviewCurrentReceipt');
if (btnPrevCur) {
  btnPrevCur.addEventListener('click', () => {
    if (pendingReceipt && pendingReceipt.dataUrl) {
      const isPdf = pendingReceipt.fileType === 'application/pdf';
      const imgEl = document.getElementById('lbImage');
      const pdfViewer = document.getElementById('lbPdfViewer');
      const pdfFrame = document.getElementById('lbPdfFrame');

      document.getElementById('lbReceiptTitle').textContent = `Preview: ${pendingReceipt.fileName}`;
      document.getElementById('lbTxCode').textContent = document.getElementById('formTxId').value || 'Draft Baru';
      const clientSelect = document.getElementById('formTxClientSelect');
      document.getElementById('lbClientName').textContent = clientSelect.options[clientSelect.selectedIndex]?.text || '-';
      document.getElementById('lbTxDate').textContent = document.getElementById('formTxDate').value || '-';
      document.getElementById('lbTxAmount').textContent = formatRupiah(document.getElementById('formTxAmountRaw').value || 0);
      document.getElementById('lbTxCategory').textContent = document.getElementById('formTxCategory').value || '-';
      document.getElementById('lbTxNotes').textContent = document.getElementById('formTxNotes').value || '-';
      document.getElementById('lbFileName').textContent = pendingReceipt.fileName;

      if (isPdf) {
        imgEl.style.display = 'none';
        pdfViewer.style.display = 'block';
        pdfFrame.src = pendingReceipt.dataUrl;
      } else {
        pdfViewer.style.display = 'none';
        imgEl.style.display = 'block';
        imgEl.src = pendingReceipt.dataUrl;
        state.lightboxScale = 1;
        state.lightboxRotate = 0;
        applyLightboxTransform();
      }
      document.getElementById('modalLightbox').style.display = 'flex';
    }
  });
}

document.getElementById('btnRemoveReceipt').addEventListener('click', () => {
  pendingReceipt = null;
  const previewCard = document.getElementById('receiptPreviewCard');
  if (previewCard) previewCard.style.display = 'none';
  const receiptTypeSelect = document.getElementById('formTxReceiptType');
  if (receiptTypeSelect) receiptTypeSelect.value = 'Resi Pengiriman / Bukti Transfer';
  document.getElementById('formTxReceiptFile').value = '';
});

// Add new category dynamically
document.getElementById('btnAddNewCategory').addEventListener('click', () => {
  const newCat = prompt('Masukkan nama kategori baru:');
  if (newCat && newCat.trim()) {
    const trimmed = newCat.trim();
    const type = document.querySelector('input[name="txTypeRadio"]:checked').value;
    if (type === 'UANG MASUK') {
      if (!state.categories.inflow.includes(trimmed)) state.categories.inflow.push(trimmed);
    } else {
      if (!state.categories.outflow.includes(trimmed)) state.categories.outflow.push(trimmed);
    }
    state.saveToStorage();
    updateCategoryOptions(type);
    document.getElementById('formTxCategory').value = trimmed;
    showToast(`Kategori "${trimmed}" ditambahkan.`);
  }
});

// Submit Transaction Form
document.getElementById('txForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const txId = document.getElementById('formTxId').value;
  const isEdit = Boolean(txId);

  const clientId = document.getElementById('formTxClientSelect').value;
  const clientObj = state.clients.find(c => c.id === clientId);
  if (!clientObj) {
    showToast('Silakan pilih klien terlebih dahulu.', 'error');
    return;
  }

  const rawAmount = parseFloat(document.getElementById('formTxAmountRaw').value) || 0;
  if (rawAmount <= 0) {
    showToast('Nominal transaksi harus lebih besar dari Rp 0.', 'error');
    return;
  }

  const txDate = document.getElementById('formTxDate').value;
  if (!txDate) {
    showToast('Tanggal transaksi wajib diisi.', 'error');
    return;
  }

  const txType = document.querySelector('input[name="txTypeRadio"]:checked').value;
  const category = document.getElementById('formTxCategory').value;
  const now = new Date();
  const dateParts = txDate.split('-');

  // Set safe path on receipt if exists
  if (pendingReceipt) {
    pendingReceipt.path = `/data/clients/${clientId.toLowerCase()}/receipts/${pendingReceipt.fileName}`;
  }

  const txData = {
    id: isEdit ? txId : generateTransactionId(),
    clientId: clientId,
    clientName: clientObj.name,
    date: txDate,
    month: dateParts[1],
    year: dateParts[0],
    inputDate: isEdit ? (state.transactions.find(t => t.id === txId)?.inputDate || txDate) : now.toISOString().split('T')[0],
    inputTime: isEdit ? (state.transactions.find(t => t.id === txId)?.inputTime || '10:00:00') : now.toTimeString().split(' ')[0],
    updatedDate: now.toISOString().split('T')[0],
    updatedTime: now.toTimeString().split(' ')[0],
    type: txType,
    category: category,
    amount: rawAmount,
    paymentMethod: document.getElementById('formTxMethod').value,
    source: document.getElementById('formTxSource').value.trim(),
    destination: document.getElementById('formTxDestination').value.trim(),
    refNumber: document.getElementById('formTxRef').value.trim(),
    notes: document.getElementById('formTxNotes').value.trim(),
    status: 'Selesai',
    receipt: pendingReceipt,
    syncStatus: state.settings.github.token ? 'pending' : 'synced'
  };

  if (isEdit) {
    const idx = state.transactions.findIndex(t => t.id === txId);
    if (idx !== -1) {
      state.transactions[idx] = txData;
      state.logAudit('UPDATE', 'TRANSACTION', `Perubahan transaksi ${txData.id} (${clientObj.name}) Rp ${formatRupiah(rawAmount)}`);
      showToast(`Transaksi ${txData.id} berhasil diubah.`);
    }
  } else {
    state.transactions.unshift(txData);
    state.logAudit('CREATE', 'TRANSACTION', `Catat transaksi baru ${txData.id} (${clientObj.name}) ${txType} Rp ${formatRupiah(rawAmount)}`);
    showToast(`Transaksi ${txData.id} berhasil dicatat.`);
  }

  state.saveToStorage();
  closeTransactionModal();
  renderDashboard();
  renderTransactionsView();
  if (state.currentView === 'client-detail') renderClientDetailView();
});

function editTransaction(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (tx) openTransactionModal(tx);
}

function deleteTransaction(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;

  if (confirm(`Apakah Anda yakin ingin menghapus transaksi ${tx.id} (${formatRupiah(tx.amount)})?`)) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    state.logAudit('DELETE', 'TRANSACTION', `Menghapus transaksi ${tx.id} (${tx.clientName})`);
    state.saveToStorage();
    showToast(`Transaksi ${id} telah dihapus.`, 'info');
    renderDashboard();
    renderTransactionsView();
    if (state.currentView === 'client-detail') renderClientDetailView();
  }
}

// ==================== EXPORT DATA ENGINE ====================
function exportToCSV(filename, rows) {
  const processRow = (row) => {
    return row.map(val => {
      let v = val === null || val === undefined ? '' : val.toString();
      v = v.replace(/"/g, '""');
      if (v.search(/("|,|\n)/g) >= 0) v = `"${v}"`;
      return v;
    }).join(',');
  };

  const csvContent = "\uFEFF" + rows.map(processRow).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportTransactionsCSV(customList = null, filename = null) {
  const list = customList || state.transactions;
  const headers = [
    'ID Transaksi', 'ID Klien', 'Nama Klien', 'Tanggal', 'Bulan', 'Tahun',
    'Jenis', 'Kategori', 'Nominal (IDR)', 'Metode Pembayaran', 'Pengirim',
    'Penerima', 'No. Referensi', 'Keterangan', 'Status', 'Nama Berkas Resi'
  ];

  const rows = [headers];
  list.forEach(t => {
    rows.push([
      t.id,
      t.clientId,
      t.clientName,
      t.date,
      t.month,
      t.year,
      t.type,
      t.category,
      t.amount,
      t.paymentMethod || '',
      t.source || '',
      t.destination || '',
      t.refNumber || '',
      t.notes || '',
      t.status || '',
      t.receipt ? t.receipt.fileName : ''
    ]);
  });

  const name = filename || `transaksi-kasklien-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(name, rows);
  showToast(`File CSV "${name}" berhasil diunduh.`);
}

function exportExcelReport() {
  const table = document.querySelector('.print-table');
  if (!table) return;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Laporan Keuangan</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
    <body>
      <h2>${state.settings.firmName}</h2>
      <h3>${document.getElementById('reportTitleHeader').textContent}</h3>
      <p>${document.getElementById('reportSubHeader').textContent}</p>
      ${table.outerHTML}
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Laporan-Keuangan-${new Date().toISOString().split('T')[0]}.xls`;
  link.click();
  showToast('File Laporan Excel berhasil diunduh.');
}

// ==================== BACKUP & RESTORE ====================
function downloadJSONBackup() {
  const backupData = {
    app: 'KasKlien',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    firm: state.settings.firmName,
    data: {
      clients: state.clients,
      transactions: state.transactions,
      categories: state.categories,
      settings: state.settings,
      auditLogs: state.auditLogs
    }
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `backup-keuangan-${dateStr}.json`;
  link.click();
  showToast(`Cadangan data berhasil diunduh: backup-keuangan-${dateStr}.json`);
}

let loadedRestoreData = null;

function handleRestoreFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.data || !Array.isArray(parsed.data.clients) || !Array.isArray(parsed.data.transactions)) {
        throw new Error('Format file backup tidak sesuai struktur KasKlien.');
      }

      loadedRestoreData = parsed.data;
      const previewBox = document.getElementById('restorePreviewBox');
      const previewText = document.getElementById('restorePreviewText');
      previewBox.style.display = 'block';
      previewText.innerHTML = `
        <strong>File Backup Valid:</strong><br>
        • Tanggal Cadangan: ${parsed.exportedAt || 'Tidak diketahui'}<br>
        • Jumlah Klien: ${parsed.data.clients.length}<br>
        • Jumlah Transaksi: ${parsed.data.transactions.length}<br>
        • Kantor/Firma: ${parsed.firm || '-'}
      `;
      showToast('File backup siap dipulihkan. Tekan tombol Konfirmasi.');
    } catch (err) {
      alert(`Gagal membaca file backup: ${err.message}`);
      loadedRestoreData = null;
    }
  };
  reader.readAsText(file);
}

document.getElementById('btnExecuteRestore').addEventListener('click', () => {
  if (!loadedRestoreData) return;
  if (confirm('PERINGATAN: Memulihkan cadangan akan menimpa data kas yang ada saat ini. Lanjutkan?')) {
    state.clients = loadedRestoreData.clients || [];
    state.transactions = loadedRestoreData.transactions || [];
    if (loadedRestoreData.categories) state.categories = loadedRestoreData.categories;
    if (loadedRestoreData.settings) state.settings = loadedRestoreData.settings;
    if (loadedRestoreData.auditLogs) state.auditLogs = loadedRestoreData.auditLogs;

    state.logAudit('RESTORE', 'BACKUP', `Memulihkan ${state.clients.length} klien dan ${state.transactions.length} transaksi dari file cadangan`);
    state.saveToStorage();
    showToast('Data berhasil dipulihkan secara menyeluruh!');
    setTimeout(() => location.reload(), 1000);
  }
});

// ==================== GLOBAL SEARCH ====================
const globalSearchInput = document.getElementById('globalSearchInput');
const searchOverlay = document.getElementById('searchOverlay');
const searchResultsContainer = document.getElementById('searchResultsContainer');
const searchResultsCount = document.getElementById('searchResultsCount');
const btnClearSearch = document.getElementById('btnClearSearch');

globalSearchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) {
    searchOverlay.style.display = 'none';
    btnClearSearch.style.display = 'none';
    return;
  }

  btnClearSearch.style.display = 'inline';

  // Search clients
  const matchedClients = state.clients.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.id.toLowerCase().includes(q) ||
    (c.refNumber && c.refNumber.toLowerCase().includes(q))
  );

  // Search transactions
  const matchedTxs = state.transactions.filter(t =>
    t.id.toLowerCase().includes(q) ||
    t.clientName.toLowerCase().includes(q) ||
    (t.notes && t.notes.toLowerCase().includes(q)) ||
    (t.refNumber && t.refNumber.toLowerCase().includes(q)) ||
    (t.receipt && t.receipt.fileName && t.receipt.fileName.toLowerCase().includes(q)) ||
    t.amount.toString().includes(q)
  );

  const total = matchedClients.length + matchedTxs.length;
  searchResultsCount.textContent = `${total} ditemukan`;

  let html = '';

  if (matchedClients.length > 0) {
    html += '<div class="px-3 py-1 text-xs text-muted font-weight-bold">KLIEN:</div>';
    matchedClients.forEach(c => {
      html += `
        <div class="search-result-item" onclick="openClientDetail('${c.id}'); closeGlobalSearch();">
          <div>
            <strong>${c.name}</strong> <span class="badge badge-purple">${c.id}</span><br>
            <small class="text-muted">Ref: ${c.refNumber || '-'}</small>
          </div>
          <span>Buka Klien →</span>
        </div>
      `;
    });
  }

  if (matchedTxs.length > 0) {
    html += '<div class="px-3 py-1 text-xs text-muted font-weight-bold mt-2">TRANSAKSI:</div>';
    matchedTxs.forEach(t => {
      const isIncome = t.type === 'UANG MASUK';
      html += `
        <div class="search-result-item" onclick="openLightbox('${t.id}'); closeGlobalSearch();">
          <div>
            <strong>${t.id}</strong> - <span>${t.clientName}</span><br>
            <small class="text-muted">${t.date} | ${t.notes || t.category}</small>
          </div>
          <div class="text-right">
            <strong class="${isIncome ? 'text-green' : 'text-red'}">${formatRupiah(t.amount)}</strong><br>
            <span class="badge ${isIncome ? 'badge-green' : 'badge-red'} text-xs">${t.type}</span>
          </div>
        </div>
      `;
    });
  }

  if (total === 0) {
    html = `<div class="p-3 text-center text-muted">Tidak ditemukan data yang cocok dengan "${q}".</div>`;
  }

  searchResultsContainer.innerHTML = html;
  searchOverlay.style.display = 'block';
});

function closeGlobalSearch() {
  searchOverlay.style.display = 'none';
  globalSearchInput.value = '';
  btnClearSearch.style.display = 'none';
}

btnClearSearch.addEventListener('click', closeGlobalSearch);

document.addEventListener('click', (e) => {
  if (!e.target.closest('.navbar-search') && !e.target.closest('.search-overlay')) {
    searchOverlay.style.display = 'none';
  }
});

// ==================== NAVIGATION ROUTER ====================
function navigateTo(viewId) {
  state.currentView = viewId;

  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) targetView.classList.add('active');

  const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  if (navItem) navItem.classList.add('active');

  document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
  const bnavItem = document.querySelector(`.bnav-item[data-view="${viewId}"]`);
  if (bnavItem) bnavItem.classList.add('active');

  // Breadcrumb updates
  const viewTitles = {
    'dashboard': 'Dashboard Ringkasan',
    'clients': 'Data Klien',
    'client-detail': 'Buku Kas Klien',
    'transactions': 'Semua Transaksi',
    'inflow': 'Uang Masuk (Pemasukan)',
    'outflow': 'Uang Keluar (Pengeluaran)',
    'reports': 'Laporan Keuangan',
    'client-recap': 'Rekap Semua Klien',
    'audit-log': 'Riwayat Perubahan Data',
    'backup': 'Backup & Restore',
    'settings': 'Pengaturan & GitHub'
  };

  document.getElementById('currentViewTitle').textContent = viewTitles[viewId] || 'KasKlien';

  // Trigger render functions
  if (viewId === 'dashboard') renderDashboard();
  if (viewId === 'clients') renderClientsView();
  if (viewId === 'client-detail') renderClientDetailView();
  if (viewId === 'transactions') {
    document.getElementById('filterTxType').value = 'all';
    renderTransactionsView();
  }
  if (viewId === 'inflow') {
    state.currentView = 'transactions';
    document.getElementById('view-transactions').classList.add('active');
    document.getElementById('txPageTitle').textContent = 'Pencatatan Uang Masuk (Pemasukan)';
    document.getElementById('filterTxType').value = 'UANG MASUK';
    renderTransactionsView();
  }
  if (viewId === 'outflow') {
    state.currentView = 'transactions';
    document.getElementById('view-transactions').classList.add('active');
    document.getElementById('txPageTitle').textContent = 'Pencatatan Uang Keluar (Pengeluaran)';
    document.getElementById('filterTxType').value = 'UANG KELUAR';
    renderTransactionsView();
  }
  if (viewId === 'reports') renderReportsView();
  if (viewId === 'client-recap') renderClientRecapView();
  if (viewId === 'audit-log') renderAuditLogView();
  if (viewId === 'backup') renderBackupView();
  if (viewId === 'settings') renderSettingsView();

  // Close mobile sidebar if open
  document.getElementById('sidebar').classList.remove('mobile-open');
}

// Nav links click
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const view = item.getAttribute('data-view');
    window.location.hash = view;
    navigateTo(view);
  });
});

// Hash change router
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigateTo(hash);
});

// ==================== EVENT LISTENERS & SETUP ====================
document.addEventListener('DOMContentLoaded', () => {
  state.init();

  // Initial routing
  const initialHash = window.location.hash.replace('#', '') || 'dashboard';
  navigateTo(initialHash);

  // Sync Pill & Settings
  updateSyncIndicators();

  // Dark Mode Toggle
  const btnTheme = document.getElementById('btnThemeToggle');
  btnTheme.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    state.settings.theme = isDark ? 'dark' : 'light';
    state.saveToStorage();
    document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
    renderCashflowChart();
    renderCategoryChart();
  });

  if (state.settings.theme === 'dark') {
    document.body.classList.add('dark-theme');
    document.getElementById('themeIcon').textContent = '☀️';
  }

  // Mobile FAB Tambah Transaksi
  const mobileFab = document.getElementById('mobileFabAddTx');
  if (mobileFab) {
    mobileFab.addEventListener('click', () => {
      openTransactionModal();
    });
  }

  // Mobile Bottom Navigation Links
  document.querySelectorAll('.bnav-item').forEach(bitem => {
    bitem.addEventListener('click', (e) => {
      e.preventDefault();
      const v = bitem.getAttribute('data-view');
      window.location.hash = v;
      navigateTo(v);
    });
  });

  // Mobile Menu Toggle
  document.getElementById('btnMenuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('mobile-open');
  });

  document.getElementById('btnCloseSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('mobile-open');
  });

  // Modal Closers
  document.getElementById('btnCloseClientModal').addEventListener('click', closeClientModal);
  document.getElementById('btnCancelClient').addEventListener('click', closeClientModal);

  document.getElementById('btnCloseTxModal').addEventListener('click', closeTransactionModal);
  document.getElementById('btnCancelTx').addEventListener('click', closeTransactionModal);

  document.getElementById('btnCloseLightbox').addEventListener('click', closeLightbox);

  // Lightbox Zoom Controls
  document.getElementById('lbZoomIn').addEventListener('click', () => {
    state.lightboxScale += 0.25;
    applyLightboxTransform();
  });
  document.getElementById('lbZoomOut').addEventListener('click', () => {
    if (state.lightboxScale > 0.4) state.lightboxScale -= 0.25;
    applyLightboxTransform();
  });
  document.getElementById('lbResetZoom').addEventListener('click', () => {
    state.lightboxScale = 1;
    state.lightboxRotate = 0;
    applyLightboxTransform();
  });
  document.getElementById('lbRotate').addEventListener('click', () => {
    state.lightboxRotate = (state.lightboxRotate + 90) % 360;
    applyLightboxTransform();
  });

  // Dashboard Quick Actions
  document.getElementById('qaAddClient').addEventListener('click', () => openClientModal());
  document.getElementById('qaCashIn').addEventListener('click', () => openTransactionModal(null, 'UANG MASUK'));
  document.getElementById('qaCashOut').addEventListener('click', () => openTransactionModal(null, 'UANG KELUAR'));
  document.getElementById('qaReports').addEventListener('click', () => navigateTo('reports'));
  document.getElementById('qaClientList').addEventListener('click', () => navigateTo('clients'));

  document.getElementById('btnOpenNewTxDash').addEventListener('click', () => openTransactionModal());
  document.getElementById('btnOpenNewClient').addEventListener('click', () => openClientModal());
  document.getElementById('btnOpenNewTx').addEventListener('click', () => openTransactionModal());

  // Client Detail View Actions
  document.getElementById('btnBackToClients').addEventListener('click', () => navigateTo('clients'));
  document.getElementById('btnAddTxForClientIn').addEventListener('click', () => {
    openTransactionModal(null, 'UANG MASUK', state.activeClientDetailId);
  });
  document.getElementById('btnAddTxForClientOut').addEventListener('click', () => {
    openTransactionModal(null, 'UANG KELUAR', state.activeClientDetailId);
  });
  document.getElementById('btnExportClientCSV').addEventListener('click', () => {
    const list = state.transactions.filter(t => t.clientId === state.activeClientDetailId);
    exportTransactionsCSV(list, `buku-kas-${state.activeClientDetailId}.csv`);
  });
  document.getElementById('btnPrintClientReport').addEventListener('click', () => {
    document.getElementById('reportClientSelect').value = state.activeClientDetailId;
    navigateTo('reports');
    generateReportSheet();
    setTimeout(() => window.print(), 300);
  });

  // Filter Listeners
  ['clientFilterSearch', 'clientFilterStatus', 'clientSortBy'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderClientsView);
  });

  const txFilterInputs = [
    'filterTxClient', 'filterTxType', 'filterTxCategory', 'filterTxYear',
    'filterTxMonth', 'filterTxStartDate', 'filterTxEndDate', 'filterTxMethod',
    'filterTxMinAmount', 'filterTxMaxAmount'
  ];
  txFilterInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyTransactionFilters);
    if (el && el.tagName === 'INPUT') el.addEventListener('keyup', applyTransactionFilters);
  });

  document.getElementById('btnResetTxFilters').addEventListener('click', () => {
    txFilterInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el.tagName === 'SELECT') el.value = 'all';
      else el.value = '';
    });
    applyTransactionFilters();
  });

  // Reports Actions
  document.getElementById('btnGenerateReport').addEventListener('click', generateReportSheet);
  document.getElementById('btnExportReportCSV').addEventListener('click', () => {
    exportTransactionsCSV(null, `laporan-kas-${new Date().toISOString().split('T')[0]}.csv`);
  });
  document.getElementById('btnExportReportExcel').addEventListener('click', exportExcelReport);
  document.getElementById('btnPrintReport').addEventListener('click', () => window.print());

  // Recap & Transaction CSV exports
  document.getElementById('btnExportTxCSV').addEventListener('click', () => exportTransactionsCSV());
  document.getElementById('btnExportRecapCSV').addEventListener('click', () => {
    const rows = [['ID Klien', 'Nama Klien', 'No. Referensi', 'Status', 'Total Masuk', 'Total Keluar', 'Saldo Kas', 'Jumlah Transaksi']];
    state.clients.forEach(c => {
      const txs = state.transactions.filter(t => t.clientId === c.id);
      const totalIn = txs.filter(t => t.type === 'UANG MASUK').reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const totalOut = txs.filter(t => t.type === 'UANG KELUAR').reduce((acc, t) => acc + Number(t.amount || 0), 0);
      rows.push([c.id, c.name, c.refNumber || '', c.status, totalIn, totalOut, totalIn - totalOut, txs.length]);
    });
    exportToCSV(`rekap-semua-klien-${new Date().toISOString().split('T')[0]}.csv`, rows);
    showToast('File CSV Rekap Klien berhasil diunduh.');
  });
  document.getElementById('btnPrintRecap').addEventListener('click', () => window.print());

  // Backup & Restore
  document.getElementById('btnDownloadBackup').addEventListener('click', downloadJSONBackup);
  const dropZone = document.getElementById('backupDropZone');
  const restoreFileInput = document.getElementById('restoreFileInput');

  dropZone.addEventListener('click', () => restoreFileInput.click());
  restoreFileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleRestoreFile(e.target.files[0]);
  });

  // Drag & Drop support
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--color-purple)';
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = 'var(--border-color)';
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleRestoreFile(e.dataTransfer.files[0]);
    }
  });

  // Settings & GitHub
  document.getElementById('btnToggleToken').addEventListener('click', () => {
    const tokenInput = document.getElementById('ghToken');
    tokenInput.type = tokenInput.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('githubSettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    state.settings.github.repo = document.getElementById('ghRepoName').value.trim();
    state.settings.github.branch = document.getElementById('ghBranch').value.trim() || 'main';
    state.settings.github.dataFolder = document.getElementById('ghDataFolder').value.trim() || 'data';
    state.settings.github.token = document.getElementById('ghToken').value.trim();
    state.saveToStorage();
    updateSyncIndicators();
    showToast('Pengaturan GitHub berhasil disimpan.');
  });

  document.getElementById('btnTestGitHub').addEventListener('click', async () => {
    const statusMsg = document.getElementById('ghStatusMsg');
    const statusDot = document.getElementById('ghStatusDot');
    statusMsg.textContent = 'Menghubungi GitHub API...';
    statusDot.className = 'status-dot gold';

    try {
      // Temporarily read form values for testing
      state.settings.github.repo = document.getElementById('ghRepoName').value.trim();
      state.settings.github.token = document.getElementById('ghToken').value.trim();
      const res = await gitHubService.testConnection();

      statusMsg.textContent = `Terhubung ke ${res.name} (${res.private ? 'Private Repo' : 'Public Repo'})`;
      statusDot.className = 'status-dot green';
      showToast('Koneksi ke repository GitHub berhasil diverifikasi!');
    } catch (err) {
      statusMsg.textContent = `Gagal: ${err.message}`;
      statusDot.className = 'status-dot red';
      showToast(`Uji koneksi gagal: ${err.message}`, 'error');
    }
  });

  document.getElementById('generalSettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    state.settings.firmName = document.getElementById('setFirmName').value.trim();
    state.settings.ownerName = document.getElementById('setOwnerName').value.trim();
    state.settings.activeYear = document.getElementById('setActiveYear').value;
    state.saveToStorage();
    document.getElementById('navUserFirm').textContent = state.settings.firmName;
    document.getElementById('navUserName').textContent = state.settings.ownerName;
    showToast('Identitas kantor dan tahun buku berhasil disimpan.');
  });

  // Purge Demo Data
  document.getElementById('btnPurgeDemoData').addEventListener('click', () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data demo? Seluruh klien dan transaksi contoh akan dibersihkan agar Anda bisa mulai mencatat data asli.')) {
      state.purgeDemoData();
      showToast('Data demo berhasil dibersihkan.');
      renderDashboard();
      renderClientsView();
      renderTransactionsView();
    }
  });

  // Clear Audit Log
  document.getElementById('btnClearAuditLog').addEventListener('click', () => {
    if (confirm('Hapus seluruh riwayat audit log?')) {
      state.auditLogs = [];
      state.saveToStorage();
      renderAuditLogView();
      showToast('Riwayat perubahan telah dikosongkan.');
    }
  });

  // Sync button in sidebar
  document.getElementById('btnQuickSync').addEventListener('click', triggerManualSync);
  const btnPush = document.getElementById('btnPushToGitHub');
  if (btnPush) btnPush.addEventListener('click', performPush);
  const btnPull = document.getElementById('btnPullFromGitHub');
  if (btnPull) btnPull.addEventListener('click', performPull);
});

async function performPush() {
  const dot = document.getElementById('syncDot');
  const txt = document.getElementById('syncStatusText');
  if (dot) dot.className = 'status-dot gold';
  if (txt) txt.textContent = 'Mengunggah...';

  try {
    showToast('Memulai unggah data ke repository GitHub...', 'info');
    const stats = await gitHubService.syncAllToGitHub();
    if (dot) dot.className = 'status-dot green';
    if (txt) txt.textContent = 'Tersinkron GitHub';
    state.logAudit('SYNC', 'GITHUB', `Berhasil unggah ${stats.clientsPushed} folder klien dan ${stats.txPushed} transaksi ke GitHub`);
    showToast(`Unggah sukses! ${stats.clientsPushed} folder klien tersimpan di GitHub.`);
  } catch (err) {
    console.error(err);
    if (dot) dot.className = 'status-dot red';
    if (txt) txt.textContent = 'Gagal Sinkronisasi';
    showToast(`Gagal unggah ke GitHub: ${err.message}`, 'error');
  }
}

async function performPull() {
  const dot = document.getElementById('syncDot');
  const txt = document.getElementById('syncStatusText');
  if (dot) dot.className = 'status-dot gold';
  if (txt) txt.textContent = 'Mengambil Data...';

  try {
    showToast('Mengambil data terbaru dari repository GitHub...', 'info');
    const res = await gitHubService.pullFromGitHub();
    if (dot) dot.className = 'status-dot green';
    if (txt) txt.textContent = 'Data Diperbarui';
    state.logAudit('SYNC', 'GITHUB', `Berhasil mengunduh ${res.clientsCount} klien dan ${res.txCount} transaksi dari GitHub`);
    showToast(`Berhasil menarik data: ${res.clientsCount} klien dan ${res.txCount} transaksi.`);
    renderDashboard();
    renderClientsView();
    renderTransactionsView();
  } catch (err) {
    console.error(err);
    if (dot) dot.className = 'status-dot red';
    if (txt) txt.textContent = 'Gagal Tarik Data';
    showToast(`Gagal mengambil data dari GitHub: ${err.message}`, 'error');
  }
}

async function triggerManualSync() {
  if (!gitHubService.isConfigured()) {
    alert('GitHub belum dikonfigurasi. Silakan buka menu Pengaturan & GitHub untuk memasukkan repository dan Personal Access Token.');
    navigateTo('settings');
    return;
  }

  const isPush = confirm('Pilih Arah Sinkronisasi:\n\n• Klik [OK] untuk MENGUNGGAH (Push) data lokal dari perangkat ini ke GitHub.\n• Klik [Batal] untuk MENARIK (Pull) data dari GitHub ke perangkat ini.');
  if (isPush) {
    await performPush();
  } else {
    const doPull = confirm('Tarik data dari GitHub dan perbarui data di perangkat ini?');
    if (doPull) {
      await performPull();
    }
  }
}

function updateSyncIndicators() {
  const isConfigured = gitHubService.isConfigured();
  const navDot = document.getElementById('navSyncDot');
  const navText = document.getElementById('navSyncText');
  const sidebarDot = document.getElementById('syncDot');
  const sidebarText = document.getElementById('syncStatusText');

  if (isConfigured) {
    navDot.className = 'status-dot green';
    navText.textContent = 'GitHub Siap';
    sidebarDot.className = 'status-dot green';
    sidebarText.textContent = 'Siap Sinkron';
  } else {
    navDot.className = 'status-dot gold';
    navText.textContent = 'Mode Offline/Lokal';
    sidebarDot.className = 'status-dot gold';
    sidebarText.textContent = 'Penyimpanan Lokal';
  }
}

function renderSettingsView() {
  document.getElementById('ghRepoName').value = state.settings.github.repo || '';
  document.getElementById('ghBranch').value = state.settings.github.branch || 'main';
  document.getElementById('ghDataFolder').value = state.settings.github.dataFolder || 'data';
  document.getElementById('ghToken').value = state.settings.github.token || '';

  document.getElementById('setFirmName').value = state.settings.firmName || '';
  document.getElementById('setOwnerName').value = state.settings.ownerName || '';
  document.getElementById('setActiveYear').value = state.settings.activeYear || '2026';
}
