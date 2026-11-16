import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionFrame } from './section-frame';
import { SectionHeader } from './section-header';

const faqs = [
  {
    question: 'What is Daylight?',
    answer:
      'Daylight is a calm place for projects and tasks. You can organize work on a board or ask Daylight to update it for you.',
  },
  {
    question: 'How do MCP connections work?',
    answer:
      'Add Daylight as an MCP server in a compatible AI client, authorize access, then ask that client to find or update your tasks. Available tools depend on the client and its settings.',
  },
  {
    question: 'Which AI tools work with Daylight?',
    answer:
      'Any client that supports the Model Context Protocol can connect. Common examples include ChatGPT, Claude, Cursor, and VS Code with MCP enabled.',
  },
  {
    question: 'Is my data private?',
    answer:
      'Your projects and tasks live in your Daylight workspace. Connected clients only receive what you authorize through the MCP connection.',
  },
  {
    question: 'Can I try it without connecting an AI client?',
    answer:
      'Yes. Create a project, add tasks, and use the board on its own. The assistant and MCP connections are optional.',
  },
];

export function FaqSection() {
  return (
    <SectionFrame id="faq" className="max-w-[1080px]">
      <SectionHeader
        eyebrow="A few details"
        title="Questions, answered."
        description="A little more about projects, the assistant, and connecting an AI client."
        align="left"
        className="mx-0 max-w-xl text-left"
      />
      <div className="mt-10">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question} className="border-b border-border last:border-b-0">
              <AccordionTrigger className="py-5 text-left text-sm hover:no-underline sm:text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="max-w-xl pb-5 leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SectionFrame>
  );
}
