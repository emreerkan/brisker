import { BeziqueScoreKeeper } from '@/components/BeziqueScoreKeeper'
import { LanguageProvider } from '@/i18n/LanguageContext'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <BeziqueScoreKeeper />
    </LanguageProvider>
  )
}

export default App
