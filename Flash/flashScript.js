var myModule = angular.module("flashApp", []);

myModule.controller('Ctrl', function ($scope){
	$scope.projects = ["Pythagoras Tree", "L" + decodeURI('%C3%A9') + "vy C Curve", "Pok" + decodeURI('%C3%A9') + "mon Battle Bingo", "Boomerang Game", "Pendulum"];
	$scope.projectURL = ["PythagorasFractal.swf", "LevyCCurve.swf", "BattleBingo.swf", "boomerang game-1.swf", "pendulum.swf"];
	$scope.projectheight = ["420", "420", "400", "400", "400"];
	$scope.projectwidth = ["620", "620", "650", "650", "550"];
	$scope.projectblurb = ["A fractal: click for further iterations (stops after twelve iterations)",
		"A fractal: click for further iterations (stops after twelve iterations)",
		"Originally a minigame in Pok" + decodeURI('%C3%A9') + "mon XD: Gale of Darkness. " + 
			"Under each panel on the right is a Pok" + decodeURI('%C3%A9') + "mon of the appropriate type; " + 
			"choose your own Pok" + decodeURI('%C3%A9') + "mon on the left to battle it. You also start with two Master Balls, " + 
			"which can catch the Pok" + decodeURI('%C3%A9') + "mon you are battling. " +
			"Each Pok" + decodeURI('%C3%A9') + "mon has a certain number of \"EP's,\" " +
			"which are used up each time the Pok" + decodeURI('%C3%A9') + "mon flips over a tile. "+
			"You gain extra EP's when a full row, column, or diagonal is completed. " +
			"Panels maked with \"???\" contain either extra EP's or a third Master Ball. "+
			"Win by flipping over all tiles; lose by running out of EP's.",
		"A small game: click the mouse anywhere to release the boomerang. Try to hit all four targets!",
		"A simulation of an ideal pendulum, with air resistance. Click on the screen to restart the pendulum from that angle."];


	//initial data is the first project
	$scope.data = {project: $scope.projects[0], url:$scope.projectURL[0], h:$scope.projectheight[0], w:$scope.projectwidth[0], blurb:$scope.projectblurb[0]};

	$scope.changeProject = function(projectName){
		for(var i = 0; i<$scope.projects.length; i++){
			if(projectName == $scope.projects[i]){
				$scope.data = {project: $scope.projects[i], url:$scope.projectURL[i], h:$scope.projectheight[i], w:$scope.projectwidth[i], blurb:$scope.projectblurb[i]};
			}
		}
	}
})

myModule.directive('ngData', function () {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			//when the ng-data tag changes, update the actual data tag
			scope.$watch(
				function() {
					//when the ng-data tag changes
					return attrs.ngData;
				},
				function() {
        			element.prop('data', attrs.ngData);
				}
			);
		}
	};
});