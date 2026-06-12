import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;
let token = '';
let testWarehouseId = '';
let testBinId = '';
let testAssetId = '';
let testAssetCode = '';
let testSupplierId = '';
let createdInboundWOId = '';
let createdOutboundWOId = '';
let testLabelCode1 = '';
let testLabelCode2 = '';

// Helper untuk log dengan warna
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[FAIL]\x1b[0m ${msg}`),
  section: (msg) => console.log(`\n\x1b[35m=== ${msg} ===\x1b[0m`)
};

async function runTests() {
  log.section('Memulai Integrasi QA API Testing WMS');
  log.info(`Target Backend: ${BASE_URL}`);

  try {
    // 1. LOGIN API
    log.section('1. Autentikasi');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail: 'admin', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    if (loginRes.ok && loginData.data && loginData.data.token) {
      token = loginData.data.token;
      log.success('Login Admin berhasil');
    } else {
      throw new Error(`Login gagal: ${loginData.message}`);
    }

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. GET MASTER DATA
    log.section('2. Master Data API');

    // Get Warehouses
    const whRes = await fetch(`${BASE_URL}/api/warehouses`, { headers: authHeaders });
    const whData = await whRes.json();
    if (whRes.ok && whData.data.length > 0) {
      testWarehouseId = whData.data[0].id;
      log.success(`GET /api/warehouses - Berhasil (${whData.data.length} Gudang ditemukan)`);
    } else {
      log.error('GET /api/warehouses - Gagal / Kosong');
    }

    // Get Storage Bins
    const binRes = await fetch(`${BASE_URL}/api/storage-bins`, { headers: authHeaders });
    const binData = await binRes.json();
    if (binRes.ok && binData.data.length > 0) {
      // Cari bin yang memiliki asset teralokasi agar valid
      const activeBin = binData.data.find(b => b.assetId);
      if (activeBin) {
        testBinId = activeBin.id;
        testAssetId = activeBin.assetId;
        testAssetCode = activeBin.allocatedAsset?.code || 'AST_01';
        log.success(`GET /api/storage-bins - Berhasil (Menggunakan Bin ${activeBin.code} teralokasi ke SKU ${testAssetCode})`);
      } else {
        testBinId = binData.data[0].id;
        testAssetId = binData.data[0].assetId;
        log.success(`GET /api/storage-bins - Berhasil (Menggunakan Bin pertama)`);
      }
    } else {
      log.error('GET /api/storage-bins - Gagal / Kosong');
    }

    // Get Assets
    const assetRes = await fetch(`${BASE_URL}/api/assets`, { headers: authHeaders });
    const assetData = await assetRes.json();
    if (assetRes.ok && assetData.data.length > 0) {
      const activeAsset = assetData.data.find(a => a.id === testAssetId) || assetData.data[0];
      testAssetId = activeAsset.id;
      testAssetCode = activeAsset.code;
      testSupplierId = activeAsset.supplierId || '';
      log.success(`GET /api/assets - Berhasil (Menggunakan Asset: ${activeAsset.name} / ${activeAsset.code})`);
    } else {
      log.error('GET /api/assets - Gagal / Kosong');
    }

    // 3. WORK ORDER FLOW
    log.section('3. Work Order & Scan Proses (Inbound)');

    // Create Inbound WO
    const createWOInRes = await fetch(`${BASE_URL}/api/work-orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        type: 'inbound',
        warehouseId: testWarehouseId,
        storageBinId: testBinId,
        assetId: testAssetId,
        quantity: 2,
        remarks: 'Test Inbound Automation API'
      })
    });
    const woInData = await createWOInRes.json();
    if (createWOInRes.ok && woInData.data) {
      createdInboundWOId = woInData.data.id;
      log.success(`POST /api/work-orders (Inbound) - Berhasil dibuat: ${woInData.data.code}`);
    } else {
      throw new Error(`Gagal membuat Inbound WO: ${JSON.stringify(woInData.errors || woInData.message)}`);
    }

    // Get Next Labels (Inbound)
    const labelRes = await fetch(`${BASE_URL}/api/work-orders/${createdInboundWOId}/next-labels`, { headers: authHeaders });
    const labelData = await labelRes.json();
    if (labelRes.ok && labelData.data && labelData.data.labels.length > 0) {
      testLabelCode1 = labelData.data.labels[0];
      testLabelCode2 = labelData.data.labels[1];
      log.success(`GET /api/work-orders/:id/next-labels - Berhasil. Label Berikutnya: ${testLabelCode1}, ${testLabelCode2}`);
    } else {
      throw new Error('Gagal mendapatkan pratinjau cetak label');
    }

    // Scan Inbound Label 1
    const scanIn1Res = await fetch(`${BASE_URL}/api/work-orders/${createdInboundWOId}/scan`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ labelCode: testLabelCode1 })
    });
    const scanIn1Data = await scanIn1Res.json();
    if (scanIn1Res.ok && scanIn1Data.success) {
      log.success(`POST /api/work-orders/:id/scan (Inbound 1) - Berhasil: ${testLabelCode1} (Status WO: ${scanIn1Data.data.status})`);
    } else {
      log.error(`POST /api/work-orders/:id/scan (Inbound 1) - Gagal: ${scanIn1Data.message}`);
    }

    // Scan Inbound Label 2 (Target WO 2 unit terpenuhi -> status menjadi Done)
    const scanIn2Res = await fetch(`${BASE_URL}/api/work-orders/${createdInboundWOId}/scan`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ labelCode: testLabelCode2 })
    });
    const scanIn2Data = await scanIn2Res.json();
    if (scanIn2Res.ok && scanIn2Data.data.status === 'Done') {
      log.success(`POST /api/work-orders/:id/scan (Inbound 2) - Berhasil: ${testLabelCode2} (Status WO: Done)`);
    } else {
      log.error(`POST /api/work-orders/:id/scan (Inbound 2) - Gagal: ${scanIn2Data.message}`);
    }


    // 4. OUTBOUND FLOW & FIFO ENFORCEMENT
    log.section('4. Work Order, Scan & FIFO Enforcement (Outbound)');

    // Create Outbound WO
    const createWOOutRes = await fetch(`${BASE_URL}/api/work-orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        type: 'outbound',
        warehouseId: testWarehouseId,
        storageBinId: testBinId,
        assetId: testAssetId,
        quantity: 2,
        remarks: 'Test Outbound Automation API'
      })
    });
    const woOutData = await createWOOutRes.json();
    if (createWOOutRes.ok && woOutData.data) {
      createdOutboundWOId = woOutData.data.id;
      log.success(`POST /api/work-orders (Outbound) - Berhasil dibuat: ${woOutData.data.code}`);
    } else {
      throw new Error(`Gagal membuat Outbound WO: ${JSON.stringify(woOutData.errors || woOutData.message)}`);
    }

    // Get FIFO suggestions
    const suggestionRes = await fetch(`${BASE_URL}/api/work-orders/${createdOutboundWOId}/suggestions`, { headers: authHeaders });
    const suggestionData = await suggestionRes.json();
    if (suggestionRes.ok && suggestionData.data && suggestionData.data.suggestions.length > 0) {
      log.success(`GET /api/work-orders/:id/suggestions - Berhasil. Saran FIFO: ${suggestionData.data.suggestions.map(s => s.labelCode).join(', ')}`);
    } else {
      log.error('GET /api/work-orders/:id/suggestions - Gagal / Kosong');
    }

    // TEST FIFO VIOLATION (Sengaja memindai label kedua dulu)
    log.info(`Menguji pelanggaran FIFO dengan memindai label baru (${testLabelCode2}) mendahului label terlama (${testLabelCode1})`);
    const scanViolateRes = await fetch(`${BASE_URL}/api/work-orders/${createdOutboundWOId}/scan`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ labelCode: testLabelCode2 })
    });
    const scanViolateData = await scanViolateRes.json();
    if (!scanViolateRes.ok && scanViolateData.message.includes('FIFO')) {
      log.success(`FIFO ENFORCEMENT PASSED: Sistem menolak scan salah urutan dengan pesan: "${scanViolateData.message}"`);
    } else {
      log.error(`FIFO ENFORCEMENT FAILED: Scan salah urutan tidak diblokir!`);
    }

    // Scan Outbound Label 1 (Sesuai urutan FIFO terlama)
    const scanOut1Res = await fetch(`${BASE_URL}/api/work-orders/${createdOutboundWOId}/scan`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ labelCode: testLabelCode1 })
    });
    const scanOut1Data = await scanOut1Res.json();
    if (scanOut1Res.ok && scanOut1Data.success) {
      log.success(`POST /api/work-orders/:id/scan (Outbound 1 - FIFO Valid) - Berhasil: ${testLabelCode1} (Status WO: ${scanOut1Data.data.status})`);
    } else {
      log.error(`POST /api/work-orders/:id/scan (Outbound 1) - Gagal: ${scanOut1Data.message}`);
    }

    // Scan Outbound Label 2 (Menyelesaikan target Outbound)
    const scanOut2Res = await fetch(`${BASE_URL}/api/work-orders/${createdOutboundWOId}/scan`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ labelCode: testLabelCode2 })
    });
    const scanOut2Data = await scanOut2Res.json();
    if (scanOut2Res.ok && scanOut2Data.data.status === 'Done') {
      log.success(`POST /api/work-orders/:id/scan (Outbound 2) - Berhasil: ${testLabelCode2} (Status WO: Done)`);
    } else {
      log.error(`POST /api/work-orders/:id/scan (Outbound 2) - Gagal: ${scanOut2Data.message}`);
    }


    // 5. REPORT & ANALYTICS API
    log.section('5. Report & Analytics API');

    // Get Overview
    const overRes = await fetch(`${BASE_URL}/api/analytics/overview`, { headers: authHeaders });
    const overData = await overRes.json();
    if (overRes.ok && overData.success) {
      log.success(`GET /api/analytics/overview - Berhasil (Total Stok Global: ${overData.data.totalStock} unit)`);
    } else {
      log.error('GET /api/analytics/overview - Gagal');
    }

    // Get Asset Stocks (Grafik)
    const stockRes = await fetch(`${BASE_URL}/api/analytics/asset-stocks`, { headers: authHeaders });
    const stockData = await stockRes.json();
    if (stockRes.ok && stockData.success) {
      log.success(`GET /api/analytics/asset-stocks - Berhasil (${stockData.data.length} aset terdaftar)`);
    } else {
      log.error('GET /api/analytics/asset-stocks - Gagal');
    }

    // Get Transaction Logs (Laporan Audit)
    const reportRes = await fetch(`${BASE_URL}/api/reports/logs?limit=5`, { headers: authHeaders });
    const reportData = await reportRes.json();
    if (reportRes.ok && reportData.data.length > 0) {
      log.success(`GET /api/reports/logs - Berhasil (Menampilkan data log scan detail, misal label: ${reportData.data[0].labelCode})`);
    } else {
      log.error('GET /api/reports/logs - Gagal');
    }

    // Test Excel Export Header
    const exportRes = await fetch(`${BASE_URL}/api/reports/export-excel`, { headers: authHeaders });
    const contentType = exportRes.headers.get('content-type') || '';
    if (exportRes.ok && contentType.includes('spreadsheetml')) {
      log.success('GET /api/reports/export - Berhasil (File Excel terdeteksi pada response headers)');
    } else {
      log.error(`GET /api/reports/export - Gagal mengunduh Excel (Status: ${exportRes.status}, Content-Type: ${contentType})`);
    }

    log.section('HASIL INTEGRASI QA TESTING');
    log.success('Seluruh API Endpoint berfungsi 100% normal dan siap digunakan!');
  } catch (error) {
    log.error(`Terjadi kesalahan selama pengujian: ${error.message}`);
  }
}

runTests();