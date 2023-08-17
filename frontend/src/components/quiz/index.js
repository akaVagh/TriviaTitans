import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
	Button,
	Typography,
	Paper,
	Box,
	LinearProgress,
	CircularProgress,
} from '@mui/material';
import { quizQuestions } from './questions';
import { styled } from '@mui/styles';
import { WebSocketContext } from '../WebSocketContext/WebSocketProvider';
import { useDispatch, useSelector } from 'react-redux';
import { setIsQuestionLoading } from '../../redux/quizSlice';
import { green, grey, red } from '@mui/material/colors';
import ChatButton from '../teamchat/ChatButton';

const Quiz = (props) => {
	// TODO: Work on getting team Id when start game
	const teamId = localStorage.getItem('teamId');
	const gameId = localStorage.getItem('gameId');

	const currentUser = JSON.parse(localStorage.getItem('currentUser'));
	const currentUserEmail = currentUser.email;

	// console.log('currentUser', currentUser);

	// console.log('currentUserEmail', currentUserEmail);

	const quiz = useSelector((state) => state.quiz);

	const currentQuestion = quiz.currentQuestion;
	const currentQuestionIndex = quiz.currentQuestionIndex + 1;
	const totalQuestions = quiz.totalQuestions;
	const nextResponder = quiz.nextResponder;

	// console.log('currentQuestion', currentQuestion);
	const [isUserTurn, setIsUserTurn] = useState(false);
	const [selectedOption, setSelectedOption] = useState(null);
	const [score, setScore] = useState(0);

	const dispatch = useDispatch();

	const { webSocket, message } = useContext(WebSocketContext);

	// console.log('selectedOption', selectedOption);
	useEffect(() => {
		if (nextResponder === currentUserEmail) {
			// console.log('here', nextResponder);
			setIsUserTurn(true);
		} else {
			setIsUserTurn(false);
		}
		// console.log('nextResponder:', nextResponder, isUserTurn);
	}, [nextResponder]);
	const handleOptionChange = (option) => {
		setSelectedOption(option);
	};

	const handleNextQuestion = () => {
		dispatch(setIsQuestionLoading(true));
		const request = {
			action: 'NEXT_QUESTION',
			teamId: teamId,
			data: {
				teamId: teamId,
				gameId: gameId,
				ansResponder: currentUserEmail,
				submittedAnswer: selectedOption,
			},
		};
		console.log('NEXT_QUESTION', request);

		webSocket.send(JSON.stringify(request));
	};
	// console.log('quiz.isQuestionLoading', quiz.isQuestionLoading);

	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	const options = useMemo(() => {
		let shuffledOptions = shuffleArray([
			...currentQuestion.options,
			currentQuestion.correctAnswer,
		]);
		return shuffledOptions;
	}, [currentQuestion]);

	const styles = {
		box: {
			display: 'flex',
			flexDirection: 'column',
			width: '85%',
			maxWidth: '600px',
			m: 'auto',
			mt: '1rem',
			p: '1.5rem',
			bgcolor: '#F5F5F5',
			boxShadow: '0px 15px 25px rgba(0, 0, 0, 0.1)',
		},
		typography: {
			textAlign: 'center',
			mb: '0.5rem',
			fontSize: '1.5rem',
			color: '#3f51b5',
			fontWeight: 'bold',
		},
		linearProgress: {
			mt: '0.5rem',
			bgcolor: '#eee',
			height: '0.8rem',
			borderRadius: '0.5rem',
		},
		question: {
			textAlign: 'center',
			m: '1.5rem 0',
			fontSize: '1.3rem',
			color: '#555',
		},
		option: (option) => ({
			padding: '0.8rem',
			margin: '0.8rem 0',
			cursor: 'pointer',
			transition: 'all 0.3s ease',
			borderRadius: '1rem',
			boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1)',
			bgcolor: option === selectedOption ? '#4CAF50' : '#fff',
			color: option === selectedOption ? '#fff' : '#444',
		}),
		optionText: {
			fontSize: '1rem',
			fontWeight: 500,
			ml: '1rem',
			color: '#444',
		},
		button: {
			display: 'block',
			m: '1.5rem auto 0',
			p: '0.75rem 1.5rem',
			fontSize: '0.9rem',
			fontWeight: 'bold',
		},
		lightContainer: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			width: '100%',
			height: '110px',
		},
		indicatorText: {
			fontSize: '1rem',
			fontWeight: 'bold',
			color: '#555',
		},
		trafficLight: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			width: '100px',
			height: '30px',
			backgroundColor: '#333',
			borderRadius: '15px',
			padding: '3px',
			mt: '1rem',
		},
		light: (color) => ({
			bgcolor: color,
			width: '25px',
			height: '25px',
			borderRadius: '50%',
			mx: '3px',
			boxShadow: '0 0 10px 5px rgba(0, 0, 0, 0.2)',
		}),
	};

	return (
		<div>
			<Box sx={styles.box}>
				<Box sx={styles.lightContainer}>
					<Typography sx={styles.indicatorText}>
						{isUserTurn ? 'Your Turn' : "Other Team Member's Turn"}
					</Typography>
					<Box sx={styles.trafficLight}>
						<Box
							sx={styles.light(
								isUserTurn ? green[500] : grey[500]
							)}
						/>
						<Box
							sx={styles.light(
								!isUserTurn ? red[500] : grey[500]
							)}
						/>
					</Box>
				</Box>
				<Typography sx={styles.typography}>
					<span>Question {currentQuestionIndex}</span>/{' '}
					{totalQuestions}
				</Typography>
				<LinearProgress
					variant='determinate'
					value={(currentQuestionIndex / totalQuestions) * 100}
					sx={styles.linearProgress}
				/>
				<Typography variant='h4' component='h1' sx={styles.question}>
					{currentQuestion.question}
				</Typography>

				{options.map((option, index) => (
					<Paper
						elevation={2}
						key={index}
						sx={styles.option(option)}
						onClick={() => handleOptionChange(option)}
					>
						<Typography variant='body1' sx={styles.optionText}>
							{option}
						</Typography>
					</Paper>
				))}

				<Button
					disabled={!(selectedOption && isUserTurn)}
					variant='contained'
					color='primary'
					onClick={handleNextQuestion}
					sx={styles.button}
				>
					{quiz.isQuestionLoading ? (
						<CircularProgress color='inherit' size={24} />
					) : (
						'Submit'
					)}
				</Button>
				<div>
					<ChatButton />
				</div>
			</Box>
		</div>
	);
};

export default Quiz;
