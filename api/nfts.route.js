import express from "express";
import NftsController from "./nfts.controller.js";
import ReviewsController from "./reviews.controller.js";
import FavoritesController from "./favorites.controller.js";
import UsersController from "./users.controller.js";

const router = express.Router();

router.route("/").get(NftsController.apiGetNfts);
router.route("/id/:id").get(NftsController.apiGetNftById);
router.route("/genres").get(NftsController.apiGetGenres);
router.route("/likes").put(NftsController.apiUpdateLikes);
router.route("/most-liked").get(NftsController.apiGetMostLikedNfts);
router.route("/random").get(NftsController.apiGetRandomNfts);

router.route("/review").post(ReviewsController.apiPostReview);
router.route("/review").put(ReviewsController.apiUpdateReview);
router.route("/review").delete(ReviewsController.apiDeleteReview);

router.route("/favorites").put(FavoritesController.apiUpdateFavorites);
router.route("/favorites/:userId").get(FavoritesController.apiGetFavorites);

router.route("/user/:userId").get(UsersController.apiGetUser);
router.route("/user").put(UsersController.apiUpdateUser);


router.route("/mint").post(NftsController.apiMintNft);

router.route("/sell").put(NftsController.apiSellNft);
router.route("/buy").put(NftsController.apiBuyNft);


export default router;
