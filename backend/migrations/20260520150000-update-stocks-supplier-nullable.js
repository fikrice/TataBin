/**
 * Migrasi untuk mengubah supplier_id di tabel stocks menjadi nullable
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.changeColumn('stocks', 'supplier_id', {
    type: Sequelize.UUID,
    allowNull: true,
    references: {
      model: 'suppliers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.changeColumn('stocks', 'supplier_id', {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'suppliers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  });
};