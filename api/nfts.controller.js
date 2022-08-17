import NftsDAO from "../dao/nftsDAO.js";

export default class NftsController {
  static async apiGetNfts(req, res, next) {
    const nftsPerPage = req.query.nftsPerPage
      ? parseInt(req.query.nftsPerPage)
      : 20;
    const page = req.query.page ? parseInt(req.query.page) : 0;

    let filters = {};

    if (req.query.genre) {
      filters.genre = req.query.genre;
    } else if (req.query.name) {
      filters.name = req.query.name;
    }

    const { nftsList, totalNumNfts } = await NftsDAO.getNfts({
      filters,
      page,
      nftsPerPage,
    });

    let response = {
      nfts: nftsList,
      page: page,
      filters: filters,
      entries_per_page: nftsPerPage,
      total_results: totalNumNfts,
    };

    res.json(response);
  }

  static async apiGetNftById(req, res, next) {
    try {
      let id = req.params.id || {};
      let nft = await NftsDAO.getNftById(id);
      if (!nft) {
        res.status(404).json({ error: "not found" });
        return;
      }
      res.json(nft);
    } catch (e) {
      console.log(`API, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiGetGenres(req, res, next) {
    try {
      let nftGenres = await NftsDAO.getGenres();
      res.json(nftGenres);
    } catch (e) {
      console.log(`API, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiUpdateLikes(req, res, next) {
    try {
      const LikesResponse = await NftsDAO.updateLikes(
        req.body._id,
        req.body.increaseFlag
      );
      let { error } = LikesResponse;
      if (error) {
        res.status(500).json({ error });
      }
      res.json({ status: "Success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiGetMostLikedNfts(req, res, next) {
    try {
      let nfts = await NftsDAO.getMostLikedNfts();
      if (!nfts) {
        res.status(404).json({ error: "not found" });
        return;
      }
      res.json(nfts);
    } catch (e) {
      console.log(`API, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiGetRandomNfts(req, res, next) {
    try {
      let nfts = await NftsDAO.getRandomNfts(req.query.num);
      if (!nfts) {
        res.status(404).json({ error: "not found" });
        return;
      }
      res.json(nfts);
    } catch (e) {
      console.log(`API, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiMintNft(req, res, next) {
    try {
      const name = req.body.name;
      const description = req.body.description;
      const owner = req.body.googleId;
      const upForSale = false;
      const price = req.body.price;
      const genre = "undefined";
      const image = req.body.image;
      const likes = 0;

      const mintResponse = await NftsDAO.mintNft(
        name,
        description,
        owner,
        upForSale,
        price,
        genre,
        image,
        likes
      );

      let { error } = mintResponse;

      if (error) {
        res.status(500).json({ error: "Unable to mint nft" });
        console.log(error);
      } else {
        res.json({ status: "success" });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}
