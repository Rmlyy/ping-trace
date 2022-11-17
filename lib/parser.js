const net = require('net')
const psl = require('psl')
const dns = require('dns/promises')
const v6 = require('ip-address').Address6

const regex =
  /^(?!^0\.)(?!^10\.)(?!^100\.6[4-9]\.)(?!^100\.[7-9]\d\.)(?!^100\.1[0-1]\d\.)(?!^100\.12[0-7]\.)(?!^127\.)(?!^169\.254\.)(?!^172\.1[6-9]\.)(?!^172\.2[0-9]\.)(?!^172\.3[0-1]\.)(?!^192\.0\.0\.)(?!^192\.0\.2\.)(?!^192\.88\.99\.)(?!^192\.168\.)(?!^198\.1[8-9]\.)(?!^198\.51\.100\.)(?!^203.0\.113\.)(?!^22[4-9]\.)(?!^23[0-9]\.)(?!^24[0-9]\.)(?!^25[0-5]\.)(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))$/

function error(msg) {
  return {
    status: 'fail',
    msg: msg,
  }
}

function parseIPv4(ipv4) {
  if (!regex.test(ipv4)) return { address: ipv4, version: 4, type: 'private' }
  return { address: ipv4, version: 4, type: 'public' }
}

function parseIPv6(ipv6) {
  const addr = new v6(ipv6)
  const scope = addr.getScope()
  if (scope !== 'Global' && scope !== 'Link local') return { address: ipv6, version: 6, type: 'private' }
  return { address: ipv6, version: 6, type: 'public' }
}

async function resolveIPv4(target) {
  try {
    const ipv4 = await dns.resolve4(target)
    if (ipv4.length) return ipv4[0]
  } catch {
    return null
  }
  return null
}

async function resolveIPv6(target) {
  try {
    const ipv6 = await dns.resolve6(target)
    if (ipv6.length) return ipv6[0]
  } catch {
    return null
  }
  return null
}

async function resolveDNS(target) {
  const resolve4 = await resolveIPv4(target)
  const resolve6 = await resolveIPv6(target)

  if (resolve4) return parseIPv4(resolve4)
  else if (resolve6) return parseIPv6(resolve6)
}

module.exports = async function (target, resolve, port) {
  let data = { status: 'success', input: target, port: parseInt(port) }

  if (!target || (!net.isIP(target) && !psl.parse(target).listed)) {
    return (data = error('Please specify a valid target'))
  }

  if ((port != undefined && isNaN(port)) || port > 65535 || port <= 0) {
    return (data = error('Please specify a valid port'))
  }

  if (!port) delete data.port

  if (net.isIPv4(target)) {
    data.ip = parseIPv4(target)
    return data
  }

  if (net.isIPv6(target)) {
    data.ip = parseIPv6(target)
    return data
  }

  const parseDomain = psl.parse(target)
  data.domain = parseDomain

  if (resolve === true) {
    const ip = await resolveDNS(target)
    data.ip = ip || null
  }
  return data
}
