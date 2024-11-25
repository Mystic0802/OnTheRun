using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace OnTheRun.GameObjects.Services
{
    public class GameService
    {
        private readonly IHubContext<GameHub> _hubContext;
        private readonly GameSessionManager _gameSessionManager;

        public GameService(IHubContext<GameHub> hubContext, GameSessionManager gameSessionManager)
        {
            _hubContext = hubContext;
            _gameSessionManager = gameSessionManager;
        }

        public bool IsValidGameId(string gameId)
        {
            return _gameSessionManager.GetGame(gameId) != null;
        }

        public async Task StartGame(string gameId)
        {
            var gameSession = _gameSessionManager.GetGame(gameId);
            if (gameSession == null)
                throw new HubException("Game not found.");

            gameSession.StartGame();
            await _hubContext.Clients.Group(gameId).SendAsync("GameStarted");
        }
    }
}
