
/**
 * Utility module
 * @module Utility
 */

'use strict';

let Utility = {
	/**
	 * Returns true if argument is a number
	 * 
	 * @public
	 * @static
	 * @method isNumber
	 * @param {any} input
	 * @returns {boolean}
	 */
	isNumber: function (input) {
		return !isNaN(parseInt(input));
	},

	/**
	 * Logs an error message along with its severity
	 * 
	 * @public
	 * @static
	 * @method logger
	 * @param {string} message
	 * @param {number} severity
	 * 
	 * @todo Do something with severity
	 */
	logger: function (message, severity){
		// To do: do something with severity
		throw new Error(message);
	},

	/**
	 * Return true if duplicate pins are found
	 * 
	 * @public
	 * @static
	 * @method hasDuplicatePositions
	 * @param {Array[]} pins Array of pins e.g. [[1,1], [2,2], [4,4]]
	 * @returns {boolean}
	 */
	hasDuplicatePositions: function (pins) {
		return pins
				.map(pin => pin.toString())
				.some((pin, index, arr) => index !== arr.lastIndexOf(pin));
	}
};

module.exports = Utility;