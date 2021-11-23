const view = {
    displayMessage: function(msg) {
        let messageArea = document.getElementById('messageArea');
        
        messageArea.innerHTML = msg;
    },
    displayHit: function(location) {
        let locationItem = document.getElementById(location);

        locationItem.setAttribute('class', 'hit not-allowed');
    },
    displayMiss: function(location) {
        let locationItem = document.getElementById(location);

        locationItem.setAttribute('class', 'miss not-allowed');
    },
};

const model = {
    boardSize: 7,
    numShips: 6,
    shipsSunk: 0,
    ships: [{locations: [0, 0, 0], hits: ['', '', ''], shipLength: 3},
            {locations: [0, 0, 0], hits: ['', '', ''], shipLength: 3},
            {locations: [0, 0], hits: ['', ''], shipLength: 2},
            {locations: [0, 0], hits: ['', ''], shipLength: 2},
            {locations: [0], hits: [''], shipLength: 1},
            {locations: [0], hits: [''], shipLength: 1},
        ],
    fire: function(guess) {
        for (let i = 0; i < this.numShips; i += 1) {
            let ship = this.ships[i];
            let index = ship.locations.indexOf(guess);

            if (index >= 0) {
                ship.hits[index] = 'hit';
                view.displayHit(guess);
                view.displayMessage('HIT!');
                if (this.isSunk(ship)) {
                    view.displayMessage('You sank my battleship!');
                    this.shipsSunk += 1;
                };
                return true;
            };
        };
        view.displayMiss(guess);
        view.displayMessage('You missed');
        return false;
    },
    isSunk: function(ship) {
        for (let i = 0; i < ship.shipLength; i += 1) {
            if (ship.hits[i] !== 'hit') {
                return false;
            };
        };
        return true;
    },
    generateAreaAroundShip: function(locations) {
        let areaAroundShip = [];
        let result;

        for(let location of locations) {
            let row = Number(location[0]);
            let col = Number(location[1]);

            areaAroundShip.push(row + '' + (col + 1));
            areaAroundShip.push(row + '' + (col - 1));
            areaAroundShip.push((row + 1) + '' + col);
            areaAroundShip.push((row - 1) + '' + col);
            areaAroundShip.push((row - 1) + '' + (col - 1));
            areaAroundShip.push((row + 1) + '' + (col + 1));
            areaAroundShip.push((row - 1) + '' + (col + 1));
            areaAroundShip.push((row + 1) + '' + (col - 1));
        };
        result = Array.from(new Set(areaAroundShip));
        return result.sort().filter(elem => elem.length < 3);
    },
    generateShipLocations: function() {
        let locations;
        let areaAroundShip;

        for (let i = 0; i < this.numShips; i += 1) {
            do {
                locations = this.generateShip(this.ships[i].shipLength);
            } while (this.collision(locations));
            this.ships[i].locations = locations;

            areaAroundShip = model.generateAreaAroundShip(locations).concat(locations);

            for (let location of areaAroundShip) {
                freeLocations = freeLocations.filter(elem => elem !== (location));
            };
        };
    },
    generateShip: function(shipLength) {
        let direction = Math.floor(Math.random() * 2);
        let firstPoint = freeLocations[Math.floor(Math.random() * freeLocations.length)];
        let row = Number(firstPoint[0]);
        let col = Number(firstPoint[1]);
        let newShipLocations = [];

        for (let i = 0; i < shipLength; i += 1) {
            if (direction === 1) {
                newShipLocations.push(row + '' + (col + i));
            } else {
                newShipLocations.push((row + i) + '' + col);
            };
        };
        return newShipLocations;
    },
    collision: function(locations) {
        for (let i = 0; i < this.numShips; i += 1) {
            for (let j = 0; j < locations.length; j += 1) {
                if (freeLocations.indexOf(locations[j]) < 0) {
                    return true;
                };
            };
        };
        return false;
    },
};

const controller = {
    guesses: 0,
    processGuess: function(guess) {
        let location = guess;

        if (location) {
            this.guesses += 1;
            let hit = model.fire(location);

            if (hit && model.shipsSunk === model.numShips) {
                view.displayMessage('You sank all my battleships, in ' + this.guesses + ' guesses');
            };
        };
    },
};

function giveFreeLocations() {
    let allLocations = document.getElementsByTagName('td');
    let freeLocations = [];

    for (let i = 0; i < allLocations.length; i += 1) {
        freeLocations.push(allLocations[i].id);
    };
    return freeLocations;
};

let freeLocations = giveFreeLocations();

function parseGuess(guess) {
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    if (guess === null || guess.length !== 2) {
        alert('Oops, please enter a letter and a number on the board.');
    } else {
        const firstChar = guess.charAt(0);
        let row = alphabet.indexOf(firstChar.toUpperCase());
        let column = guess.charAt(1);

        if (isNaN(row) || isNaN(column)) {
            alert('Oops, that isn\'t on the board');
        } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
            alert('Oops, that\'s off the board!');
        } else {
            return row + column;
        }
    }
    return null;
};

const init = () => {
    let fireButton = document.getElementById('fireButton');
    
    fireButton.onclick = handleFireButton;
    model.generateShipLocations();
};

const handleFireButton = () => {
    let guessInput = document.getElementById('guessInput');
    let guess = guessInput.value;

    controller.processGuess(parseGuess(guess));
    guessInput.value = '';
};

let clickInputs = document.getElementsByTagName('td');

for (var i = 0; i < clickInputs.length; i += 1) {
    clickInputs[i].addEventListener('click', fireOnClick);
};

function fireOnClick() {
    let guessInput = document.getElementById('guessInput');

    guessInput.value = this.id;
    controller.processGuess(this.id);
};

window.onload = init;