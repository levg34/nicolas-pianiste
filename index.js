const express = require('express')
const app = express()
const port = 3000

const Datastore = require('nedb')
const db = {}
db.messages = new Datastore({ filename: 'data/datafile', autoload: true })

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
            data: 'Login required'
        })
    }
})

app.use(express.static(__dirname + '/public'))

app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/view/index.html')
})

app.post('/message', (req, res) => {
    const message = req.body
    message.ip = req.ip
    message.date = new Date().toISOString()
    db.messages.insert(message, function (err, newDoc) {
        if (err) res.status(500).json(err)
        res.json(newDoc)
    })
})

app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/view/admin.html')
})

app.get('/admin/messages', (req, res) => {
    db.messages.find({}).sort({date: -1}).exec(function (err, docs) {
        if (err) res.status(500).json(err)
        res.json(docs)
    })
})

app.post('/admin/message/read/:id', (req, res) => {
    const id = req.params.id
    db.messages.update({ _id: id }, { $set: { read: true } }, {}, function(err) {
        if (err) res.status(500).json(err)
        res.json({read:id})
    })
})

app.post('/admin/message/unread/:id', (req, res) => {
    const id = req.params.id
    db.messages.update({ _id: id }, { $unset: { read: true } }, {}, function(err) {
        if (err) res.status(500).json(err)
        res.json({unread:id})
    })
})

app.post('/admin/message/delete/:id', (req, res) => {
    const id = req.params.id
    db.messages.remove({ _id: id }, {}, function (err, numRemoved) {
        if (err) res.status(500).json({err})
        res.json({
            deleted:id,
            numRemoved
        })
    })
})

function canRequest(ip, path) {
    if (path.startsWith('/admin')) {
        return false
    } else if (path != '/message' && (!knownIps[ip] || !knownIps[ip].blocked)) {
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
            return canRequest(ip,path)
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
