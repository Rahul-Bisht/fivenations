import Activity from './Activity'; 
import Move from './Move'; 
import Patrol from './Patrol'; 
import Follow from './Follow'; 
import Stop from './Stop'; 
import Idle from './Idle'; 
import Fire from './Fire'; 
import GetInRange from './GetInRange'; 
import GetToDock from './GetToDock'; 
import Attack from './Attack'; 
import RotateToTarget from './RotateToTarget';

function ActivityManager(entity) {

    var activities = [];

    return {

        /**
         * Adds the given activity to the activity queue
         * @param {object} Activity - An instance that inherits from Activity
         * @param {boolean} addAsLast - Adds the given Activity as the last element 
         * of the activity list if true 
         */
        add: function(activity, addAsLast) {
            var l = activities.length,
                currentIdx = l - 1;
            if (!activity instanceof Activity) {
                throw 'You must extend the manager with an object inherits from Activity!';
            }
            // removes the current activiy if it's Idle
            if (!(activity instanceof Idle) && l > 0){
                if (activities[currentIdx] instanceof Idle){
                    this.removeByIndex(currentIdx);
                }
            }
            // the naming must be confusing but the excecution order of
            // the collection is inverted
            if (addAsLast) {
                activities.unshift(activity);
            } else {
                activities.push(activity);
            }
            activity.setManager(this);
            // activity.activate() function can refer to elements in the
            // activity queue therefore this must be excecuted after
            // this activity is added to the activities collection
            activity.activate();
        },

        remove: function(activity) {
            for (var i = 0; i < activities.length; i += 1) {
                if (activities[i] === activity)  {
                    this.removeByIndex(i);
                    break;
                }
            }
        },

        removeByIndex: function(idx) {
            var lastItem;
            if (!activities[idx]){
                return;
            }
            activities[idx].deactivate();
            activities.splice(idx, 1);
            if (activities.length > 0) {
                lastItem = activities[activities.length - 1];
                lastItem.activate();
            }
        },

        removeAll: function() {
            activities = [];
        },

        update: function() {
            var l = activities.length,
                currentIdx = l - 1;
            if (0 === l) {
                // when the activity list is emtpty the entity should go idling
                this.add(new Idle(entity));
                return;
            }
            // we are excecuting the last function in the queue treating it with priority
            if (activities[currentIdx].isActivated()) {
                activities[currentIdx].update();
            }
        }

    };

}

ActivityManager.Move = Move;
ActivityManager.Stop = Stop;
ActivityManager.Patrol = Patrol;
ActivityManager.Follow = Follow;
ActivityManager.Fire = Fire;
ActivityManager.GetInRange = GetInRange;
ActivityManager.GetToDock = GetToDock;
ActivityManager.Attack = Attack;
ActivityManager.RotateToTarget = RotateToTarget;

export default ActivityManager;
