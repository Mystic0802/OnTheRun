import OTRGame from '../../GameFiles/OTRGame';

class GameManager {
    constructor() {
        this.games = new Map();
    }

    newGame(gameDetails) {
        if (gameDetails === undefined) {
            throw new Error('gameDetails was undefined.');
        }
        const uuid = self.crypto.randomUUID();
        this.addGame(uuid)
    }

    addGame(gameId, gameDetails) {
        if (this.games.has(gameId)) {
            throw new Error('Game with this ID already exists.');
        }
        const newGame = new OTRGame(gameDetails);
        this.games.set(gameId, newGame);
        return newGame;
    }

    startGame(gameId) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new Error('Game with this ID does not exist.');
        }
        game.start(); 
    }

    endGame(gameId) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new Error('Game with this ID does not exist.');
        }
        game.end();
        this.games.delete(gameId);
    }

    getGame(gameId) {
        if (!this.games.has(gameId)) {
            throw new Error('Game with this ID does not exist.');
        }
        return this.games.get(gameId);
    }
}