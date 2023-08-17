import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	score: {},
};

const teamScoreSlice = createSlice({
	name: 'teamScore',
	initialState,
	reducers: {
		setScore: (state, action) => {
			console.log('action', action.payload);
			state.score = action.payload;
		},
	},
});

export const { setScore } = teamScoreSlice.actions;

export default teamScoreSlice.reducer;
