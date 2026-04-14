using Hotel.Domain.Entities;
using Hotel.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Hotel.DataAccess.Context;

public class HotelDbContext : DbContext
{
    public HotelDbContext(DbContextOptions<HotelDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<RoomType> RoomTypes => Set<RoomType>();
    public DbSet<Amenity> Amenities => Set<Amenity>();
    public DbSet<RoomAmenity> RoomAmenities => Set<RoomAmenity>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<CheckInRecord> CheckInRecords => Set<CheckInRecord>();
    public DbSet<CheckOutRecord> CheckOutRecords => Set<CheckOutRecord>();
    public DbSet<HousekeepingTask> HousekeepingTasks => Set<HousekeepingTask>();
    public DbSet<MaintenanceTicket> MaintenanceTickets => Set<MaintenanceTicket>();
    public DbSet<HotelSetting> HotelSettings => Set<HotelSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Many-to-Many Configuration
        modelBuilder.Entity<RoomAmenity>()
            .HasKey(ra => new { ra.RoomId, ra.AmenityId });

        modelBuilder.Entity<RoomAmenity>()
            .HasOne(ra => ra.Room)
            .WithMany(r => r.RoomAmenities)
            .HasForeignKey(ra => ra.RoomId);

        modelBuilder.Entity<RoomAmenity>()
            .HasOne(ra => ra.Amenity)
            .WithMany(a => a.RoomAmenities)
            .HasForeignKey(ra => ra.AmenityId);

        // User Relationships
        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reservations)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<HousekeepingTask>()
            .HasOne(h => h.AssignedTo)
            .WithMany(u => u.HousekeepingTasks)
            .HasForeignKey(h => h.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<MaintenanceTicket>()
            .HasOne(mt => mt.ReportedBy)
            .WithMany(u => u.ReportedTickets)
            .HasForeignKey(mt => mt.ReportedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MaintenanceTicket>()
            .HasOne(mt => mt.AssignedTo)
            .WithMany(u => u.AssignedTickets)
            .HasForeignKey(mt => mt.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<CheckInRecord>()
            .HasOne(cir => cir.ProcessedBy)
            .WithMany(u => u.ProcessedCheckIns)
            .HasForeignKey(cir => cir.ProcessedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CheckOutRecord>()
            .HasOne(cor => cor.ProcessedBy)
            .WithMany(u => u.ProcessedCheckOuts)
            .HasForeignKey(cor => cor.ProcessedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Reservation -> CheckIn / CheckOut One-to-One
        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.CheckInRecord)
            .WithOne(cir => cir.Reservation)
            .HasForeignKey<CheckInRecord>(cir => cir.ReservationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.CheckOutRecord)
            .WithOne(cor => cor.Reservation)
            .HasForeignKey<CheckOutRecord>(cor => cor.ReservationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Enums mapping stored as strings for ease
        modelBuilder.Entity<Room>().Property(r => r.Status).HasConversion<string>();
        modelBuilder.Entity<Reservation>().Property(r => r.Status).HasConversion<string>();
        modelBuilder.Entity<Reservation>().Property(r => r.PaymentStatus).HasConversion<string>();
        modelBuilder.Entity<HousekeepingTask>().Property(r => r.Status).HasConversion<string>();
        modelBuilder.Entity<MaintenanceTicket>().Property(r => r.Status).HasConversion<string>();
        modelBuilder.Entity<MaintenanceTicket>().Property(r => r.Priority).HasConversion<string>();

        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Setup default Roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Client" },
            new Role { Id = 2, Name = "Reception" },
            new Role { Id = 3, Name = "Housekeeping" },
            new Role { Id = 4, Name = "Maintenance" },
            new Role { Id = 5, Name = "Manager" },
            new Role { Id = 6, Name = "Admin" }
        );

        // Password hash for 'hotel123' across all seed users
        var pwdHash = "$2a$11$s5EGEu.A.g4E6QhP1p4C5OTtG0gq6g.0ZJ/E9fM9zMOhWdXXe4/lO"; // "hotel123"

        var staticDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, FirstName = "Admin", LastName = "User", Email = "admin@smarthotel.com", PasswordHash = pwdHash, RoleId = 6, CreatedAt = staticDate },
            new User { Id = 2, FirstName = "Guest", LastName = "User", Email = "guest@example.com", PasswordHash = pwdHash, RoleId = 1, CreatedAt = staticDate },
            new User { Id = 3, FirstName = "John", LastName = "Doe", Email = "john@hotel.com", PasswordHash = pwdHash, RoleId = 2, CreatedAt = staticDate },
            new User { Id = 4, FirstName = "Jane", LastName = "Smith", Email = "jane@hotel.com", PasswordHash = pwdHash, RoleId = 3, CreatedAt = staticDate },
            new User { Id = 5, FirstName = "Tom", LastName = "Martinez", Email = "tom@hotel.com", PasswordHash = pwdHash, RoleId = 4, CreatedAt = staticDate },
            new User { Id = 6, FirstName = "Robert", LastName = "Johnson", Email = "robert@hotel.com", PasswordHash = pwdHash, RoleId = 5, CreatedAt = staticDate },
            new User { Id = 7, FirstName = "Emily", LastName = "Davis", Email = "emily@hotel.com", PasswordHash = pwdHash, RoleId = 6, CreatedAt = staticDate }
        );

        modelBuilder.Entity<RoomType>().HasData(
            new RoomType { Id = 1, Name = "single", Description = "Cozy single room", BasePrice = 89 },
            new RoomType { Id = 2, Name = "double", Description = "Spacious double room", BasePrice = 129 },
            new RoomType { Id = 3, Name = "suite", Description = "Luxury suite", BasePrice = 249 },
            new RoomType { Id = 4, Name = "deluxe", Description = "Deluxe room", BasePrice = 189 }
        );

        modelBuilder.Entity<Amenity>().HasData(
            new Amenity { Id = 1, Name = "WiFi" },
            new Amenity { Id = 2, Name = "TV" },
            new Amenity { Id = 3, Name = "AC" },
            new Amenity { Id = 4, Name = "Mini Bar" },
            new Amenity { Id = 5, Name = "Jacuzzi" },
            new Amenity { Id = 6, Name = "Balcony" }
        );

        modelBuilder.Entity<Room>().HasData(
            new Room { Id = 1, Number = "101", Floor = 1, Capacity = 1, PricePerNight = 89, RoomTypeId = 1, Status = RoomStatus.Available, Description = "Cozy single room with modern amenities" },
            new Room { Id = 2, Number = "102", Floor = 1, Capacity = 1, PricePerNight = 89, RoomTypeId = 1, Status = RoomStatus.Occupied, Description = "Cozy single room with modern amenities" },
            new Room { Id = 3, Number = "103", Floor = 1, Capacity = 2, PricePerNight = 129, RoomTypeId = 2, Status = RoomStatus.Dirty, Description = "Spacious double room with city view" },
            new Room { Id = 4, Number = "201", Floor = 2, Capacity = 2, PricePerNight = 129, RoomTypeId = 2, Status = RoomStatus.Available, Description = "Spacious double room with city view" },
            new Room { Id = 5, Number = "202", Floor = 2, Capacity = 4, PricePerNight = 249, RoomTypeId = 3, Status = RoomStatus.Occupied, Description = "Luxury suite with separate living area" },
            new Room { Id = 6, Number = "203", Floor = 2, Capacity = 2, PricePerNight = 129, RoomTypeId = 2, Status = RoomStatus.Cleaning, Description = "Spacious double room with city view" },
            new Room { Id = 7, Number = "301", Floor = 3, Capacity = 3, PricePerNight = 189, RoomTypeId = 4, Status = RoomStatus.Available, Description = "Deluxe room with premium amenities" },
            new Room { Id = 8, Number = "302", Floor = 3, Capacity = 4, PricePerNight = 249, RoomTypeId = 3, Status = RoomStatus.Available, Description = "Luxury suite with separate living area" },
            new Room { Id = 9, Number = "303", Floor = 3, Capacity = 3, PricePerNight = 189, RoomTypeId = 4, Status = RoomStatus.OutOfOrder, Description = "Deluxe room with premium amenities" },
            new Room { Id = 10, Number = "304", Floor = 3, Capacity = 2, PricePerNight = 129, RoomTypeId = 2, Status = RoomStatus.Available, Description = "Spacious double room with city view" }
        );

        // Add some basic RoomAmenities (1 is WiFi, 2 is TV, 3 is AC, 4 is Mini Bar, 5 is Jacuzzi, 6 is Balcony)
        var roomAmenities = new List<RoomAmenity>();
        for (int i = 1; i <= 10; i++)
        {
            roomAmenities.Add(new RoomAmenity { RoomId = i, AmenityId = 1 }); // All have WiFi
            roomAmenities.Add(new RoomAmenity { RoomId = i, AmenityId = 2 }); // All have TV
            roomAmenities.Add(new RoomAmenity { RoomId = i, AmenityId = 3 }); // All have AC
        }
        // Suite extras for room 5 & 8
        roomAmenities.Add(new RoomAmenity { RoomId = 5, AmenityId = 4 });
        roomAmenities.Add(new RoomAmenity { RoomId = 5, AmenityId = 5 });
        roomAmenities.Add(new RoomAmenity { RoomId = 5, AmenityId = 6 });
        roomAmenities.Add(new RoomAmenity { RoomId = 8, AmenityId = 4 });
        roomAmenities.Add(new RoomAmenity { RoomId = 8, AmenityId = 5 });
        roomAmenities.Add(new RoomAmenity { RoomId = 8, AmenityId = 6 });

        modelBuilder.Entity<RoomAmenity>().HasData(roomAmenities);

        modelBuilder.Entity<HotelSetting>().HasData(
            new HotelSetting { Id = 1, Key = "CheckInTime", Value = "14:00", Description = "Standard check-in time" },
            new HotelSetting { Id = 2, Key = "CheckOutTime", Value = "11:00", Description = "Standard check-out time" },
            new HotelSetting { Id = 3, Key = "Currency", Value = "USD", Description = "Default currency" }
        );
    }
}
