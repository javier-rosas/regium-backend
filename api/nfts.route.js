import express from 'express'
import NftsController from './nfts.controller.js'
import ReviewsController from './reviews.controller.js'
import FavoritesController from './favorites.controller.js'

const router = express.Router()


router.route("/").get( NftsController.apiGetNfts )
router.route("/id/:id").get( NftsController.apiGetNftById )
router.route("/descriptions").get( NftsController.apiGetDescriptions )

router.route("/review").post( ReviewsController.apiPostReview )
router.route("/review").put( ReviewsController.apiUpdateReview )
router.route("/review").delete( ReviewsController.apiDeleteReview )

router.route("/favorites").put(FavoritesController.apiUpdateFavorites)
router.route("/favorites/:userId").get(FavoritesController.apiGetFavorites)

export default router