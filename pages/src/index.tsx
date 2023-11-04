/* @refresh reload */
import { render } from 'solid-js/web'

import App from './App'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
    )
}

render(
    () => (
        <App headerImageUrl="https://nicolasdross.fr/uploads/15d0b22a39ff686e73991ef52d5c9d76" pageName="Duo d'Oro" />
    ),
    root!
)
