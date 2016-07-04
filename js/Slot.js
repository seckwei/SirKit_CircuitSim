/** 
 * Slot module
 * @module Slot
 * 
 * @property {number}   x   Position x
 * @property {number}   y   Position y
 * @property {number}   V   Voltage through this slot
 * 
 * @property {number}       count                   Number of all connected Components
 * @property {number}       activeCount             Number of all connected non-disabled/active Components
 * @property {Map}          connections             Map of Connections in this Slot. Key is component_id and Value is { pin_index, component }
 * @property {Map}          activeConnections       Same as connections property but only contains active ones
 * @property {boolean}      isTrueNode              Indicates if this slot has >= 3 active connections or not
 * @property {boolean}      hasAllTraveled          Indicates if all components has been traveled by Traverser or not
 * @property {Connection[]} untraveledConnections   Array of all untraveled Connections
 */

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
        this.V = 0;
        this.connected = new Map();
        /*  Connected Components Map Structure
            component_id : {
                pin,    // index
                component  // component itself
            }
        */
    }

    get count() {
        return this.connected.size;
    }
    
    get activeCount() {
        let count = 0;
        this.connected.forEach((obj) => { 
            if(obj.component.active) count++; 
        });
        return count;
    }
    
    get connections() {
        return this.connected;
    }
    
    get activeConnections() {
        let accMap = new Map();
        for(let conn of this.connected.entries()){
            if(conn[1].component.active){
                accMap.set(conn[0], conn[1]);
            }
        }
        return accMap;
    }
    
    get isTrueNode() {
        return this.activeCount >= 3;
    }
    
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
    
    get untraveledConnections() {
        let untraveled = [];
        for(let connection of this.connected.values()){
            if(!connection.component.traveled){
                untraveled.push(connection);
            }
        }
        return untraveled;
    }
    
    /**
     * Add component to this Slot
     * 
     * @protected
     * @instance
     * @method add
     * @param {Component} component
     * @param {number} pin_index
     * @see Use [Component#place]{@link module:Component#place} method instead
     */
    add(component, pin_index) {
        this.connected.set(
            component.id, 
            { 
                pin: pin_index, 
                component: component 
            }
        );
    }
    
    /**
     * Remove component from this Slot
     * 
     * @protected
     * @instance
     * @method remove
     * @param {Component} component
     * @see Use [Component#remove]{@link module:Component#remove} method instead
     */
    remove(component) {
        this.connected.delete(component.id);
    }
}