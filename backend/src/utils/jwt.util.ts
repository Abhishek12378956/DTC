import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';


export const generateToken = (userId: number) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
};


export const verifyToken = (token: string): { userId: number } => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
};

