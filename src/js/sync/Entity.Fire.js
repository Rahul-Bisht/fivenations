import Event from './Event';
const ns = window.fivenations;

function EntityFire() {
    var args = [].slice.call(arguments);
    Event.apply(this, args);
}

EntityFire.prototype = Object.create(Event.prototype);
EntityFire.prototype.constructor = EntityFire;

/**
 * No-op function to be overwritten in the child objects
 * @param {object} [options] [extendable object that presents event details]
 * @return {void}
 */
EntityFire.prototype.execute = function(options) {
    if (!options.targets || !options.data) {
        return;
    }
    var entity;
    var targetEntity;
    var weapons;

    options.targets.forEach(function(id, idx) {
        entity = ns.game.entityManager.entities(id);
        targetEntity = ns.game.entityManager.entities(options.data.targetEntity);
        
        if (!entity || !targetEntity) return;
        if (!options.data.weaponGUIDs[idx]) return;

        weapons = entity.getWeaponManager().getWeapons().filter(function(weapon) {
            for (var i = options.data.weaponGUIDs[idx].length - 1; i >= 0; i -= 1) {
                if (options.data.weaponGUIDs[idx][i] === weapon.getGUID()) {
                    return true;
                }   
            }
            return false;
        });

        if (options.resetActivityQueue) {
            entity.reset();    
        }

        entity.fire(targetEntity, weapons);

    }); 
};

export default EntityFire;
