import { FormEvent, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
} from 'lucide-react';
import {
  ALL_CAMPUS_LOCATIONS,
  CAMPUS_SERVICES,
  SERVICE_TIME_SLOTS,
} from '../data/catalog';
import { CreateBookingInput } from '../hooks/useCampusStore';
import {
  CampusService,
  PageView,
  ServiceBooking,
  StudentProfile,
} from '../types/campus';

interface ServicesViewProps {
  profile: StudentProfile;
  onCreateBooking: (input: CreateBookingInput) => ServiceBooking;
  onNavigate: (view: PageView) => void;
}

function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function ServicesView({
  profile,
  onCreateBooking,
  onNavigate,
}: ServicesViewProps) {
  const minDate = useMemo(() => getTodayIsoDate(), []);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(CAMPUS_SERVICES[0].id);
  const [preferredDate, setPreferredDate] = useState<string>(minDate);
  const [preferredTime, setPreferredTime] = useState<string>(SERVICE_TIME_SLOTS[1]);
  const [studentName, setStudentName] = useState<string>(profile.name);
  const [mobile, setMobile] = useState<string>(profile.mobile);
  const [email, setEmail] = useState<string>(profile.email);
  const [location, setLocation] = useState<string>(
    ALL_CAMPUS_LOCATIONS.includes(profile.defaultLocation)
      ? profile.defaultLocation
      : ALL_CAMPUS_LOCATIONS[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedBooking, setConfirmedBooking] = useState<ServiceBooking | null>(null);

  const selectedService: CampusService =
    CAMPUS_SERVICES.find((s) => s.id === selectedServiceId) ?? CAMPUS_SERVICES[0];

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setConfirmedBooking(null);
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!preferredDate) {
      nextErrors.preferredDate = 'Please choose a preferred date.';
    } else if (preferredDate < minDate) {
      nextErrors.preferredDate = 'Please select today or an upcoming date.';
    }
    if (!preferredTime) {
      nextErrors.preferredTime = 'Please select a preferred time slot.';
    }
    if (studentName.trim().length < 2) {
      nextErrors.studentName = 'Please enter your full name.';
    }
    const cleanPhone = mobile.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      nextErrors.mobile = 'Enter a valid 10-digit Indian mobile number.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid university or personal email address.';
    }
    if (!location) {
      nextErrors.location = 'Please select a hostel or campus pickup point.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const booking = onCreateBooking({
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      servicePriceUnit: selectedService.priceUnit,
      preferredDate,
      preferredTime,
      studentName,
      mobile: mobile.replace(/\D/g, ''),
      email,
      location,
      notes,
    });

    setConfirmedBooking(booking);
    setNotes('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="pb-8 border-b border-[#E8E2F4]">
        <p className="text-xs font-semibold text-[#0369A1]">
          Core MVP Feature · DBS Global University Pilot
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#2A1254] tracking-tight mt-1">
          Campus Services
        </h1>
        <p className="text-sm sm:text-base text-[#52476A] mt-2 max-w-3xl leading-relaxed">
          Book convenient on-campus and nearby-partner student services—from urgent assignment
          printing and hostel laundry pickup to main-gate parcel collection.
        </p>

        <div className="mt-5 rounded-xl bg-[#EEF8FF] border border-[#CBE7FA] px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-[#0C4A6E]">
          <Info className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
          <span>
            <strong>Demonstration Services Notice:</strong> All service listings below are sample
            pilot services built to test CampusEase booking workflows. Bookings are stored locally
            in your browser with no real charges.
          </span>
        </div>
      </div>

      {/* Confirmation State Banner when just booked */}
      {confirmedBooking && (
        <section
          aria-live="polite"
          className="mt-8 rounded-2xl bg-white border-2 border-[#3B1D6E] p-6 sm:p-8 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 inline-flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  Demo Service Booking Confirmed
                </p>
                <h2 className="font-display text-2xl font-bold text-[#2A1254] mt-0.5">
                  {confirmedBooking.serviceName}
                </h2>
                <p className="text-sm text-[#52476A] mt-1">
                  Your demonstration booking request has been saved locally. Show your booking
                  reference at handoff.
                </p>
              </div>
            </div>

            <div className="bg-[#F7F5FC] border border-[#E4DCF4] rounded-xl px-4 py-3 shrink-0">
              <p className="text-[11px] font-medium text-[#6B5E84]">Booking Reference</p>
              <p className="font-mono text-lg font-semibold text-[#2A1254] mt-0.5">
                {confirmedBooking.id}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#EFEAF9] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-sm">
            <div>
              <p className="text-xs text-[#6B5E84]">Scheduled Slot</p>
              <p className="font-semibold text-[#2A1254] mt-0.5 tabular-nums">
                {confirmedBooking.preferredDate}
              </p>
              <p className="text-xs text-[#52476A]">{confirmedBooking.preferredTime}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B5E84]">Hostel / Pickup Point</p>
              <p className="font-semibold text-[#2A1254] mt-0.5">{confirmedBooking.location}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B5E84]">Student Contact</p>
              <p className="font-semibold text-[#2A1254] mt-0.5">{confirmedBooking.studentName}</p>
              <p className="text-xs text-[#52476A] tabular-nums">{confirmedBooking.mobile}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B5E84]">Demo Fee &amp; Status</p>
              <p className="font-semibold text-[#2A1254] mt-0.5 tabular-nums">
                ₹{confirmedBooking.servicePrice} ({confirmedBooking.servicePriceUnit})
              </p>
              <p className="text-xs text-[#0369A1] font-medium">
                Status: {confirmedBooking.status} (Simulated)
              </p>
            </div>
          </div>

          {confirmedBooking.notes && (
            <div className="mt-4 pt-4 border-t border-[#EFEAF9] text-xs text-[#52476A]">
              <span className="font-semibold text-[#2A1254]">Instructions: </span>
              {confirmedBooking.notes}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('student')}
              className="px-5 py-2.5 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>View in Student Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmedBooking(null)}
              className="px-5 py-2.5 rounded-xl border border-[#DDD4F2] bg-white hover:bg-[#F7F5FC] text-[#2A1254] text-sm font-medium transition-colors cursor-pointer"
            >
              Book Another Service
            </button>
            <button
              type="button"
              onClick={() => onNavigate('essentials')}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#3B1D6E] hover:bg-[#F7F5FC] transition-colors cursor-pointer"
            >
              Browse Essentials
            </button>
          </div>
        </section>
      )}

      {/* Main Two-Column Booking Workspace */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Available Demonstration Services */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#2A1254]">
              1. Choose a Campus Service
            </h2>
            <span className="text-xs text-[#6B5E84] tabular-nums">
              {CAMPUS_SERVICES.length} demo services available
            </span>
          </div>

          <div className="space-y-4">
            {CAMPUS_SERVICES.map((service) => {
              const isSelected = service.id === selectedService.id;
              return (
                <div
                  key={service.id}
                  className={`rounded-2xl border p-5 sm:p-6 transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#FAF8FE] border-[#3B1D6E] shadow-xs'
                      : 'bg-white border-[#E8E2F4] hover:border-[#CBBCEB]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-[#0369A1]">{service.shortTag}</p>
                      <h3 className="font-display text-lg font-bold text-[#2A1254] mt-1">
                        {service.name}
                      </h3>
                    </div>
                    <div className="sm:text-right shrink-0 tabular-nums">
                      <p className="font-display text-xl font-bold text-[#2A1254]">
                        ₹{service.price}
                      </p>
                      <p className="text-xs text-[#6B5E84]">{service.priceUnit}</p>
                    </div>
                  </div>

                  <p className="text-sm text-[#52476A] mt-3 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#655A7C]">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#3B1D6E]" />
                      {service.turnaround}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#3B1D6E]" />
                      {service.availabilityNote}
                    </span>
                  </div>

                  <ul className="mt-4 pt-4 border-t border-[#EFEAF9] grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#453B5E]">
                    {service.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#3B1D6E] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleSelectService(service.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-[#3B1D6E] text-white'
                          : 'bg-[#F5F2FB] text-[#2A1254] hover:bg-[#3B1D6E] hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected for Booking' : 'Select Service'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sticky Booking Form */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="rounded-2xl bg-white border border-[#E4DCF4] p-6 shadow-xs">
            <h2 className="font-display text-lg font-bold text-[#2A1254]">
              2. Complete Booking Request
            </h2>

            {/* Selected Service Summary */}
            <div className="mt-4 p-4 rounded-xl bg-[#F7F5FC] border border-[#E6DDF7] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#0369A1]">Selected Demo Service</p>
                <p className="text-sm font-bold text-[#2A1254] truncate">{selectedService.name}</p>
                <p className="text-xs text-[#655A7C] mt-0.5">{selectedService.turnaround}</p>
              </div>
              <div className="text-right shrink-0 tabular-nums">
                <p className="font-display text-lg font-bold text-[#2A1254]">
                  ₹{selectedService.price}
                </p>
                <p className="text-[11px] text-[#655A7C]">{selectedService.priceUnit}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="srv-date"
                    className="block text-xs font-semibold text-[#2A1254] mb-1.5"
                  >
                    Preferred Date *
                  </label>
                  <input
                    id="srv-date"
                    type="date"
                    min={minDate}
                    value={preferredDate}
                    onChange={(e) => {
                      setPreferredDate(e.target.value);
                      if (errors.preferredDate) setErrors((prev) => ({ ...prev, preferredDate: '' }));
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#1A132B] bg-white focus:outline-none focus:ring-2 focus:ring-[#3B1D6E] ${
                      errors.preferredDate ? 'border-rose-500' : 'border-[#DDD4F2]'
                    }`}
                  />
                  {errors.preferredDate && (
                    <p className="text-xs text-rose-600 mt-1">{errors.preferredDate}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="srv-time"
                    className="block text-xs font-semibold text-[#2A1254] mb-1.5"
                  >
                    Preferred Time Slot *
                  </label>
                  <select
                    id="srv-time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD4F2] text-sm text-[#1A132B] bg-white focus:outline-none focus:ring-2 focus:ring-[#3B1D6E]"
                  >
                    {SERVICE_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label
                  htmlFor="srv-name"
                  className="block text-xs font-semibold text-[#2A1254] mb-1.5"
                >
                  Student Full Name *
                </label>
                <input
                  id="srv-name"
                  type="text"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (errors.studentName) setErrors((prev) => ({ ...prev, studentName: '' }));
                  }}
                  placeholder="e.g., Aarav Sharma"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#1A132B] bg-white focus:outline-none focus:ring-2 focus:ring-[#3B1D6E] ${
                    errors.studentName ? 'border-rose-500' : 'border-[#DDD4F2]'
                  }`}
                />
                {errors.studentName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.studentName}</p>
                )}
              </div>

              {/* Mobile & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="srv-mobile"
                    className="block text-xs font-semibold text-[#2A1254] mb-1.5"
                  >
                    Mobile Number *
                  </label>
                  <input
                    id="srv-mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                      if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: '' }));
                    }}
                    placeholder="10-digit number"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#1A132B] bg-white tabular-nums focus:outline-none focus:ring-2 focus:ring-[#3B1D6E] ${
                      errors.mobile ? 'border-rose-500' : 'border-[#DDD4F2]'
                    }`}
                  />
                  {errors.mobile && <p className="text-xs text-rose-600 mt-1">{errors.mobile}</p>}
                </div>

                <div>
                  <label
                    htmlFor="srv-email"
                    className="block text-xs font-semibold text-[#2A1254] mb-1.5"
                  >
                    Email Address *
                  </label>
                  <input
                    id="srv-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="student@dgu.edu"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#1A132B] bg-white focus:outline-none focus:ring-2 focus:ring-[#3B1D6E] ${
                      errors.email ? 'border-rose-500' : 'border-[#DDD4F2]'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="srv-location"
                  className="block text-xs font-semibold text-[#2A1254] mb-1.5"
                >
                  Hostel or Campus Pickup Location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#7A6F93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="srv-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DDD4F2] text-sm text-[#1A132B] bg-white focus:outline-none focus:ring-2 focus:ring-[#3B1D6E]"
                  >
                    {ALL_CAMPUS_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="srv-notes"
                  className="block text-xs font-semibold text-[#2A1254] mb-1.5"
                >
                  Service Notes (Optional)
                </label>
                <textarea
                  id="srv-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Room number, document count, parcel courier name, or preferred instructions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD4F2] text-sm text-[#1A132B] bg-white focus:outline-none focus:ring-2 focus:ring-[#3B1D6E] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3B1D6E]"
              >
                Submit Demo Booking Request — ₹{selectedService.price}
              </button>

              <p className="text-[11px] text-[#6B5E84] text-center leading-relaxed">
                Demonstration booking flow · No online payment required · Stored locally in your
                browser
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
