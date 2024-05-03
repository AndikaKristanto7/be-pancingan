const axios =  require('axios')
require('dotenv').config()

module.exports = function(){
    this.getEnv = function(param){
      if(process.env[param] == "" && process.env.NODE_ENV != "development"){
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
}
