import React, { useState } from 'react';
import Button from '@mui/material/Button';
import ChatBox from './ChatBox';

const ChatButton = () => {
	const [showChat, setShowChat] = useState(false);

	const handleChatButtonClick = () => {
		setShowChat((prevShowChat) => !prevShowChat);
	};

	const handleChatBoxClose = () => {
		setShowChat(false);
	};

	return (
		<div>
			{showChat ? (
				<ChatBox onClose={handleChatBoxClose} />
			) : (
				<Button
					variant='contained'
					color='success'
					onClick={handleChatButtonClick}
					// style={{ position: 'fixed', bottom: 20, right: 20 }}
				>
					Chat
				</Button>
			)}
		</div>
	);
};

export default ChatButton;
