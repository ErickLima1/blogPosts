const express = require("express");
const { route } = require("express/lib/application");
const { type } = require("express/lib/response");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require('../models/Postagem');
const Postagem = mongoose.model("postagem");
const {eAdmin} = require("../helpers/eAdmin");


router.get("/", eAdmin, (req, res) => {
    res.render("admin/index");
});

router.get("/posts", eAdmin, (req, res) => {
    res.send("Pagina de Post");
})
//Lista as Categorias salva no banco(vai aparecer na listagem do front)
router.get("/categorias", eAdmin, (req, res) => {
    Categoria.find().lean().sort({date: 'desc'}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias});

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin");
    })
})

router.post("/categorias/nova", eAdmin, (req, res) => {
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

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria");
            res.redirect("/admin");
        })
    }
})

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categorias) => {
        res.render("admin/editCategorias", {categorias: categorias});
    }).catch((err) => {
        req.flash("error_msg", "Esta Categoria Não Existe");
        res.redirect("/admin/categorias");
    });

});

router.post("/categorias/edit", eAdmin, (req, res) => {
    var erros = [];

    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        erros.push({texto: "Nome Invalido"});

    }else if(req.body.nome.length < 4) {
        erros.push({texto: "Nome da Categoria tem que ser mas de 5 caracteres"});
    }

    if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null) {
        erros.push({texto: "Slug Invalido"});
    }

    if(erros.length > 0) {
        res.render("admin/addCategorias", {erros: erros});
    }else{
        Categoria.findOne({_id: req.body.id}).then((categorias) => {
            categorias.nome = req.body.nome;
            categorias.slug = req.body.slug;
            categorias.data = new Date;
            
            categorias.save().then(() => {
                req.flash("success_msg", "Categoria Editada com Sucesso");
                res.redirect("/admin/categorias");
                
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro inesperado");
                res.redirect("/admin/categorias");
            });
    
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro inesperado ");
            res.redirect("/admin/categorias");
        });
    }
})

router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("error_msg", "Categoria Deletada");
        res.redirect("/admin/categorias");
        
    }).catch((err) =>  {
        req.flash("error_msg", "Houve um erro inesperado ");
        res.redirect("/admin/categorias");
    });
});

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render("admin/addCategorias");
});
//postagem
router.get("/postagem", eAdmin, (req, res) => {
    Postagem.find().lean().populate("categoria").sort({_id: -1 }).then((postagem) => {
        res.render("admin/postagens", {postagem: postagem});

    }).catch((err) => {
        req.flash("error_msg", "Houve um Erro Inesperado");
        res.redirect("/admin");
    });
});

router.get("/postagem/add", eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addPostagens", {categorias: categorias});
        
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro inesperado ");
    })
});

router.post("/postagem/nova", eAdmin, (req, res) => {
    var erros = [];

    if(!req.body.titulo || typeof req.body.titulo === undefined || req.body.titulo === null) {
        erros.push({texto: "Titulo Em Branco"});
    }

    if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null) {
        erros.push({texto: "Slug Em Branco"});
    }

    if(!req.body.conteudo || typeof req.body.conteudo === undefined || req.body.conteudo === null) {
        erros.push({texto: "Conteudo Em Branco"});
    }

    if(req.body.categorias == "0") {
        erros.push({texto: "Categoria Invalida, Registre uma Categoria"});
    }

    if(erros.length > 0) {
        res.render("admin/addPostagens", {erros: erros});
    }else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem Criada");
            res.redirect("/admin/postagem");
        }).catch((err) => {
            req.flash("error_msg", "Houve um Erro Inesperado");
            res.redirect("/admin/postagem");
        });
    }
});

router.get("/postagem/edit/:id", eAdmin, (req, res) => {
    Postagem.findOne({_id:req.params.id}).lean().populate("categoria").then((postagem) => {
        Categoria.find().lean().then((categorias ) => {
            res.render("admin/editPostagem", {categorias: categorias, postagem, postagem});

        }).catch((err) => {
            req.flash("error_msg", "Houve Um Error Ao Listar As Categorias");
            res.redirect("/admin/postagem");
        });

    }).catch((err) => {
        req.flash("error_msg", "Esta Postagem Não Existe");
        res.redirect("/admin/postagem");
    });

});

router.post("/postagem/edit", eAdmin, (req, res) => {
    var erro = [];
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;
        postagem.data = new Date;

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem Editada Com Sucesso");
            res.redirect("/admin/postagem");
        }).catch((err) => {
            req.flash("error_msg", "Erro Inesperado");
            res.redirect("/admin/postagem");
        });
    }).catch((err) => {
        req.flash("error_msg", "Houve Um Erro Inesperado");
        res.redirect("/admin/postagem");
    });
});

router.post("/postagem/deletar", eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash("error_msg", "Postagem Deletada");
        res.redirect("/admin/postagem");

    }).catch((err) => {
        req.flash("error_msg", "Houve um Erro Inesperado");
        req.redirect("/admin/postagem");
    });
});
 
module.exports = router;