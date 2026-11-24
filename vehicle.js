var diameter = 50;
var currentDiameter = 50;
var maxDiameter = 250;
var growthSpeed = 0.002;

var fleeMultFactor = 1;
var multFactor = 1.5;

var factOrFiction = ["FACT", "fiction"];

function mousePressed() {
  multFactor = 1;
}

function mouseReleased() {
  multFactor = 2;
}

//creates vehicle object with properties
function Vehicle(x, y) {
  this.pos = createVector();
  // this.pos = createVector(random(width), random(height));
  this.target = createVector(x, y);
  this.vel = p5.Vector.random2D();
  this.acc = createVector();
  this.r = 2;
  this.maxspeed = 10;
  this.maxforce = 2;
  this.color;
  this.word = random(factOrFiction);
}

//sets vehicle behavior (i.e. gathering around mouse and stuff)
Vehicle.prototype.behaviors = function () {

  var mouse = createVector(mouseX, mouseY);

  var mouseMoving = false;

  if (mouseX != pmouseX || mouseY != pmouseY) {
    mouseMoving = true;
  }

  if (mouseMoving) {

    // Reset attraction radius
    currentDiameter = diameter;

    // Return to original position
    var arrive = this.arrive(this.target);
    this.applyForce(arrive);

  } else {

    // Gradually grow attraction radius
    if (currentDiameter < maxDiameter) {
      currentDiameter += growthSpeed;
    }

    var d = p5.Vector.dist(mouse, this.pos);

    if (d < currentDiameter) {

      // Gather toward mouse
      var flee = this.flee(mouse);
      flee.mult(fleeMultFactor);
      this.applyForce(flee);

    } else {

      // Return to original position
      var arrive = this.arrive(this.target);
      this.applyForce(arrive);

    }
  }
};

Vehicle.prototype.applyForce = function(f) {
  this.acc.add(f);
};

Vehicle.prototype.update = function() {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
};

Vehicle.prototype.show = function() {
  fill(255);
  noStroke();
  fill(0);
  text(this.word, this.pos.x, this.pos.y);
};

Vehicle.prototype.arrive = function(target) {
  var desired = p5.Vector.sub(target, this.pos);
  var d = desired.mag();
  var speed = this.maxspeed;

  if (d < 100) {
    speed = map(d, 0, 300, 0, this.maxspeed);
  }

  desired.setMag(speed);

  var steer = p5.Vector.sub(desired, this.vel);
  steer.limit(this.maxforce);

  return steer;
};

Vehicle.prototype.flee = function(target) {
  var desired = p5.Vector.sub(target, this.pos);
  var d = desired.mag();

  if (d < currentDiameter) {
    desired.setMag(this.maxspeed);
    desired.mult(multFactor);

    var steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxforce);

    return steer;
  } else {
    return createVector(0, 0);
  }
};