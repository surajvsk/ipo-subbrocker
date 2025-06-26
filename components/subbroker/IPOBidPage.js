// ================================
// File: components/subbroker/IPOBidPage.js
// Description: Allows sub-brokers to place bids for Mainboard and SME IPOs.
//              Data fetching updated to use Next.js API routes.
// ================================
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import Checkbox from '../common/Checkbox';
import Modal from '../common/Modal';

const IPOBidPage = ({ type }) => { // type can be 'mainboard' or 'sme'
  const [ipos, setIpos] = useState([]);
  const [selectedIpo, setSelectedIpo] = useState('');
  const [bidCategory, setBidCategory] = useState('Retail'); // 'Retail' or 'HNI'
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState('');
  const [cutoffPriceChecked, setCutoffPriceChecked] = useState(false);
  const [groupCode, setGroupCode] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPlaceBidModalOpen, setIsPlaceBidModalOpen] = useState(false);
  const [availableClients, setAvailableClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);

  const currentIpo = ipos.find(ipo => ipo.id === selectedIpo);
  const minPrice = currentIpo?.priceBandMin || 0;
  const maxPrice = currentIpo?.priceBandMax || 0;
  const lotSize = currentIpo?.lotSize || 1;
  const retailMaxLot = currentIpo?.retailMaxLot || 0;
  const hniMaxAmount = currentIpo?.hniMaxAmount || 0;

  useEffect(() => {
    const fetchIpos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/ipos?type=${type === 'mainboard' ? 'Mainboard' : 'SME'}&status=Active`);
        if (!response.ok) {
          throw new Error('Failed to fetch IPOs.');
        }
        const data = await response.json();
        setIpos(data);
      } catch (err) {
        console.error("Error fetching IPOs:", err);
        setErrors(prev => ({ ...prev, fetch: 'Failed to load IPOs.' }));
      } finally {
        setLoading(false);
      }
    };
    fetchIpos();
  }, [type]); // Re-fetch when type changes

  useEffect(() => {
    if (selectedIpo && cutoffPriceChecked) {
      setPrice(maxPrice.toString());
    }
  }, [selectedIpo, cutoffPriceChecked, maxPrice]);

  const handleQuantityChange = (increment) => {
    const newQuantity = quantity + (increment ? lotSize : -lotSize);
    setQuantity(Math.max(0, newQuantity));
    setErrors(prev => ({ ...prev, quantity: '' }));
  };

  const validateBid = () => {
    const newErrors = {};
    if (!selectedIpo) {
      newErrors.ipo = 'Please select an IPO.';
    }
    if (quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0.';
    }
    if (quantity % lotSize !== 0) {
      newErrors.quantity = `Quantity must be in multiples of lot size (${lotSize}).`;
    }

    if (bidCategory === 'Retail') {
      if (currentIpo && quantity / lotSize > retailMaxLot) {
        newErrors.quantity = `Max retail lots for this IPO is ${retailMaxLot}.`;
      }
    } else if (bidCategory === 'HNI') {
      if (currentIpo && (quantity * parseFloat(price || '0')) > hniMaxAmount) {
        newErrors.amount = `Total bid amount cannot exceed ₹${hniMaxAmount / 100000} Lakhs.`;
      }
    }

    if (!price) {
      newErrors.price = 'Price is required.';
    } else {
      const p = parseFloat(price);
      if (isNaN(p) || p < minPrice || p > maxPrice) {
        newErrors.price = `Price must be between ${minPrice} and ${maxPrice}.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceBidClick = async () => {
    if (!validateBid()) {
      return;
    }
    setLoading(true);
    try {
      // Fetch clients of the current sub-broker
      const clientsRes = await fetch('/api/clients?brokerCode=BRK001'); // Assuming BRK001 is current sub-broker for demo
      if (!clientsRes.ok) throw new Error('Failed to fetch clients.');
      const clientsData = await clientsRes.json();

      // Fetch existing bids for the selected IPO
      const bidsRes = await fetch(`/api/bids?ipoId=${selectedIpo}`); // Assuming an API route for bids by ipoId
      if (!bidsRes.ok) throw new Error('Failed to fetch existing bids.');
      const existingBidsData = await bidsRes.json();
      const existingBidsClientIds = new Set(existingBidsData.map(bid => bid.clientCode));

      const filteredClients = clientsData.filter(client => !existingBidsClientIds.has(client.tradingCode));
      setAvailableClients(filteredClients);
      setSelectedClients(filteredClients.map(client => client._id)); // Select all by default

      setIsPlaceBidModalOpen(true);
    } catch (e) {
      console.error("Error preparing bid clients:", e);
      setErrors(prev => ({ ...prev, general: 'Error preparing bid clients. ' + e.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleBidNow = async () => {
    if (selectedClients.length === 0) {
      setErrors(prev => ({ ...prev, clients: 'Please select at least one client.' }));
      return;
    }

    setLoading(true);
    try {
      for (const clientId of selectedClients) {
        const client = availableClients.find(c => c._id === clientId);
        if (client) {
          const newBid = {
            ipoId: currentIpo.id,
            ipoName: currentIpo.name,
            clientCode: client.tradingCode,
            clientName: client.clientName,
            applicationNumber: `APP${Math.floor(Math.random() * 1000000)}`,
            upiId: client.upiHandle,
            panCard: client.panCard,
            quantity: quantity,
            amount: quantity * parseFloat(price),
            exchangeCode: 'NSE',
            exchangeStatus: 'Pending',
            activityType: bidCategory,
            dpStatus: 'Active',
            exchangeDateTime: new Date().toISOString(),
            sponsorBankStatus: 'Pending',
            brokerCode: 'BRK001', // Assume current sub-broker
            createdAt: new Date().toISOString()
          };
          const response = await fetch('/api/bids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBid),
          });
          if (!response.ok) throw new Error(`Failed to place bid for ${client.clientName}`);
        }
      }
      setIsPlaceBidModalOpen(false);
      setSelectedClients([]);
      setErrors({});
      alert('Bids placed successfully!');
      setSelectedIpo('');
      setQuantity(0);
      setPrice('');
      setCutoffPriceChecked(false);
      setGroupCode('');
    } catch (e) {
      console.error("Error placing bids:", e);
      setErrors(prev => ({ ...prev, general: 'Error placing bids. ' + e.message }));
    } finally {
      setLoading(false);
    }
  };

  const totalBidAmountForSelectedClients = quantity * parseFloat(price || '0') * selectedClients.length;

  if (loading) return <div className="p-6 text-gray-600">Loading IPO data...</div>;

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{type === 'mainboard' ? 'Mainboard' : 'SME'} IPO Bids</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="select-ipo" className="block text-sm font-medium text-gray-700 mb-1">Select IPO</label>
          <Select
            id="select-ipo"
            value={selectedIpo}
            onChange={(e) => { setSelectedIpo(e.target.value); setErrors(prev => ({ ...prev, ipo: '' })); setQuantity(0); setPrice(''); setCutoffPriceChecked(false); }}
            options={[{ value: '', label: 'Select an IPO' }, ...ipos.map(ipo => ({ value: ipo.id, label: ipo.name }))]}
          />
          {errors.ipo && <p className="text-red-500 text-xs mt-1">{errors.ipo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bid Category</label>
          <div className="flex space-x-4 mt-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="bidCategory"
                value="Retail"
                checked={bidCategory === 'Retail'}
                onChange={() => { setBidCategory('Retail'); setErrors(prev => ({ ...prev, quantity: '', amount: '' })); setQuantity(0); }}
              />
              <span className="ml-2 text-gray-800">Retail</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="bidCategory"
                value="HNI"
                checked={bidCategory === 'HNI'}
                onChange={() => { setBidCategory('HNI'); setErrors(prev => ({ ...prev, quantity: '', amount: '' })); setQuantity(0); }}
              />
              <span className="ml-2 text-gray-800">HNI</span>
            </label>
          </div>
        </div>

        {selectedIpo && (
          <>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity (Lot Size: {lotSize})</label>
              <div className="flex items-center space-x-2">
                <Button onClick={() => handleQuantityChange(false)} disabled={quantity <= 0 || loading} className="!p-2 !w-auto">
                  <i className="fas fa-minus"></i>
                </Button>
                <Input
                  type="text"
                  id="quantity"
                  value={quantity}
                  readOnly
                  className="text-center w-24 bg-gray-100"
                />
                <Button onClick={() => handleQuantityChange(true)} disabled={loading} className="!p-2 !w-auto">
                  <i className="fas fa-plus"></i>
                </Button>
              </div>
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (Band: {minPrice}-{maxPrice})</label>
              <Input
                type="number"
                id="price"
                value={price}
                onChange={(e) => { setPrice(e.target.value); setErrors(prev => ({ ...prev, price: '' })); setCutoffPriceChecked(false); }}
                placeholder="Enter bid price"
                disabled={cutoffPriceChecked || loading}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              <Checkbox
                id="cutoffPrice"
                label="Cutoff Price (Highest)"
                checked={cutoffPriceChecked}
                onChange={(e) => { setCutoffPriceChecked(e.target.checked); if (e.target.checked) setPrice(maxPrice.toString()); setErrors(prev => ({ ...prev, price: '' })); }}
                className="mt-2"
              />
            </div>
            <div>
              <label htmlFor="groupCode" className="block text-sm font-medium text-gray-700 mb-1">Group Code (Optional)</label>
              <Input
                type="text"
                id="groupCode"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)}
                placeholder="Enter group code"
              />
            </div>
          </>
        )}
      </div>

      {errors.general && <p className="text-red-500 text-center mb-4">{errors.general}</p>}

      <div className="flex justify-center mt-8">
        <Button onClick={handlePlaceBidClick} disabled={!selectedIpo || loading}>
          {loading ? 'Preparing...' : 'Place Bid'}
        </Button>
      </div>

      {isPlaceBidModalOpen && (
        <Modal isOpen={isPlaceBidModalOpen} onClose={() => setIsPlaceBidModalOpen(false)} title="Select Clients for Bid">
          <div className="mb-4">
            <Checkbox
              id="selectAllClients"
              label="Select All Clients"
              checked={selectedClients.length === availableClients.length && availableClients.length > 0}
              onChange={(e) => setSelectedClients(e.target.checked ? availableClients.map(c => c._id) : [])}
            />
          </div>
          {errors.clients && <p className="text-red-500 text-xs mt-2 mb-2">{errors.clients}</p>}
          <div className="overflow-y-auto max-h-80 border rounded-lg p-2 mb-4">
            {availableClients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No eligible clients found for this IPO (they might have already bid).</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client Code</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">UPI ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PAN</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availableClients.map(client => (
                    <tr key={client._id}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600 rounded"
                          checked={selectedClients.includes(client._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClients(prev => [...prev, client._id]);
                            } else {
                              setSelectedClients(prev => prev.filter(id => id !== client._id));
                            }
                            setErrors(prev => ({ ...prev, clients: '' }));
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{client.tradingCode}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{client.clientName}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{client.upiHandle}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{client.panCard}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{quantity}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{(quantity * parseFloat(price || '0')).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex justify-between items-center text-lg font-semibold text-gray-800 mb-4">
            <span>Total Selected Clients: {selectedClients.length}</span>
            <span>Total Bid Amount: ₹{totalBidAmountForSelectedClients.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsPlaceBidModalOpen(false)} className="bg-gray-400 hover:bg-gray-500 text-white">Cancel</Button>
            <Button onClick={handleBidNow} disabled={selectedClients.length === 0 || loading}>
              {loading ? 'Bidding...' : 'Bid Now'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default IPOBidPage;