const { Container, Jumbotron, Navbar, Nav, NavDropdown } = ReactBootstrap

function Header() {
    return <Navbar expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="#home">Adminicolas</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Nav>
            <Nav.Link href="#features">Features</Nav.Link>
            <Nav.Link href="#pricing">Pricing</Nav.Link>
            <NavDropdown title="Dropdown" id="collasible-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
            </NavDropdown>
        </Nav>
    </Navbar>
}

function Content() {
    return <Container>
        AH
    </Container>
}

function App() {
    return <div>
        <Header/>
        <Content/>
    </div>
}

ReactDOM.render(<App/>,document.getElementById('root'))