const {isString, isNumber} = require('util')
const _clone = require('lodash/clone')
const _isEmpty = require('lodash/isEmpty')
const RECIPES_DATA = require('./data/recipes.json')
const req = require('express/lib/request')

module.exports = class Recipes {
    constructor() {
        this.recipes = []
        Object.assign(this.recipes, RECIPES_DATA)

        this.lastInsertId = this.recipes.length;
    }

    fetchAll() {
        return this.recipes
    }

    fetchOne(id) {
        if (!id) throw new Error(`ID de recette manquant`)

        id = Number(id)
        if (!isNumber(id)) throw new Error(`L'ID de recette doit être un nombre entier`)

        const recipe = this.recipes.find(r => r.id === id)

        if (!recipe) return null

        return recipe
    }

    create(req) {
        const recipeObj = req.body;
        if (!recipeObj) throw new Error(`Aucune donnée envoyée`)
        // Validation des données
        const fields = [
            'titre',
            'description',
            'niveau',
            'personnes',
            'tempsPreparation',
            'ingredients',
            'etapes'
        ]
        // Existance des données
        fields.forEach(field => {
            if (!recipeObj[field]) {
                throw new Error(`Champs "${field}" manquant`)
            }
        })

        // Structure des données
        recipeObj.titre            = String(recipeObj.titre)
        recipeObj.description      = String(recipeObj.description)
        recipeObj.niveau           = String(recipeObj.niveau)
        // recipeObj.personnes        = String(recipeObj.personnes)
        // recipeObj.tempsPreparation = String(recipeObj.tempsPreparation)

        // Niveaux
        const niveaux = ['padawan', 'jedi', 'maitre']
        if (!niveaux.includes(recipeObj.niveau)) {
            throw new Error(`Le champs "niveau" doit être l'un des suivants : ${niveaux.join(',')}`)
        }
        
        // Personnes
        const recipeObjPersonnes = parseInt(recipeObj.personnes);
        if (isNaN(recipeObjPersonnes)) {
            throw new Error(`Le champs "personnes" doit être un nombre entier`)
        }

        // Temps de préparation
        const recipeObjTempsPreparation = parseInt(recipeObj.tempsPreparation);
        if (isNaN(recipeObjTempsPreparation)) {
            throw new Error(`Le champs "tempsPreparation" doit être un nombre entier`)
        }

        // Ingrédients
        let recipeObjIngredients_ = recipeObj.ingredients;
        if (!Array.isArray(recipeObjIngredients_)) {
            if(typeof recipeObjIngredients_ != "string" || !recipeObjIngredients_.match(",")) {
                throw new Error(`Champs "ingredients" invalide. Cela doit être un tableau`);
            } else {
                recipeObjIngredients_ = [recipeObjIngredients_];
            }
           
        }
        const recipeObjIngredients = recipeObjIngredients_.map(ingredient => ingredient.split(","));
        if (!recipeObjIngredients.every(arr => Array.isArray(arr) && arr.length === 2 && arr.every(val => isString(val)))) {
            throw new Error(`Tableau "ingredients" invalide. Cela doit être un tableau de sous-tableaux ayant 2 valeurs :\nPar exemple :  [ ["8","feuilles de brick"] , ["1","oeuf"] , ... ]`)
        }

        // Etapes
        let recipeObjEtapes = recipeObj.etapes;
        if (!Array.isArray(recipeObjEtapes)) {
            if(typeof recipeObjEtapes != "string") {
                throw new Error(`Champs "ingredients" invalide. Cela doit être un tableau`);
            } else {
                recipeObjEtapes = [recipeObjEtapes];
            }
        }
        if (recipeObjEtapes.every(etape => !isString(etape))) {
            throw new Error(`Champs "etapes" invalide. Cela doit être un tableau contenant des chaînes de caractères`)
        }

        // Pas d'erreurs, on sauvegarde
        const newRecipe = {
            "id"               : ++this.lastInsertId,
            "titre"            : recipeObj.titre,
            "description"      : recipeObj.description,
            "niveau"           : recipeObj.niveau,
            "personnes"        : recipeObjPersonnes,
            "tempsPreparation" : recipeObjTempsPreparation,
            "ingredients"      : recipeObjIngredients,
            "etapes"           : recipeObjEtapes
        }

        // Photo (facultatif)
        if(req.file && req.file.filename) {
            // console.log("there is a photo !");
            newRecipe["photo"] = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        }
        
        // if (recipeObj.photo && "string" === typeof recipeObj.photo) {
        //     newRecipe["photo"] = recipeObj.photo;
        // }

        this.recipes.push(newRecipe)

        // Retourne l'objet créé
        return newRecipe
    }

    update(recipeObj, req) {
        const fields = req.body;
        // console.log(fields);
        if (!recipeObj || !fields || _isEmpty(fields)) throw new Error(`Aucune donnée envoyée`)

        // Titre
        if (fields.titre)
            recipeObj.titre = String(fields.titre)
        
        // Description
        if (fields.description)
            recipeObj.description = String(fields.description)

        // Niveaux
        if (fields.niveau) {
            const niveaux = ['padawan', 'jedi', 'maitre']

            if (!niveaux.includes(fields.niveau))
                throw new Error(`Le champs "niveau" doit être l'un des suivants : ${niveaux.join(',')}`)
            
            recipeObj.niveau = String(fields.niveau)
        }
        
        // Personnes

        if (fields.personnes) {
            const personnes = parseInt(fields.personnes);
            if (isNaN(personnes)) {
                throw new Error(`Le champs "personnes" doit être un nombre entier`)
            }
            recipeObj.personnes = personnes
        }

        // Temps de préparation
        if (fields.tempsPreparation) {
            const tempsPreparation = parseInt(fields.tempsPreparation);
            if (isNaN(tempsPreparation)) {
                throw new Error(`Le champs "tempsPreparation" doit être un nombre entier`)
            }
            recipeObj.tempsPreparation = tempsPreparation
        }

        // Ingrédients
        let recipeObjIngredients_ = fields.ingredients;
        if (recipeObjIngredients_) {
            if (!Array.isArray(recipeObjIngredients_)) {
                if(typeof recipeObjIngredients_ != "string" || !recipeObjIngredients_.match(",")) {
                    throw new Error(`Champs "ingredients" invalide. Cela doit être un tableau`);
                } else {
                    recipeObjIngredients_ = [recipeObjIngredients_];
                }
               
            }
            const recipeObjIngredients = recipeObjIngredients_.map(ingredient => ingredient.split(","));
            if (!recipeObjIngredients.every(arr => Array.isArray(arr) && arr.length === 2 && arr.every(val => isString(val)))) {
                throw new Error(`Tableau "ingredients" invalide. Cela doit être un tableau de sous-tableaux ayant 2 valeurs :\nPar exemple :  [ ["8","feuilles de brick"] , ["1","oeuf"] , ... ]`)
            }
            recipeObj.ingredients = recipeObjIngredients;
        }

        // Etapes
        let recipeObjEtapes = fields.etapes;

        if (recipeObjEtapes) {
            if (!Array.isArray(recipeObjEtapes)) {
                if(typeof recipeObjEtapes != "string") {
                    throw new Error(`Champs "ingredients" invalide. Cela doit être un tableau`);
                } else {
                    recipeObjEtapes = [recipeObjEtapes];
                }
            }
            if (recipeObjEtapes.every(etape => !isString(etape))) {
                throw new Error(`Champs "etapes" invalide. Cela doit être un tableau contenant des chaînes de caractères`)
            }
            recipeObj.etapes = recipeObjEtapes;
        }

        // Photo (facultatif)
        if(req.file && req.file.filename) {
            console.log("there is a photo !");
            recipeObj["photo"] = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        }

        const index = this.recipes.findIndex(r => r.id === recipeObj.id);
        this.recipes[index] = recipeObj;
        // console.log(this.recipes[index], recipeObj);
        // Pas d'erreurs, on retourne l'objet créé
        return recipeObj
    }

    delete(recipeObj) {
        const recipeIndex = this.recipes.findIndex(recipe => recipe.id === recipeObj.id)

        if (!recipeIndex) throw new Error(`Rien à supprimer`)

        this.recipes.splice(recipeIndex, 1)

        return recipeObj
    }
}