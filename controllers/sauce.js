const Sauce = require('../models/sauce');
const fs = require('fs');

//Permet de créer les sauces
exports.createSauce =  (req, res, next) => {
    //On stocke les données envoyées par le frot de from-data dans la variable sauceObject en les transformant en JSON
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
    .then(() => res.status(201).json({message: 'Sauce enregistré !'}))
    .catch(error => res.status(400).json({error}));
};

//Permet de modifier une sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
     } : { ...req.body };
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
    .then(() => res.status(200).json({message:'Sauce modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

//Permet de supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({_id: req.params.id})
            .then(() => res.status(200).json({message: 'Sauce supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        });
    })
    .catch( error => res.status(500).json({ error }));
};

//Permet de récupérer l'id d'une sauce depuis la base de données MongoDB
exports.getOneSauce = (req, res, next) => {
    console.log(req.params.id);
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error}));
};


//Permet d'accéder à toutes les sauces
exports.getAllSauce =  (req, res, next) => {
    Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}));
};

//Fonction qui permet d'évaluer les sauces "like" "dislike"
exports.likeDislikeSauce = (req, res, next) => {
    switch (req.body.like) {
    //Cas = 1 like l'utilisateur aime la sauce
        case 1 :
                Sauce.updateOne({ _id: req.params.id},{
                    $inc: { likes: +1 },
                    //Ajoute l'utilisateur au tableau array usersLiked
                    $push: {usersLiked: req.body.userId},
                })
                .then(() => res.status(200).json({message: 'Like ajouté'}))
                .catch(error => res.status(400).json({ error }));
                break;
    //cas = -1 n'aime pas la sauce
        case -1 :
            Sauce.updateOne({ _id: req.params.id}, {
                $inc: { dislikes: +1},
                $push: {usersDisliked: req.body.userId}
            })
            .then(() => res.status(200).json({message:'Dislike ajouté'}))
            .catch (error => res.status(400).json({ error }));
            break;
     //Cas = 0 like
        case 0 :
            Sauce.findOne({ _id: req.params.id })
            .then((sauce)=> {
                //Si on doit annuler un like
                if (sauce.usersLiked.includes(userId)) {
                    //Si oui mise à jour de la sauce avec le _id présent dans la requête
                    Sauce.updateOne({ _id: req.params.id}, {
                        //$inc incrémente de -1
                        $inc: { likes: -1 },
                        //$pull supprime du tableau l'utilisateur
                        $pull: { usersLiked: req.body.userId}
                    })
                    .then(() => res.status(200).json({message: 'Like retiré'}))
                    .catch(error => res.status(400).json({ error }));
                }
                if(sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({ _id: req.params.id}, {
                        $inc: { dislikes : -1},
                        $pull: { usersDisliked: req.body.userId}
                    })
                    .then(() => res.status(200).json({ message:"Dislike retiré"}))
                    .catch(error => res.status(400).json ({ error }));
                }
            })
            .catch((error) => res.status(404).json({ error }));
            break;
    }

}