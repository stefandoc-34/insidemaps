const path = require('path');

module.exports.getDynamicPageFrame = (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'main.html'));
};