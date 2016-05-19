'use strict';

describe('Utility functions', function() {

    describe('isNumber()', function() {

        it('should return false for empty and non-empty string', function() {
            expect(isNumber('')).toBe(false);
            expect(isNumber(new String())).toBe(false);
            expect(isNumber('string')).toBe(false);
        });

        it('should return false for NaN, null and undefined', function() {
            expect(isNumber(NaN)).toBe(false);
            expect(isNumber(null)).toBe(false);
            expect(isNumber(undefined)).toBe(false);
        });

        it('should return false for object', function() {
            expect(isNumber({})).toBe(false);
            expect(isNumber(new Object())).toBe(false);
        });

        it('should return true for integer, float, and Number object', function() {
            expect(isNumber(3)).toBe(true);
            expect(isNumber(0.333)).toBe(true);
            expect(isNumber(new Number())).toBe(true);
        });

    });

    describe('objectToArray()', function() {

        it('should convert object to array type', function() {
            expect(objectToArray({})).toEqual([]);
            expect(objectToArray({}) instanceof Array).toBe(true);
            expect(objectToArray({})).not.toEqual({});
        });

        it('should conver array-like objects to array with the values retained', function() {
            (function() {
                expect(objectToArray(arguments)).toEqual([1, 2, 3]);
            })(1, 2, 3);
        });
    });

    describe('logger()', function() {

        it('should throw an Error', function() {
            expect(logger).toThrowError();
        });

        it('should throw an Error with supplied message', function() {
            expect(logger.bind(null, 'custom message')).toThrowError('custom message');
        });

    });

    describe('hasDuplicatePositions()', function() {

        it('should return true if duplicate positions are present', function() {
            let positions = [
                [0, 0],
                [1, 1],
                [0, 0],
                [3, 3]
            ];
            expect(hasDuplicatePositions(positions)).toBe(true);
        });

        it('should return false if duplicate positions are absent', function() {
            let positions = [
                [0, 1],
                [1, 1],
                [0, 0],
                [3, 3]
            ];
            expect(hasDuplicatePositions(positions)).toBe(false);
        });

    });
});

describe('Sirkit\'s Topological Prototype', function() {

    beforeEach(function() {
        window.board = Board(2, 3);
        window.slot = Slot(0, 0);
        
        for(let i of [1,2,3]){
            window['cmpt'+i] = Component({ label: 'Component'+i });
        }
    });

    describe('Board object', function() {

        it('should return an object with 2D array with undefined values if provided width and height', function() {
            let emptyBoard = [new Array(3), new Array(3)];
            expect(board.board).toEqual(emptyBoard);
        });

        it('Board.place() should add Component into Slot specified by the pin positions', function() {
            // Place component's pin-0 into [0,0] and pin-1 into [1,1]
            cmpt1.place([0, 0], [1, 1]);

            let slot00_connections = board.board[0][0].connections,
                slot11_connections = board.board[1][1].connections;

            expect(slot00_connections.get(cmpt1.id).object).toEqual(cmpt1);
            expect(slot11_connections.get(cmpt1.id).object).toEqual(cmpt1);

            expect(slot00_connections.get(cmpt1.id).pin).toBe(0);
            expect(slot11_connections.get(cmpt1.id).pin).toBe(1);
        });

        it('Board.remove() should remove Component from its Slot', function() {
            // Place component's pin-0 into [0,0] and pin-1 into [1,1]
            cmpt1.place([0, 0], [1, 1]);

            let slot00_connections = board.board[0][0].connections,
                slot11_connections = board.board[1][1].connections;

            board.remove(cmpt1);
            expect(slot00_connections.size).toBe(0);
            expect(slot11_connections.size).toBe(0);
        });

    });

    describe('Slot object', function() {

        it('should be initialised with only positive numbers', function() {
            let error_msg = 'x and y has to be positive numbers';
            expect(Slot.bind(null, 0, -1)).toThrowError(error_msg);
            expect(Slot.bind(null, -1, 0)).toThrowError(error_msg);
            expect(Slot.bind(null, -1, -1)).toThrowError(error_msg);
            expect(Slot.bind(null, 'b', '')).toThrowError(error_msg);
            expect(Slot.bind(null, {}, [])).toThrowError(error_msg);

            expect(Slot.bind(null, 0, 5)).not.toThrowError();
            expect(Slot.bind(null, 0.333, 5.11)).not.toThrowError();
        });

        it('should floor x and y values when initialised', function() {
            let slot = Slot(3.14159, 9.99);
            expect(slot.x).toBe(3);
            expect(slot.y).toBe(9);
        });

        it('Slot.add() should add the component id and the component itself to the\
            connections\'s Map with keys \'pin\' and \'object\' respectively', function() {
            slot.add(cmpt1, 0);

            expect(slot.connections.get(cmpt1.id).pin).toBe(0);
            expect(JSON.stringify(slot.connections.get(cmpt1.id).object)).toBe(JSON.stringify(cmpt1));
        });

        it('Slot.remove() should remove that component from the slot', function() {
            slot.add(cmpt1, 0);
            slot.add(cmpt2, 0);
            slot.remove(cmpt1);

            expect(slot.connections.size).toBe(1);
            expect(slot.connections.get(cmpt1.id)).not.toBeDefined();
        });

        it('should have the correct count of components in it', function() {
            expect(slot.count).toBe(0);

            slot.add(cmpt1, 0);
            expect(slot.count).toBe(1);

            slot.add(cmpt2, 0);
            expect(slot.count).toBe(2);

            slot.remove(cmpt1);
            expect(slot.count).toBe(1);

            slot.remove(cmpt2);
            expect(slot.count).toBe(0);
        });

        it('should have the correct count of active components in it', function() {
            expect(slot.activeCount).toBe(0);

            slot.add(cmpt1, 0); // add component 1
            expect(slot.activeCount).toBe(1);

            cmpt1.active = false; // deactivate component 1
            expect(slot.activeCount).toBe(0);

            slot.add(cmpt2, 0); // add component 2
            expect(slot.activeCount).toBe(1);

            cmpt1.active = true; // re-activate component 1
            expect(slot.activeCount).toBe(2);
        })

        it('isTrueNode should return true if the active components is >= 3', function() {
            expect(slot.isTrueNode).toBe(false);
            
            slot.add(cmpt1, 0);
            expect(slot.isTrueNode).toBe(false);
            
            slot.add(cmpt2, 0);
            expect(slot.isTrueNode).toBe(false);
            
            slot.add(cmpt3, 0);
            expect(slot.isTrueNode).toBe(true);
        });
    });
    
    describe('Component object',function(){
        
        it('should be placed into the right slots after calling place()', function(){
            cmpt1.place([0,1], [1,2]);
            expect(JSON.stringify(board.board[0][1].connections.get(cmpt1.id).object)).toBe(JSON.stringify(cmpt1));
            expect(JSON.stringify(board.board[1][2].connections.get(cmpt1.id).object)).toBe(JSON.stringify(cmpt1));
        });
        
        it('should be removed from the slots it was place into after calling remove()', function(){
            cmpt1.place([0,1], [1,2]);
            cmpt1.remove();
            expect(board.board[0][1].connections.size).toBe(0);
            expect(board.board[1][2].connections.size).toBe(0);
        });
    });
});

/*
describe('',function(){

    it('should ', function(){});

});
*/