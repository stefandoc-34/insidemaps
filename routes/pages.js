const express = require('express');
const path = require('path');
const router = express.Router();
const pagesController = require(path.join(__dirname, '..', 'controllers', 'pages'));



//starting with root route '/'
router.get('/', pagesController.getDynamicPageFrame);
router.get('/result', pagesController.getDynamicPageFrame);
router.get('/about', pagesController.getDynamicPageFrame)

module.exports = router;