/**
 * Branch module
 * @property {number[]} R
 * @property {number[]} V
 * 
 * @module Branch
 */
class Branch {
    constructor(){
        this.Rs = [];
        this.Vs = [];

        this.start = '';
        this.end = '';
    }

    addR(R) {
        this.Rs.push(R);
    }

    addV(V) {
        this.Vs.push(V);
    }

    setStart(nodeID) {
        this.start = nodeID;
    }

    setEnd(nodeID) {
        this.end = nodeID;
    }
}

module.exports = Branch;