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

// Readability can be improved by using Array.find()
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