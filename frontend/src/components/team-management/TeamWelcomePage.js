import { Box, Button, Typography, Card, CardContent } from '@mui/material';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../services/AuthContext';

function TeamWelcomePage() {
	const navigate = useNavigate();
	const [userTeams, setUserTeams] = useState([]);
	const [currentUserEmail, setCurrentUserEmail] = useState('');
	const { currentUser } = useContext(AuthContext);
	const { isAuthenticated } = useContext(AuthContext);

	useEffect(() => {
		if (currentUser) {
			setCurrentUserEmail(currentUser.email);
		}
	}, [currentUser, isAuthenticated]);

	useEffect(() => {
		if (currentUserEmail) {
			getTeamDetails();
		}
	}, [currentUserEmail]);

	const getTeamDetails = async () => {
		try {
			const response = await axios.get(
				`https://sq9k6vbyqf.execute-api.us-east-1.amazonaws.com/test/team-by-user?userEmail=${currentUserEmail}`
			);
			console.log('This is output', response.data);
			setUserTeams(response.data);
		} catch (error) {
			console.error(error.message);
		}
	};

	const createTeam = async () => {
		try {
			const response = await axios.post(
				'https://sq9k6vbyqf.execute-api.us-east-1.amazonaws.com/test/team',
				{
					userEmail: currentUserEmail,
				}
			);
			alert('Team created successfully!');
			alert(
				'Please confirm subscription in your inbox for team notifications!'
			);
			window.location.reload();
		} catch (error) {
			console.error('Error creating team:', error);
		}
	};

	const viewTeam = (teamId) => {
		localStorage.setItem('teamId', teamId);
		navigate('/teamOperations');
	};

	return isAuthenticated ? (
		<Box
			display='flex'
			justifyContent='center'
			alignItems='center'
			minHeight='100vh'
		>
			<Box width='50%'>
				<Box mb={2}>
					<Typography variant='h6' align='center' gutterBottom>
						Let's create a team to play, let's go!
					</Typography>
				</Box>
				<Box textAlign='center'>
					<Button
						color='success'
						variant='contained'
						onClick={createTeam}
					>
						Create Team
					</Button>
				</Box>
			</Box>
			<Box width='50%'>
				<Box mb={2}>
					<Typography variant='h6' align='center' gutterBottom>
						Your Teams
					</Typography>
				</Box>
				{userTeams.map((team, index) => (
					<Card key={index}>
						<CardContent>
							<Typography variant='h5'>
								{team.teamName}
							</Typography>
							<Button
								variant='contained'
								onClick={() => viewTeam(team.teamId)}
							>
								View Team
							</Button>
						</CardContent>
					</Card>
				))}
			</Box>
		</Box>
	) : (
		<div>Please login to access this page.</div>
	);
}

export default TeamWelcomePage;
