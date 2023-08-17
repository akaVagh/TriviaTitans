import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, TextField, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from "../../services/AuthContext";

function InviteTeamMembers() {
    const { currentUser } = useContext(AuthContext);
    const [currentUserEmail, setCurrentUserEmail] = useState(currentUser ? currentUser.email : '');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteMessage, setInviteMessage] = useState('You are invited to join our team!');
    const locationState = useLocation().state || {};
    const { teamId: locationTeamId, teamName: locationTeamName, teamMembers: locationTeamMembers } = locationState;
    const navigate = useNavigate();
    
    useEffect(() => {
        fetchUsers();
    }, [currentUser]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const apiData = await fetchUsersProfileInfo();
            const filteredUsers = filterExistingTeamMembers(apiData);
            const statusData = await checkEmailConfirmation(filteredUsers);
            assignStatusToUsers(filteredUsers, statusData);
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
        setLoading(false);
    };

    const fetchUsersProfileInfo = async () => {
        const response = await axios.get('https://km0vkw6jt0.execute-api.us-east-1.amazonaws.com/test/get-users-profile-info');
        return JSON.parse(response.data.body);
    };

    const filterExistingTeamMembers = (apiData) => {
        return apiData.filter(user => !locationTeamMembers.map(member => member.userEmail).includes(user.email));
    };

    const checkEmailConfirmation = async (filteredUsers) => {
        const emails = filteredUsers.map(user => user.email);
        const res = await axios.post('https://oz5x35a4ea.execute-api.us-east-1.amazonaws.com/test/check-confirmation', { emails });
        return (res.data);
    };

    const assignStatusToUsers = (filteredUsers, statusData) => {
        filteredUsers.forEach(user => {
            const userStatusData = statusData.find(status => status.email === user.email);
            user.status = userStatusData ? userStatusData.status : 'Status unknown';
        });
    };
    
    const sendInvite = async (inviteEmail, userStatus) => {    
        if (userStatus !== 'Subscription confirmed') {
            alert('Cannot send invite. User has not confirmed their subscription!');
            return;
        }    
        console.log(inviteEmail, 'sending invite to this dude')
        const inviteData = {
            target: 'email',
            email: inviteEmail,
            message: inviteMessage,
            typeOfMessage: 'team invite',
            teamId: locationTeamId,
            teamName: locationTeamName
        };

        try {
            const response = await axios.post(
                'https://oz5x35a4ea.execute-api.us-east-1.amazonaws.com/test/publish', 
                inviteData
            );
            console.log("Hopeeeeeeeeeeeeeeeeeeeeee", response)
            alert('Invite has been sent!');
            navigate('/welcomeTeamPage');
        } catch (error) {
            console.error('Failed to send invite:', error);
        }
    };

    const getUserBoxColor = (status) => {
        switch(status) {
            case 'Subscription confirmed': 
                return 'lightgreen';
            default: 
                return 'lightgoldenrodyellow';
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            {loading ? (
                <CircularProgress />
            ) : (
                <UserList 
                    inviteMessage={inviteMessage} 
                    setInviteMessage={setInviteMessage} 
                    users={users} 
                    sendInvite={sendInvite} 
                    currentUserEmail={currentUserEmail} 
                    getUserBoxColor={getUserBoxColor} 
                />
            )}
        </Box>
    );         
}

const UserList = ({ inviteMessage, setInviteMessage, users, sendInvite, currentUserEmail, getUserBoxColor }) => (
    <>
        <Typography variant="h5" align="center">Invite a New Team Member</Typography>
        <Box width="50%" mt={2}>
            <TextField 
                label="Invite Message"
                variant="outlined"
                fullWidth
                value={inviteMessage}
                onChange={e => setInviteMessage(e.target.value)}
            />
        </Box>
        <Typography variant="h6" align="center" mt={2}>List of Available Users</Typography>
        <Box mt={2} style={{ maxHeight: '60vh', overflow: 'auto' }}>
            {users.map((user, index) => (
                <UserRow 
                    key={index}
                    user={user}
                    sendInvite={sendInvite}
                    currentUserEmail={currentUserEmail}
                    getUserBoxColor={getUserBoxColor}
                />
            ))}
        </Box>
    </>
);

const UserRow = ({ user, sendInvite, currentUserEmail, getUserBoxColor }) => (
    <Box my={2} display="flex" justifyContent="center" alignItems="center">
        <Box mr={2} p={2} border={1} borderRadius="borderRadius" borderColor="grey.300">
            <Typography variant="body1">{user.email}</Typography>
        </Box>
        <Box mr={2} p={2} border={1} borderRadius="borderRadius" bgcolor={getUserBoxColor(user.status)}>
            <Typography variant="body2">{user.status}</Typography>
        </Box>
        <Button 
            variant="contained" 
            color="primary" 
            onClick={() => sendInvite(user.email, user.status)}
            disabled={currentUserEmail === user.email}
        >
            Send Invite
        </Button>
    </Box>
);

export default InviteTeamMembers;
