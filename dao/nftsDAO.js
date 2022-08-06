import mongodb from "mongodb";
const objectId = mongodb.ObjectId;

let nfts;

export default class NftsDAO {
  static async injectDB(conn) {
    if (nfts) {
      return;
    }
    try {
      nfts = await conn.db(process.env.NFT_NS).collection("nfts");
    } catch (e) {
      console.error(`Unable to connect in NftDAO: ${e}`);
    }
  }

  static async getNfts({ filters = null, page = 0, nftsPerPage = 20 } = {}) {
    let query;

    if (filters) {
      if ("name" in filters) {
        query = { $text: { $search: filters["name"] } };
      }
      if ("genre" in filters) {
        query = { genre: { $eq: filters["genre"] } };
      }
    }

    let cursor;
    try {
      cursor = await nfts
        .find(query)
        .limit(nftsPerPage)
        .skip(nftsPerPage * page);

      const nftsList = await cursor.toArray();
      const totalNumNfts = await nfts.countDocuments(query);
      return { nftsList, totalNumNfts };
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return { nftsList: [], totalNumNfts: 0 };
    }
  }

  static async getGenres() {
    let genres = [];
    try {
      genres = await nfts.distinct("genre");
      return genres;
    } catch (e) {
      console.log(`Unable to get genres, ${e}`);
      return genres;
    }
  }

  static async getNftById(id) {
    try {
      return await nfts
        .aggregate([
          {
            $match: {
              _id: new objectId(id),
            },
          },
          {
            $lookup: {
              from: "reviews",
              localField: "_id",
              foreignField: "nft_id",
              as: "reviews",
            },
          },
        ])
        .next();
    } catch (e) {
      console.error(`Something wrong in getNftById, ${e}`);
      throw e;
    }
  }

  static async updateLikes(id, increaseFlag) {
    try {
      let val;
      increaseFlag ? (val = 1) : (val = -1);
      const updateResponse = await nfts.updateOne(
        { _id: new objectId(id) },
        { $inc: { likes: val } },
        { upsert: true }
      );
      return updateResponse;
    } catch (e) {
      console.error(`Unable to update likes: ${e}`);
      return { error: e };
    }
  }

  static async getMostLikedNfts() {
    try {
      const getResponse = await nfts
        .aggregate([
          // First sort all the docs by name
          { $sort: { likes: -1 } },
          // Take the first 15 of those
          { $limit: 15 },
        ])
        .toArray();
      return getResponse;
    } catch (e) {
      console.error(`Unable to get most liked nfts: ${e}`);
      return { error: e };
    }
  }

  static async getRandomNfts(num) {
    try {
      // Get one random document from the nfts collection
      const response = await nfts
        .aggregate([{ $sample: { size: Number(num) } }])
        .toArray();
      return response;
    } catch (e) {
      console.log(`Unable to get random nfts: ${e}`);
      return { error: e };
    }
  }
}
