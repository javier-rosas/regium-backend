import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import NftsDAO from "./dao/nftsDAO.js";
import ReviewsDAO from "./dao/reviewsDAO.js";
import FavoritesDAO from "./dao/favoritesDAO.js";
import UsersDAO from "./dao/usersDAO.js";

async function main() {
  dotenv.config();

  const client = new mongodb.MongoClient(process.env.NFTS_DB_URI);

  const port = process.env.PORT || 8000;

  try {
    // connect to the mongodb server
    await client.connect();
    await NftsDAO.injectDB(client);
    await ReviewsDAO.injectDB(client);
    await FavoritesDAO.injectDB(client);
    await UsersDAO.injectDB(client);

    app.listen(port, () => {
      console.log("Server is running on port:", port);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main().catch(console.error);
