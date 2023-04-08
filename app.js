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

//config
// session
app.use(session({
    secret: "cursoNode",
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

//configurando Middleware
app.use((req, res, next) => {
    //declarando variaveis globals
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//Config do banco
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp").then(() => {
    console.log('Banco De Dados Connectado');
}).catch((err) => {
    console.log('Erro no banco de dados: ' + err);
});

//public - arquivos staticos
app.use(express.static(path.join(__dirname, "public")));

// app.use((req, res, next) => {
//     console.log("teste");
//     next();
// })

//Chamando outras Rotas
app.use('/admin', admin);

//Ligando Servidor
const port = process.env.port || 8081;
app.listen(port, () => {
    console.log("Servidor On");
});