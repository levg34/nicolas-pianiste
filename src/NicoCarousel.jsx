const { Carousel } = ReactBootstrap
const { useState, useEffect } = React

function NicoCarousel(props) {
    const [data, setData] = useState([])

    const getData = () => {
        axios.get('/carousel').then(res => setData(res.data)).catch(err => console.error(err))
    }

    useEffect(getData,[])

    return <Carousel fade>
    {data.map(ci => <Carousel.Item key={ci._id}>
        <img
            className="d-block w-100"
            src={ci.url}
            alt="First slide"
        />
        <Carousel.Caption>
            <h3>{ci.title}</h3>
            <p className="d-none d-sm-block">{ci.description}</p>
        </Carousel.Caption>
    </Carousel.Item>)}
</Carousel>
}