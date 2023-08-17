import React, { useState, useContext, useEffect } from "react";
import { TextField, Grid, Button, Typography, Container, Box, FormControlLabel, Checkbox } from "@mui/material";
import firebase from "firebase/compat/app";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../services/AuthContext';
import axios from 'axios';

const securityAPIEndpoint = 'https://km0vkw6jt0.execute-api.us-east-1.amazonaws.com/test/security';

const SecurityForm = () => {

  // State variables
  const navigate = useNavigate();

  const securityQuestions = [
    "What is your grandfather's first name?",
    "Which is your favourite subject?",
    "Where was your mother born?",
  ];

  const [securityAnswers, setAnswers] = useState(securityQuestions.map(() => ""));
  const [error, setError] = useState("");
  const { setIsSecondFactorAuthDone } = useContext(AuthContext);
  const [isNewUser, setIsNewUser] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const [subscriptionConfirmation, setSubscriptionConfirmation] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setCurrentUserEmail(currentUser.email);
      const savedState = localStorage.getItem(`notificationEnabled_${currentUser.email}`);
      setNotificationEnabled(savedState ? JSON.parse(savedState) : false);

      // Load the state of subscription confirmation from the local storage
      const savedStateSubscription = localStorage.getItem(`subscriptionConfirmation_${currentUser.email}`);
      setSubscriptionConfirmation(savedStateSubscription ? JSON.parse(savedStateSubscription) : false);

    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`notificationEnabled_${currentUserEmail}`, JSON.stringify(notificationEnabled));

    // Save the state of subscription confirmation in the local storage
    localStorage.setItem(`subscriptionConfirmation_${currentUserEmail}`, JSON.stringify(subscriptionConfirmation));

  }, [notificationEnabled, subscriptionConfirmation, currentUserEmail]);

  // Fetch user data from the server when the component mounts or user authentication changes
  useEffect(() => {
    if (currentUser) {
      checkIfuserExists(currentUser.uid)
    }
  }, [currentUser]);

  // Function to check if the user exists in the database
  const checkIfuserExists = async (userId) => {
    const requestData = {
      userId,
      functionName: "checkUserExists"
    };
    try {
      const response = await axios.post(securityAPIEndpoint, requestData);
      const result = response.data;
      const body = JSON.parse(result.body);
      console.log("result=", result);
      console.log("body=", body);
  
      if (result.statusCode === 200) {
        handleSetAuthDone();
        if (body.newUser) {
          setIsNewUser(true);
        } else{
          setIsNewUser(false);
        }
      }
    } catch (error) {
      console.error('Error invoking Lambda function:', error);
      setError('Some error occured. Please try again');
    }
  }

  // Function to set the second factor authentication as done
  const handleSetAuthDone = () => {
    localStorage.setItem('isSecondFactorAuthDone', JSON.stringify(true));
    setIsSecondFactorAuthDone(true);
  };

  // Function to handle changes in the security answer input fields
  const handleChange = (event, index) => {
    const { value } = event.target;
    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[index] = value;
      return updatedAnswers;
    });
  };
  
  // Function to invoke the second factor authentication Lambda function
  const invokesecondFactorAuthLambda = async (userId) => {
    const requestData = {
      userId,
      securityAnswers: securityAnswers,
      functionName: "checkSecurityAnswers"
    };
  
    try {
      const response = await axios.post(securityAPIEndpoint, requestData);
      const result = response.data;
      const body = JSON.parse(result.body);
      console.log("result=", result);
      console.log("body=", body);
  
      if (result.statusCode === 200) {
        handleSetAuthDone();
        if (process.env.REACT_APP_ADMIN_EMAILID === currentUserEmail) {
          navigate("/adminpage");
        } else if (body.newUser) {
          navigate("/profile?isNewUser=true");
        } else{
          navigate("/welcomeTeamPage");
        }
      } else if (result.statusCode === 400){
          setError('Security answers do not match.');
        console.error('Lambda function execution failed');
        console.error(result);
      } else {
        setError('Some error occured. Please try again');
      }
    } catch (error) {
      console.error('Error invoking Lambda function:', error);
      setError('Some error occured. Please try again');
    }
  };
  
  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Check if the notification is enabled
    if (!notificationEnabled) {
      // If not, alert the user and prevent form submission
      alert('Please check the notification box. It is mandatory! And confirm subscription in your inbox');
      return;
    }
    // Check if the subscription confirmation is accepted
    if (!subscriptionConfirmation) {
      // If not, alert the user and prevent form submission
      alert('Please check the subscription confirmation box. It is mandatory!');
      return;
    }
    const userId = firebase.auth().currentUser.uid;  
    invokesecondFactorAuthLambda(userId);
  };

  const handleNotificationChange = async (event) => {
    const { checked } = event.target;
    setNotificationEnabled(checked);
    try {
        if (checked) {
          // Make a POST request when the checkbox is checked
          //const response = await axios.post('https://sq9k6vbyqf.execute-api.us-east-1.amazonaws.com/test/sns-topic', { inviteEmail: currentUserEmail });
          const response = await axios.post('https://oz5x35a4ea.execute-api.us-east-1.amazonaws.com/test/subscribe', { email: currentUserEmail })
          console.log("This is responseeeeeeeeee", response)
          alert('Please confirm the email subscription in your registered email inbox/spam. Thanks!')
          //console.log('Notification enabled and POST request sent.');
        } else {
          // Perform any necessary actions when the checkbox is unchecked
          console.log('Notification disabled.');
        }
    }
    catch (error) {
        console.log(error.message)
    } 
  };

  const handleSubscriptionConfirmationChange = async (event) => {
    const { checked } = event.target;
    setSubscriptionConfirmation(checked);
    if (checked) {
      // Make a POST request when the checkbox is checked
      const response = await axios.post('https://oz5x35a4ea.execute-api.us-east-1.amazonaws.com/test/add-filter-policy', { email: currentUserEmail });
      console.log("This is response", response)
    } else {
      console.log('Subscription confirmation not accepted.');
    }
  };
  
  return (
    <div>
      {/* Display different heading based on whether the user is new or existing */}
      {isNewUser ? (
        <Typography variant="h6" component="h3" align="center">
          You are a new user: Please answer these security questions.
        </Typography>
      ) : (
        <Typography variant="h6" component="h3" align="center">
          You are an existing user: Please answer the security questions.
        </Typography>
      )
      }
      <br></br>
      <Container>
      {/* Security Questions Form */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          {securityQuestions.map((question, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12} md={6}>
                <TextField
                  label={`Security Question ${index + 1}`}
                  value={question}
                  variant="outlined"
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={`Answer ${index + 1}`}
                  value={securityAnswers[index]}
                  onChange={(event) => handleChange(event, index)}
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Typography variant="body1" color="error">
                {error}
              </Typography>
            </Grid>
          )}
        </Grid>
      </form>
      <Box mt={4} textAlign="center">
        <FormControlLabel
          control={<Checkbox checked={notificationEnabled} onChange={handleNotificationChange} />}
          label="Enable notifications!"
        />
        <FormControlLabel
          control={<Checkbox checked={subscriptionConfirmation} onChange={handleSubscriptionConfirmationChange} />}
          label="Check here if you have accepted the subscription confirmation in your email"
        />
      </Box>
      </Container>
    </div>
  );
};

export default SecurityForm;
