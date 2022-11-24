const { validationResult } = require("express-validator");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "2047",
        title: "First post",
        ImageUrl: "images/icon.jpg",
        content: "This is first post!",
        creator: {
          name: "Nika",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Validation failed, entered data is incorrect.",
        errors: errors.array(),
      });
    }
    const title = req.body.title;
    const content = req.body.content;

    const post = new Post({
      title: title,
      content: content,
      imageUrl: "../images/icon.jpg",
      creator: {
        name: "Nika",
      },
    });

    const result = await post.save();

    res.status(201).json({
      message: "Post created successfully",
      post: result,
    });
  } catch (err) {
    console.log(err);
  }
};
