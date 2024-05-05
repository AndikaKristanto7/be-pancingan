const config = require('../knexfile');
let knex;
require('dotenv').config()
const Env = require('../helpers/getEnv')
const {getEnv} = Env
const envString = getEnv('NODE_ENV') ?? 'production'
knex = require('knex')(config[envString]);
module.exports = knex;