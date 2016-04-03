Documentation
=============

## Problem #1
> If your finger touches your hand, does your hand feel your finger first, or the other way round?

Assuming the following code:
```javascript
var batt = new Battery(),
    wire = new Wire();
      
batt.P.to(wire.A); // battery's 'Positive' end connect-to wire's 'A' end
// in the reality, this should be have the same effects as "wire.A.to(batt.P)"
```
In other words, when one end of a wire is placed on top of the battery's end, which one should be "connected" to the other? Which one should change the state of the other, or both?

### Solution: 
Instead of one end connecting to the other, we have a middle-person to handle the connections - a slot, or position of a grid.
Now, the code would look something more like this (assuming there's a grid object that "owns" the coordinates)
```javascript
var batt = new Battery(),
    wire = new Wire();
    
batt.P.to(1,1); // to(x,y) - coordinates of a grid or board
wire.A.to(1,1);
```
If you think about it now, the grid object can then store / manipulate the states for both the components to interact with!


## Problem #2

Now that I know how components can 'connect', I still don't know how to put a lot of things together
i.e. how are we going to calculate the voltage, conductance, etc? The major obstacle I have for this project is my lack of (or almost negligible) experience
and understanding in the field of electrical / electronic. The good thing is that there are tons of resources online such as the conceptual
way of how circuit sims work (see Rousources Section, too lazy to reference anything at this point).

### Solution:

After doing some reading, I realised that there are just a *whole lot* more than Ohm's Law and Kirchoff's Law to developing a complete circuit sim.
One of the things for me to learn is **Nodal Analysis** + Gaussian Elimination (to solve the system of linear equations from it). However, Nodal Analysis
will not be enough since it's just for DC Analysis only. Either way, this is still a good start for me to take on this project.

## Resources

1. [How do Circuit Simulators actually work?](https://electronics.stackexchange.com/questions/91416/how-do-circuit-simulators-actually-work/91437#91437?newreg=6cdfc012e3d74ac08ddb38d4c5ca9844)
2. [SPICE ALGORITHM OVERVIEW](http://www.ecircuitcenter.com/SpiceTopics/Overview/Overview.htm)
3. [Nodal Analysis](http://mathonweb.com/help/backgd5.htm)

## Other Circuit Sims (or the like)

1. [Falstad's](http://www.falstad.com/circuit)
2. [EveryCircuit](http://everycircuit.com/)
3. [DC/ACLab](http://dcaclab.com/en/home)
4. [Krets](https://github.com/hraberg/krets) - Has load of external links too
5. [Adobe 123D Circuits](https://123d.circuits.io/) - Them graphics + Programmable Arduino = Mind blown