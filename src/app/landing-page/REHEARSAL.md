# Landing page rehearsal

- Reference scenes: Stageshow `hero-demo` for a cause and payoff, `ai-chat` for the message sequence, and `bento` for the asymmetric grouping. Daylight's own board, sidebar, chat, theme tokens, and bundled client marks remain the visual source.
- Checked the actual `/landing-page` in the browser at the default desktop viewport and 390 px mobile, in light and dark. Reviewed the hero, board, chat, and MCP client scene; checked the theme transition and the staged conversation after it settled.
- Verified `npx tsc --noEmit`, `npx eslint src/app/landing-page src/components/assistant/assistant-panel.tsx`, and `git diff --check`.
- The demonstrations are local, scripted concept previews. They do not call a backend or claim that the assistant or MCP connection is available. The Stageshow kit film gate was not applicable because the scenes use the product's existing Next.js components rather than a standalone kit Stage.
