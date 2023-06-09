import express from 'express';
import {
	callbackAuth,
	getAuthRequest,
	getStatus,
	loginUser,
	registerUser,
} from '../services/authService';
import { User } from '../types';

const auth = express.Router();

auth.get('/login', (_req, res) => {
	const walletId = _req.query.walletId.toString();
	loginUser(walletId).then((userObj: User) => {
		if (!userObj) {
			res.status(401).send(null);
		} else {
			res.status(200).json(userObj);
		}
	});
});

auth.post('/register', (_req, res) => {
	const walletId = _req.query.walletId.toString();
	const user = _req.body;
	registerUser(user, walletId, (data) => {
		if (!data) {
			res.status(400).send(null);
		} else {
			res.status(201).send(data);
		}
	});
});

auth.get('/sign-in', (_req, res) => {
	getAuthRequest(_req, res);
});

auth.post('/callback', (_req, res) => {
	callbackAuth(_req, res);
});

//Endpoint to check whether a user has been authenticated given a session ID
//Expected parameter: sessionId
auth.get('/status', (_req, res) => {
	getStatus(_req, res);
});

export default auth;
