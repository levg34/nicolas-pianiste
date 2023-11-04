import { Match, Switch } from 'solid-js'
import TextElement from './TextElement'
import ImageElement from './ImageElement'

export enum ElementType {
    TEXT,
    IMAGE,
    VIDEO
}

type ElementInterface = Record<'text' | 'image' | 'video', string[] | string | { url: string; thumbUrl: string }>

type Props = {
    element: ElementInterface
}

export default (props: Props) => (
    <div>
        <Switch fallback={'No component ' + Object.keys(props.element) + ' found.'}>
            <Match when={Object.keys(props.element).includes('text')}>
                <TextElement paragraphs={props.element.text as string[]} />
            </Match>
            <Match when={Object.keys(props.element).includes('image')}>
                <ImageElement url={props.element.image as string} />
            </Match>
        </Switch>
    </div>
)
