namespace OnTheRun.GameObjects.Rounds
{
    public class CashbuilderService
    {
        private readonly Dictionary<string, int> _playerScores = new();
        private readonly Dictionary<string, int> _questionCounters = new();
        private readonly int _timeLimitSeconds = 60; // Example time limit
        private DateTime _roundStartTime;

        public void StartRound(string playerId)
        {
            if (_playerScores.ContainsKey(playerId))
                throw new InvalidOperationException("Round already started for this player.");

            _playerScores[playerId] = 0;
            _questionCounters[playerId] = 0;
            _roundStartTime = DateTime.UtcNow;
        }

        public bool IsRoundActive()
        {
            return (DateTime.UtcNow - _roundStartTime).TotalSeconds < _timeLimitSeconds;
        }

        public void AnswerQuestion(string playerId, bool isCorrect)
        {
            if (!_playerScores.ContainsKey(playerId))
                throw new InvalidOperationException("Player not found in this round.");

            _questionCounters[playerId]++;
            if (isCorrect)
                _playerScores[playerId]++;
        }

        public int GetScore(string playerId)
        {
            if (!_playerScores.ContainsKey(playerId))
                throw new InvalidOperationException("Player not found.");

            return _playerScores[playerId];
        }

        public int GetTotalQuestions(string playerId)
        {
            if (!_questionCounters.ContainsKey(playerId))
                throw new InvalidOperationException("Player not found.");

            return _questionCounters[playerId];
        }
    }
}
