//Created By: Prashant 
//Created On: 8/12/2017 
// Controller for Dashbaord
// Initialization for VendorDetail

app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'foodmandu.com'
});

app.directive('fmRecaptcha', function () {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            var s = document.createElement('script');
            s.src = 'https://www.google.com/recaptcha/api.js';
            document.body.appendChild(s);
        },
        template: '<div class="g-recaptcha" data-sitekey="6Ld4AOQUAAAAAOl6JaxSmIyMUPJ8eGOBTqNfVDtx"></div>'
    };
});

app.requires.push('ngMap');
// Service For VendorDetail 
; (function () {
    'use strict';
    app.factory('ShoppingCartService', ['$http', 'ngAuthSettings', '$filter', '$timeout', '$location', '$window', function ($http, ngAuthSettings, $filter, $timeout, $location, $window) {

    	var serviceBase = ngAuthSettings.apiServiceBaseUri;
    	var scFactory = {};
    	var _loading = true;
    	var _cartloading = false;
    	var _showEmpty = false;

    	//Primary Show Hide Properties
    	var _showprofile = false;
    	var _showbag = false;
    	var _shownotifications = false;
    	var _deliverydistance = null;
    	var _selectedaddress = null;
    	var _selectedvendor = null;


    	var showhidewindow = function (window) {
    		switch (window) {
    			case "NOTIFICATIONS":
    				_showprofile = false;
    				_showbag = false;
    				_shownotifications = !_shownotifications;
    				break;
    			case "PROFILE":
    				_shownotifications = false;
    				_showbag = false;
    				_showprofile = !_showprofile;
    				break;
    			case "BAG":
    				_shownotifications = false;
    				_showprofile = false;
    				_showbag = !_showbag;
    				break;
    		}
    	};

    	var hidewindow = function (window) {
    		switch (window) {
    			case "NOTIFICATIONS":
    				_shownotifications = false;
    				break;
    			case "PROFILE":
    				_showprofile = false;
    				break;
    			case "BAG":
    				_showbag = false;
    				break;
    		}
    	};
		
    	var getstate = function (window) {
    		switch (window) {
    			case "NOTIFICATIONS":
    				return _shownotifications;
    				break;
    			case "PROFILE":
    				return _showprofile;
    				break;
    			case "BAG":
    				return _showbag;
    				break;
    		};
    		return false;

    	}

    	var _readonly = false;

    	var _shoppingCart = []; // Shopping Cart
    	var _isauthenticated = false;

    	if (typeof (IsAuthenticated) != 'undefined') {
    		_isauthenticated = (IsAuthenticated == 'True') ? true : false;
    	}

    	var _cartByVendor = {};
    	var _vendorid = (typeof (vendorId) == 'undefined' ? 0 : vendorId);

    	// Set Loading effect
    	var _setLoading = function (val) {
    		_loading = val;
    	}

    	// Set read only
    	var _setReadOnly = function (val) {
    		_readonly = val;
    	}

    	//Default Filter 
    	var _defaultDDLFilter = function () {
    		return {
    			PageName: "VendorDetail",
    			FilterList: [
    			]
    		};
    	};

    	//Empty filter for Vendor
    	var _getEmptyFilter = function () {
    		return {
    			vendorid: 0,
    			Keyword: ""
    		};
    	};

    	// Get Vendor Details
    	var _getVendorDetails = function (vendorId) {
    		var request = $http({
    			method: 'get',
    			url: serviceBase + "api/vendor/GetVendorDetail",
    			params: { VendorId: vendorId }
    		});

    		return request;
    	};


        //load vendor branches
    	var _loadVendorBranches = function (VendorId) {
    	    var request = $http({
    	        method: 'get',
    	        url: serviceBase + "api/vendor/LoadBranches",
    	        params: { VendorId: vendorId }
    	    });

    	    return request;
    	}

    	// Get Products
    	var _getProducts = function (prodFilter) {

    		var request = $http({
    			method: 'get',
    			url: serviceBase + "api/Product/getproducts",
    			params: prodFilter
    		});

    		return request;
    	};

        // Get Products By Category
        var _getProductsByCategory = function (prodFilter) {

            var request = $http({
                method: 'get',
                url: serviceBase + "api/v2/Product/GetVendorProductsBySubCategoryV2",
                params: prodFilter
            });
            //if (prodFilter.VendorId == 948) {
            //    request = $http.get('http://localhost/Foodmandu_V2/cat.json');
            //}
            
            return request;
        };

    	// Get DDL List by Filter
    	var _getDDLList = function (ddlFilter) {
    		return $http({
    			url: serviceBase + 'api/Home/LoadDDLs',
    			method: "post",
    			data: ddlFilter
    		});
    	};

    	//REGION "CART OPERATAIONS"

    	//Load User Cart
    	var _loadCart = function (VendorId) {
    		var request = $http({
    			method: 'GET',
    			url: serviceBase + 'api/ShoppingCart/DetailForAll',
    			params: { VendorId: VendorId }

    		});
    		return request;
    	};

    	//Update User Cart Ajax Call
    	var _updateUserCart = function (shoppingCartItem) {

    		var request = $http({

    			method: 'POST',
    			url: serviceBase + 'api/v2/ShoppingCart/Item',
    			data: shoppingCartItem

    		});
    		return request;
    	}

    	//Get Totals
    	var _gettotals = function (obj) {
    		var request = $http({
    			method: 'GET',
    			url: serviceBase + 'api/v2/ShoppingCart/GetCartTotals',
    			params: obj
    		});
    		return request;
    	};


    	//Update User Cart Ajax Call
    	var _removeItem = function (ShoppingCartItemId) {

    		var request = $http({

    			method: 'DELETE',
    			url: serviceBase + 'api/v2/ShoppingCart/Item',
    			params: { ShoppingCartItemId: ShoppingCartItemId }

    		});
    		return request;
    	}

    	//Load Cart By User
    	var _loadUserCart = function () {            
    		if (_isauthenticated) {
    			_shoppingCart = [];
    			_cartByVendor = {};

    			var cart = {};
    			_loadCart(0).then(function (results) {
    				
    				angular.forEach(results.data.m_Item1, function (vendor) {
    					cart.Vendor = vendor;
    					_shoppingCart.push(cart);

    					cart = {};
    				});

    				angular.forEach(_shoppingCart, function (cart) {
    					var items = $filter('filter')(results.data.m_Item2, function (d) { return d.vendorid === cart.Vendor.Id });
    					cart.Items = items;
    					if (items.length > 0) {
    						cart.ShoppingCartId = items[0].ShoppingCartId;
    					}
    					else
    					{
    						cart.ShoppingCartId = 0;
    					}
    				});

    				angular.forEach(_shoppingCart, function (cart) {
    					var Totals = $filter('filter')(results.data.m_Item3, function (d) { return d.VendorId === cart.Vendor.Id });
                        var SubTotal = $filter('filter')(Totals, function (d) { return (d.Label == 'SUB TOTAL' || d.Label == 'FOOD TOTAL') });
                        var SmallOrderFee = $filter('filter')(Totals, function (d) { return (d.Label == 'SMALL ORDER FEE') });

    					var SubTotalValue = '';
    					var SubTotals = $filter('filter')(SubTotal, function (key, value) { SubTotalValue = key.Value });
                        cart.SubTotal = SubTotalValue;
                        cart.SmallOrderFee = ((SmallOrderFee.length > 0) ? SmallOrderFee[0] : null);
    					cart.Totals = Totals;
    				});
    				
    				if (_vendorid > 0) {
    					var _vendorsById = $filter('filter')(_shoppingCart, function (d) { return d.Vendor.Id === _vendorid });
    					if (_vendorsById.length > 0) {
                            _cartByVendor = _vendorsById[0];
    						_setdrivingdistance();
    					}
                    }
    				_cartloading = false;
    				_showEmpty = false;
    			});

    		}
    	};

    	//Load Cart By Vendor
    	var _loadUserCartByVendor = function (cart) {
    		if (_isauthenticated) {
    			_loadCart(cart.Vendor.Id).then(function (results) {

    				var items = $filter('filter')(results.data.m_Item2, function (d) { return d.vendorid === cart.Vendor.Id });
    				cart.Items = items;

    				var Totals = $filter('filter')(results.data.m_Item3, function (d) { return d.VendorId === cart.Vendor.Id });
    				var SubTotal = $filter('filter')(Totals, function (d) { return d.Label == 'SUB TOTAL' });
    				var SubTotalValue = '';
    				var SubTotals = $filter('filter')(SubTotal, function (key, value) { SubTotalValue = key.Value });
    				cart.SubTotal = SubTotalValue;
    				cart.Totals = Totals;
    				_cartloading = false;
    				_showEmpty = false;

    				_setdrivingdistance();
    			});

    		}
    	};


    	//Add Cart
    	var _addupdatecart = function (shoppingCartItem, cart) {
    	    if (angular.equals({}, cart)) {
    	        _showEmpty = true;    	        
    	    }
    	   
    	    
            
    		var loadCartOnly = false;
    		_cartloading = true;
            
    		if (typeof (cart) != 'undefined') { loadCartOnly = true; }
    		if (_isauthenticated) {

    			_updateUserCart(shoppingCartItem).then(function (results) {
                    
    				if (angular.equals({}, cart)) {
    					_loadUserCart();
    				}

    				else if (loadCartOnly) {
    					_loadUserCartByVendor(cart);
    				}
    				else {
    					_loadUserCart();
    					_cartloading = false;
    					_showEmpty = false;
    				}
    				//_setdrivingdistance();
                   
    			}, function (error) {
    			    alert(error.data.Message);
    				//MSG({ 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while adding item!'});
    				_cartloading = false;
    				_showEmpty = false;
    			});
    		};
    	};

    	//Add Distance and delivery price.

    	// Set Selected Address
    	var _setselectedaddress = function (val) {
    		_selectedaddress = val;
    	}

    	// Set Selected Vendor
    	var _setselectedvendor = function (val) {
    		_selectedvendor = val;
    	}

    	//Get distance
    	var _getDistance = function (lat1, lon1, lat2, lon2, unit) {

    		var radlat1 = Math.PI * lat1 / 180
    		var radlat2 = Math.PI * lat2 / 180
    		var theta = lon1 - lon2
    		var radtheta = Math.PI * theta / 180
    		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    		dist = Math.acos(dist)
    		dist = dist * 180 / Math.PI
    		dist = dist * 60 * 1.1515
    		if (unit == "K") { dist = dist * 1.609344 }
    		if (unit == "N") { dist = dist * 0.8684 }
    		return dist;
    	};

    	//get delivery charges for checkout
    	var _getDeliveryCharge = function (params) {

    		var request = $http({
    			method: 'GET',
    			url: serviceBase + 'api/Checkout/GetDeliveryCharge',
    			params: params

    		});

    		return request;
    	};

    	//get Google Driving Distance
    	var _setdrivingdistance = function () {

    		if (_selectedaddress == null || _selectedvendor == null) {
    			return;
    		};
    		var lat1 = _selectedaddress.LocationLat;
    		var lng1 = _selectedaddress.LocationLng;

    		var lat2 = _selectedvendor.LocationLat;
    		var lng2 = _selectedvendor.LocationLng;

    		_deliverydistance = _getDistance(lat1, lng1, lat2, lng2, 'K');

    		var directionsService = new google.maps.DirectionsService();
    		var request = {
    			origin: new google.maps.LatLng(lat1, lng1),
    			destination: new google.maps.LatLng(lat2, lng2),
    			travelMode: google.maps.DirectionsTravelMode.DRIVING
    		};
    		directionsService.route(request, function (response, status) {
    			if (status == google.maps.DirectionsStatus.OK) {
    				_deliverydistance = (parseFloat(response.routes[0].legs[0].distance.value) / 1000);
    			}
    			if (!isNaN(_deliverydistance)) {
    				_setdeliverycharge();
    			}

    		});
    	};

    	//Get Delivery Charges
        var _setdeliverycharge= function () {
        	_cartloading = true;
        	var params = {
        		SubTotal: parseFloat(_cartByVendor.SubTotal),
        		Distance: parseFloat(_deliverydistance),
        		VendorId: _cartByVendor.Vendor.Id,
        		CouponCode: "",
        		LocationLat: _selectedaddress.LocationLat,
        		LocationLng: _selectedaddress.LocationLng
        	};

        	_gettotals(params).then(function (results) {
                _cartByVendor.Totals = results.data.totals;
                _cartByVendor.DoNotCallText = results.data.DoNotCallText;

        		var DeliveryCharge = $filter('filter')(_cartByVendor.Totals, function (d) { return d.Label == 'DELIVERY CHARGE' });
        		_cartByVendor.DeliveryCharge = parseFloat(DeliveryCharge[0].Value).toFixed(2);
        		_cartByVendor.DeliveryDistance = _deliverydistance;
        		_cartloading = false;
        		_showEmpty = false;
        	});
        };

    	//Set Totals by Coupon Code
        var _settotalsbycoupon = function (_cartByVendor, Coupon) {
        	_cartloading = true;
        	var params = {
        		SubTotal: parseFloat(_cartByVendor.SubTotal),
        		Distance: parseFloat(_deliverydistance),
        		VendorId: _cartByVendor.Vendor.Id,
        		CouponCode: Coupon.Code
        	};
        	_gettotals(params).then(function (results) {
                _cartByVendor.Totals = results.data.totals;
                _cartByVendor.DoNotCallText = results.data.DoNotCallText;
        		var DeliveryCharge = $filter('filter')(_cartByVendor.Totals, function (d) { return d.Label == 'DELIVERY CHARGE' });
        		_cartByVendor.DeliveryCharge = parseFloat(DeliveryCharge[0].Value).toFixed(2);
        		_cartByVendor.DeliveryDistance = _deliverydistance;
        		_cartloading = false;
        		_showEmpty = false;
        	}, function (error) {
        		MSG({ 'elm': 'error_msg_coupon', 'MsgType': 'ERROR', 'MsgText': $scope.Coupon.msg });
        		Coupon.msg = error.data.Message;
        		_cartloading = false;
        		_showEmpty = false;
        		return false;
        	});
        };

		//Remove Cart Item
        var _removeCartItem = function (ShoppingCartItemId, cart) {
        	_cartloading = true;
            var loadCartOnly = false;

            if (_isauthenticated) {
                if (typeof (cart) != 'undefined') { loadCartOnly = true; }
                _removeItem(ShoppingCartItemId).then(function (results) {
                	
                    if (loadCartOnly) {
                        _loadUserCartByVendor(cart);
                      
                    } else {
                        _loadUserCart();
                        
                    }
                   
                    return true;
                }, function (error) {
                    MSG({ 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while adding item!', 'MsgAsModel': error.data });
                    _cartloading = false;
                    _showEmpty = false;
                    return false;
                });
            };
            return false;
        };

        //Update Quantity
        var _updateQuantity = function (item, quantity, cart) {
            var allowUpdate = true;
            var loadcartOnly = false;

            if (((quantity == -1) && item.Quantity == 1) || ((quantity == +1) && item.Quantity > 999)) {
                allowUpdate = false;
            }
            if (!allowUpdate) {
                _cartloading = false;
                _showEmpty = false;
                return false;
            }
            item.Quantity = item.Quantity + quantity;
            //Finally
            _addupdatecart(item, cart);
        };

        //Check If Can Checkout
        var _cancheckout = function (cart) {

            if (typeof (cart) == 'undefined') {
                cart = angular.copy(_cartByVendor);
            }
            if (typeof (cart.Vendor) != 'undefined') {
                return cart.Vendor.MinimumOrderAmount <= cart.SubTotal;
            }
            return false;

        }

        // FINALLY LOAD UsER CART FOR THE FIRST TIME
        if (_isauthenticated) {
            _loadUserCart(); // Initialize
        }

        // ./ "CART OPERATAIONS"


        // REGION "USER PROFILE"


        // Get User Full Profile
        var _getUserProfile = function (profileparam) {

            var request = $http({
                method: 'get',
                url: serviceBase + "api/v2/user/FullProfile?AddressId="+profileparam.AddressId
            });

            return request;
        };


      
        // /."USER PROFILE"


        //Update favourite product

        var _updateFav = function (productItem) {
            var request = $http({
                method: 'POST',
                url: serviceBase + 'api/Product/UpdateUserFavorite',
                data: productItem
            });
            return request;
        };

        //update user favourites
        var _updateFavVendor = function (fav) {
            return $http({
                method: 'POST',
                url: serviceBase + 'api/Vendor/UpdateUserFavorite',
                data: fav
            });
        };


        //auto suggest section

        var _getAutoSuggestVendor = function (Keyword) {
            var request = $http({
                method: 'GET',
                url: serviceBase + 'api/v2/Vendor/AutoSuggest?Keyword=' + Keyword
            });
            return request;
        };



        //Product Menus & vendor
        scFactory.GetVendorDetails = _getVendorDetails;
        scFactory.LoadVendorBranches = _loadVendorBranches;
        scFactory.GetProducts = _getProducts;
        scFactory.GetProductsByCategory = _getProductsByCategory;
        
        // Cart Operations 
        scFactory.ReInit = _loadUserCart;

        scFactory.CartItems = function () { return _shoppingCart; };
        scFactory.CartByVendor = function () { return _cartByVendor; };
        scFactory.CanCheckOut = _cancheckout;
        scFactory.AddUpdateCart = _addupdatecart;
        scFactory.RemoveCartItem = _removeCartItem;
        scFactory.UpdateQuantity = _updateQuantity;

        //User Profile
        scFactory.GetUserProfile = _getUserProfile;        

        //Misc
        scFactory.SetLoading = _setLoading;
        scFactory.SetReadOnly = _setReadOnly;

        scFactory.Loading = function () { return _loading; };
        scFactory.CartLoading = function () { return _cartloading; };
        scFactory.ShowEmpty = function () { return _showEmpty; }; 

        scFactory.ReadOnly = function () { return _readonly; };

        scFactory.DDLDefaultFilter = _defaultDDLFilter;
        scFactory.GetDDLByFilter = _getDDLList;
        scFactory.GetEmptyFilter = _getEmptyFilter;

        //update fav product
        scFactory.UpdateUserFav = _updateFav;
        scFactory.UpdateFavVendor = _updateFavVendor;
      
        scFactory.ShowHideWindow = showhidewindow;
        scFactory.HideWindow = hidewindow;
        scFactory.GetState = getstate;

    	//RElated with checkout page
        scFactory.GetTotals = _gettotals;
        scFactory.GetDeliveryDistance = function () { return _deliverydistance; };
        scFactory.SetSelectedAddress = _setselectedaddress;
        scFactory.SetSelectedVendor = _setselectedvendor;
        scFactory.SetDrivingDistance = _setdrivingdistance;
        scFactory.GetAutoSuggestVendor = _getAutoSuggestVendor;
        scFactory.SetTotalByCoupon = _settotalsbycoupon;

        return scFactory;
    }]);

}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    app.controller('ProductController', ['$scope', '$rootScope', '$window', '$location', '$anchorScroll', 'ShoppingCartService', 'modalService', '$timeout', '$uibModal', '$uibModalStack', '$filter', function ($scope, $rootScope, $window,$location, $anchorScroll, ShoppingCartService, modalService, $timeout, $uibModal, $uibModalStack, $filter) {

        // Variables and declarations 

        //$scope.loading = true;
        $scope.vendorInfo = {}; // Vendor Info
        $scope.products = []; // Menu Products
        $scope.query = '';
        $scope.vendorid = (typeof (vendorId) == 'undefined' ? 0 : vendorId);
        $scope.ProductItem = {}; // Product Item

        //Populate DDLs
        var ddlFilter = ShoppingCartService.DDLDefaultFilter();
        //ShoppingCartService.GetDDLByFilter(ddlFilter).then(function (results) {
        //    $scope.ddLItems = angular.fromJson(results.data.DDLItems);

        //});

        // REGION "CART OPERATIONS"

        // Init Cart and Items

        $scope.loading = function () { return ShoppingCartService.Loading(); }// Loading Effects
        $scope.cartloading = function () { return ShoppingCartService.CartLoading(); }// Loading Effects
        $scope.showEmpty = function () { return ShoppingCartService.ShowEmpty(); }

        //Load Cart Items
        $scope.CartItems = function () { //productService.GetCart();
            return ShoppingCartService.CartItems();
        };

        //Load Cart By Vendor
        $scope.CartByVendor = function () { //productService.GetCart();
            return ShoppingCartService.CartByVendor();
        };

        // Open Add/Update Item Dialog
        $scope.ShowAddUpdateItemDialog = function (menuItem) {
            if (menuItem.type == 'subCategory') return;
            MSG({}); //Init
            var _isauthenticated = false;

            if (typeof (IsAuthenticated) != 'undefined') {
                _isauthenticated = (IsAuthenticated == 'True') ? true : false;
            }
            if (_isauthenticated) {

            	if ($scope.vendorInfo.IsVendorClosed && $scope.vendorInfo.CloseNotice) {
            		ShowVendorCloseInfo();
            		return;
            	}
                $scope.ProductItem = {
                    amount: menuItem.price
				, attributesXml: ''
				, description: ''
				, productDesc: menuItem.productDesc
				, name: menuItem.name
				, price: menuItem.price
				, ProductGridImage: menuItem.ProductGridImage
				, productId: menuItem.productId
				, quantity: menuItem.quantity
				, vendorid: menuItem.vendorid
				, IsFavouriteProduct: menuItem.IsFavouriteProduct
				, ShowRemove: false
                ,OldPrice:menuItem.oldprice
                };


                angular.forEach($scope.CartByVendor().Items, function (cartItem) {
                    if (cartItem.productId === $scope.ProductItem.productId) {
                        $scope.ProductItem.attributesXml = cartItem.attributesXml;
                        $scope.ProductItem.quantity = cartItem.quantity;
                        $scope.ProductItem.ShoppingCartItemId = cartItem.ShoppingCartItemId;
                        $scope.ProductItem.ShowRemove = true;
                        return false;
                    }
                });

                var modalInstance = $uibModal.open({
                    animation: true,
                    scope: $scope,
                    templateUrl: 'AddProductItem',
                    //backdrop: 'static',
                    keyboard: false,
                    modalFade: true,
                    size: ''
                });
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    scope: $scope,
                    templateUrl: 'Foodmandu_Login',
                    backdrop: 'static',
                    keyboard: false,
                    modalFade: true,
                    size: ''
                });
            }
        };

        //Update quantity from Cart
        $scope.UpdateQuantityFromCart = function (item, quantity) {
            var allowUpdate = true;
            if (((quantity == -1) && item.quantity == 1) || ((quantity == +1) && item.quantity > 999)) {
                allowUpdate = false;
            }

            if (!allowUpdate) {
                return false;
            }
            item.quantity = item.quantity + quantity;

        };

        //$scope.UpdateQuantity = function (item, quantity) {
        //    var shoppingCartItem = { ShoppingCartItemId: item.ShoppingCartItemId, ProductId: item.productId, Note: item.attributesXml, Quantity: item.quantity };
        //    //ShoppingCartService.SetLoading(true);
        //    ShoppingCartService.UpdateQuantity(shoppingCartItem, quantity);
        //};

    	//Update Quantity
        $scope.UpdateQuantity = function (item, quantity) {

        	var cart = $scope.CartByVendor();
        	var shoppingCartItem = { ShoppingCartItemId: item.ShoppingCartItemId, ProductId: item.productId, Note: item.attributesXml, Quantity: item.quantity };
        	//ShoppingCartService.SetLoading(true);
        	ShoppingCartService.UpdateQuantity(shoppingCartItem, quantity, cart);
        };


        //Add to Cart
        $scope.AddToCart = function (ProductItem) {

        	var cart = $scope.CartByVendor();
        	var shoppingCartItem = { ShoppingCartItemId: ProductItem.ShoppingCartItemId, ProductId: ProductItem.productId, Note: ProductItem.attributesXml, Quantity: ProductItem.quantity, VendorId: $scope.vendorid };
        	
            ShoppingCartService.AddUpdateCart(shoppingCartItem,cart);
            $uibModalStack.dismissAll();

        };

        // Remove From Cart
        $scope.RemoveCartItem = function (ProductItem) {
        	var cart = $scope.CartByVendor();
            if (typeof (ProductItem.ShoppingCartItemId) != 'undefined') {
                ShoppingCartService.RemoveCartItem(ProductItem.ShoppingCartItemId,cart);
                $uibModalStack.dismissAll();
            }
        };


        //Check if User can Checkout for This Vendor or Not
        $scope.CanCheckOut = function (cart) {
            return ShoppingCartService.CanCheckOut(cart);
        };

        //Check Out If applicable
        $scope.CheckOutIfApplicable = function (Id) {
            if (!$scope.CanCheckOut()) {
                //me.showMinAmountDialog(MinimumOrder, reloadMenuPage);
                // PENDING
                // SHOW MESSAGE WINDOW 
            } else {
                $window.location.href = baseUrl + 'CheckOut/Index/' + Id;
            }
        };
        // ./"CART OPERATIONS"

        //FAV OPTIONS
        //Add fav product
        $scope.AddtoFav = function (productItem) {

            var vendorId = productItem.vendorid;
            var isFav = productItem.IsFavouriteProduct;
            var productId = productItem.productId;
            var fav = { VendorId: vendorId, ProductId: productId, action: (isFav == false ? 'ADD' : 'REMOVE') };
            var _isauthenticated = false;
            if (typeof (IsAuthenticated) != 'undefined') {
                _isauthenticated = (IsAuthenticated == 'True') ? true : false;
            }
            if (_isauthenticated) {
                productItem.loading = true;
                ShoppingCartService.UpdateUserFav(fav).then(function (results) {
                    if (results.data.MsgType == 'SUCCESS') {
                        productItem.IsFavouriteProduct = !productItem.IsFavouriteProduct;
                        angular.forEach($scope.products, function (item) {
                            if (item.productid == productId) {
                                item.IsFavouriteProduct = isFav == false ? true : false;
                            }


                        });
                        productItem.loading = false;
                    }
                    else {
                        productItem.loading = false;
                    }
                }, function (error) {
                    productItem.loading = false;
                })

            }
        };

        //add update fav vendor
        //remove fav vendor
        $scope.UpdateFavVendor = function (vendorInfo) {            
            var fav = { VendorId: vendorInfo.Id, action: (vendorInfo.IsFavouriteVendor == 1 ? 'REMOVE' : 'ADD') };
            ShoppingCartService.UpdateFavVendor(fav).then(function (results) {
              
                if (results.data.MsgText == 'SUCCESS') {
                    if (vendorInfo.IsFavouriteVendor == 1) {
                        vendorInfo.IsFavouriteVendor = 0;
                    }
                    else
                    {
                        vendorInfo.IsFavouriteVendor = 1;
                    }
                    vendor.loading = false;
                                                                             
                }
                else {
                    vendor.loading = false;                    
                    console.log({ 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while updating favourite!', 'MsgAsModel': MsgText });
                }
            }, function (error) {
                console.log({ 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while updating favourite!', 'MsgAsModel': error.data });
                vendor.loading = false;
                
                
            })


        };

        //REGION "VENDOR AND MENUS"

        //Menus Details
        $scope.LoadMenusAndProductDetails = function () {
            if ($scope.vendorid > 0) {
                $scope.favProducts = [];


                ShoppingCartService.SetLoading(true);
                if (true) {
                    var filter = { VendorId: $scope.ProductFilter.vendorid, show: "" };

                    ShoppingCartService.GetProductsByCategory(filter).then(function (results) {

                        $scope.products = results.data;

                        $scope.products_subcategory = [];
                        angular.forEach($scope.products, function (cat) {
                            angular.forEach(cat.items, function (product) {
                               
                            });
                        });

                        angular.forEach($scope.products, function (value, key) {
                            value.subCategories = [];
                            angular.forEach(value.items, function (v, k) {
                                v.quantity = 1; // Load quantity to be 1 by default.
                                v.vendorid = $scope.vendorid;
                                //v.resetValues = false;

                                if (v.IsFavouriteProduct) {
                                    $scope.favProducts.push(v);

                                }

                                if (v.type == 'subCategory') {
                                    value.subCategories.push(v);
                                }

                            })
                        });

                        ShoppingCartService.SetLoading(false);
                        AddIfItemExist();
                    });

                } else {
                    ShoppingCartService.GetProducts($scope.ProductFilter).then(function (results) {

                        $scope.products = results.data;
                        angular.forEach($scope.products, function (value, key) {
                            value.showGrid = (value.defaultView == 'GRID' && value.gridViewAvailable) ? true : false;

                            angular.forEach(value.items, function (v, k) {
                                v.quantity = 1; // Load quantity to be 1 by default.
                                v.vendorid = $scope.vendorid;
                                //v.resetValues = false;

                                if (v.IsFavouriteProduct) {
                                    $scope.favProducts.push(v);

                                }
                            })
                        });
                        ShoppingCartService.SetLoading(false);
                        AddIfItemExist();
                    });

                }
                

                
            }
        };

        // Open Sign-up Form
        $scope.OpenSignUpForm = function () {

            MSG({}); //Init

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                scope: $scope,
                templateUrl: 'Foodmandu_Signup',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });

        };

    	//ADD if user has already item selected. 
        function AddIfItemExist() {
        	var p_key = getParameterByName("_add");
        	if (p_key) {
        		var selectedProduct = [];

        		angular.forEach($scope.products, function (product) {

        			if (selectedProduct.length == 0) {
        				selectedProduct = $filter('filter')(product.items, function (d) { return d.productId === (p_key * 1) });
        			}
        		});
        		if (selectedProduct.length == 1) {

        			//$event.preventDefault(); $event.stopPropagation();

        			$scope.ShowAddUpdateItemDialog(selectedProduct[0]);

        			$scope.scrollToProduct(selectedProduct[0].productId);
        		}
        	}

        };

        //OPEN CART IN TOP CONTROLLER
        //$scope.OpenMyCart = function (e) {

        //	$rootScope.$emit("OpenCart", true);
        //	e.stopPropagation();
        //}


    	//Hide Window
        $scope.HideWindow = function (window) {
        	ShoppingCartService.HideWindow(window);

        };

        $scope.ShowHideWindow = function (window) {
        	ShoppingCartService.ShowHideWindow(window);
        };

        $scope.GetState = function (window) {
        	return ShoppingCartService.GetState(window);

        };

        //load cart in mobile view
        $scope.ShowCartMobil = function () {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                scope: $scope,
                templateUrl: 'CartMobile',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });
        }

    	// Scroll To Selected Product
        $scope.scrollToProduct = function (id) {

        	$timeout(function () {
        		$location.hash("Product" + id);
        		$anchorScroll();
        	});

        	$timeout(function () {
        		$location.hash("Product" + id);
        		$anchorScroll();
        	});

        
        };

        //Load Vendors Details
        $scope.LoadVendorDetails = function () { 
        	ShoppingCartService.GetVendorDetails($scope.vendorid).then(function (results) {
        	    $scope.vendorInfo = results.data[0];
        	    $scope.vendorInfo.showGrid = ($scope.vendorInfo.GridViewAvailable && $scope.vendorInfo.DefaultView == 'GRID') ? true : false;
        	   
                $scope.ImagePath = $scope.vendorInfo.ImagePath + '/' + $scope.vendorInfo.ImageName;
                $scope.LogoPath = $scope.vendorInfo.ImagePath + '/' + $scope.vendorInfo.LogoName;

                //Once the vendor details is loaded, load the product details;
                $scope.LoadMenusAndProductDetails(); // Load Details
            })
        };

        $scope.LoadVendorBranches = function () {
            ShoppingCartService.LoadVendorBranches($scope.vendorid).then(function (results) {
                $scope.vendorBranches = results.data.Branches;
               
            })

        }

       
    	// Get Sums once Delivery charege is in action
        $scope.GetSum = function (gt, deliverycharge) {

        	if (deliverycharge) {        		
        		return parseFloat(parseFloat(gt) + parseFloat(deliverycharge)).toFixed(2);
        	}
        	return gt;
        }

        // ./"VENDOR AND MENUS"

    	//map loader
        $scope.ShowMap = function () {
        	$timeout(function () {
        		$scope.renderMap = true;
        	}, 1000);
        }


        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

        // Functions 

    	//Show Vendor Close Info
        function ShowVendorCloseInfo() {
        	var modalOptions = {
        		closeButtonText: 'Close',
        		HideOK: true,
        		actionButtonText: 'OK',
        		headerText: 'Vendor Closed',
        		bodyText: $scope.vendorInfo.CloseNotice
        	};

        	modalService.showModal({}, modalOptions).then(function (result) {
        		return;
        	});
        }
        //Get Parameter by name
        function getParameterByName(name, url) {
            if (!url) {
                url = window.location.href;
            }
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        //Datepicker
        $scope.dateOptions = {
            'year-format': "'yy'",
            'show-weeks': false
        };
        
        //popup for show Estimate
        //show Estimate
        $scope.ShowDeliveryEstimate = function () {

            var modalInstance = $uibModal.open({
                templateUrl: 'ShowEstimateDel',
                size: '',
                keyboard: false,
                modalFade: true,
                scope: $scope

            });
        }

        //popup for show Small Order fee change
        $scope.ShowSmallOrderFee = function () {

            var modalInstance = $uibModal.open({
                templateUrl: 'ShowSmallOrderFee',
                size: '',
                keyboard: false,
                modalFade: true,
                scope: $scope

            });
        }


        $scope.ProductFilter = ShoppingCartService.GetEmptyFilter();
        $scope.ProductFilter.vendorid = $scope.vendorid;

     
        //$scope.LoadMenusAndProductDetails(); // Load Details
        $scope.LoadVendorDetails(); // Load Vendor Details
        $scope.LoadVendorBranches();

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        }
		 
    }]);
}());


//Modal controller
; (function () {
    'use strict';
    app.controller('ProductTopController', ['$scope', '$rootScope', '$uibModal', '$window', 'ShoppingCartService', '$uibModalStack', '$log', '$filter', '$timeout', function ($scope, $rootScope, $uibModal, $window, ShoppingCartService, $uibModalStack, $log, $filter, $timeout) {


        $scope.mode = "";
        $scope.locationloading = true;
        $scope.deliveryzonesddl = []; // delievery zones ddl;

        $scope.animationsEnabled = true;
        $scope.is_index = (typeof (is_index) == 'undefined' ? false : is_index);
        $scope.vendorid = (typeof (vendorId) == 'undefined' ? 0 : vendorId);
        $scope.fm_filter = { search_text: "", search_type: "restaurant", showMinlenErr: false, searchcity: "1" };




        $scope.ShowShoppingBag = false; //Init

        $scope.accordionArray = [];

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
            if ($scope.fm_filter.search_text.length >= 3) {
                $timeout(function () {
                    ShoppingCartService.GetAutoSuggestVendor($scope.fm_filter.search_text).then(function (results) {

                        $scope.suggests = results.data;
                        $scope.autoloading = false;

                    })
                }, 1500);
               
            }
             
            


        }
        $scope.ReadOnly = function () {
            return ShoppingCartService.ReadOnly();
        }

        $scope.CartItems = function () { //productService.GetCart();
            var isOpen = false;
            angular.forEach(ShoppingCartService.CartItems(), function (cart) {
                isOpen = false;
                if (typeof (ShoppingCartService.CartByVendor().Vendor) != 'undefined') {
                    if (ShoppingCartService.CartByVendor().Vendor.Name == cart.Vendor.Name)
                    { isOpen = true; }
                };
                $scope.accordionArray.push(isOpen);
            });

            return ShoppingCartService.CartItems();
        };

        $scope.cartloading = function () { return ShoppingCartService.CartLoading(); }// Loading Effects
        $scope.showEmpty = function () { return ShoppingCartService.ShowEmpty(); }

        //Load Cart By Vendor
        $scope.CartByVendor = function () { //productService.GetCart();
            return ShoppingCartService.CartByVendor();
        };

        //Check if User can Checkout for This Vendor or Not
        $scope.CanCheckOut = function (cart) {
            return ShoppingCartService.CanCheckOut(cart);
        };


        //Check Out If applicable
        $scope.CheckOutIfApplicable = function (cart, Id) {
            if (!$scope.CanCheckOut(cart)) {
                //me.showMinAmountDialog(MinimumOrder, reloadMenuPage);
                // PENDING
                // SHOW MESSAGE WINDOW 
            } else {
                $window.location.href = baseUrl + 'CheckOut/Index/' + Id;
            }
        };

        //Update Quantity
        $scope.UpdateQuantity = function (item, quantity, cart) {

            var shoppingCartItem = { ShoppingCartItemId: item.ShoppingCartItemId, ProductId: item.productId, Note: item.attributesXml, Quantity: item.quantity };
            //ShoppingCartService.SetLoading(true);
            ShoppingCartService.UpdateQuantity(shoppingCartItem, quantity, cart);
        };

        // Remove From Cart
        $scope.RemoveCartItem = function (ProductItem, cart) {
            if (typeof (ProductItem.ShoppingCartItemId) != 'undefined') {
                //var shoppingCartItem = { ShoppingCartItemId: ProductItem.ShoppingCartItemId, ProductId: ProductItem.productId, Note: ProductItem.attributesXml, Quantity: ProductItem.quantity };
                return ShoppingCartService.RemoveCartItem(ProductItem.ShoppingCartItemId, cart);

            }
            return false;
        };


        // get the total count for all items currently in the cart
        $scope.TotalCount = function () {
            var count = 0;
            angular.forEach($scope.CartItems(), function (cart) {
                count += cart.Items.length;
            });
            return count;
        };

        // Open Login Form
        $scope.OpenLoginForm = function () {

            MSG({}); //Init
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                scope: $scope,
                templateUrl: 'Foodmandu_Login',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: 'sm'
            });

        };

        // Open Sign-up Form
        $scope.OpenSignUpForm = function () {

            MSG({}); //Init

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                scope: $scope,
                templateUrl: 'Foodmandu_Signup',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });

        };

        //popup for show Estimate
        //show Estimate
        $scope.ShowDeliveryEstimate = function () {

            var modalInstance = $uibModal.open({
                templateUrl: 'ShowEstimateDel',
                size: '',
                keyboard: false,
                modalFade: true,
                scope: $scope

            });
        }

        //popup for show Small Order fee change
        $scope.ShowSmallOrderFee = function () {

            var modalInstance = $uibModal.open({
                templateUrl: 'ShowSmallOrderFee',
                size: '',
                keyboard: false,
                modalFade: true,
                scope: $scope

            });
        }

        //Populate DDLs
        var ddlFilter = {
            PageName: "Delivery Zones",
            FilterList: [
                {
                    DDLName: "DELIVERYZONES",
                    Param1: "",
                    Param2: "HIDE_DEFAULT"
                }
            ]
        };

        ShoppingCartService.GetDDLByFilter(ddlFilter).then(function (results) {
            $scope.ddLItems = angular.fromJson(results.data.DDLItems);

            $scope.deliveryzonesddl = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === "DELIVERYZONES" })[0].Items;

            $scope.mode = $filter('filter')($scope.deliveryzonesddl, function (d) { return d.Name === "Kathmandu" })[0];

            var cty = getParameterByName("cty");

            if (cty) {
                $scope.fm_filter.searchcity = cty;
            } else { $scope.fm_filter.searchcity = "1"; }


            $scope.locationloading = false;


        });


        $scope.SearchByVendor = function () {


            //var key = getParameterByName("k");
            //var searchquery = getParameterByName("q");
            var tags = getParameterByName("c");
            var myfav = getParameterByName("fav");
            var sortby = getParameterByName("sortby");

            var lat = getParameterByName("lat");
            var lng = getParameterByName("lng");
            var cty = getParameterByName("cty");

            //Create string url
            var url = baseUrl + "Restaurant/Index?";
            //Load Key
            url += "q=" + $scope.fm_filter.search_text;
            url += "&k=restaurant";
            url += "&cty=" + $scope.fm_filter.searchcity;


            //if (myfav) {
            //	url += "&fav="+myfav;
            //}

            //url += "&sortby=4"; // Always search by relevence

            //if (sortby) {
            //	url += "&sortby=" + sortby;
            //}
            //if (lat && lng) {
            //	url += "&lat=" + lat;
            //	url += "&lng=" + lng;
            //}

            //if (tags) {
            //	url += "&c=" + tags;
            //};

            //$window.location.href = baseUrl + 'Restaurant/Index?q=' + $scope.fm_filter.search_text + '&k=restaurant';
            $window.location.href = url;

        };

        $scope.SearchByFood = function () {
            if ($scope.fm_filter.search_text.length < 3) {
                $scope.fm_filter.showMinlenErr = true;
                return;
            }
            $window.location.href = baseUrl + 'Restaurant/Index?q=' + $scope.fm_filter.search_text + '&k=food';
        };

        $scope.SearchBy = function () {
            //switch ($scope.fm_filter.search_type) {
            //    case "food":
            //        $scope.SearchByFood();
            //        break;
            //    default:
            //        $scope.SearchByVendor();
            //}
            $scope.SearchByVendor();
        };

        //REGION "USER PROFILE"

        //Load User Full Profile
        $scope.profileParam = { UserId: 0, AddressId: 0 };
        $scope.LoadUserFullProfile = function () {
            ShoppingCartService.GetUserProfile($scope.profileParam).then(function (results) {
                $scope.UserProfile = results.data;
                $scope._address = {};
                if ($scope.UserProfile.Addresses.length > 0) {
                    var address = $filter('filter')($scope.UserProfile.Addresses, function (d) { return d.IsDefault === true });
                    if (address.length == 0) { $scope._address = $scope.UserProfile.Addresses[0]; } else { $scope._address = address[0]; }
                }

            });
        };


        // ./ "USER PROFILE"

        //Hide Window
        $scope.HideWindow = function (window) {
            ShoppingCartService.HideWindow(window);

        };

        $scope.ShowHideWindow = function (window) {
            ShoppingCartService.ShowHideWindow(window);
        };

        $scope.GetState = function (window) {
            return ShoppingCartService.GetState(window);

        };


        //calling function from another controller
        $rootScope.$on("OpenCart", function (event, showbag) {
            if (showbag) {
                $scope.ShowHideWindow("BAG");
            };
            event.stopPropagation();
        });

        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

        //Init
        var key = getParameterByName("k");
        var searchquery = getParameterByName("q");

        if (typeof (key) != 'undefined' && key != null) {
            if (key == "food") {
                $scope.fm_filter = { search_text: (typeof (searchquery) == 'undefined' ? '' : searchquery), search_type: "food" };
            }
            if (key == "restaurant") {
                $scope.fm_filter = { search_text: (typeof (searchquery) == 'undefined' ? '' : searchquery), search_type: "restaurant" };
            }
        };

        //Get Parameter by name
        function getParameterByName(name, url) {
            if (!url) {
                url = window.location.href;
            }
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }


        var _isauthenticated = false;

        if (typeof (IsAuthenticated) != 'undefined') {
            _isauthenticated = (IsAuthenticated == 'True') ? true : false;
        };

        if (_isauthenticated) {
            //Load User Profile INIT
            $scope.LoadUserFullProfile();

        }
        $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
        $scope.statesWithFlags = [{ 'name': 'Alabama', 'flag': '5/5c/Flag_of_Alabama.svg/45px-Flag_of_Alabama.svg.png' }, { 'name': 'Alaska', 'flag': 'e/e6/Flag_of_Alaska.svg/43px-Flag_of_Alaska.svg.png' }, { 'name': 'Arizona', 'flag': '9/9d/Flag_of_Arizona.svg/45px-Flag_of_Arizona.svg.png' }, { 'name': 'Arkansas', 'flag': '9/9d/Flag_of_Arkansas.svg/45px-Flag_of_Arkansas.svg.png' }, { 'name': 'California', 'flag': '0/01/Flag_of_California.svg/45px-Flag_of_California.svg.png' }, { 'name': 'Colorado', 'flag': '4/46/Flag_of_Colorado.svg/45px-Flag_of_Colorado.svg.png' }, { 'name': 'Connecticut', 'flag': '9/96/Flag_of_Connecticut.svg/39px-Flag_of_Connecticut.svg.png' }, { 'name': 'Delaware', 'flag': 'c/c6/Flag_of_Delaware.svg/45px-Flag_of_Delaware.svg.png' }, { 'name': 'Florida', 'flag': 'f/f7/Flag_of_Florida.svg/45px-Flag_of_Florida.svg.png' }, { 'name': 'Georgia', 'flag': '5/54/Flag_of_Georgia_%28U.S._state%29.svg/46px-Flag_of_Georgia_%28U.S._state%29.svg.png' }, { 'name': 'Hawaii', 'flag': 'e/ef/Flag_of_Hawaii.svg/46px-Flag_of_Hawaii.svg.png' }, { 'name': 'Idaho', 'flag': 'a/a4/Flag_of_Idaho.svg/38px-Flag_of_Idaho.svg.png' }, { 'name': 'Illinois', 'flag': '0/01/Flag_of_Illinois.svg/46px-Flag_of_Illinois.svg.png' }, { 'name': 'Indiana', 'flag': 'a/ac/Flag_of_Indiana.svg/45px-Flag_of_Indiana.svg.png' }, { 'name': 'Iowa', 'flag': 'a/aa/Flag_of_Iowa.svg/44px-Flag_of_Iowa.svg.png' }, { 'name': 'Kansas', 'flag': 'd/da/Flag_of_Kansas.svg/46px-Flag_of_Kansas.svg.png' }, { 'name': 'Kentucky', 'flag': '8/8d/Flag_of_Kentucky.svg/46px-Flag_of_Kentucky.svg.png' }, { 'name': 'Louisiana', 'flag': 'e/e0/Flag_of_Louisiana.svg/46px-Flag_of_Louisiana.svg.png' }, { 'name': 'Maine', 'flag': '3/35/Flag_of_Maine.svg/45px-Flag_of_Maine.svg.png' }, { 'name': 'Maryland', 'flag': 'a/a0/Flag_of_Maryland.svg/45px-Flag_of_Maryland.svg.png' }, { 'name': 'Massachusetts', 'flag': 'f/f2/Flag_of_Massachusetts.svg/46px-Flag_of_Massachusetts.svg.png' }, { 'name': 'Michigan', 'flag': 'b/b5/Flag_of_Michigan.svg/45px-Flag_of_Michigan.svg.png' }, { 'name': 'Minnesota', 'flag': 'b/b9/Flag_of_Minnesota.svg/46px-Flag_of_Minnesota.svg.png' }, { 'name': 'Mississippi', 'flag': '4/42/Flag_of_Mississippi.svg/45px-Flag_of_Mississippi.svg.png' }, { 'name': 'Missouri', 'flag': '5/5a/Flag_of_Missouri.svg/46px-Flag_of_Missouri.svg.png' }, { 'name': 'Montana', 'flag': 'c/cb/Flag_of_Montana.svg/45px-Flag_of_Montana.svg.png' }, { 'name': 'Nebraska', 'flag': '4/4d/Flag_of_Nebraska.svg/46px-Flag_of_Nebraska.svg.png' }, { 'name': 'Nevada', 'flag': 'f/f1/Flag_of_Nevada.svg/45px-Flag_of_Nevada.svg.png' }, { 'name': 'New Hampshire', 'flag': '2/28/Flag_of_New_Hampshire.svg/45px-Flag_of_New_Hampshire.svg.png' }, { 'name': 'New Jersey', 'flag': '9/92/Flag_of_New_Jersey.svg/45px-Flag_of_New_Jersey.svg.png' }, { 'name': 'New Mexico', 'flag': 'c/c3/Flag_of_New_Mexico.svg/45px-Flag_of_New_Mexico.svg.png' }, { 'name': 'New York', 'flag': '1/1a/Flag_of_New_York.svg/46px-Flag_of_New_York.svg.png' }, { 'name': 'North Carolina', 'flag': 'b/bb/Flag_of_North_Carolina.svg/45px-Flag_of_North_Carolina.svg.png' }, { 'name': 'North Dakota', 'flag': 'e/ee/Flag_of_North_Dakota.svg/38px-Flag_of_North_Dakota.svg.png' }, { 'name': 'Ohio', 'flag': '4/4c/Flag_of_Ohio.svg/46px-Flag_of_Ohio.svg.png' }, { 'name': 'Oklahoma', 'flag': '6/6e/Flag_of_Oklahoma.svg/45px-Flag_of_Oklahoma.svg.png' }, { 'name': 'Oregon', 'flag': 'b/b9/Flag_of_Oregon.svg/46px-Flag_of_Oregon.svg.png' }, { 'name': 'Pennsylvania', 'flag': 'f/f7/Flag_of_Pennsylvania.svg/45px-Flag_of_Pennsylvania.svg.png' }, { 'name': 'Rhode Island', 'flag': 'f/f3/Flag_of_Rhode_Island.svg/32px-Flag_of_Rhode_Island.svg.png' }, { 'name': 'South Carolina', 'flag': '6/69/Flag_of_South_Carolina.svg/45px-Flag_of_South_Carolina.svg.png' }, { 'name': 'South Dakota', 'flag': '1/1a/Flag_of_South_Dakota.svg/46px-Flag_of_South_Dakota.svg.png' }, { 'name': 'Tennessee', 'flag': '9/9e/Flag_of_Tennessee.svg/46px-Flag_of_Tennessee.svg.png' }, { 'name': 'Texas', 'flag': 'f/f7/Flag_of_Texas.svg/45px-Flag_of_Texas.svg.png' }, { 'name': 'Utah', 'flag': 'f/f6/Flag_of_Utah.svg/45px-Flag_of_Utah.svg.png' }, { 'name': 'Vermont', 'flag': '4/49/Flag_of_Vermont.svg/46px-Flag_of_Vermont.svg.png' }, { 'name': 'Virginia', 'flag': '4/47/Flag_of_Virginia.svg/44px-Flag_of_Virginia.svg.png' }, { 'name': 'Washington', 'flag': '5/54/Flag_of_Washington.svg/46px-Flag_of_Washington.svg.png' }, { 'name': 'West Virginia', 'flag': '2/22/Flag_of_West_Virginia.svg/46px-Flag_of_West_Virginia.svg.png' }, { 'name': 'Wisconsin', 'flag': '2/22/Flag_of_Wisconsin.svg/45px-Flag_of_Wisconsin.svg.png' }, { 'name': 'Wyoming', 'flag': 'b/bc/Flag_of_Wyoming.svg/43px-Flag_of_Wyoming.svg.png' }];


    }]);
}());


;app.directive('searchField', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {asyncselected: '='},
        compile: function (element, $scope) {
            // Typeahead
            var x = '<input type="text" \
                class="form-control" \
                placeholder="Search..." \
                ng-model="Ctrl.asyncSelected" \
                typeahead="s for s in Ctrl.suggestions" \
                typeahead-min-length="3" \
                typeahead-loading="loadingSuggestions" \
                typeahead-on-select="Ctrl.doSearch($item, $model, $label)" \
            />';
            element.append(x);

            // Little trick to have a working scroll on key press
            element.bind('keydown', function (evt) {
                if(evt.which===40){
                    $('ul.dropdown-menu')[0].scrollTop = ($('ul.dropdown-menu li.active').index() + 1) * 26;
                }
            });
            element.bind('keyup', function (evt) {
                if(evt.which===38){
                    $('ul.dropdown-menu')[0].scrollTop = ($('ul.dropdown-menu li.active').index()) * 26;
                }
            });
        }
    };
});