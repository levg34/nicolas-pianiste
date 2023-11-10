import { Route, Router, Routes } from '@solidjs/router'
import { Component } from 'solid-js'
import Page from './Page'

const App: Component = () => {
    return <Router>
        <Routes>
            <Route path="/" element={<div>Nothing to see here</div>}/>
            <Route path="/pages/:pageId" element={<Page />}/>
        </Routes>
    </Router>
}

export default App
