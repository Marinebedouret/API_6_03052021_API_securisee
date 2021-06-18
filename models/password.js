const passwordValidator = require('password-validator');

//Création de la sécurisation d'un schéma de mot de passe 
const passwordValidatorSchema = new passwordValidator();

//Pour définir un mot de passe sécurisé
passwordValidatorSchema
.is().min(8)                //Longueur minimale
.is().max(20)               //Longueur maximale
.has().uppercase()          //Doit inclure des lettres majuscules
.has().lowercase()          //Doit inclure des lettres minuscules
.has().digits()             //Doit inclure des chiffres
.has().not().spaces()       //Pas d'espaces
.is().not().oneOf(['Passw0rd', 'Password123']); //Mot de passe qui ne sont acceptés

console.log(passwordValidatorSchema.validate('validPASS123'));
console.log(passwordValidatorSchema.validate('invalidPASS'));

console.log(passwordValidatorSchema.validate('joke', {list:true}));

module.exports = passwordValidatorSchema;