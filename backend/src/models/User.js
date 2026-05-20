import bcrypt from 'bcryptjs';

/**
 * Model Pengguna (User)
 * Mengelola data autentikasi, enkripsi password, dan otorisasi role 'admin' atau 'crew'
 */
const UserModel = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50] // Panjang username minimal 3 dan maksimal 50 karakter
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true // Validasi format email yang benar
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING(100),
      field: 'full_name'
    },
    telephoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'telephone_number'
    },
    role: {
      type: DataTypes.ENUM('admin', 'crew'),
      defaultValue: 'crew'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      // Hook untuk mengenkripsi password sebelum pengguna baru disimpan
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Hook untuk mengenkripsi password saat data pengguna diperbarui (jika kolom password berubah)
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  /**
   * Membandingkan password yang diinput dengan password terenkripsi di database
   * @param {string} password - Password mentah yang diinput pengguna
   * @returns {Promise<boolean>} Hasil perbandingan cocok atau tidak
   */
  User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  /**
   * Memodifikasi representasi JSON dari model untuk menyembunyikan kolom password
   * @returns {object} Objek data pengguna tanpa field password
   */
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  /**
   * Menghubungkan model User dengan model lain
   * @param {object} models - Kumpulan model yang dimuat aplikasi
   */
  User.associate = function(models) {
    // User dapat melakukan banyak pencatatan log transaksi
    User.hasMany(models.TransactionLog, {
      foreignKey: 'userId',
      as: 'transactionLogs'
    });
  };

  return User;
};

export default UserModel;
