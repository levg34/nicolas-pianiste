const express = require('express')
const app = express()
app.set('trust proxy', 'loopback')
const helmet = require("helmet")
app.use(helmet({
    contentSecurityPolicy: false
}))

const axios = require('axios')

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const path = require('path')
const sizeOf = require('image-size')

const fs = require('fs')

const Datastore = require('nedb')
const db = {}
db.messages = new Datastore({ filename: 'data/messages', autoload: true })
db.users = new Datastore({ filename: 'data/users', autoload: true })
db.users.ensureIndex({ fieldName: 'username', unique: true }, function (err) {
    if (err) console.error(err)
})
db.carousel = new Datastore({ filename: 'data/carousel', autoload: true })
db.links = new Datastore({ filename: 'data/links', autoload: true })
db.biographie = new Datastore({ filename: 'data/biographie', autoload: true })
db.studies = new Datastore({ filename: 'data/studies', autoload: true })
db.concerts = new Datastore({ filename: 'data/concerts', autoload: true })
db.videos = new Datastore({ filename: 'data/videos', autoload: true })
db.repertory = new Datastore({ filename: 'data/repertory', autoload: true })
db.images = new Datastore({ filename: 'data/images', autoload: true })
db.newsletter = new Datastore({ filename: 'data/newsletter', autoload: true })
db.newsletter.ensureIndex({ fieldName: 'email', unique: true }, function (err) {
    if (err) console.error(err)
})

const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
const port = process.env.APP_PORT || 3000

const mailgun = require("mailgun-js")

const bcrypt = require('bcrypt')
const saltRounds = 13

function generateAccessToken(userData) {
    return jwt.sign(userData, process.env.TOKEN_SECRET, { expiresIn: '30m' })
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

app.get('/links', (req, res) => {
    db.links.find({}).sort({type: 1, name: 1}).exec(function (err, docs) {
        if (err) res.status(500).json(err)
        res.json(docs)
    })
})

app.get('/carousel', (req, res) => {
    db.carousel.find({}).sort({active: -1}).exec(function (err, docs) {
        if (err) res.status(500).json(err)
        res.json(docs)
    })
})

app.get('/biographie', (req, res) => {
    db.biographie.find({}).sort({index: 1}).exec(function (err, docs) {
        if (err) res.status(500).json(err)
        res.json(docs)
    })
})

app.get('/studies', (req, res) => {
    db.studies.find({}).sort({index: 1}).exec(function (err, docs) {
        if (err) res.status(500).json(err)
        res.json(docs)
    })
})

app.get('/concerts', (req, res) => {
    db.concerts.find({}, function (err, docs) {
        if (err) res.status(500).json(err)
        res.json(docs)
    })
})

app.get('/videos', (req, res) => {
    db.videos.find({}).sort({index: 1}).exec(function (err, docs) {
        if (err) res.status(500).json(err)
        res.json(docs)
    })
})

app.get('/repertory', (req, res) => {
    db.repertory.find({}).sort({index: 1}).exec(function (err, docs) {
        if (err) res.status(500).json(err)
        if (req.query.raw !== undefined) {
            res.json(docs)
            return
        }
        const rep = {}
        docs.forEach(doc => {
            if (!rep[doc.title]) rep[doc.title] = {}
            if (!rep[doc.title][doc.subtitle ? doc.subtitle : 0])  rep[doc.title][doc.subtitle ? doc.subtitle : 0] = []
            rep[doc.title][doc.subtitle ? doc.subtitle : 0].push(doc.content)
        })
        const formattedRep = []
        Object.keys(rep).forEach(title => {
            const section = {
                title,
                items: []
            }
            Object.keys(rep[title]).forEach(subtitle => {
                const subsection = {
                    list: rep[title][subtitle]
                }
                if (subtitle != 0) {
                    subsection.title = subtitle
                }
                section.items.push(subsection)
            })
            formattedRep.push(section)
        })
        res.json(formattedRep)
    })
})

app.get('/images', (req, res) => {
    db.images.find({}).sort({ratio: 1}).exec(function (err, docs) {
        if (err) res.status(500).json(err)
        res.json(docs)
    })
})

app.get('/uploads/:filename', (req, res) => {
    const options = {
        root: path.join(__dirname, 'uploads'),
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }

    const fileName = req.params.filename
    res.sendFile(fileName, options, function (err) {
        if (err) console.log(err)
    })
})

app.post('/message', (req, res) => {
    const message = req.body
    message.ip = req.ip
    message.date = new Date().toISOString()
    db.messages.insert(message, function (err, newDoc) {
        if (err) res.status(500).json(err)
        sendEmail(newDoc)
        res.json(newDoc)
        axios.get(`http://ip-api.com/json/${message.ip}`).then(response => {
            if (response.data) {
                const ipInfos = response.data
                if (ipInfos && ipInfos.status !== 'fail') {
                    db.messages.update({ _id: newDoc._id }, { $set: { ipInfos } }, {}, function () {
                        if (err) console.error(err)
                    })
                }
            }
        }).catch(err => {
            console.error(err)
        })
    })
})

app.post('/newsletter', (req, res) => {
    const newsletter = req.body
    newsletter.ip = req.ip
    newsletter.date = new Date().toISOString()
    db.newsletter.insert(newsletter, function (err, newDoc) {
        if (err) res.status(500).json(err)
        res.json(newDoc)
        axios.get(`http://ip-api.com/json/${newsletter.ip}`).then(response => {
            if (response.data) {
                const ipInfos = response.data
                if (ipInfos && ipInfos.status !== 'fail') {
                    db.newsletter.update({ _id: newDoc._id }, { $set: { ipInfos } }, {}, function () {
                        if (err) console.error(err)
                    })
                }
            }
        }).catch(err => {
            console.error(err)
        })
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
                        delete userData.password
                        userData.token = generateAccessToken(userData)
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

app.get('/admin/newsletter', (req, res) => {
    db.newsletter.find({}).sort({date: -1}).exec(function (err, docs) {
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

app.post('/admin/studies', (req, res) => {
    const studies = req.body

    const updateStudies = (index) => {
        if (studies.title) {
            db.studies.update({ _id: studies._id }, studies, {}, function (err, numReplaced) {
                if (err) res.status(500).json({err})
                res.json({ok:numReplaced})
            })
        } else {
            const field = studies.paragraph ? 'paragraph' : (studies.award ? 'award' : '_field')
            if (index || index === 0) {
                db.studies.update({ _id: studies._id }, { $set: { [field]: studies[field], index } }, {}, function (err, numReplaced) {
                    if (err) res.status(500).json({err})
                    res.json({ok:numReplaced})
                })
            } else {
                db.studies.update({ _id: studies._id }, { $set: { [field]: studies[field] } }, {}, function (err, numReplaced) {
                    if (err) res.status(500).json({err})
                    res.json({ok:numReplaced})
                })
            }
        }
    }
    if (!studies._id) {
        db.studies.insert(studies, function (err, newDoc) {
            if (err) res.status(500).json(err)
            res.json(newDoc)
        })
    } else if (studies.paragraph && !studies.index && studies.index !== 0) {
        db.studies.count({ paragraph: { $exists: true }}, function (err, count) {
            if (err) res.status(500).json({err})
            updateStudies(count)
        })
    } else if (studies.award && !studies.index && studies.index !== 0) {
        db.studies.count({ award: { $exists: true }}, function (err, count) {
            if (err) res.status(500).json({err})
            updateStudies(count)
        })
    } else {
        updateStudies()
    }
    
})

app.post('/admin/biographie', (req, res) => {
    const bio = req.body

    const updateBio = (index) => {
        if (bio.title) {
            db.biographie.update({ _id: bio._id }, bio, {}, function (err, numReplaced) {
                if (err) res.status(500).json({err})
                res.json({ok:numReplaced})
            })
        } else if (index || index === 0) {
            db.biographie.update({ _id: bio._id }, { $set: { paragraph: bio.paragraph, index } }, {}, function (err, numReplaced) {
                if (err) res.status(500).json({err})
                res.json({ok:numReplaced})
            })
        } else {
            db.biographie.update({ _id: bio._id }, { $set: { paragraph: bio.paragraph } }, {}, function (err, numReplaced) {
                if (err) res.status(500).json({err})
                res.json({ok:numReplaced})
            })
        }
    }
    if (!bio._id) {
        db.biographie.insert(bio, function (err, newDoc) {
            if (err) res.status(500).json(err)
            res.json(newDoc)
        })
    } else if (bio.paragraph && !bio.index && bio.index !== 0) {
        db.biographie.count({ paragraph: { $exists: true }}, function (err, count) {
            if (err) res.status(500).json({err})
            updateBio(count)
        })
    } else {
        updateBio()
    }
    
})

app.post('/admin/links', (req, res) => {
    const link = req.body

    if (!link._id) {
        db.links.insert(link, function (err, newDoc) {
            if (err) res.status(500).json(err)
            res.json(newDoc)
        })
    } else {
        db.links.update({ _id: link._id }, link, {}, function (err, numReplaced) {
            if (err) res.status(500).json({err})
            res.json({ok:numReplaced})
        })
    }
})

app.post('/admin/carousel', (req, res) => {
    const carousel = req.body

    if (!carousel._id) {
        db.carousel.insert(carousel, function (err, newDoc) {
            if (err) res.status(500).json(err)
            res.json(newDoc)
        })
    } else {
        db.carousel.update({ _id: carousel._id }, carousel, {}, function (err, numReplaced) {
            if (err) res.status(500).json({err})
            res.json({ok:numReplaced})
        })
    }
})

app.post('/admin/video', (req, res) => {
    const video = req.body

    if (!video._id) {
        db.videos.insert(video, function (err, newDoc) {
            if (err) res.status(500).json(err)
            res.json(newDoc)
        })
    } else {
        db.videos.update({ _id: video._id }, video, {}, function (err, numReplaced) {
            if (err) res.status(500).json({err})
            res.json({ok:numReplaced})
        })
    }
})

app.post('/admin/repertory', (req, res) => {
    const repItem = req.body

    if (!repItem._id) {
        db.repertory.insert(repItem, function (err, newDoc) {
            if (err) res.status(500).json(err)
            res.json(newDoc)
        })
    } else {
        db.repertory.update({ _id: repItem._id }, repItem, {}, function (err, numReplaced) {
            if (err) res.status(500).json({err})
            res.json({ok:numReplaced})
        })
    }
})

app.post('/admin/concerts', (req, res) => {
    const concert = req.body

    if (!concert._id) {
        db.concerts.insert(concert, function (err, newDoc) {
            if (err) res.status(500).json(err)
            res.json(newDoc)
        })
    } else {
        db.concerts.update({ _id: concert._id }, concert, {}, function (err, numReplaced) {
            if (err) res.status(500).json({err})
            res.json({ok:numReplaced})
        })
    }
})

app.delete('/admin/repertory/:id', (req, res) => {
    const repId = req.params.id

    db.repertory.remove({ _id: repId }, {}, function (err, numRemoved) {
        if (err) res.status(500).json({err})
        res.json({removed:numRemoved})
    })
})

app.delete('/admin/carousel/:id', (req, res) => {
    const id = req.params.id

    db.carousel.remove({ _id: id }, {}, function (err, numRemoved) {
        if (err) res.status(500).json({err})
        res.json({removed:numRemoved})
    })
})

app.delete('/admin/video/:id', (req, res) => {
    const id = req.params.id

    db.videos.remove({ _id: id }, {}, function (err, numRemoved) {
        if (err) res.status(500).json({err})
        res.json({removed:numRemoved})
    })
})

app.delete('/admin/link/:id', (req, res) => {
    const id = req.params.id

    db.links.remove({ _id: id }, {}, function (err, numRemoved) {
        if (err) res.status(500).json({err})
        res.json({removed:numRemoved})
    })
})

app.delete('/admin/biographie/:id', (req, res) => {
    const id = req.params.id

    db.biographie.remove({ _id: id }, {}, function (err, numRemoved) {
        if (err) res.status(500).json({err})
        res.json({removed:numRemoved})
    })
})

app.delete('/admin/studies/:id', (req, res) => {
    const id = req.params.id

    db.studies.remove({ _id: id }, {}, function (err, numRemoved) {
        if (err) res.status(500).json({err})
        res.json({removed:numRemoved})
    })
})

app.delete('/admin/image/:id', (req, res) => {
    const id = req.params.id

    db.images.findOne({_id: id}, (err, image) => {
        if (!image) {
            res.status(404).json({
                error: 'Not found',
                data: 'File not found.'
            })
        } else if (!image.fieldname) {
            res.status(403).json({
                error: 'Access denied',
                data: 'Cannot delete versioned files.'
            })
        } else {
            fs.unlink(image.path, function (err) {
                if (err) {
                    res.status(403).json({error: err})
                } else {
                    db.images.remove({ _id: id }, {}, function (err, numRemoved) {
                        if (err) res.status(500).json({err})
                        res.json({removed:numRemoved})
                    })
                }
            })
        }
    })
})

app.delete('/admin/concert/:id', (req, res) => {
    const id = req.params.id

    db.concerts.remove({ _id: id }, {}, function (err, numRemoved) {
        if (err) res.status(500).json({err})
        res.json({removed:numRemoved})
    })
})

app.get('/admin/tokenvalid', (req, res) => {
    const user = {...req.user}
    const {exp} = user
    user.expMin = (exp - (new Date()).getTime()/1000)/60
    res.json(user)
})

app.post('/admin/upload', upload.single('image'), (req, res) => {
    const {username} = req.user

    const uploadData = {
        ...req.file,
        username
    }

    sizeOf(uploadData.destination+uploadData.filename, function (err, dimensions) {
        if (err) res.status(500).json(err)

        const {width, height} = dimensions
        const ratio = width / height

        if (Math.abs(9/2-ratio)<0.01) {
            uploadData.banner = true
        }

        if (Math.abs(4/3-ratio)<0.003) {
            uploadData.concerts = true
        }

        db.images.insert({...uploadData, width, height, ratio}, function (err, newDoc) {
            if (err) res.status(500).json(err)
            res.json(newDoc)
        })
    })
    
})

function canRequest(ip, path) {
    if (path != '/message' && path != '/login' && path != '/newsletter' && (!knownIps[ip] || !knownIps[ip].blocked)) {
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

// Handle 404
app.use(function(req, res) {
    res.status(404).sendFile(__dirname + '/view/404.html')
})
  
// Handle 500
app.use(function(error, req, res, next) {
    console.error(error)
    res.status(500).sendFile(__dirname + '/view/500.html')
})

app.listen(port, () => {
    console.log(`Nicolapp listening at http://localhost:${port}`)
})

function sendEmail(emailInfo) {
    const data = {
        from: process.env.MAIL_SENDER,
        to: process.env.ADMIN_EMAIL,
        subject: `Nouveau message de ${emailInfo.name} <${emailInfo.email}>`,
        text: emailInfo.message
    }

    try {
        const mg = mailgun({
            apiKey: process.env.MAIL_API_KEY,
            domain: process.env.MAIL_DOMAIN
        })
    
        mg.messages().send(data, function (error, body) {
            if (error) console.error(error)
            console.log(body)
        })
    } catch (error) {
        console.error(error)
    }
}
