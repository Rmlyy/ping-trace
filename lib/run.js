const parse = require('./parser')
const utils = require('../etc/utils')
const cache = require('../etc/cache')
const acceptedProtocols = ['ICMP', 'TCP', 'UDP']
const commandFlagProtocolMapping = {
  icmp: '-I',
  tcp: '-T',
  udp: '-U',
}

module.exports = async function (req, res, shellCmd, args) {
  let { target, protocol } = req.query
  protocol ||= 'icmp'

  let currentCache = ''

  switch (shellCmd) {
    case 'ping':
      currentCache = cache.ping
      break
    case 'traceroute':
      currentCache = cache.traceroute
      break
  }

  if (!target) return res.status(400).send(utils.failMsg('Target not specified'))
  if (shellCmd === 'traceroute' && !acceptedProtocols.includes(protocol.toUpperCase()))
    return res.status(400).send(utils.failMsg('Invalid protocol'))

  const parseTarget = await parse(target, true)

  if (parseTarget.status === 'fail' || !parseTarget.ip || parseTarget.ip.type === 'private')
    return res.status(400).send(utils.failMsg('Invalid IP address'))

  const cached = currentCache.has(target)
  if (cached) return res.send(currentCache.get(target))
  if (shellCmd === 'traceroute') args[args.length - 1] = commandFlagProtocolMapping[protocol.toLowerCase()]

  try {
    const result = await utils.spawnEscape(shellCmd, args)
    const data = { status: 'success', output: result }

    currentCache.set(target, data)
    res.send(data)
  } catch (e) {
    console.log(e)
    res.status(500).send({ status: 'error', msg: e.message ? e.message : e })
  }
}
