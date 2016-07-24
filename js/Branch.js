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
    }

    addR(R) {
        this.Rs.push(R);
    }

    addV(V) {
        this.Vs.push(V);
    }
}