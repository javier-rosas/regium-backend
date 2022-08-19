import mongodb from "mongodb";
const objectId = mongodb.ObjectId;

let nfts;
let users;
export default class NftsDAO {
  static async injectDB(conn) {
    if (nfts || users) {
      return;
    }
    try {
      nfts = await conn.db(process.env.NFT_NS).collection("nfts");
      users = await conn.db(process.env.NFT_NS).collection("users");
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
          { $limit: 12 },
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

  static async modifyOwnerNftArray(googleId, nftId, isPush) {
    try {
      let res;
      if (isPush) {
        res = await users.updateOne(
          { _id: googleId },
          { $push: { nfts_owned: nftId.toString() } },
          { upsert: true }
        );
      } else {
        res = await users.updateOne(
          { _id: googleId },
          { $pull: { nfts_owned: nftId.toString() } },
          { upsert: true }
        );
      }
      return res;
    } catch (e) {
      console.error(`Unable to modify owner array: ${e}`);
      return { error: e };
    }
  }

  static async modifyBalance(googleId, increment, amount) {
    try {
      let res;
      if (increment) {
        res = await users.updateOne(
          { _id: googleId },
          { $inc: { balance: amount } },
          { upsert: true }
        );
      } else {
        res = await users.updateOne(
          { _id: googleId },
          { $inc: { balance: -amount } },
          { upsert: true }
        );
      }
      return res;
    } catch (e) {
      console.error(`Unable to modify balance: ${e}`);
      return { error: e };
    }
  }

  static async mintNft(
    name,
    description,
    owner,
    upForSale,
    price,
    genre,
    imageLink,
    likes
  ) {
    try {
      const nftDoc = {
        name: name,
        description: description,
        owner: owner,
        upForSale: upForSale,
        price: price,
        genre: genre,
        imageLink: imageLink,
        likes: likes,
      };
      let res = await nfts.insertOne(nftDoc);
      this.modifyOwnerNftArray(nftDoc.owner, res.insertedId.toString(), true);
      return res;
    } catch (e) {
      console.error(`Unable to mint nft (DAO): ${e}`);
      return { error: e };
    }
  }

  static async sellNft(nftId, price, upForSale) {
    try {
      const res = await nfts.updateOne(
        { _id: new objectId(nftId) },
        {
          $set: {
            price: price,
            upForSale: upForSale,
          },
        },
        { upsert: true }
      );
      return res;
    } catch (e) {
      console.error(`Unable to sell nft (DAO): ${e}`);
      return { error: e };
    }
  }

  static async checkUserBalance(userId) {
    let cursor;
    try {
      cursor = await users.find(
        { _id: userId },
        { projection: { _id: 0, balance: 1 } }
      );
      const balance = await cursor.toArray();
      return balance;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  static async buyNft(nftId, userId) {
    let cursor;
    try {
      cursor = await this.checkUserBalance(userId);
      const nft = await this.getNftById(nftId);
      console.log("cursor", cursor);
      let balance
      if (cursor.length > 0) balance = cursor[0].balance;
      if (balance > nft.price && nft.upForSale) {
        this.modifyBalance(nft.owner, true, parseFloat(nft.price));
        this.modifyBalance(userId, false, parseFloat(nft.price));

        const updateNft = await nfts.updateOne(
          { _id: new objectId(nftId) },
          {
            $set: {
              upForSale: false,
              owner: userId,
              lastBought: Date.now(),
            },
          },
          { upsert: true }
        );

        nfts.updateOne(
          { _id: new objectId(nftId) },
          { $inc: { numTransactions: 1 } },
          { upsert: true }
        );

        console.log("updateNFT nftsDAO js", updateNft);

        this.modifyOwnerNftArray(nft.owner, nft._id, false);
        this.modifyOwnerNftArray(userId, nft._id, true);

        if (!updateNft.modifiedCount && !updateNft.upsertedCount) {
          console.error(`NFT could not be bought`);
          return;
        }
        return updateNft;
      } else {
        return { status: "invalid balance or not up for sale" };
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
