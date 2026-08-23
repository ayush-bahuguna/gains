import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { ActiveSession } from './screens/ActiveSession'
import { HistoryList } from './screens/HistoryList'
import { JournalHome } from './screens/JournalHome'
import { Me } from './screens/Me'
import { SessionDetails } from './screens/SessionDetails'
import { SessionSummary } from './screens/SessionSummary'
import { TemplatesList } from './screens/TemplatesList'
import { ButtonsCheck } from './screens/dev/ButtonsCheck'
import { IconsCheck } from './screens/dev/IconsCheck'
import { CardsCheck } from './screens/dev/CardsCheck'
import { ChipsCheck } from './screens/dev/ChipsCheck'
import { InputsCheck } from './screens/dev/InputsCheck'
import { TablesCheck } from './screens/dev/TablesCheck'
import { BottomNavCheck } from './screens/dev/BottomNavCheck'
import { SmallElementsCheck } from './screens/dev/SmallElementsCheck'
import { ProgressCheck } from './screens/dev/ProgressCheck'
import { NotesCheck } from './screens/dev/NotesCheck'
import { AlertsCheck } from './screens/dev/AlertsCheck'
import { EmptyStatesCheck } from './screens/dev/EmptyStatesCheck'
import { TemplateCardCheck } from './screens/dev/TemplateCardCheck'
import { MiscCheck } from './screens/dev/MiscCheck'
import { VoiceCheck } from './screens/dev/VoiceCheck'
import { KitchenSink } from './screens/dev/KitchenSink'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/journal" replace />} />
        <Route
          path="/journal"
          element={
            <RequireAuth>
              <JournalHome />
            </RequireAuth>
          }
        />
        <Route
          path="/templates"
          element={
            <RequireAuth>
              <TemplatesList />
            </RequireAuth>
          }
        />
        <Route
          path="/history"
          element={
            <RequireAuth>
              <HistoryList />
            </RequireAuth>
          }
        />
        <Route
          path="/history/:id"
          element={
            <RequireAuth>
              <SessionDetails />
            </RequireAuth>
          }
        />
        <Route path="/me" element={<Me />} />
        <Route
          path="/session/:id"
          element={
            <RequireAuth>
              <ActiveSession />
            </RequireAuth>
          }
        />
        <Route
          path="/session/:id/summary"
          element={
            <RequireAuth>
              <SessionSummary />
            </RequireAuth>
          }
        />
      </Route>
      {/* Dev-only, one-component-at-a-time checkpoints — not linked from the app */}
      <Route path="/_dev/icons" element={<IconsCheck />} />
      <Route path="/_dev/buttons" element={<ButtonsCheck />} />
      <Route path="/_dev/inputs" element={<InputsCheck />} />
      <Route path="/_dev/chips" element={<ChipsCheck />} />
      <Route path="/_dev/cards" element={<CardsCheck />} />
      <Route path="/_dev/tables" element={<TablesCheck />} />
      <Route path="/_dev/bottomnav" element={<BottomNavCheck />} />
      <Route path="/_dev/small" element={<SmallElementsCheck />} />
      <Route path="/_dev/progress" element={<ProgressCheck />} />
      <Route path="/_dev/notes" element={<NotesCheck />} />
      <Route path="/_dev/alerts" element={<AlertsCheck />} />
      <Route path="/_dev/empty" element={<EmptyStatesCheck />} />
      <Route path="/_dev/templatecard" element={<TemplateCardCheck />} />
      <Route path="/_dev/misc" element={<MiscCheck />} />
      <Route path="/_dev/voice" element={<VoiceCheck />} />
      <Route path="/_dev/components" element={<KitchenSink />} />
    </Routes>
  )
}

export default App
