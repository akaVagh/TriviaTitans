// Author: [Shubham Mishra]

import React, { useState, useEffect, useContext } from 'react';
import { Typography, Card, CardContent, Grid } from '@mui/material';
import { AuthContext } from '../../services/AuthContext';
import axios from 'axios';

const UserStats = () => {
  // Get the current user and authentication status from the AuthContext
  const { currentUser } = useContext(AuthContext);
  const { isAuthenticated } = useContext(AuthContext);

  // State to store user statistics
  const [userStatistics, setUserStatistics] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalPointsEarned: 0,
  });

  // Function to fetch user statistics from the API
  const fetchData = async () => {
    try {
      // Construct the API URL with the current user's email
      const url = `https://jvmr978102.execute-api.us-east-1.amazonaws.com/dev/getuserstats?userId=${currentUser.email}`;

      // Send a GET request to the API using axios
      const response = await axios.get(url);

      // Map the API response data to the userStatistics state
      const mappedResponse = {
        gamesPlayed: response.data.game_played,
        gamesWon: response.data.game_won,
        gamesLost: response.data.game_lost,
        totalPointsEarned: response.data.total_score,
      };

      // Update the userStatistics state with the mapped data
      setUserStatistics(mappedResponse);
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    }
  };

  // Fetch user's profile data when the component mounts or user authentication changes
  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, isAuthenticated]);

  // Conditional rendering based on user authentication status
  return isAuthenticated ? (
    <div>
      <Typography variant="h4" align="center" gutterBottom>
        User Statistics
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Games Played
              </Typography>
              <Typography variant="h4">{userStatistics.gamesPlayed}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Wins
              </Typography>
              <Typography variant="h4">{userStatistics.gamesWon}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Losses
              </Typography>
              <Typography variant="h4">{userStatistics.gamesLost}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Points Earned
              </Typography>
              <Typography variant="h4">{userStatistics.totalPointsEarned}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  ) : (
    // JSX to display a message if the user is not logged in
    <div>Please login to access this page.</div>
  );
};

export default UserStats;
