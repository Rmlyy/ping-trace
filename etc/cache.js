const NodeCache = require('node-cache')

const ping = new NodeCache({ stdTTL: 5 })
const traceroute = new NodeCache({ stdTTL: 5 })

module.exports = { ping, traceroute }
