/**
 * Node module
 * @property {Position} position    The position of this node
 * @property {Branch[]} branches    
 * @property {string}	KCL
 * 
 * @module Node
 */
class Node {
    constructor(position){
        if(!position || !(position instanceof Array))
            Utility.logger('Node needs to be initiliased with a position passed in');

        this.id = Node.getID();
        this.position = position;
        this.branches = [];
        this.KCL = undefined;
    }

    addBranch(branch){
        this.branches.push(branch);
    }
}

Node.counter = 0;

Node.resetCounter = function() {
    Node.counter = 0;
};

Node.getID = function() {
    return 'N' + (Node.counter++);
};

module.exports = Node;