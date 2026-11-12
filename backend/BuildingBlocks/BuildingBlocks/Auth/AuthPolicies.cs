namespace BuildingBlocks.Auth
{
    // Policy names shared by every service, so a typo becomes a compile error
    public static class AuthPolicies
    {
        public const string Basket = "Basket";
        public const string Orders = "Orders";
        public const string Admin = "Admin";
    }
}
