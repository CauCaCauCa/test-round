// // src/lambdas/update-orders-expired.handler.ts

// import { MongoClient } from 'mongodb';
// import { MONGO_CONFIG } from 'src/_cores/config/database/mongo.config';

// export const handler = async () => {

//     const uri = `${MONGO_CONFIG.url}/${MONGO_CONFIG.dbName}`;
//     const client = new MongoClient(uri);
//     const db = await client.db(MONGO_CONFIG.dbName)
//     const order_collection = await db.collection('order');

//     const expiredOrders = await order_collection.aggregate([
//         {
//             "$match": {
//                 "status": "pending",
//                 "created_at": { "$exists": true }
//             }
//         },
//         {
//             "$addFields": {
//                 "created_at_date": { "$toDate": "$created_at" },
//                 "server_time_g7": {
//                     "$dateAdd": {
//                         "startDate": "$$NOW",
//                         "unit": "hour",
//                         "amount": 7
//                     }
//                 },
//                 "time_diff_minutes": {
//                     "$divide": [
//                         {
//                             "$subtract": [
//                                 {
//                                     "$dateAdd": {
//                                         "startDate": "$$NOW",
//                                         "unit": "hour",
//                                         "amount": 7
//                                     }
//                                 },
//                                 { "$toDate": "$created_at" }
//                             ]
//                         },
//                         1000 * 60
//                     ]
//                 }
//             }
//         },
//         {
//             "$match": {
//                 "time_diff_minutes": { "$gte": 15 }
//             }
//         }
//     ]).toArray();

//     if (expiredOrders && expiredOrders.length > 0) {
//         console.log(`Found ${expiredOrders.length} expired orders.`);
//         for (const order of expiredOrders) {
//             try {
//                 await order_collection.updateOne(
//                     { _id: order._id },
//                     { $set: { status: ['expired'] } }
//                 );
//                 console.log(`Order ${order._id} updated to expired.`);
//             } catch (error) {
//                 console.error(`Error updating order ${order._id}:`, error);
//             }
//         }
//     } else {
//         console.log('No expired orders found.');
//     }

// };
