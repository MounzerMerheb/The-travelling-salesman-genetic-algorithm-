let SVG = document.getElementById("SVG");
const containerBGColor = "white";
const nbOfCities = 12;
// let cities = [
//   [345, 70],
//   [265, 372],
//   [374, 383],
//   [450, 364],
//   [230, 115],
//   [246, 404],
//   [295, 399],
//   [299, 175],
//   [372, 254],
//   [56, 430],
//   [214, 240],
//   [168, 292],
// ];
let cities = [];
let population = [];
let fitness = [];
let generations = 10000;

let recordDistance = Infinity;
let bestPopulationEver;

const genCount = document.getElementsByClassName("gen-nb")[0];
const totalGen = document.getElementsByClassName("total-gen")[0];
totalGen.innerHTML = generations;
const distanceText = document.getElementsByClassName("distance")[0];

init();
loop();

async function loop() {
  let i = 0;
  while (i < generations) {
    calcFitness();
    normalizeFitness();
    drawOrder(bestPopulationEver);
    nextGeneration();
    distanceText.innerHTML = Math.floor(recordDistance);
    genCount.innerHTML = i + 1;
    i++;
    await delay(1);
  }
}

function init() {
  let initPopulationOrder = [];
  for (let i = 0; i < nbOfCities; i++) {
    createCity();
    // createCity2(cities[i][0], cities[i][1]);
    initPopulationOrder[i] = i;
  }
  for (let i = 0; i < 1000; i++) {
    population[i] = [...initPopulationOrder];
    population[i].sort(() => Math.random() - 0.5);
  }
}
function createCity2(x, y) {
  let city = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  city.setAttribute("cx", x);
  city.setAttribute("cy", y);
  city.setAttribute("r", "7");
  city.setAttribute("fill", containerBGColor);

  SVG.appendChild(city);
}
function nextGeneration() {
  let newPopulation = [];
  for (let i = 0; i < population.length; i++) {
    let orderA = selection();
    let orderB = selection();
    let order = partiallyMappedCrossover(orderA, orderB);
    mutation(order, 0.1);
    newPopulation[i] = order;
  }
  population = newPopulation;
}

function partiallyMappedCrossover(parent1, parent2) {
  let length = parent1.length;
  let offspring = new Array(length).fill(null);

  let point1 = Math.floor(Math.random() * length);
  let point2 = Math.floor(Math.random() * length);
  if (point1 > point2) {
    [point1, point2] = [point2, point1];
  }

  for (let i = point1; i <= point2; i++) {
    offspring[i] = parent1[i];
  }

  for (let i = point1; i <= point2; i++) {
    if (!offspring.includes(parent2[i])) {
      let index = parent2.indexOf(parent1[i]);
      while (point1 <= index && index <= point2) {
        index = parent2.indexOf(parent1[index]);
      }
      offspring[index] = parent2[i];
    }
  }

  for (let i = 0; i < length; i++) {
    if (offspring[i] === null) {
      offspring[i] = parent2[i];
    }
  }

  return offspring;
}

function selection() {
  let index = 0;
  let r = Math.random();
  while (r > 0) {
    r -= fitness[index];
    index++;
  }
  index--;
  return population[index].slice();
}

function mutation(order, mutationRate) {
  for (let i = 0; i < order.length; i++) {
    let r = Math.random();
    if (r < mutationRate) {
      let indexA = random(0, order.length - 1);
      let indexB = random(0, order.length - 1);
      swap(order, indexA, indexB);
    }
  }
}

function swap(array, i, j) {
  let t = array[i];
  array[i] = array[j];
  array[j] = t;
}

function calcFitness() {
  for (let i = 0; i < population.length; i++) {
    let distance = calcDistanceInOrder(population[i]);
    if (distance < recordDistance) {
      recordDistance = distance;
      bestPopulationEver = population[i];
    }
    fitness[i] = 1 / (distance + 1);
  }
}

function normalizeFitness() {
  let sum = 0;
  for (let i = 0; i < fitness.length; i++) {
    sum += fitness[i];
  }
  for (let i = 0; i < fitness.length; i++) {
    fitness[i] = fitness[i] / sum;
  }
}

function isCityOverlapping(x, y) {
  for (var i = 0; i < cities.length; i++) {
    var circle = cities[i];
    var dx = x - circle[0];
    var dy = y - circle[1];
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 14) {
      return true;
    }
  }
  return false;
}

function createCity() {
  let x = random(50, 450);
  let y = random(50, 450);
  while (isCityOverlapping(x, y)) {
    x = random(50, 450);
    y = random(50, 450);
  }
  cities.push([x, y]);

  let city = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  city.setAttribute("cx", x);
  city.setAttribute("cy", y);
  city.setAttribute("r", "7");
  city.setAttribute("fill", containerBGColor);

  SVG.appendChild(city);
}

function createPathBetweenTwoCities(i, j) {
  var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  let x1 = cities[i][0];
  let y1 = cities[i][1];
  let x2 = cities[j][0];
  let y2 = cities[j][1];

  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);

  SVG.appendChild(line);
}

function calcDistanceInOrder(order) {
  let fullDistance = 0;
  for (let i = 0; i < cities.length - 1; i++) {
    let cityA = cities[order[i]];
    let cityB = cities[order[i + 1]];
    let dx = cityA[0] - cityB[0];
    let dy = cityA[1] - cityB[1];
    let distance = Math.sqrt(dx * dx + dy * dy);
    fullDistance += distance;
  }
  let dx = cities[order[cities.length - 1]][0] - cities[order[0]][0];
  let dy = cities[order[cities.length - 1]][1] - cities[order[0]][1];
  fullDistance += Math.sqrt(dx * dx + dy * dy);
  return fullDistance;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawOrder(order) {
  let oldLines = document.querySelectorAll("svg > line");
  oldLines.forEach((line) => {
    line.remove();
  });
  for (let i = 0; i < order.length - 1; i++) {
    createPathBetweenTwoCities(order[i], order[i + 1]);
  }
  createPathBetweenTwoCities(order[order.length - 1], order[0]);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
