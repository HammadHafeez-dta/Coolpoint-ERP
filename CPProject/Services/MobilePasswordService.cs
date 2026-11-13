using SaftMobile.API.Interface;
using SaftProject.Utilities;

namespace SaftProject.Services
{
    public class MobilePasswordService : IPasswordService
    {
        public string EncryptPassword(string text)
        {
            return PasswordUtility.EncryptPassword(text);
        }

        public string DeEncryptPassword(string text)
        {
            return PasswordUtility.DeEncryptPassword(text);
        }
    }
}
