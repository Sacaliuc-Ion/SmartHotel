using Hotel.BusinessLayer.Core;
using Hotel.BusinessLayer.Interfaces;
using Hotel.DataAccess;
using Microsoft.Extensions.DependencyInjection;

namespace Hotel.BusinessLayer;

public static class BusinessLogic
{
     public static IServiceCollection AddBusinessLayer(this IServiceCollection services)
     {
          services.AddScoped<DbSession>();

          services.AddScoped<IAuthService, AuthService>();
          services.AddScoped<IRoomService, RoomService>();
          services.AddScoped<IReservationService, ReservationService>();
          services.AddScoped<IReceptionService, ReceptionService>();
          services.AddScoped<IMaintenanceService, MaintenanceService>();
          services.AddScoped<IHousekeepingService, HousekeepingService>();
          services.AddScoped<IDashboardService, DashboardService>();
          services.AddScoped<IAdminService, AdminService>();
          return services;
     }
}
