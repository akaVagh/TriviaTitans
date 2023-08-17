//Author: Dev Rajawat
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';

//URL for Web Socket API
const URL = 'wss://badzjszszd.execute-api.us-east-1.amazonaws.com/production';

const ChatBox = ({ onClose }) => {
	const socket = useRef(null);
	const [isConnected, setIsConnected] = useState(false);
	const [members, setMembers] = useState([]);
	const [chatRows, setChatRows] = useState([]);
	const [publicMessage, setPublicMessage] = useState('');
	const [isChatVisible, setIsChatVisible] = useState(true);

	const currentUser = JSON.parse(localStorage.getItem('currentUser'));
	const onSocketOpen = useCallback(() => {
		setIsConnected(true);
		const name = currentUser.displayName;
		socket.current?.send(JSON.stringify({ action: 'setName', name }));
	}, []);

	const onSocketClose = useCallback(() => {
		setMembers([]);
		setIsConnected(false);
		setChatRows([]);
	}, []);

	const onSocketMessage = useCallback((dataStr) => {
		const data = JSON.parse(dataStr);
		if (data.members) {
			setMembers(data.members);
			console.log(members);
		} else if (data.publicMessage) {
			setChatRows((oldArray) => [
				...oldArray,
				{ message: data.publicMessage, sender: data.name },
			]);
		} else if (data.privateMessage) {
			alert(data.privateMessage);
		} else if (data.systemMessage) {
			setChatRows((oldArray) => [
				...oldArray,
				{ message: data.systemMessage, system: true },
			]);
		}

	}, []);

	const onConnect = useCallback(() => {
		if (socket.current?.readyState !== WebSocket.OPEN) {
			socket.current = new WebSocket(URL);
			socket.current.addEventListener('open', onSocketOpen);
			socket.current.addEventListener('close', onSocketClose);
			socket.current.addEventListener('message', (event) => {
				onSocketMessage(event.data);
			});
		}
	}, []);

	useEffect(() => {
		return () => {
			socket.current?.close();
		};
	}, []);

	const onSendPrivateMessage = useCallback((to) => {
		const message = prompt('Enter private message for ' + to);
		socket.current?.send(
			JSON.stringify({
				action: 'sendPrivate',
				message,
				to,
			})
		);
	}, []);

	const onSendMessage = useCallback(() => {
		if (publicMessage.trim() !== '') {
			socket.current?.send(
				JSON.stringify({
					action: 'sendPublic',
					message: publicMessage.trim(),
				})
			);
			setPublicMessage('');
		}
	}, [publicMessage]);

	const handlePublicMessageKeyPress = (event) => {
		if (event.key === 'Enter') {
			onSendMessage();
		}
	};



	const handleChatVisibility = () => {
		setIsChatVisible((prev) => !prev);
	};

	return (
		<>
			{isChatVisible && (
				<div
					style={{
						position: 'fixed',
						right: 10,
						bottom: 20,
						display: 'flex',
					}}
				>
					<Paper
						style={{
							width: '400px',
							maxWidth: 400,
							height: '70vh',
							borderRadius: 8,
							boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								padding: '10px 20px',
								backgroundColor: '#008000',
								color: 'white',
								borderRadius: '8px 8px 0 0',
							}}
						>
							<span>Chat Box</span>
							<CloseIcon
								onClick={handleChatVisibility}
								style={{ cursor: 'pointer' }}
							/>
						</div>
						<div
							style={{
								flex: '1 1 0',
								overflowY: 'auto',
								padding: '10px 20px',
								background: '#fff',
							}}
						>
							<ul
								style={{
									listStyleType: 'none',
									padding: 0,
									margin: 0,
									maxHeight: 'calc(70vh - 100px)',
									overflowY: 'auto',
								}}
							>
								{chatRows.map((item, i) => (
									<li key={i}>
										<span
											style={{
												maxWidth: '70%',
												padding: '6px 10px',
												borderRadius: '8px',
												wordBreak: 'break-word',
												boxShadow:
													'0px 1px 1px rgba(0, 0, 0, 0.1)',
												color: 'black',
											}}
										>
											<br />
											{item.system ? (
												<i>{item.message}</i>
											) : (
												`${item.message}`
											)}
										</span>
									</li>
								))}
							</ul>
						</div>
						{isConnected ? (
							<div
								style={{
									borderTop: '1px solid #ccc',
									padding: '10px',
								}}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<TextField
										fullWidth
										variant='outlined'
										label='Enter team message'
										value={publicMessage}
										onChange={(e) =>
											setPublicMessage(e.target.value)
										}
										onKeyPress={handlePublicMessageKeyPress}
									/>
									<Button
										variant='contained'
										size='small'
										disableElevation
										onClick={onSendMessage}
									>
										Send
									</Button>
								</div>
							</div>
						) : (
							<div
								style={{
									borderTop: '1px solid #ccc',
									padding: '10px',
								}}
							>
								<Button
									variant='outlined'
									size='small'
									disableElevation
									onClick={onConnect}
								>
									Connect
								</Button>
							</div>
						)}
						<div
							style={{
								position: 'absolute',
								right: 9,
								top: 8,
								width: 12,
								height: 12,
								backgroundColor: isConnected
									? '#00da00'
									: '#e2e2e2',
								borderRadius: 50,
							}}
						/>
					</Paper>
					<div
						style={{
							flex: '0 0 100px',
							overflowY: 'auto',
							background: '#f9f9f9',
							borderTopRightRadius: '8px',
							borderBottomRightRadius: '8px',
							padding: '10px 20px',
						}}
					>
						<List component='nav'>
							{members.map((item) => (
								<ListItem
									key={item}
									onClick={() => {
										onSendPrivateMessage(item);
									}}
									button
								>
									<ListItemText
										style={{
											fontWeight: 800,
											color: '#008000',
											textAlign: 'left',
										}}
										primary={item}
									/>
								</ListItem>
							))}
						</List>
					</div>
				</div>
			)}
			{!isChatVisible && (
				<div>
					{/* </div> style={{ position: 'fixed', bottom: 20, right: 20 }}> */}
					<Button
						variant='contained'
						color='success'
						onClick={handleChatVisibility}
					>
						Open Chat
					</Button>
				</div>
			)}
		</>
	);
};

export default ChatBox;
