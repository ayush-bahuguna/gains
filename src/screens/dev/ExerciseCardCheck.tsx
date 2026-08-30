import { ExerciseCard } from '../../components/ExerciseCard'

export function ExerciseCardCheck() {
  return (
    <div className="mx-auto max-w-[480px] space-y-3 bg-paper p-6">
      <h1 className="mb-3 text-2xl font-bold">Exercise Card (§20)</h1>

      <ExerciseCard
        name="Bench Press"
        imageUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23c9c2b4'/%3E%3C/svg%3E"
        primaryMuscle="chest"
        equipment="barbell"
      />
      <ExerciseCard name="Pull-Up" imageUrl={null} primaryMuscle="back" equipment="bodyweight" />
      <ExerciseCard name="Farmer's Carry" imageUrl={null} primaryMuscle={null} equipment={null} />
    </div>
  )
}
