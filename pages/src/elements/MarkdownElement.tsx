import { SolidMarkdown } from 'solid-markdown'

type Props = {
    markdown: string
}

export default (props: Props) => {
    return (
        <>
            <SolidMarkdown children={props.markdown}/>
        </>
    )
}
