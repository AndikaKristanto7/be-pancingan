// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
require('dotenv').config({ path: '.env' });
const Env = require('./helpers/Env')
const newEnv = new Env()

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host : process.env.HOST,
      port : process.env.PORT,
      database : process.env.DB,
      user : process.env.USER,
      password : process.env.PASS,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: newEnv.getEnv('SUPBASE_DIRECT_URL') ?? "",
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
