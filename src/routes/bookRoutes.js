const express = require("express");
const { getBooks } = require("../controllers/bookController");

const router = express.Router();

// GET /api/books - Get books with filters
router.get("/", getBooks);

module.exports = router;
