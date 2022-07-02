require('dotenv').config();
import {Sequelize} from 'sequelize';

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