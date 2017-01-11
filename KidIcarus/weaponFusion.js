(function(){
	var app = angular.module("weapons", [ ]);

	app.controller("FusionController", ["$http", function($http) {
			this.chosenType = ["Choose a weapon type", "Choose a weapon type"];
			this.finalType = "";

			this.chosenWeapon = []
			this.finalWeaponNumber = -1;

			var tempThis = this;
			this.weaponTypes = [];
			this.weaponCombos = {};
			this.weaponNames = {};
			this.exceptions = {};

			$http.get("weaponFusion.json").success(function(data){
				tempThis.weaponTypes = data.weaponTypes;
				tempThis.weaponCombos = data.weaponCombos;
				tempThis.weaponNames = data.weaponNames;
				tempThis.exceptions = data.exceptions;
			});

			this.getCombined = function() {
				this.finalType = this.weaponCombos[this.chosenType[0]][this.chosenType[1]]
				return this.finalType;
			};

			this.addSelect = function(selectedWeapon, whichthOne) {
				this.chosenWeapon[whichthOne] = selectedWeapon;
				this.getfinalWeapon();
			};

			this.getfinalWeapon = function() {
				var w0 = this.getWeaponName(0);
				var w1 = this.getWeaponName(1);
				var w0HasExcept = this.exceptions[w0];

				if(w0HasExcept && w0HasExcept[w1]){
					//check for exceptions
					//the && is necessary because immediately going for w0HasExcept[w1] when w0HasExcept is undefined causes an error
					this.finalWeaponNumber = true;
				} else {
					this.finalWeaponNumber = (this.chosenWeapon[0] + this.chosenWeapon[1]) % 12;
				};
			};

			this.getWeaponName = function(num) {
				if(num === 2){
					var w0 = this.getWeaponName(0);
					var w1 = this.getWeaponName(1);
					var w0HasExcept = this.exceptions[w0];

					if(w0HasExcept && w0HasExcept[w1]){
						//check for exceptions
						//the && is necessary because immediately going for w0HasExcept[w1] when w0HasExcept is undefined causes an error
						return w0HasExcept[w1];
					} else {
						return this.weaponNames[this.finalType][this.finalWeaponNumber];
					}
				} else {
					var theType = this.chosenType[num];
					var theWeapon = this.chosenWeapon[num];
					return this.weaponNames[theType][theWeapon];
				}
			};
		}
	]);
})();