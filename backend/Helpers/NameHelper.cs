namespace backend.Helpers;

public static class NameHelper
{
    public static string FormatFullName(string lastName, string firstName, string? middleName = null)
    {
        if (string.IsNullOrEmpty(lastName) || string.IsNullOrEmpty(firstName))
        {
            return string.Empty;
        }

        return $"{lastName}, {firstName}" + (string.IsNullOrEmpty(middleName) ? "" : $", {middleName}");
    }
}
