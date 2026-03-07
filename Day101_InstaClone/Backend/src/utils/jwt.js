const jwt = require("jsonwebtoken");
const ENV = require("../configs/env");

const signJwtToken = async ({payload,expireIn=ENV.JWT_EXPIRE}) => {
  const token = await jwt.sign(payload, ENV.JWT_SECRET,{expiresIn:expireIn});
  return token;
};

const verifyJwtToken = async (token) => {
  return await jwt.verify(token, ENV.JWT_SECRET);
};


module.exports = {
    signJwtToken,
    verifyJwtToken
}