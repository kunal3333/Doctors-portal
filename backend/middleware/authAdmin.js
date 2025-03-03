import jwt from 'jsonwebtoken';

const authAdmin = async (req, res, next) => {
  try {
    const atoken = req.headers['authorization'];

    if (!atoken) {
      return res.status(401).json({ success: false, message: 'Token missing. Please login again.' });
    }

    const token = atoken.startsWith('Bearer ') ? atoken.slice(7) : atoken;

    try {
      var token_decode = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Token expired or invalid. Please login again.' });
    }

    if (!token_decode.email || token_decode.email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ success: false, message: 'Unauthorized access.' });
    }

    req.admin = token_decode;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default authAdmin;
