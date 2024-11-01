import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from "react";


interface Message {
    username: string;
    message: string;
    timestamp: string;
    typing: boolean;
}

const ChatRoom: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [chat, setChat] = useState<Message[]>([]);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const messageRef = useRef<HTMLInputElement>(null);

    // WebSocket connection
    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080/ws");

        socket.onmessage = (event) => {
            const messageData: Message = JSON.parse(event.data);

            if (messageData.typing && messageData.username !== username) {
                setTypingUser(messageData.username); // Show who is typing
            } else if (!messageData.typing) {
                setChat((prevChat) => [...prevChat, messageData]);
                setTypingUser(null); // Stop showing the typing indicator
            }
        };

        setWs(socket);

        // Cleanup WebSocket connection
        return () => {
            socket.close();
        };
    }, [username]);

    // Handle sending the message
    const sendMessage = () => {
        if (ws && message && username) {
            const timestamp = new Date().toLocaleTimeString();
            const msg: Message = { username, message, timestamp, typing: false };
            ws.send(JSON.stringify(msg));
            setMessage("");
        }
    };

    // Detect when Enter key is pressed
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    // Handle message input change
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        if (ws && username) {
            const typingMessage: Message = { username, message: "", timestamp: "", typing: true };
            ws.send(JSON.stringify(typingMessage));
        }
    };

    // Add emoji to the message
    const addEmoji = (emoji: any) => {
        setMessage((prevMessage) => prevMessage + emoji.native);
        setShowPicker(false);
    };

    return (
        <div className="chatroom-container">
            <div className="chatbox">
                <h2>Chat Room</h2>

                <div className="chat-inputs">
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="chat-window">
                    {typingUser && <div className="typing-indicator">{typingUser} is typing...</div>}
                    {chat.map((msg, index) => (
                        <div
                            key={index}
                            className={`chat-message ${msg.username === username ? "own-message" : ""}`}
                        >
                            <div className="chat-message-info">
                                <img
                                    src={`https://avatars.dicebear.com/api/initials/${msg.username}.svg`}
                                    alt="avatar"
                                    className="chat-avatar"
                                />
                                <strong className="username">{msg.username}</strong>
                                <span className="timestamp"> at {msg.timestamp}</span>
                            </div>
                            <div>{msg.message}</div>
                        </div>
                    ))}
                </div>

                <div className="chat-inputs">
                    <input
                        ref={messageRef}
                        type="text"
                        placeholder="Enter your message"
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                    />
                    <button onClick={sendMessage}>Send</button>
                    <button onClick={() => setShowPicker(!showPicker)}>😊</button>
                    {showPicker && <Picker data={data} onEmojiSelect={addEmoji} />}
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;