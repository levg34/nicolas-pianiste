import { Component, For, Show, createResource } from 'solid-js'
import { Breadcrumb, Carousel, Col, Container, Row, Spinner, Stack } from 'solid-bootstrap'
import Element from './elements/Element'
import data from '../pages.json'
import { prepareForDisplay } from './utils'
import { useParams } from '@solidjs/router'

type Props = {}

export interface PageData {
    headerImageUrl: string;
    pageName:       string;
    data:           Datum[];
}

export interface Datum {
    text?:  string[];
    image?: string;
    video?: Video;
}

export interface Video {
    url:      string;
    thumbUrl: string;
}

const getPageData = async (pageId: string): Promise<PageData> => {
    return data
}

const Page: Component<Props> = (props: Props) => {
    const params = useParams()
    const pageId = params.pageId

    const [pageData] = createResource(pageId, getPageData)

    return (
        <Stack style="background-color: black">
            <Carousel controls={false} indicators={false}>
                <Carousel.Item>
                    <div
                        class="d-block w-100 bg-secondary d-flex justify-content-center align-items-center"
                        style={{ height: document.body.clientWidth * (2 / 9) + '' }}
                    >
                        <img src={pageData()?.headerImageUrl} height="100%" width="100%" />
                    </div>
                </Carousel.Item>
            </Carousel>
            <Container style="background-color: lightgrey" class="mt-3 pt-2">
                <For each={prepareForDisplay(pageData()?.data ?? [])}>
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
                <Show when={pageData.loading}><Spinner animation="border" variant="primary" /></Show>
                <Show when={pageData.error}>Error: {pageData.error}</Show>
                <Breadcrumb>
                    <Breadcrumb.Item href="/">Accueil</Breadcrumb.Item>
                    <Breadcrumb.Item active>{pageData()?.pageName}</Breadcrumb.Item>
                </Breadcrumb>
            </Container>
        </Stack>
    )
}

export default Page
