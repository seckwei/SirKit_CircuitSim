
/**
 * Utility module
 * @module Utility
 */

/**
 * Returns true if argument is a number
 * 
 * @static
 * @param {any} input
 * @returns {boolean}
 */
function isNumber(input) {
	return !isNaN(parseInt(input));
}

/**
 * Logs an error message along with its severity
 * 
 * @static
 * @param {string} message
 * @param {number} severity
 * 
 * @todo Do something with severity
 */
function logger(message, severity){
	// To do: do something with severity
	throw new Error(message);
}


/**
 * Return true if duplicate pins are found
 * 
 * @static
 * @param {Array[]} pins Array of pins e.g. [[1,1], [2,2], [4,4]]
 * @returns {boolean}
 */
function hasDuplicatePositions(pins) {
    return pins
			.map(pin => pin.toString())
			.some((pin, index, arr) => index !== arr.lastIndexOf(pin));
}