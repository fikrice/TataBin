import jwt from 'jsonwebtoken';

class Helpers {
  static generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}

export default Helpers;
