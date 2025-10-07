import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api";

// ChatInterface.tsx
// Single-file React + TypeScript component that demonstrates:
// - Left sidebar with chats
// - Clicking a chat opens a full-screen private conversation
// - Responsive behavior: on small screens the chat takes the whole screen, with Back button
// - Uses Tailwind + daisyUI classes

type Message = {
  id: number;
  fromMe: boolean;
  sender_id: number;
  text: string;
  time: string; // ISO or formatted
  
  isDeleted: boolean;
  editedAt: string;
  receiver_id: number,
  sender_username: string,
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

  const [inputMessageEdit, setMessageEdit] = useState<string>("");
  const [inputMessageEditID, setMessageEditID] = useState<number>(0);

  const [thisUserUsername, setThisUserUsername] = useState<string>("");

  const socketRef = useRef<WebSocket | null>(null);

  const selectedChat = chats.find((c) => c.id === selectedChatId) ?? null;

  // Scroll ref for messages
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  const prevMessagesLengthRef = useRef<number>(0);

  // Скролл только при добавлении новых сообщений
  useEffect(() => {
    if (!selectedChat) return;

    const currentLength = selectedChat.messages.length;

    if (currentLength > prevMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevMessagesLengthRef.current = currentLength;
  }, [selectedChat?.messages]);


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
          type: "message",
          selectedUserId: selectedChatId,
          message: inputMessage
        })
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify(
        {
          type: "message",
          selectedUserId: selectedChatId,
          message: inputMessage
        }
      ))

    }

    setMessage("");
  }

  function editMessage() {
    if (!inputMessageEdit.trim()) return;
    const modalEditMessage = document.getElementById('edit_message') as HTMLDialogElement | null;
    console.log({
          type: "edit_message",
          selectedUserId: selectedChatId,

          message: inputMessageEdit,
          messageID: inputMessageEditID,
        })
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify(
        {
          type: "edit_message",
          selectedUserId: selectedChatId,

          message: inputMessageEdit,
          messageID: inputMessageEditID,
        }
      ))

    }
    
    modalEditMessage?.close()
    // setMessage("");
  }

  function deleteMessage(messageID: number) {
    console.log({
          type: "delete_message",
          messageID: messageID,
          selectedUserId: selectedChatId,
          // message: inputMessageEdit,

        })
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify(
        {
          type: "delete_message",
          messageID: messageID,
          selectedUserId: selectedChatId,
          // message: inputMessageEdit,
        }
      ))

    }
    
    
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
          id: 0,
          fromMe: false,
          text: "",
          time: "",
          sender_id: 0,
          isDeleted: false,
          editedAt: "empty",
          receiver_id: 0,
          sender_username: ''
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


    // IF MESSAGE TYPE MESSAGE  (REGULAR)
    if (data.type == "message") {
      
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
        sender_username: data.sender_username
      };
      console.log(newMessage)
  
      setChats(prevChats => {
        if (newMessage.fromMe) {
  
          const chatIndex = prevChats.findIndex(c => c.id === newMessage.receiver_id);
          console.log(prevChats, "prevChats"); // вот здесь актуальные чаты
          console.log(chatIndex, "chat indesxxx"); // вот здесь актуальные чаты
    
          if (chatIndex === -1) {
  
          };
    
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
    
          if (chatIndex === -1) {
              const newChat: Chat = {
              id: newMessage.sender_id,
              lastMessage: newMessage,
              messages: [newMessage],
              title: newMessage.sender_username,
              unread: newMessage.fromMe ? 0 : 1,
            }
            console.log(newChat, "NEW CHAT IN HERE")
            return [newChat, ...prevChats]
          };
    
          const chat = prevChats[chatIndex];
          const updatedChat: Chat = {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: newMessage,
          };
    
          return [updatedChat, ...prevChats.filter((_, i) => i !== chatIndex)];
        }
      });


    // IF MESSAGE TYPE EDIT_MESSAGE (edit message)
    } else if (data.type == "edit_message") {
        console.log(data, "TIME TO EDIT MESSAGE");

        const updateMessage = (messageID: number, newText: string) => {
          setChats(prevChats =>
            prevChats.map(chat => {
              const updatedMessages = chat.messages.map(msg =>
                msg.id === messageID
                  ? { ...msg, text: newText, editedAt: new Date().toISOString() }
                  : msg
          );
              const updatedLastMessage = updatedMessages[updatedMessages.length - 1];

              return {
                ...chat,
                messages: updatedMessages,
                lastMessage: updatedLastMessage,
              };
            })
          );
        };

      
      updateMessage(data.id, data.text);
      
    } else if (data.type == "delete_message") {
      const deleteMessage = (messageID: number) => {
        
  setChats(prevChats =>
    prevChats.map(chat => {
      // Проверяем, есть ли это сообщение в текущем чате
      const messageExists = chat.messages.some(msg => msg.id === messageID);
      if (!messageExists) return chat;

      // Удаляем сообщение
      const updatedMessages = chat.messages.filter(msg => msg.id !== messageID);

      // Определяем новое lastMessage
      let updatedLastMessage = chat.lastMessage;
      if (chat.lastMessage.id === messageID) {
        // Если удалили последнее сообщение
        if (updatedMessages.length > 0) {
          updatedLastMessage = updatedMessages[updatedMessages.length - 1];
        } else {
          // Если сообщений вообще не осталось
          updatedLastMessage = {
            id: 0,
            fromMe: false,
            sender_id: 0,
            text: "",
            time: "",
            isDeleted: true,
            editedAt: "",
            receiver_id: 0,
            sender_username: "",
          };
        }
      }

      return {
        ...chat,
        messages: updatedMessages,
        lastMessage: updatedLastMessage,
      };
    })
  );
};
    deleteMessage(data.id)
    }
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
      setThisUserUsername(data.your_username)
      console.log(data, "FETCH ALL CHATS")
      const chats: Chat[] = data.chats_list;
      setChats(chats);
      console.log(chats, "ALL CHATS");
      
    })();

    return () => {
      socket.close();
    };
  }, []);
  
  // custom function for formatting time from python to human readable
  function formatDateTime(pythonTime: string) {
    const isoStr = pythonTime.replace(" ", "T").slice(0, 23);
    const isoTime = new Date(isoStr + "Z")
    
    
    const pad = (n: Number) => String(n).padStart(2, "0");
    return `${pad(isoTime.getHours())}:${pad(isoTime.getMinutes())}`+
    ` ${pad(isoTime.getDate())}.${pad(isoTime.getMonth()+1)}.${isoTime.getFullYear()}`

  }

  // function to edit message


  return (
  <div className="h-screen flex bg-base-100">
  {/* Sidebar */}
  <aside
    className={`h-screen flex flex-col transition-all duration-200 border-e border-base-300
      ${selectedChatId ? "hidden md:flex w-80" : "flex w-full md:w-80"}`}
  >
    {/* Заголовок */}
    <div className="flex items-center justify-between p-4 border-b border-base-300">
      <h2 className="text-lg font-semibold"><span className="underline">{thisUserUsername}'s</span> chats</h2>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button className="btn btn-success btn-dash btn-sm"
        onClick={() => {
        const modalFindUser = document.getElementById('find_new_user') as HTMLDialogElement | null;
        if (modalFindUser) {
          modalFindUser.showModal();
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
          <div className="ms-1 truncate w-full">
            <p className="">
              <span className="font-medium">{chat.title}</span>
              <span className="float-end text-sm">{formatDateTime(chat.lastMessage.time)}</span>
            </p>
            
            {/* {chat.lastMessage.text != "" 
              ? <p className="w-full block">{chat.lastMessage.text}</p> 
              : <p className="w-full block text-gray-600 underline">No messages...</p>
            } */}
            {chat.lastMessage.text != "" 
              ? <p className="w-full block">{chat.lastMessage.fromMe
                ? <span><span className="font-bold">You:</span> {chat.lastMessage.text}</span> 
                : <span>{chat.lastMessage.text}</span> 
                }</p> 
              : <p className="w-full block text-gray-600 underline">No messages...</p>
            }
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
                      
                      <div className="chat-header mt-1">
                        {m.fromMe 
                        ? <>
                        {/* Delete button */}
                          <button className="btn btn-ghost btn-xs"
                          onClick={() => {
                            
                            deleteMessage(m.id)
                          }}
                          ><span className="text-red-300">delete</span></button>


                          {/* Edit button */}
                          <button className="btn btn-ghost btn-xs"
                          onClick={() => {
                            const modalEditMessage = document.getElementById('edit_message') as HTMLDialogElement | null;
                            if (modalEditMessage) {
                              setMessageEdit(m.text)
                              setMessageEditID(m.id)
                              
                              modalEditMessage.showModal();
                            }
                          }
                          
                          
                          }
                          ><span className="text-gray-400">edit</span></button>
                        
                        
                        </>
                         : <></>}
                        <span className={`text-xs text-gray-400 h-fit my-auto ${m.fromMe ? "ms-auto" : ""}`}>{formatDateTime(m.time)}</span>
                          {m.editedAt 
                            ? 
                            <span className="my-auto" title={`Edited at: ${formatDateTime(m.editedAt)}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 text-gray-400">
                                <path fillRule="evenodd" d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L6.226 12.25a2.751 2.751 0 0 1-.892.596l-2.047.848a.75.75 0 0 1-.98-.98l.848-2.047a2.75 2.75 0 0 1 .596-.892l7.262-7.261Z" clipRule="evenodd" />
                              </svg>
                            </span>
                            : <></>
                          }

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



      {/* Edit Message modal */}
      <dialog id="edit_message" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Edit message
            {/* <span className={`float-end text-red-600 text-md font-normal
              ${showUserNotFoundWarning ? "" : "hidden"}`}>User not found</span> */}
            </h3>
          <p className="py-4">Enter username:</p>
          {/* <input type="text" /> */}
          <div>
          {/* <input  
                  placeholder="Message"
                  className="w-1/2 p-2 border rounded"
                  value={inputMessageEdit}
                  onChange={(e) => setMessageEdit(e.target.value)}
                  // onKeyDown={onKeyDown}
                  
              /> */}
              <textarea  
                className="textarea w-full"
                value={inputMessageEdit}
                onChange={(e) => setMessageEdit(e.target.value)}

                >
                

              </textarea>
              </div>
              {/* <button className="btn float-end">Find</button> */}
              <div className="my-3">
                <button className="btn btn-outline btn-error"
                onClick={() => {
                  const modalEditMessage = document.getElementById('edit_message') as HTMLDialogElement | null;
                  if (modalEditMessage) {
                    modalEditMessage.close()
                  }
                }}
                >Cancel</button>

                <button className="btn btn-outline btn-success float-end"
                onClick={() => {
                  editMessage()
                }}
                >Edit</button>
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
