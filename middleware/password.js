const passwordValidatorSchema = require('../models/password');

module.exports = (req, res, next) => {
    if (!passwordValidatorSchema.validate(req.body.password)) {
        res.writeHead(400, '{"Message": "Mot de passe requis de 8 caractères minimun avec au moins une majuscule, une minuscule, un chiffre et sans espace !"}', 
        {
            'content-type': 'application/json'
        });
        res.end('Le format du mot de passe est incorrect !');
    } else {
        next();
    }
};