'use strict';

let Traverser = function Traverser() {

    // Private - To deactivate all open-ended branches
    function deactivateOpenBranches(board) {
        let otherPos = [];
        board.occupiedSlots.forEach((slot) => {
            deactivateOpenEnds(board, slot);
        });
    }
    
    // Private - Given a slot, we see if the component connected to it needs deactivating or not
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

    // Private - Error if no source component found
    function checkSourceExists(board) {
        if(!board.hasType(ComponentType.Source)){
            throw new Error('No source component found!');
        }
    }
    
    // Private - Error if no source component found
    function checkGroundExists(board) {
        if(!board.hasType(ComponentType.Ground)){
            throw new Error('No ground component found!');
        }
    }
    
    // Private - Report if circuit is not closed
    function checkClosedCircuit(board) {
        checkSourceExists(board);
        //checkGroundExists(board);
        deactivateOpenBranches(board);
        
        // We have to find a list of active Sources, so we can start traversing!
        let activeSources = board.activeSources;
        
        // The source component might be deactivated due to being on an open branch
        // so that counts as an open circuit too
        if(activeSources.length === 0){
            throw new Error('Closed circuit not found');
        }
        
        // Start traversal for each source components
        activeSources.forEach((source)=>{
            traverseSource(board, source);
        });
    }
    
    function traverseSource(board, source) {
        if(source.traveled){
            return;
        }
        source.traveled = true;

        let positivePinPos = source.pins[0],
            negativePinPos = source.pins[1],
            currentPos = positivePinPos;

        let nodeTrace = [];
        
        console.log('START OF TRAVERSAL');
        
        checkBackAtSource(board, currentPos);
        
        function checkBackAtSource(board, pos) {
            // yes, mark closed then find unfinishedNode
            if(pos.toString() === negativePinPos.toString()){
                board.closed = true;
                findUnfinishedNode(board);
            }
            // no, isTrueNode
            else {
                checkTrueNode(board, pos);
            }
        };
        
        function findUnfinishedNode(board) {
            // yes, backToLastNode
            if(board.hasUnfinishedNode){
                backToLastNode(board);
            }
            // no, end traversal
            else {
                console.log('END OF TRAVERSAL', nodeTrace);
                return true;
            }
        }
        
        function backToLastNode(board) {
            let lastNodePos = nodeTrace[nodeTrace.length-1];
            findUntraveledConnections(board, lastNodePos);
        }
        
        function findUntraveledConnections(board, pos) {
            debugger;
            let connection = board.getSlot(pos).untraveledConnections[0];
            // yes, pickAnyConnection
            if(!!connection){
                let nextPos = connection.component.pins[connection.pin];
                
                connection.component.traveled = true;
                goNextSlot(board, nextPos);
            }
            // no, popNodeTrace
            else {
                nodeTrace.pop();
                findUnfinishedNode(board);
            }
        }
        
        function checkTrueNode(board, pos) {
            // yes, existsInTrace
            if(board.getSlot(pos).isTrueNode){
                existsInTrace(board, pos);
            }
            // no, goNextSlot
            else {
                let connection = board.getSlot(pos).untraveledConnections[0],
                    nextPos = connection.component.getOtherPins(pos)[0];
                
                connection.component.traveled = true;
                goNextSlot(board, nextPos);
            }
        }
        
        function existsInTrace(board, pos) {
            // yes, backToLastNode
            if(nodeTrace.find((node) => node.toString() === pos.toString())){
                backToLastNode(board);
            }
            // no, pushNodeTrace
            else {
                nodeTrace.push(pos);
                
                let connection = board.getSlot(pos).untraveledConnections[0],
                    component = connection.component,
                    nextPos = component.getOtherPins(component.pins[connection.pin])[0];
                
                component.traveled = true;
                goNextSlot(board, nextPos);
            }
        }
        
        function goNextSlot(board, nextPos) {
            checkBackAtSource(board, nextPos);
        }
    }
    
    // Public
    function start(board) {
        checkSourceExists(board);
        deactivateOpenBranches(board);
    }

    return {
        start: start,
        _checkSourceExists: checkSourceExists,
        _checkGroundExists: checkGroundExists,
        _deactivateOpenBranches: deactivateOpenBranches,
        _checkClosedCircuit: checkClosedCircuit
    };
}