import jwt from 'jsonwebtoken';

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const atoken = req.headers['authorization'];

    // If no token is found, return an error message
    if (!atoken) {
      return res.json({ success: false, message: 'Not authorized. Login again.' });
    }

    // Remove 'Bearer ' prefix if it's there
    const token = atoken.startsWith('Bearer ') ? atoken.slice(7) : atoken;

    // Decode and verify the token
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token contains the expected admin information
    if (token_decode.email !== process.env.ADMIN_EMAIL) {
      return res.json({ success: false, message: 'Not authorized. Login again.' });
    }

    // Call the next middleware if everything is valid
    next();

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authAdmin;
