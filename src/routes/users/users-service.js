const xss = require('xss');
const bcrypt = require('bcryptjs');
const Treeize = require('treeize');

const UserServices = {
	getAllMainUsers(db) {
		return db.from('mainuser').select('*');
	},

	getByMainUserId(db, id) {
		return UserServices.getAllUsers(db).where('id', id).first();
	},
	hasUserWithUserName(db,email){
		return UserServices.getAllUsers(db).where('email',email).first().then(user=>!!user)
	},

	addMainUser(db, user) {
		return db
			.insert(user)
			.into('mainUsers')
			.returning('*')
			.then(([ user ]) => user)
			.then((user) => UserServices.getByMainUserId(db, user.id));
	},

	deleteMainUser(db, id) {
		return UserServices.getAllMainUsers(db).where('id', id).del();
	},

	updateMainUser(db, id, userInfo) {
		return UserServices.getAllMainUsers(db).where('id', id).update(userInfo);
	},

	serializeThings(things) {
		return things.map(this.serializeThing);
	},

	serializeThing(thing) {
		const thingTree = new Treeize();

		// Some light hackiness to allow for the fact that `treeize`
		// only accepts arrays of objects, and we want to use a single
		// object.
		const thingData = thingTree.grow([ thing ]).getData()[0];

		return {
			id: thing.id,
			user_name: xss(thing.user_name),
			full_name: xss(thing.full_name),
			profilepic: xss(thing.profilepic),
			isadmin:thing.isadmin,
			nickname: xss(thing.nickname),
			date_created: thing.date_created,
			date_modified: thing.date_modified
		};
	},
	hashPassword(password) {
		return bcrypt.hash(password, 12);
	}
};

module.exports = UserServices;