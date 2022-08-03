import ReviewsDAO from "../dao/reviewsDAO.js";

export default class ReviewsController {

    static async apiPostReview(req, res, next) {
        // TODO:

        try {
            const nftId = req.body.nft_id 
            const review = req.body.review 
            const userInfo = {
                name : req.body.name,
                _id : req.body.user_id 
            }

            const date = new Date()

            const reviewResponse = await ReviewsDAO.addReview(
                nftId, 
                userInfo, 
                review, 
                date
            )

            let {error} = reviewResponse 
            console.log(error)

            if (error) {
                res.status(500).json( { error : "Unable to post review" } )
            } else {
                res.json( { status : "success" } )
            }

        } catch(e) {
            res.status(500).json( { error : e.message } )
        }

    }

    static async apiUpdateReview(req, res, next) {
        // TODO:
        try {
            const reviewId = req.body._id
            const review = req.body.review 
            const userInfo = {
                name : req.body.name,
                _id : req.body.user_id 
            }

            const date = new Date()

            const reviewResponse = await ReviewsDAO.updateReview(
                userInfo,
                reviewId,
                review, 
                date
            )
            let {error} = reviewResponse 
            console.log(error)
            if (error) {
                res.status(500).json( { error : "Unable to post review" } )
            } else {
                res.json( { status : "success" } )
            }
        } catch(e) {
            res.status(500).json( { error : e.message } )
        }


    }

    static async apiDeleteReview(req, res, next) {
        // TODO:

        try {
            const reviewId = req.body._id
            const userId = req.body.user_id 

            const reviewResponse = await ReviewsDAO.deleteReview(
                reviewId,
                userId
            )

            let {error} = reviewResponse 
            console.log(error)

            if (error) {
                res.status(500).json( { error : "Unable to post review" } )
            } else {
                res.json( { status : "success" } )
            }

        } catch(e) {
            res.status(500).json( { error : e.message } )
        }
    }

}