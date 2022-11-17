const NodeCache = require('node-cache')

const ping = new NodeCache({ stdTTL: 10 })
const traceroute = new NodeCache({ stdTTL: 60 })

module.exports = { ping, traceroute }
