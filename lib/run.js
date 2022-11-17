const parse = require('./parser')
const utils = require('../etc/utils')
const cache = require('../etc/cache')

module.exports = async function (req, res, shellCmd, args) {
  const { target } = req.query
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

  const parseTarget = await parse(target, true)

  if (parseTarget.status === 'fail' || !parseTarget.ip || parseTarget.ip.type === 'private')
    return res.status(400).send(utils.failMsg('Invalid IP address'))

  const cached = currentCache.has(target)
  if (cached) return res.send(currentCache.get(target))

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
