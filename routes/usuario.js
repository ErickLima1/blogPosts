const express = require("express");
const { type } = require("express/lib/response");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
});

router.post("/registro", (req, res) => {
    var erros =[];

    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        erros.push({texto: "Nome Invalido"});
    };

    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
        erros.push({texto: "E-mail Invalido"});

    };

    if(!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null) {
        erros.push({texto: "Senha Invalida"});

    }else if(req.body.senha.length < 7)  {
        erros.push({texto: "Senha Muito Curta !"})
    };

    if(req.body.senha != req.body.repetirSenha ) {
        erros.push({texto: "As Senhas São Diferentes, Tente novamente!"})
    };

    if(erros.length > 0) {
        res.render("usuarios/registro", {erros: erros});

    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario) {
                req.flash("error_msg", "Já Existe uma Conta com este E-mail!");
                res.redirect("/usuarios/registro");
            }else{
                const newUsuario =  new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });
                //Adicionando o hash 
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(newUsuario.senha, salt, (erro, hash) => {
                        if(erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuario. ")
                            res.redirect("/");
                        };

                        newUsuario.senha = hash;
                        
                        newUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário Criado com Sucesso!")
                            res.redirect("/");
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar um usuário, tente novamente!");
                            res.redirect("/usuarios/registro");
                        });
                    });
                });
            };
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro inesperado!")
            res.redirect("/");
        });
    }
});

router.get("/login", (req, res) => {
    res.render("usuarios/login");

});
//Adicionando autheticate no login
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next);
});

module.exports = router;