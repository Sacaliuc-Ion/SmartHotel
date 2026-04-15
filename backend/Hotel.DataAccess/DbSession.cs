using System.Data;
using Hotel.DataAccess.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Hotel.DataAccess;

public class DbSession
{
    public HotelDbContext Context { get; }
    
    public DbSession(HotelDbContext context)
    {
        Context = context;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await Context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IDbContextTransaction> BeginTransactionAsync(IsolationLevel isolationLevel = IsolationLevel.ReadCommitted)
    {
        return await Context.Database.BeginTransactionAsync(isolationLevel);
    }
}
