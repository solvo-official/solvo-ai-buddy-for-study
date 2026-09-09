import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Sparkles,
  RefreshCw,
  Globe,
  Bot,
  User,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { api } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import type { TutorMessage } from '../types/index.ts';

interface TutorViewProps {
  initialPrompt?: string;
}

export const TutorView: React.FC<TutorViewProps> = ({ initialPrompt }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputVal, setInputVal] = useState(initialPrompt || '');
  const [isSending, setIsSending] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ur'>(
    user?.preferredLanguage === 'ur' ? 'ur' : 'en'
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await api.getTutorMessages();
      setMessages(msgs);
    } catch (err) {
      console.warn('Could not load tutor messages:', err);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, scrollToBottom]);

  const handleSend = useCallback(async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isSending) return;

    setInputVal('');
    setIsSending(true);

    const now = new Date();
    // Optimistic user message
    const tempUserMsg: TutorMessage = {
      id: `temp_u_${now.getTime()}`,
      conversationId: 'default',
      sender: 'user',
      text,
      language: currentLang,
      timestamp: now.toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const reply = await api.sendTutorMessage(text, currentLang);
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, reply]);
    } catch {
      const errTime = new Date();
      const errorMsg: TutorMessage = {
        id: `err_${errTime.getTime()}`,
        conversationId: 'default',
        sender: 'solvo',
        text: 'Sorry, I had trouble answering that. Please try asking again.',
        language: currentLang,
        timestamp: errTime.toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  }, [inputVal, isSending, currentLang]);

  const handleClear = useCallback(async () => {
    if (confirm('Clear chat history?')) {
      await api.clearTutorChat();
      const clearTime = new Date();
      setMessages([
        {
          id: `welcome_${clearTime.getTime()}`,
          conversationId: 'default',
          sender: 'solvo',
          text: currentLang === 'ur'
            ? 'خوش آمدید! میں سولوو ہوں، آپ کا تعلیمی ساتھی۔ آپ مجھ سے ریاضی، سائنس یا کسی بھی مضمون کا سوال پوچھ سکتے ہیں۔'
            : "Hello! I'm Solvo, your AI Study Buddy. Ask me any concept, formula, or problem statement!",
          language: currentLang,
          quickActions: ['Explain simpler', 'Give an example', 'Quiz me', 'Explain in Urdu'],
          timestamp: clearTime.toISOString(),
        },
      ]);
    }
  }, [currentLang]);

  const defaultQuickPills = [
    { label: 'Explain simpler', icon: <Lightbulb size={13} /> },
    { label: 'Give an example', icon: <FileText size={13} /> },
    { label: 'Quiz me on this', icon: <CheckCircle2 size={13} /> },
    { label: 'Explain in Urdu', icon: <Globe size={13} /> },
    { label: 'Practice question', icon: <HelpCircle size={13} /> },
  ];

  return (
    <div className="content-wrapper" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height) - 40px)', maxHeight: '880px' }}>
      {/* Tutor Header */}
      <div
        className="card"
        style={{
          padding: 'var(--space-3) var(--space-4)',
          marginBottom: 'var(--space-3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Solvo AI Tutor</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)' }} />
              Active Educational Guidance
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {/* Language Toggle */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentLang(currentLang === 'en' ? 'ur' : 'en')}
            title="Switch Language"
          >
            <Globe size={14} />
            <span>{currentLang === 'en' ? 'English' : 'اردو'}</span>
          </button>
          <button className="btn btn-ghost btn-icon" onClick={handleClear} title="Clear conversation">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-2) var(--space-1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isUrduMsg = msg.language === 'ur' || /[\u0600-\u06FF]/.test(msg.text);

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: '10px',
                maxWidth: '85%',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-full)',
                  background: isUser ? 'var(--color-primary)' : 'var(--bg-surface-elevated)',
                  color: isUser ? 'white' : 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-xs)',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                }}
              >
                {isUser ? <User size={16} /> : <Sparkles size={16} />}
              </div>

              {/* Bubble */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div
                  style={{
                    background: isUser ? 'var(--color-primary)' : 'var(--bg-surface)',
                    color: isUser ? 'white' : 'var(--text-primary)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    boxShadow: 'var(--shadow-xs)',
                    border: isUser ? 'none' : '1px solid var(--border-subtle)',
                    fontSize: '0.92rem',
                    lineHeight: isUrduMsg ? 2.1 : 1.6,
                    fontFamily: isUrduMsg ? 'var(--font-urdu)' : 'inherit',
                    direction: isUrduMsg ? 'rtl' : 'ltr',
                    textAlign: isUrduMsg ? 'right' : 'left',
                  }}
                >
                  {msg.text}
                </div>

                {/* Quick actions if provided by Solvo */}
                {!isUser && msg.quickActions && msg.quickActions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                    {msg.quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSend(action)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-surface-glass)',
                        }}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isSending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <Bot size={16} />
            </div>
            <div
              className="card"
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Solvo is thinking</span>
              <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
                <span className="pulsing-glow" style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-primary)' }} />
                <span className="pulsing-glow" style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-primary)' }} />
                <span className="pulsing-glow" style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-primary)' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Bar */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          padding: '6px 2px',
          flexShrink: 0,
        }}
      >
        {defaultQuickPills.map((pill, idx) => (
          <button
            key={idx}
            className="btn btn-ghost btn-sm"
            onClick={() => handleSend(pill.label)}
            style={{
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '3px 10px',
            }}
          >
            {pill.icon}
            <span>{pill.label}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div
        className="card"
        style={{
          padding: 'var(--space-2) var(--space-3)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          flexShrink: 0,
          marginTop: '6px',
        }}
      >
        <textarea
          className="input-field"
          rows={1}
          placeholder={currentLang === 'ur' ? 'اردو یا انگریزی میں سوال پوچھیں...' : 'Ask Solvo any concept or problem...'}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{
            border: 'none',
            background: 'transparent',
            resize: 'none',
            fontSize: '0.92rem',
            padding: '8px 4px',
            fontFamily: currentLang === 'ur' ? 'var(--font-urdu)' : 'inherit',
            direction: currentLang === 'ur' ? 'rtl' : 'ltr',
          }}
        />

        <button
          className="btn btn-primary btn-icon"
          onClick={() => handleSend()}
          disabled={!inputVal.trim() || isSending}
          style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)' }}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
