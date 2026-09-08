// middleware/auth.js
const jwt = require('jsonwebtoken');

// Generate JWT token
function generateToken(user_id, role_id) {
    //return jwt.sign({ user_id }, 'supersecretjwttokensecretkey', { expiresIn: process.env.JWT_EXPIRE });
    return jwt.sign({ user_id: user_id, logged_in_user_role: role_id  }, process.env.JWT_SECRETKEY, { expiresIn: process.env.JWT_EXPIRE });
}

const verifyAndRefreshToken = (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({ code: 401, message: 'Missing token...!' });
        }

        jwt.verify(token, process.env.JWT_SECRETKEY, (err, decoded) => {
            if (err) {
                console.log(err);
                return res.status(401).json({ code: 401, message: 'Invalid token' });
            } else {
                const allowedDomain = process.env.WEBSITE_URL;
                    const referer = req.headers.referer || '';
                    //console.log(referer, allowedDomain);console.log(!referer, !referer.startsWith(allowedDomain));
                    if (!referer || !referer.startsWith(allowedDomain)) {
                        //do nothing cause origin is a third party client.
                    } else {
                            req.user_id = decoded.user_id;
                            logged_in_user_role = decoded.logged_in_user_role;
                            // Check if the token needs to be refreshed
                            const currentTime = Date.now() / 1000;
                            const tokenExp = decoded.exp;
                            const threshold = process.env.JWT_THRESHOLD; // 5 minutes
                            if (tokenExp - currentTime < threshold) {
                                    // Generate a new token with extended expiration time
                                    const newToken = jwt.sign({ user_id: req.user_id, logged_in_user_role: logged_in_user_role }, process.env.JWT_SECRETKEY, { expiresIn: process.env.JWT_EXPIRE });
                                    res.setHeader('Authorization', 'Bearer ' + newToken);
                            }
                }
                next();
            }
        });
    } catch (error) {
        console.error(error.stack);
        return res.status(500).json({ message: 'Internal server error', error: error.message, error_stack: error.stack });
    }
};

module.exports = { generateToken, verifyAndRefreshToken };