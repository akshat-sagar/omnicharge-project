import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { operatorService, planService } from '../../../core/services/operatorPlanService';
import { rechargeService, paymentService } from '../../../core/services/rechargePaymentService';
import { Card, SectionHeader, Spinner, EmptyState } from '../../../shared/components/ui';
import Button from '../../../shared/components/ui/Button';
import { formatCurrency, getErrorMessage } from '../../../shared/utils/helpers';
import {
  buildRazorpayMethodConfig,
  buildRazorpayDisplayConfig,
  cleanupRazorpayArtifacts,
  loadRazorpayScript,
} from '../../../shared/utils/razorpay';
import { userStorage } from '../../../core/auth/authStorage';
import { useAppTheme } from '../../../core/providers/AppThemeProvider';
import type { OperatorResponseDTO, PlanResponseDTO, PaymentMethod } from '../../../shared/types';

type Step = 'operator' | 'plan' | 'payment' | 'confirm';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'UPI', label: 'UPI', icon: 'qr_code' },
  { value: 'CARD', label: 'Credit / Debit Card', icon: 'credit_card' },
  { value: 'NETBANKING', label: 'Net Banking', icon: 'account_balance' },
];

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const PAYMENT_TIMEOUT_MS = 11 * 60 * 1000;

const RechargePage: React.FC = () => {
  const { isDark } = useAppTheme();
  const [step, setStep] = useState<Step>('operator');
  const [operators, setOperators] = useState<OperatorResponseDTO[]>([]);
  const [plans, setPlans] = useState<PlanResponseDTO[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<OperatorResponseDTO | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanResponseDTO | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [loadingOps, setLoadingOps] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileError, setMobileError] = useState('');
  const paymentTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    cleanupRazorpayArtifacts();

    return () => {
      if (paymentTimeoutRef.current) {
        window.clearTimeout(paymentTimeoutRef.current);
      }
      cleanupRazorpayArtifacts();
    };
  }, []);

  useEffect(() => {
    operatorService.getAllOperators()
        .then((r) => setOperators(r.data || []))
        .catch(() => toast.error('Failed to load operators'))
        .finally(() => setLoadingOps(false));
  }, []);

  const handleSelectOperator = async (op: OperatorResponseDTO) => {
    setSelectedOperator(op);
    setSelectedPlan(null);
    setStep('plan');
    setLoadingPlans(true);
    try {
      const r = await planService.getPlansByOperator(op.id);
      setPlans(r.data || []);
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSelectPlan = (plan: PlanResponseDTO) => {
    setSelectedPlan(plan);
    setStep('payment');
  };

  const validateMobile = (val: string) => {
    if (!val) return 'Mobile number is required';
    if (!/^[6-9]\d{9}$/.test(val)) return 'Enter a valid 10-digit mobile number starting with 6–9';
    return '';
  };

  const handleRecharge = async () => {
    if (!selectedOperator || !selectedPlan) return;

    setSubmitting(true);
    try {
      const mobileValidationError = validateMobile(mobileNumber);
      if (mobileValidationError) {
        setMobileError(mobileValidationError);
        return;
      }
      setMobileError('');

      const rechargeRes = await rechargeService.addRecharge({
        operatorId: selectedOperator.id,
        planId: selectedPlan.id,
        paymentMethod,
        mobileNumber,
      });
      const rechargeId = rechargeRes.data?.rechargeId;
      const razorpayMethod = buildRazorpayMethodConfig(paymentMethod);
      const razorpayDisplay = buildRazorpayDisplayConfig(paymentMethod);
      const loggedInUser = userStorage.getUser();

      if (paymentTimeoutRef.current) {
        window.clearTimeout(paymentTimeoutRef.current);
      }

      paymentTimeoutRef.current = window.setTimeout(async () => {
        try {
          await rechargeService.updateRechargeStatus(rechargeId, 'CANCELLED');
          toast.error('Payment timed out after 11 minutes. Recharge marked as cancelled.');
        } catch {
          toast.error('Payment timed out, but we could not update the recharge status automatically.');
        } finally {
          paymentTimeoutRef.current = null;
        }
      }, PAYMENT_TIMEOUT_MS);

      const orderRes = await paymentService.createOrder({ rechargeId, paymentMethod });
      const { razorpayOrderId, amount, currency, keyId } = orderRes.data;
      const razorpayKey = keyId || import.meta.env.VITE_RAZORPAY_KEY;

      if (!razorpayKey) {
        throw new Error('Razorpay key is missing from the order response');
      }

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay checkout. Please try again.');
      }

      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: amount * 100,
        currency,
        order_id: razorpayOrderId,
        name: 'OmniCharge',
        description: selectedPlan.description,
        method: razorpayMethod,
        config: razorpayDisplay,
        modal: {
          ondismiss: () => {
            cleanupRazorpayArtifacts();
            toast('Payment is still pending. Complete it within 11 minutes or it will be cancelled.');
          },
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            if (paymentTimeoutRef.current) {
              window.clearTimeout(paymentTimeoutRef.current);
              paymentTimeoutRef.current = null;
            }
            await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Recharge successful!');
            resetFlow();
          } catch {
            if (paymentTimeoutRef.current) {
              window.clearTimeout(paymentTimeoutRef.current);
              paymentTimeoutRef.current = null;
            }
            await rechargeService.updateRechargeStatus(rechargeId, 'FAILED');
            toast.error('Payment verification failed');
          } finally {
            cleanupRazorpayArtifacts();
          }
        },
        prefill: {
          contact: mobileNumber,
          email: loggedInUser?.email || undefined,
        },
      });
      rzp.open();
    } catch (err) {
      if (paymentTimeoutRef.current) {
        window.clearTimeout(paymentTimeoutRef.current);
        paymentTimeoutRef.current = null;
      }
      cleanupRazorpayArtifacts();
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep('operator');
    setSelectedOperator(null);
    setSelectedPlan(null);
    setMobileNumber('');
    setMobileError('');
  };

  const steps = [
    { key: 'operator', label: 'Operator' },
    { key: 'plan', label: 'Plan' },
    { key: 'payment', label: 'Payment' },
    { key: 'confirm', label: 'Confirm' },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
      <div>
        <SectionHeader title="New Recharge" subtitle="Select operator, plan and complete payment" />

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
          {steps.map((s, i) => (
              <React.Fragment key={s.key}>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                      className={[
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
                        i < stepIndex
                            ? 'bg-primary-600 text-white'
                            : i === stepIndex
                                ? 'bg-primary-600 text-white'
                                : 'bg-surface-200 text-surface-500',
                      ].join(' ')}
                  >
                    {i < stepIndex ? (
                        <span className="material-icon text-[14px]">check</span>
                    ) : (
                        i + 1
                    )}
                  </div>
                  <span
                      className={`text-sm font-medium whitespace-nowrap ${
                          i === stepIndex ? 'text-surface-900' : i < stepIndex ? 'text-surface-600' : 'text-surface-400'
                      }`}
                  >
                {s.label}
              </span>
                </div>
                {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 min-w-[24px] mx-3 ${i < stepIndex ? 'bg-primary-400' : 'bg-surface-200'}`} />
                )}
              </React.Fragment>
          ))}
        </div>

        <div className="w-full">
          <AnimatePresence mode="wait">
            {/* Step 1: Operator */}
            {step === 'operator' && (
                <motion.div key="operator" {...fadeUp} transition={{ duration: 0.2 }}>
                  <Card>
                    <h2 className="text-sm font-semibold text-surface-900 mb-4">Select Operator</h2>
                    {loadingOps ? (
                        <Spinner className="py-8" />
                    ) : operators.length === 0 ? (
                        <EmptyState icon="business" title="No operators found" />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {operators.map((op) => (
                              <button
                                  key={op.id}
                                  onClick={() => handleSelectOperator(op)}
                                  className="recharge-operator-card flex flex-col items-center gap-2 p-4 rounded-lg border border-surface-200/60 hover:bg-surface-400/15 hover:border-surface-300/80 transition-all text-center group"
                              >
                                <div className="recharge-operator-icon w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                          <span className="material-icon recharge-operator-icon-glyph text-[20px] text-surface-600 group-hover:text-surface-700">
                            cell_tower
                          </span>
                                </div>
                                <span className="recharge-operator-label text-sm font-medium text-surface-700 group-hover:text-surface-900">
                          {op.name}
                        </span>
                              </button>
                          ))}
                        </div>
                    )}
                  </Card>
                </motion.div>
            )}

            {/* Step 2: Plan */}
            {step === 'plan' && (
                <motion.div key="plan" {...fadeUp} transition={{ duration: 0.2 }}>
                  <Card>
                    <div className="flex items-center gap-3 mb-4">
                      <button
                          onClick={() => setStep('operator')}
                          className="text-surface-400 hover:text-surface-700 transition-colors"
                      >
                        <span className="material-icon text-[20px]">arrow_back</span>
                      </button>
                      <div>
                        <h2 className="text-sm font-semibold text-surface-900">
                          Plans — {selectedOperator?.name}
                        </h2>
                        <p className="text-xs text-surface-500">Select a recharge plan</p>
                      </div>
                    </div>

                    {loadingPlans ? (
                        <Spinner className="py-8" />
                    ) : plans.length === 0 ? (
                        <EmptyState icon="list_alt" title="No plans available for this operator" />
                    ) : (
                        <div className="space-y-2">
                          {plans.map((plan) => (
                              <button
                                  key={plan.id}
                                  onClick={() => handleSelectPlan(plan)}
                                  className={[
                                    'w-full flex items-center justify-between p-4 rounded-xl text-left group transition-all duration-200',
                                    isDark
                                        ? 'border border-white/10 bg-white/[0.05] shadow-[0_10px_28px_rgba(2,6,23,0.24)] hover:border-primary-400/30 hover:bg-primary-500/[0.08] hover:shadow-[0_18px_42px_rgba(15,23,42,0.32)]'
                                        : 'border border-surface-200/60 hover:bg-surface-400/15 hover:border-surface-300/80',
                                  ].join(' ')}
                              >
                                <div className="flex-1 min-w-0 mr-4">
                                  <p className={[
                                    'text-sm font-semibold transition-colors',
                                    isDark ? 'text-surface-100 group-hover:text-white' : 'text-surface-700 group-hover:text-surface-900',
                                  ].join(' ')}>
                                    {formatCurrency(plan.amount)}
                                  </p>
                                  <p className={[
                                    'text-xs mt-0.5 truncate transition-colors',
                                    isDark ? 'text-surface-400 group-hover:text-surface-300' : 'text-surface-500 group-hover:text-surface-600',
                                  ].join(' ')}>{plan.description}</p>
                                  <div className="flex items-center gap-1 mt-1">
                            <span className={[
                              'material-icon text-[12px] transition-colors',
                              isDark ? 'text-surface-500 group-hover:text-surface-400' : 'text-surface-400 group-hover:text-surface-500',
                            ].join(' ')}>schedule</span>
                                    <span className={[
                                      'text-xs transition-colors',
                                      isDark ? 'text-surface-500 group-hover:text-surface-400' : 'text-surface-400 group-hover:text-surface-500',
                                    ].join(' ')}>{plan.validity}</span>
                                  </div>
                                </div>
                                <span className={[
                                  'material-icon text-[20px] flex-shrink-0 transition-colors',
                                  isDark ? 'text-surface-600 group-hover:text-surface-300' : 'text-surface-300 group-hover:text-surface-600',
                                ].join(' ')}>
                          arrow_forward_ios
                        </span>
                              </button>
                          ))}
                        </div>
                    )}
                  </Card>
                </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 'payment' && (
                <motion.div key="payment" {...fadeUp} transition={{ duration: 0.2 }}>
                  <Card>
                    <div className="flex items-center gap-3 mb-5">
                      <button
                          onClick={() => setStep('plan')}
                          className="text-surface-400 hover:text-surface-700 transition-colors"
                      >
                        <span className="material-icon text-[20px]">arrow_back</span>
                      </button>
                      <h2 className="text-sm font-semibold text-surface-900">Payment Details</h2>
                    </div>

                    {/* Mobile number */}
                    <div className="flex flex-col gap-1.5 mb-5">
                      <label className="text-sm font-medium text-surface-700">
                        Mobile number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                    <span className="material-icon absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-surface-400">
                      phone
                    </span>
                        <input
                            type="tel"
                            placeholder="9876543210"
                            value={mobileNumber}
                            maxLength={10}
                            onChange={(e) => {
                              setMobileNumber(e.target.value.replace(/\D/g, ''));
                              if (mobileError) setMobileError('');
                            }}
                            className={[
                              'w-full rounded-lg border bg-white text-surface-900 text-sm h-10 pl-10 pr-3.5',
                              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                              mobileError
                                  ? 'border-red-400 bg-red-50'
                                  : 'border-surface-300 hover:border-surface-400',
                            ].join(' ')}
                        />
                      </div>
                    {mobileError && (
                          <p className="flex items-center gap-1 text-xs text-red-600">
                            <span className="material-icon text-[14px]">error</span>
                            {mobileError}
                          </p>
                      )}
                    </div>

                    {/* Payment method */}
                    <p className="text-sm font-medium text-surface-700 mb-3">Payment method</p>
                    <div className="space-y-2 mb-6">
                      {PAYMENT_METHODS.map((m) => (
                          <label
                              key={m.value}
                              className={[
                                'flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all',
                                paymentMethod === m.value
                                    ? 'border-surface-300/80 bg-surface-400/15'
                                    : 'border-surface-200/60 hover:bg-surface-400/15 hover:border-surface-300/80',
                              ].join(' ')}
                          >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={m.value}
                                checked={paymentMethod === m.value}
                                onChange={() => setPaymentMethod(m.value)}
                                className="sr-only"
                            />
                            <span
                                className={`material-icon text-[20px] transition-colors ${
                                    paymentMethod === m.value ? 'text-surface-700' : 'text-surface-500'
                                }`}
                            >
                        {m.icon}
                      </span>
                            <span
                                className={`text-sm font-medium transition-colors ${
                                    paymentMethod === m.value ? 'text-surface-900' : 'text-surface-700'
                                }`}
                            >
                        {m.label}
                      </span>
                            <div className="ml-auto">
                              <div
                                  className={[
                                    'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                                    paymentMethod === m.value
                                        ? 'border-surface-600'
                                        : 'border-surface-300',
                                  ].join(' ')}
                              >
                                {paymentMethod === m.value && (
                                    <div className="w-2 h-2 rounded-full bg-surface-600" />
                                )}
                              </div>
                            </div>
                          </label>
                      ))}
                    </div>

                    <Button fullWidth onClick={handleRecharge}>
                      Continue
                    </Button>
                  </Card>
                </motion.div>
            )}

            {/* Step 4: Confirm */}
            {step === 'confirm' && (
                <motion.div key="confirm" {...fadeUp} transition={{ duration: 0.2 }}>
                  <Card>
                    <div className="flex items-center gap-3 mb-5">
                      <button
                          onClick={() => setStep('payment')}
                          className="text-surface-400 hover:text-surface-700 transition-colors"
                      >
                        <span className="material-icon text-[20px]">arrow_back</span>
                      </button>
                      <h2 className="text-sm font-semibold text-surface-900">Confirm Recharge</h2>
                    </div>

                    <div className="bg-surface-50 rounded-xl p-4 space-y-3 mb-6">
                      {[
                        { label: 'Mobile Number', value: mobileNumber, icon: 'phone' },
                        { label: 'Operator', value: selectedOperator?.name, icon: 'cell_tower' },
                        { label: 'Plan', value: selectedPlan?.description, icon: 'list_alt' },
                        { label: 'Validity', value: selectedPlan?.validity, icon: 'schedule' },
                        { label: 'Payment Method', value: paymentMethod, icon: 'payment' },
                      ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-surface-500">
                              <span className="material-icon text-[16px]">{item.icon}</span>
                              <span className="text-sm">{item.label}</span>
                            </div>
                            <span className="text-sm font-medium text-surface-900 text-right">{item.value}</span>
                          </div>
                      ))}
                      <div className="border-t border-surface-200 pt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-surface-700">Total Amount</span>
                        <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(selectedPlan?.amount || 0)}
                    </span>
                      </div>
                    </div>

                    <Button fullWidth loading={submitting} onClick={handleRecharge} size="lg" icon="bolt">
                      Pay {formatCurrency(selectedPlan?.amount || 0)}
                    </Button>
                  </Card>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
};

export default RechargePage;
