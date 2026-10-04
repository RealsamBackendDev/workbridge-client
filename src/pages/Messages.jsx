import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api, { getToken } from "../lib/api";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/conversations").then(({ data }) => setConversations(data.data.conversations));
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    const socket = io("http://localhost:5000", { auth: { token: getToken() } });
    socketRef.current = socket;

    socket.on("message:new", ({ message }) => {
      setActive((current) => {
        if (current && message.conversationId === current.id) {
          setMessages((ms) => (ms.some((m) => m.id === message.id) ? ms : [...ms, message]));
        }
        return current;
      });
      setConversations((cs) =>
        cs.map((c) =>
          c.id === message.conversationId
            ? { ...c, lastMessage: message.body, lastMessageAt: message.createdAt }
            : c
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = async (c) => {
    setActive(c);
    const { data } = await api.get(`/conversations/${c.id}/messages`);
    setMessages(data.data.messages);
    await api.post(`/conversations/${c.id}/read`);
  };

  const send = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    const body = draft.trim();
    setDraft("");

    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit("message:send", { conversationId: active.id, body }, (ack) => {
        if (ack && ack.success) {
          setMessages((ms) => (ms.some((m) => m.id === ack.data.id) ? ms : [...ms, ack.data]));
        }
      });
    } else {
      const { data } = await api.post(`/conversations/${active.id}/messages`, { body });
      setMessages((ms) => [...ms, data.data.message]);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-4 my-4" style={{ height: "75vh" }}>
      <div className="border rounded bg-white overflow-y-auto">
        <h2 className="font-semibold p-3 border-b">Conversations</h2>
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => openConversation(c)}
            className={`w-full text-left p-3 border-b border-stone/20 hover:bg-mist/30 text-forest ${
                active?.id === c.id ? "bg-mist/50" : ""}`}
          >
            <p className="font-medium text-sm">{c.otherParty?.name}</p>
            <p className="text-xs text-stone truncate">{c.lastMessage || "No messages yet"}</p>
          </button>
        ))}
        {conversations.length === 0 && (
          <p className="p-4 text-sm text-stone">Conversations appear after a proposal is accepted.</p>
        )}
      </div>

      <div className="md:col-span-2 border rounded bg-white flex flex-col">
        {active ? (
          <>
            <div className="p-3 border-b font-medium">{active.otherParty?.name}</div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      m.mine ? "bg-forest text-white" : "bg-mist/60 text-forest"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={send} className="p-3 border-t flex gap-2">
              <input
                className="flex-1 border p-2 rounded"
                placeholder="Type a message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
             <button className="bg-forest text-white px-4 rounded-lg hover:bg-stone font-medium">Send</button>
            </form>
          </>
        ) : (
          <p className="m-auto text-stone text-sm">Select a conversation</p>
        )}
      </div>
    </div>
  );
}