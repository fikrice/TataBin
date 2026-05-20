/**
 * Migrasi untuk membuat tabel 'transaction_logs'
 * Tabel ini digunakan untuk mencatat riwayat masuk (inbound) dan keluar (outbound) aset secara detail.
 */

export const up = async (queryInterface, Sequelize) => {
  // Membuat tabel 'transaction_logs'
  await queryInterface.createTable('transaction_logs', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    type: {
      type: Sequelize.ENUM('inbound', 'outbound'),
      allowNull: false
    },
    asset_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'assets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    storage_bin_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'storage_bins',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    supplier_id: {
      type: Sequelize.UUID,
      allowNull: true, // Supplier opsional (bernilai null untuk outbound)
      references: {
        model: 'suppliers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    quantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      defaultValue: 0,
      allowNull: false
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: true, // User yang mengeksekusi transaksi (null jika user dihapus)
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    reference_number: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  // Batasan check untuk menjamin kuantitas dan harga tidak bernilai negatif
  await queryInterface.sequelize.query('ALTER TABLE "transaction_logs" ADD CONSTRAINT "check_logs_quantity" CHECK (quantity >= 0);');
  await queryInterface.sequelize.query('ALTER TABLE "transaction_logs" ADD CONSTRAINT "check_logs_price" CHECK (price >= 0);');
};

export const down = async (queryInterface, Sequelize) => {
  // Menghapus tabel 'transaction_logs'
  await queryInterface.dropTable('transaction_logs');
  
  // Hapus tipe ENUM PostgreSQL
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_transaction_logs_type";');
};
