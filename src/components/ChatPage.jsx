import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { ref, onValue, push, set, get } from "firebase/database";

export default function ChatPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [user, setUser] = useState(null);
  const chatEndRef = useRef(null);

  // ✅ Scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Load current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      } else {
        setUser(user);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Load request info
  useEffect(() => {
    if (!requestId) return;

    const reqRef = ref(db, `requests/${requestId}`);
    get(reqRef).then((snapshot) => {
      const data = snapshot.val();
      if (!data) return navigate("/");

      // 权限验证：只能是 student 或 mentor
      if (
        auth.currentUser?.uid !== data.studentId &&
        auth.currentUser?.uid !== data.mentorId
      ) {
        alert("Access denied.");
        navigate("/");
        return;
      }

      if (data.status !== "accepted") {
        alert("This request has not been accepted yet.");
        navigate("/");
        return;
      }

      setRequest(data);
    });
  }, [requestId, navigate]);

  // ✅ Load messages
  useEffect(() => {
    const chatRef = ref(db, `chats/${requestId}/messages`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val() || {};
      const msgs = Object.entries(data).map(([id, msg]) => ({ id, ...msg }));
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [requestId]);

  // ✅ Send message
  const sendMessage = async () => {
    if (!messageText.trim() || !user) return;

    const msgRef = push(ref(db, `chats/${requestId}/messages`));
    await set(msgRef, {
      senderId: user.uid,
      text: messageText.trim(),
      timestamp: new Date().toISOString()
    });

    setMessageText("");
  };

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col h-screen">
      <h1 className="text-xl font-bold text-blue-600 mb-2">Chat with your Mentor/Student</h1>

      <div className="flex-1 border rounded p-4 overflow-y-auto bg-gray-50 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-xs px-3 py-2 rounded shadow text-sm ${
              msg.senderId === user?.uid
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-white border"
            }`}
          >
            {msg.text}
            <div className="text-[10px] mt-1 text-right opacity-70">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border px-3 py-2 rounded"
          placeholder="Type your message..."
        />
        
        <button
          onClick={() => navigate(`/videocall/${requestId}`)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Video Call
        </button>

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
