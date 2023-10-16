const { Container, Jumbotron, Navbar, Nav, ListGroup, Row, Col, Card, ButtonGroup, Button, Form, Alert } = ReactBootstrap
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
    const {setActivePage} = props

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

function Carousel() {
    return <Container>
        Carousel...
    </Container>
}

function Bio(params) {
    const [title,setTitle] = useState({
        title: '',
        subtitle: ''
    })

    const [paragraphs,setParagraphs] = useState({})

    const feedback = params.feedback

    const getBioData = () => {
        axios.get('/biographie').then(res => {
            setTitle(res.data.find(o => o.title))
            setParagraphs(res.data.filter(o => o.paragraph).reduce((acc, cur) => {
                return {...acc, [cur._id]: cur}
            },{}))
        }).catch(err => feedback.treatError(err))
    }

    const setBioData = (biobject) => {
        delete biobject.modified
        feedback.clear()
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
            <Form.Group key={p._id} controlId="exampleForm.ControlTextarea1">
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
            <hr/>
            <Button variant="primary" type="submit">
                Valider
            </Button>
        </Form>
    </Container>
}

function Links() {
    return <Container>
        Links...
    </Container>
}

function Studies() {
    return <Container>
        Studies...
    </Container>
}

function Content(props) {
    const {page} = props

    const [alert,setAlert] = useState()
    const feedback = new FeedbackManager(setAlert)

    let component = 'Chargement...'
    switch (page) {
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
        default:
            component = <Container>
                <Alert variant="danger">
                    {`Component "${page}" not found.`}
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
        const [activePage, setActivePage] = useState('messages')
        return <div>
            <Header setActivePage={setActivePage}/>
            <Content page={activePage}/>
        </div>
    } else {
        return <Login/>
    }
}

ReactDOM.render(<App/>,document.getElementById('root'))