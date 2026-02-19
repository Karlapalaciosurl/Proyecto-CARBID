import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET 

export function firmarJWT(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "24h" });
}

export function verificarToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "No autorizado" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}


