// ================================
// File: pages/api/ipos.js
// Description: API route for managing IPO data in MongoDB.
// ================================
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db(process.env.DATABASE_NAME); // Your database name
  const collection = db.collection('ipos');

  switch (req.method) {
    case 'GET':
      try {
        const { type, status } = req.query;
        let query = {};
        if (type) query.type = type;
        if (status) query.status = status;

        const ipos = await collection.find(query).toArray();
        res.status(200).json(ipos);
      } catch (error) {
        console.error('API Error fetching IPOs:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'POST':
      try {
        const newIpo = req.body;
        newIpo.createdAt = new Date();
        const result = await collection.insertOne(newIpo);
        res.status(201).json(result.ops[0]);
      } catch (error) {
        console.error('API Error creating IPO:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const updatedIpo = req.body;
        delete updatedIpo._id;

        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedIpo }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'IPO not found.' });
        }
        res.status(200).json({ message: 'IPO updated successfully.' });
      } catch (error) {
        console.error('API Error updating IPO:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'IPO not found.' });
        }
        res.status(200).json({ message: 'IPO deleted successfully.' });
      } catch (error) {
        console.error('API Error deleting IPO:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}