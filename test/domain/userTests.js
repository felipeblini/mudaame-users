var fixtures = require('./fixtures');

describe('User relationships', function () {
    before(fixtures.fakeserver.init);
    after(fixtures.fakeserver.deinit);
    beforeEach(fixtures.testData.createUserTestData);
    beforeEach(fixtures.testData.setUserIds);
    beforeEach(fixtures.testData.createProfileTestData);
    beforeEach(fixtures.testData.setProfileIds);

	describe('Profile', function () {
        it('"GET /users/{id}/profile" should return empty list', function (done) {

            var userId = fixtures.testData.getUserIds()[0];

            var options = {
                url: 'http://127.0.0.1:8012/api/users/' + userId + '/profile',
                json: true
            };

            request.get(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }
                expect(response.statusCode).to.be(200);
                expect(body).to.be.an(Array);
                expect(body.length).to.be(0);
                done();
            });
        });
        it('"PUT /users/{id}/profile" should set linked Profile', function (done) {

            var userId = fixtures.testData.getUserIds()[0];
            var firstProfileId = fixtures.testData.getProfileIds()[0];
            var secondProfileId = fixtures.testData.getProfileIds()[1];
            
            var options = {
                url: 'http://127.0.0.1:8012/api/users/' + userId + '/profile',
                json: true,
                body: [firstProfileId]
            };

            request.post(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }
                
                var options = {
                    url: 'http://127.0.0.1:8012/api/users/' + userId + '/profile',
                    json: true,
                    body: [secondProfileId]
                };
    
                request.put(options, function (err, response, body) {
                    if (err) {
                        return done(err);
                    }
                    
                    expect(response.statusCode).to.be(200);
                    expect(body._id.toString()).to.be(userId.toString());
    
                    var options = {
                        url: 'http://127.0.0.1:8012/api/users/' + userId + '/profile',
                        json: true
                    };
    
                    request.get(options, function (err, response, body) {
                        if (err) {
                            return done(err);
                        }
    
                        expect(response.statusCode).to.be(200);
                        expect(body).to.be.an(Array);
                        expect(body.length).to.be(1);
                        expect(body[0]._id.toString()).to.be(secondProfileId.toString());
						expect(body[0].user.toString()).to.be(userId.toString());
                        done();
                    });
                });
            });
        });
        it('"POST /users/{id}/profile" should add link(s) to one or more Profile', function (done) {

            var userId = fixtures.testData.getUserIds()[0];
            var profileIds = [fixtures.testData.getProfileIds()[0]];

            var options = {
                url: 'http://127.0.0.1:8012/api/users/' + userId + '/profile',
                json: true,
                body: profileIds
            };

            request.post(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }

                expect(response.statusCode).to.be(200);
                expect(body._id.toString()).to.be(userId.toString());

                var options = {
                    url: 'http://127.0.0.1:8012/api/users/' + userId + '/profile',
                    json: true
                };

                request.get(options, function (err, response, body) {
                    if (err) {
                        return done(err);
                    }

                    expect(response.statusCode).to.be(200);
                    expect(body).to.be.an(Array);
                    expect(body.length).to.be(1);
                    expect(body[0]._id.toString()).to.be(profileIds[0].toString());
                    expect(body[0].user.toString()).to.be(userId.toString());
                    done();
                });
            });
        });
        it('"DELETE /users/{id}/profile/{profileId}" should remove a link from user to Profile', function (done) {

            var userId = fixtures.testData.getUserIds()[0];
            var profileId = fixtures.testData.getProfileIds()[0];

            //First link them
            var options = {
                url: 'http://127.0.0.1:8012/api/users/' + userId + '/profile',
                json: true,
                body: [profileId, fixtures.testData.getProfileIds()[1]]
            };

            request.post(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }

                options = {
                    url: 'http://127.0.0.1:8012/api/users/' + userId + '/profile/' + profileId,
                    json: true
                };

                request.del(options, function (err, response, body) {
                    if (err) {
                        return done(err);
                    }

                    expect(response.statusCode).to.be(200);
                    expect(body._id.toString()).to.be(userId.toString());

                    var options = {
                        url: 'http://127.0.0.1:8012/api/users/' + userId + '/profile',
                        json: true
                    };

                    request.get(options, function (err, response, body) {
                        if (err) {
                            return done(err);
                        }

                        expect(response.statusCode).to.be(200);
                        expect(body).to.be.an(Array);
                        expect(body.length).to.be(1);
                        done();
                    });
                });
            });
        });
        it('"GET /users/{id}/profile" with wrong id should return 404', function (done) {

            var options = {
                url: 'http://127.0.0.1:8012/api/users/00000759a6d4007c2e410b25/profile',
                json: true
            };

            request.get(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }

                expect(response.statusCode).to.be(404);
                expect(body.error).to.be('Not Found');
                done();
            });
        });

        it('"GET /users/{id}/profile" with Invalid id should return 500', function (done) {

            var options = {
                url: 'http://127.0.0.1:8012/api/users/00000/profile',
                json: true
            };
            request.get(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }
                
                expect(response.statusCode).to.be(500);
                expect(body.error.name).to.be('CastError');
                done();
            });
        });
	});
});
