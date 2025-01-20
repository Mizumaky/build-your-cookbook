import { Context } from '@netlify/functions'

require('dotenv').config()
const { MongoClient } = require('mongodb')
const mongoClient = new MongoClient(process.env.MONGODB_URI)
const clientPromise = mongoClient.connect()  // a promise is an object that represents the eventual completion (or failure) of an asynchronous operation

export default async (request: Request, context: Context) => {
  try {
    // console.log(request.url)
    // console.log(context.account)
    const database = (await clientPromise).db(process.env.MONGODB_DATABASE)
    const recipesCollection = database.collection(process.env.MONGODB_COLLECTION)

    const url = new URL(request.url, `http://${request.headers.get('host')}`);
    const searchQuery = url.searchParams.get('query'); 
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    const deep = url.searchParams.get('deep'); 
    const deepSearch = deep === 'true' ? true : false;  // default to false if not provided
    const all = url.searchParams.get('all'); 
    const returnAll = all === 'true' ? true : false;  // default to false if not provided
    
    let results = [];
    if (!searchQuery) {
        if (returnAll) {
          results = await recipesCollection.find().skip(skip).limit(limit).toArray();
        } else {
          results = []
        }
    } else {
      if (deepSearch) {
        results = await recipesCollection.find({
          ...searchQuery && { 
            $or: [
              { name: { $regex: searchQuery, $options: 'i' } },
              { aliases: { $elemMatch: { $regex: searchQuery, $options: 'i' } } }
            ]
          }
        }).skip(skip).limit(limit).toArray();
      } else {
        results = await recipesCollection.find({
          $text: { $search: searchQuery } 
        }).project({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })  // sort by text match score
        .skip(skip).limit(limit).toArray();
      }
    }
    // console.log(results)
    return new Response(JSON.stringify(results), {
      status: 200,
    })
  } catch (error) {
    return new Response(error.toString(), {
      status: 500,
    })
  }
}
