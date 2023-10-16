const express = require('express')
const app = express()
const port = 3000

const knownIps = {}
const MAX_REQUESTS = 5
const RESET_TIME = 60*1000

app.use(function(req, res, next) {
    const ip = req.ip
    const path = req.path
    if (canRequest(ip,path)) {
        next()
    } else {
        res.status(401).json({
            error: 'Access denied',
            reason: 'Too many requests',
            knownIps
        })
    }
})

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/view/index.html')
})

app.get('/message', (req, res) => {
    res.status(501).send('Not implemented.')
})

function canRequest(ip, path) {
    if (path != '/message' && (!knownIps[ip] || !knownIps[ip].blocked)) {
        return true
    } else if (!knownIps[ip]) {
        knownIps[ip] = {
            first: new Date().getTime(),
            nb: 1,
            paths: [
                path
            ]
        }
        return true
    } else {
        knownIps[ip].paths.push(path)
        const now = new Date().getTime()
        if (now - knownIps[ip].first > RESET_TIME) {
            delete knownIps[ip]
            return canRequest(ip)
        } else if (knownIps[ip].nb < MAX_REQUESTS) {
            knownIps[ip].nb++
            return true
        } else {
            knownIps[ip].nb++
            knownIps[ip].blocked = true
        }
    }

    return false
}

app.listen(port, () => {
    console.log(`Nicolapp listening at http://localhost:${port}`)
})
