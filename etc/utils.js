const { spawn } = require('child_process')

function spawnEscape(cmd, args) {
  return new Promise((resolve, reject) => {
    if (!(args instanceof Array)) return reject('Arguments must be an array')

    const command = spawn(cmd, args)
    let stdout = ''
    let stderr = ''

    command.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    command.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    command.on('close', () => {
      stdout ? resolve(stdout) : reject(stderr)
    })

    command.on('error', (err) => {
      reject(err)
    })
  })
}

function failMsg(msg) {
  return { status: 'fail', msg: msg }
}

module.exports = { spawnEscape, failMsg }
