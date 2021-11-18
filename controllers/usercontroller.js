const { UniqueConstraintError } = require("sequelize/lib/errors");
const router = require("express").Router();
const { UserModel } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//	Allows a new user to be created with a username and password.
router.post("/register", async (req, res) => {
  let { username, passwordhash } = req.body.user;
  console.log(username, passwordhash)
  try {
    const User = await UserModel.create({
      username,
      passwordhash: bcrypt.hashSync(passwordhash, 13),
    });

    let token = jwt.sign({ id: User.id }, process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 24,
    });

    res.status(201).json({
      user: User,
      message: "User successfully registered",
      sessionToken: token,
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      res.status(409).json({
        message: "Email already in use",
      });
    } else {
      res.status(500).json({
        message: "Failed to register user",
      });
    }
  }
});

//Allows log in with an existing user.
router.post("/login", async (req, res) => {
  let { username, passwordhash } = req.body.user;

  try {
    const loginUser = await UserModel.findOne({
      where: {
        username: username,
      },
    });

    if (loginUser) {
      let passwordComparison = await bcrypt.compare(
        passwordhash,
        loginUser.passwordhash
      );

      if (passwordComparison) {
        let token = jwt.sign({ id: loginUser.id }, process.env.JWT_SECRET, {
          expiresIn: 60 * 60 * 24,
        });

        res.status(201).json({
          user: loginUser,
          message: "User successfully logged in",
          sessionToken: token,
        });
      } else {
        res.status(401).json({
          message: "Incorrect email or password",
        });
      }
    } else {
      res.status(401).json({
        message: "Incorrect email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to log user in",
    });
  }
});

module.exports = router;
