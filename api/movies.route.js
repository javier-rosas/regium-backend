import express from 'express'
import MoviesController from './movies.controller.js'
import ReviewsController from './reviews.controller.js'
import FavoritesController from './favorites.controller.js'

const router = express.Router()


router.route("/").get( MoviesController.apiGetMovies )
router.route("/id/:id").get( MoviesController.apiGetMovieById )
router.route("/ratings").get( MoviesController.apiGetRatings )

router.route("/review").post( ReviewsController.apiPostReview )
router.route("/review").put( ReviewsController.apiUpdateReview )
router.route("/review").delete( ReviewsController.apiDeleteReview )

router.route("/favorites").put(FavoritesController.apiUpdateFavorites)
router.route("/favorites/:userId").get(FavoritesController.apiGetFavorites)

export default router