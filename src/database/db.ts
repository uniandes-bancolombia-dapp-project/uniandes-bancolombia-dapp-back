import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const { DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

const connectToDatabase = async () => {
	try {
		const client = await MongoClient.connect(uri);
		console.log(`Connected to ${DB_NAME} database`);
		return client.db(DB_NAME);
	} catch (error) {
		console.error('Error connecting to database', error);
	}
};

export { connectToDatabase };
