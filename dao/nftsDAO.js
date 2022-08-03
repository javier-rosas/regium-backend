import mongodb from "mongodb"
const objectId = mongodb.ObjectId

let nfts;

export default class NftsDAO {

    static async injectDB(conn) {
        if (nfts) {
            return
        }
        try {
            nfts = await conn.db(process.env.NFT_NS).collection("nfts")
        } catch(e) {
            console.error( `Unable to connect in NftDAO: ${e}`)
        }
    }

    static async getNfts({
        filters = null,
        page = 0, 
        nftsPerPage = 20} = {}) {
            
        let query; 

        if (filters) {
            if ("name" in filters) {
                query = { $text: { $search: filters['name'] } }
            } else if ("description" in filters){
                query = { "description": { $eq : filters['description'] } }
            }
        }

        let cursor;
        try {
            cursor = await nfts.find(query).
                                  limit(nftsPerPage).
                                  skip(nftsPerPage * page)

            const nftsList = await cursor.toArray()
            const totalNumNfts = await nfts.countDocuments(query)
            return { nftsList, totalNumNfts }

        } catch(e) {
            console.error(`Unable to issue find command, ${e}`)
            return { nftsList: [], totalNumNfts : 0 }

        }

    }

    static async getDescriptions(){

        let descriptions = []
        try {
            descriptions = await nfts.distinct("rated")
            return descriptions
        } catch(e) {
            console.log(`Unable to get ratings, ${e}`)
            return descriptions
        }

    }

    static async getNftById(id){

        try {
            return await nfts.aggregate([
                {
                    $match : {
                        _id : new objectId(id)
                    }
                },
                {
                    $lookup : {
                        from : "reviews",
                        localField : "_id",
                        foreignField : "nft_id",
                        as : "reviews"
                    }
                }
            ]).next()
        } catch(e) {
            console.error(`Something wrong in getNftById, ${e}`)
            throw e
        }

    }

}
