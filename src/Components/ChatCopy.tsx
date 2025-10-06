import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api";

// ChatInterface.tsx
// Single-file React + TypeScript component that demonstrates:
// - Left sidebar with chats
// - Clicking a chat opens a full-screen private conversation
// - Responsive behavior: on small screens the chat takes the whole screen, with Back button
// - Uses Tailwind + daisyUI classes

type Message = {
  id: string;
  fromMe: boolean;
  sender_id: number;
  text: string;
  time: string; // ISO or formatted
  isDeleted: boolean;
  editedAt: string;
  receiver_id: number
};

type Chat = {
  id: number;
  title: string;
  lastMessage: Message;
  unread?: number;
  messages: Message[];
};



export default function ChatInterface(): React.JSX.Element {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [inputMessage, setMessage] = useState("");
  const [inputFindUsername, setFindUsername] = useState("");
  const [showUserNotFoundWarning, setUserNotFoundWarning] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);

  const selectedChat = chats.find((c) => c.id === selectedChatId) ?? null;

  // Scroll ref for messages
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // scroll to bottom when selected chat or messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChatId, chats]);

  function openChat(id: number) {
    setSelectedChatId(id);
    // mark unread as read
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  }

  function closeChat() {
    setSelectedChatId(null);
  }

  function sendMessage() {
    if (!inputMessage.trim()) return;
    console.log({
          selectedUserId: selectedChatId,
          message: inputMessage
        })
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify(
        {
          selectedUserId: selectedChatId,
          message: inputMessage
        }
      ))

    }

    setMessage("");
  }

  async function findUser() {
    if (!inputFindUsername.trim()) return;
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: inputFindUsername,
      }),      
    }

    const response = await apiFetch("/api/find-user", requestOptions);
    if (!response.ok) {
      setUserNotFoundWarning(true)
    } else {
      const data = await response.json()
      setUserNotFoundWarning(false)
      const modal = document.getElementById('find_new_user') as HTMLDialogElement | null;
      modal?.close()

      const newChat: Chat = {
        id: data.user_id,
        lastMessage: {
          id: "empty",
          fromMe: false,
          text: "",
          time: "",
          sender_id: 0,
          isDeleted: false,
          editedAt: "empty",
          receiver_id: 0,
        },
        messages: [],
        title: data.username,
        unread: 0
      }

      setChats((prev) => [newChat, ...prev]);
      console.log(newChat)

    }
    
    // const data = response.json()
    // console.log(data, "aboba")
    // console.log(JSON.stringify(response))

    
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Create websocket connection
  useEffect(() => {
    

    const socket = new WebSocket("/api/ws/chat");
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ access_token: localStorage.getItem("access_token") }));
      console.log("Initiated websocket connection");
    };

    socket.onmessage = (event) => {
    console.log(chats, "chats")
    const data = JSON.parse(event.data);
    
    console.log(data, "new message")
    const newMessage: Message = {
      id: data.message_obj.id,
      editedAt: data.message_obj.edited_at,
      fromMe: data.is_own_message,
      isDeleted: false,
      sender_id: data.message_obj.sender_id,
      text: data.message_obj.text,
      time: data.message_obj.sent_at,
      receiver_id: data.receiver_id,
    };
    console.log(newMessage)

    setChats(prevChats => {
      if (newMessage.fromMe) {

        const chatIndex = prevChats.findIndex(c => c.id === newMessage.receiver_id);
        console.log(prevChats, "prevChats"); // вот здесь актуальные чаты
  
        if (chatIndex === -1) return prevChats;
  
        const chat = prevChats[chatIndex];
        const updatedChat: Chat = {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: newMessage,
        };
  
        return [updatedChat, ...prevChats.filter((_, i) => i !== chatIndex)];
      } else {
        const chatIndex = prevChats.findIndex(c => c.id === newMessage.sender_id);
        console.log(prevChats, "prevChats"); // вот здесь актуальные чаты
  
        if (chatIndex === -1) return prevChats;
  
        const chat = prevChats[chatIndex];
        const updatedChat: Chat = {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: newMessage,
        };
  
        return [updatedChat, ...prevChats.filter((_, i) => i !== chatIndex)];
      }
    });

    };

    console.log(chats)

    socket.onclose = () => {
      console.log("Соединение закрыто ❌");
    };

    socket.onerror = (error) => {
      console.error("Ошибка WS:", error);
    };

    // Загрузка списка чатов
    (async () => {
      const response = await apiFetch("/api/chats-list");
      const data = await response.json();
      const chats: Chat[] = data.chats_list;
      setChats(chats);
      console.log(chats);
      
    })();

    return () => {
      socket.close();
    };
  }, []);

  

  return (
    <div className="h-screen flex bg-base-100">
      {/* Sidebar */}
<aside
  className={`h-screen flex flex-col transition-all duration-200 border-e border-base-300
    ${selectedChatId ? "hidden md:flex w-80" : "flex w-full md:w-80"}`}
>
  {/* Заголовок */}
  <div className="flex items-center justify-between p-4 border-b border-base-300">
    <h2 className="text-lg font-semibold">Dimonika1's chats</h2>
    {/* Open the modal using document.getElementById('ID').showModal() method */}
    <button className="btn btn-success btn-dash btn-sm"
      onClick={() => {
      const modal = document.getElementById('find_new_user') as HTMLDialogElement | null;
      if (modal) {
        modal.showModal();
      }}}
      >
      <span className="text-black">New</span>
    </button>
    
  </div>

  {/* Список чатов */}
  <div className="flex-1 overflow-y-auto space-y-1 py-4 px-2">
    {chats.map((chat) => (
      <button
        key={chat.id}
        onClick={() => openChat(chat.id)}
        className="w-full text-left rounded-lg hover:bg-base-300 p-2 flex items-center gap-3 border border-blue-400"
      >
        <div className="ms-1 truncate">
          <p className="font-medium">{chat.title}</p>
          {chat.lastMessage.text != "" ? <p className="w-full block">{chat.lastMessage.text}</p> : <p className="w-full block text-gray-600 underline">No messages...</p>}
        </div>
      </button>
    ))}
  </div>
</aside>

      {/* Main area */}
      <main 
        className={`overflow-hidden h-screen transition-all duration-200 border-e border-base-300 flex flex-1 flex-col`}
      >
        {/* Topbar (hidden when no chat selected on small screens) */}
        <header className="border-b h-[65px] border-base-300 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* On mobile show back button if chat is open */}
            {selectedChatId ? (
              <button className="btn btn-ghost btn-square md:hidden" onClick={closeChat} aria-label="Back">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                
                
              </button>
            ) : null}

            <div className="md:flex items-center gap-3">
            <h3 className="text-lg font-semibold">{selectedChat ? selectedChat.title : "Choose chat"}</h3>

            </div>
          </div>
        </header>

        {/* If no chat selected show placeholder (on large screens we show placeholder to the right) */}
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-center p-6">
            <div>
              <p className="text- mt-2 text-zinc-500">Pick someone to type something nice :)</p>
            </div>
          </div>
        ) : (
          // Chat window
          <div className="overflow-hidden flex-1 flex flex-col">
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {selectedChat.messages.map((m) => (
                  <div key={m.id} className={m.fromMe ? "chat chat-end" : "chat chat-start"}>
                    
                    <div className="chat-bubble break-words w-fit">
                      {m.text}
                      <div className="chat-header">
                        <time className={`text-xs text-muted ${m.fromMe ? "ms-auto" : ""}`}>{m.time}</time>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input area */}

            <div className="p-2 flex border-t-1 border-base-300">
    
    
              <input  
                  placeholder="Type..."
                  className="w-full p-2 border rounded"
                  value={inputMessage}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={onKeyDown}
                  
              />
              <button className="px-3" onClick={() => sendMessage()}>Send</button>  
          </div>
            {/* <div className="p-3 border-t border-base-300 bg-base-200">
              <div className="max-w-3xl mx-auto flex items-end gap-2">
                <textarea
                  rows={1}
                  className="textarea resize-none"
                  placeholder="Напишите сообщение... (Enter — отправить, Shift+Enter — новая строка)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={onKeyDown}
                />
                <button className="btn" onClick={sendMessage} aria-label="Send">
                  Отправить
                </button>
              </div>
            </div> */}
          </div>
        )}
      </main>

      {/* Find new user modal */}
      <dialog id="find_new_user" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Find new chat 
            <span className={`float-end text-red-600 text-md font-normal
              ${showUserNotFoundWarning ? "" : "hidden"}`}>User not found</span>
            </h3>
          <p className="py-4">Enter username:</p>
          {/* <input type="text" /> */}
          <div>
          <input  
                  placeholder="Username..."
                  className="w-1/2 p-2 border rounded"
                  value={inputFindUsername}
                  onChange={(e) => setFindUsername(e.target.value)}
                  onKeyDown={onKeyDown}
                  
              />
              {/* <button className="btn float-end">Find</button> */}
              <button className="btn btn-outline btn-success float-end"
              onClick={() => {
                findUser()
              }}
              >Find</button>
              </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}

/*
  Интеграция / инструкции
  1. Установите TailwindCSS + daisyUI (если ещё не установлены):
     - npm install -D tailwindcss postcss autoprefixer
     - npx tailwindcss init -p
     - npm i daisyui
     - Добавьте в tailwind.config.js: plugins: [require('daisyui')]
     - Импортируйте в index.css: @tailwind base; @tailwind components; @tailwind utilities;

  2. Положите этот файл в src/components/ChatInterface.tsx и импортируйте его в App.tsx

  3. Для реального приложения:
     - Подгружайте список чатов и сообщений с бэкенда (REST/GraphQL).
     - Отправку/получение сообщений можно сделать через WebSocket (socket.io / native ws) для real-time.
     - Добавьте пагинацию / подгрузку сообщений при скролле вверх.
     - Управление состоянием можно вынести в context / zustand / redux.

  4. Адаптации:
     - Если хотите, могу разделить на мелкие компоненты (ChatList, ChatItem, ChatWindow),
       добавить typing-indicator, delivery/read receipts, и пример WebSocket подключения.
*/
