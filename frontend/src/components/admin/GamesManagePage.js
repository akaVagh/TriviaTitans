import React, { useState, useEffect, useContext } from "react";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TablePagination,
} from "@mui/material";
import Input from "@mui/material/Input";
import axios from "axios";
import { v1 as uuid } from "uuid";
import { AuthContext } from "../../services/AuthContext";

const containerStyle = {
  marginBottom: "16px",
};

const tableContainerStyle = {
  marginBottom: "16px",
};

const GamesManagePage = () => {
  const [games, setGames] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [newGame, setNewGame] = useState({
    gameName: "",
    category: "",
    difficultyLevel: "",
    startTime: "",
    endTime: "",
    questions: [],
    scores: {},
  });
  const [questionInputValue, setQuestionInputValue] = useState("");
  const [participantInputValue, setParticipantInputValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { currentUser } = useContext(AuthContext);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      axios
        .get(
          "https://20b0dq23zl.execute-api.us-east-1.amazonaws.com/dev/fetchgames"
          //   "https://0cfsqsski6.execute-api.us-east-1.amazonaws.com/dev/fetchgames"
        )
        .then((result) => {
          setGames(result.data.body);
        })
        .catch((error) => {
          alert(error.response.data.body);
        });
    }
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    axios
      .get(
        "https://znf7w2d5pi.execute-api.us-east-1.amazonaws.com/dev/fetchquestions"
        // "https://49ne542hc9.execute-api.us-east-1.amazonaws.com/dev/fetchquestions"
      )
      .then((result) => {
        setQuestions(result.data.body);
      })
      .catch((error) => {
        alert(error.response.data.body);
      });
  }, []);

  useEffect(() => {
    axios
      .get(
        "https://sq9k6vbyqf.execute-api.us-east-1.amazonaws.com/test/get-all-teams"
        // "https://wznz44f63m.execute-api.us-east-1.amazonaws.com/dev/fetchteams"
      )
      .then((result) => {
        setTeams(result.data.body);
      })
      .catch((error) => {
        alert(error.response.data.body);
      });
  }, []);

  const handleAddModalOpen = () => {
    setIsAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    setNewGame({
      gameName: "",
      category: "",
      difficultyLevel: "",
      startTime: "",
      endTime: "",
      questions: [],
      scores: {},
    });
    setQuestionInputValue("");
    setParticipantInputValue("");
  };

  const handleEditModalOpen = (game) => {
    setSelectedGame(game);
    setNewGame(game);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedGame(null);
    setNewGame({
      gameName: "",
      category: "",
      difficultyLevel: "",
      startTime: "",
      endTime: "",
      questions: [],
      scores: {},
    });
    setQuestionInputValue("");
    setParticipantInputValue("");
  };

  const handleDeleteModalOpen = (game) => {
    setSelectedGame(game);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedGame(null);
  };

  const handleAddGame = () => {
    let gameID = uuid();
    let keyAddedValue = newGame;
    keyAddedValue.gameID = gameID;
    axios
      .post(
        "https://20b0dq23zl.execute-api.us-east-1.amazonaws.com/dev/addgame",
        // "https://0cfsqsski6.execute-api.us-east-1.amazonaws.com/dev/addgame",
        keyAddedValue
      )
      .then((result) => {
        setGames([...games, newGame]);
        setNewGame({
          gameName: "",
          category: "",
          difficultyLevel: "",
          startTime: "",
          endTime: "",
          questions: [],
          scores: {},
        });
        // Publish the message
        const url =
          "https://oz5x35a4ea.execute-api.us-east-1.amazonaws.com/test/publish";
        const data = {
          target: "all",
          message: `Hello players, the admin has added a new game: ${newGame.gameName} category, ${newGame.difficultyLevel}`,
        };
        axios
          .post(url, data)
          .then((response) => {
            console.log("The message was successfully sent!", response);
            alert('The New game avilability has been broadcasted to all users!');
          })
          .catch((error) => {
            console.error(
              "An error occurred while sending the message.",
              error
            );
          });
      })
      .catch((error) => {
        alert(error.response.data.body);
      });

    handleAddModalClose();
  };

  const handleUpdateGame = (gameId) => {
    let keyAddedValue = newGame;
    keyAddedValue.gameID = gameId;
    axios
      .post(
        "https://20b0dq23zl.execute-api.us-east-1.amazonaws.com/dev/editgame",
        // "https://0cfsqsski6.execute-api.us-east-1.amazonaws.com/dev/editgame",
        keyAddedValue
      )
      .then((result) => {
        alert("Updated");
        const updatedGames = games.map((game) => {
          if (game.gameID === gameId) {
            return { ...newGame, gameID: game.gameID };
          }
          return game;
        });
        setGames(updatedGames);
        setNewGame({
          gameName: "",
          category: "",
          difficultyLevel: "",
          startTime: "",
          endTime: "",
          questions: [],
          scores: {},
        });
        setSelectedGame(null);
      })
      .catch((error) => {
        alert(error.response.data.body);
      });

    handleEditModalClose();
  };

  const handleDeleteGame = (gameId) => {
    axios
      .post(
        "https://20b0dq23zl.execute-api.us-east-1.amazonaws.com/dev/deletegame",
        // "https://0cfsqsski6.execute-api.us-east-1.amazonaws.com/dev/deletegame",
        {
          gameID: gameId,
        }
      )
      .then((result) => {
        const updatedGames = games.filter((game) => game.gameID !== gameId);
        setGames(updatedGames);
        setSelectedGame(null);
      })
      .catch((error) => {
        alert(error.response.data.body);
      });

    handleDeleteModalClose();
  };

  const handleNewGameChange = (field, value) => {
    setNewGame((prevGame) => ({
      ...prevGame,
      [field]: value,
    }));
  };

  const handleQuestionsChange = (event) => {
    const selectedQuestionIDs = Array.from(event.target.value);
    setNewGame((prevGame) => ({
      ...prevGame,
      questions: selectedQuestionIDs.map((questionID) => ({
        questionID,
        question: questions.find((q) => q.questionID === questionID)?.question,
      })),
    }));
  };

  const handleDeleteQuestion = (question) => {
    setNewGame((prevGame) => ({
      ...prevGame,
      questions: prevGame.questions.filter(
        (q) => q.questionID !== question.questionID
      ),
    }));
  };

  const handleScoresChange = (teamId, score) => {
    setNewGame((prevGame) => ({
      ...prevGame,
      scores: { ...prevGame.scores, [teamId]: score },
    }));
  };

  return isAuthenticated ? (
    <Container style={containerStyle}>
      <br />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddModalOpen}
      >
        Add Game
      </Button>
      <TableContainer component={Paper} style={tableContainerStyle}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Game Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Difficulty Level</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((game) => (
                <TableRow key={game.gameID}>
                  <TableCell>{game.gameName}</TableCell>
                  <TableCell>{game.category}</TableCell>
                  <TableCell>{game.difficultyLevel}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="edit"
                      onClick={() => handleEditModalOpen(game)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDeleteModalOpen(game)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]} // Change this array as needed
        component="div"
        count={games.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />

      <Dialog open={isAddModalOpen} onClose={handleAddModalClose}>
        <DialogTitle>Add Game</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Fill in the details for the new game:
          </DialogContentText>
          <TextField
            label="Game Name"
            fullWidth
            value={newGame.gameName}
            onChange={(e) => handleNewGameChange("gameName", e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <TextField
            label="Category"
            fullWidth
            value={newGame.category}
            onChange={(e) => handleNewGameChange("category", e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <TextField
            label="Difficulty Level"
            fullWidth
            value={newGame.difficultyLevel}
            onChange={(e) =>
              handleNewGameChange("difficultyLevel", e.target.value)
            }
            style={{ marginBottom: "8px" }}
          />
          <TextField
            label="Start Time"
            fullWidth
            value={newGame.startTime}
            onChange={(e) => handleNewGameChange("startTime", e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <TextField
            label="End Time"
            fullWidth
            value={newGame.endTime}
            onChange={(e) => handleNewGameChange("endTime", e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <FormControl fullWidth style={{ marginBottom: "8px" }}>
            <InputLabel id="questions-label">Questions</InputLabel>
            <Select
              labelId="questions-label"
              id="questions-select"
              multiple
              value={newGame.questions.map((q) => q.questionID)}
              onChange={handleQuestionsChange}
              input={<Input />}
            >
              {questions.map((question) => (
                <MenuItem key={question.questionID} value={question.questionID}>
                  {question.question}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div style={{ marginBottom: "8px" }}>
            {newGame.questions.map((question) => (
              <Chip
                key={question.questionID}
                label={question.question}
                onDelete={() => handleDeleteQuestion(question)}
                style={{
                  marginRight: "8px",
                  marginBottom: "8px",
                }}
              />
            ))}
          </div>

          <Typography variant="subtitle1" style={{ marginBottom: "8px" }}>
            Scores:
          </Typography>
          {Object.entries(newGame.scores).map(([teamId, score]) => (
            <TextField
              key={teamId}
              label={`Team ${teamId} Score`}
              fullWidth
              value={score}
              onChange={(e) => handleScoresChange(teamId, e.target.value)}
              style={{ marginBottom: "8px" }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddModalClose}>Cancel</Button>
          <Button onClick={handleAddGame} disabled={!newGame.gameName}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isEditModalOpen} onClose={handleEditModalClose}>
        <DialogTitle>Edit Game</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Modify the details for the selected game:
          </DialogContentText>
          <TextField
            label="Game Name"
            fullWidth
            value={newGame.gameName}
            onChange={(e) => handleNewGameChange("gameName", e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <TextField
            label="Category"
            fullWidth
            value={newGame.category}
            onChange={(e) => handleNewGameChange("category", e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <TextField
            label="Difficulty Level"
            fullWidth
            value={newGame.difficultyLevel}
            onChange={(e) =>
              handleNewGameChange("difficultyLevel", e.target.value)
            }
            style={{ marginBottom: "8px" }}
          />
          <TextField
            label="Start Time"
            fullWidth
            value={newGame.startTime}
            onChange={(e) => handleNewGameChange("startTime", e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <TextField
            label="End Time"
            fullWidth
            value={newGame.endTime}
            onChange={(e) => handleNewGameChange("endTime", e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <FormControl fullWidth style={{ marginBottom: "8px" }}>
            <InputLabel id="questions-label">Questions</InputLabel>
            <Select
              labelId="questions-label"
              id="questions-select"
              multiple
              value={newGame.questions.map((q) => q.questionID)}
              onChange={handleQuestionsChange}
              input={<Input />}
            >
              {questions.map((question) => (
                <MenuItem key={question.questionID} value={question.questionID}>
                  {question.question}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div style={{ marginBottom: "8px" }}>
            {newGame.questions.map((question) => (
              <Chip
                key={question.questionID}
                label={question.question}
                onDelete={() => handleDeleteQuestion(question)}
                style={{
                  marginRight: "8px",
                  marginBottom: "8px",
                }}
              />
            ))}
          </div>

          <Typography variant="subtitle1" style={{ marginBottom: "8px" }}>
            Scores:
          </Typography>
          {Object.entries(newGame.scores).map(([teamId, score]) => (
            <TextField
              key={teamId}
              label={`Team ${teamId} Score`}
              fullWidth
              value={score}
              onChange={(e) => handleScoresChange(teamId, e.target.value)}
              style={{ marginBottom: "8px" }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditModalClose}>Cancel</Button>
          <Button onClick={() => handleUpdateGame(selectedGame.gameID)}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onClose={handleDeleteModalClose}>
        <DialogTitle>Delete Game</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this game?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteModalClose}>Cancel</Button>
          <Button onClick={() => handleDeleteGame(selectedGame.gameID)}>
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

export default GamesManagePage;
