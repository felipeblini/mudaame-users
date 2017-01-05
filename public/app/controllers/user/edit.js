angular.module('myApp').controller('EditUserController', 
  ['$scope', '$routeParams', '$location', '$translate', '$timeout', 'UserErrorService', 'NavigationService', 'EntityUtilService', 'SecurityService', 'UserService', 
  function($scope, $routeParams, $location, $translate, $timeout, UserErrorService, NavigationService, EntityUtilService, SecurityService, UserService) {

	$scope.isEdition = false;
	$scope.isCreation = false;
	$scope.isDeletion = false;
	$scope.isView = false;
	$scope.canEdit = false;
	$scope.canDelete = false;	
	$scope.readOnly = false;
	$scope.dataReceived = false;
	$scope.ui = {
		createProfile : true

	};
	$scope.obj = {
		name : null,
		age : null,
		isActive : false,
		picture : null,
		location : null,
		hideProfile : false,
		profile : []
	};

	var saveIndex = 0;
	var manyToManyCount = 1;

	$scope.add = function () {
		$scope.uiWorking = true;
		$scope.obj._id = undefined;
		$scope.obj.profile = getProfileIds();
		UserService.add(dataToServer($scope.obj)).then(function (httpResponse) {
			if($scope.parent) {
				NavigationService.setReturnData({parent: $scope.parent, entity: httpResponse.data});
				$location.path(NavigationService.getReturnUrl());
			}
			else {
				gotoList();
			}
	    }, errorHandlerAdd, progressNotify);
	};
	
	$scope.update = function () {
		$scope.uiWorking = true;
		UserService.update(dataToServer($scope.obj)).then(function (httpResponse) {
			saveIndex = 0;
			UserService.setUserProfile(httpResponse.data._id, getProfileIds()).then(saveAllThenGotoList, errorHandlerUpdate);
		}, errorHandlerUpdate, progressNotify);
	};

	$scope.delete = function () {
		$scope.uiWorking = true;
		UserService.setUserProfile($scope.obj._id, []).then(function () {
			UserService.delete($scope.obj._id).then(returnBack, errorHandlerDelete, progressNotify);
		}, errorHandlerDelete);
	};

	function progressNotify() { //update
	}

	function errorHandlerAdd(httpError) {
		$scope.uiWorking = false;
		$scope.dataReceived = true;
		$scope.errors = UserErrorService.translateErrors(httpError, "add");
	}

	function errorHandlerUpdate(httpError) {
		$scope.uiWorking = false;
		$scope.dataReceived = true;
		$scope.errors = UserErrorService.translateErrors(httpError, "update");
	}

	function errorHandlerDelete(httpError) {
		UserService.setUserProfile($scope.obj._id, getProfileIds());
		$scope.uiWorking = false;
		$scope.dataReceived = true;
		$scope.errors = UserErrorService.translateErrors(httpError, "delete");
	}

	function errorHandlerLoad(httpError) {
		$scope.uiWorking = false;
		$scope.dataReceived = true;
		$scope.errors = UserErrorService.translateErrors(httpError, "query");
	}

	function dataToServer(obj) {
		if (EntityUtilService.geopointIsEmpty(obj.location)) {
			obj.location = EntityUtilService.geopointEmptyValue();
		}
	
		return obj;
	}		

	function loadProfile(httpResponse) {
		$scope.obj.profile = httpResponse.data;
	}

	function loadData(httpResponse) {
		$scope.obj = httpResponse.data;

		UserService.getUserProfile($routeParams.id).then(loadProfile, errorHandlerLoad);


		$scope.canEdit = $scope.isView && EntityUtilService.hasActionCapability($scope.obj, 'edit');
		$scope.canDelete = $scope.isView && EntityUtilService.hasActionCapability($scope.obj, 'delete');
		$scope.errors = null;
		$scope.dataReceived = true;
	}
	function returnBack() {
		if ($scope.parent) {
			NavigationService.setReturnData({ parent: $scope.parent });
			$location.path(NavigationService.getReturnUrl());
		}
		else {
			gotoList();
		}
	}

	$scope.cancel = returnBack;

	$scope.gotoEdit = function() {
		$location.path('/user/edit/' + $routeParams.id);		
	};

	$scope.gotoDelete = function() {
		$location.path('/user/delete/' + $routeParams.id);		
	};


	function saveAllThenGotoList() {
		saveIndex++;
		if (saveIndex === manyToManyCount) {
			returnBack();
		}
	}


	function gotoList() {
		$scope.uiWorking = false;
		$location.path('/user/');		
	}

	$scope.submit = function() {
		if ($scope.isCreation && !$scope.editForm.$invalid) {
			$scope.add();
		}
		else if ($scope.isEdition && !$scope.editForm.$invalid) {
			$scope.update();
		}
		else if ($scope.isDeletion) {
			$scope.delete();
		}
	};

	$scope.viewProfile = function(obj) {
		if ($scope.editForm && $scope.editForm.$dirty) {
			if (!confirm("You have unsaved changes!, do you want to move any way? press cancel to stay in this page")) {
				return;
			}
		}

		NavigationService.push($location.path(), "ViewProfile", {parent: $scope.obj} );
		$location.path('/profile/view/' + obj._id);
	};

	$scope.selectProfile = function() {
		NavigationService.push($location.path(), "SelectProfile", {parent: $scope.obj, criteria: EntityUtilService.buildNotInQuery(getProfileIds())} );
		$location.path('/profile/select');
	};
	
	$scope.addProfile = function() {
		NavigationService.push($location.path(), "AddProfile", {parent: $scope.obj, parentClass: 'user'} );
		$location.path('/profile/add');
	};
	
	$scope.deleteProfile = function(profile) {
		var index = $scope.obj.profile.indexOf(profile);
		if (index > -1) {
		    $scope.obj.profile.splice(index, 1);

			if($scope.editForm) {
				$scope.editForm.$dirty = true;
			}
		}
	};
	
	function addSelectProfileBack() {
		var navItem = popNavItem();
		if(navItem.returnData) {
			var user = navItem.returnData.parent;
			if(user) {
				var myProfile = navItem.returnData.entity;
				if(myProfile) {
					user.profile.push(myProfile);

				}
				$timeout(function() {
				  setObj(user);
				  $scope.dataReceived = true;
				}, 100);
				return;
			}
		}
		UserService.getDocument($routeParams.id).then(loadData, errorHandlerLoad);
	}

	function getProfileIds() {
		var ids = [];
		for (var i = 0; i < $scope.obj.profile.length; i++) {
			ids.push($scope.obj.profile[i]._id);
		}
		return ids;
	}


	function init() {
		$scope.isDeletion = isDeletionContext();
		$scope.isView     = isViewContext();
		$scope.readOnly   = $scope.isDeletion || $scope.isView;
		if ($routeParams.id) {
			$scope.isEdition = !$scope.readOnly;
			$scope.isCreation = false;
			setParent();
		}
		else {
			$scope.isEdition = false;
			$scope.isCreation = true;
			$scope.dataReceived = true;
			$scope.obj._id = 'new';
			setNavigationStatus();
		}

		SecurityService.getPermisionsFoResource('profile').then(function(httpData) {
			$scope.ui.createProfile = EntityUtilService.canExecute(httpData.data, 'create'); 
		});


		if (NavigationService.isReturnFrom('SelectProfile') || NavigationService.isReturnFrom('AddProfile')) {
			addSelectProfileBack();
			return;
		}
		if (NavigationService.isReturnFrom('ViewProfile')) {
			NavigationService.pop();
			setParent();
		}

		if ($routeParams.id) {
			UserService.getDocument($routeParams.id).then(loadData, errorHandlerLoad);		
		}

	}

	function isDeletionContext() {
		return stringContains($location.path(), '/delete/');
	}

	function isViewContext() {
		return stringContains($location.path(), '/view/');
	}

	
	function stringContains(text, substring) {
		return text.indexOf(substring) > -1;
	}
	function setParent() {
		var state = NavigationService.getState();
		$scope.parent = (state && state.parent) ? state.parent : null;
		return state;
	}


	function popNavItem() {
		var navItem = NavigationService.pop();
		setNavigationStatus();
		return navItem;
	}

	function setObj(obj) {
		$scope.obj = obj;
		if($scope.editForm) {
			$scope.editForm.$dirty = true;
		}

		if ($routeParams.id && !$scope.obj) {
			UserService.getDocument($routeParams.id).then(loadData, errorHandlerLoad);
		}

	}


	function setNavigationStatus() {

		var state = setParent();
		if ($scope.parent) {
			switch (state.parentClass) {
				case 'profile':
					$scope.obj.hideProfile = true;
					break;

				default:
					break;
			}
		}

	}

	init();
}]);
