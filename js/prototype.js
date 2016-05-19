'use strict';

/*
	pin index 0 - positive
	pin index 1 - negative
    
    Probably need to redo the argument passing of positions to use
    arrays e.g., [[0,0],[4,1]]
*/

let Board = function Board(w, h) {
	let width = w || 10,
		height = h || 10;
	
	// Initialise empty board
	let	board = new Array(width);
	for(let row = 0; row < width; row++){
		board[row] = new Array(height);
	}
    
    // Initialise Slot if position is undefined
    function initSlot(x, y){
        if(!board[x][y]){
            board[x][y] = Slot(x,y);
        }
    }
	
	// Place component pins into respective slots
	function place(/*component, [x1,y1], [x2,y2], ...*/) {
		let component = arguments[0],
		    pins = objectToArray(arguments[1]);
		
		pins.forEach((position, index) => {
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

let Slot = function Slot(x, y) {
	if(!isNumber(x) || !isNumber(y) || x < 0 || y < 0){
		logger('x and y has to be positive numbers');
    }
    x = Math.floor(x);
    y = Math.floor(y);
	
    let V = 0, // voltage of this slot
	    connected = new Map();
	/*
	    Connected Components Map Structure
		component_id : {
			pin_index,
			object
		}
	*/
	
	// Count only non-disabled / active components
	// This is used to determine true-nodes which has >= 3 active components
	function activeCount() {
		let count = 0;
		connected.forEach((component)=> { 
			if(component.object.active) count++; 
		});
		return count;
	}
	
	// Count all components
	function count() {
		return connected.size;
	}
	
	// Add component
	function add(component, pin_index) {
		connected.set(
			component.id, 
			{ 
				pin: pin_index, 
				object: component 
			}
		);
	}
	
	// Remove component
	function remove(component) {
		connected.delete(component.id);
	}
	
	// Check if True node - more than 3 non-disabled components connected
	function isTrueNode() {
		return activeCount() >= 3;
	}
	
	return {
		V: V,
		get x() { return x; },
		get y() { return y; },
		get count() { return count(); },
		get activeCount() { return activeCount(); },
		get connections() { return connected; }, // Only for debugging and testing
        get isTrueNode() { return isTrueNode(); },
		add: add,
		remove: remove
	};
};

let Component = function Component(config) {
	let id = (Date.now() + Math.random()).toString(),
	    pins = [], // locations of pins - [[x1,y1], [x2,y2]]
		
		type = config.type || 0 , // To do: Add component types
	    label = config.label || 'Component-'+id,
		
		V = config.V || 0,
		R = config.R || 0,
		I = config.I || 0,
		
		openEnded = config.openEnded || false,
		active = config.active || true,
		traveled = config.traveled || false;
	
	function place(/*[x1,y1], [x2,y2], ...*/) {
		let pin_positions = objectToArray(arguments);
		
		if(hasDuplicatePositions(pin_positions))
			logger('Pins of the same component cannot share the same slot.');
		
		pins = pin_positions;
		
		if(!window.board)
	        logger('Board not found!');
		window.board.place(this, arguments);
	}
	
	function remove(){
		if(!window.board)
	        logger('Board not found!');
		debugger;
		window.board.remove(this);
	}
	
	return {
		id : id,
		type: type,
		label : label,
		V: V, R: R,	I: I,
		get pins() { return pins; },
		get openEnded() { return openEnded; },
		get active() { return active; },
		set active(bool) { active = bool; },
		get traveled() { return traveled; },
		set traveled(bool) { traveled = bool; },
		place: place,
		remove: remove
	};
};

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