/**
 * Circuit module
 * @module Circuit
 * 
 * @property {Board}        board   Reference to the Board object
 * @property {Position[]}   nodes   Array of true nodes' position
 * @property {Position}     ground  Position of the ground/reference node
 */

class Circuit {
    constructor(board){
        if(!board)
            Utility.logger('Circuit needs to be initialised with a Board object passed in');

        this.board = board;
        this.nodes = [];
        this.ground = undefined;
    }

    /**
     * Adds the given position to the list of nodes
     * 
     * @protected
     * @instance
     * @method addNode
     * @param {Position} pos
     */
    addNode(pos) {
        this.nodes.push(pos);
    }

    /**
     * Set the given position as the ground node
     * 
     * @protected
     * @instance
     * @method setGround
     * @param {Position} pos
     */
    setGround(pos) {
        if(!!this.ground)
            Utility.logger('Each circuit can only have one ground/reference node');

        this.ground = pos;
    }


    /**
     * Adds this circuit to the Board.circuits field
     * 
     * @protected
     * @instance
     * @method addToBoard
     */
    addToBoard() {
        if(!this.board)
            Utility.logger('Circuit: Board not found');

        if(!this.ground)
            Utility.logger('Circuit has no ground/reference node yet');

        // Separate ground node from other nodes by removing it from nodes field
        let groundIdx = this.nodes.findIndex((node) => node.toString() === this.ground.toString());
        if(groundIdx >= 0)
            this.nodes.splice(groundIdx, 1);

        this.board.addCircuit(this);
    }
}

module.exports = Circuit;