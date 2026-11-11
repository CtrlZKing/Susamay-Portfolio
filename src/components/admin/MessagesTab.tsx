import { useState } from 'react';
import { Mail, Trash2, CheckCircle2, Reply, Clock } from 'lucide-react';
import { ContactMessage } from '../../types/portfolio.ts';
import { api } from '../../lib/api.ts';

interface MessagesTabProps {
  messages: ContactMessage[];
  onRefresh: () => void;
}

export function MessagesTab({ messages, onRefresh }: MessagesTabProps) {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const handleSelect = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      try {
        await api.markMessageRead(msg.id);
        onRefresh();
      } catch (err) {
        console.error('Failed to mark read:', err);
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteMessage(id);
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      onRefresh();
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xs border border-zinc-200/80 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-zinc-900">
            Visitor Inquiries &amp; Messages ({messages.length})
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Direct commercial inquiries and commission requests submitted via your public contact form.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Messages List */}
        <div className="lg:col-span-5 bg-white rounded-xs border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => handleSelect(msg)}
              className={`p-4 cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                selectedMessage?.id === msg.id
                  ? 'bg-zinc-100/80'
                  : !msg.read
                  ? 'bg-amber-50/40 hover:bg-amber-50/70 font-medium'
                  : 'hover:bg-zinc-50'
              }`}
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  {!msg.read && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                  <h4 className="text-xs font-semibold text-zinc-900 truncate">
                    {msg.name}
                  </h4>
                </div>
                <p className="text-[11px] text-zinc-500 truncate">{msg.subject || 'General Inquiry'}</p>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleDelete(msg.id, e)}
                className="p-1 text-zinc-400 hover:text-red-600 transition-colors shrink-0"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="p-12 text-center text-xs text-zinc-500">
              No inquiries received yet. When visitors send a message on your contact form, it will appear here in real time.
            </div>
          )}
        </div>

        {/* Message Detail View */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xs border border-zinc-200/80">
          {selectedMessage ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="font-display text-base font-bold text-zinc-900">
                    {selectedMessage.subject || 'General Inquiry'}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-600">
                    <span className="font-semibold">{selectedMessage.name}</span>
                    <span>&lt;{selectedMessage.email}&gt;</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 mt-1 block">
                    Received: {new Date(selectedMessage.created_at).toLocaleString()}
                  </span>
                </div>

                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Inquiry')}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-xs transition-colors shrink-0 cursor-pointer"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>

              <div className="text-xs text-zinc-700 whitespace-pre-wrap leading-relaxed bg-zinc-50/50 p-4 rounded-xs border border-zinc-100 font-sans">
                {selectedMessage.message}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-zinc-400">
              Select an inquiry from the list to view its message details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
