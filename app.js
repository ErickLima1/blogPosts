//Carregando modulos
const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
//Chamando Modulo de Postagem
require("./models/Postagem");
const Postagem = mongoose.model("postagem");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const usuarios = require("./routes/usuario");
const passport = require("passport");
const eAdmin = require("./helpers/eAdmin");
require("./config/auth")(passport);
const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

//config
// session
app.use(session({
    secret: "cursoNode",
    resave: true,
    saveUninitialized: true
}));
//configurando o passport(session/initialize para login);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//configurando Middleware
app.use((req, res, next) => {
    //declarando variaveis globals
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    res.locals.eAdmin = eAdmin || null;
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//opção de segurança que impede o acesso a propriedades que não são próprias do objeto pai. Tive que tirar isso para consegue terminar o projeto
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars');

//Criando Verificação de valores são iguals para edipostagem
// const handlebars = require('handlebars');
// const { Console } = require("console");
// const { redirect } = require("express/lib/response");
// const passport = require("passport");

//Configurando o mongose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp").then(() => {
    console.log('Banco De Dados Connectado');
}).catch((err) => {
    console.log('Erro no banco de dados: ' + err);
});

//public - arquivos staticos
app.use(express.static(path.join(__dirname, "public")));

//Chamando outras Rotas
app.get("/", (req, res) => {
    Postagem.find().lean().populate("categoria").sort({_id: -1}).then((postagem) => {
        postagem.forEach((p) => {
            p.dataFormatada = new Date(p.data).toLocaleDateString('pt-BR') //Colocando a data PT-BR
        });
        res.render("index", {postagem: postagem});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro inesperado ");
        res.redirect("/404");
    });
});
//Fazendo de uma forma diferente só para ter noção que pode fazer diferente!
app.get("/postagem/:slug", async (req, res) => {
    try {
        const postagem = await Postagem.findOne({slug: req.params.slug}).lean();
        if(postagem) {
            postagem.dataFormatada = new Date(postagem.data).toLocaleDateString("pt-BR");
            res.render("postagem/index", {postagem});
        } else {
            req.flash("error_msg", "Esta Postagem Não Existe!");
            res.redirect("/");
        }
    } catch (err) {
        req.flash("error_msg", "Houve um erro inesperado");
        res.redirect("/");
    }
});

app.get("/404", (req, res) => {
    res.render("error404");
});

app.get("/categorias", (req,res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("categorias/index", {categorias: categorias});

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro inesperado ao listar as categorias");
        res;redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({slug: req.params.slug}).lean().then((categorias) => {
        if(categorias) {
            Postagem.find({categoria: categorias._id}).lean().then((postagem) => {
                res.render("categorias/postagens", {postagem: postagem, categorias: categorias});

            }).catch((err)  => {
                req.flash("error_msg", "Houve um erro ao listar os post!");
                res.redirect("/");
                
            });
        }else{
            req.flash("error_msg", "Houve um erro inesperado ao carregar essa categoria.");
            res.redirect("/");
        }

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro inesperado ao carregar a página da categoria");
        res.flash("/");  
    });
});


app.use('/admin', admin);
app.use("/usuarios", usuarios);

//Ligando Servidor
const port = process.env.port || 8081;
app.listen(port, () => {
    console.log(`Servidor On no http://localhost:${port}/`);
});