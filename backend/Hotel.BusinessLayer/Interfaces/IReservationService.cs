namespace Hotel.BusinessLayer.Interfaces;

using Hotel.BusinessLayer.Structure;
using Hotel.Domain.Models.Reservations;

public interface IReservationService
{
    Task<ServiceResult<List<ReservationDto>>> GetAllReservationsAsync();
    Task<ServiceResult<List<ReservationDto>>> GetMyReservationsAsync(int userId);
    Task<ServiceResult<ReservationDto>> CreateReservationAsync(CreateReservationRequest request, int userId);
    Task<ServiceResult<ReservationDto>> UpdateReservationAsync(int reservationId, UpdateReservationRequest request, int actorUserId);
    Task<ServiceResult<ReservationDto>> UpdateReservationPaymentStatusAsync(int reservationId, string paymentStatus, int actorUserId);
    Task<ServiceResult> CancelReservationAsync(int reservationId, int userId, bool isAdminOrReception);
    Task<ServiceResult<RoomReviewDto>> AddReviewAsync(int reservationId, int userId, CreateRoomReviewRequest request);
    Task<ServiceResult<ReviewSummaryDto>> GetReviewSummaryAsync();
    Task<ServiceResult<GymAccessDto>> GetGymAccessAsync(int? userId);
}
