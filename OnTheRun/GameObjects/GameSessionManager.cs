using System;
using System.Collections.Concurrent;

namespace OnTheRun.GameObjects
{
    public class GameSessionManager
    {
        private readonly ConcurrentDictionary<string, GameSession> _sessions = new();

        public string CreateGame()
        {
            var gameId = GenerateGameId();
            var session = new GameSession(gameId);
            _sessions[gameId] = session;
            return gameId;
        }

        public GameSession? GetGame(string gameId) =>
            _sessions.TryGetValue(gameId, out var session) ? session : null;

        public bool RemoveGame(string gameId) =>
            _sessions.TryRemove(gameId, out _);


        private static readonly Random _random = new();
        private const string _characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        private string GenerateGameId()
        {
            string gameId;
            do
            {
                gameId = new string(Enumerable.Range(0, 4)
                    .Select(_ => _characters[_random.Next(_characters.Length)])
                    .ToArray());
            } while (_sessions.ContainsKey(gameId)); // Ensure uniqueness

            return gameId;
        }
    }
}
