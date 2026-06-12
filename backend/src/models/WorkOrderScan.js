/**
 * Model Work Order Scan
 */
const WorkOrderScanModel = (sequelize, DataTypes) => {
  const WorkOrderScan = sequelize.define('WorkOrderScan', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    workOrderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'work_order_id'
    },
    labelCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'label_code'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    type: {
      type: DataTypes.ENUM('inbound', 'outbound'),
      allowNull: false
    },
    scannedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'scanned_at'
    },
    updatedStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'updated_stock'
    }
  }, {
    tableName: 'work_order_scans',
    timestamps: true,
    underscored: true
  });

  WorkOrderScan.associate = function(models) {
    WorkOrderScan.belongsTo(models.WorkOrder, {
      foreignKey: 'workOrderId',
      as: 'workOrder'
    });
    WorkOrderScan.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return WorkOrderScan;
};

export default WorkOrderScanModel;
