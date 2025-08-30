import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const socket = io('http://localhost:5000');

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const { gigId, recipientId } = useParams();
  const token = localStorage.getItem('token');

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Phase 1: Decode the token and set the user ID
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setCurrentUserId(decodedToken.user.id);
    } catch (error) {
      console.error('Failed to decode token:', error);
      setIsLoading(false);
      return;
    }

    // Phase 2: Fetch message history and connect to Socket.IO
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/messages/${gigId}`, {
          headers: { 'x-auth-token': token }
        });
        setMessages(response.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();

    // Join the gig chat room
    socket.emit('join_gig_chat', gigId);

    // Listen for new messages
    socket.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up function
    return () => {
      socket.off('receive_message');
    };
  }, [gigId, token]);

  // Scroll to bottom whenever messages state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() !== '' && currentUserId) {
      const messageData = {
        sender: currentUserId,
        recipient: recipientId,
        gig: gigId,
        content: messageInput,
      };
      socket.emit('send_message', messageData);
      setMessageInput('');
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading chat...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>Chat</h2>
      <div style={{ height: '400px', overflowY: 'scroll', border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
        {messages.map((msg) => (
          <div key={msg._id} style={{ 
            textAlign: msg.sender === currentUserId ? 'right' : 'left',
            marginBottom: '10px'
          }}>
            <div style={{
              backgroundColor: msg.sender === currentUserId ? '#dcf8c6' : '#f1f0f0',
              color: 'black',
              padding: '10px',
              borderRadius: '10px',
              maxWidth: '70%',
              display: 'inline-block'
            }}>
              <p style={{ margin: 0 }}>{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex' }}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: '1', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button
          type="submit"
          style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', marginLeft: '10px', cursor: 'pointer' }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Message;