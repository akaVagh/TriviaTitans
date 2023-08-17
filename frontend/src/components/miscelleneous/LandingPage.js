import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useNavigate } from "react-router-dom";

const LandingPage = () => {

  const navigate = useNavigate();

  const rootStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: 'Roboto, sans-serif',
  };

  const containerStyles = {
    textAlign: 'center',
  };

  const textStyles = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#black',
    marginBottom: '20px',
  };

  const handleClick = (user) => {
    navigate("/SignIn", { state: user });
  };


  return (
    <Box sx={rootStyles}>
      <Box sx={containerStyles}>
        <Box component="div" sx={textStyles}>
          Quiz? Quizzer? Quizzest
        </Box>
        <Button color="success" variant='contained' onClick={handleClick}>Let's Quiz</Button>
      </Box>
    </Box>
  );
};

export default LandingPage;