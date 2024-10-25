exports.IsloggedIn = (req, res, next)=>{
    if(req.session.user){
        next()
    }else{
        res.redirect('/login')
    }
}

exports.byPassLogin = (req, res, next)=>{
    if(!req.session.user){
        next()
    }else{
        res.redirect("/")
    }
}