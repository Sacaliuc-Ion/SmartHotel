using Hotel.BusinessLayer.Interfaces;
using Hotel.BusinessLayer.Structure;
using Hotel.DataAccess;
using Hotel.Domain.Entities;
using Hotel.Domain.Enums;
using Hotel.Domain.Models.Reception;
using Hotel.Domain.Models.Reservations;
using Microsoft.EntityFrameworkCore;

namespace Hotel.BusinessLayer.Core;

public class ReceptionService : IReceptionService
{
     private readonly DbSession _db;

     public ReceptionService(DbSession db)
     {
          _db = db;
     }

     public async Task<ServiceResult<List<ReservationDto>>> GetArrivalsTodayAsync()
     {
          var today = DateOnly.FromDateTime(DateTime.Now);
          var res = await _db.Context.Reservations
              .Include(r => r.User)
              .Include(r => r.Room)
              .Where(r => r.CheckInDate == today && r.Status == ReservationStatus.Confirmed)
              .ToListAsync();

          return ServiceResult<List<ReservationDto>>.Ok(res.Select(MapToDto).ToList());
     }

     public async Task<ServiceResult<List<ReservationDto>>> GetDeparturesTodayAsync()
     {
          var today = DateOnly.FromDateTime(DateTime.Now);
          var res = await _db.Context.Reservations
              .Include(r => r.User)
              .Include(r => r.Room)
              .Where(r => r.CheckOutDate == today && r.Status == ReservationStatus.CheckedIn)
              .ToListAsync();

          return ServiceResult<List<ReservationDto>>.Ok(res.Select(MapToDto).ToList());
     }

     public async Task<ServiceResult<ReservationDto>> CheckInAsync(int reservationId, CheckInRequest request, int processedByUserId)
     {
          var res = await _db.Context.Reservations.Include(r => r.Room).FirstOrDefaultAsync(r => r.Id == reservationId);
          if (res == null) return ServiceResult<ReservationDto>.Fail("Reservation not found");

          if (res.Status != ReservationStatus.Confirmed) return ServiceResult<ReservationDto>.Fail("Only confirmed reservations can be checked in.");

          var today = DateOnly.FromDateTime(DateTime.Now);
          if (res.CheckInDate > today) return ServiceResult<ReservationDto>.Fail("This reservation cannot be checked in before its scheduled arrival date.");

          if (res.Room.Status is RoomStatus.OutOfOrder or RoomStatus.OutOfService)
               return ServiceResult<ReservationDto>.Fail("The assigned room is currently unavailable for check-in.");

          var paymentStatus = ParsePaymentStatus(request.PaymentStatus, res.PaymentStatus);
          if (paymentStatus == null) return ServiceResult<ReservationDto>.Fail("Invalid payment status.");

          res.Status = ReservationStatus.CheckedIn;
          res.PaymentStatus = paymentStatus.Value;
          res.Room.Status = RoomStatus.Occupied;

          _db.Context.CheckInRecords.Add(new CheckInRecordData
          {
               ReservationId = reservationId,
               ProcessedByUserId = processedByUserId,
               Notes = request.Notes
          });

          _db.Context.UserNotifications.Add(new UserNotificationData
          {
               UserId = res.UserId,
               ReservationId = res.Id,
               Title = "Check-in confirmat",
               Message = $"Check-in-ul pentru camera {res.Room.Number} a fost confirmat."
          });

          await _db.SaveChangesAsync();
          var updated = await _db.Context.Reservations
              .Include(r => r.User)
              .Include(r => r.Room)
              .FirstAsync(r => r.Id == reservationId);

          return ServiceResult<ReservationDto>.Ok(MapToDto(updated));
     }

     public async Task<ServiceResult<ReservationDto>> CheckOutAsync(int reservationId, CheckOutRequest request, int processedByUserId)
     {
          var res = await _db.Context.Reservations.Include(r => r.Room).FirstOrDefaultAsync(r => r.Id == reservationId);
          if (res == null) return ServiceResult<ReservationDto>.Fail("Reservation not found");

          if (res.Status != ReservationStatus.CheckedIn) return ServiceResult<ReservationDto>.Fail("Reservation is not currently checked in.");

          var paymentStatus = ParsePaymentStatus(request.PaymentStatus, res.PaymentStatus);
          if (paymentStatus == null) return ServiceResult<ReservationDto>.Fail("Invalid payment status.");
          if (paymentStatus != PaymentStatus.Paid) return ServiceResult<ReservationDto>.Fail("The reservation must be marked as paid before checkout.");

          res.Status = ReservationStatus.CheckedOut;
          res.PaymentStatus = paymentStatus.Value;
          res.Room.Status = RoomStatus.Dirty;

          _db.Context.CheckOutRecords.Add(new CheckOutRecordData
          {
               ReservationId = reservationId,
               ProcessedByUserId = processedByUserId,
               Notes = request.Notes
          });

          await _db.SaveChangesAsync();
          await RoomStatusSyncHelper.SyncAsync(_db.Context, res.RoomId);
          await _db.SaveChangesAsync();
          var updated = await _db.Context.Reservations
              .Include(r => r.User)
              .Include(r => r.Room)
              .FirstAsync(r => r.Id == reservationId);

          return ServiceResult<ReservationDto>.Ok(MapToDto(updated));
     }

     private static ReservationDto MapToDto(ReservationData r) => new()
     {
          Id = r.Id,
          GuestName = $"{r.User.FirstName} {r.User.LastName}",
          RoomId = r.RoomId,
          RoomNumber = r.Room.Number,
          CheckIn = r.CheckInDate.ToString("yyyy-MM-dd"),
          CheckOut = r.CheckOutDate.ToString("yyyy-MM-dd"),
          Status = ClientValueFormatter.ToClientValue(r.Status),
          PaymentStatus = ClientValueFormatter.ToClientValue(r.PaymentStatus),
          TotalAmount = r.TotalPrice,
          Guests = r.Guests,
          Notes = r.Notes
     };

     private static PaymentStatus? ParsePaymentStatus(string? value, PaymentStatus fallback)
     {
          if (string.IsNullOrWhiteSpace(value))
               return fallback;

          var normalized = value.Trim().Replace("-", string.Empty, StringComparison.OrdinalIgnoreCase);
          return Enum.TryParse<PaymentStatus>(normalized, true, out var parsed) ? parsed : null;
     }
}
