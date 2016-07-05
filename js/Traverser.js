/**
 * Traverser module <br>
 * Currently only check if the circuit on the board is closed or not.
 * NOTE: This currently assumes that there is only one circuit on the board.
 * @module Traverser
 */

'use strict';


/**
 * Traverser
 * 
 * @instance
 * @returns {Traverser}
 */
let Traverser = function Traverser() {

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
            logger('No source component found!');
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
            logger('No ground component found!');
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
        //checkGroundExists(board);
        deactivateOpenBranches(board);

        // We have to find a list of active Sources, so we can start traversing!
        let activeSources = board.activeSources;

        // The source component(s) might be deactivated due to being on an open branch
        // so that counts as an open circuit too
        if(activeSources.length === 0){
            logger('No closed circuit found');
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

        // Store the negative pin positions of the source so we can tell if we are back at source later
        let currentPos = source.pins[0],
            negativePinPos = source.pins[1];

        // This acts like a 'stack', storing the most recent traveled node
        let nodeTrace = [];

        console.log('START OF TRAVERSAL');

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
            if(pos.toString() === negativePinPos.toString()){
                board.closed = true;
                findUnfinishedNode();
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
            if(board.hasUnfinishedNode){
                backToLastNode();
            }
            else {
                console.log('END OF TRAVERSAL', nodeTrace);
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
            let connection = board.getSlot(pos).untraveledConnections[0];

            if(!!connection){ // Found
                let nextPos = connection.component.pins[connection.pin];
                connection.component.traveled = true;
                goNextSlot(nextPos);
            }
            else { // Not found
                nodeTrace.pop();
                findUnfinishedNode();
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
            if(board.getSlot(pos).isTrueNode){
                existsInTrace(pos);
            }
            else {
                let connection = board.getSlot(pos).untraveledConnections[0],
                    nextPos = connection.component.getOtherPins(pos)[0];

                connection.component.traveled = true;
                goNextSlot(nextPos);
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
            if(nodeTrace.find((node) => node.toString() === pos.toString())){
                backToLastNode();
            }
            else {
                nodeTrace.push(pos);

                let connection = board.getSlot(pos).untraveledConnections[0],
                    component = connection.component,
                    nextPos = component.getOtherPins(component.pins[connection.pin])[0];

                component.traveled = true;
                goNextSlot(nextPos);
            }
        }

        /**
         * Move onto the next position for traversal
         * 
         * @private
         * @memberOf traverseSource
         * @method goNextSlot
         * @param {Position} nextPos
         */
        function goNextSlot(nextPos) {
            checkBackAtSource(nextPos);
        }
    }

    /**
     * Start the traversal
     * 
     * @param {Board} board
     */
    function start(board) {
        checkClosedCircuit(board);
    }

    return {
        start: start,
        _checkSourceExists: checkSourceExists,
        _checkGroundExists: checkGroundExists,
        _deactivateOpenBranches: deactivateOpenBranches,
        _checkClosedCircuit: checkClosedCircuit
    };
}
