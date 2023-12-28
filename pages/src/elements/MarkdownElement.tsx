import { SolidMarkdown } from 'solid-markdown'
import remarkGfm from 'remark-gfm'
import './MarkdownElement.css'

type Props = {
    markdown: string
}

export default (props: Props) => {
    return (
        <div class="markdown-content">
            <SolidMarkdown remarkPlugins={[remarkGfm]} children={props.markdown}/>
        </div>
    )
}
