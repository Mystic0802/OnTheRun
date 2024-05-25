import Player from './Player.js'

class OTRGame {
    constructor(gameDetails) {
        this.players = [];
        this.chaser = null;
        addNewPlayers(gameDetails.players);
    }

    addNewPlayers(playerDetails) {
        for (const [userId, playerName, isChaser] of playerDetails.entries()) {
            this.players.push(new Player(userId, playerName, isChaser));
        }
    }
}

export default OTRGame;