// ================================
// File: components/subbroker/ASBAFormPrinting.js
// Description: Simulates ASBA form generation (HNI Section).
//              Data fetching updated to use Next.js API routes.
// ================================
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import Checkbox from '../common/Checkbox';

const ASBAFormPrinting = () => {
  const [ipos, setIpos] = useState([]);
  const [selectedIpo, setSelectedIpo] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState('');
  const [cutoffPriceChecked, setCutoffPriceChecked] = useState(false);
  const [groupCode, setGroupCode] = useState('');
  const [errors, setErrors] = useState({});
  const [printingForm, setPrintingForm] = useState(false);
  const [isFormPrinted, setIsFormPrinted] = useState(false);
  const [clientDataForForm, setClientDataForForm] = useState(null);


  const currentIpo = ipos.find(ipo => ipo.id === selectedIpo);
  const minPrice = currentIpo?.priceBandMin || 0;
  const maxPrice = currentIpo?.priceBandMax || 0;
  const lotSize = currentIpo?.lotSize || 1;
  const hniMaxAmount = currentIpo?.hniMaxAmount || 0;


  useEffect(() => {
    const fetchIpos = async () => {
      try {
        const response = await fetch('/api/ipos?status=Active'); // Fetch all active IPOs
        if (!response.ok) {
          throw new Error('Failed to fetch IPOs.');
        }
        const data = await response.json();
        setIpos(data.map(ipo => ({ label: ipo.name, value: ipo.id })));
      } catch (err) {
        console.error("Error fetching IPOs:", err);
        setErrors(prev => ({ ...prev, fetch: 'Failed to load IPOs.' }));
      }
    };
    fetchIpos();
  }, []);

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

  const validateFormInput = () => {
    const newErrors = {};
    if (!selectedIpo) newErrors.ipo = 'Please select an IPO.';
    if (quantity <= 0 || quantity % lotSize !== 0) {
      newErrors.quantity = `Quantity must be greater than 0 and in multiples of lot size (${lotSize}).`;
    }
    if (!price) {
      newErrors.price = 'Price is required.';
    } else {
      const p = parseFloat(price);
      if (isNaN(p) || p < minPrice || p > maxPrice) {
        newErrors.price = `Price must be between ${minPrice} and ${maxPrice}.`;
      }
    }
    if (currentIpo && (quantity * parseFloat(price || '0')) > hniMaxAmount) {
      newErrors.amount = `Total bid amount cannot exceed ₹${hniMaxAmount / 100000} Lakhs.`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handlePrintForm = async () => {
    if (!validateFormInput()) {
      return;
    }

    setPrintingForm(true);
    setErrors({});
    setIsFormPrinted(false);
    setClientDataForForm(null);

    try {
      // For ASBA, typically an HNI bid for a specific client.
      // For this simulation, we'll just pick a random client related to BRK001
      // In a real scenario, the sub-broker would select the client.
      const clientsRes = await fetch('/api/clients?brokerCode=BRK001'); // Assuming BRK001
      if (!clientsRes.ok) throw new Error('Failed to fetch clients for ASBA.');
      const clientsData = await clientsRes.json();

      if (clientsData.length === 0) {
        throw new Error("No clients found for ASBA form generation.");
      }
      const client = clientsData[0]; // Pick the first client for demo

      setClientDataForForm({
        ipoName: currentIpo.name,
        clientName: client.clientName,
        panCard: client.panCard,
        dpId: client.dpId,
        upiHandle: client.upiHandle,
        quantity: quantity,
        price: price,
        totalAmount: quantity * parseFloat(price),
        bankName: client.bankName,
        branch: client.branch,
        asbaAccount: client.asbaAccount,
        mobile: client.mobile,
        email: client.email,
        brokerCode: client.brokerCode,
        applicationDate: new Date().toLocaleDateString(),
        applicationTime: new Date().toLocaleTimeString(),
      });
      setIsFormPrinted(true);
      alert('ASBA Form generated! See below.');
    } catch (e) {
      console.error("Error generating ASBA form:", e);
      setErrors(prev => ({ ...prev, general: 'Error generating ASBA form: ' + e.message }));
    } finally {
      setPrintingForm(false);
    }
  };


  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">ASBA Form Printing (HNI Section)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="select-ipo-asba" className="block text-sm font-medium text-gray-700 mb-1">Select IPO</label>
          <Select
            id="select-ipo-asba"
            value={selectedIpo}
            onChange={(e) => { setSelectedIpo(e.target.value); setErrors(prev => ({ ...prev, ipo: '' })); setQuantity(0); setPrice(''); setCutoffPriceChecked(false); }}
            options={[{ value: '', label: 'Select an IPO' }, ...ipos]}
          />
          {errors.ipo && <p className="text-red-500 text-xs mt-1">{errors.ipo}</p>}
        </div>

        {selectedIpo && (
          <>
            <div>
              <label htmlFor="quantity-asba" className="block text-sm font-medium text-gray-700 mb-1">Quantity (Lot Size: {lotSize})</label>
              <div className="flex items-center space-x-2">
                <Button onClick={() => handleQuantityChange(false)} disabled={quantity <= 0 || printingForm} className="!p-2 !w-auto">
                  <i className="fas fa-minus"></i>
                </Button>
                <Input
                  type="text"
                  id="quantity-asba"
                  value={quantity}
                  readOnly
                  className="text-center w-24 bg-gray-100"
                />
                <Button onClick={() => handleQuantityChange(true)} disabled={printingForm} className="!p-2 !w-auto">
                  <i className="fas fa-plus"></i>
                </Button>
              </div>
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label htmlFor="price-asba" className="block text-sm font-medium text-gray-700 mb-1">Price (Band: {minPrice}-{maxPrice})</label>
              <Input
                type="number"
                id="price-asba"
                value={price}
                onChange={(e) => { setPrice(e.target.value); setErrors(prev => ({ ...prev, price: '' })); setCutoffPriceChecked(false); }}
                placeholder="Enter bid price"
                disabled={cutoffPriceChecked || printingForm}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              <Checkbox
                id="cutoffPrice-asba"
                label="Cutoff Price (Highest)"
                checked={cutoffPriceChecked}
                onChange={(e) => { setCutoffPriceChecked(e.target.checked); if (e.target.checked) setPrice(maxPrice.toString()); setErrors(prev => ({ ...prev, price: '' })); }}
                className="mt-2"
              />
            </div>
            <div>
              <label htmlFor="groupCode-asba" className="block text-sm font-medium text-gray-700 mb-1">Group Code (Optional)</label>
              <Input
                type="text"
                id="groupCode-asba"
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
        <Button onClick={handlePrintForm} disabled={!selectedIpo || printingForm}>
          {printingForm ? 'Generating Form...' : 'Print ASBA Form'}
        </Button>
      </div>

      {isFormPrinted && clientDataForForm && (
        <div className="mt-8 p-6 border border-gray-300 rounded-lg bg-white shadow-md text-gray-800">
          <h3 className="text-xl font-bold mb-4 border-b pb-2">Generated ASBA Form (Simulated)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="font-semibold">IPO Name:</span> {clientDataForForm.ipoName}</div>
            <div><span className="font-semibold">Client Name:</span> {clientDataForForm.clientName}</div>
            <div><span className="font-semibold">PAN Card:</span> {clientDataForForm.panCard}</div>
            <div><span className="font-semibold">DP ID:</span> {clientDataForForm.dpId}</div>
            <div><span className="font-semibold">UPI Handle:</span> {clientDataForForm.upiHandle}</div>
            <div><span className="font-semibold">Mobile:</span> {clientDataForForm.mobile}</div>
            <div><span className="font-semibold">Email:</span> {clientDataForForm.email}</div>
            <div><span className="font-semibold">Quantity Bid:</span> {clientDataForForm.quantity}</div>
            <div><span className="font-semibold">Price Bid:</span> {clientDataForForm.price}</div>
            <div><span className="font-semibold">Total Amount:</span> ₹{clientDataForForm.totalAmount.toLocaleString('en-IN')}</div>
            <div><span className="font-semibold">Bank Name:</span> {clientDataForForm.bankName || 'N/A'}</div>
            <div><span className="font-semibold">Branch:</span> {clientDataForForm.branch || 'N/A'}</div>
            <div><span className="font-semibold">ASBA Account:</span> {clientDataForForm.asbaAccount || 'N/A'}</div>
            <div><span className="font-semibold">Broker Code:</span> {clientDataForForm.brokerCode || 'N/A'}</div>
            <div><span className="font-semibold">Application Date:</span> {clientDataForForm.applicationDate}</div>
            <div><span className="font-semibold">Application Time:</span> {clientDataForForm.applicationTime}</div>
          </div>
          <p className="mt-6 text-sm text-center text-gray-600">
            Please print this form and follow ASBA procedures with your bank.
          </p>
        </div>
      )}
    </div>
  );
};

export default ASBAFormPrinting;