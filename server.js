//server.js
const app = require("./app");
const Env = require('./helpers/getEnv')
const {getEnv} = Env

const port = getEnv("APP_PORT") ?? "8080"
app.listen(port,() => {
    console.log(`Listening @ port ${port}`)
})