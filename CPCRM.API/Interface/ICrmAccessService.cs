namespace CPCRM.API.Interface;

public record CrmActor(string UserId, string Site, string UserLevel);
public record CrmOwner(string UserId, string Name);
public interface ICrmAccessService
{
    Task<bool> Allowed(CrmActor actor, string page, string action);
    Task<List<CrmOwner>> Owners(string site);
    Task<List<CrmOwner>> ProjectAssignees(string site);
}
