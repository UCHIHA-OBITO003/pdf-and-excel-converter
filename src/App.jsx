import { useState } from 'react'
import './App.css'
import DataConverter from './components/DataConverter'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>PDF & Excel Converter</h1>
        <p>Convert backend data to Excel and PDF formats</p>
      </header>
      <main>
        <DataConverter />
      </main>
    </div>
  )
}

export default App