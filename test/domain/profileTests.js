var fixtures = require('./fixtures');

describe('Profile relationships', function () {
    before(fixtures.fakeserver.init);
    after(fixtures.fakeserver.deinit);
    beforeEach(fixtures.testData.createProfileTestData);
    beforeEach(fixtures.testData.setProfileIds);
    beforeEach(fixtures.testData.createUserTestData);
    beforeEach(fixtures.testData.setUserIds);

	describe('User', function () {
        it('"GET /profiles/{id}/user" should return null', function (done) {

            var profileId = fixtures.testData.getProfileIds()[0];

            var options = {
                url: 'http://127.0.0.1:8012/api/profiles/' + profileId + '/user',
                json: true
            };

            request.get(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }

                expect(response.statusCode).to.be(200);
                expect(body).to.be(null);

                done();
            });
        });
        it('"POST /profiles/{id}/user" should link a profile to a User', function (done) {

            var profileId = fixtures.testData.getProfileIds()[0];
            var userId = fixtures.testData.getUserIds()[0];

            var options = {
                url: 'http://127.0.0.1:8012/api/profiles/' + profileId + '/user',
                json: true,
                body: { id: userId }
            };

            request.post(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }

                expect(response.statusCode).to.be(200);
                expect(body._id.toString()).to.be(profileId.toString());
                expect(body.user.toString()).to.be(userId.toString());
                done();
            });
        });
        it('"DELETE /profiles/{id}/user/{userId}" should remove a link from profile to User', function (done) {

            var profileId = fixtures.testData.getProfileIds()[0];
            var userId = fixtures.testData.getUserIds()[0];

            //First link them
            var options = {
                url: 'http://127.0.0.1:8012/api/profiles/' + profileId + '/user',
                json: true,
                body: { id: userId }
            };

            request.post(options, function (err, response, body) {
                if (err) {
                    return done(err);
                }

                options = {
                    url: 'http://127.0.0.1:8012/api/profiles/' + profileId + '/user/' + userId,
                    json: true
                };

                request.del(options, function (err, response, body) {
                    if (err) {
                        return done(err);
                    }


                    expect(response.statusCode).to.be(200);
                    expect(body._id.toString()).to.be(profileId.toString());
                    expect(body.user).to.be(null);
                    done();
                });
            });
        });
        it('"GET /profiles/{id}/user" with wrong id should return 404', function (done) {

            var options = {
                url: 'http://127.0.0.1:8012/api/profiles/00000759a6d4007c2e410b25/user',
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

        it('"GET /profiles/{id}/user"  with Invalid id should return 500', function (done) {

            var options = {
                url: 'http://127.0.0.1:8012/api/profiles/00000/user',
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
