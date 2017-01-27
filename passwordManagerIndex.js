console.log('Password Manager Started');

var crypt = require('crypto-js')
var store = require('node-persist'); //imports dependencies.
store.initSync(); //initializes node-persist to load and store value.

var argv = require('yargs')
	.command('create','Create a New Account',function (yargs)
	{
		yargs.options({
			name: {
				demand: true,
				alias: 'n',
				description: 'Account/Site Name (eg:Google,Twitter,Facebook)',
				type: 'string'
			},
			username: {
				demand: true,
				alias: 'u',
				description: 'Account-username/email',
				type: 'string'
			},
			password: {
				demand: true,
				alias: 'p',
				description: 'Account-Password',
				type: 'string'
			},
			masterPassword: {
				demand: true,
				alias: 'm',
				description: 'Account-Master-Password',
				type: 'string'
			}
		}).help('help');
	})
	.command('get','Get Account Details', function (yargs)
	{
		yargs.options({

			name: {
				demand: true,
				alias: 'n',
				description: 'Account/Site Name (eg:Google,Twitter,Facebook)',
				type: 'string'
			},
			masterPassword:{
				demand: true,
				alias: 'm',
				description: 'Account-Master-Password',
				type: 'string'
			}

		}).help('help');
	})
	.help('help')
	.argv;
var command = argv._[0];

function retrieve (masterPassword) {

	var encryptedAccount = store.getItemSync('accounts');
	var accounts = [];

	if (typeof encryptedAccount !== 'undefined') {
		var data = crypt.AES.decrypt(encryptedAccount, masterPassword);
		accounts = JSON.parse(data.toString(crypt.enc.Utf8));
	}
	return accounts;
	console.log('retrieve Completed');
}

function storeAccount (accounts,masterPassword) {

	var encryptedAccounts = crypt.AES.encrypt(JSON.stringify(accounts), masterPassword);
	store.setItemSync('accounts', encryptedAccounts.toString());
	return accounts;
	console.log('Stored Completed');
}

function createAccount (account,masterPassword)
{
	var accounts = retrieve(masterPassword);
	accounts.push(account);
	storeAccount(accounts, masterPassword);
	return account;
	console.log('createCompleted');
}

function getAccount (accountName,masterPassword){

	var accounts = retrieve(masterPassword)
	var matchedAccount;
	accounts.forEach(function (account) {
		if (account.name === accountName)
		{
			matchedAccount = account;
		}
	});
	return matchedAccount;
	console.log('getCompleted');
}



if (command === 'create') {
	try{
		var createdAccount = createAccount({
		name: argv.name,
		username: argv.username,
		password: argv.password
		}, argv.masterPassword);
		console.log('Account Successfully created!');
		console.log(createdAccount);
	}
	catch (error){
		console.log('Failed to create Account :' + error);
	}
	
} else if (command === 'get') {
	try{
		var fetch = getAccount(argv.name, argv.masterPassword);

		if(typeof fetch === 'undefined'){
		
			console.log('Account not found');
		}
		else{
			console.log('Account Found');
			console.log(fetch);
		}
	}
	catch (error)
	{
		console.log('Failed to fetch Account :' + error);
	}


}
