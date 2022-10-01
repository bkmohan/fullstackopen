const totalLikes = (blogs) => {
    const reducer = (likes, blog) => {
        return likes + blog.likes
    }

    return blogs.reduce(reducer, 0)
}

const favoriteBlog = blogs => {
    return blogs.length > 0
        ? blogs.reduce((acc, curr) => {
            return curr.likes > acc.likes ? curr : acc
        })
        : {}
}

const mostBlogs = (blogs) => {
    const authors = {}

    blogs.forEach(blog => {
        authors[blog.author] = blog.author in authors ? ++authors[blog.author] : 1
    })

    let maxBlog = 0
    let mostBlogAuthor = {}
    for(let author in authors){
        if(authors[author] > maxBlog){
            mostBlogAuthor = { author : author, blogs : authors[author] }
            maxBlog = authors[author]
        }
    }

    return mostBlogAuthor
}

const mostLikes = (blogs) => {
    const authors = {}

    blogs.forEach(blog => {
        authors[blog.author] = blog.author in authors ? authors[blog.author] + blog.likes : blog.likes
    })

    let maxLikes= 0
    let mostLikesAuthor = {}
    for(let author in authors){
        if(authors[author] > maxLikes){
            mostLikesAuthor = { author : author, likes : authors[author] }
            maxLikes = authors[author]
        }
    }

    return mostLikesAuthor
}


module.exports = {
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}