import { NotesBox } from '../../components/NotesBox'

export function NotesCheck() {
  return (
    <div className="mx-auto max-w-[480px] space-y-6 bg-paper p-6">
      <h1 className="text-2xl font-bold">Notes Box (§13)</h1>

      <NotesBox defaultValue={'Felt strong on bench today.\nFocus on controlled reps.\nGood pump!'} />
    </div>
  )
}
