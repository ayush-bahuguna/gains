import { useParams } from 'react-router-dom'
import { SessionDetailView } from '../components/SessionDetailView'

export function SessionDetails() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null
  return <SessionDetailView sessionId={id} variant="history" />
}
