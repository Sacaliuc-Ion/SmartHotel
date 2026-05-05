using System.Text;

namespace Hotel.BusinessLayer.Core;

internal static class ClientValueFormatter
{
    internal static string ToClientValue<TEnum>(TEnum value)
        where TEnum : struct, Enum
    {
        return ToClientValue(value.ToString());
    }

    internal static string ToClientValue(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var builder = new StringBuilder(value.Length + 4);

        for (var index = 0; index < value.Length; index++)
        {
            var current = value[index];

            if (char.IsUpper(current) && index > 0 && !char.IsUpper(value[index - 1]))
            {
                builder.Append('-');
            }

            builder.Append(char.ToLowerInvariant(current));
        }

        return builder.ToString();
    }
}
