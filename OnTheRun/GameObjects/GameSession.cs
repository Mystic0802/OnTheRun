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

        public event Action? OnGameSessionChanged;

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
            OnGameSessionChanged?.Invoke();
        }

        public void RemovePlayer(Player player)
        {
            if (!Players.Any())
                throw new InvalidOperationException("No other players exist.");
            Players.Remove(player);
            OnGameSessionChanged?.Invoke();
        }

        public void SwitchTeam(string playerName)
        {
            Player? player = null;

            if (Chaser != null)
            {
                if (Chaser.Name == playerName) // Player is existing chaser: Switch back to player
                {

                    player = Chaser;
                    player.IsChaser = false;
                    Players.Add(player);
                    Chaser = null;
                    OnGameSessionChanged?.Invoke();
                    return;
                }
                else // Player is not existing chaser: do not change anything.
                {
                    throw new InvalidOperationException("Chaser slot already taken.");
                }    
            }

            player = Players.FirstOrDefault(p => p.Name == playerName, null);
            if (player == null)
            {
                throw new InvalidOperationException("Player is not in this game session.");
            }

            Players.Remove(player);
            player.IsChaser = true;
            Chaser = player;
            OnGameSessionChanged?.Invoke();
            return;
        }

        #endregion

        public void StartGame()
        {
            if (CurrentState != GameState.Lobby)
                throw new InvalidOperationException("Game already started.");

            CurrentState = GameState.Cashbuilder;
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