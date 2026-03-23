// src/pages/CheckoutPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, CreditCard, MapPin, Loader } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { createOrder } from '@/services/orderService';
import { createNotification } from '@/services/notificationService';
import { clearCart } from '@/services/cartService';
import { formatCurrency } from '@/utils';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Payment', 'Confirm'];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const { items, clearCart: clearStore } = useCartStore();
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = total >= 50 ? 0 : 9.99;

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({ name: profile?.displayName || '', street: '', city: '', state: '', zip: '', country: 'US' });
  const [payment, setPayment] = useState({ card: '', expiry: '', cvv: '', simulate: 'success' });
  const [placing, setPlacing] = useState(false);
  const [result, setResult] = useState(null);

  if (items.length === 0 && !result) {
    navigate('/cart');
    return null;
  }

  const placeOrder = async () => {
    setPlacing(true);
    await new Promise(r => setTimeout(r, 1800)); // simulate payment processing
    if (payment.simulate === 'fail') {
      setResult('fail');
      setPlacing(false);
      return;
    }
    try {
      const order = await createOrder({
        userId: user.uid,
        items: items.map(i => ({ ...i })),
        total: total + shipping,
        address,
        paymentStatus: 'paid',
      });
      await createNotification({ userId: user.uid, title: 'Order Placed! 🎉', message: `Your order #${order.id.slice(-6).toUpperCase()} has been placed successfully.`, type: 'success' });
      await clearCart(user.uid);
      clearStore();
      setResult('success');
    } catch {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (result === 'success') return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-5">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h2 className="font-display font-bold text-3xl mb-2">Order Placed!</h2>
      <p className="text-gray-400 mb-8">Thank you for your purchase. You'll receive a confirmation shortly.</p>
      <div className="flex gap-3">
        <button onClick={() => navigate('/orders')} className="btn-primary">View Orders</button>
        <button onClick={() => navigate('/products')} className="btn-secondary">Continue Shopping</button>
      </div>
    </div>
  );

  if (result === 'fail') return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-5">
        <XCircle size={40} className="text-red-500" />
      </div>
      <h2 className="font-display font-bold text-3xl mb-2">Payment Failed</h2>
      <p className="text-gray-400 mb-8">Your payment could not be processed. Please try again.</p>
      <button onClick={() => setResult(null)} className="btn-primary">Try Again</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="page-title mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${i <= step ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>{i + 1}</div>
            <span className={`ml-2 text-sm font-medium ${i === step ? 'text-brand-600' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-4 ${i < step ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Address */}
          {step === 0 && (
            <div className="card p-6 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-brand-600" />
                <h2 className="font-semibold">Shipping Address</h2>
              </div>
              {[
                { key: 'name', label: 'Full Name', placeholder: 'John Doe' },
                { key: 'street', label: 'Street Address', placeholder: '123 Main St' },
                { key: 'city', label: 'City', placeholder: 'San Francisco' },
                { key: 'state', label: 'State', placeholder: 'CA' },
                { key: 'zip', label: 'ZIP Code', placeholder: '94105' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1.5 text-gray-500">{label}</label>
                  <input className="input" placeholder={placeholder} value={address[key]}
                    onChange={e => setAddress(a => ({ ...a, [key]: e.target.value }))} required />
                </div>
              ))}
              <button onClick={() => setStep(1)} disabled={!address.street || !address.city} className="btn-primary w-full mt-2">
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="card p-6 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={18} className="text-brand-600" />
                <h2 className="font-semibold">Payment Details</h2>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Card Number</label>
                <input className="input font-mono" placeholder="4242 4242 4242 4242" maxLength={19}
                  value={payment.card} onChange={e => setPayment(p => ({ ...p, card: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-500">Expiry</label>
                  <input className="input" placeholder="MM/YY" maxLength={5}
                    value={payment.expiry} onChange={e => setPayment(p => ({ ...p, expiry: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-500">CVV</label>
                  <input className="input" placeholder="123" maxLength={4} type="password"
                    value={payment.cvv} onChange={e => setPayment(p => ({ ...p, cvv: e.target.value }))} />
                </div>
              </div>
              {/* Simulation */}
              <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">🧪 Payment Simulation</p>
                <div className="flex gap-3">
                  {['success', 'fail'].map(s => (
                    <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="simulate" value={s} checked={payment.simulate === s}
                        onChange={() => setPayment(p => ({ ...p, simulate: s }))} className="accent-brand-600" />
                      <span className="text-xs capitalize font-medium text-amber-700 dark:text-amber-400">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1">Review Order</button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <div className="card p-6 animate-fade-in space-y-5">
              <h2 className="font-semibold">Review & Place Order</h2>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm space-y-1">
                <p className="font-medium">{address.name}</p>
                <p className="text-gray-500">{address.street}, {address.city}, {address.state} {address.zip}</p>
              </div>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 text-sm">
                    <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800" />
                    <span className="flex-1 truncate">{item.name} ×{item.qty}</span>
                    <span className="font-semibold flex-shrink-0">{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={placeOrder} disabled={placing} className="btn-primary flex-1 gap-2">
                  {placing ? <><Loader size={15} className="animate-spin" /> Processing…</> : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit sticky top-20">
          <h3 className="font-semibold mb-4">Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(total)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span></div>
          </div>
          <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-100 dark:border-gray-800">
            <span>Total</span>
            <span className="text-brand-600">{formatCurrency(total + shipping)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
