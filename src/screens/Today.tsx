import { navigate } from '../app/navigate'
import { dailyPrompt, pages } from '../data/pages'
import { Button, PromptCard } from '../ui'
import { MainLayout } from './MainLayout'
import { PagePurpose } from './PagePurpose'

export function Today() {
  return (
    <MainLayout title={pages.today.title} activeTab="today">
      <div className="flex flex-col gap-3 pt-2">
        {/* The whole card opens Capture, like tapping a widget */}
        <div role="button" tabIndex={0} onClick={() => navigate('capture')} className="text-left active:opacity-80">
          <PromptCard meta={dailyPrompt.seed} question={dailyPrompt.question}>
            <p className="text-subhead text-ink-muted">{dailyPrompt.detail}</p>
            <Button variant="stage" size="sm" className="self-start">
              Answer
            </Button>
          </PromptCard>
        </div>
        <PagePurpose>{pages.today.purpose}</PagePurpose>
      </div>
    </MainLayout>
  )
}
