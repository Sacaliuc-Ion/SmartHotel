namespace Hotel.BusinessLayer.Interfaces;

using Hotel.BusinessLayer.Structure;
using Hotel.Domain.Models.Reception;
using Hotel.Domain.Models.Reservations;

public interface IReceptionService
{
     Task<ServiceResult<List<ReservationDto>>> GetArrivalsTodayAsync();
     Task<ServiceResult<List<ReservationDto>>> GetDeparturesTodayAsync();
     Task<ServiceResult<ReservationDto>> CheckInAsync(int reservationId, CheckInRequest request, int processedByUserId);
     Task<ServiceResult<ReservationDto>> CheckOutAsync(int reservationId, CheckOutRequest request, int processedByUserId);
}
