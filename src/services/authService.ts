import { addUser, getUserByWalletId } from '../repository/userRepository';
import { User } from '../types';
import { auth, resolver, loaders } from '@iden3/js-iden3-auth';
import getRawBody from 'raw-body';

export const loginUser = async (walletId: string) => {
	const user: User = await getUserByWalletId(walletId);
	return user;
};

export const registerUser = async (
	user: User,
	walletId: string,
	callback: (response) => void
) => {
	let flag: boolean = true;
	let validDtypes = ['cc', 'pp', 'ce'];

	if (walletId !== null) {
		if ((await getUserByWalletId(walletId)) !== null) {
			flag = false;
		} else {
			if (user.name.length === 0) {
				flag = false;
			}
			if (!validDtypes.includes(user.documentType)) {
				flag = false;
			}
			if (user.documentNumber.length === 0) {
				flag = false;
			}
			if (Number.isNaN(user.birthDate)) {
				flag = false;
			}
			if (user.email.length < 0 || !user.email.includes('@')) {
				flag = false;
			}
		}
		user.walletId = walletId;
	} else {
		flag = false;
	}
	if (flag) {
		const response = await addUser(user);
		if (response.insertedId) {
			const body = {
				credentialSchema:
					'https://raw.githubusercontent.com/uniandes-bancolombia-dapp-project/uniandes-bancolombia-schemas-dapp/main/dapp-ubanc.json',
				type: 'Ubanc',
				credentialSubject: {
					id: user.walletId,
					birthDate: user.birthDate,
					documentType: user.documentType,
					documentNumber: user.documentNumber,
					name: user.name,
					email: user.email,
				},
				expiration: 1713611619,
			};
			const tmp = JSON.stringify(body);
			fetch(
				'http://localhost:3001/v1/did%3Apolygonid%3Apolygon%3Amumbai%3A2qCbxtGfG8QinLU5eWt27YgehyK5ku3eHAmdPYPnGu/claims',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						authorization: 'Basic dXNlcjpwYXNzd29yZA==',
					},
					body: JSON.stringify(body),
				}
			).then((response) => {
				console.log('STATUS >> ' + response.status);
				response.json().then((data) => {
					fetch(
						`http://localhost:3001/v1/did%3Apolygonid%3Apolygon%3Amumbai%3A2qCbxtGfG8QinLU5eWt27YgehyK5ku3eHAmdPYPnGu/claims/${data.id}`,
						{
							method: 'GET',
							headers: {
								authorization: 'Basic dXNlcjpwYXNzd29yZA==',
							},
						}
					).then((response) => {
						response.json().then((dataQr) => {
							callback(dataQr);
						});
					});
				});
			});
		}
	}
};

// Create a map to store the auth requests and their session IDs
const requestMap = new Map();

// Create a map to store the auth responses and their session IDs
const responseMap = new Map();

// Generate authentication request, put it on the requestMap and invoke the callback
export async function getAuthRequest(_req, res) {
	// Audience is verifier id
	//hostUrl is the ip rpvided by ngrok when running ngrok http 8080
	const hostUrl = 'https://fe20-179-33-116-26.ngrok-free.app';
	const sessionId = Math.floor(Math.random() * 100001);
	const callbackURL = '/api/auth/callback';
	const audience =
		'did:polygonid:polygon:mumbai:2qDyy1kEo2AYcP3RT4XGea7BtxsY285szg6yP9SPrs';

	const uri = `${hostUrl}${callbackURL}?sessionId=${sessionId}`;
	// Generate request for basic authentication
	const request = auth.createAuthorizationRequestWithMessage(
		'Auth to Ubanc dApp',
		sessionId.toString(),
		audience,
		uri
	);

	request.id = '7f38a193-0918-4a48-9fac-36adfdb8b542';
	request.thid = '7f38a193-0918-4a48-9fac-36adfdb8b542';

	// Store auth request in map associated with session ID
	requestMap.set(`${sessionId}`, request);
	//invoke api callback
	return res.status(200).set('Content-Type', 'application/json').send(request);
}

export async function callbackAuth(req, res) {
	// Get session ID from request
	const sessionId = req.query.sessionId;

	// get JWZ token params from the post request
	const raw = await getRawBody(req);
	const tokenStr = raw.toString().trim();

	const ethURL =
		'https://polygon-mumbai.g.alchemy.com/v2/hH2gyAXwtIJAWjMcXyhUN0HsnheIpxPj';
	const contractAddress = '0x134B1BE34911E39A8397ec6289782989729807a4';
	const keyDIR = './keys';

	const ethStateResolver = new resolver.EthStateResolver(
		ethURL,
		contractAddress
	);

	const resolvers = {
		['polygon:mumbai']: ethStateResolver,
	};

	// fetch authRequest from sessionId that was set on GetAuthRequest
	const authRequest = requestMap.get(`${sessionId}`);

	// Locate the directory that contains circuit's verification keys
	const verificationKeyloader = new loaders.FSKeyLoader(keyDIR);
	const sLoader = new loaders.UniversalSchemaLoader('ipfs.io');

	// EXECUTE VERIFICATION
	const verifier = new auth.Verifier(verificationKeyloader, sLoader, resolvers);

	try {
		const opts = {
			acceptedStateTransitionDelay: 5 * 60 * 1000, // 5 minute
		};
		var authResponse = await verifier.fullVerify(tokenStr, authRequest, opts);
	} catch (error) {
		console.log(error);
		return res.status(500).send(error);
	}
	responseMap.set(`${sessionId}`, authResponse.from);
	return res
		.status(200)
		.set('Content-Type', 'application/json')
		.send('user with ID: ' + authResponse.from + ' Succesfully authenticated');
}

//Function that checks authentication status of a given session id
export async function getStatus(req, res) {
	// Get session ID from request
	const sessionId = req.query.sessionId;
	// Fetch authResponse from sessionId
	// If there is no authenticated user then it returns undefined
	// If there is an authenticated user, then it returns user's polygon wallet id
	var connectedUser = responseMap.get(`${sessionId}`);

	if (connectedUser) {
		//Response containing user's polygon wallet id
		return res.status(200).json({ walletId: connectedUser });
	} else {
		//Default response while waiting for an user to authenticate
		return res.status(400).send('No auth response yet');
	}
}
