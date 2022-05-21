namespace LmsPlusPlus.Api.Vcs;

class RepositoryCreationException : Exception
{
    internal RepositoryCreationException(Exception innerException) : base(innerException.Message, innerException)
    {
    }
}
