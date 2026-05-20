/**
 * Model Gudang (Warehouse)
 * Mengelola data gedung penyimpanan dan kapasitas slot maksimumnya.
 */
const WarehouseModel = (sequelize, DataTypes) => {
  const Warehouse = sequelize.define('Warehouse', {
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
        notEmpty: true // Nama tidak boleh kosong
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0 // Kapasitas tidak boleh bernilai negatif
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'warehouses',
    timestamps: true,
    underscored: true
  });

  /**
   * Menghubungkan model Warehouse dengan model lain
   * @param {object} models - Kumpulan model yang dimuat aplikasi
   */
  Warehouse.associate = function(models) {
    // Gudang memiliki banyak slot penyimpanan (Storage Bin)
    Warehouse.hasMany(models.StorageBin, {
      foreignKey: 'warehouseId',
      as: 'storageBins'
    });
  };

  return Warehouse;
};

export default WarehouseModel;
