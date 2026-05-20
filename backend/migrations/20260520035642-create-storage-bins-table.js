/**
 * Migrasi untuk membuat tabel 'storage_bins'
 * Tabel ini digunakan untuk menyimpan slot area penyimpanan barang berdasarkan kategori ukuran.
 */

export const up = async (queryInterface, Sequelize) => {
  // Membuat tabel 'storage_bins'
  await queryInterface.createTable('storage_bins', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    warehouse_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'warehouses', // Menghubungkan ke tabel 'warehouses'
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // Jika gudang dihapus, hapus juga semua slotnya
    },
    asset_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'assets', // Menghubungkan ke tabel 'assets'
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    code: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    category: {
      // Pembatasan kategori ukuran aset sesuai aturan bisnis
      type: Sequelize.ENUM('Small Asset', 'Medium Asset', 'Large Asset'),
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('empty', 'filled'),
      defaultValue: 'empty',
      allowNull: false
    },
    remarks: {
      type: Sequelize.TEXT,
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
};

export const down = async (queryInterface, Sequelize) => {
  // Menghapus tabel 'storage_bins'
  await queryInterface.dropTable('storage_bins');
  
  // Hapus tipe ENUM PostgreSQL
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_storage_bins_category";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_storage_bins_status";');
};
