//Carregando modulos
const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");

//config
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
const port = 8081;
app.listen(port, () => {
    console.log("Servidor On");
});