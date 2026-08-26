'use client';

export default function ChatBubble({ message, role, timestamp, quickReplies, onQuickReply }) {
  const isAi = role === 'ai' || role === 'assistant';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isAi ? 'flex-start' : 'flex-end', marginBottom: '1rem' }}>
      <div className={`chat-bubble ${isAi ? 'chat-bubble-ai' : 'chat-bubble-user'}`}>
        <div>{message}</div>
        {timestamp && <span className="chat-timestamp">{timestamp}</span>}
      </div>
      
      {isAi && quickReplies && quickReplies.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', marginLeft: '1rem' }}>
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem', minHeight: '40px', fontSize: '0.875rem' }}
              onClick={() => onQuickReply && onQuickReply(reply)}
              type="button"
            >
              {reply}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
