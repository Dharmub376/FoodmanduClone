

app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'foodmandu.com'
});

; app.requires.push('ui.bootstrap');

// Service For VendorDetail 
; (function () {
    'use strict';
    app.factory('OldVersionService', ['$http',  '$filter', function ($http,  $filter) {
        
        var ovFactory = {};

        //enquiry save for listing venors

        var _saveReview = function (review) {
            var request = $http({
                method: 'POST',
                url: serviceBase + 'api/Review/Insert',
                data: review
            });
            return request;
        };

        ovFactory.SaveReview = _saveReview;

        return ovFactory;
    }]);
}());




//Modal controller
; (function () {
    'use strict';
    app.controller('OldVersionController', ['$scope', '$rootScope', '$uibModal', '$window', 'OldVersionService', '$uibModalStack', '$log','$location', '$filter', function ($scope, $rootScope, $uibModal, $window, OldVersionService, $uibModalStack, $log, $location, $filter) {

        $scope.GoPrev = function ()
        {
            $scope.review = {};
            $scope.showMessage = false;
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                scope: $scope,
                templateUrl: 'ReviewForm',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });
        }
       
        $scope.showMessage = false;
        $scope.SaveFeedback = function () {
            $scope.loading = true;            
            OldVersionService.SaveReview($scope.review).then(function (results) {
                $scope.showMessage = true;              
                $window.location.href = "http://v1.foodmandu.com";
                $scope.loading = false;
            }, function (error) {
                $scope.showMessage = true;
                $scope.loading = false;
            })
        }

        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

    }]);



}());

