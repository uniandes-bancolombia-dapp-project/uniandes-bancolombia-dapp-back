import { addUser, getUserByWalletId } from '../repository/userRepository';
import { User } from '../types';

export const loginUser = async (walletId: string) => {
	getUserByWalletId(walletId);
};

export const registerUser = async (user: User, walletId: string) => {
	user.walletId = walletId;
	addUser(user);
};
