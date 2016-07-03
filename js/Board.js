/**
 * Board module
 * @module Board
 */

'use strict';

/*
	pin index 0 - positive
	pin index 1 - negative
    
    Probably need to redo the argument passing of positions to use
    arrays e.g., [[0,0],[4,1]]
*/


/**
 * Board
 * 
 * @param {number} [width=10] Width of the board - 0 indexed
 * @param {number} [height=10] Height of the board - 0 indexed
 * @returns {Board}
 * @instance
 */
let Board = function Board(width = 10, height = 10) {	
	// Initialise empty board
	let	board = Array.apply(null, { length: width });
	board = board.map(() => {
        return Array.apply(null, { length: height });
    });
    
    let occupiedSlots = new Map(),
        components = new Map();
    
    // Closed Circuit flag
    let closed = false;
    
    /**
     * Initialise a Slot if it hasn't already been done.
     * 
     * @param {Array} pos e.g. [1,1]
     * @private
     */
    function initSlot(pos){
        let [x,y] = pos;
        if(!board[x][y]){
            board[x][y] = new Slot(pos);
        }
    }
    
    /**
     * Return the slot specified by the position given
     * 
     * @param {Array} pos
     * @returns {Slot}
     * @private
     */
    function getSlot(pos){
        return board[pos[0]][pos[1]];
    }
	
	/**
	 * Place Component pins into respective Slots
	 * 
	 * @param {Component} component
	 * @param {Array} positions
     * @see Use [Component's place]{@link Component#place} method
	 */
	function place(component, positions) {
        
		positions.forEach((position, index) => {			
			// Initialise to be a Slot if it is not one yet
			initSlot(position);
			
			// Add the component to this Slot
			getSlot(position).add(component, index);
            
            // Add to occupiedSlots
            addOccupiedSlot(position);
		});
        
        addComponent(component);
	}
	
	/**
	 * Remove Component from its Slots
	 * 
	 * @param {Component} component
     * @see Use [Component's remove]{@link Component#remove} method
	 */
	function remove(component){
		component.pins.forEach((position) => {
			let x = position[0],
				y = position[1];
			
			board[x][y].remove(component);
            
            if(board[x][y].count === 0){
                removeOccupiedSlot(position);
            }
		});
        
        removeComponent(component);
	}
    
    /**
     * Adds a position to a list of occupied Slots
     * 
     * @param {Array} pos
     * @private
     */
    function addOccupiedSlot(pos){
        if(!occupiedSlots.has(pos.toString())){
            occupiedSlots.set(pos.toString(), board[pos[0]][pos[1]]);
        }
    }

    /**
     * Remove position from the list of occupied Slots
     * 
     * @param {Array} pos
     * @private
     */
    function removeOccupiedSlot(pos){
        if(occupiedSlots.has(pos.toString())){
            occupiedSlots.delete(pos.toString());
        }
    }
	
    /**
     * Add Component to list of components on the Board
     * 
     * @param {Component} component
     * @private
     */
    function addComponent(component){
        if(!components.has(component.id)){
            components.set(component.id, component);
        }
    }
    
    /**
     * Remove Component from list of components on the Board
     * 
     * @param {Component} component
     * @private
     */
    function removeComponent(component){
        if(components.has(component.id)){
            components.delete(component.id, component);
        }
    }
    
    /**
     * Get array of active source Components
     * 
     * @returns {Array}
     */
    function getActiveSources(){
        let actSources = [];
        for(let component of components.values()){
            if(component.type === ComponentType.Source && component.active){
                actSources.push(component);
            }
        }
        return actSources;
    }
    
    /**
     * Returns true if any true node has any untraveled components
     * 
     * @returns {Boolean}
     */
    function hasUnfinishedNode(){
        let hasUnfinished = false;
        for(let slot of occupiedSlots.values()){
            if(slot.isTrueNode && !slot.hasAllTraveled){
                hasUnfinished = true;
                break;
            }
        }
        return hasUnfinished;
    }
    
    /**
     * Returns true if Component Type is found on the Board
     * 
     * @param {ComponentType} type
     * @returns {Boolean}
     */
    function hasType(type){
        let found = false;
        for(let component of components.values()){
            if(component.type === type){
                found = true;
                break;
            }
        }
        return found;
    }
    
	return {
		board: board,
        getSlot: getSlot,
        closed: closed,
        occupiedSlots: occupiedSlots,
        components: components,
		place: place,
		remove: remove,
        get activeSources() { return getActiveSources(); },
        get hasUnfinishedNode() { return hasUnfinishedNode(); },
        hasType: hasType
	};
};

/*
  Testing
*/
/* (function init(global){
	global.board = Board(15, 15);
})(window || global); */

/*
0,0 
    ---batt---
    |        |
w1  |        | w2
    |        |
    ---ress---  10,10
*/
/* 
let batt = new Component({ label: 'batt' });
batt.place([0,0],[10,0]);

let wire1 = new Component({ label: 'wire 1' });
wire1.place([0,0], [0,10]);

let wire2 = new Component({ label: 'wire 2' });
wire2.place([10,0], [10,10]);

let resistor = new Component({ label: 'resistor' });
resistor.place([0,10], [10,10]);
 */