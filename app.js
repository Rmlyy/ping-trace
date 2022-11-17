const express = require('express')
const run = require('./lib/run')
const app = express()
const port = process.env.PORT || 5989

app.set('trust proxy', true)
app.disable('x-powered-by')

app.get('/ping', async (req, res) => {
  await run(req, res, 'ping', ['-O', '-c4', '-i0.5', '-w2', req.query.target])
})

app.get('/traceroute', async (req, res) => {
  await run(req, res, 'traceroute', ['-w1', '-q1', '-f2', req.query.target])
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})