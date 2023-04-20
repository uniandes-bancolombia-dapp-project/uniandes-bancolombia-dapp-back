import { connectToDatabase } from '../database/db';
import { User } from '../types.js';

export const getUsers = async () => {
	const db = await connectToDatabase();
	const usersCollection = db.collection<User>('users');
	const users = await usersCollection.find().toArray();
	return users;
};

export const getUserByWalletId = async (_walletId: string) => {
	const db = await connectToDatabase();
	const usersCollection = db.collection<User>('users');
	const response = await usersCollection.findOne({ walletId: _walletId });
	return response;
};

export const addUser = async (user: User) => {
	const db = await connectToDatabase();
	const usersCollection = db.collection<User>('users');
	const response = await usersCollection.insertOne(user);
	return response;
};
