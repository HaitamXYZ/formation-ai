namespace Backend.Exceptions;

public sealed class TooManyRequestsException : Exception
{
    public TooManyRequestsException(string message) : base(message) { }
}
