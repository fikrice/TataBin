'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Seeder Data Lengkap TataBin WMS
 * Mengisi database dengan data demo yang realistis untuk presentasi dan pengujian mentor.
 *
 * Data yang diisi:
 * - 2 User (Admin + Crew)
 * - 5 Supplier (3 Local + 2 Import)
 * - 3 Warehouse
 * - 9 Asset (3 per kategori ukuran)
 * - 9 Storage Bin (3 per warehouse, masing-masing 1 per kategori)
 * - 9 Stock (1 per storage bin, dari inbound)
 * - 9 Transaction Log (inbound records)
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // =============================================
    // 1. USERS (Admin + Crew)
    // =============================================
    const adminPassword = await bcrypt.hash('admin123', 10);
    const crewPassword = await bcrypt.hash('Qwerty123*', 10);

    const adminId = uuidv4();
    const crewId = uuidv4();

    const users = [
      {
        id: adminId,
        code: 'USER_01',
        username: 'admin',
        email: 'admin@tatabin.com',
        password: adminPassword,
        full_name: 'System Admin',
        telephone_number: '081234567890',
        role: 'admin',
        created_at: now,
        updated_at: now,
      },
      {
        id: crewId,
        code: 'USER_02',
        username: 'crew',
        email: 'crew@tatabin.com',
        password: crewPassword,
        full_name: 'Ahmad Fauzi',
        telephone_number: '089876543210',
        role: 'crew',
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('users', users);

    // =============================================
    // 2. SUPPLIERS (5 supplier: 3 Local + 2 Import)
    // =============================================
    const sup1 = uuidv4();
    const sup2 = uuidv4();
    const sup3 = uuidv4();
    const sup4 = uuidv4();
    const sup5 = uuidv4();

    const suppliers = [
      { id: sup1, code: 'SUP_01', name: 'PT. Sumber Makmur Jaya', contact: '021-55512345', category: 'Local', address: 'Jl. Industri No. 12, Tangerang, Banten', created_at: now, updated_at: now },
      { id: sup2, code: 'SUP_02', name: 'CV. Nusantara Parts', contact: '0274-678901', category: 'Local', address: 'Jl. Magelang Km 7, Sleman, Yogyakarta', created_at: now, updated_at: now },
      { id: sup3, code: 'SUP_03', name: 'UD. Berkah Logistik', contact: '031-8901234', category: 'Local', address: 'Rungkut Industri Raya No. 45, Surabaya', created_at: now, updated_at: now },
      { id: sup4, code: 'SUP_04', name: 'Shenzhen Global Trading Co.', contact: '+86-755-12345678', category: 'Import', address: 'Block A, Futian Free Trade Zone, Shenzhen, China', created_at: now, updated_at: now },
      { id: sup5, code: 'SUP_05', name: 'Tokyo Supply Chain Ltd.', contact: '+81-3-98765432', category: 'Import', address: '2-1-1 Marunouchi, Chiyoda-ku, Tokyo, Japan', created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('suppliers', suppliers);

    // =============================================
    // 3. WAREHOUSES (3 gudang)
    // =============================================
    const wh1 = uuidv4();
    const wh2 = uuidv4();
    const wh3 = uuidv4();

    const warehouses = [
      { id: wh1, code: 'WH_01', name: 'Gudang Utama Jogja', location: 'Sleman, Yogyakarta', capacity: 500, description: 'Gudang utama untuk penyimpanan barang siap distribusi area Jawa Tengah & DIY.', created_at: now, updated_at: now },
      { id: wh2, code: 'WH_02', name: 'Gudang Transit Jakarta', location: 'Cikarang, Bekasi', capacity: 300, description: 'Gudang transit untuk pengiriman ke area Jabodetabek dan Jawa Barat.', created_at: now, updated_at: now },
      { id: wh3, code: 'WH_03', name: 'Gudang Surabaya', location: 'Rungkut, Surabaya', capacity: 200, description: 'Gudang distribusi area Jawa Timur dan Indonesia Timur.', created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('warehouses', warehouses);

    // =============================================
    // 4. ASSETS (9 aset: 3 Small, 3 Medium, 3 Large)
    // =============================================
    const ast1 = uuidv4(); // Small
    const ast2 = uuidv4(); // Small
    const ast3 = uuidv4(); // Small
    const ast4 = uuidv4(); // Medium
    const ast5 = uuidv4(); // Medium
    const ast6 = uuidv4(); // Medium
    const ast7 = uuidv4(); // Large
    const ast8 = uuidv4(); // Large
    const ast9 = uuidv4(); // Large

    const assets = [
      // Small Assets
      { id: ast1, code: 'AST_01', name: 'Nike Air Max 270 - Black', category: 'Small Asset', price: 1899000, description: 'Sepatu lari pria premium dengan teknologi Air Max unit.', supplier_id: sup1, created_at: now, updated_at: now },
      { id: ast2, code: 'AST_02', name: 'Adidas Ultraboost 22 - White', category: 'Small Asset', price: 2499000, description: 'Sepatu lari performa tinggi dengan bantalan Boost responsif.', supplier_id: sup4, created_at: now, updated_at: now },
      { id: ast3, code: 'AST_03', name: 'Puma RS-X Reinvention - Blue', category: 'Small Asset', price: 1599000, description: 'Sneakers retro-futuristik dengan desain chunky modern.', supplier_id: sup2, created_at: now, updated_at: now },

      // Medium Assets
      { id: ast4, code: 'AST_04', name: 'Samsung 55" QLED Smart TV', category: 'Medium Asset', price: 12500000, description: 'TV pintar 55 inci dengan panel QLED, resolusi 4K UHD.', supplier_id: sup4, created_at: now, updated_at: now },
      { id: ast5, code: 'AST_05', name: 'LG Inverter AC 1.5 PK', category: 'Medium Asset', price: 7800000, description: 'Air conditioner hemat energi dengan teknologi inverter dual cool.', supplier_id: sup5, created_at: now, updated_at: now },
      { id: ast6, code: 'AST_06', name: 'Electrolux Front Load Washer 8kg', category: 'Medium Asset', price: 6250000, description: 'Mesin cuci front loading dengan kapasitas 8kg dan fitur steam wash.', supplier_id: sup3, created_at: now, updated_at: now },

      // Large Assets
      { id: ast7, code: 'AST_07', name: 'Toyota Forklift 2.5 Ton', category: 'Large Asset', price: 285000000, description: 'Forklift diesel kapasitas 2.5 ton untuk operasional gudang berat.', supplier_id: sup5, created_at: now, updated_at: now },
      { id: ast8, code: 'AST_08', name: 'Pallet Racking System 4-Tier', category: 'Large Asset', price: 45000000, description: 'Sistem rak pallet baja galvanis 4 tingkat, kapasitas 1 ton per level.', supplier_id: sup1, created_at: now, updated_at: now },
      { id: ast9, code: 'AST_09', name: 'Industrial Conveyor Belt 10m', category: 'Large Asset', price: 78000000, description: 'Belt conveyor industri sepanjang 10 meter untuk lini distribusi gudang.', supplier_id: sup3, created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('assets', assets);

    // =============================================
    // 5. STORAGE BINS (9 slot: 3 per warehouse)
    // =============================================
    const bin1 = uuidv4(); // WH1 - Small
    const bin2 = uuidv4(); // WH1 - Medium
    const bin3 = uuidv4(); // WH1 - Large
    const bin4 = uuidv4(); // WH2 - Small
    const bin5 = uuidv4(); // WH2 - Medium
    const bin6 = uuidv4(); // WH2 - Large
    const bin7 = uuidv4(); // WH3 - Small
    const bin8 = uuidv4(); // WH3 - Medium
    const bin9 = uuidv4(); // WH3 - Large

    const storageBins = [
      // Gudang Jogja
      { id: bin1, warehouse_id: wh1, asset_id: ast1, code: 'WH_01_001', category: 'Small Asset', status: 'filled', remarks: 'Rak sepatu lantai 1, area A', created_at: now, updated_at: now },
      { id: bin2, warehouse_id: wh1, asset_id: ast4, code: 'WH_01_002', category: 'Medium Asset', status: 'filled', remarks: 'Area elektronik, rak tengah', created_at: now, updated_at: now },
      { id: bin3, warehouse_id: wh1, asset_id: ast7, code: 'WH_01_003', category: 'Large Asset', status: 'filled', remarks: 'Area heavy equipment, zona belakang', created_at: now, updated_at: now },

      // Gudang Jakarta
      { id: bin4, warehouse_id: wh2, asset_id: ast2, code: 'WH_02_001', category: 'Small Asset', status: 'filled', remarks: 'Rak sepatu lantai 2', created_at: now, updated_at: now },
      { id: bin5, warehouse_id: wh2, asset_id: ast5, code: 'WH_02_002', category: 'Medium Asset', status: 'filled', remarks: 'Area home appliance', created_at: now, updated_at: now },
      { id: bin6, warehouse_id: wh2, asset_id: ast8, code: 'WH_02_003', category: 'Large Asset', status: 'filled', remarks: 'Area industrial equipment', created_at: now, updated_at: now },

      // Gudang Surabaya
      { id: bin7, warehouse_id: wh3, asset_id: ast3, code: 'WH_03_001', category: 'Small Asset', status: 'filled', remarks: 'Rak sepatu zona B', created_at: now, updated_at: now },
      { id: bin8, warehouse_id: wh3, asset_id: ast6, code: 'WH_03_002', category: 'Medium Asset', status: 'filled', remarks: 'Area elektronik rumah tangga', created_at: now, updated_at: now },
      { id: bin9, warehouse_id: wh3, asset_id: ast9, code: 'WH_03_003', category: 'Large Asset', status: 'filled', remarks: 'Area conveyor & mesin besar', created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('storage_bins', storageBins);

    // =============================================
    // 6. STOCKS (9 record stok, 1 per storage bin)
    // =============================================
    const stocks = [
      { id: uuidv4(), asset_id: ast1, storage_bin_id: bin1, supplier_id: sup1, quantity: 50,  price: 1899000,  created_at: now, updated_at: now },
      { id: uuidv4(), asset_id: ast4, storage_bin_id: bin2, supplier_id: sup4, quantity: 12,  price: 12500000, created_at: now, updated_at: now },
      { id: uuidv4(), asset_id: ast7, storage_bin_id: bin3, supplier_id: sup5, quantity: 2,   price: 285000000, created_at: now, updated_at: now },

      { id: uuidv4(), asset_id: ast2, storage_bin_id: bin4, supplier_id: sup4, quantity: 35,  price: 2499000,  created_at: now, updated_at: now },
      { id: uuidv4(), asset_id: ast5, storage_bin_id: bin5, supplier_id: sup5, quantity: 8,   price: 7800000,  created_at: now, updated_at: now },
      { id: uuidv4(), asset_id: ast8, storage_bin_id: bin6, supplier_id: sup1, quantity: 5,   price: 45000000, created_at: now, updated_at: now },

      { id: uuidv4(), asset_id: ast3, storage_bin_id: bin7, supplier_id: sup2, quantity: 40,  price: 1599000,  created_at: now, updated_at: now },
      { id: uuidv4(), asset_id: ast6, storage_bin_id: bin8, supplier_id: sup3, quantity: 15,  price: 6250000,  created_at: now, updated_at: now },
      { id: uuidv4(), asset_id: ast9, storage_bin_id: bin9, supplier_id: sup3, quantity: 3,   price: 78000000, created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('stocks', stocks);

    // =============================================
    // 7. TRANSACTION LOGS (9 inbound records)
    // =============================================
    const transactionLogs = [
      { id: uuidv4(), type: 'inbound', asset_id: ast1, storage_bin_id: bin1, supplier_id: sup1, quantity: 50,  price: 1899000,  user_id: adminId, reference_number: 'INB-20260515-001', created_at: new Date('2026-05-15T08:30:00'), updated_at: now },
      { id: uuidv4(), type: 'inbound', asset_id: ast4, storage_bin_id: bin2, supplier_id: sup4, quantity: 12,  price: 12500000, user_id: adminId, reference_number: 'INB-20260515-002', created_at: new Date('2026-05-15T09:15:00'), updated_at: now },
      { id: uuidv4(), type: 'inbound', asset_id: ast7, storage_bin_id: bin3, supplier_id: sup5, quantity: 2,   price: 285000000, user_id: adminId, reference_number: 'INB-20260515-003', created_at: new Date('2026-05-15T10:00:00'), updated_at: now },

      { id: uuidv4(), type: 'inbound', asset_id: ast2, storage_bin_id: bin4, supplier_id: sup4, quantity: 35,  price: 2499000,  user_id: crewId, reference_number: 'INB-20260516-001', created_at: new Date('2026-05-16T08:00:00'), updated_at: now },
      { id: uuidv4(), type: 'inbound', asset_id: ast5, storage_bin_id: bin5, supplier_id: sup5, quantity: 8,   price: 7800000,  user_id: crewId, reference_number: 'INB-20260516-002', created_at: new Date('2026-05-16T09:30:00'), updated_at: now },
      { id: uuidv4(), type: 'inbound', asset_id: ast8, storage_bin_id: bin6, supplier_id: sup1, quantity: 5,   price: 45000000, user_id: crewId, reference_number: 'INB-20260516-003', created_at: new Date('2026-05-16T11:00:00'), updated_at: now },

      { id: uuidv4(), type: 'inbound', asset_id: ast3, storage_bin_id: bin7, supplier_id: sup2, quantity: 40,  price: 1599000,  user_id: adminId, reference_number: 'INB-20260517-001', created_at: new Date('2026-05-17T07:45:00'), updated_at: now },
      { id: uuidv4(), type: 'inbound', asset_id: ast6, storage_bin_id: bin8, supplier_id: sup3, quantity: 15,  price: 6250000,  user_id: adminId, reference_number: 'INB-20260517-002', created_at: new Date('2026-05-17T10:20:00'), updated_at: now },
      { id: uuidv4(), type: 'inbound', asset_id: ast9, storage_bin_id: bin9, supplier_id: sup3, quantity: 3,   price: 78000000, user_id: adminId, reference_number: 'INB-20260517-003', created_at: new Date('2026-05-17T14:00:00'), updated_at: now },
    ];

    await queryInterface.bulkInsert('transaction_logs', transactionLogs);
  },

  async down(queryInterface, Sequelize) {
    // Hapus dalam urutan terbalik (foreign key dependencies)
    await queryInterface.bulkDelete('transaction_logs', null, {});
    await queryInterface.bulkDelete('stocks', null, {});
    await queryInterface.bulkDelete('storage_bins', null, {});
    await queryInterface.bulkDelete('assets', null, {});
    await queryInterface.bulkDelete('warehouses', null, {});
    await queryInterface.bulkDelete('suppliers', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
