const { validationResult } = require('express-validator')

const Post = require('../models/post')
const fs = require('fs')
const path = require('path')
const User = require('../models/user')
const POST_PER_PAGE = 5

const io = require('../socket')

// ===============================================================================================

exports.getPosts = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1

    const totalItems = await Post.find().countDocuments()

    const posts = await Post.find()
      .populate('creator')
      // sort posts by createdAt in descending way
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)

    res.status(200).json({
      message: 'Fetched Posts successfully',
      posts: posts,
      totalItems: totalItems,
    })
  } catch {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

// ===============================================================================================

exports.createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.')
      error.statusCode = 422
      throw error
    }

    if (!req.file) {
      const error = new Error('No image provided.')
      error.statusCode = 422
      throw error
    }

    const imageUrl = req.file.path
    const title = req.body.title
    const content = req.body.content

    const post = new Post({
      title,
      content,
      imageUrl,
      creator: req.userId,
    })

    await post.save()

    const user = await User.findById(req.userId)

    user.posts.push(post)
    await user.save()

    // sends requst to every user
    io.getIO().emit('posts', {
      action: 'create',
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
    })

    res.status(201).json({
      message: 'Post created successfully',
      post: post,
      creator: {
        _id: user._id,
        name: user.name,
      },
    })
  } catch (err) {
    console.log(err)
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

// ===============================================================================================

exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId

    const post = await Post.findById(postId)

    if (!post) {
      const error = new Error('Could not find post.')
      error.statusCode = 500
      throw error
    }

    res.status(200).json({
      message: 'Post Fetched',
      post: post,
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

// ===============================================================================================

exports.updatePost = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.')
      error.statusCode = 422
      throw error
    }

    const postId = req.params.postId

    const title = req.body.title
    const content = req.body.content

    // If there is new image or not
    const imageUrl = req.file ? req.file.path : req.body.image

    if (imageUrl === false) {
      const error = new Error('No file selected')
      error.statusCode = 422
      throw error
    }

    const post = await Post.findById(postId).populate('creator')

    if (!post) {
      const error = new Error('Could not find post.')
      error.statusCode = 500
      throw error
    }

    if (post.creator._id.toString() !== req.userId) {
      const error = new Error('Not authorized')
      error.statusCode = 403
      throw error
    }

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl)
    }
    post.title = title
    post.content = content
    post.imageUrl = imageUrl

    const result = await post.save()

    io.getIO().emit('posts', {
      action: 'updated',
      post: result,
    })

    res.status(200).json({
      message: 'Post updated',
      post: result,
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

// ===============================================================================================

exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId

    const post = await Post.findById(postId)

    if (!post) {
      const error = new Error('Could not find post.')
      error.statusCode = 500
      throw error
    }

    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized')
      error.statusCode = 403
      throw error
    }

    // checKed logged in user

    clearImage(post.imageUrl)

    await Post.findByIdAndRemove(postId)

    // clear relation
    const user = await User.findById(req.userId)
    user.posts.pull(postId)
    await user.save()

    io.getIO().emit('posts', {
      action: 'delete',
      post: postId,
    })

    res.status(200).json({
      message: 'Deleted Post',
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

// ===============================================================================================

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath)
  fs.unlink(filePath, err => console.log(err))
}
