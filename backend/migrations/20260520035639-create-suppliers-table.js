/**
 * Migrasi untuk membuat tabel 'suppliers'
 * Tabel ini digunakan untuk menyimpan data pemasok (supplier) barang.
 */

export const up = async (queryInterface, Sequelize) => {
  // Membuat tabel 'suppliers'
  await queryInterface.createTable('suppliers', {
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
    contact: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    category: {
      type: Sequelize.ENUM('Local', 'Import'),
      allowNull: false
    },
    address: {
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
  // Menghapus tabel 'suppliers'
  await queryInterface.dropTable('suppliers');
  
  // Hapus tipe ENUM PostgreSQL
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_suppliers_category";');
};
