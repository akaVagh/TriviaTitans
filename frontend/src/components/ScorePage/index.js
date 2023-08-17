import React, { useEffect, useState } from 'react';
import {
	Typography,
	Box,
	Card,
	CardContent,
	Grid,
	Button,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ScorePage = () => {
	const score = useSelector((state) => state.score.score);
	const result = useSelector((state) => state.quiz.result);
	const navigate = useNavigate();
	const [teamName, setTeamName] = useState("");
	const [gameName, setGameName] = useState("");
	console.log('score.result', result);

	useEffect(() => {
		// Fetch teamName and gameName from localStorage
		setTeamName(localStorage.getItem('teamName'));
		setGameName(localStorage.getItem('gameName'));
	}, []);

	const handleButtonClick = async () => {
		// make the function async
		// Add the POST request
		const url =
			'https://oz5x35a4ea.execute-api.us-east-1.amazonaws.com/test/publish';
		const data = {
			target: 'all',
			message: `Hello players, the leaderboard ranks have changed. Please view the leaderboard on your profile page. `,
		};

		try {
			const response = await axios.post(url, data);
			console.log(response.data); // log the response to the console
			alert(
				'The leaderboard ranks have changed. View your inbox for notifications!'
			);
		} catch (error) {
			console.error('Error sending POST request:', error); // log any error
		}

		// Post to achievement API regardless of the game result
		try {
			const achievementUrl = 'https://k0wesz1f4i.execute-api.us-east-1.amazonaws.com/dev/achievement';
			const achievementData = {
			  teamName,
			  gameName,
			  gameResult: result ? 'won' : 'loss',
			};
		
			const achievementResponse = await axios.post(achievementUrl, achievementData);
			console.log(achievementResponse.data);
			alert('Please view your achievements in your inbox.');
		  } catch (error) {
			console.error('Error sending POST request to achievement API:', error);
		}

		// Navigate after the POST request
		navigate('/teamOperations');
	};

	if (!score) {
		return <div>Loading...</div>;
	}

	return (
		<Box
			sx={{
				minHeight: '100vh',
				backgroundColor: '#f4f6f8',
				p: 2,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
			}}
		>
			<Grid container justifyContent='center'>
				<Grid item xs={12} sm={8} md={6}>
					<Card
						sx={{ p: 2, backgroundColor: '#ffffff' }}
						elevation={3}
					>
						<CardContent>
							{result ? (
								<Typography
									variant='h3'
									sx={{ color: 'green' }}
								>
									Match Won
								</Typography>
							) : (
								<Typography variant='h3' sx={{ color: 'red' }}>
									Match Loss
								</Typography>
							)}
							<Typography variant='h5' sx={{ color: '#0d47a1' }}>
								Team Score: {score.teamScore}
							</Typography>

							{score.members &&
								Object.entries(score.members).map(
									([email, scores]) => (
										<Card
											sx={{
												my: 2,
												backgroundColor: '#e0f7fa',
											}}
											elevation={1}
										>
											<CardContent>
												<Typography
													variant='h6'
													sx={{ color: '#bf360c' }}
												>
													{email}
												</Typography>
												<Typography variant='body1'>
													Correct Answers:{' '}
													{scores.correctAnswersCount}
												</Typography>
												<Typography variant='body1'>
													Incorrect Answers:{' '}
													{
														scores.incorrectAnswersCount
													}
												</Typography>
											</CardContent>
										</Card>
									)
								)}
							<Button
								variant='contained'
								onClick={handleButtonClick}
								color='primary'
								style={{
									width: '150px',
									marginTop: '20px',
								}}
							>
								Team Page
							</Button>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default ScorePage;
