const { Jumbotron, Button, Container } = ReactBootstrap

function App() {
    return <Container>
        <NicoCarousel/>
        <Jumbotron>
            <h1>Page non trouvée !</h1>
            <p>Cette page n'existe pas encore. Pour revenir à la page d'accueil, cliquer <a href="/">ici</a>, ou sur le bouton ci-dessous.</p>
            <p><Button as="a" href="/" variant="primary">Revenir à l'accueil</Button></p>
        </Jumbotron>
    </Container>
}

ReactDOM.render(<App/>,document.getElementById('root'))
