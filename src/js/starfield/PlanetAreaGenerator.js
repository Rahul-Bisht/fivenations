import CloudGenerator from './CloudGenerator';
import PlanetGenerator from './PlanetGenerator';
import SpaceObjectGenerator from './SpaceObjectGenerator';

function PlanetAreaGenerator(deepSpaceLayer) {
    SpaceObjectGenerator.call(this, deepSpaceLayer);
}

PlanetAreaGenerator.prototype = Object.create(SpaceObjectGenerator.prototype);
PlanetAreaGenerator.prototype.constructor = PlanetAreaGenerator;

PlanetAreaGenerator.prototype.generate = function() {
    SpaceObjectGenerator.prototype.generate.call(this);
    this.createPlanet();
    this.createClouds();
}

PlanetAreaGenerator.prototype.createPlanet = function() {
    var generator = new PlanetGenerator(this.deepSpaceLayer);
    generator.generate();
    generator.getSpaceObjects().forEach(function(obj){
        this.addSpaceObject(obj);
    }.bind(this));
};

PlanetAreaGenerator.prototype.createClouds = function() {
    var generator = new CloudGenerator(this.deepSpaceLayer);
    generator.generate(0.25);
    generator.getSpaceObjects().forEach(function(obj){
        this.addSpaceObject(obj);
    }.bind(this));
}

export default PlanetAreaGenerator;
