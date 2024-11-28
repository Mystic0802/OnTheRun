using Microsoft.AspNetCore.SignalR;
using OnTheRun.GameObjects.Rounds;
using OnTheRun.GameObjects.Services;
using System.Collections.Concurrent;

namespace OnTheRun.GameObjects
{
    public class GameSession
    {

        public string GameId { get; }
        public List<Player> Players { get; } = new();
        public Player? Chaser { get; private set; }
        public int MaxPlayers { get; } = 4;
        public GameState CurrentState { get; private set; } = GameState.Lobby;
        public int CurrentPlayerIndex { get; private set; } = 0;
        public CashbuilderService CashbuilderService { get; }
        public HeadToHeadService HeadToHeadService { get; }
        public FinalChaseService FinalChaseService { get; }

        public event Action? OnGameSessionChanged;

        public GameSession(string gameId)
        {
            GameId = gameId;
            CashbuilderService = new CashbuilderService();
            HeadToHeadService = new HeadToHeadService(new QuestionService());
            FinalChaseService = new FinalChaseService();
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

            if (!Players.Any())
            {
                throw new InvalidOperationException("No players in the game.");
            }

            CurrentState = GameState.Cashbuilder;
            CurrentPlayerIndex = 0;
            OnGameSessionChanged?.Invoke();
        }

        public void EndGame()
        {
            if (CurrentState == GameState.Lobby)
                throw new InvalidOperationException("Game has not started.");
            else if (CurrentState == GameState.Ended)
                throw new InvalidOperationException("Game has already ended.");

            CurrentState = GameState.Lobby;
            OnGameSessionChanged?.Invoke();
        }

        public void NextRound()
        {
            switch (CurrentState)
            {
                case GameState.Lobby:
                    throw new InvalidOperationException("Game has not started.");
                case GameState.Cashbuilder:
                    CurrentState = GameState.HeadToHead;
                    break;
                case GameState.HeadToHead:
                    if (CurrentPlayerIndex < MaxPlayers - 1)
                    {
                        CurrentPlayerIndex++;
                        CurrentState = GameState.Cashbuilder;
                    }
                    else
                    {
                        CurrentState = GameState.FinalChase;
                    }
                    break;
                case GameState.FinalChase:
                    CurrentState = GameState.Ended;
                    break;
                case GameState.Ended:
                    throw new InvalidOperationException("Game has ended.");
            }
            OnGameSessionChanged?.Invoke();
        }

        public void StartRound()
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