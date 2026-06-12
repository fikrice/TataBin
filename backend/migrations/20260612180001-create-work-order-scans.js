/**
 * Migrasi untuk membuat tabel 'work_order_scans'
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('work_order_scans', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    work_order_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'work_orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    label_code: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    type: {
      type: Sequelize.ENUM('inbound', 'outbound'),
      allowNull: false
    },
    scanned_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_stock: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
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

  // Unique index on label_code for inbound scans to enforce uniqueness of inbound items
  // Note: a label can be scanned inbound only once. For outbound, it can be scanned outbound only once.
  // So unique index on (label_code, type) ensures a label is not scanned inbound twice, and not outbound twice!
  await queryInterface.addIndex('work_order_scans', ['label_code', 'type'], {
    unique: true,
    name: 'unique_label_per_type'
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('work_order_scans');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_work_order_scans_type";');
};
