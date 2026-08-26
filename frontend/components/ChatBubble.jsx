'use client';

export default function ChatBubble({ message, role, timestamp }) {
  const isAi = role === 'ai' || role === 'assistant';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isAi ? 'flex-start' : 'flex-end',
      marginBottom: '0.25rem',
    }}>
      {isAi && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          marginBottom: '0.25rem',
          paddingLeft: '0.25rem',
        }}>
          <span style={{ fontSize: '0.875rem' }}>🤖</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)' }}>VaidyaAI</span>
        </div>
      )}
      <div className={`chat-bubble ${isAi ? 'chat-bubble-ai' : 'chat-bubble-user'}`}>
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message}</div>
        {timestamp && <span className="chat-timestamp">{timestamp}</span>}
      </div>
    </div>
  );
}
