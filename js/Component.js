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
    
    place(...positions) {
        if(hasDuplicatePositions(positions))
			logger('Pins of the same component cannot share the same slot.');
		
		this.pins = positions;
		
		if(!window.board)
	        logger('Board not found!');
		window.board.place(this, positions);
    }
    
    remove() {
        if(!window.board)
	        logger('Board not found!');
		window.board.remove(this);
    }   
    
    // Get all pins except the one given
    getOtherPins(pos) {
        return this.pins.filter((pinPos) => {
            return !(pinPos.toString() === pos.toString());
        });
    }
}