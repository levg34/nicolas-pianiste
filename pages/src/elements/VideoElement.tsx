type Props = {
    url: string
    thumbUrl: string
}

export default (props: Props) => (
    <a href={props.url} target="_blank">
        <div style="position: relative; width: 100%">
            <img style="width: 100%" src={props.thumbUrl} />
            <span style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 1">▶</span>
        </div>
    </a>
)
