const jwt = require("jsonwebtoken");

const authRepository = require("../repository/auth.repository");
const ENV = require("../configs/env");
const statusMessage = require("../constants/statusMessages");
const userModel = require("../model/user.model");

/**
 * =========================================
 * AUTH SERVICE
 * =========================================
 * @description Handles business logic related
 *              to user authentication.
 */

const authService = {
  /**
   * ------------------------------------------------
   * @route   POST /api/v1/auth/register
   * @desc    Register a new user account
   * @access  Public
   *
   * @body
   *  - userName {String} Required
   *  - email    {String} Required
   *  - password {String} Required
   *
   * @returns
   *  - 201 : User created successfully
   *  - 400 : Validation error
   *  - 409 : Email or userName already exists
   */

  registerUser: async (data) => {
    const { userName, email } = data;

    if (!userName || !email) {
      throw new Error("Email and UserName Required");
    }

    // Check existing user
    const isUserAlready = await authRepository.isUserAlready({
      userName,
      email,
    });

    if (isUserAlready) {
      throw new Error(statusMessage.userAlreadyRegister);
    }

    // Create user
    const createdUser = await authRepository.createUser(data);

    // Create JWT
    const jwtToken = await jwt.sign(
      {
        userId: createdUser._id,
        email: createdUser.email,
      },
      ENV.JWT_SECRET,
      {
        expiresIn: ENV.JWT_EXPIRE,
      },
    );

    return {
      user: {
        id: createdUser._id,
        userName: createdUser.userName,
      },
      token: jwtToken,
      message: statusMessage.createdUser,
    };
  },
  /**
   * ------------------------------------------------
   * @route   POST /api/v1/auth/login
   * @desc    login an existing user account
   * @access  Public
   *
   * @body
   *  - email OR userName  {String} Required
   *  - password {String} Required
   *
   * @returns
   *  - 201 : User created successfully
   *  - 400 : Validation error
   */

  loginUser: async function (data) {
    const { email, userName, password } = data;

    if ((!email && !userName) || !password) {
      throw new Error("Email/Username and Password Required");
    }
    const user = await authRepository.findUserWithPassword({
      email,
      userName,
    });

    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new Error("Invalid Credentials");
    }

    const jwtToken = await jwt.sign(
      {
        email: user.email,
        userId: user._id,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRE },
    );

    return {
      user: {
        id: user._id,
        userName: user.userName,
      },
      token: jwtToken,
      message: statusMessage.userLoggedIn,
    };
  },
};

module.exports = authService;
