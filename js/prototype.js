/*
	pin 0 - positive
	pin 1 - negative
*/

let Board = function Board(w, h) {
	let width = 15,
		height = 15,
		board = new Array(width);
	
	for(let row = 0; row < width; row++){
		board[row] = new Array(height);
	}
	
	// To place component pins into respective slots
	function place(/*component, [x1,y1], [x2,y2], ...*/) {
		let component = arguments[0],
		    pins = arguments[1];
		
		Array.prototype.forEach.call(pins, (position, index) => {
		    let x = position[0],
				y = position[1];
			
			// Initialise to be a Slot if it is not one yet
			if(!board[x][y])
				board[x][y] = Slot(x,y);
			
			// Add the component to this Slot
			board[x][y].add(component, index);
		});
	}
	
	return {
		board: board,
		place: place
	};
};

let Slot = function Slot(x, y) {
	if(!isNumber(x) || !isNumber(y) || x < 0 || y < 0)
		logger('x and y has to be positive numbers');
	// To do: validate negatives
	
    let V = 0, // voltage of this slot
	    connected = new Map();
	/*
		key - component_id
		value - {
			pin,
			object
		}
	*/
	
	// Count only non-disabled components
	function connCount() {
		let count = 0;
		connected.forEach((component)=> { 
			if(!component.object.disabled) count++; 
		});
		return count;
	}
	
	// Count all components
	function realCount() {
		return connected.size;
	}
	
	// Add component
	function add(component, pin_index) {
		connected.set(
			component.id, 
			{ 
				index: pin_index, 
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
		return connCount() >= 3;
	}
	
	return {
		V: V,
		x: () => x,
		y: () => y,
		get realCount() { return realCount(); },
		get connCount() { return connCount(); },
		get connections() { return connected; },
		add: add,
		remove: remove
	};
};

let Component = function Component(config) {
	let id = (Date.now() + Math.random()).toString(),
		type = config.type || 0 , // To do: Add component types
	    label = config.label || 'Component-'+id,
	    pins = [],
		V, R, I,
		openEnded = true || false,
		disabled = true || false,
		traveled = true || false;
	
	function isOpenEnded() {
		return openEnded;
	}
	
	function isDisabled() {
		return disabled;
	}
	
	function isTraveled() {
		return traveled;
	}
	
	function setDisabled(bool) {
		disabled = bool;
	}

	function setTraveled(bool) {
		traveled = bool;
	}
	
	function place(/*[x1,y1], [x2,y2], ...*/) {
		Array.prototype.forEach.call(arguments, (pin_position, index)=>{
			pins[index] = pin_position;
		});
		
		if(!window.board)
	        logger('Board not found!');
		window.board.place(this, arguments);
	}
	
	return {
		id : id,
		type: type,
		label : label,
		pins : pins,
		V: V, R: R,	I: I,
		get openEnded() { return openEnded; },
		get disabled() { return disabled; },
		set disabled(bool) { disabled = bool; },
		get traveled() { return traveled; },
		set traveled(bool) { traveled = bool; },
		place: place
	};
};

/*
  Utility
*/
function isNumber(a) {
	return !isNaN(parseInt(a));
}

function logger(message, severity){
	// To do: do something with severity
	throw new Error(message);
}


/*
  Testing
*/
(function init(global){
	global.board = Board();
})(window || global);

/*
0,0 ---batt---
    |        |
    |        |
    |        |
    ---ress---  10,10
*/

let batt = Component({ label: 'batt' });
batt.place([0,0],[10,0]);

let wire1 = Component({ label: 'wire 1' });
wire1.place([0,0], [0,10]);

let wire2 = Component({ label: 'wire 2' });
wire2.place([10,0], [10,10]);

let resistor = Component({ label: 'resistor' });
resistor.place([0,10], [10,10]);
