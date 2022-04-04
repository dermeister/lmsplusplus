namespace LmsPlusPlus.Api.Vcs;

class Repository
{
    internal Uri WebsiteUrl { get; }
    internal Uri CloneUrl { get; }

    internal Repository(Uri websiteUrl, Uri cloneUrl)
    {
        WebsiteUrl = websiteUrl;
        CloneUrl = cloneUrl;
    }
}
