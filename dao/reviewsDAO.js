import mongodb from "mongodb"
const objectId = mongodb.ObjectId

let reviews;

export default class ReviewsDAO {

    static async injectDB(conn) {
        if (reviews) {
            return
        }
        try {
            reviews = await conn.db(process.env.NFT_NS).collection("reviews")
        } catch(e) {
            console.log(`Unable to establish a connection handle in reviewsDA: ${e}`)
        }
    }

    static async addReview(nftId, user, review, date) {
        try {
            const reviewDoc = {
                name : user.name, 
                user_id : user._id, 
                date : date, 
                review : review, 
                nft_id : objectId(nftId)
            }
            let res = await reviews.insertOne( reviewDoc )
            return res
        } catch(e) {
            console.error(`Unable to post review: ${e}` )
            return { error : e }
        }
    }

    static async updateReview(userInfo, reviewId, review, date) {

        try {
            const reviewDoc = {
                name : userInfo.name,
                user_id : userInfo._id,
                review : review,
                date : date
            }
            
            let res = await reviews.updateOne( { _id : new objectId(reviewId) }, { $set: reviewDoc } )
            let modifiedCount = res.modifiedCount
            if (!modifiedCount){
                console.error(`A change was not made` )
                return
            }
            return res
        } catch(e) {
            console.error(`Unable to post review: ${e}` )
            return { error : e }
        }

    }

    static async deleteReview(reviewId) {

        try {
            let res = await reviews.deleteOne( { _id : new objectId(reviewId) } )
            let deletedCount = res.deletedCount
            if (!deletedCount){
                console.error(`No document deleted` )
                return
            }
            return res
        } catch(e) {
            console.error(`Unable to post review: ${e}` )
            return { error : e }
        }
    }
}

