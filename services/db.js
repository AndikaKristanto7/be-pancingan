const config = require('../knexfile');
require('dotenv').config()
const Env = require('../helpers/Env')
const newEnv = new Env()
const envString = newEnv.getEnv('NODE_ENV') ??  'production'

const knex = require('knex')(config[envString]);

module.exports = knex;