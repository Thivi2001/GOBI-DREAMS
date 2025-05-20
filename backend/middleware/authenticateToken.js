const jwt = require('jsonwebtoken');

module.exports = function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        // Attach user info to request, including isAdmin
        req.user = {
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin // Make sure your JWT payload includes isAdmin
        };
        next();
    });
};