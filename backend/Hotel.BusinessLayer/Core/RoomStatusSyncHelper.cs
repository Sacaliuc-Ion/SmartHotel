using Hotel.DataAccess.Context;
using Hotel.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Hotel.BusinessLayer.Core;

internal static class RoomStatusSyncHelper
{
    internal static async Task SyncAsync(HotelDbContext context, int roomId, CancellationToken cancellationToken = default)
    {
        var room = await context.Rooms.FirstOrDefaultAsync(existingRoom => existingRoom.Id == roomId, cancellationToken);
        if (room == null || !room.IsActive)
        {
            return;
        }

        if (room.Status is RoomStatus.OutOfOrder or RoomStatus.OutOfService)
        {
            return;
        }

        var hasCheckedInReservation = await context.Reservations.AnyAsync(
            reservation => reservation.RoomId == roomId && reservation.Status == ReservationStatus.CheckedIn,
            cancellationToken
        );

        if (hasCheckedInReservation)
        {
            room.Status = RoomStatus.Occupied;
            return;
        }

        if (room.Status == RoomStatus.Occupied)
        {
            room.Status = RoomStatus.Available;
        }
    }
}
