/**
 * Model Log Transaksi (TransactionLog)
 * Mengelola data pencatatan riwayat barang masuk (inbound) dan keluar (outbound).
 */
const TransactionLogModel = (sequelize, DataTypes) => {
  const TransactionLog = sequelize.define('TransactionLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('inbound', 'outbound'),
      allowNull: false
    },
    assetId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'asset_id'
    },
    storageBinId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'storage_bin_id'
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: true, // Bernilai null untuk transaksi outbound
      field: 'supplier_id'
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0 // Jumlah barang tidak boleh negatif
      }
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0 // Harga perolehan tidak boleh negatif
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // Petugas yang melakukan transaksi
      field: 'user_id'
    },
    referenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'reference_number'
    }
  }, {
    tableName: 'transaction_logs',
    timestamps: true,
    underscored: true
  });

  /**
   * Menghubungkan model TransactionLog dengan model lain
   * @param {object} models - Kumpulan model yang dimuat aplikasi
   */
  TransactionLog.associate = function(models) {
    // Log transaksi merujuk ke satu aset barang tertentu
    TransactionLog.belongsTo(models.Asset, {
      foreignKey: 'assetId',
      as: 'asset'
    });
    
    // Log transaksi terjadi di slot penyimpanan tertentu
    TransactionLog.belongsTo(models.StorageBin, {
      foreignKey: 'storageBinId',
      as: 'storageBin'
    });
    
    // Log transaksi dipasok oleh supplier tertentu (jika jenisnya inbound)
    TransactionLog.belongsTo(models.Supplier, {
      foreignKey: 'supplierId',
      as: 'supplier'
    });
    
    // Log transaksi dicatat oleh petugas (user) tertentu
    TransactionLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return TransactionLog;
};

export default TransactionLogModel;
