import React, { useState, useEffect, useContext } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
	Chip,
} from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import axios from 'axios';
import { v1 as uuid } from 'uuid';
import { AuthContext } from '../../services/AuthContext';

const containerStyle = {
	marginBottom: '16px',
};

const tableContainerStyle = {
	marginBottom: '16px',
};

const QuestionsManagePage = () => {
	const [questions, setQuestions] = useState([]);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedQuestion, setSelectedQuestion] = useState(null);
	const [newQuestion, setNewQuestion] = useState({
		question: '',
		options: [],
		correctAnswer: '',
		category: '',
		difficultyLevel: '',
		tags: [],
	});
	const [tagInputValue, setTagInputValue] = useState('');
	const [optionInputValue, setOptionInputValue] = useState('');
	const { currentUser } = useContext(AuthContext);
	const { isAuthenticated } = useContext(AuthContext);

	// Pagination state
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5); // You can adjust the number of rows per page here

	useEffect(() => {
		if (currentUser) {
			axios
				.get(
					'https://znf7w2d5pi.execute-api.us-east-1.amazonaws.com/dev/fetchquestions'
					//   "https://49ne542hc9.execute-api.us-east-1.amazonaws.com/dev/fetchquestions"
				)
				.then((result) => {
					setQuestions(result.data.body);
				})
				.catch((error) => {
					alert(error.response.data.body);
				});
		}
	}, [currentUser, isAuthenticated]);

	const handleAddModalOpen = () => {
		setIsAddModalOpen(true);
	};

	const handleAddModalClose = () => {
		setIsAddModalOpen(false);
		setNewQuestion({
			question: '',
			options: [],
			correctAnswer: '',
			category: '',
			difficultyLevel: '',
			tags: [],
		});
		setTagInputValue('');
		setOptionInputValue('');
	};

	const handleEditModalOpen = (question) => {
		setSelectedQuestion(question);
		setNewQuestion(question);
		setIsEditModalOpen(true);
	};

	const handleEditModalClose = () => {
		setIsEditModalOpen(false);
		setSelectedQuestion(null);
		setNewQuestion({
			question: '',
			options: [],
			correctAnswer: '',
			category: '',
			difficultyLevel: '',
			tags: [],
		});
		setTagInputValue('');
		setOptionInputValue('');
	};

	const handleDeleteModalOpen = (question) => {
		setSelectedQuestion(question);
		setIsDeleteModalOpen(true);
	};

	const handleDeleteModalClose = () => {
		setIsDeleteModalOpen(false);
		setSelectedQuestion(null);
	};

	const handleAddQuestion = () => {
		let questionID = uuid();
		let keyAddedValue = newQuestion;
		keyAddedValue.questionID = questionID;
		axios
			.post(
				'https://znf7w2d5pi.execute-api.us-east-1.amazonaws.com/dev/addquestion',
				// "https://49ne542hc9.execute-api.us-east-1.amazonaws.com/dev/addquestion",
				keyAddedValue
			)
			.then((result) => {
				setQuestions([...questions, newQuestion]);
				setNewQuestion({
					question: '',
					options: [],
					correctAnswer: '',
					category: '',
					difficultyLevel: '',
					tags: [],
				});
			})
			.catch((error) => {
				alert(error.response.data.body);
			});
		// Close the modal and reset newQuestion state
		handleAddModalClose();
	};

	const handleUpdateQuestion = (questionId) => {
		let keyAddedValue = newQuestion;
		keyAddedValue.questionID = questionId;
		axios
			.post(
				'https://znf7w2d5pi.execute-api.us-east-1.amazonaws.com/dev/editquestion',
				// "https://49ne542hc9.execute-api.us-east-1.amazonaws.com/dev/editquestion",
				keyAddedValue
			)
			.then((result) => {
				alert('Updated');
				const updatedQuestions = questions.map((question) => {
					if (question.questionID === questionId) {
						return {
							...newQuestion,
							questionID: question.questionID,
						};
					}
					return question;
				});
				setQuestions(updatedQuestions);
				setNewQuestion({
					question: '',
					options: [],
					correctAnswer: '',
					category: '',
					difficultyLevel: '',
					tags: [],
				});
				setSelectedQuestion(null);
			})
			.catch((error) => {
				alert(error.response.data.body);
			});
		// Update questions state
		// Close the modal and reset selectedQuestion and newQuestion state
		handleEditModalClose();
	};

	const handleDeleteQuestion = (questionId) => {
		axios
			.post(
				'https://znf7w2d5pi.execute-api.us-east-1.amazonaws.com/dev/deletequestion',
				// "https://49ne542hc9.execute-api.us-east-1.amazonaws.com/dev/deletequestion",
				{
					questionID: questionId,
				}
			)
			.then((result) => {
				const updatedQuestions = questions.filter(
					(question) => question.questionID !== questionId
				);
				setQuestions(updatedQuestions);
				setSelectedQuestion(null);
			})
			.catch((error) => {
				alert(error.response.data.body);
			});

		// Update questions state

		// Close the modal and reset selectedQuestion state
		handleDeleteModalClose();
	};

	const handleNewQuestionChange = (field, value) => {
		setNewQuestion((prevQuestion) => ({
			...prevQuestion,
			[field]: value,
		}));
	};

	const handleTagsChange = (event) => {
		const { value } = event.target;
		setTagInputValue(value);
	};

	const handleAddTag = () => {
		if (tagInputValue.trim()) {
			setNewQuestion((prevQuestion) => ({
				...prevQuestion,
				tags: [...prevQuestion.tags, tagInputValue.trim()],
			}));
			setTagInputValue('');
		}
	};

	const handleDeleteTag = (tag) => {
		setNewQuestion((prevQuestion) => ({
			...prevQuestion,
			tags: prevQuestion.tags.filter((t) => t !== tag),
		}));
	};

	const handleOptionsChange = (event) => {
		const { value } = event.target;
		setOptionInputValue(value);
	};

	const handleAddOption = () => {
		if (optionInputValue.trim()) {
			setNewQuestion((prevQuestion) => ({
				...prevQuestion,
				options: [...prevQuestion.options, optionInputValue.trim()],
			}));
			setOptionInputValue('');
		}
	};

	const handleDeleteOption = (option) => {
		setNewQuestion((prevQuestion) => ({
			...prevQuestion,
			options: prevQuestion.options.filter((opt) => opt !== option),
		}));
	};

	// Pagination change handler
	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return isAuthenticated ? (
		<Container style={containerStyle}>
			<br />
			<Button
				variant='contained'
				startIcon={<AddIcon />}
				onClick={handleAddModalOpen}
			>
				Add Question
			</Button>

			<TableContainer component={Paper} style={tableContainerStyle}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Question</TableCell>
							<TableCell align='right'>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{questions
							.slice(
								page * rowsPerPage,
								page * rowsPerPage + rowsPerPage
							) // Apply pagination to the displayed rows
							.map((question) => (
								<TableRow key={question.questionID}>
									<TableCell component='th' scope='row'>
										{question.question}
									</TableCell>
									<TableCell align='right'>
										<IconButton
											aria-label='edit'
											onClick={() =>
												handleEditModalOpen(question)
											}
										>
											<EditIcon />
										</IconButton>
										<IconButton
											aria-label='delete'
											onClick={() =>
												handleDeleteModalOpen(question)
											}
										>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Add TablePagination */}
			<TablePagination
				rowsPerPageOptions={[5, 10, 20]} // Customize the available rows per page options
				component='div'
				count={questions.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>

			<Dialog open={isAddModalOpen} onClose={handleAddModalClose}>
				<DialogTitle>Add Question</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Fill in the details for the new question:
					</DialogContentText>
					<TextField
						autoFocus
						label='Question'
						fullWidth
						value={newQuestion.question}
						onChange={(e) =>
							handleNewQuestionChange('question', e.target.value)
						}
						style={{ marginBottom: '8px' }}
					/>
					<div style={{ marginBottom: '8px' }}>
						<TextField
							label='Options'
							fullWidth
							value={optionInputValue}
							onChange={handleOptionsChange}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									handleAddOption();
								}
							}}
						/>
						<Button
							variant='outlined'
							onClick={handleAddOption}
							disabled={!optionInputValue.trim()}
						>
							Add Option
						</Button>
					</div>
					<div style={{ marginBottom: '8px' }}>
						{newQuestion.options.map((option) => (
							<Chip
								key={option}
								label={option}
								onDelete={() => handleDeleteOption(option)}
								style={{
									marginRight: '8px',
									marginBottom: '8px',
								}}
							/>
						))}
					</div>
					<TextField
						label='Correct Answer'
						fullWidth
						value={newQuestion.correctAnswer}
						onChange={(e) =>
							handleNewQuestionChange(
								'correctAnswer',
								e.target.value
							)
						}
						style={{ marginBottom: '8px' }}
					/>
					<TextField
						label='Category'
						fullWidth
						value={newQuestion.category}
						onChange={(e) =>
							handleNewQuestionChange('category', e.target.value)
						}
						style={{ marginBottom: '8px' }}
					/>
					<TextField
						label='Difficulty Level'
						fullWidth
						value={newQuestion.difficultyLevel}
						onChange={(e) =>
							handleNewQuestionChange(
								'difficultyLevel',
								e.target.value
							)
						}
						style={{ marginBottom: '8px' }}
					/>
					{/* <TextField
            label="Explanation"
            fullWidth
            value={newQuestion.explanation}
            onChange={(e) =>
              handleNewQuestionChange("explanation", e.target.value)
            }
            style={{ marginBottom: "8px" }}
          /> */}
					<div style={{ marginBottom: '8px' }}>
						<TextField
							label='Tags'
							fullWidth
							value={tagInputValue}
							onChange={handleTagsChange}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									handleAddTag();
								}
							}}
						/>
						<Button
							variant='outlined'
							onClick={handleAddTag}
							disabled={!tagInputValue.trim()}
						>
							Add Tag
						</Button>
					</div>
					<div style={{ marginBottom: '8px' }}>
						{newQuestion.tags.map((tag) => (
							<Chip
								key={tag}
								label={tag}
								onDelete={() => handleDeleteTag(tag)}
								style={{
									marginRight: '8px',
									marginBottom: '8px',
								}}
							/>
						))}
					</div>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleAddModalClose}>Cancel</Button>
					<Button
						onClick={handleAddQuestion}
						disabled={!newQuestion.question}
					>
						Add
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={isEditModalOpen} onClose={handleEditModalClose}>
				<DialogTitle>Edit Question</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Modify the details for the selected question:
					</DialogContentText>
					<TextField
						autoFocus
						label='Question'
						fullWidth
						value={newQuestion.question}
						onChange={(e) =>
							handleNewQuestionChange('question', e.target.value)
						}
						style={{ marginBottom: '8px' }}
					/>
					<div style={{ marginBottom: '8px' }}>
						<TextField
							label='Options'
							fullWidth
							value={optionInputValue}
							onChange={handleOptionsChange}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									handleAddOption();
								}
							}}
						/>
						<Button
							variant='outlined'
							onClick={handleAddOption}
							disabled={!optionInputValue.trim()}
						>
							Add Option
						</Button>
					</div>
					<div style={{ marginBottom: '8px' }}>
						{newQuestion.options.map((option) => (
							<Chip
								key={option}
								label={option}
								onDelete={() => handleDeleteOption(option)}
								style={{
									marginRight: '8px',
									marginBottom: '8px',
								}}
							/>
						))}
					</div>
					<TextField
						label='Correct Answer'
						fullWidth
						value={newQuestion.correctAnswer}
						onChange={(e) =>
							handleNewQuestionChange(
								'correctAnswer',
								e.target.value
							)
						}
						style={{ marginBottom: '8px' }}
					/>
					<TextField
						label='Category'
						fullWidth
						value={newQuestion.category}
						onChange={(e) =>
							handleNewQuestionChange('category', e.target.value)
						}
						style={{ marginBottom: '8px' }}
					/>
					<TextField
						label='Difficulty Level'
						fullWidth
						value={newQuestion.difficultyLevel}
						onChange={(e) =>
							handleNewQuestionChange(
								'difficultyLevel',
								e.target.value
							)
						}
						style={{ marginBottom: '8px' }}
					/>
					{/* <TextField
            label="Explanation"
            fullWidth
            value={newQuestion.explanation}
            onChange={(e) =>
              handleNewQuestionChange("explanation", e.target.value)
            }
            style={{ marginBottom: "8px" }}
          /> */}
					<div style={{ marginBottom: '8px' }}>
						<TextField
							label='Tags'
							fullWidth
							value={tagInputValue}
							onChange={handleTagsChange}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									handleAddTag();
								}
							}}
						/>
						<Button
							variant='outlined'
							onClick={handleAddTag}
							disabled={!tagInputValue.trim()}
						>
							Add Tag
						</Button>
					</div>
					<div style={{ marginBottom: '8px' }}>
						{newQuestion.tags.map((tag) => (
							<Chip
								key={tag}
								label={tag}
								onDelete={() => handleDeleteTag(tag)}
								style={{
									marginRight: '8px',
									marginBottom: '8px',
								}}
							/>
						))}
					</div>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleEditModalClose}>Cancel</Button>
					<Button
						onClick={() =>
							handleUpdateQuestion(selectedQuestion.questionID)
						}
						disabled={!newQuestion.question}
					>
						Update
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={isDeleteModalOpen} onClose={handleDeleteModalClose}>
				<DialogTitle>Delete Question</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete the selected question?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteModalClose}>Cancel</Button>
					<Button
						onClick={() =>
							handleDeleteQuestion(selectedQuestion.questionID)
						}
						color='error'
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	) : (
		// JSX to display a message if the user is not logged in
		<div>Please login to access this page.</div>
	);
};

export default QuestionsManagePage;
