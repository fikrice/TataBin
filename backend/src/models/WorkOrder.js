/**
 * Model Work Order
 */
const WorkOrderModel = (sequelize, DataTypes) => {
  const WorkOrder = sequelize.define('WorkOrder', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM('inbound', 'outbound'),
      allowNull: false
    },
    warehouseId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'warehouse_id'
    },
    storageBinId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'storage_bin_id'
    },
    assetId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'asset_id'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    status: {
      type: DataTypes.ENUM('To-Do', 'On Progress', 'Done'),
      defaultValue: 'To-Do'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'work_orders',
    timestamps: true,
    underscored: true
  });

  WorkOrder.associate = function(models) {
    WorkOrder.belongsTo(models.Warehouse, {
      foreignKey: 'warehouseId',
      as: 'warehouse'
    });
    WorkOrder.belongsTo(models.StorageBin, {
      foreignKey: 'storageBinId',
      as: 'storageBin'
    });
    WorkOrder.belongsTo(models.Asset, {
      foreignKey: 'assetId',
      as: 'asset'
    });
    WorkOrder.hasMany(models.WorkOrderScan, {
      foreignKey: 'workOrderId',
      as: 'scans'
    });
  };

  return WorkOrder;
};

export default WorkOrderModel;
