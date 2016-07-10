/**
 * Component module 
 * @module Component
 * @property {string}           id          Component id
 * @property {string}           label       Component label
 * @property {ComponentType}    type        Component type
 * @property {number}           V           Voltage
 * @property {number}           R           Resistance
 * @property {number}           I           Impedence
 * @property {boolean}          openEnded   Component is an open-ended component or not e.g., Ground
 * @property {boolean}          active      Component is active or not
 * @property {boolean}          traveled    Component has been traveled by Traverser or not
 * @property {Array[]}          pins        Component pins
 * @property {Board}            board       STATIC property which references to the Board object
 */

'use strict';

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
        this.type = type;
        this.V = V;
        this.R = R;
        this.I = I;
        this.openEnded = openEnded;
        this.active = active;
        this.traveled = traveled;
        
        /*  For openEnded components :
            pin 0 is the part connected to the circuit
            pin 1 is the open end
        */
        this.pins = [];
    }
    
    /**
     * Place Component onto specified Slots <br>
     * Uses [Board#place]{@link module:Board#place}
     * 
     * @public
     * @instance
     * @method place
     * @param {Array[]} positions
     * @example
     * let component = new Component();
     * component.place([0,0],[0,5]);
     */
    place(...positions) {
        if(!Component.board)
            Utility.logger('Component.board not set!');

        if(!this.validatePositions(positions))
            Utility.logger('Invalid positions provided - ' + positions.toString());

        if(Component.hasDuplicatePositions(positions))
            Utility.logger('Pins of the same component cannot share the same slot.');
        
        // If .place() is consecutively called without calling .remove()
        // then we'll do it ourselves.
        if(this.pins.length > 1)
            this.remove();
            
        this.pins = positions;
        Component.board.place(this, positions);
    }
    
    /**
     * Remove Component from board <br>
     * Uses [Board#remove]{@link module:Board#remove}
     * 
     * @public
     * @instance
     * @method remove
     * 
     * @example
     * let component = new Component();
     * component.place([0,0],[0,5]);
     * component.remove();
     */
    remove() {
        if(!Component.board)
            Utility.logger('Component.board not set!');

        Component.board.remove(this);
        this.pins = [];
    }   
    
    
    /**
     * Returns array of pins except the one passed in
     * 
     * @public
     * @instance
     * @method getOtherPins
     * @param {Array} pos
     * @returns {Array[]}
     */
    getOtherPins(pos) {
        return this.pins.filter((pinPos) => {
            return !(pinPos.toString() === pos.toString());
        });
    }

    /**
     * Validate positions provided <br>
     * Each position must be an Array that contains only two positive integers 
     * 
     * @private
     * @method validatePositions
     * @param {Array[]} positions
     * @example
     * [1,2], [2,3]     // the only valid format
     * ['a',2], [2,3]   // invalid
     * [], [1]          // invalid
     */
    validatePositions(positions) {
        return positions.length == 2 &&
            !positions.some((position) => {
                return !(position instanceof Array) || !(/^\d+\,\d+$/.test(position.toString()));
            });
    }

    /**
	 * Return true if duplicate pins are found
	 * 
	 * @public
	 * @static
	 * @method hasDuplicatePositions
	 * @param {Array[]} pins Array of pins e.g. [[1,1], [2,2], [4,4]]
	 * @returns {boolean}
	 */
	static hasDuplicatePositions(pins) {
		return pins
				.map(pin => pin.toString())
				.some((pin, index, arr) => index !== arr.lastIndexOf(pin));
	}
}

/**
 * Component's saved reference to the board
 * 
 * @public
 * @static
 * @name Component#board
 */
Component.board = undefined;

module.exports = Component;