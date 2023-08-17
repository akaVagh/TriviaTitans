// Author: Shubham Mishra

import React, { createContext, useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const config = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
};

// Initialize Firebase with the provided configuration
firebase.initializeApp(config);

// Create the AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	// State to hold the current user object returned by Firebase
	const [currentUser, setCurrentUser] = useState(null);

	// State to track if the second-factor authentication is done or not
	const [isSecondFactorAuthDone, setIsSecondFactorAuthDone] = useState(false);

	// State to track if the user is authenticated or not
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	// useEffect to listen for changes in the user's authentication status
	useEffect(() => {
		// Set up an observer to monitor the user's authentication state changes
		const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
			setCurrentUser(user);
		});

		// Clean up the observer when the component unmounts
		return () => unsubscribe();
	}, []);

	// useEffect to retrieve the value of `isSecondFactorAuthDone` from local storage
	useEffect(() => {
		const storedValue = localStorage.getItem('isSecondFactorAuthDone');
		if (storedValue) {
			setIsSecondFactorAuthDone(JSON.parse(storedValue));
		}
	}, []);

	// useEffect to determine if the user is authenticated based on the current user and `isSecondFactorAuthDone`
	useEffect(() => {
		setIsAuthenticated(currentUser !== null && isSecondFactorAuthDone);
		if (isSecondFactorAuthDone) {
			localStorage.setItem('currentUser', JSON.stringify(currentUser));
		} else {
			localStorage.removeItem('currentUser');
		}
	}, [currentUser, isSecondFactorAuthDone]);

	// Return the AuthContext.Provider with the required values
	return (
		<AuthContext.Provider
			value={{
				currentUser,
				isSecondFactorAuthDone,
				setIsSecondFactorAuthDone,
				isAuthenticated,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
