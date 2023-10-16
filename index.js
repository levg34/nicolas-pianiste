const express = require('express')
const app = express()

const Datastore = require('nedb')
const db = {}
db.messages = new Datastore({ filename: 'data/messages', autoload: true })
db.users = new Datastore({ filename: 'data/users', autoload: true })

const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
const port = process.env.APP_PORT || 3000

const mailgun = require("mailgun-js");

const bcrypt = require('bcrypt');
const saltRounds = 13;

function generateAccessToken(userData) {
    return jwt.sign(userData, process.env.TOKEN_SECRET, { expiresIn: '30m' });
}

const knownIps = {}
const MAX_REQUESTS = 5
const RESET_TIME = 60*1000

app.use(function(req, res, next) {
    const ip = req.ip
    const path = req.path
    if (path.startsWith('/admin/')) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (!token) {
            res.status(401).json({
                error: 'Access denied',
                data: 'Login required'
            })
            return
        }
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                res.status(403).json({
                    error: 'Access denied',
                    data: err
                })
                return
            }
            if (!user || !user.admin) {
                res.status(403).json({
                    error: 'Access denied',
                    data: 'Not admin'
                })
                return
            }
            req.user = user
            next()
        })
    } else if (canRequest(ip,path)) {
        next()
    } else {
        res.status(401).json({
            error: 'Access denied',
            data: 'Too many requests'
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
        sendEmail(newDoc)
        res.json(newDoc)
    })
})

app.post('/login', (req,res) => {
    const {username,password} = req.body

    if (!username || !password) {
        res.status(400).json({
            error: 'Malformed request',
            data: 'Need username and password.'
        })
        return
    }

    db.users.findOne({username},{_id:1},(err,doc) => {
        if (err) {
            res.status(500).json({err})
        } else if (doc) {
            const userData = doc

            if (!userData.password) {
                bcrypt.hash(password, saltRounds, function(err, hash) {
                    if (err) console.error(err)
                    db.users.update({ _id: userData._id }, { $set: { password: hash } }, {}, function(err) {
                        if (err) console.error(err)
                    })
                })
                userData.token = generateAccessToken(userData)
                res.json(userData)
            } else {
                bcrypt.compare(password, userData.password, function(err, result) {
                    if (err) {
                        res.status(500).json({err})
                    } else if (result) {
                        userData.token = generateAccessToken(userData)
                        delete userData.password
                        res.json(userData)
                    } else {
                        res.status(403).json({
                            error: 'Access denied',
                            data: 'Login failed'
                        })
                    }
                })
            }
        } else {
            res.status(403).json({
                error: 'Access denied',
                data: 'Login failed'
            })
        }
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

app.patch('/admin/message/read/:id', (req, res) => {
    const id = req.params.id
    db.messages.update({ _id: id }, { $set: { read: true } }, {}, function(err) {
        if (err) res.status(500).json(err)
        res.json({read:id})
    })
})

app.patch('/admin/message/unread/:id', (req, res) => {
    const id = req.params.id
    db.messages.update({ _id: id }, { $unset: { read: true } }, {}, function(err) {
        if (err) res.status(500).json(err)
        res.json({unread:id})
    })
})

app.delete('/admin/message/:id', (req, res) => {
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
    if (path != '/message' && path != '/login' && (!knownIps[ip] || !knownIps[ip].blocked)) {
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

function sendEmail(emailInfo) {
    try {
        const mg = mailgun({apiKey: process.env.MAIL_API_KEY, domain: process.env.MAIL_DOMAIN});

        const data = {
            from: process.env.MAIL_SENDER,
            to: process.env.ADMIN_EMAIL,
            subject: `Nouveau message de ${emailInfo.name} <${emailInfo.email}>`,
            text: emailInfo.message
        }

        mg.messages().send(data, function (error, body) {
            console.error(error)
            console.log(body)
        })
    } catch (error) {
        console.error(error)
    }
}
