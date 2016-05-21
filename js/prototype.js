'use strict';

/*
	pin index 0 - positive
	pin index 1 - negative
    
    Probably need to redo the argument passing of positions to use
    arrays e.g., [[0,0],[4,1]]
*/

let Board = function Board(width = 10, height = 10) {	
	// Initialise empty board
	let	board = new Array(width);
	for(let row = 0; row < width; row++){
		board[row] = new Array(height);
	}
    
    // Initialise Slot if position is undefined
    function initSlot(x, y){
        if(!board[x][y]){
            board[x][y] = new Slot(x,y);
        }
    }
	
	// Place component pins into respective slots
	function place(component, positions) {
        
		positions.forEach((position, index) => {
		    let x = position[0],
				y = position[1];
			
			// Initialise to be a Slot if it is not one yet
			initSlot(x,y);
			
			// Add the component to this Slot
			board[x][y].add(component, index);
		});
	}
	
	function remove(component){
		component.pins.forEach((position) => {
			let x = position[0],
				y = position[1];
			
			board[x][y].remove(component);
		});
	}
	
	return {
		board: board,
		place: place,
		remove: remove
	};
};

class Slot {
    constructor(x, y) {
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
                object  // component itself
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
		this.connected.forEach((component) => { 
			if(component.object.active) count++; 
		});
		return count;
    }
    
    // Map with all connections
    get connections() {
        return this.connected;
    }
    
    // Check if True node - more than 3 non-disabled components connected
	get isTrueNode() {
		return this.activeCount >= 3;
	}
    
    // Add component
    add(component, pin_index) {
		this.connected.set(
			component.id, 
			{ 
				pin: pin_index, 
				object: component 
			}
		);
	}
    
    // Remove component
	remove(component) {
		this.connected.delete(component.id);
	}
}

const ComponentDefault = {   
    type : 0,
    label : undefined,
    V : 0, R : 0, I : 0,
    openEnded : false,
    active : true,
    traveled : false
};
class Component {
    constructor({   type = 0, 
                    label = undefined, 
                    V = 0, R = 0, I = 0, 
                    openEnded = false, 
                    active = true, 
                    traveled = false } = ComponentDefault)
    {
        this.id = (Date.now() + Math.random()).toString();
        this.label = label || 'Component-'+ this.id;
        this.V = V;
        this.R = R;
        this.I = I;
        this.openEnded = openEnded;
        this.active = active;
        this.traveled = traveled;
        this.pins = [];
    }
    
    place(...positions) {
        if(hasDuplicatePositions(positions))
			logger('Pins of the same component cannot share the same slot.');
		
		this.pins = positions;
		
		if(!window.board)
	        logger('Board not found!');
		window.board.place(this, positions);
    }
    
    remove() {
        if(!window.board)
	        logger('Board not found!');
		window.board.remove(this);
    }
}

/*
  Utility Functions
*/
function isNumber(a) {
	return !isNaN(parseInt(a));
}

function logger(message, severity){
	// To do: do something with severity
	throw new Error(message);
}

function objectToArray(obj){
	return Array.prototype.slice.call(obj);
}

function hasDuplicatePositions(pins) {
    let found = false;
	for(let left = 0; left < pins.length - 1; left++){
		for(let right = left + 1; right < pins.length; right++){
			if(pins[left][0] === pins[right][0] && pins[left][1] === pins[right][1]){
			    found = true;
			    break;
            }
		}
		if(found)
			break;
	}
	return found;
}

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
let batt = Component({ label: 'batt' });
batt.place([0,0],[10,0]);

let wire1 = Component({ label: 'wire 1' });
wire1.place([0,0], [0,10]);

let wire2 = Component({ label: 'wire 2' });
wire2.place([10,0], [10,10]);

let resistor = Component({ label: 'resistor' });
resistor.place([0,10], [10,10]);
 */