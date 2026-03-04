import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";

const API_BASE = "http://localhost:8080";
const WS_URL = "ws://localhost:8080/ws-chat";

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");

  const [currentRoom, setCurrentRoom] = useState(null);

  const [name, setName] = useState("user");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  const [connected, setConnected] = useState(false);

  const clientRef = useRef(null);
  const subRef = useRef(null);

  // 1) 방 목록 불러오기
  const loadRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rooms`);
      if (!res.ok) throw new Error("rooms fetch failed");
      const data = await res.json();
      setRooms(data);
    } catch (e) {
      console.error(e);
      alert("채팅방 목록 불러오기 실패 (백엔드 실행중인지 확인)");
    }
  };

  // 2) 방 생성
  const createRoom = async () => {
    const roomName = newRoomName.trim();
    if (!roomName) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/rooms?name=${encodeURIComponent(roomName)}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("room create failed");

      const created = await res.json();
      setNewRoomName("");
      await loadRooms();
      await enterRoom(created);
    } catch (e) {
      console.error(e);
      alert("채팅방 생성 실패");
    }
  };

  // 3) STOMP 연결(최초 1회)
  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL, // ✅ 백엔드 addEndpoint("/ws-chat") 이면 이거 사용
      reconnectDelay: 3000,
      debug: () => {},

      onConnect: () => {
        setConnected(true);
        console.log("✅ STOMP connected");
      },

      onDisconnect: () => {
        setConnected(false);
        console.log("🔌 STOMP disconnected");
      },

      onStompError: (frame) => {
        console.error("Broker error:", frame.headers["message"]);
        console.error("Details:", frame.body);
      },

      onWebSocketError: (e) => {
        console.error("WebSocket error:", e);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      try {
        if (subRef.current) subRef.current.unsubscribe();
      } catch (e) {
        console.warn("unsubscribe failed:", e);
      }
      client.deactivate();
      clientRef.current = null;
    };
  }, []);

  // 4) 시작 시 방 목록 로드
  useEffect(() => {
    loadRooms();
  }, []);

  // ✅ 5) 방 입장: (여기가 “fetch 과거 메시지” 넣는 정확한 위치)
  const enterRoom = async (room) => {
    setCurrentRoom(room);
    setMessages([]); // 방 바뀌면 초기화

    // (A) 과거 메시지 불러오기 (REST)
    try {
      const res = await fetch(
        `${API_BASE}/api/rooms/${room.roomId}/messages?limit=50`
      );
      if (res.ok) {
        const history = await res.json();
        setMessages(history); // 과거 메시지로 화면 채우기
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
      setMessages([]);
    }

    // (B) STOMP 구독 갈아끼우기
    const client = clientRef.current;
    if (!client || !client.connected) {
      alert("서버 연결중... 잠시 후 다시 시도");
      return;
    }

    try {
      if (subRef.current) subRef.current.unsubscribe();
    } catch (e) {
      console.warn("unsubscribe failed:", e);
    }

    const topic = `/sub/chat/room/${room.roomId}`;
    subRef.current = client.subscribe(topic, (msg) => {
      try {
        const body = JSON.parse(msg.body);
        setMessages((prev) => [...prev, body]);
      } catch (e) {
        console.error("msg parse error", e);
      }
    });

    console.log("📌 subscribed:", topic);
  };

  // 6) 메시지 전송
  const send = () => {
    const client = clientRef.current;

    if (!currentRoom) {
      alert("먼저 채팅방을 선택하세요!");
      return;
    }
    if (!client || !client.connected) {
      alert("서버 연결중...");
      return;
    }
    if (!text.trim()) return;

    client.publish({
      destination: `/pub/chat.send/${currentRoom.roomId}`,
      body: JSON.stringify({ sender: name, message: text }),
    });

    setText("");
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* 좌측: 채팅방 목록 */}
      <div style={{ width: 320, borderRight: "1px solid #ddd", padding: 16 }}>
        <h2 style={{ margin: 0 }}>
          Rooms {connected ? "🟢" : "🔴"}
        </h2>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <input
            style={{ flex: 1, padding: 8 }}
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="새 채팅방 이름"
            onKeyDown={(e) => e.key === "Enter" && createRoom()}
          />
          <button onClick={createRoom}>생성</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <button onClick={loadRooms} style={{ width: "100%" }}>
            목록 새로고침
          </button>
        </div>

        <ul style={{ marginTop: 12, paddingLeft: 0, listStyle: "none" }}>
          {rooms.map((r) => (
            <li
              key={r.roomId}
              onClick={() => enterRoom(r)}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 8,
                cursor: "pointer",
                background: currentRoom?.roomId === r.roomId ? "#eef" : "#f7f7f7",
              }}
            >
              <div style={{ fontWeight: 700 }}>{r.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>#{r.roomId}</div>
            </li>
          ))}
          {rooms.length === 0 && (
            <li style={{ opacity: 0.7, marginTop: 8 }}>
              채팅방이 없습니다. 생성해보세요.
            </li>
          )}
        </ul>
      </div>

      {/* 우측: 채팅 영역 */}
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column" }}>
        <h2 style={{ margin: 0 }}>
          {currentRoom ? `# ${currentRoom.name}` : "채팅방을 선택하세요"}
        </h2>

        <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 70 }}>닉네임</span>
          <input
            style={{ padding: 8, width: 200 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="닉네임"
          />
        </div>

        <div
          style={{
            marginTop: 12,
            flex: 1,
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
            overflowY: "auto",
            background: "#fff",
          }}
        >
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <b>{m.sender}</b>: {m.message}
            </div>
          ))}
          {messages.length === 0 && (
            <div style={{ opacity: 0.6 }}>
              {currentRoom ? "아직 메시지가 없습니다." : "왼쪽에서 방을 선택하세요."}
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <input
            style={{ flex: 1, padding: 10 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={currentRoom ? "메시지 입력" : "방을 선택해야 입력 가능"}
            disabled={!currentRoom}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send} disabled={!currentRoom}>
            전송
          </button>
        </div>
      </div>
    </div>
  );
}