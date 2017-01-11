angular.module('plunker', ['ui.bootstrap']);
function CarouselDemoCtrl($scope, $http) {
  $scope.myInterval = 5000;

  function getSlides($scope, $http) {
       var slides = [];
        $http({
              url: 'http://mcd.ischool.drexel.edu/dlin/getName.cgi',
              method: "GET"
          }).success(function (data) {
                  slides = data.characters;
                  $scope.slides = slides;
                  getStats(1, $scope, $http);
              }).error(function (data) {
                  console.log(status);
              });

  };

  var slides = $scope.slides = getSlides($scope, $http);
  this.parseInt = parseInt;

  function getStats(id, $scope, $http) {
    $scope.id = id;
    $http({
              url: 'http://mcd.ischool.drexel.edu/dlin/getStats.cgi?id=' + id,
              method: "GET"
          }).success(function (data) {
                  $scope.stats = data;
              }).error(function (data) {
                  console.log(status);
              });
    $http({
              url: 'http://mcd.ischool.drexel.edu/dlin/getGrowths.cgi?id=' + id,
              method: "GET"
          }).success(function (data) {
                  $scope.growths = data;
              }).error(function (data) {
                  console.log(status);
              });
    getClasses(id, $scope, $http);
    getClass($scope.slides[id-1].class, $scope, $http);
  };

  function getClasses(id, $scope, $http) {
    $scope.id = id;
    $http({
              url: 'http://mcd.ischool.drexel.edu/dlin/getClasses.cgi?id=' + id,
              method: "GET"
          }).success(function (data) {
                  $scope.classList = data.classes;
              }).error(function (data) {
                  console.log(status);
              });
  };

  $scope.getStats = function(id) {
    getStats($scope.checkID(id), $scope, $http);
  }

  $scope.checkID = function checkID(id) {
    id = parseInt(id)%49;
    if(id==0) {
      id = 49;
    }
    return id;
  }

  $scope.checkIDIndex = function checkIDIndex(id) {
    id = parseInt(id)%49;
    if(id<0) {
      id += 49;
    }
    return id;
  }


  function getClass(id, $scope, $http) {
    $http({
              url: 'http://mcd.ischool.drexel.edu/dlin/getClassStats.cgi?name=' + id,
              method: "GET"
          }).success(function (data) {
                  $scope.classStats = data;
              }).error(function (data) {
                  console.log(status);
              });
    $http({
              url: 'http://mcd.ischool.drexel.edu/dlin/getClassGrowths.cgi?name=' + id,
              method: "GET"
          }).success(function (data) {
                  $scope.classGrowths = data;
              }).error(function (data) {
                  console.log(status);
              });
  };

  $scope.getClass = function(id) {
    getClass(id, $scope, $http);
  }

  $scope.add = function(p, q) {
    sum = parseInt(p) + parseInt(q);
    if (!isNaN(sum)) {
      return sum;
    } else {
      return;
    }
  }
}