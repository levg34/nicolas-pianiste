const { Container, Jumbotron, Navbar, Nav, NavDropdown, ListGroup, Row, Col, Card } = ReactBootstrap
const { useState, useEffect } = React

function stringToColour(str) {
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
        resJSX = <Card>
        <Card.Body>
            <Card.Title><MessageInfo message={_message}/></Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{`Le ${formatedDate}, depuis ${ip}`}</Card.Subtitle>
            <Card.Text>
            {message}
            </Card.Text>
            <Card.Link href="#">Supprimer</Card.Link>
            <Card.Link href="#">Marquer</Card.Link>
        </Card.Body>
    </Card>
    }

    return resJSX
}

function Messages() {
    const [messages,setMessages] = useState([])
    const [selectedMessage,selectMessage] = useState()

    useEffect(() => {
        axios.get('/admin/messages')
    .then(function (response) {
        if (response.data) {
            setMessages(response.data)
        }
    })
    .catch(function (error) {
        console.log(error)
    })
    .then(function () {
    })
    },[])

    return <Container>
        <Row>
            <Col>
                <ListGroup>
                {messages.map(message => <ListGroup.Item onClick={() => {selectMessage(message)}} action key={message._id}><MessageInfo message={message}/></ListGroup.Item>)}
                </ListGroup>
            </Col>
            <Col xs={8}>
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

function App() {
    return <div>
        <Header/>
        <Content/>
    </div>
}

ReactDOM.render(<App/>,document.getElementById('root'))