using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SaftProject.DTO.Login;

namespace SaftProject.Utilities
{
    public static class JwtUtility
    {
        /// <summary>
        /// Generates a signed JWT token for an authenticated user.
        /// </summary>
        public static string GenerateToken(UserResponseDto user, string site, string? siteName, IConfiguration config, bool rememberMe = false)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            double expiryHours = double.TryParse(config["Jwt:ExpiryHours"], out var h) ? h : 8;
                       if (rememberMe)
                       {
                           expiryHours = double.TryParse(config["Jwt:RememberMeExpiryHours"], out var r) ? Math.Min(r, 168) : 168;
                       }
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub,  user.UserID   ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti,  Guid.NewGuid().ToString()),
                new Claim("UserNo",    user.UserNo.ToString()),
                new Claim("UserName",  user.UserName   ?? string.Empty),
                new Claim("UserLevel", user.UserLevel  ?? string.Empty),
                new Claim("Site",      site            ?? string.Empty),
                new Claim("SiteName",  siteName        ?? string.Empty),
            };

            var token = new JwtSecurityToken(
                issuer:             config["Jwt:Issuer"],
                audience:           config["Jwt:Audience"],
                claims:             claims,
                notBefore:          DateTime.UtcNow,
                expires:            DateTime.UtcNow.AddHours(expiryHours),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
