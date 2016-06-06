'use strict';

/*
	pin index 0 - positive
	pin index 1 - negative
    
    Probably need to redo the argument passing of positions to use
    arrays e.g., [[0,0],[4,1]]
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
    
    // Private - Initialise Slot if position is undefined
    function initSlot(pos){
        let [x,y] = pos;
        if(!board[x][y]){
            board[x][y] = new Slot(pos);
        }
    }
    
    // Public - Return the slot specified by the position passed in
    function getSlot(pos){
        return board[pos[0]][pos[1]];
    }
	
	// Place component pins into respective slots
    // positions is a 2D array e.g. [[0,1], [1,1]]
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
	
    // Remove component pins from their slot
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
    
    // Private - Add to list of occupied slots, if havent already
    function addOccupiedSlot(pos){
        if(!occupiedSlots.has(pos.toString())){
            occupiedSlots.set(pos.toString(), board[pos[0]][pos[1]]);
        }
    }
    
    // Private - Remove from the list of occupied slots
    function removeOccupiedSlot(pos){
        if(occupiedSlots.has(pos.toString())){
            occupiedSlots.delete(pos.toString());
        }
    }
	
    // Private - Add to list of components on the board
    function addComponent(component){
        if(!components.has(component.id)){
            components.set(component.id, component);
        }
    }
    
    // Private - Remove from list of components on the board
    function removeComponent(component){
        if(components.has(component.id)){
            components.delete(component.id, component);
        }
    }
    
    // Public - Get array of active sources
    function getActiveSources(){
        let actSources = [];
        for(let component of components.values()){
            if(component.type === ComponentType.Source && component.active){
                actSources.push(component);
            }
        }
        return actSources;
    }
    
    // Public - returns true if any true node has any untraveled components
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
    
    // Public - returns true if the passed in component type is found on the board
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