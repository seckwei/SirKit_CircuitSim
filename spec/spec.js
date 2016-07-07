'use strict';

describe('Sirkit', function() {
    
    beforeEach(function() {
        window.board_width = 100;
        window.board_height = 100;

        window.board = Board(board_width, board_height);
        window.slot = new Slot([0,0]);

        let num_of_components = 50;
        while (num_of_components-- !== 1) {
            window['wire' + num_of_components] = new Component({
                label: 'Wire' + num_of_components,
                type: ComponentType.Connector
            });
            window['batt' + num_of_components] = new Component({
                label: 'Battery' + num_of_components,
                type: ComponentType.Source
            });
            window['ground' + num_of_components] = new Component({
                label: 'Ground' + num_of_components,
                type: ComponentType.Ground,
                openEnded: true
            });
        }

        window.traverser = Traverser();
    });
    
    describe('Utility functions', function() {

        describe('isNumber()', function() {

            it('should return false for empty and non-empty string', function() {
                expect(Utility.isNumber('')).toBe(false);
                expect(Utility.isNumber(new String())).toBe(false);
                expect(Utility.isNumber('string')).toBe(false);
            });

            it('should return false for NaN, null and undefined', function() {
                expect(Utility.isNumber(NaN)).toBe(false);
                expect(Utility.isNumber(null)).toBe(false);
                expect(Utility.isNumber(undefined)).toBe(false);
            });

            it('should return false for object', function() {
                expect(Utility.isNumber({})).toBe(false);
                expect(Utility.isNumber(new Object())).toBe(false);
            });

            it('should return true for integer, float, and Number object', function() {
                expect(Utility.isNumber(3)).toBe(true);
                expect(Utility.isNumber(0.333)).toBe(true);
                expect(Utility.isNumber(new Number())).toBe(true);
            });

        });

        describe('logger()', function() {

            it('should throw an Error', function() {
                expect(Utility.logger).toThrowError();
            });

            it('should throw an Error with supplied message', function() {
                expect(Utility.logger.bind(null, 'custom message')).toThrowError('custom message');
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
                expect(Utility.hasDuplicatePositions(positions)).toBe(true);
            });

            it('should return false if duplicate positions are absent', function() {
                let positions = [
                    [0, 1],
                    [1, 1],
                    [0, 0],
                    [3, 3]
                ];
                expect(Utility.hasDuplicatePositions(positions)).toBe(false);
            });

        });
    });

    describe('Sirkit\'s Topological Prototype', function() {

        describe('Board object', function() {

            it('should have an object with a 2D array filled with "undefined" if width and height are passed in', function() {
                let emptyBoard = Array.apply(null, {
                    length: window.board_width
                });
                emptyBoard = emptyBoard.map(() => {
                    return Array.apply(null, {
                        length: window.board_height
                    });
                });
                expect(board.board).toEqual(emptyBoard);
            });
            
            it('getSlot() method should return the slot as specified by the array passed in', function(){
                expect(board.getSlot([0,0])).toBe(undefined); 
            });

            it('place() method should add Component into Slot specified by the pin positions', function() {
                // Place component's pin-0 into [0,0] and pin-1 into [1,1]
                wire1.place([0, 0], [1, 1]);

                let slot00_connections = board.board[0][0].connections,
                    slot11_connections = board.board[1][1].connections;

                expect(slot00_connections.get(wire1.id).component).toEqual(wire1);
                expect(slot11_connections.get(wire1.id).component).toEqual(wire1);

                expect(slot00_connections.get(wire1.id).pin).toBe(0);
                expect(slot11_connections.get(wire1.id).pin).toBe(1);
            });

            it('remove() method should remove Component from its Slot', function() {
                // Place component's pin-0 into [0,0] and pin-1 into [1,1]
                wire1.place([0, 0], [1, 1]);

                let slot00_connections = board.board[0][0].connections,
                    slot11_connections = board.board[1][1].connections;

                board.remove(wire1);
                expect(slot00_connections.size).toBe(0);
                expect(slot11_connections.size).toBe(0);
            });

            it('should keep track of occupied slots', function() {
                expect(board.occupiedSlots.size).toEqual(0);
                wire1.place([0, 0], [1, 1]);

                expect(board.occupiedSlots.size).toBe(2);
                expect(JSON.stringify(board.occupiedSlots.get('0,0')))
                    .toEqual(JSON.stringify(board.board[0][0]));

                wire1.remove();
                expect(board.occupiedSlots.size).toBe(0);
            });

            it('should keep track of components on the board', function() {
                wire1.place([0, 0], [1, 1]);
                wire2.place([2, 2], [2, 1]);

                expect(board.components.has(wire1.id)).toBe(true);
                expect(board.components.has(wire2.id)).toBe(true);

                wire1.remove();
                wire2.remove();

                expect(board.components.has(wire1.id)).toBe(false);
                expect(board.components.has(wire2.id)).toBe(false);
            });

            it('activeSources property should return all active source components on the board', function() {
                batt1.place([0, 0], [0, 1]);
                batt2.place([1, 0], [1, 1]);
                wire1.place([8, 8], [7, 7]);
                expect(board.activeSources).toEqual([batt1, batt2]);

                batt1.active = false;
                batt2.active = false;
                expect(board.activeSources).toEqual([]);
            });
            
            it('hasUnfinishedNode property should tell if the board has any true nodes that has not have all components traveled', function(){
                wire1.place([0,0], [1,1]);
                wire2.place([0,0], [2,1]);
                
                // [0,0] is not a true node yet, so should return false
                expect(board.hasUnfinishedNode).toBe(false);
                
                // [0,0] is a true node, but all wires traveled
                wire3.place([0,0], [3,1]);
                wire1.traveled = true;
                wire2.traveled = true;
                wire3.traveled = true;
                expect(board.hasUnfinishedNode).toBe(false);
                
                // Should return true if at least one of the components not yet traveled
                wire1.traveled = false;
                expect(board.hasUnfinishedNode).toBe(true);
            });
            
            it('hasType method should check if the type passed in exists on the board or not', function(){
                expect(board.hasType(ComponentType.Source)).toBe(false);
                expect(board.hasType(ComponentType.Ground)).toBe(false);
                
                batt1.place([0,0], [1,1]);
                expect(board.hasType(ComponentType.Source)).toBe(true);
                
                ground1.place([2,2], [3,3]);
                expect(board.hasType(ComponentType.Ground)).toBe(true);
            });
        });

        describe('Slot object', function() {

            it('should be initialised with only positive numbers', function() {
                let error_msg = 'x and y has to be positive numbers',
                    Slot_IIFE = (pos) => {
                        return () => {
                            new Slot(pos);
                        }
                    };

                expect(Slot_IIFE([0, -1])).toThrowError(error_msg);
                expect(Slot_IIFE([-1, 0])).toThrowError(error_msg);
                expect(Slot_IIFE([-1, -1])).toThrowError(error_msg);
                expect(Slot_IIFE(['b', ''])).toThrowError(error_msg);
                expect(Slot_IIFE([{}, []])).toThrowError(error_msg);

                expect(Slot_IIFE([0, 5])).not.toThrowError();
                expect(Slot_IIFE([0.333, 5.11])).not.toThrowError();
            });

            it('should floor x and y values when initialised', function() {
                let slot = new Slot([3.14159, 9.99]);
                expect(slot.x).toBe(3);
                expect(slot.y).toBe(9);
            });

            it('add() method should add the component id and the component itself to the\
            connections\'s Map with keys \'pin\' and \'object\' respectively', function() {
                slot.add(wire1, 0);

                expect(slot.connections.get(wire1.id).pin).toBe(0);
                expect(JSON.stringify(slot.connections.get(wire1.id).component)).toBe(JSON.stringify(wire1));
            });

            it('remove() method should remove that component from the slot', function() {
                slot.add(wire1, 0);
                slot.add(wire2, 0);
                slot.remove(wire1);

                expect(slot.connections.size).toBe(1);
                expect(slot.connections.get(wire1.id)).not.toBeDefined();
            });

            it('activeConnections property should return a Map of active components connected to it', function() {
                // Two wires connected
                wire1.place([0, 0], [0, 1]);
                wire2.place([0, 0], [1, 1]);

                expect(board.board[0][0].activeConnections.has(wire1.id)).toBe(true);
                expect(board.board[0][0].activeConnections.has(wire2.id)).toBe(true);

                // Deactivate wire 1
                wire1.active = false;

                expect(board.board[0][0].activeConnections.has(wire1.id)).toBe(false);
                expect(board.board[0][0].activeConnections.has(wire2.id)).toBe(true);
            });

            it('should have the correct count of components in it', function() {
                expect(slot.count).toBe(0);

                slot.add(wire1, 0);
                expect(slot.count).toBe(1);

                slot.add(wire2, 0);
                expect(slot.count).toBe(2);

                slot.remove(wire1);
                expect(slot.count).toBe(1);

                slot.remove(wire2);
                expect(slot.count).toBe(0);
            });

            it('should have the correct count of active components in it', function() {
                expect(slot.activeCount).toBe(0);

                slot.add(wire1, 0); // add component 1
                expect(slot.activeCount).toBe(1);

                wire1.active = false; // deactivate component 1
                expect(slot.activeCount).toBe(0);

                slot.add(wire2, 0); // add component 2
                expect(slot.activeCount).toBe(1);

                wire1.active = true; // re-activate component 1
                expect(slot.activeCount).toBe(2);
            })

            it('isTrueNode property should tell if the active components is >= 3', function() {
                expect(slot.isTrueNode).toBe(false);

                slot.add(wire1, 0);
                expect(slot.isTrueNode).toBe(false);

                slot.add(wire2, 0);
                expect(slot.isTrueNode).toBe(false);

                slot.add(wire3, 0);
                expect(slot.isTrueNode).toBe(true);
            });
            
            it('hasAllTraveled property should tell if all components in it has been traveled or not', function(){
                wire1.place([0,0], [1,1]);
                wire2.place([0,0], [2,2]);
                expect(board.board[0][0].hasAllTraveled).toBe(false);
                
                wire1.traveled = true;
                expect(board.board[0][0].hasAllTraveled).toBe(false);
                
                wire2.traveled = true;
                expect(board.board[0][0].hasAllTraveled).toBe(true);   
            });
            
            it('untraveledConnections property should return an array of untraveled connections', function(){
                wire1.place([0,0], [1,1]); 
                wire2.place([0,0], [1,1]);
                
                expect(board.board[0][0].untraveledConnections).toEqual([
                    {
                        pin: 0,
                        component: wire1
                    },
                    {
                        pin: 0,
                        component: wire2
                    }
                ]);
                
                wire1.traveled = true;
                wire2.traveled = true;
                
                expect(board.board[0][0].untraveledConnections).toEqual([]);
            });
        });

        describe('Component object', function() {

            it('should be placed into the right slots after calling place()', function() {
                wire1.place([0, 1], [1, 2]);
                expect(JSON.stringify(board.board[0][1].connections.get(wire1.id).component)).toBe(JSON.stringify(wire1));
                expect(JSON.stringify(board.board[1][2].connections.get(wire1.id).component)).toBe(JSON.stringify(wire1));
            });

            it('should be removed from the slots it was place into after calling remove()', function() {
                wire1.place([0, 1], [1, 2]);
                wire1.remove();
                expect(board.board[0][1].connections.size).toBe(0);
                expect(board.board[1][2].connections.size).toBe(0);
            });

            it('getOtherPins should return an array of all pins except the one passed in', function() {
                wire1.place([0, 0], [1, 1]);
                expect(wire1.getOtherPins([0, 0])).toEqual([
                    [1, 1]
                ]);
            });
        });
    });

    describe('Sirkit\'s Traverser Prototype', function() {

        describe('private method _deactivateOpenBranches()', function() {
            /*
                Branch with an open-end ends with a non-open-ended component.
                e.g. a resistor that is connected to a closed-circuit on one end but not on the other.
                
                Branch without an open-end ends with an open-ended component (e.g. ground) OR
                the branch is connected to a closed circuit on both ends.
            */
            it('should deactivate branches with an open-end', function() {
                // Components are non-open-ended and active by default
                wire1.place([0, 0], [0, 2]);

                // Three wires connected but has open ends
                wire2.place([1, 0], [1, 1]);
                wire3.place([1, 1], [2, 2]);
                wire4.place([2, 2], [3, 3]);

                let arr = [1, 2, 3, 4];

                for (let i of arr) {
                    expect(window['wire' + i].active).toBe(true);
                }

                traverser._deactivateOpenBranches(board);

                for (let i of arr) {
                    expect(window['wire' + i].active).toBe(false);
                }
            });

            it('should deactivate branches with an open-end, even though it has open-ended components', function() {
                // Connected to ground but wire 3 is open
                ground1.place([1, 1], [0, 0]);
                wire1.place([1, 1], [2, 2]);
                wire2.place([2, 2], [3, 3]);

                expect(ground1.active).toBe(true);
                expect(wire1.active).toBe(true);
                expect(wire2.active).toBe(true);

                traverser._deactivateOpenBranches(board);

                expect(ground1.active).toBe(false);
                expect(wire1.active).toBe(false);
                expect(wire2.active).toBe(false);
            });

            it('should NOT deactivate branches without an open-end', function() {
                // Closed circuit
                wire1.place([0, 0], [0, 2]);
                wire2.place([0, 2], [1, 2]);
                wire3.place([1, 2], [0, 0]);

                // Open ended component
                wire4.place([1, 2], [6, 6]);
                wire4.openEnded = true;

                // Open ended branch
                wire5.place([0, 2], [5, 5])

                let arr = [1, 2, 3, 4];

                // All components are active by default
                for (let i of arr) {
                    expect(window['wire' + i].active).toBe(true);
                }
                expect(wire5.active).toBe(true);

                traverser._deactivateOpenBranches(board);

                // Only those that are connected to each other (except for open-ended components) should be remain active
                for (let i of arr) {
                    expect(window['wire' + i].active).toBe(true);
                }
                expect(wire5.active).toBe(false);

            });
        });

        describe('private method _checkSourceExists()', function() {

            it('should throw error if there are no source components found on the board', function() {
                wire1.place([0, 0], [1, 1]);
                expect(traverser._checkSourceExists.bind(null, board)).toThrowError('No source component found!');
            });

            it('should not throw error if there is any source component on the board', function() {
                batt1.place([0, 0], [1, 1]);
                expect(traverser._checkSourceExists.bind(null, board)).not.toThrowError();
            });

        });
        
        describe('private method _checkGroundExists()', function() {

            it('should throw error if there are no source components found on the board', function() {
                wire1.place([0, 0], [1, 1]);
                expect(traverser._checkGroundExists.bind(null, board)).toThrowError('No ground component found!');
            });

            it('should not throw error if there is any source component on the board', function() {
                ground1.place([0, 0], [1, 1]);
                expect(traverser._checkGroundExists.bind(null, board)).not.toThrowError();
            });

        });

        describe('private method _checkClosedCircuit()', function() {

            it('should throw an error if the circuit is not closed', function() {
                // Circuit not closed, because battery is on an open-ended branch
                batt1.place([1, 1], [0, 2])
                wire1.place([0, 2], [0, 3]);
                wire2.place([1, 0], [0, 0]);
                wire3.place([2, 0], [2, 1]);
                ground1.place([2, 1], [2, 5]);

                expect(traverser._checkClosedCircuit.bind(null, board)).toThrowError('No closed circuit found');
                expect(board.closed).toBe(false);
            });

            it('should not throw an error if the circuit is closed', function() {
                // These three are connected to each other
                batt1.place([0, 0], [0, 1]);
                wire2.place([0, 1], [1, 1]);
                wire3.place([1, 1], [0, 0]);
                ground1.place([0, 0], [5, 5]);

                // One stray component
                wire4.place([4, 5], [5, 6]);
                
                expect(traverser._checkClosedCircuit.bind(null, board)).not.toThrowError();
                expect(board.closed).toBe(true);
                expect(batt1.traveled).toBe(true);
                expect(wire2.traveled).toBe(true);
                expect(wire3.traveled).toBe(true);
                expect(ground1.traveled).toBe(true);
                
                expect(wire4.traveled).toBe(false);
            });
            
            it('should work for circuits with nodes too', function() {
                let node1 = [2,5],
                    node2 = [6,5];
                
                batt1.place([2,2], [6,2]);
                wire1.place([2,2], node1);
                wire2.place(node1, [2,8]);
                wire3.place([6,2], node2);
                wire4.place(node2, [6,8]);
                wire5.place(node1, node2);
                wire6.place([2,8], [6,8]);
                ground1.place([6,8], [6,10]);
                
                /*  B+ ---wire1---+---wire2---+
                    |             |           |
                    |batt1        |wire5      |wire6
                    |             |           |
                    B- ---wire3---+---wire4---+---GND
                */
                
                expect(traverser._checkClosedCircuit.bind(null, board)).not.toThrowError();
                expect(batt1.traveled).toBe(true);
                expect(ground1.traveled).toBe(true);
                for(let i of [1,2,3,4,5,6]){
                    expect(window['wire'+i].traveled).toBe(true);
                }                
                expect(board.closed).toBe(true);
            });
            
            it('should work for more than one circuits', function(){
                // Circuit 1
                let node1 = [2,5],
                    node2 = [6,5];
                
                batt1.place([2,2], [6,2]);
                wire1.place([2,2], node1);
                wire2.place(node1, [2,8]);
                wire3.place([6,2], node2);
                wire4.place(node2, [6,8]);
                wire5.place(node1, node2);
                wire6.place([2,8], [6,8]);
                ground1.place([6,8], [6,10]);
                
                /*  B+ ---wire1---+---wire2---+
                    |             |           |
                    |batt1        |wire5      |wire6
                    |             |           |
                    B- ---wire3---+---wire4---+---GND
                */
                
                expect(traverser._checkClosedCircuit.bind(null, board)).not.toThrowError();
                expect(batt1.traveled).toBe(true);
                expect(ground1.traveled).toBe(true);
                for(let i of [1,2,3,4,5,6]){
                    expect(window['wire'+i].traveled).toBe(true);
                }
                
                // Circuit 2
                let node3 = [12,15],
                    node4 = [16,15];
                
                batt2.place([12,12], [16,12]);
                wire7.place([12,12], node1);
                wire8.place(node1, [12,18]);
                wire9.place([16,12], node2);
                wire10.place(node2, [16,18]);
                wire11.place(node1, node2);
                wire12.place([12,18], [16,18]);
                ground2.place([16,18], [16,20]);
                
                /*  B+ ---wire6---+---wire8---+
                    |             |           |
                    |batt2        |wire11     |wire12
                    |             |           |
                    B- ---wire9---+---wire10--+---GND
                */
                expect(traverser._checkClosedCircuit.bind(null, board)).not.toThrowError();
                expect(batt2.traveled).toBe(true);
                expect(ground2.traveled).toBe(true);
                for(let i of [7,8,9,10,11,12]){
                    expect(window['wire'+i].traveled).toBe(true);
                }
            });
        });
    });
});

/*
describe('',function(){

    it('should ', function(){});

});
*/
