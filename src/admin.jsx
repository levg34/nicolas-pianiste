const { Container, Jumbotron, Navbar, Nav, ListGroup, Row, Col, Card, ButtonGroup, Button, Form, Alert, Image, Toast, Modal, Table, Media, Tabs, Tab, InputGroup, DropdownButton, Dropdown } = ReactBootstrap

const { useState, useEffect, useRef } = React

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
                <Nav.Link onClick={() => setActivePage('images')}>Images</Nav.Link>
                {/*here: separator*/}
                <Nav.Link onClick={() => setActivePage('carousel')}>Slider photo</Nav.Link>
                <Nav.Link onClick={() => setActivePage('biographie')}>Biographie</Nav.Link>
                <Nav.Link onClick={() => setActivePage('studies')}>Études</Nav.Link>
                <Nav.Link onClick={() => setActivePage('concerts')}>Concerts</Nav.Link>
                <Nav.Link onClick={() => setActivePage('repertory')}>Répertoire</Nav.Link>
                <Nav.Link onClick={() => setActivePage('videos')}>Vidéos</Nav.Link>
                <Nav.Link onClick={() => setActivePage('links')}>Liens</Nav.Link>
                <Nav.Link onClick={() => setActivePage('newsletter')}>Newsletter</Nav.Link>
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
        let jsx
        console.error(err)
        if (err.response) {
            text = err.response.data ? err.response.data : err.response
            if (err.response.data && (err.response.data.data === 'Login required' || (err.response.data.data && (err.response.data.data.name === 'TokenExpiredError' || err.response.data.data.name === 'JsonWebTokenError')))) {
                sessionStorage.clear()
                const warningMessage =
`Attention à bien sauvegarder toute donnée non enregistrée avant de se reconnecter !

Se reconnecter ?`
                const handleClickReconnect = () => {
                    if (window.confirm(warningMessage)) {
                        window.location.reload()
                    }
                }
                jsx = <Button variant="warning" onClick={handleClickReconnect}>Se reconnecter</Button>
            }
        } else if (err.request) {
            text = err.request
        } else if (err.message) {
            text = err.message
        } else {
            text = err
        }
        this.setAlert({
            jsx,
            text,
            variant: 'danger'
        })
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    treatSuccess(success) {
        this.setAlert({
            variant: 'success',
            text: success
        })
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
        setTimeout(() => this.clear(),1500)
    }

    treatVariant(variant,text,dismiss) {
        this.setAlert({
            variant,
            text
        })
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
        if (dismiss) {
            setTimeout(() => this.clear(),1500)
        }
    }

    clear() {
        this.setAlert(null)
    }
}

function AlertFeedback(props) {
    const {text,variant,jsx} = props.alert ? props.alert : {}
    return <Container>
        {text && <Alert variant={variant}>
            {text instanceof Object ? <pre>{JSON.stringify(text, null, 2) }</pre> : text}
            {jsx && <div>{jsx}</div>}
        </Alert>}
    </Container>
}

function ImageList(props) {
    const {feedback, images, loadImages, selectImage, imageType} = props

    const [showModal, setShowModal] = useState(false)
    const [viewingImage, setViewingImage] = useState({})

    const showPhotoModal = img => {
        if (selectImage instanceof Function) {
            selectImage(img.destination+img.filename)
        } else {
            setShowModal(true)
            setViewingImage(img)
        }
    }

    useEffect(() => {
        setFilteredImages(images)
        setFilter({
            banner: selectImage instanceof Function && imageType !== 'concerts',
            concerts: selectImage instanceof Function && imageType === 'concerts',
            uploads: false
        })
    },[images])

    const [filter,setFilter] = useState({
        banner: selectImage instanceof Function,
        concerts: false,
        uploads: false
    })

    const [filteredImages,setFilteredImages] = useState([])

    useEffect(() => {
        if (Object.values(filter).filter(f => f).length === 0) {
            setFilteredImages([...images])
        } else {
            setFilteredImages([...images.filter(img => (filter.banner && img.banner) || (filter.concerts && img.concerts) || (filter.uploads && img.fieldname))])
        }
    },[filter])

    return <Container>
        <Form.Check type="checkbox" label="Images pour le slider photo" onChange={e => {
            const checked = e.target.checked
            setFilter({
                ...filter,
                banner: checked
            })
        }} checked={filter.banner}/>
        <Form.Check type="checkbox" label="Images pour les concerts" onChange={e => {
            const checked = e.target.checked
            setFilter({
                ...filter,
                concerts: checked
            })
        }} checked={filter.concerts}/>
        <Form.Check type="checkbox" label="Images uploadées via l'interface d'admin" onChange={e => {
            const checked = e.target.checked
            setFilter({
                ...filter,
                uploads: checked
            })
        }} checked={filter.uploads}/>

        {filteredImages.map(img => <Image style={{maxHeight:'150px'}} fluid key={img._id} src={img.destination+img.filename} thumbnail onClick={e => showPhotoModal(img)}/>)}
        <ImageModal show={showModal} setShow={setShowModal} image={viewingImage} feedback={feedback} loadImages={loadImages}/>
    </Container>
}

function ImageModal(props) {
    const {image,show,setShow,feedback,loadImages} = props
    const url = image.destination+image.filename
    const urlControl = useRef()

    const deleteImage = image => {
        axios.delete('/admin/image/'+image._id).then(res => {
            console.log(res)
            setShow(false)
            feedback.treatSuccess('Image supprimée.')
            loadImages()
        }).catch(err => feedback.treatError(err))
    }

    return <Modal size="lg" show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
            <Modal.Title>
                {image.originalname}
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Card>
                <Card.Img variant="top" src={url} />
                <Card.Body>
                    {image.banner && <Alert variant="info">Peut être utilisée dans le slider photo</Alert>}
                    {image.concerts && <Alert variant="info">Peut être utilisée pour illustrer un concert</Alert>}
                    <div style={{overflow: 'scroll'}}>
                    <Table striped bordered hover>
                        <tbody>
                            {Object.entries(image).map(e => <tr key={e[0]}>
                                <th>{e[0]}</th>
                                <td>{e[1]}</td>
                            </tr>)}
                            <tr key="url">
                                <th>url</th>
                                <td><Form.Control ref={urlControl} value={url} readOnly/></td>
                            </tr>
                        </tbody>
                    </Table>
                    </div>
                    <div className="float-right">
                    {image.fieldname && <Button variant="danger" onClick={() => deleteImage(image)}>Supprimer</Button>}{' '}
                    <Button variant="primary" onClick={e => {
                        urlControl.current.select()
                        document.execCommand('copy')
                        feedback.treatSuccess('URL de l\'image copiée dans le presse-papier')
                        setShow(false)
                    }}>Utiliser</Button>
                    </div>
                </Card.Body>
            </Card>
        </Modal.Body>
    </Modal>
}

function Images(props) {
    const {feedback, selectImage, imageType} = props

    const fileInput = useRef()

    const [images,setImages] = useState([])

    const loadImages = () => {
        axios.get('/images').then(res => {
            setImages(res.data)
        }).catch(err => feedback.treatError(err))
    }

    useEffect(loadImages,[])

    const handleSubmit = e => {
        e.preventDefault()
        const selectedFile = fileInput.current.files[0]

        if (!selectedFile) return feedback.treatError('Vous devez d\'abord sélectionner une image.')

        const formData = new FormData()
        
        formData.append(
            'image',
            selectedFile,
            selectedFile.name
        )
        
        axios.post('/admin/upload', formData).then(res => {
            feedback.treatSuccess(res.data)
            fileInput.current.value = ''
            loadImages()
        }).catch(err => feedback.treatError(err))
    }

    return <Container>
        Images
        <ImageList feedback={feedback} images={images} loadImages={loadImages} selectImage={selectImage} imageType={imageType}/>
        <Card body>
            <Form onSubmit={handleSubmit} encType="multipart/form-data">
                <Form.Group>
                    <Form.Label>Ajouter une image</Form.Label>
                    <Form.Control type="file" label="Image" name="image" ref={fileInput}/>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Valider
                </Button>
            </Form>
        </Card>
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

        const ipInfos = _message.ipInfos

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

    const messageRef = useRef()

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
        messageRef.current.scrollIntoView({behavior: 'smooth'})
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
            <Col ref={messageRef}>
                <Message message={selectedMessage}/>
            </Col>
        </Row>
    </Container>
}

function Concerts(props) {
    const {feedback} = props

    const [concerts,setConcerts] = useState([])

    const getConcerts = () => {
        axios.get('/concerts').then(res => {
            setConcerts(res.data.filter(c => c.name))
            if (selectedConcert !== undefined && !res.data.map(c => c._id).includes(selectedConcert._id)) {
                setSelectedConcert()
            }
        }).catch(err => feedback.treatError(err))
    }

    useEffect(getConcerts,[])

    const concertInfoRef = useRef()

    const [selectedConcert, setSelectedConcert] = useState()

    const clickConcert = concert => {
        setSelectedConcert(concert)
        concertInfoRef.current.scrollIntoView({behavior: 'smooth'})
    }

    return <Container>
        <h2>Concerts</h2>
        <ListGroup>
            {concerts.map(concert => <ListGroup.Item active={selectedConcert && concert._id === selectedConcert._id} key={concert._id} onClick={() => clickConcert(concert)} action>{concert.name}</ListGroup.Item>)}
        </ListGroup>
        {concerts.filter(c => c._id === 'new').length === 0 && <Button variant="outline-success" className="mt-2" onClick={e => {
            const newConcert = {
                type: 'Solo',
                name: '',
                _id: 'new'
            }
            setConcerts([...concerts,newConcert])
            setSelectedConcert(newConcert)
        }}>Ajouter un concert</Button>}
        <hr ref={concertInfoRef}/>
        <ConcertEdit concert={selectedConcert} feedback={feedback} setConcert={setSelectedConcert} getConcerts={getConcerts}/>
    </Container>
}

function ConcertInfo(props) {
    const {feedback, concert, setConcert, getConcerts} = props

    const concertTypes = [
        'Solo',
        'Duo éphémère',
        'Trio éphémère',
        'Musique vocale et spectacles',
        'Composition'
    ]

    const [imageModal, setImageModal] = useState(false)

    const selectImage = e => {
        setImageModal(true)
    }

    const setImage = image => {
        setConcert({
            ...concert,
            img: image
        })
        setImageModal(false)
    }

    const saveConcert = concertO => {
        feedback.clear()
        const concertBd = {...concertO}
        if (concertBd._id.startsWith('new')) {
            delete concertBd._id
        }
        axios.post('/admin/concerts',concertBd).then(res => {
            console.log(res)
            feedback.treatSuccess('Modifications effectuées !')
            getConcerts()
        }).catch(err => feedback.treatError(err))
    }

    return <Container>
        <Form onSubmit={e => {
            e.preventDefault()
            saveConcert(concert)
        }}>
            <Form.Group>
                <Form.Label>Type de concert</Form.Label>
                <Form.Control as="select" value={concert.type} onChange={e => setConcert({
                    ...concert,
                    type: e.target.value
                })}>
                    {concertTypes.map(t => <option key={t}>{t}</option>)}
                </Form.Control>
            </Form.Group>
            <Form.Group>
                <Form.Label>Nom du concert :</Form.Label>
                <Form.Control type="text" value={concert.name} onChange={e => setConcert({
                    ...concert,
                    name: e.target.value
                })}/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Image :</Form.Label><br/>
                {concert.img ? <Image onClick={selectImage} src={concert.img} thumbnail style={{maxHeight:'200px'}} alt="Image introuvable"/> : <Button onClick={selectImage} variant="outline-secondary">Ajouter une image</Button>}
            </Form.Group>
            <Form.Group>
                <Form.Label>Informations supplémentaires (facultatif) :</Form.Label>
                <Form.Control as="textarea" rows={3} type="text" value={concert.info !== undefined ? concert.info : ''} onChange={e => setConcert({
                    ...concert,
                    info: e.target.value
                })}/>
            </Form.Group>
            <Form.Label>Détails (facultatifs) : </Form.Label><br/>
            {(concert.details && concert.details.artists && concert.details.artists.length) && <Card body>
                <Form.Label>Artistes :</Form.Label>
                {concert.details.artists.map((artist,artIndex) => <Card key={'artist-'+artIndex} body>
                    <Form.Group>
                        <Form.Label>Nom de l'artiste :</Form.Label>
                        <Form.Control type="text" value={artist.name} onChange={e => {
                            const newArtists = [...concert.details.artists]
                            newArtists[artIndex] = {
                                ...newArtists[artIndex],
                                name: e.target.value
                            }
                            setConcert({
                                ...concert,
                                details: {
                                    ...concert.details,
                                    artists: newArtists
                                }
                            })
                        }}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Instrument(s) de l'artiste :</Form.Label>
                        <Form.Control type="text" value={artist.instrument} onChange={e => {
                            const newArtists = [...concert.details.artists]
                            newArtists[artIndex] = {
                                ...newArtists[artIndex],
                                instrument: e.target.value
                            }
                            setConcert({
                                ...concert,
                                details: {
                                    ...concert.details,
                                    artists: newArtists
                                }
                            })
                        }}/>
                    </Form.Group>
                </Card>)}
            </Card>}
            <Button className="mt-2" variant="outline-secondary" onClick={e => {
                const newArtist = {
                    name: '',
                    instrument: ''
                }
                setConcert({
                    ...concert,
                    details: {
                        ...concert.details,
                        artists: (concert.details && concert.details.artists) ? [...concert.details.artists,newArtist] : [newArtist]
                    }
                })
            }}>Ajouter un artiste</Button>{' '}
            {(concert.details && concert.details.pieces && concert.details.pieces.length) && <Card body className="mt-2">
                <Form.Label>Œuvres :</Form.Label>
                {concert.details.pieces.map((piece,pIndex) => <Card key={'piece-'+pIndex} body>
                    <Form.Group>
                        <Form.Label>Titre de l'œuvre :</Form.Label>
                        <Form.Control key={'piece-title-'+pIndex} type="text" value={piece.title} onChange={e => {
                            const newPieces = [...concert.details.pieces]
                            newPieces[pIndex] = {
                                ...newPieces[pIndex],
                                title: e.target.value
                            }
                            setConcert({
                                ...concert,
                                details: {
                                    ...concert.details,
                                    pieces: newPieces
                                }
                            })
                        }}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Compositeur :</Form.Label>
                        <Form.Control type="text" value={piece.composer} onChange={e => {
                            const newPieces = [...concert.details.pieces]
                            newPieces[pIndex] = {
                                ...newPieces[pIndex],
                                composer: e.target.value
                            }
                            setConcert({
                                ...concert,
                                details: {
                                    ...concert.details,
                                    pieces: newPieces
                                }
                            })
                        }}/>
                    </Form.Group>
                </Card>)}
            </Card>}
            <Button className="mt-2" variant="outline-secondary" onClick={e => {
                const newPiece = {
                    composer: '',
                    title: ''
                }
                setConcert({
                    ...concert,
                    details: {
                        ...concert.details,
                        pieces: (concert.details && concert.details.pieces) ? [...concert.details.pieces,newPiece] : [newPiece]
                    }
                })
            }}>Ajouter une œuvre</Button>
            <hr/>
            <Button variant="primary" type="submit" disabled={!concert.name}>
                Valider
            </Button>
        </Form>
        <SelectImageModal show={imageModal} handleClose={() => setImageModal(false)} feedback={feedback} setImage={setImage} imageType="concerts"/>
    </Container>
}

function ConcertEdit(props) {
    const {concert,feedback,setConcert,getConcerts} = props

    const [occurrences, setOccurrences] = useState([])

    const getOccurences = () => {
        if (concert && concert._id) {
            axios.get('/concerts').then(res => setOccurrences(res.data.filter(c => c.concertId && c.concertId === concert._id).sort((a,b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`)))).catch(err => feedback.treatError(err))
        }
    }

    useEffect(getOccurences,[concert])

    const deleteOccurence = occ => {
        feedback.clear()
        axios.delete('/admin/concert/'+occ._id).then(res => {
            console.log(res)
            feedback.treatSuccess('Modifications effectuées !')
            getConcerts()
            getOccurences()
        }).catch(err => feedback.treatError(err))
    }

    return concert ? <Tabs variant="pills">
        <Tab eventKey="edit-concert" title="Éditer le concert">
            <ConcertInfo concert={concert} feedback={feedback} setConcert={setConcert} getConcerts={getConcerts}/>
        </Tab>
        <Tab eventKey="edit-occs" title="Éditer les occurences du concert" disabled={!concert._id || concert._id === 'new'}>
            <ConcertOccurences concert={concert} feedback={feedback} getConcerts={getConcerts} occurrences={occurrences} getOccurences={getOccurences} setOccurrences={setOccurrences} deleteOccurence={deleteOccurence}/>
        </Tab>
        <Tab variant="danger" eventKey="delete-concert" title="Supprimer le concert" disabled={!concert._id || concert._id === 'new'}>
            <DeleteConcert concert={concert} feedback={feedback} getConcerts={getConcerts} occurrences={occurrences} getOccurences={getOccurences} setOccurrences={setOccurrences} deleteOccurence={deleteOccurence}/>
        </Tab>
    </Tabs> : <p>Sélectionner un concert</p>
}

function DeleteConcert(props) {
    const {concert, getConcerts, occurrences, deleteOccurence} = props

    const deleteConcert = e => {
        occurrences.forEach(occ => {
            deleteOccurence(occ)
        })
        deleteOccurence(concert)
        getConcerts()
    }

    return <Container>
        <Form.Label className="text-danger"><strong>Attention !</strong><br/>Le concert <strong>{concert.name}</strong> et ses <strong>{occurrences.length}</strong> occurences seront perdues.</Form.Label><br/>
        <Button variant="danger" onClick={deleteConcert}>Supprimer le concert</Button>
    </Container>
}

function ConcertOccurences(props) {
    const {concert,feedback, getConcerts, occurrences, getOccurences, setOccurrences, deleteOccurence} = props

    const saveOccurence = occ => {
        feedback.clear()
        delete occ.modified
        delete occ.deleted
        axios.post('/admin/concerts',occ).then(res => {
            console.log(res)
            feedback.treatSuccess('Modifications effectuées !')
            getConcerts()
            getOccurences()
        }).catch(err => feedback.treatError(err))
    }

    const fields = [
        {
            fieldname: 'date',
            description: 'Date du concert',
            type: 'date'
        },
        {
            fieldname: 'time',
            description: 'Heure du concert',
            type: 'time'
        },
        {
            fieldname: 'city',
            description: 'Ville où a lieu le concert'
        },
        {
            fieldname: 'place',
            description: 'Endroit (exemple: Conservatoire de Paris) ou adresse'
        },
        {
            fieldname: 'info',
            description: 'Informations supplémentaires'
        },
        {
            fieldname: 'irUrl',
            description: 'Url info-réservations',
            type: 'url'
        },
        {
            type: 'url',
            fieldname : "photosUrl",
            description : "URL des éventuelles photos d'après concert"
        },
        {
            fieldname: 'cancel',
            description: 'Concert annulé',
            type : 'checkbox'
        },
        {
            fieldname: 'show',
            description: 'Mettre en avant',
            type : 'checkbox',
            default : true
        },
        {
            fieldname: 'deleted',
            description: 'Supprimer l\'occurence',
            type : 'checkbox'
        },
    ]

    return <Container>
        <Form onSubmit={e => {
            e.preventDefault()
            occurrences.filter(o => o.modified && !o.deleted).forEach(occ => saveOccurence(occ))
            occurrences.filter(o => o.deleted).forEach(occ => deleteOccurence(occ))
        }}>
            {occurrences.map((occ, index) => <div key={occ._id ? occ._id : 'key_'+index} className={occ.deleted ? 'bg-secondary' : undefined}>
                <Form.Label>Occurrence n°{index+1}</Form.Label>
                {fields.map(f => <Form.Group key={f.fieldname}>
                    {f.type === 'checkbox' ? <Form.Check type={f.type} label={f.description} checked={occ[f.fieldname] || false} onChange={e => {
                        const occs = [...occurrences]
                        occs[index] = {
                            ...occs[index],
                            [f.fieldname]: e.target.checked,
                            modified: true
                        }
                        setOccurrences(occs)
                    }}/> : <div>
                    <Form.Label>{f.description}</Form.Label>
                    <Form.Control type={f.type ? f.type :'text'} value={occ[f.fieldname] ? occ[f.fieldname] : ''} onChange={e => {
                        const occs = [...occurrences]
                        occs[index] = {
                            ...occs[index],
                            [f.fieldname]: e.target.value,
                            modified: true
                        }
                        setOccurrences(occs)
                    }
                    }/>
                    </div>}
                </Form.Group>)}
                <hr/>
            </div>)}
            <Button variant="outline-success" onClick={e => setOccurrences([...occurrences,{
                concertId: concert._id,
                show: true
            }])}>Ajouter une occurence</Button>
            <hr/>
            <Button variant="primary" type="submit">
                Valider
            </Button>
        </Form>
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
        Object.values(data).filter(el => el.modified && !el.deleted).forEach(el => {
            feedback.clear()
            delete el.modified
            delete el.deleted
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
        Object.values(data).filter(el => el.deleted).forEach(el => {
            feedback.clear()
            axios.delete('/admin/carousel/'+el._id).then(res => {
                console.log(res)
                feedback.treatSuccess('Modifications effectuées !')
                getData()
            }).catch(err => feedback.treatError(err))
        })
    }

    const [imageModal, setImageModal] = useState(false)

    const [selectedElement, setSelectedElement] = useState()

    const setImage = image => {
        setData({
            ...data,
            [selectedElement._id]: {
                ...selectedElement,
                modified: true,
                url: image
            }
        })
        setImageModal(false)
    }

    const showImageModal = carouselElement => {
        setSelectedElement(carouselElement)
        setImageModal(true)
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
                        {(carouselElement.title && !(carouselElement._id && carouselElement._id.startsWith('new'))) ? !carouselElement.deleted ? <Button className="mt-2" variant="danger" onClick={e => {
                            setData({
                                ...data,
                                [carouselElement._id]: {
                                    ...carouselElement,
                                    deleted: true
                                }
                            })
                        }}>Supprimer</Button> : <Alert className="mt-2" variant="warning"><strong>Attention !</strong> cet élément sera supprimé après validation. <Alert.Link onClick={e => {
                            setData({
                                ...data,
                                [carouselElement._id]: {
                                    ...carouselElement,
                                    deleted: false
                                }
                            })
                        }}>Annuler</Alert.Link> ?</Alert> : ''}
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
                        <Image src={carouselElement.url} thumbnail onClick={e => showImageModal(carouselElement)}/>
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
        <SelectImageModal show={imageModal} handleClose={() => setImageModal(false)} feedback={feedback} setImage={setImage}/>
    </Container>
}

function SelectImageModal(props) {
    const {show, handleClose, feedback, setImage, imageType} = props
    return <Modal size="lg" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
            <Modal.Title>Choisir une image</Modal.Title>
        </Modal.Header>
        <Modal.Body><Images feedback={feedback} selectImage={setImage} imageType={imageType}/></Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                Annuler
            </Button>
            <Button variant="primary" onClick={handleClose}>
                Utiliser ici
            </Button>
        </Modal.Footer>
    </Modal>
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
        const dbBioObject = {...biobject}
        if (biobject._id === 'new') {
            delete dbBioObject._id
        }
        axios.post('/admin/biographie',dbBioObject).then(res => {
            console.log(res)
            feedback.treatSuccess('Modifications effectuées !')
            getBioData()
        }).catch(err => feedback.treatError(err))
    }

    const deleteParagraph = p => {
        feedback.clear()
        axios.delete('/admin/biographie/'+p._id).then(res => {
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
            if (!p.paragraph && p._id !== 'new') {
                deleteParagraph(p)
            } else {
                setBioData(p)
            }
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
            <Form.Group key={p._id} className={(!p.paragraph && p._id !== 'new') ? 'bg-secondary' : undefined}>
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
                    index: Math.max(...Object.values(paragraphs).map(p => p.index))+1
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
            const link = {...l}
            if (l._id.startsWith('new')) {
                delete link._id
            }
            if (!l.name && l._id) {
                axios.delete('/admin/link/'+link._id).then(res => {
                    console.log(res)
                    feedback.treatSuccess('Modifications effectuées !')
                    getLinks()
                }).catch(err => feedback.treatError(err))
            } else {
                axios.post('/admin/links',link).then(res => {
                    console.log(res)
                    feedback.treatSuccess('Modifications effectuées !')
                    getLinks()
                }).catch(err => feedback.treatError(err))
            }
        })
    }

    return <Container>
        <Form onSubmit={submitForm}>
            {linkTypes.map(type => <Form.Group key={type[0]}>
                <Row><Form.Label>{type[1]}</Form.Label></Row>
            {Object.values(links).filter(link => link.type === type[0]).map(link => <Row className={(!link.name && !link._id.startsWith('new')) ? 'bg-secondary' : undefined} key={link._id}>
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
        const dbStudObject = {...studobject}
        if (studobject._id === 'new') {
            delete dbStudObject._id
        }
        axios.post('/admin/studies',dbStudObject).then(res => {
            console.log(res)
            feedback.treatSuccess('Modifications effectuées !')
            getStudData()
        }).catch(err => feedback.treatError(err))
    }

    const deleteStudData = studobject => {
        feedback.clear()
        axios.delete('/admin/studies/'+studobject._id).then(res => {
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
            if (!p.paragraph && p._id !== 'new') {
                deleteStudData(p)
            } else {
                setStudData(p)
            }
        })
        Object.values(awards).filter(a => a.modified).forEach(a => {
            if (!a.award && a._id !== 'new') {
                deleteStudData(a)
            } else {
                setStudData(a)
            }
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
            <Form.Group className={(!p.paragraph && p._id !== 'new') ? 'bg-secondary' : undefined} key={p._id}>
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
                    index: Math.max(...Object.values(paragraphs).map(p => p.index))+1
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
            <Form.Group className={(!p.award && p._id !== 'new') ? 'bg-secondary' : undefined} key={p._id}>
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
                    index: Math.max(...Object.values(awards).map(p => p.index))+1
                }
            })}>Ajouter une récompense</Button>}
            <hr/>
            <Button variant="primary" type="submit">
                Valider
            </Button>
        </Form>
    </Container>
}

function Repertory(props) {
    const [repertory, setRepertory] = useState([])

    const getRepertory = () => {
        axios.get('/repertory?raw').then(res => {
            setRepertory(res.data)
        })
    }

    useEffect(getRepertory,[])

    const titles = new Set(repertory.map(e => e.title))

    const feedback = props.feedback

    const saveRepertoryItem = rep => {
        feedback.clear()
        axios.post('/admin/repertory',rep).then(res => {
            console.log(res)
            feedback.treatSuccess('Modifications effectuées !')
            getRepertory()
        }).catch(err => feedback.treatError(err))
    }

    const deleteRepertoryItem = rep => {
        feedback.clear()
        axios.delete('/admin/repertory/'+rep._id).then(res => {
            console.log(res)
            feedback.treatSuccess('Modifications effectuées !')
            getRepertory()
        }).catch(err => feedback.treatError(err))
    }

    return <Container>
        <h2>Répertoire</h2>
        <Form onSubmit={e => {
            e.preventDefault()
            repertory.filter(rep => rep.modified && !rep.deleted).forEach(rep => {
                delete rep.modified
                const repCopy = {...rep}
                if (rep._id.startsWith('new')) {
                    delete repCopy._id
                }
                saveRepertoryItem(repCopy)
            })
            repertory.filter(rep => rep.deleted).forEach(rep => {
                deleteRepertoryItem(rep)
            })
        }}>
            {[...titles].map((title, titi) => <Card key={'title-'+titi} body>
            <Form.Control type="text" placeholder="Titre de section" value={title} onChange={e => {
                const repCopy = [...repertory]
                repertory.filter(rep => rep.title === title).forEach(rep => {
                    const index = repertory.findIndex(_rep => _rep._id === rep._id)
                    repCopy[index] = {
                        ...rep,
                        title: e.target.value,
                        modified: true
                    }
                    setRepertory(repCopy)
                })
            }}/>
                {[...new Set(repertory.filter(rep => rep.title === title).map(e => e.subtitle))].map((subtitle, tits) => <Card key={`subtitle-${titi}_${tits}`} body>
                    {((repertory.filter(rep => rep.title === title).map(e => e.subtitle)).filter(subtitle => subtitle !== undefined).length < 1) ? <Form.Label>{subtitle}</Form.Label> : <Form.Control type="text" placeholder="Titre de sous-section" value={subtitle ? subtitle : ''} onChange={e => {
                        const repCopy = [...repertory]
                        repertory.filter(rep => rep.title === title && rep.subtitle === subtitle).forEach(rep => {
                            const index = repertory.findIndex(_rep => _rep._id === rep._id)
                            repCopy[index] = {
                                ...rep,
                                subtitle: e.target.value,
                                modified: true
                            }
                            setRepertory(repCopy)
                        })
                    }}/>}
                    <ListGroup>
                        {repertory.filter(rep => rep.title === title && rep.subtitle === subtitle).map(rep => <ListGroup.Item variant={rep.deleted ? 'danger' : undefined} key={rep._id}>
                            <Form.Control type="text" placeholder="Élément de répertoire" disabled={rep.deleted} value={rep.content} onChange={e => {
                                const repCopy = [...repertory]
                                const index = repertory.findIndex(_rep => _rep._id === rep._id)
                                repCopy[index] = {
                                    ...rep,
                                    content: e.target.value,
                                    modified: true
                                }
                                setRepertory(repCopy)
                            }}/>{!rep.deleted && <Button variant="danger" onClick={e => {
                                const repCopy = [...repertory]
                                const index = repertory.findIndex(_rep => _rep._id === rep._id)
                                repCopy[index] = {
                                    ...rep,
                                    deleted: true
                                }
                                setRepertory(repCopy)
                            }}>Supprimer</Button>}
                        </ListGroup.Item>)}
                    </ListGroup>
                    <Button className="mt-2" variant="outline-success" onClick={e => {
                        const newPiece = {
                            _id: `new_${repertory.length+1}`,
                            title,
                            subtitle,
                            content: '',
                            index: repertory[repertory.length-1].index+1,
                            modified: true
                        }
                        setRepertory([...repertory,newPiece])
                    }}>Ajouter une œuvre</Button>
                </Card>)}
                <Button className="mt-2" variant="outline-info" onClick={e => {
                    const newPiece = {
                        _id: `new_${repertory.length+1}`,
                        title,
                        subtitle: '',
                        content: '',
                        index: repertory[repertory.length-1].index+1,
                        modified: true
                    }
                    setRepertory([...repertory,newPiece])
                }}>Ajouter une sous-section</Button>
            </Card>)}
            <Button className="mt-2" variant="outline-warning" onClick={e => {
                const newPiece = {
                    _id: `new_${repertory.length+1}`,
                    title: '',
                    content: '',
                    index: repertory[repertory.length-1].index+1,
                    modified: true
                }
                setRepertory([...repertory,newPiece])
            }}>Ajouter une section</Button>
            <hr/>
            <Button variant="primary" type="submit">
                Valider
            </Button>
        </Form>
    </Container>
}

function VideoFormGroup(props) {
    const {video, setVideo} = props

    const [useList,setUseList] = useState(video.list.length > 0)

    const [notFound,setNotFound] = useState(false)

    useEffect(() => {
        setNotFound(false)
    },[video.url])

    const getThumbnail = () => {
        setNotFound(false)
        const parsed = new URL(video.url)
        if (parsed.hostname === 'vimeo.com') {
            const id_vimeo = parsed.pathname
            fetch(`https://vimeo.com/api/v2/video${id_vimeo}.json`).then(res => res.json()).then(res => setVideo({
                ...video,
                title:(!video.title && res[0].title) ? res[0].title : video.title,
                description:(!video.description && res[0].description) ? res[0].description : video.description,
                img: res[0].thumbnail_large
            })).catch(err => {
                console.error(err)
                setNotFound(true)
            })
        } else if (parsed.hostname === 'www.youtube.com') {
            fetch(`https://www.youtube.com/oembed?url=${video.url}`).then(res => res.json()).then(res => res.thumbnail_url ? setVideo({
                ...video,
                title:(!video.title && res.title) ? res.title : video.title,
                img: res.thumbnail_url
            }) : setNotFound(true)).catch(err => {
                console.error(err)
                setNotFound(true)
            })
        } else {
            fetch(`https://noembed.com/embed?url=${video.url}`).then(res => res.json()).then(res => res.thumbnail_url ? setVideo({
                ...video,
                title:(!video.title && res.title) ? res.title : video.title,
                img: res.thumbnail_url
            }) : setNotFound(true)).catch(err => {
                console.error(err)
                setNotFound(true)
            })
        }
    }

    return <div className={video.deleted ? "bg-secondary" : undefined}>
        <Form.Label>{`Vidéo n°${video.index}`}</Form.Label><br/>
        <Button variant={video.deleted ? 'warning' : "danger"} onClick={e => setVideo({
            ...video,
            deleted: !video.deleted
        })}>{video.deleted ? 'Annuler la suppression' : 'Supprimer'}</Button>
        <Form.Group>
            <Form.Label>Url de la vidéo</Form.Label>
            <Form.Control type="url" onChange={e => setVideo({
                ...video,
                url: e.target.value
            })} value={video.url}/>
            {!video.img && <div><Button onClick={() => getThumbnail()} disabled={!video.url}>Remplir automatiquement</Button>{notFound && <Alert variant="warning">Impossible de remplir automatiquement.</Alert>}</div>}
        </Form.Group>
        <Form.Group>
            <Form.Label>Titre</Form.Label>
            <Form.Control type="text" onChange={e => setVideo({
                ...video,
                title: e.target.value
            })} value={video.title}/>
        </Form.Group>
        <Form.Group>
            <Form.Label>Sous-titre</Form.Label>
            <Form.Control type="text" onChange={e => setVideo({
                ...video,
                subtitle: e.target.value
            })} value={video.subtitle}/>
        </Form.Group>
        <Form.Group>
            <Row>
                <Col><Form.Label>Image</Form.Label></Col>
                {video.img && <Col><Image src={video.img} thumbnail fluid className="float-right"/></Col>}
            </Row>
            <Form.Control type="url" onChange={e => setVideo({
                ...video,
                img: e.target.value
            })} value={video.img}/>
        </Form.Group>
        <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control type="text" as={useList ? 'input' : "textarea"} rows="3" onChange={e => setVideo({
                ...video,
                description: e.target.value
            })} value={video.description}/>
            <Form.Check type="checkbox" label="Utiliser une liste" checked={useList} onChange={e => {
                setUseList(e.target.checked)
                if (!e.target.checked) {
                    setVideo({
                        ...video,
                        list: []
                    })
                } else {
                    setVideo({
                        ...video,
                        list: ['']
                    })
                }
            }}/>
        </Form.Group>
        {useList && <Form.Group>
            <Form.Label>Liste</Form.Label>
            <ListGroup>
                {video.list.map((li,index) => <ListGroup.Item key={index}><Form.Control type="text" value={li} onChange={e => {
                    const newList = [...video.list]
                    newList[index] = e.target.value
                    setVideo({
                        ...video,
                        list: newList
                    })
                }}/></ListGroup.Item>)}
            </ListGroup>
            <Button className="mt-2" variant="outline-success" onClick={e => setVideo({
                ...video,
                list: [...video.list,'']
            })}>Ajouter un élément de liste</Button>
        </Form.Group>}
        <hr/>
    </div>
}

function Videos(props) {
    const feedback = props.feedback

    const [videos,setVideos] = useState([])

    const getVideos = () => {
        axios.get('/videos').then(res => {
            setVideos(res.data)
        }).catch(err => feedback.treatError(err))
    }

    const [updated,setUpdated] = useState({})

    const markUpdated = index => {
        setUpdated({
            ...updated,
            [index]: (updated[index] !== undefined) ? (updated[index]+1) : 1
        })
    }

    const setVideo = (index,video) => {
        const modifsVideo = [...videos]
        if (!video.alt && video.title) {
            video.alt = video.title
        }
        modifsVideo[index] = video
        setVideos(modifsVideo)
        markUpdated(index)
    }

    useEffect(getVideos,[])

    const saveVideo = video => {
        feedback.clear()
        axios.post('/admin/video',video).then(res => {
            console.log(res)
            feedback.treatSuccess('Modifications effectuées !')
            getVideos()
            setUpdated(Object.keys(videos).reduce((acc,curr) => {
                return {
                    ...acc,
                    [curr]: 0
                }
            },{}))
        }).catch(err => feedback.treatError(err))
    }

    const deleteVideo = video => {
        feedback.clear()
        axios.delete('/admin/video/'+video._id).then(res => {
            console.log(res)
            feedback.treatSuccess('Modifications effectuées !')
            getVideos()
            setUpdated(Object.keys(videos).reduce((acc,curr) => {
                return {
                    ...acc,
                    [curr]: 0
                }
            },{}))
        }).catch(err => feedback.treatError(err))
    }
    
    return <Container>
        <Form onSubmit={e => {
            e.preventDefault()
            Object.entries(updated).filter(e => e[1]).forEach(e => {
                const video = videos[e[0]]
                if (video.deleted) {
                    deleteVideo(video)
                } else {
                    delete video.deleted
                    saveVideo(video)
                }
            })
        }}>
            {videos.map((video, index) => <VideoFormGroup key={video._id ? video._id : index} video={video} setVideo={setVideo.bind(null,index)}/>)}
            <Button className="mt-2" variant="outline-info" onClick={e => {
                const newVideo = {
                    url: '',
                    title: '',
                    subtitle: '',
                    img: '',
                    alt: '',
                    description: '',
                    index: videos[videos.length-1].index+1,
                    list: []
                }
                setVideos([...videos,newVideo])
            }}>Ajouter une vidéo</Button>
            <hr/>
            <Button variant="primary" type="submit">
                Valider
            </Button>
        </Form>
    </Container>
}

function Newsletter(props) {
    const [subscribers,setSubscribers] = useState([])
    const [newsletter,setNewsletter] = useState({
        to: '',
        message: '<Corps du message...>\n\nPour vous désinscrire, cliquez ici ou allez sur https://nicolasdross.fr/unsubscribe.'
    })

    const {feedback} = props

    const getSubscribers = () => {
        axios.get('/admin/newsletter').then(res => setSubscribers(res.data)).catch(err => feedback.treatError(err))
    }

    useEffect(getSubscribers,[])

    return <Container>
        <h2>Newsletter</h2>
        <h3>Envoyer une newsletter</h3>
        <Form onSubmit={e => {
            e.preventDefault()
            axios.post('/admin/newsletter',newsletter).then(res => {
                console.log(res.data)
                newsletter.attention = `Ce message n'a pas vraiment été envoyé. Cela viendra bientôt !`
                feedback.treatVariant('info',newsletter)
            }).catch(err => feedback.treatError(err))
        }}>
            <Form.Group>
                <Form.Label>Envoyer à :</Form.Label>
                <InputGroup>
                    <Form.Control type="text" placeholder="Liste d'emails à qui envoyer la newsletter" value={newsletter.to} onChange={e => setNewsletter({
                        ...newsletter,
                        to: e.target.value
                    })}/>
                    <InputGroup.Append>
                        <Button variant="outline-success" onClick={e => setNewsletter({
                            ...newsletter,
                            to: subscribers.filter(sub => !sub.skip && !sub.unsubscribed).map(n => n.email).join('; ')
                        })}>Remplir</Button>
                    </InputGroup.Append>
                </InputGroup>
            </Form.Group>
            <Form.Group>
                <Form.Control as="textarea" rows={5} type="text" placeholder="Texte de la newsletter..." value={newsletter.message} onChange={e => setNewsletter({
                    ...newsletter,
                    message: e.target.value
                })}/>
            </Form.Group>
            <Button variant="primary" type="submit" disabled={!newsletter.to || ! newsletter.message}>
                Envoyer
            </Button>
        </Form>
        <hr/>
        <h3>Liste des personnes inscrites aux newsletters :</h3>
        <div style={{overflow: "scroll"}}>
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Actions</th>
                    <th>Email</th>
                    <th>IP</th>
                    <th>Date</th>
                    <th>Lieu</th>
                </tr>
            </thead>
            <tbody>
                {subscribers.map((sub, index) =><tr key={sub._id}>
                    <td>
                        <DropdownButton id="dropdown-basic-button" title="Actions" variant="info">
                            <Dropdown.Item onClick={e => {
                                axios.delete('/admin/newsletter/'+sub._id).then(res => {
                                    if (res.data && res.data.removed === 1) {
                                        feedback.treatSuccess('Email supprimé')
                                    } else {
                                        feedback.treatError('Erreur de suppression')
                                    }
                                    getSubscribers()
                                }).catch(err => feedback.treatError(err))
                            }}>Supprimer</Dropdown.Item>
                            <Dropdown.Item onClick={e => {
                                axios.delete('/admin/newsletter/byip/'+sub.ip).then(res => {
                                    if (res.data && res.data.removed) {
                                        feedback.treatSuccess(res.data.removed+' emails supprimés')
                                    } else {
                                        feedback.treatError('Erreur de suppression')
                                    }
                                    getSubscribers()
                                }).catch(err => feedback.treatError(err))
                            }}>Supprimer tout IP</Dropdown.Item>
                            {!sub.unsubscribed && <Dropdown.Item onClick={e => {
                                subCopy = [...subscribers]
                                subCopy[index] = {
                                    ...sub,
                                    skip: !sub.skip
                                }
                                setSubscribers(subCopy)
                            }}>{sub.skip ? 'Sélectionner' : 'Désélectionner'}</Dropdown.Item>}
                        </DropdownButton>
                    </td>
                    <td className={sub.unsubscribed ? 'bg-warning' : sub.skip ? 'bg-secondary' : "bg-success text-white"}>{sub.email}</td>
                    <td>{sub.ip}</td>
                    <td>{formatDate(new Date(sub.date))}</td>
                    <td>{sub.ipInfos ? `${sub.ipInfos.city}, ${sub.ipInfos.regionName}, ${sub.ipInfos.country}` : 'Introuvable'}</td>
                </tr>)}
            </tbody>
        </Table>
        </div>
    </Container>
}

function Content(props) {
    const startPage = () => window.location.hash ? window.location.hash.replace('#','') : 'messages'

    if (!window.location.hash) {
        window.location.hash = startPage()
    }

    const [activePage, setActivePage] = useState(startPage())

    const [showToast, setShowToast] = useState(false)
    const [toastData, setToastData] = useState({})

    const checkToken = () => {
        axios.get('/admin/tokenvalid').then(res => {
            if (res.data && res.data.expMin && res.data.expMin < 6) {
                setToastData(res.data)
                setShowToast(true)
            }
        }).catch(err => feedback.treatError(err))
    }

    useEffect(() => {
        const interval = setInterval(checkToken,60*1000)
        window.addEventListener("hashchange", () => {
            setActivePage(startPage())
        }, false)
        return () => {
            clearInterval(interval)
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
        case 'images':
            component = <Images feedback={feedback}/>
            break
        case 'newsletter':
            component = <Newsletter feedback={feedback}/>
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
        <Container>
        <Toast show={showToast} onClose={() => setShowToast(false)} style={{position: 'fixed',top: 10}} delay={9000} autohide>
            <Toast.Header>
                <strong className="mr-auto">Attention !</strong>
                <small>{toastData.username}</small>
            </Toast.Header>
            <Toast.Body>
                <p>Le token de session ne sera plus valide dans <strong>{Math.floor(toastData.expMin)}</strong> minutes.</p>
                <p>Pensez à bien sauvegarder votre travail, ou vous déconnecter et vous reconnecter avant de continuer.</p>
            </Toast.Body>
        </Toast>
        </Container>
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
                window.location.reload()
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