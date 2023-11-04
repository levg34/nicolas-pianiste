import { For, Match, Switch, createResource } from 'solid-js'

type Props = {
    paragraphs: string[]
}

export default (props: Props) => {
    return (
        <>
            <For each={props.paragraphs}>{(paragraph) => <p>{paragraph}</p>}</For>
        </>
    )
}
