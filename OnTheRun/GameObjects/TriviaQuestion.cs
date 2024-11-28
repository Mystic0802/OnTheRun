namespace OnTheRun.GameObjects
{
    public class TriviaQuestion
    {
        public string Question { get; }
        public string CorrectAnswer { get; }
        public List<string> WrongAnswers { get; } = [];

        public TriviaQuestion(string question, string correctAnswer, List<string> wrongAnswers)
        {
            Question = question;
            CorrectAnswer = correctAnswer;
            WrongAnswers = wrongAnswers;
        }
    }
}
