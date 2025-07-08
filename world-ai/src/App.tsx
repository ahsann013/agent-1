
import './App.css'
import AppRouter from './routes'
import { ThemeProvider } from './components/theme/theme-provider'
function App() {

  return (
    <>
      <ThemeProvider>
        <AppRouter/>
      </ThemeProvider>
    </>
  )
}

export default App
