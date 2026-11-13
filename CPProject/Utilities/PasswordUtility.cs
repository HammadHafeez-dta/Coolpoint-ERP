using System;

namespace SaftProject.Utilities
{
    public static class PasswordUtility
    {
        public static string EncryptPassword(string text)
{
    if (string.IsNullOrEmpty(text)) return string.Empty;

    string encText = string.Empty;

    for (int i = 0; i < text.Length; i++)
    {
        int ascode = Convert.ToInt32(text[i]);

        // Integer arithmetic only
        int val = ((ascode * 29) / 3) - 102;

        string hex = Convert.ToString(val, 16);

        if (i == 0)
            encText = hex;
        else
            encText += "-" + hex;
    }

    return encText;
}

        public static string DeEncryptPassword(string text)
{
    if (string.IsNullOrEmpty(text)) return string.Empty;

    string decText = string.Empty;
    string[] chunks = text.Split('-');

    foreach (string chunk in chunks)
    {
        if (string.IsNullOrEmpty(chunk)) continue;

        try
        {
            int val = Convert.ToInt32(chunk, 16);

            // Integer arithmetic only
            int charCode = ((val + 102) * 3) / 29;

            decText += Convert.ToChar(charCode);
        }
        catch
        {
            // Ignore invalid characters
        }
    }

    return decText;
}
    }
}
