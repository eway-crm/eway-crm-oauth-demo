h1. eWay-CRM OAuth Demo

1. Create OAuth client in eWay-CRM:

You will need access to eWay-CRM server database. If you don't have access to server contact support.

```sql
EXEC dbo.eWaySP_Auth_CreateClient 'eway-crm-oauth-demo', 'http://127.0.0.1:8787', @ClientID = 'eway-crm-oauth-demo'
UPDATE EWD_AuthClients SET AccessTokenLifetime = 3600 WHERE ClientName = 'eway-crm-oauth-demo'
SELECT ClientID, ClientSecret FROM EWD_AuthClients WHERE ClientName = 'eway-crm-oauth-demo'
```

2. Create .dev.vars file with CLIENT_SECRET

```
CLIENT_SECRET=abcdefgh123456789
```

3. Run demo app

```
npm ci
wrangler dev
```

Now you can open the app in browser http://127.0.0.1:8787.
After a successfull login you will get response: `Successfully logged in as user1. There is 5 users in your system. Your refresh token is abcdefgh123456789.`