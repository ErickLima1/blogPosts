module.exports = {
    eAdmin: (req, res, next) => {
      if (!req.isAuthenticated()) {
        req.flash("error_msg", "Você precisa estar logado para acessar esta página.");
        return res.redirect("/");
      }
  
      if (req.user.eAdmin !== 1) {
        req.flash("error_msg", "Você não tem permissão para acessar esta página.");
        return res.redirect("/");
      }
  
      return next();
    }
  };
  