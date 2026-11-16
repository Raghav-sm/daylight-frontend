'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogoMark } from '@/components/layout/logo-mark';
import styles from '../features-section.module.css';

const firstPrompt = 'What’s still open for Product launch?';
const firstReply = 'Review landing page and write launch announcement are in To Do. The launch checklist is In Progress.';
const secondPrompt = 'Add “Draft the launch email” to To Do, due Friday.';
const secondReply = 'Done. The launch email is in To Do for Friday.';

const firstSentAt = firstPrompt.length + 7;
const firstReplyAt = firstSentAt + 16;
const secondStartAt = firstReplyAt + firstReply.length + 12;
const secondSentAt = secondStartAt + secondPrompt.length + 7;
const secondReplyAt = secondSentAt + 16;
const receiptAt = secondReplyAt + secondReply.length + 8;

function AssistantMessage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      <span className="shrink-0"><LogoMark size={22} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium">Daylight assistant</p>
        <div className="mt-1 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function AssistantChatMockup() {
  const composer = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [tick, setTick] = useState(0);
  const draft = tick < firstSentAt
    ? firstPrompt.slice(0, tick)
    : tick >= secondStartAt && tick < secondSentAt
      ? secondPrompt.slice(0, tick - secondStartAt)
      : '';

  useEffect(() => {
    if (draft && input.current) {
      input.current.scrollLeft = input.current.scrollWidth;
    }
  }, [draft]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const node = composer.current;
    if (!node) return;
    let startTimer: number | undefined;
    let typingTimer: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (reducedMotion) {
          startTimer = window.setTimeout(() => setTick(receiptAt), 0);
        } else {
          startTimer = window.setTimeout(() => {
            typingTimer = window.setInterval(() => {
              setTick((current) => {
                if (current >= receiptAt) {
                  window.clearInterval(typingTimer);
                  return current;
                }
                return current + 1;
              });
            }, 34);
          }, 450);
        }
        observer.disconnect();
      }
    }, { threshold: 0.8 });
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(startTimer);
      window.clearInterval(typingTimer);
    };
  }, []);

  return (
    <div className="ml-auto flex min-h-[38rem] w-full max-w-lg flex-col gap-5 sm:min-h-[34rem] lg:min-h-[31rem]">
      <div className="flex flex-1 flex-col justify-end gap-5">
        <AssistantMessage>Hey, how can I help you?</AssistantMessage>

        {tick >= firstSentAt && (
          <div className={`${styles.chatMessage} ml-8 rounded-2xl bg-secondary px-4 py-3.5 text-sm leading-relaxed`}>
            {firstPrompt}
          </div>
        )}

        {tick >= firstSentAt && tick < firstReplyAt && (
          <AssistantMessage className={styles.chatMessage}>
            <span className="text-muted-foreground">Checking the board<span className={styles.thinkingDots}>…</span></span>
          </AssistantMessage>
        )}

        {tick >= firstReplyAt && (
          <AssistantMessage className={styles.chatMessage}>
            {firstReply.slice(0, tick - firstReplyAt)}
          </AssistantMessage>
        )}

        {tick >= secondSentAt && (
          <div className={`${styles.chatMessage} ml-8 rounded-2xl bg-secondary px-4 py-3.5 text-sm leading-relaxed`}>
            {secondPrompt}
          </div>
        )}

        {tick >= secondSentAt && tick < secondReplyAt && (
          <AssistantMessage className={styles.chatMessage}>
            <span className="text-muted-foreground">Adding the task to To Do<span className={styles.thinkingDots}>…</span></span>
          </AssistantMessage>
        )}

        {tick >= secondReplyAt && (
          <AssistantMessage className={styles.chatMessage}>
            {secondReply.slice(0, tick - secondReplyAt)}
            {tick >= receiptAt && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-xs">
                <Check aria-hidden="true" className="size-3.5 shrink-0 text-stage-done" />
                <span className="min-w-0 flex-1 truncate">Draft the launch email</span>
                <span className="shrink-0 rounded-md bg-secondary px-2 py-1 font-medium">To Do · Friday</span>
              </div>
            )}
          </AssistantMessage>
        )}
      </div>

      <div ref={composer} className="flex items-center gap-2 rounded-2xl border border-border bg-background px-2 py-1 shadow-sm">
        <Input
          ref={input}
          readOnly
          value={draft}
          placeholder="Ask Daylight about this project…"
          aria-label="Ask Daylight about this project"
          className="h-10 min-w-0 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
        />
        <Button size="icon-sm" className="shrink-0 rounded-full" aria-label="Send message" disabled>
          <ArrowUp />
        </Button>
      </div>
    </div>
  );
}
