const users = [];

const findUserByEmail = (email) => {
	return users.find((user) => user.email === email);
};

const createUser = (user) => {
	users.push(user);
	return user;
};

module.exports = { findUserByEmail, createUser };
