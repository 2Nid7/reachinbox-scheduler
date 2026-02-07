import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IUser } from '../types';

interface UserCreationAttributes extends Optional<IUser, 'id' | 'avatar'> {}

class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: string;
  public email!: string;
  public name!: string;
  public avatar?: string;
  public googleId!: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;