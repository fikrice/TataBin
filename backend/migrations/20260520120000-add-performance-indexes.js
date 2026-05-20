/**
 * Migrasi untuk menambahkan index pada kolom yang sering di-query
 * Untuk meningkatkan performa database pada operasi FIFO, pencarian, dan filtering.
 */

export const up = async (queryInterface, Sequelize) => {
  // Index untuk tabel stocks
  await queryInterface.addIndex('stocks', ['asset_id'], {
    name: 'idx_stocks_asset_id',
    concurrently: true
  });
  await queryInterface.addIndex('stocks', ['storage_bin_id'], {
    name: 'idx_stocks_storage_bin_id',
    concurrently: true
  });
  await queryInterface.addIndex('stocks', ['created_at'], {
    name: 'idx_stocks_created_at',
    concurrently: true
  });

  // Index untuk tabel transaction_logs
  await queryInterface.addIndex('transaction_logs', ['reference_number'], {
    name: 'idx_transaction_logs_reference_number',
    concurrently: true
  });
  await queryInterface.addIndex('transaction_logs', ['created_at'], {
    name: 'idx_transaction_logs_created_at',
    concurrently: true
  });
  await queryInterface.addIndex('transaction_logs', ['type'], {
    name: 'idx_transaction_logs_type',
    concurrently: true
  });
  await queryInterface.addIndex('transaction_logs', ['asset_id'], {
    name: 'idx_transaction_logs_asset_id',
    concurrently: true
  });
};

export const down = async (queryInterface, Sequelize) => {
  // Hapus index stocks
  await queryInterface.removeIndex('stocks', 'idx_stocks_asset_id');
  await queryInterface.removeIndex('stocks', 'idx_stocks_storage_bin_id');
  await queryInterface.removeIndex('stocks', 'idx_stocks_created_at');

  // Hapus index transaction_logs
  await queryInterface.removeIndex('transaction_logs', 'idx_transaction_logs_reference_number');
  await queryInterface.removeIndex('transaction_logs', 'idx_transaction_logs_created_at');
  await queryInterface.removeIndex('transaction_logs', 'idx_transaction_logs_type');
  await queryInterface.removeIndex('transaction_logs', 'idx_transaction_logs_asset_id');
};