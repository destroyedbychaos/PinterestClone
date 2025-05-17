import { useState } from 'react'
import "./App.css";
import { BrowserRouter } from 'react-router-dom'
import BasicRoute from './routes/BasicRoute'

function App() {
  return (
      <BrowserRouter>
          <BasicRoute />
      </BrowserRouter>
  )
}

export default App
