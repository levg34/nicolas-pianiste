const { Container, Jumbotron, Navbar, Nav, NavDropdown, ListGroup, Row, Col, Card, ButtonGroup, Button, Form, Alert } = ReactBootstrap
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

function Header() {
    const disconnect = () => {
        sessionStorage.clear()
        window.location = '/admin'
    }

    return <Navbar expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="#home">Adminicolas</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Nav>
            <Nav.Link>Messages</Nav.Link>
            <NavDropdown title="Objets" id="collasible-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Concerts</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">Machins</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Trucs</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">Bidules</NavDropdown.Item>
            </NavDropdown>
        </Nav>
        <Nav className="ml-auto">
            <Nav.Link onClick={disconnect}>Se déconnecter</Nav.Link>
        </Nav>
    </Navbar>
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

function Messages() {
    const [messages,setMessages] = useState([])
    const [selectedMessage,selectMessage] = useState()

    const [alert, setAlert] = useState()
    const [alertVariant, setAlertVariant] = useState()

    const treatError = err => {
        console.error(err)
        if (err.response) {
            setAlert(err.response.data ? err.response.data : err.response)
            if (err.response.data && (err.response.data.data === 'Login required' || (err.response.data.data && (err.response.data.data.name === 'TokenExpiredError' || err.response.data.data.name === 'JsonWebTokenError')))) {
                sessionStorage.clear()
                setTimeout(() => window.location = '/admin',2500)
            }
        } else if (err.request) {
            setAlert(err.request)
        } else {
            setAlert(err.message)
        }
        setAlertVariant('danger')
    }

    const treatSuccess = success => {
        setAlert(success)
        setAlertVariant('success')
        setTimeout(() => setAlert(null),1500)
    }

    const getMessages = (showFeedback) => {
        setAlert(null)
        selectMessage(null)
        axios.get('/admin/messages')
        .then(function (response) {
            if (response.data) {
                setMessages(response.data)
                if (showFeedback) {
                    treatSuccess('Messages récupérés.')
                }
            }
        })
        .catch(function (error) {
            treatError(error)
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
            treatError(error)
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
            treatError(error)
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
            treatError(error)
        })
    }

    return <Container>
        {alert && <Alert variant={alertVariant}>
            {alert instanceof Object ? <pre>{JSON.stringify(alert, null, 2) }</pre> : alert}
        </Alert>}
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

function Content() {
    return <Container fluid>
        <Messages/>
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
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" onChange={e => setUsername(e.target.value)} value={username} required/>
                </Form.Group>
                <Form.Group controlId="formGroupPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} value={password}/>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
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