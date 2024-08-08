; function MSG(O) {
	var $elm = $('.alert-rolpo').first();
	if (O != undefined) {
		if ($('#' + O.elm).length == 1) {
			$elm = $('#' + O.elm);
		}
	} else { O = {}; }

	//Types of MSG functions

	//MSG({ 'MsgType': 'OK', 'MsgText': 'Hell everything is right!'});
	//MSG({ 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating staff!'});
	//MSG({ 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating staff!', 'MsgAsModel': error.data });
	//MSG({'elm':'div-id', 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating staff!', 'MsgAsModel': error.data });

	$('.alert-rolpo').removeClass('global-msg--success global-msg--error').hide();
	if (O.MsgType != '' && O.MsgType != undefined) {

		var css = (O.MsgType == 'ERROR') ? 'global-msg--error' : 'global-msg--success';
		O.MsgType = (O.MsgType == 'ERROR') ? '<b>ERROR : </b>' : '<b>SUCCESS : </b>';

		var html = '<span class="icomoon icomoon--white icon-close float-right mt-1" aria-hidden=\'true\'></span>';
		
		
		//var html = '<button type=\'button\' class=\'close\' aria-hidden=\'true\'>x</button>';
		//html += '<h4>' + O.MsgType + '!</h4>';

		var listItm = '';

		if (O.MsgAsModel != null && O.MsgAsModel != undefined) {
			html += '<span>' + O.MsgType + '</span>';
			html += '<b>' + O.MsgAsModel.Message + '</b><br/>';
			for (var key in O.MsgAsModel.ModelState) {
				for (var i = 0; i < O.MsgAsModel.ModelState[key].length; i++) {
					listItm += '<li class=\'error\'>' + O.MsgAsModel.ModelState[key][i] + '</li>';
					//errors.push(response.ModelState[key][i]);
				}
			}
			listItm = '<ul>' + listItm + '</ul>';
		} else {
			//listItm = '<ul><li class=\'error\'>' + O.MsgText + '</li></ul>'; 
			listItm = '<span>' + O.MsgText + '</span>';
		}
		html += listItm;
		html = '<div class="container"><div class="row"> <div class="col-12">' +
						html + '</div></div></div>';

		$elm.empty().append(html).addClass(css).show();
		$elm.find('.icomoon--white').click(function () {
			$elm.hide();
			return false;
		});
	}
}

; function MSG1(O) {
    var $elm = $('.alert-fm').first();
    if (O != undefined) {
        if ($('#' + O.elm).length == 1) {
            $elm = $('#' + O.elm);
        }
    } else { O = {}; }

    //Types of MSG functions

    //MSG({ 'MsgType': 'OK', 'MsgText': 'Hell everything is right!'});
    //MSG({ 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating staff!'});
    //MSG({ 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating staff!', 'MsgAsModel': error.data });
    //MSG({'elm':'div-id', 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating staff!', 'MsgAsModel': error.data });

    $('.alert').removeClass('alert-success alert-error').hide();
    if (O.MsgType != '' && O.MsgType != undefined) {

        var css = (O.MsgType == 'ERROR') ? 'alert-error' : 'alert-success';
        O.MsgType = (O.MsgType == 'ERROR') ? '<b>ERROR</b> ' : 'Success';

        var html = '<button type=\'button\' class=\'close\' aria-hidden=\'true\'>x</button>';
        html += '<h4>' + O.MsgType + '!</h4>';

        var listItm = '';

        if (O.MsgAsModel != null && O.MsgAsModel != undefined) {

            html += '<b>' + O.MsgAsModel.Message + '</b><br/>';
            for (var key in O.MsgAsModel.ModelState) {
                for (var i = 0; i < O.MsgAsModel.ModelState[key].length; i++) {
                    listItm += '<li class=\'error\'>' + O.MsgAsModel.ModelState[key][i] + '</li>';
                    //errors.push(response.ModelState[key][i]);
                }
            }
            listItm = '<ul>' + listItm + '</ul>';
        } else { listItm = '<ul><li class=\'error\'>' + O.MsgText + '</li></ul>'; }
        html += listItm;
        $elm.empty().append(html).addClass(css).show();
        $elm.find('button').click(function () {
            $elm.hide();
            return false;
        });
        $('html, body').animate({ scrollTop: $elm.offset().top }, 'slow');
    }
}

//Logout User
function Logout() {
	document.getElementById('logoutForm').submit();
};


var app = angular.module('foodmandu_app', ['ngSanitize', 'angular-sticky-box', 'ui.bootstrap', 'ui.bootstrap.modal', 'ngAnimate']);


app.directive('setClassWhenAtTop', ['$window', function ($window) {
	var $win = angular.element($window); // wrap window object as jQuery object
	var $fixedCart = $('.cart.cart--fixed');
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var topClass = attrs.setClassWhenAtTop, // get CSS class from directive's attribute value
                topPadding = parseInt(attrs.paddingWhenAtTop, 10),
                offsetTop = element.prop('offsetTop'); // get element's offset top relative to document

			$win.on('scroll', function (e) {
				if ($window.pageYOffset + topPadding >= offsetTop) {
					element.addClass(topClass);
					$fixedCart.removeClass('display-none').addClass('display-show');
				} else {
					element.removeClass(topClass);
					$fixedCart.removeClass('display-show').addClass('display-none');
				}
			});
		}
	};
}]);

app.service('modalService', ['$uibModal',

		function ($uibModal) {
			var modalDefaults = {
				backdrop: true,
				keyboard: true,
				modalFade: true,
				size: 'sm',
				templateUrl: 'customModalPopup'
			};

			var modalOptions = {
				closeButtonText: 'Close',
				actionButtonText: 'OK',
				headerText: 'Proceed?',
				bodyText: 'Perform this action?'
			};

			this.showModal = function (customModalDefaults, customModalOptions) {
				if (!customModalDefaults) customModalDefaults = {};
				customModalDefaults.backdrop = 'static';
				return this.show(customModalDefaults, customModalOptions);
			};

			this.show = function (customModalDefaults, customModalOptions) {
				//Create temp objects to work with since we're in a singleton service
				var tempModalDefaults = {};
				var tempModalOptions = {};

				//Map angular-ui modal custom defaults to modal defaults defined in service
				angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

				//Map modal.html $scope custom properties to defaults defined in service
				angular.extend(tempModalOptions, modalOptions, customModalOptions);

				if (!tempModalDefaults.controller) {
					tempModalDefaults.controller = function ($scope, $uibModalInstance) {
						$scope.modalOptions = tempModalOptions;
						$scope.modalOptions.ok = function (result) {
							$uibModalInstance.close(result);
						};
						$scope.modalOptions.close = function (result) {
							$uibModalInstance.dismiss('cancel');
						};
					}
				}

				return $uibModal.open(tempModalDefaults).result;
			};

		}]);


app.directive('ngEnter', function () {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function (event) {
			if (event.which === 13) {
				scope.$apply(function () {
					scope.$eval(attrs.ngEnter, { 'event': event });
				});

				event.preventDefault();
			}
		});
	};
});

app.config(['$qProvider', function ($qProvider) {
	$qProvider.errorOnUnhandledRejections(false);
}]);


app.directive('hideLogin', function ($document) {
	return {
		restrict: 'A',
		link: function (scope, elem, attr, ctrl) {
			elem.bind('click', function (e) {
				e.stopPropagation();
			});
			$document.bind('click', function () {
				scope.$apply(attr.hideLogin);
			})
		}
	}
});


(function () {
	'use strict';

	app.filter('utcToLocal', Filter);

	function Filter($filter) {
		return function (utcDateString, format) {
			// return if input date is null or undefined
			if (!utcDateString) {
				return;
			}

			// append 'Z' to the date string to indicate UTC time if the timezone isn't already specified
			if (utcDateString.indexOf('Z') === -1 && utcDateString.indexOf('+') === -1) {
				utcDateString += 'Z';
			}

			// convert and format date using the built in angularjs date filter
			return $filter('date')(utcDateString, format);
		};
	}

})();


// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

app.controller('ModalInstanceCtrl', function ($uibModalInstance, items) {
  var $ctrl = this;
  $ctrl.items = items;
  $ctrl.selected = {
    item: $ctrl.items[0]
  };

  $ctrl.ok = function () {
    $uibModalInstance.close($ctrl.selected.item);
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

// Please note that the close and dismiss bindings are from $uibModalInstance.

app.component('modalComponent', {
  templateUrl: 'myModalContent.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function () {
    var $ctrl = this;

    $ctrl.$onInit = function () {
      $ctrl.items = $ctrl.resolve.items;
      $ctrl.selected = {
        item: $ctrl.items[0]
      };
    };

    $ctrl.ok = function () {
      $ctrl.close({$value: $ctrl.selected.item});
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});




// **********



app.controller('AccordionCtrl', function ($scope) {
  $scope.oneAtATime = true;
  $scope.items = ['Item 1', 'Item 2', 'Item 3'];

  $scope.addItem = function() {
    var newItemNo = $scope.items.length + 1;
    $scope.items.push('Item ' + newItemNo);
  };

  $scope.status = {
    isCustomHeaderOpen: false,
    isFirstOpen: true,
    isFirstDisabled: false
  };
});

function showHide(trigger, dropdown) {
  $(trigger).click(function() {
    if($(dropdown).hasClass('display-none')) {
      $(dropdown).removeClass('display-none');
      $(dropdown).addClass('display-show');
    }
    else {
      $(dropdown).removeClass('display-show');
      $(dropdown).addClass('display-none');
    }
  });
}

function filterDropdown(trigger) {
  $(trigger).click(function(){
    $(this).addClass('active').next().addClass('display-show').removeClass('display-none');
  });
}

function convertDataScrImage(elementClass) {
	$(elementClass).each(function () {
		var attr = $(this).attr('data-image-src');

		if (typeof attr !== typeof undefined && attr !== false) {
			$(this).css('background-image', 'url(' + attr + ')');
		}
	});
}

$(document).ready(function(){
	showHide('.list-inline-item span.icon-search', '.header__search-dropdown');
	//convertDataScrImage(".listing__photo > a");
	//convertDataScrImage(".food-pic");
  //showHide('.list-inline-item span.icon-notifications', '.header__right-dropdown.notifications');
  //showHide('.list-inline-item span.icon-profile', '.header__right-dropdown.profile');
  //showHide('.list-inline-item span.icon-shopping-bag', '.header__right-dropdown.cart');

  //$('.close-overlay').click(function(){
  //  $(this).closest('.header__right-dropdown').removeClass('display-show').addClass('display-none');
  //});

  if($('.menu__nav').hasClass('fixed-top')) {
    $('.cart.cart--fixed').removeClass('display-none').addClass('display-show');
  } else {
    $('.cart.cart--fixed').removeClass('display-show').addClass('display-none');
  }

  filterDropdown('.filter__cuisine');
  filterDropdown('.filter__location');
  filterDropdown('.filter__others');

  $(document).mouseup(function(e) 
  {
      var container = $(".filter__dropdown");

      if(container.hasClass('display-show')) {
        if (!container.is(e.target) && container.has(e.target).length === 0) {
          $('.filter__item button.active').removeClass('active');
          $(container).removeClass('display-show').addClass('display-none');
        }
      }
  });

});

// ===== Scroll to Top ==== 
$(window).scroll(function () {
	if ($(this).scrollTop() >= $(this).height() / 2) {
		$('#return-to-top').fadeIn(200);    // Fade in the arrow
	} else {
		$('#return-to-top').fadeOut(200);   // Else fade out the arrow
	}
});
$('#return-to-top').click(function () {      // When arrow is clicked
	$('body,html').animate({
		scrollTop: 0                       // Scroll to top of body
	}, 500);
});