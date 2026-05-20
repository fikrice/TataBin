/**
 * Migrasi untuk membuat tabel 'warehouses'
 * Tabel ini digunakan untuk menyimpan data gedung gudang atau area penyimpanan.
 */

export const up = async (queryInterface, Sequelize) => {
  // Membuat tabel 'warehouses'
  await queryInterface.createTable('warehouses', {
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
    location: {
      type: Sequelize.STRING,
      allowNull: true
    },
    capacity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    description: {
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
  // Menghapus tabel 'warehouses'
  await queryInterface.dropTable('warehouses');
};
