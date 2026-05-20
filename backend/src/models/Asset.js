/**
 * Model Barang (Asset)
 * Mengelola data master barang yang disimpan ke dalam slot penyimpanan.
 */
const AssetModel = (sequelize, DataTypes) => {
  const Asset = sequelize.define('Asset', {
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    category: {
      type: DataTypes.ENUM('Small Asset', 'Medium Asset', 'Large Asset'),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0 // Harga barang tidak boleh bernilai negatif
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'supplier_id'
    }
  }, {
    tableName: 'assets',
    timestamps: true,
    underscored: true
  });

  /**
   * Menghubungkan model Asset dengan model lain
   * @param {object} models - Kumpulan model yang dimuat aplikasi
   */
  Asset.associate = function(models) {
    // Satu jenis aset dapat disimpan di beberapa slot stok
    Asset.hasMany(models.Stock, {
      foreignKey: 'assetId',
      as: 'stocks'
    });
    
    // Satu jenis aset memiliki banyak riwayat transaksi
    Asset.hasMany(models.TransactionLog, {
      foreignKey: 'assetId',
      as: 'transactionLogs'
    });

    // Satu jenis aset dipasok oleh satu supplier
    Asset.belongsTo(models.Supplier, {
      foreignKey: 'supplierId',
      as: 'supplier'
    });

    // Satu jenis aset dialokasikan ke beberapa storage bin
    Asset.hasMany(models.StorageBin, {
      foreignKey: 'assetId',
      as: 'storageBins'
    });
  };

  return Asset;
};

export default AssetModel;
