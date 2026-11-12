import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'
import './index.css'
import App from './App'

// No <StrictMode>: drei's <Html> mounts nested React roots, and StrictMode's dev double-mount
// races their teardown in React 19, leaving some room pins permanently unmounted.
createRoot(document.getElementById('root')).render(<App />)
