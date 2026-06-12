/**
 * Migrasi untuk membuat tabel 'work_orders'
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('work_orders', {
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
    type: {
      type: Sequelize.ENUM('inbound', 'outbound'),
      allowNull: false
    },
    warehouse_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'warehouses',
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
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: Sequelize.ENUM('To-Do', 'On Progress', 'Done'),
      allowNull: false,
      defaultValue: 'To-Do'
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

  await queryInterface.sequelize.query('ALTER TABLE "work_orders" ADD CONSTRAINT "check_wo_quantity" CHECK (quantity > 0);');
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('work_orders');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_work_orders_type";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_work_orders_status";');
};
