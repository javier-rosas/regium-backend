import UsersDAO from "../dao/usersDAO.js";

export default class UsersController {

  static async apiUpdateUser(req, res, next) {
    try {
      const userData = req.body
      const userResponse = await UsersDAO.updateUser(userData)
      
      let {error} = userResponse

      if (error) {
        console.log(error)
        res.status(500).json( { error : "Unable to post user" } )
      } else {
        res.json( { status : "success" } )
      }
  } catch(e) {
      res.status(500).json( { error : e.message } )
    }
  }

  static async apiGetUser(req, res, next) {
    try {
      let userId = req.params.userId 
      let user = await UsersDAO.getUser(userId)

      if (!user) {
        res.status(404).json( {error: "not found"} )
        return 
      }
      res.json(user)
      
    } catch (e) {
      console.log(`API, ${e}`)
      res.status(500).json( {error: e} )
    }
  }

}


