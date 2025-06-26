// ================================
// File: pages/api/upi-handlers.js
// Description: API route for managing UPI handler data in MongoDB.
// ================================
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('subbrokerportal'); // Your database name
  const collection = db.collection('upiHandlers');

  switch (req.method) {
    case 'GET':
      try {
        const handlers = await collection.find({}).toArray();
        res.status(200).json(handlers);
      } catch (error) {
        console.error('API Error fetching UPI handlers:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'POST':
      try {
        const { name } = req.body;
        if (!name) {
          return res.status(400).json({ message: 'UPI handler name is required.' });
        }
        // Check for duplicate
        const existingHandler = await collection.findOne({ name });
        if (existingHandler) {
          return res.status(409).json({ message: 'UPI handler with this name already exists.' });
        }

        const newHandler = { name, createdAt: new Date() };
        const result = await collection.insertOne(newHandler);
        res.status(201).json(result.ops[0]);
      } catch (error) {
        console.error('API Error creating UPI handler:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ message: 'Missing ID for deletion.' });
        }
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'UPI handler not found.' });
        }
        res.status(200).json({ message: 'UPI handler deleted successfully.' });
      } catch (error) {
        console.error('API Error deleting UPI handler:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}