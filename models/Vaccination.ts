import { DBSingleton } from "../singleton/DBSingleton";
import { DataTypes, Sequelize } from 'sequelize';

//Connection to database
const sequelize: Sequelize = DBSingleton.getConnection();

export const Vaccination = sequelize.define('vaccination', {
    batch: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    delivery_date: {
        type: DataTypes.DATE(),
        primaryKey: true
    },
    vaccine: {
        type: DataTypes.INTEGER(),
        primaryKey: true
    },
    user_key: {
        type: DataTypes.STRING(16),
        primaryKey: true
    },
    timestamp_vc: {
        type: DataTypes.DATE(),
        allowNull:false,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP(2)')
    }
},
{
    modelName: 'vaccination',
    timestamps: false,
    freezeTableName: true
});