import jwt from 'jsonwebtoken'


export const verifyToken = (req,res,next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not Authenicated.' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, payload) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token.' });
      }
      // If no error, attach the user ID to the request object
     req.UserId = payload.id;
     // middleware call
    next();

  });
  // res.status(200).json({message:"You are Authenticated"});
}