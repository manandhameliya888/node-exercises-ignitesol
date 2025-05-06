const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Get books with filtering and pagination
 * Supports multiple filter criteria as specified in the requirements:
 * - Book IDs (Project Gutenberg ID numbers)
 * - Language
 * - Mime-type
 * - Topic (subjects and bookshelves)
 * - Author
 * - Title
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getBooks = async (req, res, next) => {
  try {
    // Extract query parameters with default values
    const {
      bookIds,
      language,
      mimeType,
      topic,
      author,
      title,
      page = 1,
      limit = 25,
    } = req.query;

    // Build the where clause based on filters
    const where = buildWhereClause({
      bookIds,
      language,
      mimeType,
      topic,
      author,
      title,
    });

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute parallel queries for better performance
    const [totalBooks, books] = await Promise.all([
      // Get total count of books matching the criteria
      prisma.books_book.count({ where }),

      // Get paginated books with related data
      prisma.books_book.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          download_count: "desc", // Sort by popularity (downloads)
        },
        include: {
          books_book_authors: {
            include: {
              books_author: true,
            },
          },
          books_book_subjects: {
            include: {
              books_subject: true,
            },
          },
          books_book_bookshelves: {
            include: {
              books_bookshelf: true,
            },
          },
          books_book_languages: {
            include: {
              books_language: true,
            },
          },
          books_format: true,
        },
      }),
    ]);

    // Format the response according to requirements
    const formattedBooks = books.map((book) => ({
      title: book.title,
      authors: book.books_book_authors.map((bookAuthor) => ({
        name: bookAuthor.books_author.name,
        birth_year: bookAuthor.books_author.birth_year,
        death_year: bookAuthor.books_author.death_year,
      })),
      language: book.books_book_languages.map(
        (bookLang) => bookLang.books_language.code
      ),
      subjects: book.books_book_subjects.map(
        (bookSubject) => bookSubject.books_subject.name
      ),
      bookshelves: book.books_book_bookshelves.map(
        (bookBookshelf) => bookBookshelf.books_bookshelf.name
      ),
      download_links: book.books_format.map((format) => ({
        mime_type: format.mime_type,
        url: format.url,
      })),
    }));

    // Send response with pagination info
    res.json({
      total_books: totalBooks,
      current_page: parseInt(page),
      total_pages: Math.ceil(totalBooks / limit),
      books: formattedBooks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Builds the where clause for Prisma queries based on filter criteria
 * @param {Object} filters - Object containing all filter criteria
 * @returns {Object} Prisma where clause
 */
const buildWhereClause = (filters) => {
  const where = {};

  // Filter by Project Gutenberg ID numbers
  if (filters.bookIds) {
    where.gutenberg_id = {
      in: filters.bookIds.split(",").map((id) => parseInt(id.trim())),
    };
  }

  // Filter by language(s)
  if (filters.language) {
    where.books_book_languages = {
      some: {
        books_language: {
          code: {
            in: filters.language.split(",").map((lang) => lang.trim()),
          },
        },
      },
    };
  }

  // Filter by mime-type(s)
  if (filters.mimeType) {
    where.books_format = {
      some: {
        mime_type: {
          in: filters.mimeType.split(",").map((type) => type.trim()),
        },
      },
    };
  }

  if (filters.topic) {
    const topics = filters.topic.split(",").map((t) => t.trim());
    where.OR = [
      // Subjects
      ...topics.map((topic) => ({
        books_book_subjects: {
          some: {
            books_subject: {
              name: {
                contains: topic,
                mode: "insensitive",
              },
            },
          },
        },
      })),
      // Bookshelves
      ...topics.map((topic) => ({
        books_book_bookshelves: {
          some: {
            books_bookshelf: {
              name: {
                contains: topic,
                mode: "insensitive",
              },
            },
          },
        },
      })),
    ];
  }

  // Filter by author name (case-insensitive partial match)
  if (filters.author) {
    where.books_book_authors = {
      some: {
        books_author: {
          name: {
            contains: filters.author,
            mode: "insensitive",
          },
        },
      },
    };
  }

  // Filter by title (case-insensitive partial match)
  if (filters.title) {
    where.title = {
      contains: filters.title,
      mode: "insensitive",
    };
  }

  return where;
};

module.exports = {
  getBooks,
};
