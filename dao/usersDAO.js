import mongodb, { CURSOR_FLAGS } from "mongodb"
const objectId = mongodb.ObjectId

let userDB; 

export default class UsersDAO {

  static async injectDB(conn) {
    if (userDB) {
        return
    }
    try {
      userDB = await conn.db(process.env.NFT_NS).collection("users")
    } catch(e) {
        console.error( `Unable to connect in NftDAO: ${e}`)
    }
  }
  
  /**
   * If the user exists in the database, replace it. Otherwise, 
   * create a new one. 
   * @param {*} userData 
   * @returns 
   */
  static async updateUser(userData) {
    try {
        let res = await userDB.updateOne( 
          { _id : userData.googleId }, 
          { $set: userData }, 
          { upsert : true } 
        )
        
        if (!res.modifiedCount && !res.upsertedCount){
            console.log(res)
            console.error(`A change was not made` )
            return
        }
        return res
    } catch(e) {
        console.error(`Unable to post user: ${e}` )
        return { error : e }
    }
  }

  static async getUser(userId) {
    let cursor
    try {
      cursor = await userDB.find({ _id : userId })//, { projection: { _id: 0, nfts_owned: 1 } })
      const user = await cursor.toArray()
      return user[0]
    } catch (e) {
      console.error(`Something went wrong in getUserNfts: ${e}`)
      throw e
    }
  }

  // db.collection.find( { _id : { $in : [1,2,3,4] } } );
}