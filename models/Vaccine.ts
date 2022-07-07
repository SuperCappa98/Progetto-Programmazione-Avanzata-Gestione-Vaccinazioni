import { DBSingleton } from "../singleton/DBSingleton";
import { DataTypes, Sequelize } from 'sequelize';

//Connection to database
const sequelize: Sequelize = DBSingleton.getConnection();

export const Vaccine = sequelize.define('vaccine', {
    vaccine_id: {
        type: DataTypes.INTEGER(),
        primaryKey: true,
        autoIncrement:true
    },
    vaccine_name: {
        type: DataTypes.STRING(30),
        unique: true,
        allowNull: false
    },
    coverage: {
        type: DataTypes.INTEGER(),
        allowNull:false
    }
},
{
    modelName: 'vaccine',
    timestamps: false,
    freezeTableName: true
});

