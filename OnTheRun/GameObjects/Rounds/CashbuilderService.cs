using OnTheRun.GameObjects.Services;
using System.Timers;

namespace OnTheRun.GameObjects.Rounds
{
    public class CashbuilderService
    {
        private readonly Dictionary<string, int> _playerScores = new();
        private readonly Dictionary<string, int> _questionCounters = new();
        private readonly QuestionService _questionService;
        
        private List<TriviaQuestion> _questions;


        public event Action? OnCashbuilderTimerStart, OnCashbuilderTimerPause, OnCashbuilderTimerStop, OnCashbuilderTimerEnd;

        #region Timer

        private readonly int _timeLimitSeconds = 60;
        private DateTime _timerStartTime;
        private TimeSpan _pausedTime = TimeSpan.Zero;
        private bool _isTimerRunning = false;
        private System.Timers.Timer? _timer;

        public TimeSpan RemainingTime
        {
            get
            {
                if (!_isTimerRunning)
                    return TimeSpan.FromSeconds(_timeLimitSeconds) - _pausedTime;
                return TimeSpan.FromSeconds(_timeLimitSeconds) - (DateTime.UtcNow - _timerStartTime + _pausedTime);
            }
        }

        public void StartTimer()
        {
            if (_isTimerRunning)
                throw new InvalidOperationException("Timer is already running.");

            _timerStartTime = DateTime.UtcNow;
            _isTimerRunning = true;

            OnCashbuilderTimerStart?.Invoke();

            // Set up a timer to check for time expiration
            _timer = new System.Timers.Timer(100); // Check every 100ms
            _timer.Elapsed += CheckTimeUp;
            _timer.Start();
        }

        public void PauseTimer()
        {
            if (!_isTimerRunning)
                throw new InvalidOperationException("Timer is not running.");

            _pausedTime += DateTime.UtcNow - _timerStartTime;
            _isTimerRunning = false;

            _timer?.Stop();

            OnCashbuilderTimerPause?.Invoke();
        }

        public void StopTimer()
        {
            if (!_isTimerRunning)
                throw new InvalidOperationException("Timer is not running.");

            _isTimerRunning = false;
            _pausedTime = TimeSpan.Zero;

            _timer?.Stop();
            _timer?.Dispose();
            _timer = null;

            OnCashbuilderTimerStop?.Invoke();
        }

        private void CheckTimeUp(object? sender, ElapsedEventArgs e)
        {
            if (IsTimeUp())
            {
                StopTimer();
                OnCashbuilderTimerEnd?.Invoke(); // Trigger timer end event
            }
        }

        public bool IsTimeUp()
        {
            return RemainingTime <= TimeSpan.Zero;
        }

        #endregion

        public void StartRound(string playerName)
        {
            if (_playerScores.ContainsKey(playerName))
                throw new InvalidOperationException("Round already started for this player.");

            _playerScores[playerName] = 0;
            _questionCounters[playerName] = 0;
        }

        public void GetNextQuestion()
        {
            _questions = _questionService.GetCashbuilderQuestions();
        }

        public void AnswerQuestion(string playerName, bool isCorrect)
        {
            if (!_playerScores.ContainsKey(playerName))
                throw new InvalidOperationException("Player not found in this round.");

            _questionCounters[playerName]++;
            if (isCorrect)
                _playerScores[playerName]++;
        }

        public int GetScore(string playerName)
        {
            if (!_playerScores.ContainsKey(playerName))
                throw new InvalidOperationException("Player not found.");

            return _playerScores[playerName];
        }

        public int GetTotalQuestions(string playerName)
        {
            if (!_questionCounters.ContainsKey(playerName))
                throw new InvalidOperationException("Player not found.");

            return _questionCounters[playerName];
        }
    }
}
