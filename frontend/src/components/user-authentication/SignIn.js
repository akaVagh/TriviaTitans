// Author: [Shubham Mishra]

import React, { useContext } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import SecurityForm from "./SecurityForm";
import { Typography } from "@mui/material";
import { AuthContext } from '../../services/AuthContext';

// Configuration for FirebaseUI authentication
/***************************************************************************************
*    Code Reference: React Firebaseui
*    Author: NPM
*    Code version: 6.0.0
*    Availability: https://www.npmjs.com/package/react-firebaseui
***************************************************************************************/
const uiConfig = {
  signInFlow: "popup",
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false,
  },
};

const SignIn = () => {
  // Access current user information from the AuthContext
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="SignIn">
      {/* If the user is already signed in, show the SecurityForm component */}
      {currentUser ? (
        <SecurityForm></SecurityForm>
      ) : (
        /* If the user is not signed in, show the sign-in options */
        <div>
          <Typography variant="h3" component="h3" align="center">
            Sign In
          </Typography>
          <StyledFirebaseAuth
            uiConfig={uiConfig}
            firebaseAuth={firebase.auth()}
          />
        </div>
      )}
    </div>
  );
};

export default SignIn;
