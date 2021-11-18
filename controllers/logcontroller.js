const Express = require("express");
const router = Express.Router();
const { LogModel } = require("../models");
let validateJWT = require("../middleware/validate-jwt");

//Allows users to create a workout log with descriptions, definitions, results, and owner properties.
router.post("/", validateJWT, async (req, res) => {
  let { description, definition, result } = req.body.log;
  let { id } = req.user;
  
  let logEntry = {
    description,
    definition,
    result,
    owner_id: id,
  };
  try {
    const newLog = await LogModel.create(logEntry);
    res.status(201).json({
      message: "Log successfully created",
      name: newLog,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create log",
    });
  }
});

//	Gets all logs for an individual user.
router.get("/", validateJWT, async (req, res) => {
  const {id} = req.user;  
  try {
    const entries = await LogModel.findAll({
      where: {
         owner_id: id,
      },
    });
    res.status(201).json(entries);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

//	Gets individual logs by id for an individual user.
router.get("/:id", validateJWT, async (req, res) => {
  const logId = req.params.id;
  const {id} = req.user;
  try {
    const userLogs = await LogModel.findAll({
      where: {
        id: logId,
        owner_id: id,
      },
    });
    res.status(200).json(userLogs);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

//	Allows individual logs to be updated by a user.
router.put("/:id", validateJWT, async (req, res) => {
  const { description, definition, result } = req.body.log;
  const logId = req.params.id;
  let userId = req.user.id;

  const query = {
    where: {
      id: logId,
      owner_id: userId,
    },
  };

  const updateLog = {
    description: description,
    definition: definition,
    result: result,
  };

  try {
    const update = await LogModel.update(updateLog, query);
    res.status(200).json({ update, message: "Log has been updated" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

//	Allows individual logs to be deleted by a user.
router.delete("/:id", validateJWT, async (req, res) => {
  const userId = req.user.id;
  const logId = req.params.id;

  try {
    const query = {
      where: {
        id: logId,
        owner_id: userId,
      },
    };
    await LogModel.destroy(query);
    res.status(201).json({ message: "Log has been deleted" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});


module.exports = router;
