using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace OnTheRun.GameObjects
{
    public class GameHub : Hub
    {
        private readonly GameSessionManager _gameSessionManager;

        public GameHub(GameSessionManager gameSessionManager)
        {
            _gameSessionManager = gameSessionManager;
        }

        public async Task JoinGame(string gameId, string playerName)
        {
            var gameSession = _gameSessionManager.GetGame(gameId);
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

            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            await Clients.Group(gameId).SendAsync("PlayerJoined", player, gameSession.Players);
        }

        public async Task LeaveGame(string gameId, string playerName, bool kicked = false)
        {
            var gameSession = _gameSessionManager.GetGame(gameId);
            if (gameSession == null)
                throw new HubException("Game not found.");

            if (!gameSession.Players.Any())
                throw new HubException("No players found.");

            var player = gameSession.Players.FirstOrDefault(p => p.Name == playerName, null);
            if (player == null)
                throw new HubException($"'{playerName}' not found");

            gameSession.RemovePlayer(player);

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);
            var clientMsg = kicked ? "PlayerKicked" : "PlayerLeft";
            await Clients.Group(gameId).SendAsync(clientMsg, playerName);
        }

        public async Task SwitchTeam(string gameId, string playerName)
        {
            var gameSession = _gameSessionManager.GetGame(gameId);
            if (gameSession == null)
                throw new HubException("Game not found.");

            if (!gameSession.Players.Any())
                throw new HubException("No players found.");



            var player = gameSession.Players.FirstOrDefault(p => p.Name == playerName, null) ?? throw new HubException($"'{playerName}' not found");

            lock (gameSession)
            {
                gameSession.SetChaser(player);

            }
            await Clients.Group(gameId).SendAsync("PlayerUpdated", player, "SwitchTeam");
        }

        public async Task GetGameState(string gameId)
        {
            var gameSession = _gameSessionManager.GetGame(gameId);
            if (gameSession == null)
                throw new HubException("Game not found.");

            
            await Clients.Caller.SendAsync("InitialiseGameState", gameSession.Players, gameSession.Chaser);
        }
    }
}
