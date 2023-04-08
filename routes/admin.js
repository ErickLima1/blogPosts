const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");

router.get("/", (req, res) => {
    res.render("admin/index")
});

router.get("/posts", (req, res) => {
    res.send("Pagina de Post");
})

router.get("/categorias", (req, res) => {
    Categoria.find().lean().sort({date: 'desc'}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias});

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin");
    })
})

router.post("/categorias/nova", (req, res) => {
    var erros = [];

    if (!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        erros.push({texto: "Nome Invalido"});

    } else if(req.body.nome.length < 4) {
        erros.push({texto: "Nome da Categoria tem que ser mas de 5 caracteres"});
    }

    if (!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null) {
        erros.push({texto: "Slug Invalido"});

    }

    if(erros.length > 0) {
        res.render("admin/addCategorias", {erros: erros});

    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            console.log("Categoria Salva");
            req.flash("success_msg", "Categoria Criada");
            res.redirect("/admin/categorias");
        }).catch( (err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria");
            res.redirect("/admin");
        })
    }
})

router.get('/categorias/add', (req, res) => {
    res.render("admin/addCategorias");
});

module.exports = router;