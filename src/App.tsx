import { Navigate, Route, Routes } from 'react-router-dom'
import { HistoryList } from './screens/HistoryList'
import { JournalHome } from './screens/JournalHome'
import { Me } from './screens/Me'
import { TemplatesList } from './screens/TemplatesList'
import { ButtonsCheck } from './screens/dev/ButtonsCheck'
import { IconsCheck } from './screens/dev/IconsCheck'
import { CardsCheck } from './screens/dev/CardsCheck'
import { ChipsCheck } from './screens/dev/ChipsCheck'
import { InputsCheck } from './screens/dev/InputsCheck'
import { TablesCheck } from './screens/dev/TablesCheck'
import { BottomNavCheck } from './screens/dev/BottomNavCheck'

function App() {
  return (
    <Routes>
      <Route index element={<Navigate to="/journal" replace />} />
      <Route path="/journal" element={<JournalHome />} />
      <Route path="/templates" element={<TemplatesList />} />
      <Route path="/history" element={<HistoryList />} />
      <Route path="/me" element={<Me />} />
      {/* Dev-only, one-component-at-a-time checkpoints — not linked from the app */}
      <Route path="/_dev/icons" element={<IconsCheck />} />
      <Route path="/_dev/buttons" element={<ButtonsCheck />} />
      <Route path="/_dev/inputs" element={<InputsCheck />} />
      <Route path="/_dev/chips" element={<ChipsCheck />} />
      <Route path="/_dev/cards" element={<CardsCheck />} />
      <Route path="/_dev/tables" element={<TablesCheck />} />
      <Route path="/_dev/bottomnav" element={<BottomNavCheck />} />
    </Routes>
  )
}

export default App
