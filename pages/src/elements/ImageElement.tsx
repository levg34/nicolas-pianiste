type Props = {
    url: string
}

export default (props: Props) => (
    <>
        <img style="width: 100%" src={props.url} />
    </>
)
