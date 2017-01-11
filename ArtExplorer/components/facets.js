var app1 = angular.module('facets', []);

var url1="http://mcd.ischool.drexel.edu:8080/MCD3/SearchGroupedConcepts?q="    //source vocabulary API
var url2="http://mcd.ischool.drexel.edu/search/mcd_qe_api/api.cgi?mode=qe&cids="  //target vocabulary API

app1.directive('ngFacet', function() {
  return {
    restrict: 'AE',
    // transclude: true,
    link: function(scope, elem, attrs, $http) {
    
		elem.bind('click', function() {
        	elem.css('background-color', 'white');
        	scope.$apply(function() {
          		scope.color = "white";
        	});
      	});

      	elem.bind('mouseover', function() {
        	elem.css('cursor', 'pointer');
      	});
 
		elem.bind('keyup keydown', function() {
  			
		});
    },
    templateUrl: 'components/facetPanel.html'
  };
});

app1.controller("componController", ['$scope', '$http', function($scope, $http) {
    $scope.query="";
    $scope.concepts=[];
    $scope.targets=[];
    $scope.conceptSelected=-1;
    $scope.listSelected=[];

    var termList = [];
    

   $scope.selectAllFacets = function() {
      for(i=0; i<$scope.listSelected.length; i++){
         $scope.listSelected[i] = true;
      }
    };

  $scope.deselectAllFacets = function() {
      for(i=0; i<$scope.listSelected.length; i++){
         $scope.listSelected[i] = false;
      }
    };

  $scope.getSourceTerm = function(query) {
    $http.get(url1 + query).success(function(data){
        termList= data;
        for (i=0; i<termList.length; i++){
          if(termList[i].facetID=="30535"){
            $scope.concepts=termList[i].concepts;
            break;
          }
        }

        // alert("success: Number of concepts found: "+ $scope.concepts.length);
      }).error(function(data, status ) {
        alert("err "+ status);
      });
    }
 
   $scope.getTargetTerm = function(sourceTermID) {
        $http.get(url2 + sourceTermID).success(function(data){
          if (parseInt(data.numrows) > 0) {
            termList= data.records;
            $scope.targets=termList;
            $scope.listSelected=[];
            for (i=0; i<termList.length; i++){
              $scope.listSelected[i]=false;
            }
          }else{
            $scope.targets=[];
          }

         // alert("success: Number of target matched: "+ termList.length);
      }).error(function(data, status ) {
        alert("err "+ status);
      });
    }

    $scope.addSelected =function(index, cid) {
      $scope.conceptSelected=index;
      $scope.getTargetTerm(cid);
    }

    $scope.getQuery= function(){
      var queries=[];
      var k=0;
      for (i=0; i<$scope.listSelected.length; i++){
        if($scope.listSelected[i]){
          queries[k]=$scope.targets[i].artstor_string;
          k++;
        }
      }
      var query=""; 
      if (k>0){
        query=queries[0];
        for (i=1; i<k; i++){
          query+="|"+queries[i];
        }
      }
      // alert("query="+query);
      $scope.doSearch(query);
    }

  }]);



