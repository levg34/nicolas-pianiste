import { SolidMarkdown } from 'solid-markdown'
import './MarkdownElement.css'

type Props = {
    markdown: string
}

export default (props: Props) => {
    return (
        <div class="markdown-content">
            <SolidMarkdown children={props.markdown}/>
        </div>
    )
}
