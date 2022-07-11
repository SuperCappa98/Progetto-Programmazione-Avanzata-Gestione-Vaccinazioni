// Import libraries
require('dotenv').config();
import {Sequelize} from 'sequelize';


/**
 * Class 'DBSingleton'
 * 
 * Class that ensures that there is a single instance of an object during the service lifecycle.
 * In this project, the object is used to build the database connection through the library {@link Sequelize},
 * thus ensuring a single connection to the PostgreSQL database 
 */
export class DBSingleton {

    private static instance: DBSingleton;

    private connection: Sequelize;

    private constructor() {
		this.connection = new Sequelize(process.env.PGDATABASE!, process.env.PGUSER!, process.env.PGPASSWORD, {
			host: process.env.PGHOST,
			port: Number(process.env.PGPORT),
			dialect: 'postgres'
		});
	}

    public static getConnection(): Sequelize {
        if (!DBSingleton.instance) {
            DBSingleton.instance = new DBSingleton();
        }

        return DBSingleton.instance.connection;
    }

} 