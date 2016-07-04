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
     * component.place([[0,0],[0,5]]);
     */
    place(...positions) {
        if(hasDuplicatePositions(positions))
            logger('Pins of the same component cannot share the same slot.');
        
        this.pins = positions;
        
        if(!window.board)
            logger('Board not found!');
        window.board.place(this, positions);
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
     * component.place([[0,0],[0,5]]);
     * component.remove();
     */
    remove() {
        if(!window.board)
            logger('Board not found!');
        window.board.remove(this);
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
}