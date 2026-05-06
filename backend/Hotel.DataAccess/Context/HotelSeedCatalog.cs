using Hotel.Domain.Enums;

namespace Hotel.DataAccess.Context;

internal static class HotelSeedCatalog
{
    internal const string DefaultCurrency = "MDL";

    internal static IReadOnlyList<RoomSeedSpec> RoomSpecs { get; } = new List<RoomSeedSpec>
    {
        new(1, "101", 1, 1, 89m, 1, RoomStatus.Available, "Cozy single room with modern amenities"),
        new(2, "102", 1, 1, 89m, 1, RoomStatus.Available, "Cozy single room with modern amenities"),
        new(3, "103", 1, 2, 129m, 2, RoomStatus.Dirty, "Spacious double room with city view", "Mini Bar"),
        new(4, "104", 1, 1, 89m, 1, RoomStatus.Available, "Cozy single room with courtyard view"),
        new(5, "105", 1, 1, 89m, 1, RoomStatus.Available, "Quiet single room for short business stays"),
        new(6, "106", 1, 2, 129m, 2, RoomStatus.Available, "Bright double room with lounge corner", "Mini Bar"),
        new(7, "107", 1, 2, 129m, 2, RoomStatus.Available, "Comfort double room near the spa wing", "Mini Bar"),
        new(8, "108", 1, 3, 189m, 4, RoomStatus.Clean, "Deluxe room with premium amenities", "Mini Bar", "Balcony"),
        new(9, "109", 1, 1, 89m, 1, RoomStatus.Available, "Elegant single room with work desk"),
        new(10, "201", 2, 2, 129m, 2, RoomStatus.Available, "Spacious double room with city view", "Mini Bar"),
        new(11, "202", 2, 4, 249m, 3, RoomStatus.Available, "Luxury suite with separate living area", "Mini Bar", "Jacuzzi", "Balcony"),
        new(12, "203", 2, 2, 129m, 2, RoomStatus.Cleaning, "Spacious double room with city view", "Mini Bar"),
        new(13, "204", 2, 2, 129m, 2, RoomStatus.Available, "Double room with natural light and modern decor", "Mini Bar"),
        new(14, "205", 2, 3, 189m, 4, RoomStatus.Ready, "Deluxe room prepared for premium stays", "Mini Bar", "Balcony"),
        new(15, "206", 2, 4, 249m, 3, RoomStatus.Available, "Luxury suite with skyline view", "Mini Bar", "Jacuzzi", "Balcony"),
        new(16, "207", 2, 2, 129m, 2, RoomStatus.Cleaning, "Double room scheduled for turnover", "Mini Bar"),
        new(17, "208", 2, 4, 249m, 3, RoomStatus.Available, "Suite with living area and soaking tub", "Mini Bar", "Jacuzzi", "Balcony"),
        new(18, "209", 2, 3, 189m, 4, RoomStatus.Available, "Deluxe room with premium amenities", "Mini Bar", "Balcony"),
        new(19, "301", 3, 3, 189m, 4, RoomStatus.Available, "Deluxe room with premium amenities", "Mini Bar", "Balcony"),
        new(20, "302", 3, 4, 249m, 3, RoomStatus.Available, "Luxury suite with separate living area", "Mini Bar", "Jacuzzi", "Balcony"),
        new(21, "303", 3, 3, 189m, 4, RoomStatus.OutOfOrder, "Deluxe room with premium amenities", "Mini Bar", "Balcony"),
        new(22, "304", 3, 2, 129m, 2, RoomStatus.Available, "Spacious double room with city view", "Mini Bar"),
        new(23, "305", 3, 2, 129m, 2, RoomStatus.Available, "Double room with a quiet top-floor setting", "Mini Bar"),
        new(24, "306", 3, 1, 89m, 1, RoomStatus.Available, "Single room ideal for solo city breaks"),
        new(25, "307", 3, 3, 189m, 4, RoomStatus.Available, "Deluxe room with balcony and reading nook", "Mini Bar", "Balcony"),
        new(26, "308", 3, 4, 249m, 3, RoomStatus.Available, "Suite with premium lounge and panoramic windows", "Mini Bar", "Jacuzzi", "Balcony"),
        new(27, "309", 3, 2, 129m, 2, RoomStatus.Available, "Double room with upgraded bedding", "Mini Bar"),
    };

    internal static IReadOnlyDictionary<string, int> AmenityIdsByName { get; } = new Dictionary<string, int>
    {
        ["WiFi"] = 1,
        ["TV"] = 2,
        ["AC"] = 3,
        ["Mini Bar"] = 4,
        ["Jacuzzi"] = 5,
        ["Balcony"] = 6,
    };

    internal static IEnumerable<int> GetAmenityIds(RoomSeedSpec roomSpec)
    {
        yield return AmenityIdsByName["WiFi"];
        yield return AmenityIdsByName["TV"];
        yield return AmenityIdsByName["AC"];

        foreach (var amenityName in roomSpec.ExtraAmenities.Distinct())
        {
            if (AmenityIdsByName.TryGetValue(amenityName, out var amenityId))
            {
                yield return amenityId;
            }
        }
    }
}

internal sealed record RoomSeedSpec(
    int Id,
    string Number,
    int Floor,
    int Capacity,
    decimal PricePerNight,
    int RoomTypeId,
    RoomStatus Status,
    string Description,
    params string[] ExtraAmenities
);
