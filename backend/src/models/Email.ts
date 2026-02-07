import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IEmail } from '../types';
import User from './User';

interface EmailCreationAttributes extends Optional<IEmail, 'id' | 'sentAt' | 'failureReason' | 'jobId' | 'batchId'> {}

class Email extends Model<IEmail, EmailCreationAttributes> implements IEmail {
  public id!: string;
  public userId!: string;
  public recipientEmail!: string;
  public subject!: string;
  public body!: string;
  public scheduledAt!: Date;
  public sentAt?: Date;
  public status!: 'scheduled' | 'sent' | 'failed' | 'rate_limited';
  public failureReason?: string;
  public jobId?: string;
  public batchId?: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Email.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    recipientEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'sent', 'failed', 'rate_limited'),
      defaultValue: 'scheduled',
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    jobId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    batchId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'emails',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['scheduledAt'] },
      { fields: ['batchId'] },
    ],
  }
);

// Associations
User.hasMany(Email, { foreignKey: 'userId' });
Email.belongsTo(User, { foreignKey: 'userId' });

export default Email;