// Author: [Shubham Mishra]

import React, { useState, useContext, useEffect } from "react";
import { Grid, Typography, TextField, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../services/AuthContext";
import axios from 'axios';


const Profile = () => {
  // State to manage user profile data and UI messages
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [profileUpdateResponse, setprofileUpdateResponse] = useState("");
  const [isProfileUpdated, setIsProfileUpdated] = useState(false);
  const location = useLocation();
  const isNewUser = new URLSearchParams(location.search).get('isNewUser') === 'true';
  const [error, setError] = useState("");

  const profileAPIEndpoint = 'https://km0vkw6jt0.execute-api.us-east-1.amazonaws.com/test/profile';
  
  // Function to fetch user's profile data from the server
  const fetchProfile = async () => {
    try {
      const payload = {
        functionName: "getProfile",
        userId: currentUser.uid,
      };
    
      const response = await axios.post(profileAPIEndpoint, payload);
      console.log('response=', response);
      const data = response.data;

      if (data.statusCode === 200) {
        const profileData = JSON.parse(data.body);

        setName(profileData.name);
        setContactNumber(profileData.contactNumber);
          console.log('image=',profileData.image);
          setProfilePicture(profileData.image);
          setProfilePictureFile(null);
      } else {
        console.error("Error fetching profile data");
      }

    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    // Fetch user's profile data when the component mounts or user authentication changes
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser, isAuthenticated]);

  // Function to handle changes in the name field
  const handleNameChange = (e) => {
    setError("");
    setName(e.target.value);
  };

  // Function to handle changes in the contact number field
  const handleContactNumberChange = (e) => {
    setContactNumber(e.target.value);
  };

  // Function to handle changes in the profile picture input
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePictureFile(file);
  };

  // Function to save profile changes to the server
  const handleSaveChanges = async () => {
    if (name.trim() === "") {
      setError("Name cannot be blank.");
      return;
    }
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const imageBase64 = event.target.result.split(",")[1];
        const payload = {
          functionName: 'updateProfile',
          userId: currentUser.uid,
          email: currentUser.email,
          name,
          contactNumber,
          image: imageBase64,
        };
      
        const response = await axios.post(profileAPIEndpoint, payload);
        console.log('response=====', response);
        const data = response.data;
        if (data.statusCode === 200) {
          console.log("data.statusCode === 200");
          setprofileUpdateResponse('Profile successfully updated');
          setIsProfileUpdated(true);
        } else {  
          console.log('Error in updating profile');
          setprofileUpdateResponse('Error in updating profile');
        }
      } catch (error) {
        console.error("Error:", error);
        setprofileUpdateResponse('Error in updating profile');
      }
      fetchProfile();

    };

    if (profilePictureFile) {
      reader.readAsDataURL(profilePictureFile);
    } else {
      try {
        const payload = {
          functionName: 'updateProfile',
          userId: currentUser.uid,
          email: currentUser.email,
          name,
          contactNumber,
        };
      
        const response = await axios.post(profileAPIEndpoint, payload);
        console.log('response=====', response);
        const data = response.data;
        if (data.statusCode === 200) {
          console.log("data.statusCode === 200");
          setprofileUpdateResponse('Profile successfully updated');
          setIsProfileUpdated(true);
        } else {  
          console.log('Error in updating profile-----');
          setprofileUpdateResponse('Error in updating profile');
        }
      } catch (error) {
        console.error("Error:", error);
        setprofileUpdateResponse('Error in updating profile-1717171');
      }
      fetchProfile();

    }
  };

  // Function to navigate to view user statistics
  const handleViewStats = () => {
    navigate('/UserStats')
  };

  // Function to navigate to teams page
  const viewTeams = () => {
    navigate("/welcomeTeamPage");
};

  // Function to navigate to leaderboard page
  const viewLeaderboard = () => {
    navigate("/leaderboard");
};

  return isAuthenticated ? (
    // JSX for displaying the user's profile form
    <Grid container spacing={2} mb={3} justifyContent="center" align="center">
      <Grid item xs={12}>
        <Typography variant="h4">Profile</Typography>
      </Grid>
      <Grid item xs={12}>
        {profilePicture && (
          <img
            src={`${profilePicture}?${Date.now()}`}
            alt="Profile"
            style={{ maxHeight: "100px", width: "auto" }}
          />
        )}
      </Grid>
      <Grid item xs={12}>
        <input
          accept="image/*"
          id="profilePictureInput"
          type="file"
          onChange={handleProfilePictureChange}
          style={{ display: "none" }}
        />
        <label htmlFor="profilePictureInput">
          <Button variant="contained" color="primary" component="span">
            Upload Profile Picture
          </Button>
        </label>
      </Grid>
      <Grid item xs={12}>
        {profilePictureFile && (
          <div>
            <h6>New profile picture selected</h6>
            <img
              src={URL.createObjectURL(profilePictureFile)}
              alt="Profile"
              style={{ maxHeight: "100px", width: "auto" }}
            />
          </div>
        )}
      </Grid>
      <Grid item xs={12}>
        <TextField label="Email" value={currentUser.email || ""} disabled />
      </Grid>
      <Grid item xs={12}>
        <TextField label="Name*" value={name} onChange={handleNameChange} error={error !== ""}
        helperText={error}/>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Contact Number"
          value={contactNumber}
          onChange={handleContactNumberChange}
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" style={{ backgroundColor: 'green', color: 'white' }} onClick={handleSaveChanges}>
          Save Profile Changes
        </Button>
        {profileUpdateResponse && <h6>{profileUpdateResponse}</h6>}
      </Grid>
      {isProfileUpdated && (
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/welcomeTeamPage")}
          >
            Go to Home Page
          </Button>
        </Grid>
      )}
      {!isNewUser && (
        <>
          <Grid item xs={12}>
            <Button variant="contained" style={{ backgroundColor: 'yellow', color: 'black' }} onClick={handleViewStats}>
              View statistics
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              style={{ backgroundColor: 'red', color: 'white' }}
              onClick={viewTeams}
            >
              View Teams
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              style={{ backgroundColor: 'orange', color: 'black' }}
              onClick={viewLeaderboard}
            >
              Leaderboard
            </Button>
          </Grid>
        </>
      )}
    </Grid>
  ) : (
    // JSX to display a message if the user is not logged in
    <div>Please login to access this page.</div>
  );
};

export default Profile;
