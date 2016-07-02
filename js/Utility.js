
/**
 * Collection of utility functions
 * @namespace Utility
 */

/**
 * Returns true if argument is a number
 * 
 * @param {any} input
 * @returns {boolean}
 */
function isNumber(input) {
	return !isNaN(parseInt(input));
}

/**
 * Todo: Logs an error message along with its severity
 * 
 * @param {string} message
 * @param {number} severity
 */
function logger(message, severity){
	// To do: do something with severity
	throw new Error(message);
}


/**
 * Return true if duplicate pins are found
 * 
 * @param {Array} pins e.g. [[1,1], [2,2], [4,4]]
 * @returns {boolean}
 */
function hasDuplicatePositions(pins) {
    return pins
			.map(pin => pin.toString())
			.some((pin, index, arr) => index !== arr.lastIndexOf(pin));
}