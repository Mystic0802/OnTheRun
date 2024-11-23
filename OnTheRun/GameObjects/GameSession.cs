using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace OnTheRun.GameObjects
{
    public class GameSession
    {

        public string GameId { get; }
        public List<Player> Players { get; } = new();
        public Player Chaser { get; }
        public int MaxPlayers { get; } = 5;
        public GameState CurrentState { get; private set; } = GameState.Lobby;

        public GameSession(string gameId)
        {
            GameId = gameId;
        }

        #region players

        public void AddPlayer(Player player)
        {
            if (Players.Any(p => p.Id == player.Id))
                throw new InvalidOperationException("Player already in game.");

            Players.Add(player);
        }

        public void RemovePlayer(Player player)
        {
            if (!Players.Any())
                throw new InvalidOperationException("No Other Players Exist");
            Players.Remove(player);
        }

        #endregion

        public void StartGame()
        {
            if (CurrentState != GameState.Lobby)
                throw new InvalidOperationException("Game already started.");

            CurrentState = GameState.Cashbuilder;
        }





        private readonly IHubContext<GameHub> _hubContext;
        public GameSession(IHubContext<GameHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task DoSomethingOnHub()
        {
        }

    }

    public enum GameState
    {
        Lobby,
        Cashbuilder,
        HeadToHead,
        FinalChase,
        Ended
    }
}