import { Component, For } from 'solid-js'
import { Breadcrumb, Carousel, Col, Container, Row, Stack } from 'solid-bootstrap'
import Element from './elements/Element'
import data from '../pages.json'
import { prepareForDisplay } from './utils'

type Props = {
    pageName: string
    headerImageUrl: string
}

const App: Component<Props> = (props: Props) => {
    return (
        <Stack style="background-color: black">
            <Carousel controls={false} indicators={false}>
                <Carousel.Item>
                    <div
                        class="d-block w-100 bg-secondary d-flex justify-content-center align-items-center"
                        style={{ height: document.body.clientWidth * (2 / 9) }}
                    >
                        <img src={props.headerImageUrl} height="100%" width="100%" />
                    </div>
                </Carousel.Item>
            </Carousel>
            <Container style="background-color: lightgrey" class="mt-3 pt-2">
                <For each={prepareForDisplay(data)}>
                    {(elements) => (
                        <>
                            <Row>
                                <Col sm>
                                    <Element element={elements[0]} />
                                </Col>
                                <Col sm>
                                    <Element element={elements[1]} />
                                </Col>
                            </Row>
                            <hr />
                        </>
                    )}
                </For>
                <Breadcrumb>
                    <Breadcrumb.Item href="/">Accueil</Breadcrumb.Item>
                    <Breadcrumb.Item active>{props.pageName}</Breadcrumb.Item>
                </Breadcrumb>
            </Container>
        </Stack>
    )
}

export default App
