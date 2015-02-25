// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

angular.module('starter', ['ionic', 'starter.services'])

.controller('MehCtrl',['$scope', '$http', '$q', 'mehPrep', '$ionicSlideBoxDelegate', '$ionicModal', '$ionicLoading',
function($scope, $http, $q, mehPrep, $ionicSlideBoxDelegate, $ionicModal, $ionicLoading){
	$scope.hideSBLoader = function() {
		document.querySelector("#sbLoad").style.display = "none";
	};
	
	$scope.showLoad = function() {
		$ionicLoading.show({
			template : 'Loading...'
		});
		document.querySelector('ion-pane').style.display = "none";
	};
	$scope.hideLoad = function() {
		$ionicLoading.hide();
		document.querySelector('ion-pane').style.display = "initial";
	}; 

	$scope.showLoad();
	
	$scope.isCollapsed = true;
		
	function renderMeh(mehJson){
		console.log(mehJson);
		
		function newCss (rule) {
			window.document.styleSheets[1].insertRule(rule,0);
		}
		
		$scope.picUrls = mehJson.deal.photos;
		console.log($scope.picUrls);
		var picArray = [];
		$scope.pics = [];
		
		for(i = 0; i<$scope.picUrls.length; i++){
			console.log("replacing "+$scope.picUrls[i]);
			picArray[i] = mehPrep.fetchImage($scope.picUrls[i]);
			console.log(picArray);
			
			// .then(function(dataUri){
				// console.log("Replacing image");
				// console.log(dataUri);
				// picArray[i] = dataUri;
			// });
		}
		
		$q.all(picArray).then(function (imgArray) {
			$scope.pics = imgArray;
			$ionicSlideBoxDelegate.update();
			$scope.hideSBLoader();
			console.log(imgArray);
		});
		
		
		heroBg = mehJson.deal.theme.backgroundImage;
		if(heroBg){
			document.body.querySelector("#hero-bg").style.backgroundImage = 'url('+heroBg+')';
		}
		
		accentColor = mehJson.deal.theme.accentColor;
		bgColor = mehJson.deal.theme.backgroundColor;
		
		document.body.querySelector(".pane").style.backgroundColor = bgColor;
		
		// change the text between white and black		
		if(mehJson.deal.theme.foreground == 'light'){
			newCss('#writeUp,#writeUp a,#price-check,#bottom-wrap li,#bottom-wrap h2,#pull-me a {color:#FFF;}');
		} else {
			if(mehPrep.colorDark(accentColor)){
				document.querySelector('#header').className += ' light';
			}
		}
		//change accent color
		document.querySelector('#header').style.backgroundColor = accentColor;
		document.querySelector('#full-specs').style.color = bgColor;
		document.querySelector('#full-specs').style.backgroundColor = accentColor;
		// document.querySelector('#pull-me').style.borderColor = accentColor;
		
		newCss('.story h1 {color:'+ accentColor +'}');
		newCss('.meh-button.meh {background-color:'+ accentColor +'}');
		newCss('.meh-button.meh {color:'+ bgColor +'}');
		
		document.querySelector("#product-specs").innerHTML = '<h2>'+ mehJson.deal.title +'</h2>';
		featureArray = mehJson.deal.features.slice(2).split("\n- ");
		featureArray[featureArray.length -1] += 'B';
		specs = '<ul>';
		for(i=0;i<featureArray.length;i++){
			specs += '<li>'+ featureArray[i].slice(0,-1) +'</li>';
		}
		specs += '</ul>';
		
		document.querySelector("#product-specs").innerHTML += specs;
		
		document.querySelector("#writeUp").innerHTML = '<h2>'+ mehJson.deal.story.title +'</h2>';
		storyHTML = mehPrep.procStory(mehJson.deal.story.body);
		document.querySelector("#writeUp").innerHTML += storyHTML;
		
		//pick which button to render
		if(!mehJson.deal.soldOutAt){
			document.querySelector('.meh-button.sold-out').style.display = 'none';
			newCss('.meh-button.buy {background-color:'+ accentColor +'}');
			newCss('.meh-button.buy {color:'+ bgColor +'}');
		} else {
			document.querySelector('.meh-button.buy').style.display = 'none';
		}
		// $scope.priceCheck = mehObj.priceCheck;
		$scope.price = mehJson.deal.items[0].price;
		$scope.fullSpec = mehJson.deal.specifications;
	}

	mehPrep.fetchMehApi().then(function (mehJson) {
		if(mehJson.deal){
			renderMeh(mehJson);
			$scope.hideLoad();
		} else {
			mehPrep.fetchMehApi().then(function (mehJson) {
				console.log("Missing deal");
				renderMeh(mehJson);
				$scope.hideLoad();
			});
		}
	});
	
	$scope.test = "This is a mediocre test statement.";
	
	//slidebox
	$scope.updateSlider = function () {
	 	$ionicSlideBoxDelegate.update();
	};
	
	// Modal code
	$ionicModal.fromTemplateUrl('specsModal.html', {
		scope : $scope,
		animation : 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	$scope.openModal = function() {
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};
	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});
	// Execute action on hide modal
	$scope.$on('modal.hidden', function() {
		// Execute action
	});
	// Execute action on remove modal
	$scope.$on('modal.removed', function() {
		// Execute action
	}); 
}])

.directive('meh',function () {
	return{
		restrict: 'E',
		templateUrl: 'partials/mehApp.html'
	};
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
