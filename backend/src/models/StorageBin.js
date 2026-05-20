/**
 * Model Slot Penyimpanan (Storage Bin)
 * Mengelola slot spesifik tempat penyimpanan barang berdasarkan kesesuaian kategori ukuran.
 */
const StorageBinModel = (sequelize, DataTypes) => {
  const StorageBin = sequelize.define('StorageBin', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    warehouseId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'warehouse_id'
    },
    assetId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'asset_id'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    category: {
      type: DataTypes.ENUM('Small Asset', 'Medium Asset', 'Large Asset'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('empty', 'filled'),
      defaultValue: 'empty'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'storage_bins',
    timestamps: true,
    underscored: true
  });

  /**
   * Menghubungkan model StorageBin dengan model lain
   * @param {object} models - Kumpulan model yang dimuat aplikasi
   */
  StorageBin.associate = function(models) {
    // Setiap slot berada pada satu Gudang tertentu
    StorageBin.belongsTo(models.Warehouse, {
      foreignKey: 'warehouseId',
      as: 'warehouse'
    });

    // Setiap slot dialokasikan untuk satu tipe aset tertentu
    StorageBin.belongsTo(models.Asset, {
      foreignKey: 'assetId',
      as: 'allocatedAsset'
    });
    
    // Setiap slot hanya dialokasikan untuk satu stok barang (1 to 1) sesuai aturan bisnis
    StorageBin.hasOne(models.Stock, {
      foreignKey: 'storageBinId',
      as: 'stock'
    });
    
    // Setiap slot memiliki riwayat log transaksi masuk/keluar barang
    StorageBin.hasMany(models.TransactionLog, {
      foreignKey: 'storageBinId',
      as: 'transactionLogs'
    });
  };

  return StorageBin;
};

export default StorageBinModel;
