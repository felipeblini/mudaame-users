angular.module('myApp').service('UserService', ['$http', '$q', 'baseApi', 'QueryBuilderService', 'EntityUtilService', function ($http, $q, baseApi, QueryBuilderService, EntityUtilService) {

	var UserService = {};

	var resourceUrl = baseApi + '/users';
	var fields = null;

	function buildFields() {
		if (!fields) {
			fields = [
				{name: 'name', type: 'string'},
				{name: 'age', type: 'int'},
				{name: 'isActive', type: 'bool'},
				{name: 'picture', type: 'image'},
				{name: 'location', type: 'geopoint'}
			];
		}
		return fields;
	}

	function getDisplayLabel(user) {
		return user.name;
	}
	UserService.getDisplayLabel = getDisplayLabel;

	//-- Public API -----

	UserService.getCount =  function (opts) {
		opts = opts || {};
		opts.fields = opts.fields || buildFields();
		opts.count = true;		
		return QueryBuilderService.buildBaucisQuery(opts).then(function(q) {
			return $http.get(resourceUrl + q);
		}, function (err) {
			return $q.reject(err);
		});
	};
	
	UserService.getList = function (opts) {
		opts = opts || {};
		opts.fields = opts.fields || buildFields();
		return QueryBuilderService.buildBaucisQuery(opts).then(function(q) {
			return $http.get(resourceUrl + q).then(function(response) {
				response.data.forEach(function(element) {
					element._displayLabel = getDisplayLabel(element);
				});
				return response;
			}, function (err) {
				return $q.reject(err);
			});
		}, function (err) {
			return $q.reject(err);
		});
	};

	function exportQuery(opts) {
		opts = opts || {};
		opts.paginate = false;
		opts.fields = opts.fields || buildFields();
		return QueryBuilderService.buildBaucisQuery(opts).then(function (q) {
		    return q;
		}, function (err) {
		    return $q.reject(err);
		});
	}

	UserService.getListAsCsv = function (opts) {
		return exportQuery(opts).then(function (q) {
			return $http({
				method: 'GET', 
				url: resourceUrl + q, 
				headers: {'Accept': 'text/csv'} 
			});
		}, function (err) {
			return $q.reject(err);
		});
	};	

	UserService.getFileAsCsv = function (opts) {
		return exportQuery(opts).then(function (q) {
			return $http({
				method: 'GET', 
				url: resourceUrl + q, 
				headers: {'Accept': 'text/csv'} 
			});
		}, function (err) {
			return $q.reject(err);
		});
	};	
	UserService.getFileAsXml = function (opts) {
		return exportQuery(opts).then(function (q) {
			return $http({
				method: 'GET', 
				url: resourceUrl + q, 
				headers: {'Accept': 'text/xml'} 
			});
		}, function (err) {
			return $q.reject(err);
		});
	};		
	UserService.getFileAsXlsx = function (opts) {
		return exportQuery(opts).then(function (q) {
			return $http({
				method: 'GET', 
				url: resourceUrl + q, 
				headers: {'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},
				responseType: 'blob' 
			});
		}, function (err) {
			return $q.reject(err);
		});
	};		
	
	UserService.get = function (link) {
		return $http.get(link);
	};
	
	UserService.getDocument = function (id) {
		return UserService.get(resourceUrl + '/' + id ).then(function(response) {
			response.data._displayLabel = getDisplayLabel(response.data);
			return response;
		}, function (err) {
			return $q.reject(err);
		});
	};

	UserService.add = function (item) {
		//Multipart/form-data to support files attached
		var multipartMessage = EntityUtilService.buildMultipartMessage('data', item);
		return $http.post(resourceUrl, multipartMessage, {
			headers: { 'Content-Type': undefined },
			transformRequest: angular.identity
		});
	};

	UserService.update = function (item) {
		//Multipart/form-data to support files attached
		var q = resourceUrl + '/' + item._id;
		var multipartMessage = EntityUtilService.buildMultipartMessage('data', item);
		return $http.put(q, multipartMessage, {
			headers: { 'Content-Type': undefined },
			transformRequest: angular.identity
		});		
	};

	UserService.delete = function (id) {
		return $http.delete(resourceUrl + '/' + id);
	};

	UserService.deleteMany = function (ids) {
		return $http.post(resourceUrl + '/deleteByIds', JSON.stringify(ids));
	};	

	UserService.deleteByQuery = function (opts) {
		opts = opts || {};
		opts.fields = opts.fields || buildFields();
		opts.paginate = false;		
		return QueryBuilderService.buildBaucisQuery(opts).then(function (q) {
			return $http.delete(resourceUrl + q);
		}, function (err) {
			return $q.reject(err);
		});
	};
	UserService.getUserProfile = function (id) {
		return UserService.get(resourceUrl + '/' + id  + '/profile');
	};
	
	UserService.setUserProfile = function (id, profileIds) {
		return $http.put(resourceUrl + '/' + id  + '/profile', JSON.stringify(profileIds));
	};

	return UserService;

}]);
