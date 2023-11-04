import { Route, Router, Routes } from '@solidjs/router'
import { Component } from 'solid-js'
import Page from './Page'

const App: Component = () => {
    return <Router>
        <Routes>
            <Route path="/" element={<div>Nothing to see here</div>}/>
            <Route path="/pages/:pageId" element={<Page headerImageUrl="https://nicolasdross.fr/uploads/15d0b22a39ff686e73991ef52d5c9d76" pageName="Duo d'Oro" />}/>
        </Routes>
    </Router>
}

export default App
