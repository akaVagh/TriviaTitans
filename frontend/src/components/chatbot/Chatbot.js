// Author: [Shubham Mishra]

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Paper, List, ListItem, ListItemText, TextField, Button, Typography } from '@mui/material';

const { v4: uuidv4 } = require('uuid');

const userId = uuidv4();

const chatbotAPIEndpoint = 'https://km0vkw6jt0.execute-api.us-east-1.amazonaws.com/test/chatbot';

const Chatbot = () => {
  // State to manage user input and chat history
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // Ref for the chat list element
  const chatListRef = useRef();

    // Function to scroll to the bottom of the chat list
    const scrollToBottom = () => {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    };

  // UseEffect hook to scroll to bottom when chatHistory changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Function to handle user input change
  const handleUserInput = (event) => {
    setUserInput(event.target.value);
  };

  // Function to send a message to the chatbot
  const handleSendMessage = async (event) => {
    event.preventDefault();

    // If user input is not empty, add it to chat history and send the message
    if (userInput.trim() !== '') {
      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        { sender: 'user', message: userInput },
      ]);

      try {
        // Send user input to the chatbot API using axios
        const response = await axios.post(chatbotAPIEndpoint, {
          sessionId: userId,
          text: userInput,
        });

        // Add chatbot's response to chat history
        setChatHistory((prevChatHistory) => [
          ...prevChatHistory,
          { sender: 'bot', message: response.data.body },
        ]);
      } catch (error) {
        console.error('Error sending message to Lex:', error);
      }
    }

    // Clear user input after sending the message
    setUserInput('');
  };

  return (
    <Paper
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 300,
        padding: 16,
        border: '1px solid #ccc',
      }}
    >
      {/* Virtual Assistant header */}
      <Typography variant="h6" align="center" gutterBottom style={{ backgroundColor: 'green', color: 'white' }}>
        Virtual Assistant
      </Typography>
      {/* List to display chat history */}
      <List ref={chatListRef} style={{ height: 400, overflowY: 'scroll' }}>
        {chatHistory.map((chat, index) => (
          <ListItem key={index} style={{ justifyContent: chat.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            {/* Display chat messages with appropriate alignment */}
            <ListItemText
              style={{ textAlign: chat.sender === 'user' ? 'right' : 'left' }}
              primary={chat.sender === 'user' ? 'You' : 'Assistant'}
              secondary={chat.message}
            />
          </ListItem>
        ))}
      </List>
      {/* Form to send messages to the chatbot */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', marginTop: 16 }}>
        {/* Text input for user to type messages */}
        <TextField
          type="text"
          value={userInput}
          onChange={handleUserInput}
          variant="outlined"
          style={{ flex: 1 }}
        />
        {/* Button to send the message */}
        <Button type="submit" variant="contained" color="success" disabled={userInput.trim() === ''}>
          Send
        </Button>
      </form>
    </Paper>
  );
};

export default Chatbot;
