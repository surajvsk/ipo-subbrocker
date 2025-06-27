// ================================
// File: pages/api/brokers.js
// Description: API route for managing broker (subBroker) data in MongoDB.
// ================================
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId for querying by _id

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db(process.env.DATABASE_NAME); // Your database name
  const collection = db.collection('subBrokers');

  switch (req.method) {
    case 'GET':
      try {
        const brokers = await collection.find({}).toArray();
        res.status(200).json(brokers);
      } catch (error) {
        console.error('API Error fetching brokers:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'POST':
      try {
        const { brokerCode, username, password, mobile, email, pan, bidPermission, loginAccess, billPermission, role } = req.body;

        if (!brokerCode || !username || !password || !mobile || !email || !pan) {
          return res.status(400).json({ message: 'Missing required fields for broker creation.' });
        }

        // Check if brokerCode or username already exists
        const existingBroker = await collection.findOne({ $or: [{ brokerCode }, { username }] });
        if (existingBroker) {
          return res.status(409).json({ message: 'Broker with this code or username already exists.' });
        }

        const newBroker = {
          brokerCode, username, password, mobile, email, pan,
          bidPermission: bidPermission || false,
          loginAccess: loginAccess || false,
          billPermission: billPermission || false,
          role: role || 'subbroker', // Default role
          createdAt: new Date(),
        };

        const result = await collection.insertOne(newBroker);
        res.status(201).json(result.ops[0]); // Return the inserted document
      } catch (error) {
        console.error('API Error creating broker:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'PUT':
      try {
        // For PUT, expect ID in query or body, or brokerCode in body
        const { _id, ...updatedFields } = req.body;
        let filter = {};

        if (_id) {
          filter = { _id: new ObjectId(_id) };
        } else if (updatedFields.brokerCode) {
          filter = { brokerCode: updatedFields.brokerCode };
        } else {
          return res.status(400).json({ message: 'Missing ID or brokerCode for update.' });
        }

        // Do not allow updating _id or createdAt
        delete updatedFields._id;
        delete updatedFields.createdAt;

        const result = await collection.updateOne(filter, { $set: updatedFields });

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Broker not found.' });
        }
        res.status(200).json({ message: 'Broker updated successfully.' });
      } catch (error) {
        console.error('API Error updating broker:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query; // Expect ID in query parameter (e.g., /api/brokers?id=...)
        if (!id) {
          return res.status(400).json({ message: 'Missing ID for deletion.' });
        }
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Broker not found.' });
        }
        res.status(200).json({ message: 'Broker deleted successfully.' });
      } catch (error) {
        console.error('API Error deleting broker:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}