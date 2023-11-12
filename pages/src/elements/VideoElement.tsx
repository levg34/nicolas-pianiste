import { SolidPlyr } from 'solid-plyr'
// import 'solid-plyr/dist/esm/index.css.map'

type Props = {
    url: string
    thumbUrl: string
}

export default (props: Props) => (
    // <div style="position: relative; width: 100%">
    <SolidPlyr
        source={{
            type: 'video',
            // sources: [
            //     {
            //         src: props.url
            //     }
            // ]
            sources: [
                {
                    src: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
                    type: 'video/mp4',
                    size: 720
                },
                {
                    src: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
                    type: 'video/mp4',
                    size: 1080
                }
            ]
        }}
    />
    // </div>
)
