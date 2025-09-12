import { Brisker } from '@/components/Brisker'
import { LanguageProvider } from '@/i18n/LanguageContext'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <Brisker />
    </LanguageProvider>
  )
}

export default App
