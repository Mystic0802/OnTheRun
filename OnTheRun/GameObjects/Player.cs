namespace OnTheRun.GameObjects
{
    public class Player
    {
        public string Id { get; }
        public string Name { get; }
        public bool IsChaser { get; set; }

        public Player(string name)
        {
            Id = Guid.NewGuid().ToString();
            Name = name;
        }
    }
}
