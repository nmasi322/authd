## Hey what's up?

So you just started your server, here's some guide if you need it

### Available routes

- `/api/auth/signup` - Signs a user up

#### req.body

- name
- email
- password

- `/api/auth/login` - Logs a user in

#### req.body

- email
- password
- `/api/auth/me` - Get a user's data (GET)
- #### Authorization token

- `/api/auth/echo` - Get a user's data by email (GET)

#### req.body

- email

- `/api/auth/email-verification/request` - Request for a an email verification (POST)
- #### req.body
- email

- `/api/auth/email-verification` - Performs the actual email verification (POST)

#### req.body

- otp
- Authorization token

- `/api/auth/password/reset/request` - Request for a password reset request (POST)

#### req.query

- email

- `/api/auth/password/reset` - Resets a users password (POST)

#### req.body

- tokenId (from db)
- resetToken (from db)
- password

- `/api/auth/refresh` - Refresh auth tokens (POST)

#### req.body

- refreshToken

- `/api/auth/password` - Update a user's password (PUT)
  #### req.body
- Authorization token
- oldPassword
- newPassword

- `/api/auth/me/update` - Update a user's details (PUT)

#### req.body

- Details being updated

Of course you're free to change the routes to whatever might suite you.

Get your mail api keys from https://www.useplunk.com/ for sending emails

Have a nice time building that next big thing! :)
