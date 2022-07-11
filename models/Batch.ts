// Import libraries
import {DBSingleton} from "../singleton/DBSingleton";
import {DataTypes, Sequelize} from 'sequelize';


//Connection to database
const sequelize: Sequelize = DBSingleton.getConnection();

/**
 * Model 'Batch'
 * 
 * Define the model 'Batch' to interface with the "batch" table in the PostgreSQL database
 */
export const Batch = sequelize.define('batch', {
    batch: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    vaccine: {
        type: DataTypes.INTEGER(),
        primaryKey: true
    },
    available_doses: {
        type: DataTypes.INTEGER(),
        allowNull:false
    },
    expiration_date: {
        type: DataTypes.DATE(),
        allowNull:false
    }
},
{
    modelName: 'batch',
    timestamps: false,
    freezeTableName: true
});