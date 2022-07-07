import { DBSingleton } from "../singleton/DBSingleton";
import { DataTypes, Sequelize } from 'sequelize';

//Connection to database
const sequelize: Sequelize = DBSingleton.getConnection();

export const Delivery = sequelize.define('delivery', {
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
    delivery_doses: {
        type: DataTypes.INTEGER(),
        allowNull:false
    }
},
{
    modelName: 'delivery',
    timestamps: false,
    freezeTableName: true
});