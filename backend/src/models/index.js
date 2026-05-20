import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import databaseConfig from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = databaseConfig[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const modelFiles = fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && 
           (file !== basename) && 
           (file.slice(-3) === '.js');
  });

for (const file of modelFiles) {
  const modelPath = path.join(__dirname, file);
  const { default: modelInitializer } = await import(`file://${modelPath}`);
  const model = modelInitializer(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export { sequelize };
export default db;
