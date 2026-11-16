import { SectionFrame } from './section-frame';
import { AssistantChatMockup } from './features/assistant-chat-mockup';
import { BoardPreview } from './features/board-preview';

export function FeaturesSection() {
  return (
    <SectionFrame id="features" className="max-w-[1080px]">
      <div className="max-w-xl">
        <p className="text-sm text-stage-progress">A simple way to keep moving</p>
        <h2 className="font-heading mt-3 text-4xl tracking-tight sm:text-5xl">
          Make space. Move forward.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Keep projects and tasks in view. When it is easier to ask, tell Daylight what changed and see the same board update.
        </p>
      </div>

      <div className="mt-12">
        <BoardPreview />
      </div>
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="max-w-md">
          <p className="text-sm text-stage-progress">Ask Daylight</p>
          <h3 className="font-heading mt-3 text-3xl tracking-tight sm:text-4xl">
            Tell it what changed.
          </h3>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Add a task in your own words. Daylight puts it on the same board and shows you what changed.
          </p>
        </div>
        <AssistantChatMockup />
      </div>
    </SectionFrame>
  );
}
