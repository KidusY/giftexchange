const express = require('express');
const usersService = require('./users-service');
const { requireAuth } = require('../../middleware/jwt');
//const { isAdmin } = require('../middleware/isAdmin');
//const isAdmin = require('../middleware/isAdmin');
const usersRouter = express.Router();

usersRouter
	.route('/')
	// .all(requireAuth,isAdmin)
	.get((req, res, next) => {
		usersService
			.getAllMainUsers(req.app.get('db'))
			.then((users) => {
				res.json(users);
			})
			.catch(next);
	})
	.post((req, res, next) => {
		const user = req.body;
		for (const field of [ 'full_name', 'email', 'password' ])
			if (!req.body[field])
				return res.status(400).json({
					error: `Missing '${field}' in request body`
				});
		usersService
			.hasUserWithUserName(req.app.get('db'), user.user_name)
			.then((user_name) => {
				if (user_name) return res.status(400).json({ error: 'User Name Already Taken' });
				return usersService.hashPassword(user.password).then((hashedPassword) => {
					const newUser = {
						user_name: user.user_name,
						password: hashedPassword,
						nickname: user.nickname,
						profilepic: user.profilepic,
						full_name: user.full_name,
						isadmin: user.isadmin
					};
					return usersService.addUser(req.app.get('db'), newUser).then((user) => res.json(user));
				});
			})
			.catch(next);
	});

usersRouter
	.route('/:user_id')
	// .all(requireAuth,isAdmin)
	.all(checkThingExists)
	.get((req, res) => {
		res.json(usersService.serializeThing(res.user));
	})
	.put((req, res, next) => {
		const userInfo = req.body;
		usersService
			.updateUser(req.app.get('db'), res.user.id, userInfo)
			.then((user) => res.send('user info has been updated'));
	})
	.delete((req, res, next) => {
		usersService.deleteUser(req.app.get('db'), res.user.id).then((product) => res.send('user deleted'));
	});

/* async/await syntax for promises */
async function checkThingExists(req, res, next) {
	try {
		const user = await usersService.getByUserId(req.app.get('db'), req.params.user_id);

		if (!user)
			return res.status(404).json({
				error: `User doesn't exist`
			});

		res.user = user;
		next();
	} catch (error) {
		next(error);
	}
}

module.exports = usersRouter;