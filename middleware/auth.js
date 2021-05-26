const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'H7K3H9CV93JLOBE792F7HDIENF720746DJRNTPAI73FEODP000DGEK3BDU6VEIN3GKE77796DKH37HKAOU2NEYNVT9JETIENF63KDYVENITV6OHTV8KTVEI289HEV4');
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw 'User ID non valable !';
        } else { 
            next();

        }
    } catch (error) {
        res.status(401).json ({ error: 'Requête non authentifiée !'});
    }

};