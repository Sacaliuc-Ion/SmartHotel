using Hotel.Domain.Entities;
using Hotel.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Hotel.DataAccess.Context;

public class HotelDbContext : DbContext
{
    public HotelDbContext(DbContextOptions<HotelDbContext> options) : base(options) { }

    public DbSet<UserData> Users => Set<UserData>();
    public DbSet<RoleData> Roles => Set<RoleData>();
    public DbSet<RoomData> Rooms => Set<RoomData>();
    public DbSet<RoomTypeData> RoomTypes => Set<RoomTypeData>();
    public DbSet<AmenityData> Amenities => Set<AmenityData>();
    public DbSet<RoomAmenityData> RoomAmenities => Set<RoomAmenityData>();
    public DbSet<ReservationData> Reservations => Set<ReservationData>();
    public DbSet<RoomReviewData> RoomReviews => Set<RoomReviewData>();
    public DbSet<UserLoginAuditData> UserLoginAudits => Set<UserLoginAuditData>();
    public DbSet<UserNotificationData> UserNotifications => Set<UserNotificationData>();
    public DbSet<CheckInRecordData> CheckInRecords => Set<CheckInRecordData>();
    public DbSet<CheckOutRecordData> CheckOutRecords => Set<CheckOutRecordData>();
    public DbSet<HousekeepingTaskData> HousekeepingTasks => Set<HousekeepingTaskData>();
    public DbSet<MaintenanceTicketData> MaintenanceTickets => Set<MaintenanceTicketData>();
    public DbSet<HotelSettingData> HotelSettings => Set<HotelSettingData>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Many-to-Many Configuration
        modelBuilder.Entity<RoomAmenityData>()
            .HasKey(ra => new { ra.RoomId, ra.AmenityId });

        modelBuilder.Entity<RoomAmenityData>()
            .HasOne(ra => ra.Room)
            .WithMany(r => r.RoomAmenities)
            .HasForeignKey(ra => ra.RoomId);

        modelBuilder.Entity<RoomAmenityData>()
            .HasOne(ra => ra.Amenity)
            .WithMany(a => a.RoomAmenities)
            .HasForeignKey(ra => ra.AmenityId);

        // User Relationships
        modelBuilder.Entity<ReservationData>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reservations)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserLoginAuditData>()
            .HasOne(audit => audit.User)
            .WithMany(user => user.LoginAudits)
            .HasForeignKey(audit => audit.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserNotificationData>()
            .HasOne(notification => notification.User)
            .WithMany(user => user.Notifications)
            .HasForeignKey(notification => notification.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserNotificationData>()
            .HasOne(notification => notification.Reservation)
            .WithMany()
            .HasForeignKey(notification => notification.ReservationId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<RoomReviewData>()
            .HasOne(review => review.User)
            .WithMany(user => user.RoomReviews)
            .HasForeignKey(review => review.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RoomReviewData>()
            .HasOne(review => review.Room)
            .WithMany(room => room.Reviews)
            .HasForeignKey(review => review.RoomId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ReservationData>()
            .HasOne(reservation => reservation.Review)
            .WithOne(review => review.Reservation)
            .HasForeignKey<RoomReviewData>(review => review.ReservationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RoomReviewData>()
            .HasIndex(review => review.ReservationId)
            .IsUnique();

        modelBuilder.Entity<RoomReviewData>()
            .Property(review => review.Comment)
            .HasMaxLength(1000);

        modelBuilder.Entity<HousekeepingTaskData>()
            .HasOne(h => h.AssignedTo)
            .WithMany(u => u.HousekeepingTasks)
            .HasForeignKey(h => h.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<MaintenanceTicketData>()
            .HasOne(mt => mt.ReportedBy)
            .WithMany(u => u.ReportedTickets)
            .HasForeignKey(mt => mt.ReportedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MaintenanceTicketData>()
            .HasOne(mt => mt.AssignedTo)
            .WithMany(u => u.AssignedTickets)
            .HasForeignKey(mt => mt.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<CheckInRecordData>()
            .HasOne(cir => cir.ProcessedBy)
            .WithMany(u => u.ProcessedCheckIns)
            .HasForeignKey(cir => cir.ProcessedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CheckOutRecordData>()
            .HasOne(cor => cor.ProcessedBy)
            .WithMany(u => u.ProcessedCheckOuts)
            .HasForeignKey(cor => cor.ProcessedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Reservation -> CheckIn / CheckOut One-to-One
        modelBuilder.Entity<ReservationData>()
            .HasOne(r => r.CheckInRecord)
            .WithOne(cir => cir.Reservation)
            .HasForeignKey<CheckInRecordData>(cir => cir.ReservationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ReservationData>()
            .HasOne(r => r.CheckOutRecord)
            .WithOne(cor => cor.Reservation)
            .HasForeignKey<CheckOutRecordData>(cor => cor.ReservationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Enums mapping stored as strings for ease
        modelBuilder.Entity<RoomData>().Property(r => r.Status).HasConversion<string>();
        modelBuilder.Entity<ReservationData>().Property(r => r.Status).HasConversion<string>();
        modelBuilder.Entity<ReservationData>().Property(r => r.PaymentStatus).HasConversion<string>();
        modelBuilder.Entity<HousekeepingTaskData>().Property(r => r.Status).HasConversion<string>();
        modelBuilder.Entity<MaintenanceTicketData>().Property(r => r.Status).HasConversion<string>();
        modelBuilder.Entity<MaintenanceTicketData>().Property(r => r.Priority).HasConversion<string>();

        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Setup default Roles
        modelBuilder.Entity<RoleData>().HasData(
            new RoleData { Id = 1, Name = "Client" },
            new RoleData { Id = 2, Name = "Reception" },
            new RoleData { Id = 3, Name = "Housekeeping" },
            new RoleData { Id = 4, Name = "Maintenance" },
            new RoleData { Id = 5, Name = "Manager" },
            new RoleData { Id = 6, Name = "Admin" }
        );

        // Password hash for 'hotel123' across all seed users
        var pwdHash = "$2a$11$s5EGEu.A.g4E6QhP1p4C5OTtG0gq6g.0ZJ/E9fM9zMOhWdXXe4/lO"; // "hotel123"

        var staticDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<UserData>().HasData(
            new UserData { Id = 1, FirstName = "Admin", LastName = "User", Email = "admin@smarthotel.com", PasswordHash = pwdHash, RoleId = 6, CreatedAt = staticDate },
            new UserData { Id = 2, FirstName = "Guest", LastName = "User", Email = "guest@example.com", PasswordHash = pwdHash, RoleId = 1, CreatedAt = staticDate },
            new UserData { Id = 3, FirstName = "John", LastName = "Doe", Email = "john@hotel.com", PasswordHash = pwdHash, RoleId = 2, CreatedAt = staticDate },
            new UserData { Id = 4, FirstName = "Jane", LastName = "Smith", Email = "jane@hotel.com", PasswordHash = pwdHash, RoleId = 3, CreatedAt = staticDate },
            new UserData { Id = 5, FirstName = "Tom", LastName = "Martinez", Email = "tom@hotel.com", PasswordHash = pwdHash, RoleId = 4, CreatedAt = staticDate },
            new UserData { Id = 6, FirstName = "Robert", LastName = "Johnson", Email = "robert@hotel.com", PasswordHash = pwdHash, RoleId = 5, CreatedAt = staticDate },
            new UserData { Id = 7, FirstName = "Emily", LastName = "Davis", Email = "emily@hotel.com", PasswordHash = pwdHash, RoleId = 6, CreatedAt = staticDate }
        );

        modelBuilder.Entity<RoomTypeData>().HasData(
            new RoomTypeData { Id = 1, Name = "single", Description = "Cozy single room", BasePrice = 89 },
            new RoomTypeData { Id = 2, Name = "double", Description = "Spacious double room", BasePrice = 129 },
            new RoomTypeData { Id = 3, Name = "suite", Description = "Luxury suite", BasePrice = 249 },
            new RoomTypeData { Id = 4, Name = "deluxe", Description = "Deluxe room", BasePrice = 189 }
        );

        modelBuilder.Entity<AmenityData>().HasData(
            new AmenityData { Id = 1, Name = "WiFi" },
            new AmenityData { Id = 2, Name = "TV" },
            new AmenityData { Id = 3, Name = "AC" },
            new AmenityData { Id = 4, Name = "Mini Bar" },
            new AmenityData { Id = 5, Name = "Jacuzzi" },
            new AmenityData { Id = 6, Name = "Balcony" }
        );

        var seededRooms = HotelSeedCatalog.RoomSpecs
            .Select(roomSpec => new RoomData
            {
                Id = roomSpec.Id,
                Number = roomSpec.Number,
                Floor = roomSpec.Floor,
                Capacity = roomSpec.Capacity,
                PricePerNight = roomSpec.PricePerNight,
                RoomTypeId = roomSpec.RoomTypeId,
                Status = roomSpec.Status,
                Description = roomSpec.Description,
            })
            .ToList();

        modelBuilder.Entity<RoomData>().HasData(seededRooms);

        var roomAmenities = HotelSeedCatalog.RoomSpecs
            .SelectMany(roomSpec => HotelSeedCatalog
                .GetAmenityIds(roomSpec)
                .Select(amenityId => new RoomAmenityData
                {
                    RoomId = roomSpec.Id,
                    AmenityId = amenityId,
                }))
            .ToList();

        modelBuilder.Entity<RoomAmenityData>().HasData(roomAmenities);

        modelBuilder.Entity<HotelSettingData>().HasData(
            new HotelSettingData { Id = 1, Key = "CheckInTime", Value = "14:00", Description = "Standard check-in time" },
            new HotelSettingData { Id = 2, Key = "CheckOutTime", Value = "11:00", Description = "Standard check-out time" },
            new HotelSettingData { Id = 3, Key = "Currency", Value = HotelSeedCatalog.DefaultCurrency, Description = "Default currency" }
        );
    }
}
