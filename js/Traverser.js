/**
 * Traverser module <br>
 * Currently only check if any circuit on the board is closed or not.
 * @module Traverser
 */

'use strict';

/**
 * Traverser
 * 
 * @instance
 * @param {boolean} [{ debug = false }={ debug : false }]
 * @returns {Traverser}
 * 
 * @example
 * let traverser = Traverser();
 */
let Traverser = function Traverser({ debug = false } = { debug : false }) {

    /**
     * Deactivates all open-ended branches
     * 
     * @private
     * @method deactivateOpenBranches
     * @param {Board} board
     */
    function deactivateOpenBranches(board) {
        board.occupiedSlots.forEach((slot) => {
            deactivateOpenEnds(board, slot);
        });
    }

    /**
     * Given a slot, we recursively see if the components connected to it needs deactivating or not.
     * 
     * @private
     * @method deactivateOpenEnds
     * @param {Board} board
     * @param {Slot} slot
     */
    function deactivateOpenEnds(board, slot) {
        if (slot.activeCount === 1) {
            let pinAndComponent = slot.activeConnections.values()    // returns @@iterator that contains values
                                    .next().value,                   // getting the only value in that Map
                component = pinAndComponent.component,
                pin = pinAndComponent.pin;

            let otherPins = component.getOtherPins([slot.x, slot.y]);

            /*  If the component is NOT open ended AND active, deactivate
                If the component is open ended AND the pin index is 0 AND active, deactivate
                The second condition is to deactivate stray/isolated open ended components
            */
            if ((!component.openEnded || (component.openEnded && pin === 0)) && component.active) {
                component.active = false;
                otherPins.forEach((pos) => {
                    deactivateOpenEnds(board, board.board[pos[0]][pos[1]]);
                });
            }
        }
    }

    /**
     * Errors if no source component found
     * 
     * @private
     * @method checkSourceExists
     * @param {Board} board
     */
    function checkSourceExists(board) {
        if(!board.hasType(ComponentType.Source)){
            Utility.logger('No source component found!');
        }
    }

    /**
     * Errors if no ground component found
     * 
     * @private
     * @method checkGroundExists
     * @param {Board} board
     */
    function checkGroundExists(board) {
        if(!board.hasType(ComponentType.Ground)){
            Utility.logger('No ground component found!');
        }
    }

    /**
     * Traverses through each active source component to check if the circuit is closed or not
     * 
     * @private
     * @method checkClosedCircuit
     * @param {Board} board
     */
    function checkClosedCircuit(board) {
        checkSourceExists(board);
        checkGroundExists(board);
        deactivateOpenBranches(board);

        // We have to find a list of active Sources, so we can start traversing!
        let activeSources = board.activeSources;

        // The source component(s) might be deactivated due to being on an open branch
        // so that counts as an open circuit too
        if(activeSources.length === 0){
            Utility.logger('No closed circuit found');
        }

        // Start traversal from each source components
        activeSources.forEach((source)=>{
            traverseSource(board, source);
        });
    }


    /**
     * Traverse through the circuit starting from the source component. <br>
     * Sets the Board.closed field to 'true' if circuit is closed. <br>
     * 
     * @private
     * @method traverseSource
     * @param {Board} board
     * @param {Source} source
     */
    function traverseSource(board, source) {
        // Note: This is code is assuming that the source has two pins

        // Exit if this source has been traveled already
        if(source.traveled){
            return;
        }

        source.traveled = true;

        // Set up new Circuit object
        let circuit = new Circuit(board);

        // Store the negative pin positions of the source so we can tell if we are back at source later
        let currentPos = source.pins[0],
            negativePinPos = source.pins[1];

        // This acts like a 'stack', storing the most recent traveled node
        let nodeTrace = [];

        trace('traverseSource', 'START OF TRAVERSAL');

        // Start traversing from the source
        checkBackAtSource(currentPos);

        /**
         * Check to see if we're back at the source component
         * 
         * @private
         * @memberOf traverseSource
         * @method checkBackAtSource
         * @param {Position} pos
         */
        function checkBackAtSource(pos) {
            trace('checkBackAtSource', pos);

            if(pos.toString() === negativePinPos.toString()){
                board.closed = true;
                
                // This pos might be a true node, while being back at source component
                if(board.getSlot(pos).isTrueNode){
                    existsInTrace(pos);
                }
                else {
                    findUnfinishedNode();
                }
            }
            else {
                checkTrueNode(pos);
            }
        };

        /**
         * Find node(s) that has untraveled connection(s). <br>
         * Returns true if the traversal is done.
         * 
         * @private
         * @memberOf traverseSource
         * @method  findUnfinishedNode
         * @returns {boolean}
         */
        function findUnfinishedNode() {
            trace('findUnfinishedNode');

            if(board.hasUnfinishedNode){
                backToLastNode();
            }
            else {
                trace('findUnfinishedNode', 'END OF TRAVERSAL');
                circuit.addToBoard();
                return true;
            }
        }

        /**
         * Jump back to the most recent traveled node and start traversing from there again
         * 
         * @private
         * @memberOf traverseSource
         * @method backToLastNode
         */
        function backToLastNode() {
            trace('backToLastNode');

            let lastNodePos = nodeTrace[nodeTrace.length-1];
            findUntraveledConnections(lastNodePos);
        }

        /**
         * Find untraveled Connection(s) in a position/node
         * 
         * @private
         * @memberOf traverseSource
         * @method findUntraveledConnections
         * @param {Position} pos
         */
        function findUntraveledConnections(pos) {
            trace('findUntraveledConnections', pos);

            if(board.getSlot(pos).hasAllTraveled){ // Not found
                nodeTrace.pop();
                findUnfinishedNode();
            }
            else { // Found
                goNextSlot(pos);
            }
        }

        /**
         * Check if this position is a true node or not
         * 
         * @private
         * @memberOf traverseSource
         * @method checkTrueNode
         * @param {Position} pos
         */
        function checkTrueNode(pos) {
            trace('checkTrueNode', pos);

            if(board.getSlot(pos).isTrueNode){
                existsInTrace(pos);
            }
            else {
                goNextSlot(pos);
            }
        }

        /**
         * Check if this position/node exists in the trace already or not
         * 
         * @private
         * @memberOf traverseSource
         * @method existsInTrace
         * @param {Position} pos
         */
        function existsInTrace(pos) {
            trace('existsInTrace', pos);

            if(nodeTrace.find((node) => node.toString() === pos.toString())){ // Found in nodeTrace
                backToLastNode();
            }
            else {
                // Add to this Circuit's node array
                circuit.addNode(pos);

                nodeTrace.push(pos);
                goNextSlot(pos);
            }
        }

        /**
         * Picks the component's other pin and moves onto its position to continue traversal <br>
         * 
         * @private
         * @memberOf traverseSource
         * @method goNextSlot
         * @param {Position} pos Current position
         */
        function goNextSlot(pos) {
            trace('goNextSlot', pos);

            let connection = board.getSlot(pos).untraveledConnections[0],
                component = connection.component,
                nextPos = component.getOtherPins(pos)[0];

            component.traveled = true;
            
            // We don't need to go to the next slot if the current component is a ground
            if(component.type === ComponentType.Ground) {
                
                // Add the last node's position as the ground node position
                circuit.setGround(nodeTrace[nodeTrace.length-1]);
                checkBackAtSource(pos);
            }
            else {
                checkBackAtSource(nextPos);
            }

        }
    }

    /**
     * Start the traversal
     * 
     * @public
     * @instance
     * @method start
     * @param {Board} board
     * 
     * @example
     * let traverser = Traverser();
     * traverser.start(board);
     */
    function start(board) {
        checkClosedCircuit(board);
    }


    /**
     * Tracing the steps in the traversal
     * 
     * @private
     * @method trace
     * @param {any} params
     */
    function trace(...params) {
        if(debug) {
            console.log(...params);
        }
    }

    return {
        start: start,
        _checkSourceExists: checkSourceExists,
        _checkGroundExists: checkGroundExists,
        _deactivateOpenBranches: deactivateOpenBranches,
        _checkClosedCircuit: checkClosedCircuit
    };
}

module.exports = Traverser;