using OnTheRun.GameObjects.Services;
using System.Timers;

namespace OnTheRun.GameObjects.Rounds
{
    public class HeadToHeadService
    {
        private readonly Dictionary<string, int> _playerScores = new();
        private readonly Dictionary<string, int> _questionCounters = new();
        private readonly QuestionService _questionService;
        private int _playerPosition = -1;
        private int _chaserPostion = -1;
        private string _playerAnswer;
        private string _chaserAnswer;

        public event Action? OnQuestionTimerStart, OnQuestionTimerEnd;

        public TriviaQuestion Question { get; private set; }

        public HeadToHeadService(QuestionService questionService)
        {
            _questionService = questionService;
        }

        #region Timer

        private DateTime _timerStartTime;
        private bool _isTimerRunning = false;
        private System.Timers.Timer? _timer;

        public void StartTimer()
        {
            if (_isTimerRunning)
                throw new InvalidOperationException("Timer is already running.");

            _timerStartTime = DateTime.UtcNow;
            _isTimerRunning = true;

            OnQuestionTimerStart?.Invoke();

            _timer = new System.Timers.Timer(7000);
            _timer.Elapsed += OnTimerEnd;
            _timer.Start();
        }

        public void StopTimer()
        {

        }

        #endregion

        public void StartRound(string playerName)
        {
            if (_playerPosition > -1)
                throw new InvalidOperationException("Round already started for this player.");

            _playerScores[playerName] = 0;
            _questionCounters[playerName] = 0;
            _playerPosition = 5;
            _chaserPostion = 8;
        }

        public void NextQuestion()
        {
            Question = _questionService.GetQuestion();
        }

        public void PlayerAnswer()
        {
            if (_isTimerRunning)
            {
                
            }
            else
            {
                StartTimer();
            }
        }

        public void ChaserAnswer()
        {

        }

        public void OnTimerEnd(object? sender, ElapsedEventArgs e)
        {
            OnQuestionTimerEnd?.Invoke();
        }
    }
}
