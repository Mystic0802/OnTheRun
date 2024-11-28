using Newtonsoft.Json;

namespace OnTheRun.GameObjects.Services
{
    public class QuestionService
    {
        private List<TriviaQuestion> _easyQuestions;
        private List<TriviaQuestion> _mediumQuestions;
        private List<TriviaQuestion> _hardQuestions;

        private List<string> questionPattern;

        private const string ApiUrl = "https://the-trivia-api.com/v2/questions";

        public QuestionService()
        {
            _easyQuestions = new List<TriviaQuestion>();
            _mediumQuestions = new List<TriviaQuestion>();
            _hardQuestions = new List<TriviaQuestion>();
            FillAllQuestions();
        }

        public TriviaQuestion GetQuestion()
        {
            var allQuestions = _easyQuestions.Concat(_mediumQuestions).Concat(_hardQuestions).ToList();
            return allQuestions[new Random().Next(allQuestions.Count)];
        }

        public List<TriviaQuestion> GetCashbuilderQuestions()
        {
            var questions = new List<TriviaQuestion>();
            questions.Add(GetEasyQuestion());

            var random = new Random();
            for (int i = 1; i < 20; i++)
            {
                int difficulty = random.Next(3);
                switch (difficulty)
                {
                    case 0:
                        questions.Add(GetEasyQuestion());
                        break;
                    case 1:
                        questions.Add(GetMediumQuestion());
                        break;
                    case 2:
                        questions.Add(GetHardQuestion());
                        break;
                }
            }
            return questions;
        }

        private TriviaQuestion GetEasyQuestion()
        {
            if (!_easyQuestions.Any())
            {
                _easyQuestions.AddRange(CallApi("easy", 50));
            }

            var question = _easyQuestions.First();
            _easyQuestions.RemoveAt(0);
            return question;
        }

        private TriviaQuestion GetMediumQuestion()
        {
            if (!_mediumQuestions.Any())
            {
                _mediumQuestions.AddRange(CallApi("medium", 50));
            }

            var question = _mediumQuestions.First();
            _mediumQuestions.RemoveAt(0);
            return question;
        }

        private TriviaQuestion GetHardQuestion()
        {
            if(!_hardQuestions.Any())
            {
                _hardQuestions.AddRange(CallApi("hard", 50));
            }

            var question = _hardQuestions.First();
            _hardQuestions.RemoveAt(0);
            return question;
        }

        private void FillAllQuestions()
        {
            _easyQuestions.AddRange(CallApi("easy", 50));
            _mediumQuestions.AddRange(CallApi("medium", 50));
            _hardQuestions.AddRange(CallApi("hard", 50));
        }

        private List<TriviaQuestion> CallApi(string difficulty, int count)
        {
            var questions = new List<TriviaQuestion>();
            try
            {
                using (var client = new HttpClient())
                {
                    var response = client.GetAsync($"{ApiUrl}?limit={count}&difficulties={difficulty}").Result;
                    if (response.IsSuccessStatusCode)
                    {
                        var json = response.Content.ReadAsStringAsync().Result;
                        var apiQuestions = JsonConvert.DeserializeObject<List<ApiTriviaQuestion>>(json);

                        foreach (var apiQuestion in apiQuestions)
                        {
                            apiQuestion.IncorrectAnswers.RemoveAt(0);
                            questions.Add(new TriviaQuestion(
                                apiQuestion.QuestionText,
                                apiQuestion.CorrectAnswer,
                                apiQuestion.IncorrectAnswers));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching questions: {ex.Message}");
            }
            return questions;
        }
    }

    public class ApiTriviaQuestion
    {
        public string Category { get; set; }
        public string Difficulty { get; set; }
        public string QuestionText { get; set; }
        public string CorrectAnswer { get; set; }
        public List<string> IncorrectAnswers { get; set; }
    }
}
