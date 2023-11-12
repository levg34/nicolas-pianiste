type Props = {
    url: string
    thumbUrl: string
}

export default (props: Props) => (
    <a href={props.url} target="_blank">
        <img style="width: 100%" src={props.thumbUrl} />
    </a>
)
