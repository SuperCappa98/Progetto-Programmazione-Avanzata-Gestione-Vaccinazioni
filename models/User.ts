import { DBSingleton } from "../singleton/DBSingleton";
import { DataTypes, Sequelize } from 'sequelize';

//Connection to database
const sequelize: Sequelize = DBSingleton.getConnection();

export const User = sequelize.define('users', {
    user_key: {
        type: DataTypes.STRING(16),
        primaryKey: true
    }
},
{
    modelName: 'users',
    timestamps: false,
    freezeTableName: true
});