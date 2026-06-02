'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import { matchIntent, suggestedQuestions } from '@/lib/knowledgeEngine';
import styles from '@/styles/ui/AIAssistant.module.css';
import profile from '@/data/profile.json';

/* ─── Icons (inline SVG to avoid extra deps) ──────────────── */

function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v1a2 2 0 0 1-2 2h-1v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1H5a2 2 0 0 1-2-2v-1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
      <path d="M9 17h6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

/* ─── Text formatter (bold + line breaks) ─────────────────── */

function formatText(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Convert **bold** to <strong>
    const parts = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIdx = 0;
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        parts.push(line.slice(lastIdx, match.index));
      }
      parts.push(<strong key={`b-${i}-${match.index}`}>{match[1]}</strong>);
      lastIdx = regex.lastIndex;
    }
    if (lastIdx < line.length) {
      parts.push(line.slice(lastIdx));
    }
    if (parts.length === 0) parts.push(line);

    return (
      <span key={i}>
        {parts}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

/* ─── Timestamp formatter ─────────────────────────────────── */

function getTimeString() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ─── Welcome message ─────────────────────────────────────── */

const WELCOME_MESSAGE = {
  role: 'assistant',
  text: `Hello! 👋 I'm ${profile.name.first}'s AI Assistant. Ask me about cybersecurity projects, achievements, certifications, experience, skills, or contact information.`,
  time: null, // Will be set on mount
  isWelcome: true,
  actions: [
    { type: 'chip', label: '🛡️ Projects', query: 'Show cybersecurity projects' },
    { type: 'chip', label: '📜 Certifications', query: `What certifications does ${profile.name.full} have?` },
    { type: 'chip', label: '🏆 Achievements', query: `What are ${profile.name.first}'s achievements?` },
  ],
};

/* ─── Component ───────────────────────────────────────────── */

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const windowRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const bubbleRef = useRef(null);

  /* ── Auto-scroll to bottom ── */
  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      requestAnimationFrame(() => {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      });
    }
  }, []);

  /* ── Open / Close with GSAP ── */
  const openChat = useCallback(() => {
    if (!hasOpened) {
      setMessages([{ ...WELCOME_MESSAGE, time: getTimeString() }]);
      setHasOpened(true);
    }
    setIsOpen(true);
  }, [hasOpened]);

  const closeChat = useCallback(() => {
    if (windowRef.current) {
      gsap.to(windowRef.current, {
        scale: 0.85,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => setIsOpen(false),
      });
    } else {
      setIsOpen(false);
    }
  }, []);

  /* ── Animate window on open ── */
  useEffect(() => {
    if (isOpen && windowRef.current) {
      gsap.fromTo(windowRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.7)' }
      );
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  /* ── Scroll on new messages ── */
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  /* ── Animate new message bubbles ── */
  useEffect(() => {
    if (messagesRef.current) {
      const lastChild = messagesRef.current.lastElementChild;
      if (lastChild) {
        gsap.from(lastChild, {
          y: 12,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }
  }, [messages]);

  /* ── Keyboard handler ── */
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeChat]);

  /* ── Send message ── */
  const handleSend = useCallback((text) => {
    const msg = (text || inputValue).trim();
    if (!msg) return;

    const userMessage = { role: 'user', text: msg, time: getTimeString() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    /* Simulate thinking delay */
    const delay = 300 + Math.random() * 400;
    setTimeout(() => {
      const response = matchIntent(msg);
      const assistantMessage = {
        role: 'assistant',
        text: response.text,
        actions: response.actions || [],
        time: getTimeString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, delay);
  }, [inputValue]);

  /* ── Handle chip click ── */
  const handleChipClick = useCallback((query) => {
    handleSend(query);
  }, [handleSend]);

  /* ── Handle action button ── */
  const handleAction = useCallback((action) => {
    if (action.type === 'link') {
      window.open(action.href, '_blank', 'noopener,noreferrer');
    } else if (action.type === 'navigate') {
      window.dispatchEvent(new CustomEvent('nav-go-to', { detail: { idx: action.section } }));
      closeChat();
    } else if (action.type === 'chip') {
      handleSend(action.query);
    }
  }, [closeChat, handleSend]);

  /* ── Form submit ── */
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    handleSend();
  }, [handleSend]);

  return (
    <div className={styles.container} role="complementary" aria-label="AI Assistant">
      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className={styles.window}
          ref={windowRef}
          role="dialog"
          aria-label="Chat with AI Assistant"
          aria-modal="false"
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.avatar} aria-hidden="true">
                <BotIcon />
              </div>
              <div className={styles.headerText}>
                <div className={styles.title}>{profile.name.first}&apos;s AI Assistant</div>
                <div className={styles.subtitle}>
                  <span className={styles.statusDot} />
                  Online · Ask me anything
                </div>
              </div>
            </div>
            <button
              className={styles.closeBtn}
              onClick={closeChat}
              aria-label="Close chat"
              title="Close (Esc)"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div
            className={styles.messages}
            ref={messagesRef}
            data-scrollable="true"
            role="log"
            aria-live="polite"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.message} ${msg.role === 'assistant' ? styles.assistantMsg : styles.userMsg} ${msg.isWelcome ? styles.welcomeMsg : ''}`}
              >
                <div className={styles.bubbleContent}>
                  {formatText(msg.text)}
                </div>
                {/* Quick actions */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className={styles.actions}>
                    {msg.actions.map((action, j) => (
                      <button
                        key={j}
                        className={action.type === 'chip' ? styles.actionChip : styles.actionBtn}
                        onClick={() => handleAction(action)}
                        title={action.label}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className={styles.messageTimestamp}>{msg.time}</div>
              </div>
            ))}
            {isTyping && (
              <div className={styles.typing} aria-label="Assistant is typing">
                <div className={styles.dot} />
                <div className={styles.dot} />
                <div className={styles.dot} />
              </div>
            )}
          </div>

          {/* Suggested Chips */}
          {messages.length <= 2 && (
            <div className={styles.chips}>
              <div className={styles.chipsLabel}>Suggested questions</div>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  className={styles.chip}
                  onClick={() => handleChipClick(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form className={styles.inputArea} onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder="Ask about skills, projects, experience..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              aria-label="Type your message"
              autoComplete="off"
            />
            <button
              className={styles.sendBtn}
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      {/* ── Floating Bubble ── */}
      <button
        ref={bubbleRef}
        className={styles.bubble}
        onClick={isOpen ? closeChat : openChat}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        aria-expanded={isOpen}
        title="Chat with AI Assistant"
      >
        <div className={styles.bubbleIcon}>
          {isOpen ? <CloseIcon /> : <BotIcon />}
        </div>
      </button>
    </div>
  );
}
