/**
 * Board module
 * @module Board
 * @property {Map}      occupiedSlots   List of occupied slots on the board
 * @property {Map}      components      List of components on the board
 * @property {boolean}  closed          Indicates whether the circuit on the board is closed or not
 */

'use strict';

/*
    pin index 0 - positive
    pin index 1 - negative
*/

/**
 * Board
 * 
 * @instance
 * @param {number} [width=10] Width of the board - 0 indexed
 * @param {number} [height=10] Height of the board - 0 indexed
 * @returns {Board}
 * 
 * @example
 * let board = Board(100, 100);
 */
let Board = function Board(width = 10, height = 10) {	

    // Initialise empty board
    let	board = Array.apply(null, { length: width });
    board = board.map(() => {
        return Array.apply(null, { length: height });
    });
    
    let occupiedSlots = new Map(),
        components = new Map();
    
    
    let closed = false;
    
    /**
     * Initialise a Slot if it hasn't already been done.
     * 
     * @private
     * @method initSlot
     * @param {Array} pos e.g. [1,1]
     */
    function initSlot(pos){
        let [x,y] = pos;
        if(!board[x][y]){
            board[x][y] = new Slot(pos);
        }
    }
    
    /**
     * Return the slot specified by the position given
     * 
     * @private
     * @method getSlot
     * @param {Array} pos
     * @returns {Slot}
     */
    function getSlot(pos){
        return board[pos[0]][pos[1]];
    }
    
    /**
     * Place Component pins into respective Slots <br>
     * Uses [Slot#add]{@link module:Slot#add}
     * 
     * @protected
     * @instance
     * @method place
     * @param {Component} component
     * @param {Array} positions
     * @see Use [Component#place]{@link module:Component#place} method instead
     */
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
    
    /**
     * Remove Component from its Slots <br>
     * Uses [Slot#remove]{@link module:Slot#remove}
     * 
     * @protected
     * @instance
     * @method remove
     * @param {Component} component
     * @see Use [Component#remove]{@link module:Component#remove} method
     */
    function remove(component){
        component.pins.forEach((position) => {
            
            let slot = getSlot(position);
            slot.remove(component);
            
            if(slot.count === 0){
                removeOccupiedSlot(position);
            }
        });
        
        removeComponent(component);
    }
    
    /**
     * Adds a position to a list of occupied Slots
     * 
     * @private
     * @method addOccupiedSlot
     * @param {Array} pos
     */
    function addOccupiedSlot(pos){
        if(!occupiedSlots.has(pos.toString())){
            occupiedSlots.set(pos.toString(), board[pos[0]][pos[1]]);
        }
    }

    /**
     * Remove position from the list of occupied Slots
     * 
     * @private
     * @method removeOccupiedSlot
     * @param {Array} pos
     */
    function removeOccupiedSlot(pos){
        if(occupiedSlots.has(pos.toString())){
            occupiedSlots.delete(pos.toString());
        }
    }
    
    /**
     * Add Component to list of components on the Board
     * 
     * @private
     * @method addComponent
     * @param {Component} component
     */
    function addComponent(component){
        if(!components.has(component.id)){
            components.set(component.id, component);
        }
    }
    
    /**
     * Remove Component from list of components on the Board
     * 
     * @private
     * @method removeComponent
     * @param {Component} component
     */
    function removeComponent(component){
        if(components.has(component.id)){
            components.delete(component.id, component);
        }
    }
    
    /**
     * Get array of active source Components
     * 
     * @public
     * @instance
     * @method getActiveSources
     * @returns {Array}
     */
    function getActiveSources(){
        let actSources = [];
        for(let component of components.values()){
            if(component.type === ComponentType.Source && component.active){
                actSources.push(component);
            }
        }
        return actSources;
    }
    
    /**
     * Returns true if any true node has any untraveled components
     * 
     * @public
     * @instance
     * @method hasUnfinishedNode
     * @returns {Boolean}
     */
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
    
    /**
     * Returns true if Component Type is found on the Board
     * 
     * @public
     * @instance
     * @method hasType
     * @param {ComponentType} type
     * @returns {Boolean}
     */
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

module.exports = Board;