const express = require('express')
const run = require('./lib/run')
const limiter = require('./etc/limiter')
const app = express()
const port = process.env.PORT || 5989
const host = process.env.HOST || '0.0.0.0'

app.set('trust proxy', true)
app.disable('x-powered-by')
app.use(limiter)

app.get('/ping', async (req, res) => {
  await run(req, res, 'ping', ['-O', '-c4', '-i0.5', '-w2', req.query.target])
})

app.get('/traceroute', async (req, res) => {
  await run(req, res, 'traceroute', ['-w1', '-q1', '-f2', req.query.target])
})

app.listen(port, host, () => {
  console.log(`Server listening on port ${host}:${port}`)
})
