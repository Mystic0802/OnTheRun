using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace OnTheRun.GameObjects.Services
{
    public class GameService
    {
        //private readonly IHubContext<GameHub> _hubContext;
        private readonly GameSessionManager gameSessionManager;

        //public GameService(IHubContext<GameHub> hubContext, GameSessionManager gameSessionManager)
        //{
        //    _hubContext = hubContext;
        //    _gameSessionManager = gameSessionManager;
        //}

        public GameService(GameSessionManager gameSessionManager)
        {
            this.gameSessionManager = gameSessionManager;
        }

        public bool IsValidGameId(string gameId)
        {
            return gameSessionManager.GetGame(gameId) != null;
        }

        public void JoinGame(string gameId, string playerName)
        {
            var gameSession = gameSessionManager.GetGame(gameId);
            if (gameSession == null)
                throw new HubException("Game not found.");

            if (gameSession.CurrentState != GameState.Lobby)
                throw new HubException("Game has started");

            Player player;
            lock (gameSession)
            {
                if (gameSession.Players.Count() >= gameSession.MaxPlayers)
                    throw new HubException("Max players reached.");

                player = new Player(playerName);
                gameSession.AddPlayer(player);
            }
            //await _hubContext.Clients.Group(gameId).SendAsync("GameStarted");
        }
    }
}
