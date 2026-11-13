namespace CPCRM.API.Services;

public static class CrmRules
{
    public static void LeadTransition(string from, string? to)
    {
        if (to is not ("New" or "Contacted" or "Qualified" or "Disqualified"))
            throw new CrmConflict("Choose New, Contacted, Qualified or Disqualified for the inquiry lifecycle.");
    }
    public static void DealTransition(string from, string? to)
    {
        if (from is "Won" or "Lost") throw new CrmConflict("The deal is closed.");
        if (to == "Lost" || (from == "New" && to == "Contacted") || (from == "Contacted" && to == "Qualified")) return;
        throw new CrmConflict("Use quotation actions to send a proposal or win a deal.");
    }
}
