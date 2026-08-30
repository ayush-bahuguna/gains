import { IconDumbbell } from '../../components/icons'
import { TemplateCard } from '../../components/TemplateCard'

export function TemplateCardCheck() {
  return (
    <div className="mx-auto max-w-[480px] space-y-3 bg-paper p-6">
      <h1 className="mb-3 text-2xl font-bold">Template Card (§16)</h1>

      <TemplateCard
        icon={<IconDumbbell className="h-4 w-4" />}
        title="Push Day"
        description="Classic push-day split hitting chest, shoulders, and triceps."
        exerciseCount={6}
      />
    </div>
  )
}
