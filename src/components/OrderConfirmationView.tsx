import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Info,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import {
  FulfillmentMethod,
  Order,
  OrderStatus,
  PageView,
} from '../types/campus';
import { ProductImage } from './ProductImage';

interface OrderConfirmationViewProps {
  order: Order | null;
  onAdvanceStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void> | void;
  onNavigate: (view: PageView) => void;
}

const ORDER_STAGES: OrderStatus[] = [
  OrderStatus.ORDER_PLACED,
  OrderStatus.PREPARING,
  OrderStatus.READY_FOR_PICKUP,
  OrderStatus.COMPLETED,
];

export function OrderConfirmationView({
  order,
  onAdvanceStatus,
  onNavigate,
}: OrderConfirmationViewProps) {
  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-[#2A1254]">No order selected</h1>
        <p className="text-sm text-[#52476A] mt-2">
          Place an order from the Essentials catalog or open a recent order from your Student Hub.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('student')}
            className="px-5 py-2.5 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-semibold cursor-pointer"
          >
            Open Student Hub
          </button>
          <button
            type="button"
            onClick={() => onNavigate('essentials')}
            className="px-5 py-2.5 rounded-xl border border-[#DDD4F2] bg-white text-[#2A1254] text-sm font-medium cursor-pointer"
          >
            Explore Essentials
          </button>
        </div>
      </div>
    );
  }

  const currentStageIndex = Math.max(0, ORDER_STAGES.indexOf(order.status));
  const nextStage =
    currentStageIndex < ORDER_STAGES.length - 1 ? ORDER_STAGES[currentStageIndex + 1] : null;

  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Confirmation Header */}
      <section className="rounded-2xl bg-white border border-[#E4DCF4] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 inline-flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700">
                Demonstration Order Confirmed
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#2A1254] mt-1">
                Thank you, {order.studentName}
              </h1>
              <p className="text-sm text-[#52476A] mt-1">
                Placed on {formattedDate} · Synced with Cloud Firestore
              </p>
            </div>
          </div>

          <div className="bg-[#F7F5FC] border border-[#E4DCF4] rounded-xl px-4 py-3 shrink-0">
            <p className="text-[11px] font-medium text-[#6B5E84]">Unique Order ID</p>
            <p className="font-mono text-lg font-semibold text-[#2A1254] mt-0.5">{order.id}</p>
          </div>
        </div>

        {/* Simulated Status Notice */}
        <div className="mt-6 rounded-xl bg-[#EEF8FF] border border-[#CBE7FA] px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-[#0C4A6E]">
          <Info className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
          <span>
            <strong>Simulated Tracking Status:</strong> Order progress below is simulated for MVP
            demonstration and is not connected to a live delivery or dispatch operation.
          </span>
        </div>

        {/* 4-Stage Status Stepper */}
        <div className="mt-7 pt-6 border-t border-[#EFEAF9]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-xs text-[#6B5E84]">Current Simulated Order Status</p>
              <p className="font-display text-lg font-bold text-[#2A1254]">{order.status}</p>
            </div>

            {nextStage && (
              <button
                type="button"
                onClick={() => onAdvanceStatus(order.id, nextStage)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#D4C7EC] bg-[#FAF8FE] hover:bg-[#EFEAF9] text-xs font-semibold text-[#3B1D6E] transition-colors self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simulate Next Stage: {nextStage}</span>
              </button>
            )}
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {ORDER_STAGES.map((stage, idx) => {
              const isCompleted = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <li
                  key={stage}
                  className={`rounded-xl p-3.5 border transition-colors ${
                    isCurrent
                      ? 'border-[#3B1D6E] bg-[#F7F5FC]'
                      : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-[#EAE4F5] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-[#6B5E84]">0{idx + 1}</span>
                    <span
                      className={`font-semibold ${
                        isCurrent
                          ? 'text-[#3B1D6E]'
                          : isCompleted
                            ? 'text-emerald-700'
                            : 'text-[#9B90B3]'
                      }`}
                    >
                      {isCurrent ? 'Active' : isCompleted ? 'Done' : 'Pending'}
                    </span>
                  </div>
                  <p
                    className={`text-sm font-semibold mt-1.5 ${
                      isCompleted ? 'text-[#2A1254]' : 'text-[#8E82A6]'
                    }`}
                  >
                    {stage}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Details & Receipt Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ordered Products */}
        <section className="lg:col-span-7 rounded-2xl bg-white border border-[#E8E2F4] p-6">
          <h2 className="font-display text-lg font-bold text-[#2A1254]">Ordered Products</h2>
          <div className="mt-4 divide-y divide-[#EFEAF9]">
            {order.items.map((item) => (
              <div key={item.productId} className="py-3.5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F7F5FC] border border-[#EFEAF9] shrink-0">
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    fallbackTitle={item.name}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#6B5E84]">
                    {item.category} · {item.unit}
                  </p>
                  <p className="text-sm font-semibold text-[#2A1254]">{item.name}</p>
                  <p className="text-xs text-[#655A7C] tabular-nums mt-0.5">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <p className="text-sm font-bold text-[#2A1254] tabular-nums shrink-0">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#E8E2F4] space-y-2 text-sm">
            <div className="flex justify-between text-[#52476A]">
              <span>Subtotal</span>
              <span className="tabular-nums font-medium text-[#2A1254]">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-[#52476A]">
              <span>
                {order.fulfillmentMethod === FulfillmentMethod.HOSTEL_DELIVERY
                  ? 'Hostel Delivery Fee'
                  : 'Campus Pickup Fee'}
              </span>
              <span className="tabular-nums font-medium text-[#2A1254]">
                ₹{order.convenienceFee}
              </span>
            </div>
            <div className="pt-2.5 border-t border-[#EFEAF9] flex justify-between text-base">
              <span className="font-display font-bold text-[#2A1254]">Total Amount</span>
              <span className="font-display text-lg font-extrabold text-[#2A1254] tabular-nums">
                ₹{order.total}
              </span>
            </div>
          </div>
        </section>

        {/* Fulfillment Details */}
        <aside className="lg:col-span-5 rounded-2xl bg-[#FAF8FE] border border-[#E4DCF4] p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-[#2A1254]">Fulfillment Details</h2>

          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              {order.fulfillmentMethod === FulfillmentMethod.HOSTEL_DELIVERY ? (
                <Building2 className="w-5 h-5 text-[#3B1D6E] shrink-0 mt-0.5" />
              ) : (
                <MapPin className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs text-[#6B5E84]">Fulfillment Method</p>
                <p className="font-semibold text-[#2A1254]">
                  {order.fulfillmentMethod === FulfillmentMethod.HOSTEL_DELIVERY
                    ? 'Hostel Delivery (Where Available)'
                    : 'Campus Pickup Point'}
                </p>
                <p className="text-xs text-[#52476A] mt-0.5">{order.location}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E2F4]">
              <p className="text-xs text-[#6B5E84]">Student Contact</p>
              <p className="font-semibold text-[#2A1254] mt-0.5">{order.studentName}</p>
              <p className="text-xs text-[#52476A] tabular-nums">{order.mobile}</p>
              <p className="text-xs text-[#52476A]">{order.email}</p>
            </div>

            {order.notes && (
              <div className="pt-4 border-t border-[#E8E2F4]">
                <p className="text-xs text-[#6B5E84]">Order Notes</p>
                <p className="text-sm text-[#2A1254] mt-0.5">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E8E2F4] flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('student')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>View All Orders in Student Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('essentials')}
              className="w-full py-2.5 px-4 rounded-xl border border-[#DDD4F2] bg-white hover:bg-[#F7F5FC] text-[#2A1254] text-sm font-medium transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
            <button
              type="button"
              onClick={() => onNavigate('services')}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-[#0369A1] hover:bg-[#EEF8FF] transition-colors cursor-pointer"
            >
              Need a campus service? Book now
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
