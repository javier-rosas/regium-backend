import FavoritesDAO from '../dao/favoritesDAO.js'

export default class FavoritesController {

  static async apiUpdateFavorites(req, res, next) {
    try {
      const FavoritesResponse = await FavoritesDAO.updateFavorites(req.body._id, req.body.favorites)
      let { error } = FavoritesResponse
      if (error) {
        res.status(500).json({ error })
      }
      res.json( { status: "Success" } )
    } catch (e) {
      res.status(500).json( { error : e.message } )
    }
  }

  static async apiGetFavorites(req, res, next) {
    try {
      let id = req.params.userId 
      let favorites = await FavoritesDAO.getFavorites(id)
      if (!favorites) {
        res.status(404).json( {error: "not found"} )
        return 
      }
      res.json(favorites)
    } catch (e) {
      console.log(`API, ${e}`)
      res.status(500).json( {error: e} )
    }
  }
}