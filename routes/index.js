const express = require('express'); 
const router = express.Router(); 
const rateLimit = require('express-rate-limit');

// import db constants
const { Sequelize } = require('../db'); 
const db = require('../db'); 
const { Op } = Sequelize;  // load operations module
const { Post } = db.models;
const { User } = db.models;

// use express-rate-limit package to limit registration and login requests 
const rateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const loginCheck = function (req, res, next) {
    if (req.session && req.session.userId) {
        return next()
    } else {
        let err = new Error('You must be logged in to perform this action.');
        err.status = 401;
        return next(err);
    }
};

const postsPerPage = 10;

// GET /
router.get('/', async (req, res) => {
    // show draft posts if user logged in
    const allowedStatuses = req.session.userId ? ['live', 'draft'] : ['live'];
    const postCount = await Post.count({ where: { status: {[Op.or]: allowedStatuses} } }); 
    // determine if pagination needed
    const nextPage = (postCount > postsPerPage) ? 2 : null; 
    const posts = await Post.findAll({ where: { status: {[Op.or]: allowedStatuses} }, order: [[ 'createdAt', 'DESC' ]], limit: postsPerPage }); 
    res.render('index', { posts, nextPage }); 
}); 

// GET /register
router.get('/register', (req, res) => {
    res.render('register', { title: "Register" }); 
}); 

// POST /register
router.post('/register', rateLimiter, async (req, res, next) => {

    // ensure email is unique
    const emailEntered = req.body.email;
    const emails = await User.findAll({ 
        attributes: ['email'],
        order: [[ 'email', 'ASC' ]] 
    });
    let emailExists;
    for (let email of emails) {
        if (emailEntered === email.dataValues.email) {
            emailExists = true; 
            break
        }
    }
    if (emailExists) {
        const err = new Error('Email is already registered');
        err.status = 401; 
        next(err);
    } else {
        //ensure email is on approved list
        if (req.body.email === process.env.APPROVED_EMAIL) {
            const user = await User.create(req.body); 
            req.session.userId = user.id;
            res.redirect('/'); 
        } else {
            const err = new Error('Email is not on approved list');
            err.status = 401;
            next(err);
        }
    }
}); 

// GET /login
router.get('/login', (req, res) => {
    res.render('login', { title: "Login" }); 
}); 

// POST /login
router.post('/login', rateLimiter, async (req, res, next) => { 
    // ensure email on approved list
    if (req.body.email === process.env.APPROVED_EMAIL) {
        const user = await User.findOne({where: {email: req.body.email}}); 
        // ensure passwords match
        const passwordMatch = await user.checkPasswordMatch(req.body.password, user.password);
        if (passwordMatch) {
            req.session.userId = user.id;
            res.redirect('/');
        } else {
            let err = new Error('Passwords do not match');
            err.status = 401;
            next(err); 
        }
    } else {
        const err = new Error('Email is not on approved list');
        err.status = 401;
        next(err);
    }
}); 

// GET /logout
router.get('/logout', function(req, res, next) {
    req.session.destroy();
    return res.redirect('/'); 
});  

// GET /prequal
router.get('/prequal', (req, res) => {
    res.render('prequal', { title: "New prequal" }); 
}); 

// GET /:slug
router.get('/:slug', async (req, res, next) => {
    try {
        const post = await Post.findOne({where: {slug: req.params.slug}});
        // throw error if unauthenticated user attempting to view draft post
        if(post.status == 'draft' && !req.session.userId) {
            let err = new Error('You must be logged in to perform this action.');
            err.status = 401;
            return next(err);
        }
        res.render('post', { post, title: post.title } );
    } 
    catch(err) {
        err = new Error("This post could not be found.");
        err.status = 404;
        next(err); 
    }
}); 

module.exports = router;