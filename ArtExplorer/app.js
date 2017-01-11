(function(){
	var app = angular.module("art", ["ui.bootstrap", "facets"]);
	var url = "http://mcd.ischool.drexel.edu/search/mcd_qe_api/search_artstor.cgi?image_size=0&query=";

	app.controller("theController", ["$http", "$scope", function($http, $scope) {
		$scope.showFacets = false;
		$scope.query = "";
		$scope.subQuery = {};
		$scope.facetList = facetList;
		$scope.searchesList = searchesList;
		$scope.facetSelect = [];
		$scope.results = [];
		$scope.currentPage = 0;
		$scope.pageSize = 20;

		var tempScope = $scope;

		$scope.randomExample = function() {
			$scope.query = examples[Math.floor(Math.random() * examples.length)];
		};

		$scope.selectAllFacets = function() {
			for(i=0; i<$scope.facetList.length; i++){
				$scope.facetSelect[i] = true;
			}
		};

		$scope.deselectAllFacets = function() {
			for(i=0; i<$scope.facetList.length; i++){
				$scope.facetSelect[i] = false;
			}
		};

		$scope.doSearch = function(search) {
			//first, clear out any remaining data
			$scope.currentPage = 0;
			$scope.results = null;
			$http.post(url + search).success(function(data){
				tempScope.results = data;
			});
		}

		$scope.returnResult = function(whichThing) {
			//whichThing: "numrows", "query", or "records"
			//if whichThing is "records", $scope returns an array of objects
			if (tempScope.results) {
				return tempScope.results[whichThing];
			} else {
				return null;
			}
		}

		$scope.returnRecord = function(num, whichThing) {
			//num: the 0th, 1st, etc. record in the array
			//whichThing: "Title", "url" (to image), "Material", "Score", "creator", "ID", or "subject"
			var recordList = tempScope.returnResult("records");
			return recordList[num][whichThing];
		}

		$scope.selectAllFacets();

		$scope.numberOfPages = function(){
			//return number of pages
       		return Math.max(Math.ceil($scope.returnResult("numrows")/$scope.pageSize), 0);                
    	}

    	$scope.changePage = function(num){
    		//change $scope.currentPage by num (pos or neg integer), as long as $scope page is valid
    		$scope.currentPage += num;
    		if ($scope.currentPage < 0){
    			$scope.currentPage = 0;
    		} else if ($scope.currentPage > $scope.numberOfPages() - 1){
    			$scope.currentPage = $scope.numberOfPages() - 1;
    		}
    	}
	}
	]);

	app.filter('startFrom', function() {
		return function(allItems, start) {
			if (allItems != undefined) {
				start = +start; //parse to int
				return allItems.slice(start);
			} else {
				return [];
			}
	    }
	});

	app.filter('largeImage', function() {
	    var urlPattern = /size[01]/;
	    return function(smallImage) {
	        return smallImage.replace(urlPattern, "size2");        
	    };
	});


	var examples = [
	"water color on cloth",
	"pencil or charcoal drawings by Picasso",
	"tempera on cardboard 19th century Germany",
	"color pencil on dark paper",
	"paint on brown paper",
	"oil paint on canvas",
	"white gouache green paper",
	"china clay",
	"chalk sticks watercolor paint"
	];

	var facetList = [
		"Materials",
		"Associated Concepts",
		"Physical Attributes",
		"Styles and Periods",
		"Agents",
		"Activities",
		"Objects",
		"Brand Names"
	];

	var searchesList = [
		"Material",
		"Location",
		"Artist"
	]

})();
