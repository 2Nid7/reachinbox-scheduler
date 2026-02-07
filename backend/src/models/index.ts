import sequelize from '../config/database';
import User from './User';
import Email from './Email';

export const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    await sequelize.sync();
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export { User, Email };