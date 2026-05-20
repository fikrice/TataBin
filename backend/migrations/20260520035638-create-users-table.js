/**
 * Migrasi untuk membuat tabel 'users'
 * Tabel ini digunakan untuk menyimpan data kredensial dan peran pengguna sistem (admin dan crew).
 */

export const up = async (queryInterface, Sequelize) => {
  // Fungsi ini berjalan saat menjalankan migrasi (db:migrate)
  await queryInterface.createTable('users', {
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
    username: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    full_name: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    telephone_number: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    role: {
      // Role hanya dibatasi untuk 'admin' dan 'crew' sesuai pedoman
      type: Sequelize.ENUM('admin', 'crew'),
      defaultValue: 'crew',
      allowNull: false
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
};

export const down = async (queryInterface, Sequelize) => {
  // Fungsi ini berjalan saat membatalkan migrasi (db:migrate:undo)
  await queryInterface.dropTable('users');
  
  // Hapus tipe ENUM khusus PostgreSQL agar tidak terjadi error konflik saat membuat ulang tabel
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
};
