module.exports = {
  sessionOptions: {
    secret: 'aasdasdasdqw2@d23f23g232121edqw',
    saveUninitialized: true, // save new sessions
    resave: false, // do not automatically write to the session store
    cookie: {
      httpOnly: true,
      maxAge: 2419200000
    } // TODO set secure to true when https is used
  }

};