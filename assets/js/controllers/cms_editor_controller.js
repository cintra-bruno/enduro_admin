// * ———————————————————————————————————————————————————————— * //
// * 	cms editor controller
// *	main controller for cms editor
// * ———————————————————————————————————————————————————————— * //
enduro_admin_app.controller('cms-editor-controller', ['$scope', '$rootScope', '$routeParams', 'content_service', 'culture_service', 'hotkeys',
	function ($scope, $rootScope, $routeParams, content_service, culture_service, hotkeys) {
		console.log('cms-editor-controller')
		// get page specified in route
		content_service.get_content($routeParams.page_path)
			.then(function (res) {
				$scope.deletable = res.deletable
				// extend scope with the fetched context
				$scope = angular.extend($scope, res)
			}, function () {})

		// gets all available cultures
		culture_service.get_cultures()
			.then(function (res) {
				$scope.cultures = res
				$scope.current_culture = res[0] || ''
				$scope.on_default_culture = $scope.current_culture == res[0]
			}, function () {})

		// * ———————————————————————————————————————————————————————— * //
		// * 	change culture
		// *	will swtich culture to specified
		// *
		// *	@param obj {$event} - event initializing the culture switch
		// *	returns nothing, just switches the culture
		// * ———————————————————————————————————————————————————————— * //
		$scope.change_culture = function (obj) {

			// gets data-culture from the element initializing the switch
			var selected_culture = $(obj.target).data('culture')

			// sets current culture and true/false whether page is on default culture
			$scope.current_culture = selected_culture
			$scope.on_default_culture = selected_culture == $scope.cultures[0]
		}

		// * ———————————————————————————————————————————————————————— * //
		// * 	change culture
		// *	saves context
		// *
		// *	returns nothing
		// * ———————————————————————————————————————————————————————— * //
		$scope.publish = function () {
			$scope.publishing = true

			content_service.save_content($routeParams.page_path, $scope.context)
				.then(function () {
					$scope.publishing = false
				}, function () {
					$scope.publishing = false
				})
		}

		// * ———————————————————————————————————————————————————————— * //
		// * 	change culture
		// *	generates temp page out of current context
		// *
		// *	returns nothing
		// * ———————————————————————————————————————————————————————— * //
		$scope.temp = function () {
			$scope.temping = true
			content_service.get_temp_page($routeParams.page_path, $scope.context)
				.then(function (temp_destination_path) {

					$scope.temping = false
					if ($scope.tempwindow && $scope.tempwindow.location.hostname) {
						$scope.tempwindow.focus()
						$scope.tempwindow.location = '/' + temp_destination_path.data
					} else {
						$scope.tempwindow = window.open('/' + temp_destination_path.data, 'enduro temp window')
					}

				}, function () {
					$scope.temping = false
				})
		}

		// * ———————————————————————————————————————————————————————— * //
		// * 	delete current page
		// *	returns nothing
		// * ———————————————————————————————————————————————————————— * //
		$scope.delete_current_page = function () {
			content_service.delete_page($routeParams.page_path)
				.then(function (res) {
					console.log(res)
				})

			// delete page from the cmslist
			// console.log($rootScope.cmslist)
		}

		// decides if the application is demo
		$scope.is_demo = $rootScope.user.tags && $rootScope.user.tags.indexOf('demo') + 1

		// Helper functions
		$scope.isString = function (item) { return angular.isString(item) }
		$scope.isNumber = function (item) { return angular.isNumber(item) }
		$scope.isArray = function (item) { return angular.isArray(item) }
		$scope.isBoolean = function (item) { return typeof (item) === 'boolean' }
		$scope.isObject = function (item) {
			if (typeof item === 'object') {
				if (angular.isArray(item)) {
					return false
				}
				return true
			}
			return false
		}

		// adding hotkeys
		hotkeys.bindTo($scope)
			.add({
				// publish hotkey
				combo: ['mod+s', 'mod+enter'],
				description: 'Publish current page',
				allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
				callback: function (e) {
					e.preventDefault()
					$scope.publish()
				}
			})
			.add({
				// temp hotkey
				combo: ['mod+d', 'mod+t'],
				description: 'Temp current page',
				allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
				callback: function (e) {
					e.preventDefault()
					$scope.temp()
				}
			})
			.add({
				// temp hotkey
				combo: ['mod+p'],
				description: 'Search for page',
				allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
				callback: function (e) {
					e.preventDefault()
					$('.page-search-input').focus()
				}
			})

	}])
