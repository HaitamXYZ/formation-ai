namespace Backend.Exceptions;

public sealed class BadGatewayException : Exception
{
    public BadGatewayException(string message)
        : base(message)
    {
    }
}
