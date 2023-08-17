import React, { useEffect, useState, useContext } from 'react';
import { AccountCircle, Notifications, Android } from '@mui/icons-material';
import {
	AppBar,
	Toolbar,
	Typography,
	IconButton,
	Menu,
	MenuItem,
	Drawer,
	Card,
	CardActions,
	Button,
	CardContent,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { AuthContext } from '../../services/AuthContext';
import Chatbot from '../chatbot/Chatbot';
import { useDispatch } from 'react-redux';
import { resetQuiz } from '../../redux/quizSlice';

function Navbar() {
	const [anchorEl, setAnchorEl] = useState(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isChatbotOpen, setIsChatbotOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [currentUserEmail, setCurrentUserEmail] = useState('');
	const { setIsSecondFactorAuthDone } = useContext(AuthContext);
	const navigate = useNavigate();
	const { currentUser } = useContext(AuthContext);
	const { isAuthenticated } = useContext(AuthContext);
	const dispatch = useDispatch();

	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	useEffect(() => {
		if (currentUser) {
			setCurrentUserEmail(currentUser.email);
		}
	}, [currentUser, isAuthenticated]);

	const handleNotificationClick = async () => {
		if (!isAuthenticated) {
			alert('Please log in, to view notifications!');
			return;
		}
		try {
			const response = await axios.get(
				`https://sq9k6vbyqf.execute-api.us-east-1.amazonaws.com/test/team-notifications?userEmail=${currentUserEmail}`
			);
			setNotifications(response.data);
			setIsDrawerOpen(true);
		} catch (error) {
			console.error('Failed to retrieve notifications:', error);
			setNotifications([
				{
					type: 'default',
					message: "You don't have any notifications",
				},
			]);
			setIsDrawerOpen(true);
		}
	};

	const handleAcceptInvite = async (teamId) => {
		try {
			await axios.post(
				'https://sq9k6vbyqf.execute-api.us-east-1.amazonaws.com/test/team-notifications',
				{
					action: 'accept',
					userEmail: currentUserEmail,
					teamId: teamId,
				}
			);
			// setNotifications(prevNotifications => ({
			//     ...prevNotifications,
			//     messages: prevNotifications.messages.filter(notification => notification.teamId !== teamId),
			// }));
			alert('Invite accepted!');
			alert(
				'Please confirm subscription in your inbox/spam to receive team notifications!'
			);
			window.location.reload();
		} catch (error) {
			console.error('Failed to accept invite:', error);
		}
	};

	const handleDeclineInvite = async (teamId) => {
		try {
			const response = await axios.post(
				'https://sq9k6vbyqf.execute-api.us-east-1.amazonaws.com/test/team-notifications',
				{
					action: 'decline',
					userEmail: currentUserEmail,
					teamId: teamId,
				}
			);
			console.log('Invite decline response:', response);
			// setNotifications(prevNotifications => ({
			//     ...prevNotifications,
			//     messages: prevNotifications.messages.filter(notification => notification.teamId !== teamId),
			// }));
			alert('Invite declined');
			window.location.reload();
		} catch (error) {
			console.error('Failed to decline invite:', error);
		}
	};

	const handleDrawerClose = () => {
		setIsDrawerOpen(false);
	};

	const handleLogout = () => {
		setAnchorEl(null);
		firebase.auth().signOut();
		setIsSecondFactorAuthDone(false);
		localStorage.setItem('isSecondFactorAuthDone', JSON.stringify(false));
		dispatch(resetQuiz());
		navigate('/SignIn');
	};

	const handleProfile = () => {
		setAnchorEl(null);
		navigate('Profile');
	};
	const handleQuiz = () => {
		setAnchorEl(null);
		navigate('Quiz');
	};

	const handleChatBotOpen = (event) => {
		setIsChatbotOpen(!isChatbotOpen);
	};

	return (
		<>
			<AppBar position='static' style={{ background: 'green' }}>
				<Toolbar>
					<IconButton
						edge='start'
						color='inherit'
						aria-label='notifications'
						onClick={handleNotificationClick}
					>
						<Notifications />
					</IconButton>
					<Typography
						variant='h6'
						style={{ flexGrow: 1, textAlign: 'center' }}
					>
						Trivia Titans
					</Typography>
					<IconButton
						edge='end'
						color='inherit'
						aria-label='profile'
						onClick={handleChatBotOpen}
					>
						<Android />
					</IconButton>
					<IconButton
						edge='end'
						color='inherit'
						aria-label='profile'
						onClick={handleMenuOpen}
					>
						<AccountCircle />
					</IconButton>
					<Menu
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={handleMenuClose}
					>
						{isAuthenticated ? (
							<>
								<MenuItem onClick={handleProfile}>
									My Profile
								</MenuItem>
								<MenuItem onClick={handleLogout}>
									Log Out
								</MenuItem>
							</>
						) : (
							<MenuItem onClick={() => navigate('/SignIn')}>
								Log In
							</MenuItem>
						)}
					</Menu>
				</Toolbar>
				{isChatbotOpen && <Chatbot />}
			</AppBar>

			<Drawer
				anchor='left'
				open={isDrawerOpen}
				onClose={handleDrawerClose}
			>
				<Typography variant='h6' style={{ padding: '16px' }}>
					Notifications Tray
				</Typography>
				{notifications.messages &&
					notifications.messages.map((message, index) => (
						<Card
							key={index}
							sx={{ maxWidth: 345, margin: '10px' }}
						>
							<CardContent>
								<Typography
									variant='body2'
									color='text.secondary'
								>
									{message.content}
								</Typography>
							</CardContent>
							{message.type === 'team invite' && (
								<CardActions>
									<Button
										size='small'
										color='primary'
										onClick={() =>
											handleAcceptInvite(message.teamId)
										}
									>
										Accept
									</Button>
									<Button
										size='small'
										color='secondary'
										onClick={() =>
											handleDeclineInvite(message.teamId)
										}
									>
										Decline
									</Button>
								</CardActions>
							)}
						</Card>
					))}
			</Drawer>
		</>
	);
}

export default Navbar;
