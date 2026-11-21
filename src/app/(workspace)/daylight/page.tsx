import type { Metadata } from 'next';
import { AgentWorkspace } from './_components/agent-workspace';

export const metadata: Metadata = {
  title: 'Daylight AI | Daylight',
  description: 'A conversation for your projects, tasks, and next steps.',
};

export default function DaylightPage() {
  return <AgentWorkspace />;
}
