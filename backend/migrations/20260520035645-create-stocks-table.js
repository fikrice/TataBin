/**
 * Migrasi untuk membuat tabel 'stocks'
 * Tabel ini mencatat kuantitas stok barang aktual yang tersimpan di dalam slot penyimpanan tertentu.
 */

export const up = async (queryInterface, Sequelize) => {
  // Membuat tabel 'stocks'
  await queryInterface.createTable('stocks', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
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
      onDelete: 'RESTRICT' // Mencegah penghapusan barang jika masih ada stok
    },
    storage_bin_id: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true, // Memastikan aturan bisnis: 1 Storage Bin hanya boleh untuk 1 alokasi barang
      references: {
        model: 'storage_bins',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    supplier_id: {
      type: Sequelize.UUID,
      allowNull: false,
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

  // Batasan check untuk menjamin kuantitas dan harga beli tidak bernilai negatif
  await queryInterface.sequelize.query('ALTER TABLE "stocks" ADD CONSTRAINT "check_stocks_quantity" CHECK (quantity >= 0);');
  await queryInterface.sequelize.query('ALTER TABLE "stocks" ADD CONSTRAINT "check_stocks_price" CHECK (price >= 0);');
};

export const down = async (queryInterface, Sequelize) => {
  // Menghapus tabel 'stocks'
  await queryInterface.dropTable('stocks');
};
