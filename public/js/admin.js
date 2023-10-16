const { Container, Jumbotron, Navbar, Nav, ListGroup, Row, Col, Card, ButtonGroup, Button, Form, Alert, Image } = ReactBootstrap
const { useState, useEffect } = React

function stringToColour(str) {
    if (!str) return
    var hash = 0
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    var colour = '#'
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF
        colour += ('00' + value.toString(16)).substr(-2)
    }
    return colour
}

function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'long' }).format(date)
}

function Header(props) {
    const setActivePage = page => {
        window.location.hash = page
    }

    const disconnect = () => {
        sessionStorage.clear()
        window.location = '/admin'
    }

    return <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="#home">Adminicolas</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
            <Nav>
                <Nav.Link onClick={() => setActivePage('messages')}>Messages</Nav.Link>
                {/*here: separator*/}
                <Nav.Link onClick={() => setActivePage('carousel')}>Slider photo</Nav.Link>
                <Nav.Link onClick={() => setActivePage('biographie')}>Biographie</Nav.Link>
                <Nav.Link onClick={() => setActivePage('studies')}>Études</Nav.Link>
                <Nav.Link onClick={() => setActivePage('concerts')}>Concerts</Nav.Link>
                <Nav.Link onClick={() => setActivePage('repertory')}>Répertoire</Nav.Link>
                <Nav.Link onClick={() => setActivePage('videos')}>Vidéos</Nav.Link>
                <Nav.Link onClick={() => setActivePage('links')}>Liens</Nav.Link>
            </Nav>
            <Nav className="ml-auto">
                <Nav.Link onClick={disconnect}><Button variant="info">Se déconnecter</Button></Nav.Link>
            </Nav>
        </Navbar.Collapse>
    </Navbar>
}

class FeedbackManager {
    constructor(setAlert) {
        this.setAlert = setAlert
    }

    treatError(err) {
        let text = ''
        console.error(err)
        if (err.response) {
            text = err.response.data ? err.response.data : err.response
            if (err.response.data && (err.response.data.data === 'Login required' || (err.response.data.data && (err.response.data.data.name === 'TokenExpiredError' || err.response.data.data.name === 'JsonWebTokenError')))) {
                sessionStorage.clear()
                setTimeout(() => window.location = '/admin',2500)
            }
        } else if (err.request) {
            text = err.request
        } else {
            text = err.message
        }
        this.setAlert({
            text,
            variant: 'danger'
        })
    }

    treatSuccess(success) {
        this.setAlert({
            variant: 'success',
            text: success
        })
        setTimeout(() => this.clear(),1500)
    }

    clear() {
        this.setAlert(null)
    }
}

function AlertFeedback(props) {
    const {text,variant} = props.alert ? props.alert : {}
    return <Container>
        {text && <Alert variant={variant}>
            {text instanceof Object ? <pre>{JSON.stringify(text, null, 2) }</pre> : text}
        </Alert>}
    </Container>
}

function MessageInfo(props) {
    const {name,email,ip,read} = props.message

    return <div style={{color: stringToColour(ip)}}>
        {`${name} <${email}>`}
    </div>
}

function Message(props) {
    let resJSX = 'Sélectionner d\'abord un message.'
    const _message = props.message

    if (_message) {
        const {message,ip,date,_id} = _message
        const formatedDate = formatDate(new Date(date))

        const [ipInfos, setIpInfos] = useState()

        useEffect(() => {
            axios.get(`http://ip-api.com/json/${ip}`).then(response => {
                if (response.data) {
                    setIpInfos(response.data)
                }
            }).catch(err => {
                console.error(err)
            })
        },[_message])

        resJSX = (
            <Card>
                <Card.Body>
                    <Card.Title><MessageInfo message={_message}/></Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                        <div>{`Le ${formatedDate}`}</div>
                        <div>{`${(ipInfos && ipInfos.city) ? `Depuis ${ipInfos.city}, ${ipInfos.regionName}, ${ipInfos.country}` : `Adresse ip : ${ip}`}`}</div>
                    </Card.Subtitle>
                    <Card.Text as="div">
                        <pre style={{whiteSpace: 'pre-wrap'}}>{message}</pre>
                    </Card.Text>
                </Card.Body>
            </Card>
        )
    }

    return resJSX
}

function Messages(props) {
    const [messages,setMessages] = useState([])
    const [selectedMessage,selectMessage] = useState()

    const feedback = props.feedback

    const getMessages = (showFeedback) => {
        feedback.clear()
        selectMessage(null)
        axios.get('/admin/messages')
        .then(function (response) {
            if (response.data) {
                setMessages(response.data)
                if (showFeedback) {
                    feedback.treatSuccess('Messages récupérés.')
                }
            }
        })
        .catch(function (error) {
            feedback.treatError(error)
        })
        .then(function () {
        })
    }

    const deleteMessage = () => {
        if (!selectedMessage) return
        const messageId = selectedMessage._id
        axios.delete(`/admin/message/${messageId}`)
        .then(function (response) {
            if (response.data) {
                getMessages()
            }
        })
        .catch(function (error) {
            feedback.treatError(error)
        })
    }

    useEffect(getMessages,[])

    const handleClickMessage = (message) => {
        message.read = true
        selectMessage(message)
        axios.patch(`/admin/message/read/${message._id}`)
        .then(function (response) {
            if (response.data) {
                console.log(response.data)
            }
        })
        .catch(function (error) {
            feedback.treatError(error)
        })
    }

    const unreadMessage = () => {
        if (!selectedMessage) return
        const messageId = selectedMessage._id
        axios.patch(`/admin/message/unread/${messageId}`)
        .then(function (response) {
            if (response.data) {
                console.log(response.data)
                getMessages()
            }
        })
        .catch(function (error) {
            feedback.treatError(error)
        })
    }

    return <Container>
        <ButtonGroup aria-label="Basic example">
            <Button variant="primary" onClick={getMessages.bind(null,true)}>Rafraîchir</Button>
            {(selectedMessage && selectedMessage.read) && <Button variant="info" onClick={unreadMessage}>Non lu</Button>}
            {selectedMessage && <Button variant="danger" onClick={deleteMessage}>Supprimer</Button>}
        </ButtonGroup>
        <Row>
            <Col lg={4}>
                <ListGroup>
                {messages.map(message => <ListGroup.Item active={selectedMessage && selectedMessage._id === message._id} variant={message.read ? 'secondary' : 'primary'} onClick={() => handleClickMessage(message)} action key={message._id}><MessageInfo message={message}/></ListGroup.Item>)}
                </ListGroup>
            </Col>
            <Col>
                <Message message={selectedMessage}/>
            </Col>
        </Row>
    </Container>
}

function Concerts() {
    return <Container>
        Concerts...
    </Container>
}

function Carousel(props) {
    const [data,setData] = useState({})

    const feedback = props.feedback

    const getData = () => {
        axios.get('/carousel').then(res => {
            setData(res.data.reduce((acc, cur) => {
                return {...acc, [cur._id]: cur}
            },{}))
        }).catch(err => feedback.treatError(err))
    }

    useState(getData,[])

    const submitForm = e => {
        e.preventDefault()
        Object.values(data).filter(el => el.modified).forEach(el => {
            feedback.clear()
            delete el.modified
            const carousel = {...el}
            if (el._id.startsWith('new')) {
                delete carousel._id
            }
            axios.post('/admin/carousel',carousel).then(res => {
                console.log(res)
                feedback.treatSuccess('Modifications effectuées !')
                getData()
            }).catch(err => feedback.treatError(err))
        })
    }

    return <Container>
        <Form onSubmit={submitForm}>
            <Row>
                <Col>
                    <Form.Label>Titre</Form.Label>
                </Col>
                <Col>
                    <Form.Label>Description</Form.Label>
                </Col>
                <Col>
                    <Form.Label>Image (format 9x2)</Form.Label>
                </Col>
            </Row>
            <hr/>
            {Object.values(data).map(carouselElement => <Form.Group key={carouselElement._id}>
                <Row>
                    <Col>
                        <Form.Control placeholder={carouselElement.title !== undefined ? 'Titre' : 'Image principale'} value={carouselElement.title} onChange={e => {
                            setData({
                                ...data,
                                [carouselElement._id]: {
                                    ...carouselElement,
                                    modified: true,
                                    title: e.target.value
                                }
                            })
                        }} disabled={carouselElement.title === undefined}/>
                    </Col>
                    <Col>
                        <Form.Control as="textarea" rows={3} placeholder={carouselElement.description !== undefined ? 'Description' : ''} value={carouselElement.description} onChange={e => {
                            setData({
                                ...data,
                                [carouselElement._id]: {
                                    ...carouselElement,
                                    modified: true,
                                    description: e.target.value
                                }
                            })
                        }} disabled={carouselElement.description === undefined}/>
                    </Col>
                    <Col>
                        <Image src={carouselElement.url} thumbnail />
                    </Col>
                </Row>
                <hr/>
            </Form.Group>)}
            <Button className="mt-2" variant="outline-success" onClick={e => setData({
                ...data,
                [`new_${Object.keys(data).length}`]: {
                    _id: `new_${Object.keys(data).length}`,
                    title: '',
                    url: 'https://via.placeholder.com/900x200',
                    description: ''
                }
            })}>Ajouter un slider photo</Button>
            <hr/>
            <Button variant="primary" type="submit">
                Valider
            </Button>
        </Form>
    </Container>
}

function Bio(props) {
    const [title,setTitle] = useState({
        title: '',
        subtitle: ''
    })

    const [paragraphs,setParagraphs] = useState({})

    const feedback = props.feedback

    const getBioData = () => {
        axios.get('/biographie').then(res => {
            setTitle(res.data.find(o => o.title))
            setParagraphs(res.data.filter(o => o.paragraph).reduce((acc, cur) => {
                return {...acc, [cur._id]: cur}
            },{}))
        }).catch(err => feedback.treatError(err))
    }

    const setBioData = (biobject) => {
        feedback.clear()
        delete biobject.modified
        if (biobject._id === 'new') {
            delete biobject._id
        }
        axios.post('/admin/biographie',biobject).then(res => {
            console.log(res)
            feedback.treatSuccess('Modifications effectuées !')
            getBioData()
        }).catch(err => feedback.treatError(err))
    }

    useEffect(() => {
        getBioData()
    },[])

    const submitForm = e => {
        e.preventDefault()
        if (title.modified) {
            setBioData(title)
        }
        Object.values(paragraphs).filter(p => p.modified).forEach(p => {
            setBioData(p)
        })
    }
    
    return <Container>
        <Form onSubmit={submitForm}>
            <Form.Group>
                <Form.Label>Titre de la section</Form.Label>
                <Form.Control type="text" placeholder="Biographie" value={title.title} onChange={e => setTitle({
                    ...title,
                    modified: true,
                    title: e.target.value
                })}/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Sous-titre</Form.Label>
                <Form.Control type="text" placeholder="..." value={title.subtitle} onChange={e => setTitle({
                    ...title,
                    modified: true,
                    subtitle: e.target.value
                })}/>
            </Form.Group>
            <hr/>
        {Object.values(paragraphs).map(p => 
            <Form.Group key={p._id ? p._id : 'new'}>
                <Form.Label>{`Paragraphe n°${p.index}`}</Form.Label>
                <Form.Control as="textarea" rows={3} value={p.paragraph} onChange={e => setParagraphs({
                    ...paragraphs,
                    [p._id]: {
                        ...p,
                        modified: true,
                        paragraph: e.target.value
                    }
                })}/>
            </Form.Group>
        )}
            {(!paragraphs.new) && <Button className="mt-2" variant="outline-success" onClick={e => setParagraphs({
                ...paragraphs,
                new: {
                    _id: 'new',
                    paragraph: '',
                    index: Object.keys(paragraphs).length
                }
            })}>Ajouter un paragraphe</Button>}
            <hr/>
            <Button variant="primary" type="submit">
                Valider
            </Button>
        </Form>
    </Container>
}

function Links(props) {
    const feedback = props.feedback

    const [links,setLinks] = useState({})

    const linkTypes = [
        ['personal', 'Liens personnels'],
        ['media', 'Liens presse'],
        ['other', 'Liens autres'],
    ]

    const getLinks = () => {
        axios.get('/links').then(res => {
            setLinks(res.data.reduce((acc, cur) => {
                return {...acc, [cur._id]: cur}
            },{}))
        }).catch(err => feedback.treatError(err))
    }

    useEffect(getLinks,[])

    const nameChange = (e,link) => {
        setLinks({
            ...links,
            [link._id]: {
                ...link,
                modified: true,
                name: e.target.value
            }
        })
    }

    const urlChange = (e,link) => {
        setLinks({
            ...links,
            [link._id]: {
                ...link,
                modified: true,
                url: e.target.value
            }
        })
    }

    const submitForm = e => {
        e.preventDefault()
        Object.values(links).filter(l => l.modified).forEach(l => {
            feedback.clear()
            delete l.modified
            if (l._id.startsWith('new')) {
                delete l._id
            }
            axios.post('/admin/links',l).then(res => {
                console.log(res)
                feedback.treatSuccess('Modifications effectuées !')
                getLinks()
            }).catch(err => feedback.treatError(err))
        })
    }

    return <Container>
        <Form onSubmit={submitForm}>
            {linkTypes.map(type => <Form.Group key={type[0]}>
                <Row><Form.Label>{type[1]}</Form.Label></Row>
            {Object.values(links).filter(link => link.type === type[0]).map(link => <Row key={link._id ? link._id : `new_${type[0]}_${Object.keys(links).length}`}>
                <Col xs={4}>
                    <Form.Label>Nom</Form.Label>
                    <Form.Control placeholder="Nom" value={link.name} onChange={e => nameChange(e,link)}/>
                </Col>
                <Col>
                    <Form.Label>Url</Form.Label>
                    <Form.Control placeholder="Url" value={link.url} onChange={e => urlChange(e,link)}/>
                </Col>
            </Row>)}
            <Button className="mt-2" variant="outline-success" onClick={e => setLinks({
                ...links,
                [`new_${type[0]}_${Object.keys(links).length}`]: {
                    _id: `new_${type[0]}_${Object.keys(links).length}`,
                    name: '',
                    url: '',
                    type: type[0]
                }
            })}>{`Ajouter un lien "${type[1]}"`}</Button>
            <hr/>
            </Form.Group>)}
            <Button variant="primary" type="submit">
                Valider
            </Button>
        </Form>
    </Container>
}

function Studies(props) {
    const feedback = props.feedback

    const [title,setTitle] = useState({
        title: '',
        awardsTitle: ''
    })

    const [paragraphs,setParagraphs] = useState({})
    const [awards,setAwards] = useState({})

    const getStudData = () => {
        axios.get('/studies').then(res => {
            setTitle(res.data.find(o => o.title))
            setParagraphs(res.data.filter(o => o.paragraph).reduce((acc, cur) => {
                return {...acc, [cur._id]: cur}
            },{}))
            setAwards(res.data.filter(o => o.award).reduce((acc, cur) => {
                return {...acc, [cur._id]: cur}
            },{}))
        }).catch(err => feedback.treatError(err))
    }

    const setStudData = (studobject) => {
        feedback.clear()
        delete studobject.modified
        if (studobject._id === 'new') {
            delete studobject._id
        }
        axios.post('/admin/studies',studobject).then(res => {
            console.log(res)
            feedback.treatSuccess('Modifications effectuées !')
            getStudData()
        }).catch(err => feedback.treatError(err))
    }

    useEffect(getStudData,[])

    const submitForm = e => {
        e.preventDefault()
        if (title.modified) {
            setStudData(title)
        }
        Object.values(paragraphs).filter(p => p.modified).forEach(p => {
            setStudData(p)
        })
        Object.values(awards).filter(a => a.modified).forEach(a => {
            setStudData(a)
        })
    }

    return <Container>
        <Form onSubmit={submitForm}>
            <Form.Group>
                <Form.Label>Titre de la section</Form.Label>
                <Form.Control type="text" placeholder="Études" value={title.title} onChange={e => setTitle({
                    ...title,
                    modified: true,
                    title: e.target.value
                })}/>
            </Form.Group>
            <hr/>
        {Object.values(paragraphs).map(p => 
            <Form.Group key={p._id ? p._id : 'new'}>
                <Form.Label>{`Paragraphe n°${p.index}`}</Form.Label>
                <Form.Control as="textarea" rows={3} value={p.paragraph} onChange={e => setParagraphs({
                    ...paragraphs,
                    [p._id]: {
                        ...p,
                        modified: true,
                        paragraph: e.target.value
                    }
                })}/>
            </Form.Group>
        )}
            {(!paragraphs.new) && <Button className="mt-2" variant="outline-success" onClick={e => setParagraphs({
                ...paragraphs,
                new: {
                    _id: 'new',
                    paragraph: '',
                    index: Object.keys(paragraphs).length
                }
            })}>Ajouter un paragraphe</Button>}
            <hr/>
            <Form.Group>
                <Form.Label>Titre de la section Récompenses</Form.Label>
                <Form.Control type="text" placeholder="Récompenses" value={title.awardsTitle} onChange={e => setTitle({
                    ...title,
                    modified: true,
                    awardsTitle: e.target.value
                })}/>
            </Form.Group>
            <hr/>
            {Object.values(awards).map(p => 
            <Form.Group key={p._id ? p._id : 'new'}>
                <Form.Label>{`Récompense n°${p.index}`}</Form.Label>
                <Form.Control type="text" placeholder={`Récompense n°${p.index}`} value={p.award} onChange={e => setAwards({
                    ...awards,
                    [p._id]: {
                        ...p,
                        modified: true,
                        award: e.target.value
                    }
                })}/>
            </Form.Group>
        )}
            {(!awards.new) && <Button className="mt-2" variant="outline-success" onClick={e => setAwards({
                ...awards,
                new: {
                    _id: 'new',
                    award: '',
                    index: Object.keys(awards).length
                }
            })}>Ajouter une récompense</Button>}
            <hr/>
            <Button variant="primary" type="submit">
                Valider
            </Button>
        </Form>
    </Container>
}

function Repertory() {
    return <Container>
        Répertoire...
    </Container>
}

function Videos() {
    return <Container>
        Vidéos...
    </Container>
}

function Content(props) {
    const startPage = () => window.location.hash ? window.location.hash.replace('#','') : 'messages'

    if (!window.location.hash) {
        window.location.hash = startPage()
    }

    const [activePage, setActivePage] = useState(startPage())

    useEffect(() => {
        window.addEventListener("hashchange", () => {
            setActivePage(startPage())
        }, false)
        return () => {
            window.removeEventListener("hashchange", () => {
                setActivePage(startPage())
            }, false)
        }
    },[])

    const [alert,setAlert] = useState()
    const feedback = new FeedbackManager(setAlert)

    let component = 'Chargement...'
    switch (activePage) {
        case 'messages':
            component = <Messages feedback={feedback}/>
            break
        case 'concerts':
            component = <Concerts feedback={feedback}/>
            break
        case 'carousel':
            component = <Carousel feedback={feedback}/>
            break
        case 'biographie':
            component = <Bio feedback={feedback}/>
            break
        case 'links':
            component = <Links feedback={feedback}/>
            break
        case 'studies':
            component = <Studies feedback={feedback}/>
            break
        case 'repertory':
            component = <Repertory feedback={feedback}/>
            break
        case 'videos':
            component = <Videos feedback={feedback}/>
            break
        default:
            component = <Container>
                <Alert variant="danger">
                    {`Component "${activePage}" not found.`}
                </Alert>
            </Container>
            break
    }

    return <Container fluid>
        <AlertFeedback alert={alert}/>
        {component}
    </Container>
}

function Login() {
    const [username,setUsername] = useState('')
    const [password,setPassword] = useState('')

    const [error,setError] = useState()

    const handleSubmit = e => {
        e.preventDefault()
        setPassword('')
        setError()
        axios.post('/login',{username,password}).then(response => {
            if (response.data && response.data.token) {
                sessionStorage.setItem('token',response.data.token)
                window.location = '/admin'
            } else {
                console.error(response)
            }
        }).catch(err => {
            console.error(err)
            if (err.response) {
                setError(err.response.data ? err.response.data : err.response)
            } else if (err.request) {
                setError(err.request)
            } else {
                setError(err.message)
            }
        })
    }

    return <Container>
        {error && <Alert variant="danger">
            <Alert.Heading>Could not log in!</Alert.Heading>
            {error instanceof Object ? <pre>{JSON.stringify(error, null, 2) }</pre> : error}
        </Alert>}
        <Card body>
            <Form onSubmit={e => { handleSubmit(e) }}>
                <Form.Group controlId="formGroupEmail">
                    <Form.Label>Adresse email</Form.Label>
                    <Form.Control type="email" placeholder="Email" onChange={e => setUsername(e.target.value)} value={username} required/>
                </Form.Group>
                <Form.Group controlId="formGroupPassword">
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control type="password" placeholder="Mot de passe" onChange={e => setPassword(e.target.value)} value={password}/>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Valider
                </Button>
            </Form>
        </Card>
    </Container>
}

function App() {
    const token = sessionStorage.getItem('token')
    if (token) {
        axios.defaults.headers.common['Authorization'] = 'Bearer '+token

        return <div>
            <Header/>
            <Content/>
        </div>
    } else {
        return <Login/>
    }
}

ReactDOM.render(<App/>,document.getElementById('root'))