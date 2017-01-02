define('EffectManager', [
    'Graphics',
    'Effect',
    'DataObject',
    'Util'
], function(Graphics, Effect, DataObject, Util) {

    var ns = window.fivenations;

    var phaserGame;
    var singleton;

    var effects = [];

    function EffectManager() {
        if (!phaserGame) {
            throw 'Invoke setGame first to pass the Phaser Game entity!';
        }
    }

    EffectManager.prototype = {

        /**
         * Adds an effect object to the private collection
         * @param {object} config configuration object
         */
        add: function(config) {

            var effect;
            var sprite;
            var dataObject;
            var point;

            if (!config) {
                throw 'Invalid configuration object passed as a parameter!';
            }

            if (Object.keys(ns.effects).indexOf(config.id) === -1) {
                throw 'The requrested effect is not registered!';
            }

            sprite = phaserGame.add.sprite(0, 0, config.id);
            dataObject = new DataObject(phaserGame.cache.getJSON(config.id));

            // adding the freshly created effect to the main array
            effect = new Effect({
                manager: this,
                sprite: sprite,
                dataObject: dataObject
            });

            // setting the coordinates if not ommitted 
            if (config.x || config.y) {
                sprite.x = config.x || 0;
                sprite.y = config.y || 0;
            }

            if (config.rotation !== undefined) {
                sprite.rotation = config.rotation;
            } else if (config.angle !== undefined) {
                sprite.angle = config.angle;
            }

            if (config.velocity || config.acceleration) {
                phaserGame.physics.enable(sprite, Phaser.Physics.ARCADE);
            }

            if (config.velocity) {

                if (config.rotation !== undefined) {
                    point = phaserGame.physics.arcade.velocityFromRotation(config.rotation, config.velocity);
                } else if (config.angle !== undefined) {
                    point = phaserGame.physics.arcade.velocityFromAngle(config.angle, config.velocity);
                } else if (config.velocity.x || config.velocity.y) {
                    point = new Phaser.Point(config.velocity.x || 0, config.velocity.y || 0);
                }

                if (point) {
                    sprite.body.velocity = point;
                }

            }

            if (config.acceleration) {

                if (config.rotation !== undefined) {
                    point = phaserGame.physics.arcade.accelerationFromRotation(config.rotation, config.acceleration);
                } else if (config.angle !== undefined) {
                    point = phaserGame.physics.arcade.accelerationFromAngle(config.angle, config.acceleration);
                } else if (config.acceleration.x || config.acceleration.y) {
                    point = new Phaser.Point(config.acceleration.x || 0, config.acceleration.y || 0);
                }

                if (point) {
                    sprite.body.acceleration = point;
                }

            }

            if (config.maxVelocity) {
                sprite.body.maxVelocity.set(config.maxVelocity);
            }

            Graphics
                .getInstance()
                .getGroup('effects')
                .add(sprite);

            effects.push(effect);
        },

        /**
         * Triggers an explosion animation configured in the DataObject
         * @param {object} entity Any object possesses DataObject instance
         */
        explode: function(entity) {
            if (!entity || !entity.getDataObject) return;

            var effectId;
            var sprite;
            var minWrecks;
            var maxWrecks;
            var i;
            var eventData = entity.getDataObject().getEvent('remove');

            if (!eventData) return;

            sprite = entity.getSprite();

            if (eventData.effects && eventData.effects.length) {
                if (eventData.randomize) {
                    effectId = eventData.effects[Util.rnd(0, eventData.effects.length - 1)];
                    this.add({
                        id: effectId,
                        x: sprite.x,
                        y: sprite.y
                    });
                } else {
                    eventData.effects.forEach(function(effectId) {
                        this.add({
                            id: effectId,
                            x: sprite.x,
                            y: sprite.y
                        });
                    }.bind(this));
                }
            }

            if (eventData.wrecks && eventData.wrecks.length) {
                minWrecks = eventData.minWrecks || 0;
                maxWrecks = eventData.maxWrecks || 0;
                for (i = minWrecks; i <= maxWrecks; i += 1) {
                    effectId = eventData.wrecks[Util.rnd(0, eventData.wrecks.length - 1)];
                    this.add({
                        id: effectId,
                        x: sprite.x + Util.rnd(0, 30) - 15,
                        y: sprite.y + Util.rnd(0, 30) - 15,
                        velocity: {
                            x: (Math.random() - 0.5) * Util.rnd(75, 100),
                            y: (Math.random() - 0.5) * Util.rnd(75, 100)
                        }
                    });                        
                }
            }

        },

        /**
         * Removes effect from the private collection
         * @param {object} effect Effect instance
         */
        remove: function(effect) {
            for (var i = effects.length - 1; i >= 0; i -= 1) {
                if (effect === effects[i]) {
                    this.removeByIndex(i);
                }
            }
            effect = null;
        },

        /**
         * Removes effect with the given index from the private collection
         * @param {integer} idx index of the effect in the effect queue
         */        
        removeByIndex: function(idx) {
            if (!effects[idx]) return;
            effects[idx].remove();
            effects.splice(idx, 1);
        },

        /**
         * destroys all the existing effects
         * @return {void}
         */
        reset: function() {
            effects = [];
        },
        
        /**
         * Update function called on every tick
         * @return {void}
         */
        update: function() {
            for (var i = effects.length - 1; i >= 0; i -= 1) {
                if (!effects[i].ttl) continue;
                effects[i].ttl -= 1;
                if (effects[i].ttl === 0) {
                    this.removeByIndex(i);
                }
            }
        },

        /**
         * returns the Phaser.Game object for inconvinience 
         * @return {[object]} [Phaser.Game instnace]
         */
        getGame: function() {
            return phaserGame;
        }

    };

    return {

        /**
         * sets the global Phaser.Game instance
         * @param {void}
         */
        setGame: function(game) {
            phaserGame = game;
        },

        /**
         * returns singleton instance of the manager object
         * @return {object} Singleton instance of EffectManager
         */
        getInstance: function() {
            if (!phaserGame) {
                throw 'Invoke setGame first to pass the Phaser Game entity!';
            }
            if (!singleton) {
                singleton = new EffectManager();
            }
            return singleton;
        }

    };

});