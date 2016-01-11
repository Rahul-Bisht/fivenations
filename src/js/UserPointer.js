define('UserPointer', ['Util'], function(Util){
	
	var singleton,
		phaser_game,
		dispatcher,
		multiselector;

	function UserPointer(){
		init.call(this);
		registerEventListeners.call(this);
	}

	function init(){
		dispatcher = new Util.EventDispatcher;
		multiselector = new Phaser.Rectangle(0, 0, 0, 0);
		multiselector.active = false;
	}


	function registerEventListeners(){
		// Releasing either of the mouse buttons
		phaser_game.input.onUp.add(function(){
			dispatcher.dispatch("up");

			if (multiselector.active){

				if (multiselector.width > 0 || multiselector.height > 0){
					dispatcher.dispatch("multiselector/up", multiselector);
				}

				multiselector.active = false;
				multiselector.x = 0;
				multiselector.y = 0;
				multiselector.width = 0;
				multiselector.height = 0;				
			}

		}, this);

		// Pressing either of the mouse buttons
		phaser_game.input.onDown.add(function(){

            // left mouse button
            if (phaser_game.input.mousePointer.leftButton.isDown){
            	dispatcher.dispatch("leftbutton/down", phaser_game.input.mousePointer);

            	multiselector.active = true;
				multiselector.x = phaser_game.camera.x + phaser_game.input.mousePointer.x;
				multiselector.y = phaser_game.camera.y + phaser_game.input.mousePointer.y;
				multiselector.width = 0;
				multiselector.height = 0;         	
            } 
            // right mouse button
            else if (phaser_game.input.mousePointer.rightButton.isDown){
            	dispatcher.dispatch("rightbutton/down", phaser_game.input.mousePointer);
            }

            // invoking all the registred functions for the the unified event
			dispatcher.dispatch("down");	

		}, this);

	}

	UserPointer.prototype = {

		on: function(event, callback){
			dispatcher.addEventListener(event, callback);
		},

		stopMultiselection: function(){
			multiselector.active = 0;
			multiselector.width = 0;
			multiselector.height = 0;
		},

		update: function(){
			phaser_game.debug.geom(multiselector,'#0fffff', false);

			if ( phaser_game.input.mousePointer.leftButton.isDown ){
				dispatcher.dispatch('leftbutton/move', phaser_game.input.mousePointer);
			}

			if ( phaser_game.input.mousePointer.leftButton.isDown && multiselector.active){
				if (phaser_game.camera.x + phaser_game.input.mousePointer.x < multiselector.x){
					this.stopMultiselection();
					return;
				}
				if (phaser_game.camera.y + phaser_game.input.mousePointer.y < multiselector.y){
					this.stopMultiselection();
					return;
				}				
				multiselector.width = Math.abs(multiselector.x - (phaser_game.camera.x + phaser_game.input.mousePointer.x));
				multiselector.height = Math.abs(multiselector.y - (phaser_game.camera.y + phaser_game.input.mousePointer.y));				
			}
		},

		isLeftButtonDown: function(){
			return phaser_game.input.mousePointer.leftButton.isDown;
		},

		isRightButtonDown: function(){
			return phaser_game.input.mousePointer.rightButton.isDown;
		}		

	};

	return {

		setGame: function(game){
			phaser_game = game;
		},

		getInstance: function(){
			if (!phaser_game){
				throw 'Invoke setGame first to pass the Phaser Game entity!';
			}			
			if (!singleton){
				singleton = new UserPointer();
			}
			return singleton;
		}

	};



});