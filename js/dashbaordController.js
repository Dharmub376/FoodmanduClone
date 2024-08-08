//Created By: Prashant 
//Created On: 8/12/2017 
// Controller for Dashbaord
// Initialization for Dashboard

app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'foodmandu.com'
});

// Service For Dashboard 
; (function () {
    'use strict';
    app.factory('dashboardService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var dashboardServiceFactory = {};

        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "Dashboard",
                FilterList: [
                    {
                        DDLName: "DELIVERYZONES",
                        Param1: "",
                        Param2: "HIDE_DEFAULT"
                    }
                ]
            };
        };


        // Get DDL List by Filter
        var _getDDLList = function (ddlFilter) {
            return $http({
                url: serviceBase + 'api/Home/LoadDDLs',
                method: "post",
                data: ddlFilter
            });
        };

        //enquiry save for listing venors

        var _saveEnquiry = function (enquiry) {
            var request = $http({
                method: 'POST',
                url: serviceBase + 'api/Enquiry/Insert',
                data: enquiry
            });
            return request;
        };

        //enquiry save for listing venors
        var _saveContact = function (contact) {
            var request = $http({
                method: 'POST',
                url: serviceBase + 'api/Contact/Insert',
                data: contact
            });
            return request;
        };


        // Get Noticess by Filter
        var _getNoticess = function () {
            return $http({
                url: serviceBase + 'api/General/GetNotices',
                method: "post",
                data: { PageNumber: 1, PageSize: 1, ShowAll: 0 }
            });
        };

        // Close Noticess by Filter
        var _closenotice = function () {
            var request = $http({
                method: 'GET',
                url: baseUrl + 'General/CloseNotice?NoticeType=HOME',

            });
            return request;
        };


        var _getAutoSuggestVendor = function (Keyword) {
            var request = $http({
                method: 'GET',
                url: serviceBase + 'api/v2/Vendor/AutoSuggest?Keyword=' + Keyword
            });
            return request;
        };

        var _getAllDeals = function () {
            var request = $http({
                method: 'GET',
                url: serviceBase + 'api/v2/Vendor/GetAllDeals'
            });
            return request;
        }

        dashboardServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        dashboardServiceFactory.GetDDLByFilter = _getDDLList;

        dashboardServiceFactory.SaveEnquiry = _saveEnquiry;
        dashboardServiceFactory.SaveContact = _saveContact;

        dashboardServiceFactory.GetNotices = _getNoticess;
        dashboardServiceFactory.CloseNoticeForSession = _closenotice;
        dashboardServiceFactory.GetAutoSuggestVendor = _getAutoSuggestVendor;
        dashboardServiceFactory.GetAllDeals = _getAllDeals;

        return dashboardServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    app.controller('dashboardController', ['$scope', '$rootScope', '$window', 'dashboardService', 'modalService', '$uibModal', '$uibModalStack', '$filter', function ($scope, $rootScope, $window, dashboardService, modalService, $uibModal, $uibModalStack, $filter) {

        // Variables and declarations 

        $scope.loading = false;
        $scope.fm_filter = { search_text: "", search_type: "restaurant", showMinlenErr: false, searchcity: "1" };
        $scope.mode = "";
        $scope.locationloading = true;

        //ddls list
        $scope.deliveryzonesddl = []; //delivery zones ddl

        //Populate DDLs
        var ddlFilter = dashboardService.DDLDefaultFilter();
        dashboardService.GetDDLByFilter(ddlFilter).then(function (results) {
            $scope.ddLItems = angular.fromJson(results.data.DDLItems);
             //Get delivery zones
            $scope.deliveryzonesddl = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === "DELIVERYZONES" })[0].Items;
            $scope.locationloading = false;
            $scope.mode = $filter('filter')($scope.deliveryzonesddl, function (d) { return d.Name === "Kathmandu" })[0];
            console.log($scope.locationloading);

        });

        // Methods
        $scope.SearchByVendor = function () {
            //if ($scope.fm_filter.search_text.length >= 3) {
            //    $scope.fm_filter.showMinlenErr = false;
            //}
            //Create string url
            var url = baseUrl + "Restaurant/Index?";

            //Load Key
            url += "q=" + $scope.fm_filter.search_text;
            url += "&k=restaurant";
            url += "&cty=" + $scope.fm_filter.searchcity;
            //url += "&sortby=2";

            //$window.location.href = baseUrl + 'Restaurant/Index?q=' + $scope.fm_filter.search_text + '&k=restaurant';
            $window.location.href = url;
        };


        //default hide error message
        $scope.fm_filter.showMinlenErr = false;

        $scope.SearchByFood = function () {
            if ($scope.fm_filter.search_text.length < 3) {
                $scope.fm_filter.showMinlenErr = true;
                return;
            }
            else {
                $window.location.href = baseUrl + 'Restaurant/Index?q=' + $scope.fm_filter.search_text + '&k=food';
            }
        };

        $scope.SearchBy = function () {
            switch ($scope.fm_filter.search_type) {
                case "food":
                    $scope.SearchByFood();
                    break;
                default:
                    $scope.SearchByVendor();
            }
        };

        //Change City on change
        $scope.ChangeCity = function (selectedCityId) {
            $scope.mode = $filter('filter')($scope.deliveryzonesddl, function (d) { return d.Value === selectedCityId })[0];
            console.log($scope.mode);
        };

        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

        // Functions 



        //Datepicker
        $scope.dateOptions = {
            'year-format': "'yy'",
            'show-weeks': false
        };

        $scope.showMobilePopup = false;

        if (typeof (isMobile) != 'undefined') {
            if (isMobile) {
                $scope.showMobilePopup = true;
            }
        };

        ////texts to show while page load in home index in modal popup.
        //$scope.messageHeaderHTML = '';
        //$scope.messageBodyHTML = '<div class="col-sm-12"><img src="' + baseUrl + '/img/welcome.png" width="100%" /><br/> <p><b>Note:</b> If you experience any difficulty using our new website, you can go back to older version <a href="v1.foodmandu.com" target="_blank"><b>v1.foodmandu.com</b></a> from the <b>"Go to old website"</b> link that you can see at the bottom left corner of the website.</p></div>';
        $scope.notice = { LoadEachRefresh: false };

        if (showhomepopup == "True") {
            dashboardService.GetNotices().then(function (results) {
                if (results.data.length > 0) {
                    $scope.notice = results.data[0];
                    $scope.notice.NoticeEndDate = new Date($scope.notice.NoticeEndDate + 'Z');
                    var currentDate = new Date();

                    if ($scope.notice.NoticeEndDate >= currentDate) {
                        LoadPopup($scope.notice);
                    }
                }

                if (!$scope.notice.LoadEachRefresh) {
                    //Close this as well. 
                    dashboardService.CloseNoticeForSession().then(function (results) {
                        console.log("Notice closed for now.");
                    }, function (error) {

                    });
                }

            }, function (error) {
                $scope.showMessage = true;
                $scope.loading = false;
            });

        };



        $scope.OpenEnquiryForm = function () {
            $scope.enquiry = {};
            $scope.showMessage = false;
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                scope: $scope,
                templateUrl: 'EnquiryForm',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });
        }

        //REGION 'CONTACT AND ENQUIRY FORM'

        $scope.enquiry = {};

        //save enquiry
        $scope.showMessage = false;

        $scope.SaveEnquiry = function () {
            $scope.loading = true;
            dashboardService.SaveEnquiry($scope.enquiry).then(function (results) {
                $scope.showMessage = true;
                $scope.loading = false;

            }, function (error) {
                $scope.showMessage = true;
                $scope.loading = false;
            })
        }

        function LoadPopup(notice) {


            var modalOptions = {
                closeButtonText: 'Close',
                HideOK: false,
                actionButtonText: 'OK',
                headerText: notice.NoticeHeader,
                bodyText: notice.NoticeBody,
                HideClose: true,
                keyboard: true
            };

            modalService.showModal({}, modalOptions).then(function (result) {

            });


        }

        // ./ END REGION

        $scope.setPcode = function (item) {



            if (item.Value * 1 > 1 && !isNaN(item.Value * 1)) {
                $scope.fm_filter.search_text = item.DisplayText;
                $window.location.href = "/Restaurant/Details/" + item.Value * 1;

            }
            else {
                $scope.fm_filter.search_text = item.Value;
            }



        }


        $scope.LoadAutoSuggest = function () {
            $scope.suggests = [];
            $scope.autoloading = true;
            dashboardService.GetAutoSuggestVendor($scope.fm_filter.search_text).then(function (results) {
                $scope.suggests = results.data;
                $scope.autoloading = false;

            })

        }

        //load all deals
        $scope.vendorDeals = [];
        $scope.GetAllDeals = function () {
            dashboardService.GetAllDeals().then(function (results) {

                if (results.data.VendorDeals.length > 0) {
                    $scope.vendorDeals = results.data.VendorDeals;
                    //console.log($scope.vendorDeals);
                }
                else {
                    $scope.vendorDeals = [];
                }
            }, function (error) {
                console.log(error.data);
            })
        }

        $scope.GetAllDeals();

    }]);
}());

// Controller Starts Here.. 


// Controller Starts Here.. 
; (function () {
    'use strict';
    app.controller('contactController', ['$scope', '$rootScope', '$window', 'dashboardService', 'modalService', '$uibModal', '$uibModalStack', '$filter', function ($scope, $rootScope, $window, dashboardService, modalService, $uibModal, $uibModalStack, $filter) {


        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

        // Functions 
        $scope.loading = false;

        $scope.OpenEnquiryForm = function () {
            $scope.enquiry = {};
            $scope.showMessage = false;
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                scope: $scope,
                templateUrl: 'EnquiryForm',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });
        }

        //REGION 'CONTACT AND ENQUIRY FORM'

        $scope.contact = {};


        //save contact messages       
        $scope.Savecontact = function () {
            $scope.loading = true;
            dashboardService.SaveContact($scope.contact).then(function (results) {
                $scope.showMessage = true;
                $scope.loading = false;
            }, function (error) {
                $scope.showMessage = true;
                $scope.loading = false;
            })
        }



        // ./ END REGION



    }]);
}());