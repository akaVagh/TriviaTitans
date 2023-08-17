// store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import quizReducer from './quizSlice';
import teamScoreReducer from './teamScoreSlice';

const persistConfig = {
	key: 'root',
	storage,
	whitelist: ['quiz'],
};

const rootReducer = combineReducers({
	quiz: quizReducer,
	score: teamScoreReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
});

export const persistor = persistStore(store);
