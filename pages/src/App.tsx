import { Route, Router, Routes } from '@solidjs/router'
import { Component } from 'solid-js'
import Page from './Page'

const App: Component = () => {
    return <Router>
        <Routes>
            <Route path="/pages/:pageId" element={<Page />}/>
            <Route path="*" element={<div>Nothing to see here</div>}/>
        </Routes>
    </Router>
}

export default App
