using Hotel.Domain.Entities;
using Hotel.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Hotel.DataAccess.Context;

public static class HotelDbInitializer
{
    public static async Task InitializeAsync(HotelDbContext context, CancellationToken cancellationToken = default)
    {
        var roomTypeIds = await context.RoomTypes.Select(rt => rt.Id).ToListAsync(cancellationToken);
        var amenityIds = await context.Amenities.Select(a => a.Id).ToListAsync(cancellationToken);

        if (roomTypeIds.Count == 0 || amenityIds.Count == 0)
        {
            return;
        }

        var roomsByNumber = await context.Rooms
            .Include(room => room.RoomAmenities)
            .ToDictionaryAsync(room => room.Number, cancellationToken);

        foreach (var roomSpec in HotelSeedCatalog.RoomSpecs)
        {
            if (!roomsByNumber.TryGetValue(roomSpec.Number, out var room))
            {
                room = new Room
                {
                    Number = roomSpec.Number,
                    Floor = roomSpec.Floor,
                    Capacity = roomSpec.Capacity,
                    PricePerNight = roomSpec.PricePerNight,
                    RoomTypeId = roomSpec.RoomTypeId,
                    Status = roomSpec.Status,
                    Description = roomSpec.Description,
                    IsActive = true,
                };

                context.Rooms.Add(room);
                roomsByNumber[room.Number] = room;
            }
            else
            {
                room.Floor = roomSpec.Floor;
                room.Capacity = roomSpec.Capacity;
                room.PricePerNight = roomSpec.PricePerNight;
                room.RoomTypeId = roomSpec.RoomTypeId;
                room.Description = roomSpec.Description;
                room.IsActive = true;
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        var roomAmenities = await context.RoomAmenities.ToListAsync(cancellationToken);
        var roomAmenityPairs = roomAmenities
            .Select(roomAmenity => (roomAmenity.RoomId, roomAmenity.AmenityId))
            .ToHashSet();

        foreach (var roomSpec in HotelSeedCatalog.RoomSpecs)
        {
            if (!roomsByNumber.TryGetValue(roomSpec.Number, out var room))
            {
                continue;
            }

            foreach (var amenityId in HotelSeedCatalog.GetAmenityIds(roomSpec))
            {
                if (roomAmenityPairs.Add((room.Id, amenityId)))
                {
                    context.RoomAmenities.Add(new RoomAmenity
                    {
                        RoomId = room.Id,
                        AmenityId = amenityId,
                    });
                }
            }
        }

        var currencySetting = await context.HotelSettings
            .FirstOrDefaultAsync(setting => setting.Key == "Currency", cancellationToken);

        if (currencySetting == null)
        {
            context.HotelSettings.Add(new HotelSetting
            {
                Key = "Currency",
                Value = HotelSeedCatalog.DefaultCurrency,
                Description = "Default currency",
            });
        }
        else if (currencySetting.Value != HotelSeedCatalog.DefaultCurrency)
        {
            currencySetting.Value = HotelSeedCatalog.DefaultCurrency;
        }

        var checkedInRoomIds = await context.Reservations
            .Where(reservation => reservation.Status == ReservationStatus.CheckedIn)
            .Select(reservation => reservation.RoomId)
            .Distinct()
            .ToHashSetAsync(cancellationToken);

        foreach (var room in roomsByNumber.Values)
        {
            if (room.Status is RoomStatus.OutOfOrder or RoomStatus.OutOfService)
            {
                continue;
            }

            if (checkedInRoomIds.Contains(room.Id))
            {
                room.Status = RoomStatus.Occupied;
                continue;
            }

            if (room.Status == RoomStatus.Occupied)
            {
                room.Status = RoomStatus.Available;
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
