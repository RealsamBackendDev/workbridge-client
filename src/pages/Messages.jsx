import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Paperclip, X } from "lucide-react";
import api, { getToken } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/conversations").then(({ data }) => setConversations(data.data.conversations));
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", { auth: { token: getToken() } });
    socketRef.current = socket;

    socket.on("message:new", ({ message }) => {
      const mine = message.senderId === user?.id;
      setActive((current) => {
        if (current && message.conversationId === current.id) {
          setMessages((ms) => (ms.some((m) => m.id === message.id) ? ms : [...ms, { ...message, mine }]));
        }
        return current;
      });
      setConversations((cs) =>
        cs.map((c) =>
          c.id === message.conversationId
            ? { ...c, lastMessage: message.body || "📎 Attachment", lastMessageAt: message.createdAt }
            : c
        )
      );
    });

    return () => socket.disconnect();
  }, [user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (reference) return;
  }, [searchParams]);

  const openConversation = async (c) => {
    setActive(c);
    const { data } = await api.get(`/conversations/${c.id}/messages`);
    setMessages(data.data.messages);
    await api.post(`/conversations/${c.id}/read`);
  };

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setUploading(true);
    for (const file of selected) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "misc");
      try {
        const { data } = await api.post("/upload", fd);
        setFiles((f) => [...f, { name: file.name, url: data.data.url }]);
      } catch (err) {
        alert(err.response?.data?.message || `Upload failed for ${file.name}`);
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const send = async (e) => {
    e.preventDefault();
    if ((!draft.trim() && files.length === 0) || !active) return;
    const body = draft.trim();
    const attachments = files.map((f) => f.url);
    setDraft("");
    setFiles([]);

    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit("message:send", { conversationId: active.id, body, attachments }, (ack) => {
        if (ack && ack.success) {
          setMessages((ms) => (ms.some((m) => m.id === ack.data.id) ? ms : [...ms, ack.data]));
        }
      });
    } else {
      const { data } = await api.post(`/conversations/${active.id}/messages`, { body, attachments });
      setMessages((ms) => [...ms, data.data.message]);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-4 my-4" style={{ height: "75vh" }}>
      <div className="border border-stone/30 rounded bg-white overflow-y-auto">
        <h2 className="font-semibold p-3 border-b border-stone/20 text-forest">Conversations</h2>
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => openConversation(c)}
            className={`w-full text-left p-3 border-b border-stone/20 hover:bg-mist/30 ${active?.id === c.id ? "bg-mist/50" : ""}`}
          >
            <p className="font-medium text-sm text-forest">{c.otherParty?.name}</p>
            <p className="text-xs text-stone truncate">{c.lastMessage || "No messages yet"}</p>
          </button>
        ))}
        {conversations.length === 0 && (
          <p className="p-4 text-sm text-stone">Conversations appear after a proposal is accepted.</p>
        )}
      </div>

      <div className="md:col-span-2 border border-stone/30 rounded bg-white flex flex-col">
        {active ? (
          <>
            <div className="p-3 border-b border-stone/20 font-medium text-forest">{active.otherParty?.name}</div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${m.mine ? "bg-forest text-white" : "bg-mist/60 text-forest"}`}>
                    {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                    {m.attachments?.length > 0 && (
                      <div className={`flex flex-col gap-1 mt-1 ${m.body ? "pt-1 border-t border-white/20" : ""}`}>
                        {m.attachments.map((a) => (
                          <a key={a} href={a} target="_blank" rel="noreferrer" className={`text-xs underline break-all ${m.mine ? "text-mist" : "text-forest"}`}>
                            📎 {a.split("/").pop()?.slice(0, 30)} ↗
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={send} className="p-3 border-t border-stone/20">
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {files.map((f) => (
                    <span key={f.url} className="flex items-center gap-1 bg-mist/40 text-forest text-xs px-2 py-1 rounded">
                      {f.name}
                      <button type="button" onClick={() => setFiles((x) => x.filter((y) => y.url !== f.url))} className="text-red-600">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-center">
                <label className="text-stone hover:text-forest cursor-pointer shrink-0">
                  <Paperclip size={18} />
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleFiles} disabled={uploading} />
                </label>
                <input
                  className="flex-1 border border-stone/40 p-2 rounded-lg bg-white text-forest placeholder-stone focus:outline-none focus:ring-2 focus:ring-forest/40"
                  placeholder={uploading ? "Uploading..." : "Type a message..."}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button className="bg-forest text-white px-4 py-2 rounded-lg hover:bg-stone font-medium shrink-0">Send</button>
              </div>
            </form>
          </>
        ) : (
          <p className="m-auto text-stone text-sm">Select a conversation</p>
        )}
      </div>
    </div>
  );
}