const axios =  require('axios')
require('dotenv').config()
function getEnv(param){
  if(process.env.JEST_WORKER_ID !== undefined){
    if(param === "SECRET"){
      return "secret"
    }
    return;
  }
  if(process.env.JEST_WORKER_ID === undefined && process.env[param] == "" && process.env.NODE_ENV != "development"){
    isProd = true
    isDev = false
    axios.get("https://asia-southeast2-vps-binar.cloudfunctions.net/env-be-app",{
        params:{
            key: param
        }
    }).then((resp)=>{
        return resp ?? false 
    })
  }
  return process.env[param]
}
module.exports = { getEnv }
