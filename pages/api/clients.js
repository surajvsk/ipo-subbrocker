// ================================
// File: pages/api/clients.js
// Description: API route for managing client data in MongoDB.
//              Includes GET, POST, PUT, DELETE operations.
// ================================
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('subbrokerportal'); // Your database name
  const collection = db.collection('clients');

  switch (req.method) {
    case 'GET':
      try {
        const { tradingCode, brokerCode } = req.query;
        let query = {};
        if (tradingCode) {
          query.tradingCode = tradingCode;
        }
        if (brokerCode) {
          query.brokerCode = brokerCode;
        }
        const clients = await collection.find(query).toArray();
        res.status(200).json(clients);
      } catch (error) {
        console.error('API Error fetching clients:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'POST':
      try {
        const newClient = req.body;
        // Add createdAt timestamp
        newClient.createdAt = new Date();
        const result = await collection.insertOne(newClient);
        res.status(201).json(result.ops[0]); // Return the inserted document
      } catch (error) {
        console.error('API Error creating client:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const updatedClient = req.body;
        delete updatedClient._id; // _id should not be updated

        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedClient }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Client not found.' });
        }
        res.status(200).json({ message: 'Client updated successfully.' });
      } catch (error) {
        console.error('API Error updating client:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Client not found.' });
        }
        res.status(200).json({ message: 'Client deleted successfully.' });
      } catch (error) {
        console.error('API Error deleting client:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}