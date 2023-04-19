export enum DocumentType {
	CC = 'cc',
	CE = 'ce',
	PP = 'pp',
}

export type User = {
	name: string;
	documentType: DocumentType;
	documentNumber: string;
	birthDate: Date;
	email: string;
	walletId: string;
};
