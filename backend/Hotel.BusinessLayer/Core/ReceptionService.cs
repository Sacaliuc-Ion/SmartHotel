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
          var today = DateOnly.FromDateTime(DateTime.UtcNow);
          var res = await _db.Context.Reservations
              .Include(r => r.User)
              .Include(r => r.Room)
              .Where(r => r.CheckInDate == today && r.Status == ReservationStatus.Confirmed)
              .ToListAsync();

          return ServiceResult<List<ReservationDto>>.Ok(res.Select(MapToDto).ToList());
     }

     public async Task<ServiceResult<List<ReservationDto>>> GetDeparturesTodayAsync()
     {
          var today = DateOnly.FromDateTime(DateTime.UtcNow);
          var res = await _db.Context.Reservations
              .Include(r => r.User)
              .Include(r => r.Room)
              .Where(r => r.CheckOutDate == today && r.Status == ReservationStatus.CheckedIn)
              .ToListAsync();

          return ServiceResult<List<ReservationDto>>.Ok(res.Select(MapToDto).ToList());
     }

     public async Task<ServiceResult> CheckInAsync(int reservationId, CheckInRequest request, int processedByUserId)
     {
          var res = await _db.Context.Reservations.Include(r => r.Room).FirstOrDefaultAsync(r => r.Id == reservationId);
          if (res == null) return ServiceResult.Fail("Reservation not found");

          if (res.Status != ReservationStatus.Confirmed) return ServiceResult.Fail("Only confirmed reservations can be checked in");

          res.Status = ReservationStatus.CheckedIn;
          res.Room.Status = RoomStatus.Occupied;

          _db.Context.CheckInRecords.Add(new CheckInRecord
          {
               ReservationId = reservationId,
               ProcessedByUserId = processedByUserId,
               Notes = request.Notes
          });

          await _db.SaveChangesAsync();
          return ServiceResult.Ok();
     }

     public async Task<ServiceResult> CheckOutAsync(int reservationId, CheckOutRequest request, int processedByUserId)
     {
          var res = await _db.Context.Reservations.Include(r => r.Room).FirstOrDefaultAsync(r => r.Id == reservationId);
          if (res == null) return ServiceResult.Fail("Reservation not found");

          if (res.Status != ReservationStatus.CheckedIn) return ServiceResult.Fail("Reservation is not checked in");

          res.Status = ReservationStatus.CheckedOut;
          res.Room.Status = RoomStatus.Dirty;

          _db.Context.CheckOutRecords.Add(new CheckOutRecord
          {
               ReservationId = reservationId,
               ProcessedByUserId = processedByUserId,
               Notes = request.Notes
          });

          await _db.SaveChangesAsync();
          return ServiceResult.Ok();
     }

     private static ReservationDto MapToDto(Reservation r) => new()
     {
          Id = r.Id,
          GuestName = $"{r.User.FirstName} {r.User.LastName}",
          RoomId = r.RoomId,
          RoomNumber = r.Room.Number,
          CheckIn = r.CheckInDate.ToString("yyyy-MM-dd"),
          CheckOut = r.CheckOutDate.ToString("yyyy-MM-dd"),
          Status = r.Status.ToString(),
          PaymentStatus = r.PaymentStatus.ToString(),
          TotalAmount = r.TotalPrice,
          Guests = r.Guests
     };
}