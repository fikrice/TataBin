/**
 * Migrasi untuk membuat tabel 'assets'
 * Tabel ini digunakan untuk menyimpan data barang (asset) yang dikelola di gudang.
 */

export const up = async (queryInterface, Sequelize) => {
  // Membuat tabel 'assets'
  await queryInterface.createTable('assets', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    code: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    category: {
      // Pembatasan kategori barang yang valid
      type: Sequelize.ENUM('Small Asset', 'Medium Asset', 'Large Asset'),
      allowNull: false
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      defaultValue: 0,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    supplier_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'suppliers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
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

  // Menambahkan batasan agar harga barang tidak boleh bernilai negatif (>= 0)
  await queryInterface.sequelize.query('ALTER TABLE "assets" ADD CONSTRAINT "check_assets_price" CHECK (price >= 0);');
};

export const down = async (queryInterface, Sequelize) => {
  // Menghapus tabel 'assets'
  await queryInterface.dropTable('assets');
  
  // Hapus tipe ENUM PostgreSQL
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assets_category";');
};
