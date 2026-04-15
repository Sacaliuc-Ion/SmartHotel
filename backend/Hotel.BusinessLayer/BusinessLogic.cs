using Hotel.DataAccess;
using Microsoft.Extensions.DependencyInjection;

namespace Hotel.BusinessLayer;

public static class BusinessLogic
{
     public static IServiceCollection AddBusinessLayer(this IServiceCollection services)
     {
          services.AddScoped<DbSession>();
          return services;
     }
}