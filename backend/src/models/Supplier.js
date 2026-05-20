/**
 * Model Pemasok (Supplier)
 * Mengelola data pemasok barang yang menyuplai aset ke dalam gudang.
 */
const SupplierModel = (sequelize, DataTypes) => {
  const Supplier = sequelize.define('Supplier', {
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
    contact: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('Local', 'Import'),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'suppliers',
    timestamps: true,
    underscored: true
  });

  /**
   * Menghubungkan model Supplier dengan model lain
   * @param {object} models - Kumpulan model yang dimuat aplikasi
   */
  Supplier.associate = function(models) {
    // Satu supplier dapat memasok banyak item stok
    Supplier.hasMany(models.Stock, {
      foreignKey: 'supplierId',
      as: 'stocks'
    });
    
    // Satu supplier memiliki banyak log transaksi terkait pasokan barang
    Supplier.hasMany(models.TransactionLog, {
      foreignKey: 'supplierId',
      as: 'transactionLogs'
    });
    
    // Satu supplier memasok banyak jenis aset
    Supplier.hasMany(models.Asset, {
      foreignKey: 'supplierId',
      as: 'assets'
    });
  };

  return Supplier;
};

export default SupplierModel;
