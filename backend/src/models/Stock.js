/**
 * Model Stok (Stock)
 * Mengelola data kuantitas dan harga perolehan barang di dalam slot penyimpanan tertentu.
 */
const StockModel = (sequelize, DataTypes) => {
  const Stock = sequelize.define('Stock', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    assetId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'asset_id'
    },
    storageBinId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // Tiap slot bin hanya dikaitkan dengan satu baris record stok aktif
      field: 'storage_bin_id'
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'supplier_id'
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0 // Kuantitas tidak boleh negatif
      }
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0 // Harga beli barang tidak boleh negatif
      }
    }
  }, {
    tableName: 'stocks',
    timestamps: true,
    underscored: true
  });

  /**
   * Menghubungkan model Stock dengan model lain
   * @param {object} models - Kumpulan model yang dimuat aplikasi
   */
  Stock.associate = function(models) {
    // Stok merujuk ke satu aset tertentu
    Stock.belongsTo(models.Asset, {
      foreignKey: 'assetId',
      as: 'asset'
    });
    
    // Stok tersimpan di dalam satu slot bin tertentu
    Stock.belongsTo(models.StorageBin, {
      foreignKey: 'storageBinId',
      as: 'storageBin'
    });
    
    // Stok dipasok oleh supplier tertentu
    Stock.belongsTo(models.Supplier, {
      foreignKey: 'supplierId',
      as: 'supplier'
    });
  };

  return Stock;
};

export default StockModel;
