import React, { useEffect, useState, useContext } from 'react';
import {
	Box,
	Grid,
	Typography,
	Button,
	Card,
	CardContent,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Container,
} from '@mui/material';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../services/AuthContext';
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
} from '@mui/material';

function TeamOperations() {
	const navigate = useNavigate();

	const [teamName, setTeamName] = useState('');
	const [teamMembers, setTeamMembers] = useState([]);
	const [currentUserEmail, setCurrentUserEmail] = useState('');
	const [currentUserRole, setCurrentUserRole] = useState('');
	const { currentUser } = useContext(AuthContext);
	const { isAuthenticated } = useContext(AuthContext);
	const [games, setGames] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const tableContainerStyle = {
		marginBottom: '16px',
	};
	// Get teamId from previous screen
	const location = useLocation();
	const teamId = localStorage.getItem('teamId');

	const [teamStats, setTeamStats] = useState(null);
	const [statsDialogOpen, setStatsDialogOpen] = useState(false);

	const fetchTeamStats = async () => {
		try {
			const response = await axios.get(
				`https://jmflaholi8.execute-api.us-east-1.amazonaws.com/dev/getteamstats?teamId=${teamId}`
			);
			// const response = await axios.get(
			// 	'https://jmflaholi8.execute-api.us-east-1.amazonaws.com/dev/getteamstats?teamId=team-168946653224'
			// );
			setTeamStats(response.data);
			// Open the stats dialog
			setStatsDialogOpen(true);
		} catch (error) {
			console.error('Failed to fetch team stats:', error);
			setTeamStats({
				totalMatches: 0,
			});
			// Open the stats dialog
			setStatsDialogOpen(true);
		}
	};

	const handleUpdate = async (userEmail, action) => {
		console.log(userEmail, 'shvjsdfdgjsfsj');
		try {
			if (
				action === 'updateRole' &&
				userEmail === currentUserEmail &&
				teamMembers.length === 1
			) {
				alert(
					'You cannot demote yourself when you are the only member in the team'
				);
				return;
			}
			const response = await axios.put(
				`https://sq9k6vbyqf.execute-api.us-east-1.amazonaws.com/test/team`,
				{
					teamId: teamId,
					userEmail: userEmail,
					action: action,
				}
			);
			if (action === 'updateRole') {
				console.log(response);
				alert('Role updated successfully!');
				window.location.reload();
			} else if (action === 'kickUser') {
				if (userEmail === currentUserEmail) {
					alert('You kicked yourself out!');
					localStorage.removeItem('teamId');
					navigate('/welcomeTeamPage');
				} else {
					alert('User kicked successfully!');
				}
			}
		} catch (error) {
			console.error('Failed to update user:', error);
		}
	};

	useEffect(() => {
		const fetchTeamMembers = async () => {
			try {
				const response = await axios.get(
					`https://sq9k6vbyqf.execute-api.us-east-1.amazonaws.com/test/team?teamId=${teamId}`
				);
				setTeamName(response.data.teamName);
				setTeamMembers(response.data.teamMembers);
				// Loop through the team members
				response.data.teamMembers.forEach((member) => {
					// If the member's email is the same as the current user's email
					if (member.userEmail === currentUserEmail) {
						// Set the current user's role
						setCurrentUserRole(member.userRole);
					}
				});
			} catch (error) {
				console.error('Failed to fetch team members:', error);
			}
		};

		fetchTeamMembers();
		if (currentUser) {
			setCurrentUserEmail(currentUser.email);
		}

		axios
			.get(
				'https://20b0dq23zl.execute-api.us-east-1.amazonaws.com/dev/fetchgames'
				// "https://0cfsqsski6.execute-api.us-east-1.amazonaws.com/dev/fetchgames"
			)
			.then((result) => {
				setGames(result.data.body);
			})
			.catch((error) => {
				alert(error.response.data.body);
			});
	}, [teamId, currentUserEmail, currentUser, isAuthenticated]);

	const navigateToInviteTeamMembers = () => {
		navigate('/inviteTeam', {
			state: {
				teamId: teamId,
				teamName: teamName,
				teamMembers: teamMembers,
			},
		});
	};

	const handleJoinGame = (gameId, gameName) => {
		// Store the gameId in localStorage
		localStorage.setItem('gameId', gameId);
		localStorage.setItem('teamName', teamName);
		localStorage.setItem('gameName', gameName);
		localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
		// Navigate to the /TeamMembers route
		navigate('/WaitLobby');
	};

	return isAuthenticated ? (
		<Box mt={5}>
			<Grid
				container
				alignItems='center'
				justifyContent='center'
				spacing={2}
			>
				<Grid item>
					<Typography variant='h6'>
						Your Auto-Generated Team Name:
					</Typography>
				</Grid>
				<Grid item>
					<Typography variant='subtitle1' color='primary'>
						{teamName}
					</Typography>
				</Grid>
			</Grid>
			<Box mt={5}>
				<Typography mt={4} mb={2} variant='h6' align='center'>
					{' '}
					Team Members{' '}
				</Typography>
				<Grid container justifyContent='center' spacing={2}>
					{teamMembers.map((member, index) => {
						return (
							<Grid item key={index}>
								<Card
									style={{
										backgroundColor:
											member.userEmail ===
											currentUserEmail
												? 'greenyellow'
												: 'lightgreen',
									}}
									variant='outlined'
								>
									<CardContent>
										<Typography variant='subtitle1'>
											{' '}
											{member.userEmail}{' '}
										</Typography>
										<Typography
											variant='body2'
											color='textSecondary'
										>
											{member.userRole}
											{member.userEmail ===
											currentUserEmail
												? '(You)'
												: ''}
										</Typography>
										<Grid
											mt={2}
											container
											alignItems='center'
										>
											<Grid item>
												{currentUserRole === 'admin' &&
													(member.userRole.toLowerCase() ===
													'admin' ? (
														<Button
															color='secondary'
															onClick={() =>
																handleUpdate(
																	member.userEmail,
																	'updateRole'
																)
															}
														>
															Demote to Member
														</Button>
													) : (
														<Button
															color='primary'
															onClick={() =>
																handleUpdate(
																	member.userEmail,
																	'updateRole'
																)
															}
														>
															Promote to Admin
														</Button>
													))}
											</Grid>
											{/* Render Kick button only if member is not current user */}
											<Grid item>
												{currentUserRole ===
													'admin' && (
													<Button
														color='error'
														onClick={() =>
															handleUpdate(
																member.userEmail,
																'kickUser'
															)
														}
													>
														Kick
													</Button>
												)}
											</Grid>
										</Grid>
									</CardContent>
								</Card>
							</Grid>
						);
					})}
				</Grid>
			</Box>
			<Box
				mt={5}
				mb={5}
				display='flex'
				justifyContent='center'
				alignItems='flex-end'
				gap={2}
			>
				<Button
					variant='contained'
					color='success'
					onClick={navigateToInviteTeamMembers}
					disabled={currentUserRole === 'member'}
				>
					Invite Others
				</Button>
				<Button
					variant='contained'
					color='warning'
					onClick={fetchTeamStats}
				>
					View Team Statistics
				</Button>
				<Button
					variant='contained'
					color='error'
					onClick={() => handleUpdate(currentUserEmail, 'kickUser')}
				>
					Leave Team
				</Button>
			</Box>
			<Container>
				<TableContainer component={Paper} style={tableContainerStyle}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Game Name</TableCell>
								<TableCell>Category</TableCell>
								<TableCell>Difficulty Level</TableCell>
								<TableCell align='right'>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{games
								.slice(
									page * rowsPerPage,
									page * rowsPerPage + rowsPerPage
								)
								.map((game) => (
									<TableRow key={game.gameID}>
										<TableCell>{game.gameName}</TableCell>
										<TableCell>{game.category}</TableCell>
										<TableCell>
											{game.difficultyLevel}
										</TableCell>
										<TableCell align='right'>
											<Button
												variant='contained'
												onClick={() =>
													handleJoinGame(
														game.gameID,
														game.gameName
													)
												}
											>
												Join Game
											</Button>
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]} // Change this array as needed
					component='div'
					count={games.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={(event, newPage) => setPage(newPage)}
					onRowsPerPageChange={(event) => {
						setRowsPerPage(parseInt(event.target.value, 10));
						setPage(0);
					}}
				/>
			</Container>
			<Dialog
				open={statsDialogOpen}
				onClose={() => setStatsDialogOpen(false)}
			>
				<DialogTitle>Team Statistics</DialogTitle>
				{teamStats ? (
					teamStats.totalMatches === 0 ? (
						<DialogContent>
							<Typography variant='subtitle1'>
								Please play games to view your stats.
							</Typography>
						</DialogContent>
					) : (
						<DialogContent>
							<Typography variant='subtitle1'>
								Team Name: {teamStats.teamName}
							</Typography>
							<Typography variant='subtitle1'>
								Total Matches: {teamStats.totalMatches}
							</Typography>
							<Typography variant='subtitle1'>
								Total Wins: {teamStats.totalWins}
							</Typography>
							<Typography variant='subtitle1'>
								Total Losses: {teamStats.totalLosses}
							</Typography>
							<Typography variant='subtitle1'>
								Total Points: {teamStats.totalPoints}
							</Typography>
							<Typography variant='subtitle1'>
								Match History:
							</Typography>
							{teamStats.matchHistory.map((match, index) => (
								<Typography variant='body2' key={index}>
									Game: {match.Game}, Points: {match.Points},
									Won: {match.Won ? 'Yes' : 'No'}, Date:{' '}
									{new Date(match.Date).toLocaleString()},
									Difficulty: {match.Difficulty}, Category:{' '}
									{match.Category}
								</Typography>
							))}
						</DialogContent>
					)
				) : (
					<DialogContent>
						<Typography variant='subtitle1'>Loading...</Typography>
					</DialogContent>
				)}
				<DialogActions>
					<Button
						color='error'
						onClick={() => setStatsDialogOpen(false)}
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	) : (
		<div>Please login to access this page.</div>
	);
}

export default TeamOperations;
