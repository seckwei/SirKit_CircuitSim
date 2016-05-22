'use strict';

let Traverser = function Traverser() {

    // To deactivate all open-ended branches
    function deactivateOpenBranches(board) {
        let otherPos = [];
        board.occupiedSlots.forEach((slot) => {
            deactivateOpenEnds(board, slot);
        });
    }
    
    // Given a slot, we see if the component connected to it needs deactivating or not
    function deactivateOpenEnds(board, slot) {
        if (slot.count === 1) {
            let component = slot.connections.values()   // returns @@iterator that contains values
                            .next().value               // getting the only value in that Map
                            .object,                    // getting that component
                otherPins = component.getOtherPins([slot.x, slot.y]);

            if (!component.openEnded && component.active) {
                component.active = false;
                otherPins.forEach((pos) => {
                    deactivateOpenEnds(board, board.board[pos[0]][pos[1]]);
                });
            } else {
                return; // component is open-ended, no need to deactivate branch
                // To do: How to we handle isolated branches with open-ended component?
            }
        }
    }

    function start(board) {
        deactivateOpenBranches(board);
    }

    return {
        start: start,
        _deactivateOpenBranches: deactivateOpenBranches
    };
}