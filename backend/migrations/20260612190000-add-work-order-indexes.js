/**
 * Migrasi untuk menambahkan index pada tabel work_orders dan work_order_scans
 * Guna mengoptimalkan kecepatan query filter, pencarian, dan report.
 */

export const up = async (queryInterface, Sequelize) => {
  // Index untuk tabel work_orders
  await queryInterface.addIndex('work_orders', ['type'], {
    name: 'idx_work_orders_type'
  });
  await queryInterface.addIndex('work_orders', ['status'], {
    name: 'idx_work_orders_status'
  });
  await queryInterface.addIndex('work_orders', ['warehouse_id'], {
    name: 'idx_work_orders_warehouse_id'
  });
  await queryInterface.addIndex('work_orders', ['storage_bin_id'], {
    name: 'idx_work_orders_storage_bin_id'
  });

  // Index untuk tabel work_order_scans
  await queryInterface.addIndex('work_order_scans', ['work_order_id'], {
    name: 'idx_work_order_scans_work_order_id'
  });
  await queryInterface.addIndex('work_order_scans', ['scanned_at'], {
    name: 'idx_work_order_scans_scanned_at'
  });
};

export const down = async (queryInterface, Sequelize) => {
  // Hapus index work_orders
  await queryInterface.removeIndex('work_orders', 'idx_work_orders_type');
  await queryInterface.removeIndex('work_orders', 'idx_work_orders_status');
  await queryInterface.removeIndex('work_orders', 'idx_work_orders_warehouse_id');
  await queryInterface.removeIndex('work_orders', 'idx_work_orders_storage_bin_id');

  // Hapus index work_order_scans
  await queryInterface.removeIndex('work_order_scans', 'idx_work_order_scans_work_order_id');
  await queryInterface.removeIndex('work_order_scans', 'idx_work_order_scans_scanned_at');
};
