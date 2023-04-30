//Aqui vou estrutura todo meu sistema de authetication 
const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//Model usuario
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

module.exports = (passport) => {
    passport.use(new localStrategy({usernameField: "email", passwordField:"senha"},(email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if(!usuario) {
                return done(null, false, {message: "Email ou Senha incorreta"});
            }
            
            bcrypt.compare(senha, usuario.senha, (error, batem) => {
                if(batem) {
                    return done(null, usuario)

                }else{
                    return done(null, false, {message: "Email ou Senha incorreta"});
                };
            });
        });
    }));
    //Salva os dados do usuario numa sessão 
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id);
    });

    passport.deserializeUser(async(id, done) => {
        try{
            const usuario = await Usuario.findById(id);
            done(null, usuario);
        }catch(err) {
            done(err, null);
        }
    });
};