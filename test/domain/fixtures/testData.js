var mongoose = require('mongoose');
var async = require('async');

var userIds = [];
var userList = [
	{
		name: 'Name0',
		age: 10,
		isActive: true,
		picture: 'Picture3',
		location: {
			coordinates: [
				-5.9859841,
				-5.9859841
			],
			type: 'Point'
		}	
	},
	{
		name: 'Name5',
		age: 60,
		isActive: false,
		picture: 'Picture8',
		location: {
			coordinates: [
				-5.9859841,
				-5.9859841
			],
			type: 'Point'
		}	
	},
	{
		name: 'Name10',
		age: 110,
		isActive: true,
		picture: 'Picture13',
		location: {
			coordinates: [
				-5.9859841,
				-5.9859841
			],
			type: 'Point'
		}	
	},
];
function createUserTestData(done) {
    var userModel = mongoose.model('user');

	var userModels = userList.map(function (user) {
        return new userModel(user);
    });

    var deferred = [
        userModel.remove.bind(userModel)
    ];

    deferred = deferred.concat(userModels.map(function (user) {
        return user.save.bind(user);
    }));

    async.series(deferred, done);
}
function setUserIds(done) {
    mongoose.model('user').find().exec(function (err, results) {
        if (err) {
            return done(err);
        }

        userIds = [];
        results.forEach(function(user){
            userIds.push(user._id);
        });

        return done();
    });
}
function getUserIds() {
    return userIds;
}

var profileIds = [];
var profileList = [
	{
		description: 'Description15'	
	},
	{
		description: 'Description16'	
	},
	{
		description: 'Description17'	
	},
];
function createProfileTestData(done) {
    var profileModel = mongoose.model('profile');

	var profileModels = profileList.map(function (profile) {
        return new profileModel(profile);
    });

    var deferred = [
        profileModel.remove.bind(profileModel)
    ];

    deferred = deferred.concat(profileModels.map(function (profile) {
        return profile.save.bind(profile);
    }));

    async.series(deferred, done);
}
function setProfileIds(done) {
    mongoose.model('profile').find().exec(function (err, results) {
        if (err) {
            return done(err);
        }

        profileIds = [];
        results.forEach(function(profile){
            profileIds.push(profile._id);
        });

        return done();
    });
}
function getProfileIds() {
    return profileIds;
}

module.exports = {
    createUserTestData: createUserTestData,
    setUserIds: setUserIds,
	getUserIds: getUserIds,
    createProfileTestData: createProfileTestData,
    setProfileIds: setProfileIds,
	getProfileIds: getProfileIds,
};
