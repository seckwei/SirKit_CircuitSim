'use strict';

class Slot {
    constructor(pos) {
        if(pos.length !== 2 || !pos instanceof Array){
            throw new Error('Slot must be initialised with an array of two items - x and y e.g. [5, 4]');
        }
        
        let [x,y] = pos;
        if(!isNumber(x) || !isNumber(y) || x < 0 || y < 0){
            logger('x and y has to be positive numbers');
        }
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.V = 0; // voltage through this slot
        this.connected = new Map();
        /*  Connected Components Map Structure
            component_id : {
                pin,    // index
                component  // component itself
            }
        */
    }
    
    // Count all components
	get count() {
		return this.connected.size;
	}
    
    // Count only non-disabled / active components
	// This is used to determine true-nodes which has >= 3 active components
    get activeCount() {
        let count = 0;
		this.connected.forEach((obj) => { 
			if(obj.component.active) count++; 
		});
		return count;
    }
    
    // Map that contains all connections
    get connections() {
        return this.connected;
    }
    
    // Map that contains all active connections
    get activeConnections() {
        let accMap = new Map();
        for(let conn of this.connected.entries()){
            if(conn[1].component.active){
                accMap.set(conn[0], conn[1]);
            }
        }
        return accMap;
    }
    
    // Check if True node - more than 3 non-disabled components connected
	get isTrueNode() {
		return this.activeCount >= 3;
	}
    
    // Check if all connected components have been traveled
    get hasAllTraveled() {
        let allTraveled = true;
        for(let connection of this.connected.values()){
            if(!connection.component.traveled){
                allTraveled = false;
                break;
            }
        }
        return allTraveled;
    }
    
    // Returns an array with untraveled connections { pin, component }
    get untraveledConnections() {
        let untraveled = [];
        for(let connection of this.connected.values()){
            if(!connection.component.traveled){
                untraveled.push(connection);
            }
        }
        return untraveled;
    }
    
    // Add component
    add(component, pin_index) {
		this.connected.set(
			component.id, 
			{ 
				pin: pin_index, 
				component: component 
			}
		);
	}
    
    // Remove component
	remove(component) {
		this.connected.delete(component.id);
	}
}