import { Match, Switch } from 'solid-js'
import TextElement from './TextElement'
import ImageElement from './ImageElement'
import VideoElement from './VideoElement'
import MarkdownElement from './MarkdownElement'

export enum ElementType {
    TEXT,
    IMAGE,
    VIDEO,
    MARKDOWN
}

type VideoType = {
    url: string
    thumbUrl: string
}

type ElementInterface = Record<'text' | 'image' | 'video' | 'markdown', string[] | string | VideoType>

type Props = {
    element: ElementInterface
}

export default (props: Props) => (
    <div>
        <Switch fallback={'No component ' + Object.keys(props.element) + ' found.'}>
            <Match when={!props.element}>Error: no element provided.</Match>
            <Match when={Object.keys(props.element).includes('text')}>
                <TextElement paragraphs={props.element.text as string[]} />
            </Match>
            <Match when={Object.keys(props.element).includes('image')}>
                <ImageElement url={props.element.image as string} />
            </Match>
            <Match when={Object.keys(props.element).includes('video')}>
                <VideoElement
                    url={(props.element.video as VideoType).url}
                    thumbUrl={(props.element.video as VideoType).thumbUrl}
                />
            </Match>
            <Match when={Object.keys(props.element).includes('markdown')}>
                <MarkdownElement markdown={props.element.markdown as string} />
            </Match>
        </Switch>
    </div>
)
