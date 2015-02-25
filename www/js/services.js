angular.module('starter.services', [])
/*
 * This will be where we will fetch and scrape the meh html
 */
.factory('mehPrep', ['$http', '$q',
function($http, $q) {
	var mehData;

	var mehPrep = {};
	
	// retrieve the raw meh html
	/*mehPrep.fetchMeh = function() {
		var promise = $http.get('https://meh.com').then(function(response) {
			console.log("Query Successful");
			return response.data;
		});
		return promise;
	}; */
	
	mehPrep.fetchMehApi = function () {
		var promise = $http.get('https://api.meh.com/1/current.json?apikey=F1dpHrK7iYRPzRgq0KgpF4NhhsMddQhl').then(function (response) {
			console.log("Api Query Successful");
			return response.data;
	  	});
	  	return promise;
	};
	
	mehPrep.procStory = function (story) {
		//sick regexes bro
		//  /\[([^\[\]]*)\]\(([^\(\)]*)\)/g finds links
		//  /!\[[^\[\]]*\]\[([\d]+)\]/g finds images
		// /\*([^\*]*)\*/g italics
		story = story.split("\r\n\r\n\r\n");
		text = story[0];
		images = story[1];
		
		linkExp = /\[([^\[\]]*)\]\(([^\(\)]*)\)/g;
		imageExp = /!\[[^\[\]]*\]\[([\d]+)\]/g;
		boldExp =  /\*\*([^\*]*)\*\*/g;
		italicExp = /\*([^\*]*)\*/g;
		
		function linkReplacer(match,p1,p2){
			return '<a href="'+ p2 +'">'+ p1 +'</a>';
		}
		
		function imageReplacer(match,p1){
			//more regex coming in hot!!
			imgExp = /\[\d*\]: ([^\[\]\n\r]*)/g;
			hLink = imgExp.exec(images)[1];
			return '<img href="'+ hLink +'">';
		}
		
		function boldReplacer(match,p1) {
		  	return '<b>' + p1 + '</b>';
		}
		
		function italicReplacer(match,p1) {
			return '<em>' + p1 + '</em>';
		}
		
		text = text.replace(linkExp,linkReplacer);
		text = text.replace(imageExp,imageReplacer);
		text = text.replace(boldExp,boldReplacer);
		text = text.replace(italicExp,italicReplacer);
		
		storyArray = text.split("\r\n\r\n");
		almostDone = storyArray.join("</p><p>");
		storyHTML = "<p>" + almostDone + "</p>";
		
		return storyHTML;
	};
	
	mehPrep.colorDark = function(color) {
		var r,g,b;
		
		color = color.substr(1,7);
		r = parseInt(color.substr(0,2),16);
		g = parseInt(color.substr(2,4),16);
		b = parseInt(color.substr(4,6),16);
		
		if(((r*299+g*587+b*114)/1000)<128){
			return true;
		} else {
			return false;
		}
	};
	/*
	 * var resizeImage = function (imgSrc, cb) {
    var image = new Image();
    image.src = imgSrc;
    image.onload = function(){
      var canvas = document.createElement("canvas");
      canvas.height = 300;
      canvas.width = 300;

      var ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, 300, 300);
      cb(null, canvas.toDataURL("image/jpeg"));      
    }

};

var xhr = new XMLHttpRequest();

xhr.responseType = 'blob';
xhr.onload = function(){
  var url = URL.createObjectURL(xhr.response);
  image = new Image();
  resizeImage(url, function(err, datauri){
    image.src = datauri;  
    document.body.appendChild(image);
  });

};
xhr.open('get', "https://res.cloudinary.com/mediocre/image/upload/v1419372119/wy5fubv8kzs5r8vma2yz.png");
xhr.send();
	 */
		
		
	mehPrep.resizeImage = function(imgSrc) {
		var deferred = $q.defer();
		// console.log(imgSrc);
		// console.log("resizing image");
		var image = new Image();
		image.src = imgSrc;
		image.onload = function() {
			var canvas = document.createElement("canvas");
			canvas.height = 300;
			canvas.width = 300;
			
			var ctx = canvas.getContext("2d");
			ctx.drawImage(image,0,0,300,300);
			deferred.resolve(canvas.toDataURL("image/png"));
		};
		
		return deferred.promise;
	};
	
	mehPrep.fetchImage = function(src){
		var deferred = $q.defer();
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'blob';
		
		xhr.onload = function() {
			var url = URL.createObjectURL(xhr.response);
			image = new Image();
			mehPrep.resizeImage(url)
			.then(function(dataUri) {
				deferred.resolve(dataUri);
			});
		};
		
		xhr.open('get', src);
		xhr.send();
		
		return deferred.promise;
	};
	//process the raw html string 
	
/*	mehPrep.procMeh = function(mehHtml) {
		var mehObj = {};
		var parser = new DOMParser();
		var mehDoc = parser.parseFromString(mehHtml, 'text/html');

		//scrape all the picture URLs including the clicked meh button
		var pics = mehDoc.querySelector(".photos");

		var numPics = pics.children.length;
		var picArray = [];
		var n;
		for ( n = 0; n < numPics; n++) {
			picArray.push(pics.children[n]);
			picArray[n] = picArray[n].getAttribute("data-src");
		}
		mehObj.pictures = picArray;

		var clickedMeh = mehDoc.querySelector(".back").children[0].getAttribute("src");
		mehObj.clickedPic = clickedMeh;

		var styles = mehDoc.querySelector("style").innerHTML;
		//	get the button and background colors
		var clrStyle = styles.slice(10,120);
		var pattern = /#[^;]*;/g;
		
		// Don't forget the hero background! <3 regexp
		var heroLoc = styles.search("#hero-background");
		var heroStyle = styles.slice(heroLoc,heroLoc+160);
		var heroPattern = /\([^()]+\)/g;
		var heroUrl = heroPattern.exec(heroStyle);
		if(!heroUrl){
			var heroUrl = heroPattern.exec(heroStyle);
		}
		
		mehObj.btnColor = pattern.exec(clrStyle)[0].slice(0,-1);
		mehObj.bgColor = pattern.exec(clrStyle)[0].slice(0,-1);
		if(heroUrl){
			mehObj.heroBg = heroUrl[0].slice(1,-1);
		}

		//	get the text information and some DOMS
		mehObj.price = mehDoc.querySelector(".buy-button").childNodes[0].textContent.trim();
		mehObj.priceCheck = mehDoc.querySelector("#price-check").children[0].innerHTML;
		mehObj.name = mehDoc.querySelector(".features").children[0].innerHTML.trim();
		mehObj.featureList = mehDoc.querySelector(".features").children[1];
		mehObj.writeUp = mehDoc.querySelector(".story");
		mehObj.video = mehDoc.querySelector(".youtube").getAttribute("src").slice(2);
		mehObj.forum = mehDoc.querySelector("#forum").children[0];
		mehObj.vote = mehDoc.querySelector(".poll");

		return mehObj;
}; */

	return mehPrep;
}]); 