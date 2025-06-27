// ================================
// File: pages/api/bids.js
// Description: API route for managing bid data in MongoDB.
// ================================
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db(process.env.DATABASE_NAME); // Your database name
  const collection = db.collection('bids');

  switch (req.method) {
    case 'GET':
      try {
        const { ipoId, brokerCode } = req.query;
        let query = {};
        if (ipoId) query.ipoId = ipoId;
        if (brokerCode) query.brokerCode = brokerCode;

        const bids = await collection.find(query).toArray();
        res.status(200).json(bids);
      } catch (error) {
        console.error('API Error fetching bids:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'POST':
      try {
        const newBid = req.body;
        newBid.createdAt = new Date();
        const result = await collection.insertOne(newBid);
        res.status(201).json(result.ops[0]);
      } catch (error) {
        console.error('API Error creating bid:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const updatedBid = req.body;
        delete updatedBid._id;

        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedBid }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Bid not found.' });
        }
        res.status(200).json({ message: 'Bid updated successfully.' });
      } catch (error) {
        console.error('API Error updating bid:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Bid not found.' });
        }
        res.status(200).json({ message: 'Bid deleted successfully.' });
      } catch (error) {
        console.error('API Error deleting bid:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}