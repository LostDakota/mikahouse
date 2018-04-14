const NEST = require('../.config').Nest

let nest = require('unofficial-nest-api')

let toFarenheit = temp => {
    return Math.floor(temp * 1.8 + 32);
}

module.exports = {
    Thermostat: () => {
        return new Promise((resolve, reject) => {
            nest.login(NEST.USERNAME, NEST.PASS, (err, data) => {
                if(err) reject(err)
                nest.fetchStatus((data) => {
                    var n = data.shared[NEST.DEVICEID]
                    var stats = {
                        current: toFarenheit(n.current_temperature),
                        target: toFarenheit(n.target_temperature),
                        away: data.structure[NEST.STRUCTUREID].away,
                        heater: n.hvac_heater_state
                    }
                    resolve(stats)
                })
            })
        })
    },
    Control: (temperature, away) => {
        return new Promise((resolve, reject) => {
            if(temperature != null){
                nest.login(NEST.USERNAME, NEST.PASS, (err, data) => {
                    if(err) reject(err)
                    nest.fetchStatus(data => {
                        nest.setTemperature(NEST.DEVICEID, nest.ftoc(temperature))
                        resolve('ok')
                    })                    
                })
            }else if(away != null){
                nest.login(NEST.USERNAME, NEST.PASS, (err, data) => {
                    if(err) reject(err)
                    nest.fetchStatus(data => {
                        if(away == 'true'){
                            nest.setAway()
                        }else{
                            nest.setHome()
                        }
                        resolve('ok')
                    })                
                })            
            }   
        })
    }
}