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

        public async Task SwitchTeam(string gameId, string playerName, bool isChaser = false)
        {
            var gameSession = _gameSessionManager.GetGame(gameId);
            if (gameSession == null)
                throw new HubException("Game not found.");

            if (!gameSession.Players.Any())
                throw new HubException("No players found.");

            var player = gameSession.Players.FirstOrDefault(p => p.Name == playerName, null);
            if (player == null)
                throw new HubException($"'{playerName}' not found");


            player.IsChaser = isChaser;
            await _hubContext.Clients.Group(gameId).SendAsync("SwitchTeam", player);
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
