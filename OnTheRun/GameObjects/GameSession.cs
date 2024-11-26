using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace OnTheRun.GameObjects
{
    public class GameSession
    {

        public string GameId { get; }
        public List<Player> Players { get; } = new();
        public Player? Chaser { get; private set; }
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
                throw new InvalidOperationException("No other players exist.");
            Players.Remove(player);
        }

        public Player SwitchTeam(string playerName)
        {
            Player? player = null;

            if (Chaser != null && Chaser.Name == playerName)
            {
                player = Chaser;
                player.IsChaser = false;
                Players.Add(player);
                Chaser = null;
                return player;
            }

            player = Players.FirstOrDefault(p => p.Name == playerName, null);
            if (player == null)
            {
                throw new InvalidOperationException("Player is not in this game session.");
            }

            Players.Remove(player);
            player.IsChaser = true;
            Chaser = player;

            return Chaser;
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