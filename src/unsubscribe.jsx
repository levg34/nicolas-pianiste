const { Jumbotron, Button, Container, InputGroup, FormControl, Alert, Form} = ReactBootstrap
const { useState } = React

function Unsubscribe(props) {
    const [email, setEmail] = useState('')

    const {setAlert} = props

    const submitForm = e => {
        e.preventDefault()
        axios.put('/unsubscribe/'+email).then(res => {
            if (res.data && res.data.updated !== undefined) {
                if (res.data.updated > 0) {
                    setAlert({
                        variant: 'success',
                        message: 'Vous avez bien été désinscrit de la newsletter.'
                    })
                } else {
                    setAlert({
                        variant: 'danger',
                        message: 'Vous n\'étiez pas inscrit à la newsletter.'
                    })
                }
            } else {
                setAlert({
                    variant: 'danger',
                    message: 'Une erreur s\'est produite : veuillez réessayer.'
                })
            }
        }).catch(err => setAlert({
            variant: 'danger',
            message: 'Une erreur s\'est produite : veuillez réessayer.'
        }))
    }

    return <Jumbotron>
        <h1>Désinscription de la newsletter de Nicolas Dross</h1>
        <p>Entrez votre adresse email pour vous désinscrire, puis cliquez sur "Désinscription"</p>
        <Form onSubmit={submitForm}>
            <InputGroup>
                <FormControl type="email" placeholder="Votre adresse email" value={email} onChange={e => setEmail(e.target.value)}/>
                <InputGroup.Append>
                    <Button variant="outline-secondary" disabled={!email} type="submit">Désinscription</Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
        <p>Sinon, pour revenir sur le site, <a href="/">cliquez ici</a></p>
    </Jumbotron>
}

function Feedback(props) {
    const {variant, message} = props.alert
    return <Alert variant={variant}>{message}</Alert>
}

function App() {
    const [alert, setAlert] = useState()

    return <Container>
        {(alert && alert.message) && <Feedback alert={alert}/>}
        <Unsubscribe setAlert={setAlert}/>
    </Container>
}

ReactDOM.render(<App/>,document.getElementById('root'))
