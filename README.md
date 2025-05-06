Thank you for participating in this exercise. This programming exercise is just a way that we evaluate candidates and we ask all our candidates to go through some form of this. Do ask us for clarifications, bounce ideas off us (we’ll help where we can) and feel free to utilize all the resources we have made available. We hope you have fun doing these problems.

Instructions

    ● Your code should use good programming practices and conventions including consistent indentation, consistent use of variable/function/class/method naming conventions and comments.
    ● You are free to use any internet resources that you like. If you copy code from the internet, we will require that you can explain the code completely and also the license under which it was copied.

# Question 1

Here is a PostgreSQL database dump and a MySQL dump (you can choose one depending on your preference) of books for data from Project Gutenberg (https://www.gutenberg. org/, a repository of freely available e-books).

You are expected to use the data dump and design an API to query and access books from this repository.

You should provide two deliverables:

    ● An implementation of the API at a publicly accessible location from where we can test it
    ● The code for the implementation, preferably in Github or some other hosted code repository

The API should support the following:
    
    ● Retrieval of books meeting zero or more filter criteria. Each query should return the
    
    following:
        ○ The number of books meeting the criteria
        ○ A list of book objects, each of which contains the following:
            ■ Title of the book
            ■ Information about the author
            ■ Genre
            ■ Language
            ■ Subject(s)
            ■ Bookshelf(s)
            ■ A list of links to download the book in the available formats (mime-types)

    The following rules apply:
        ○ In case the number of books that meet the criteria exceeds 25, the API should return only 25 books at a time and support the means of retrieving the next sets of 25 books till all books are retrieved.
        ○ The books should be returned in decreasing order of popularity, as measured by the number of downloads.
        ○ Data should be returned in a JSON format.
    
    The following filter criteria should be supported:
        ○ Book ID numbers specified as Project Gutenberg ID numbers.
        ○ Language
        ○ Mime-type
        ○ Topic. Topic should filter on either ‘subject’ or ‘bookshelf’ or both. Case insensitive partial matches should be supported. e.g. ‘topic=child’ should among others, return books from the bookshelf ‘Children’s literature’ and from the subject ‘Child education’.
        ○ Author. Case insensitive partial matches should be supported.
        ○ Title. Case insensitive partial matches should be supported. 
        
        Multiple filter criteria should be permitted in each API call and multiple filter values should be allowed for each criterion. e.g. an API call should be able to filter on ‘language=en,fr’ and ‘topic=child, infant’.