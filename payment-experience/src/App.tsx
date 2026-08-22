import { useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BadgeDollarSign,
  Bell,
  Check,
  ChevronRight,
  CircleDollarSign,
  CircleOff,
  CreditCard,
  FileText,
  Heart,
  Landmark,
  LayoutDashboard,
  Link2,
  Menu,
  MoreHorizontal,
  PauseCircle,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Settings2,
  Users,
  X,
} from 'lucide-react'

type View = 'overview' | 'collect' | 'transactions' | 'recurring' | 'donors' | 'reconciliation' | 'settings'
type Frequency = 'One time' | 'Monthly' | 'Quarterly' | 'Annually'
type PaymentMethod = 'card' | 'ach'
type CollectionMode = 'donation-page' | 'invoice' | 'payment-link' | 'manual-payment' | null
type OperationKind = 'transaction' | 'recurring' | 'donor' | 'reconciliation'
type Workflow = { kind: OperationKind; action: string } | null

const navigation: Array<{ id: View; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'collect', label: 'Collect', icon: CircleDollarSign },
  { id: 'transactions', label: 'Transactions', icon: ReceiptText },
  { id: 'recurring', label: 'Recurring', icon: RefreshCw },
  { id: 'donors', label: 'Donors & customers', icon: Users },
  { id: 'reconciliation', label: 'Reconciliation', icon: Landmark },
  { id: 'settings', label: 'Settings', icon: MoreHorizontal },
]

const recentPayments = [
  { name: 'Maya Thompson', source: 'Springwater restoration', amount: '$250.00', status: 'Paid', time: 'Just now' },
  { name: 'William Chen', source: 'Monthly stewardship', amount: '$45.00', status: 'Paid', time: '12 min ago' },
  { name: 'Amina Rahman', source: 'Community garden fund', amount: '$80.00', status: 'Pending', time: '28 min ago' },
]

function loadRecentPayments() {
  try {
    const storedPayments = localStorage.getItem('solace-payment-mock-activity')
    return storedPayments ? JSON.parse(storedPayments) as typeof recentPayments : recentPayments
  } catch {
    return recentPayments
  }
}

function App() {
  const [view, setView] = useState<View>('overview')
  const [mobilePaymentsMenuOpen, setMobilePaymentsMenuOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [collectionMode, setCollectionMode] = useState<CollectionMode>(null)
  const [workflow, setWorkflow] = useState<Workflow>(null)
  const [frequency, setFrequency] = useState<Frequency>('Monthly')
  const [amount, setAmount] = useState('45')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [recentActivity, setRecentActivity] = useState(loadRecentPayments)
  const [feeCovered, setFeeCovered] = useState(true)
  const [anonymous, setAnonymous] = useState(false)
  const [toast, setToast] = useState('')
  const [completed, setCompleted] = useState(false)

  function chooseView(nextView: View) {
    setView(nextView)
    setMobilePaymentsMenuOpen(false)
  }

  function openCheckout() {
    setCompleted(false)
    setPaymentMethod('card')
    setCheckoutOpen(true)
  }

  function completeGift() {
    const settled = paymentMethod === 'card'
    const payment = {
      name: 'You',
      source: paymentMethod === 'ach' ? 'Springwater restoration · Bank debit' : 'Springwater restoration · Card ending in 4242',
      amount: `$${Number(amount || 0).toFixed(2)}`,
      status: settled ? 'Paid' : 'Pending',
      time: 'Just now',
    }
    setRecentActivity((activity) => {
      const updatedActivity = [payment, ...activity.filter((item) => item.name !== 'You')].slice(0, 4)
      localStorage.setItem('solace-payment-mock-activity', JSON.stringify(updatedActivity))
      return updatedActivity
    })
    setCompleted(true)
    setToast(settled ? `Gift of $${amount || '0'} confirmed and receipt queued` : `Bank debit of $${amount || '0'} is processing`)
  }

  const pageTitle = navigation.find((item) => item.id === view)?.label ?? 'Payments'

  return (
    <main className="shell">
      <aside className="crm-rail" aria-label="CRM navigation">
        <a className="crm-brand" href="#payments" aria-label="Solace CRM home"><span>S</span><strong>Solace</strong></a>
        <nav className="crm-primary-nav">
          <button className="crm-primary-item" onClick={() => setToast('Home is outside this Payments prototype.')}><LayoutDashboard size={18} /><span>Home</span></button>
          <button className="crm-primary-item" onClick={() => setToast('Contacts is outside this Payments prototype.')}><Users size={18} /><span>Contacts</span></button>
          <button className="crm-primary-item" onClick={() => setToast('Pipeline is outside this Payments prototype.')}><BarChart3 size={18} /><span>Pipeline</span></button>
          <div className={`payments-module ${mobilePaymentsMenuOpen ? 'mobile-payments-menu-open' : ''}`}>
            <button className="crm-primary-item active-module" onClick={() => { setView('overview'); setMobilePaymentsMenuOpen((open) => !open) }} aria-controls="payments-subnav"><CircleDollarSign size={18} /><span>Payments</span></button>
            <nav className="payments-subnav" id="payments-subnav" aria-label="Payments navigation">
              {navigation.map((item) => <button className={view === item.id ? 'payments-subnav-item active-payments-subnav-item' : 'payments-subnav-item'} key={item.id} onClick={() => chooseView(item.id)}>{item.label}</button>)}
            </nav>
          </div>
          <button className="crm-primary-item" onClick={() => setToast('Tasks is outside this Payments prototype.')}><Check size={18} /><span>Tasks</span></button>
        </nav>
        <div className="crm-rail-footer"><button className={view === 'settings' ? 'crm-primary-item active-payments-subnav-item' : 'crm-primary-item'} onClick={() => chooseView('settings')}><Settings2 size={18} /><span>Administration</span></button><div className="avatar">NR</div></div>
      </aside>

      <section className="app-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open Payments navigation" onClick={() => setMobilePaymentsMenuOpen((open) => !open)}><Menu size={21} /></button>
          <div className="breadcrumb"><span>CRM</span><ChevronRight size={14} /><strong>{pageTitle}</strong></div>
          <div className="header-actions"><a className="experience-guide-link" href="/payments/guide/" title="Open the Payments experience guide"><FileText size={16} /><span>Experience guide</span></a><button className="icon-button" aria-label="Notifications"><Bell size={19} /><span className="notification-dot" /></button><div className="avatar">NR</div></div>
        </header>

        <div className="page">
          {view === 'overview' && <Overview onCollect={() => chooseView('collect')} onCheckout={openCheckout} onOpenDonor={() => chooseView('donors')} payments={recentActivity} />}
          {view === 'collect' && <Collect onCheckout={openCheckout} onCompose={setCollectionMode} />}
          {view === 'transactions' && <Operations title="Transaction ledger" eyebrow="Every payment, complete with its evidence." rows={['Payment #PM-1048  Maya Thompson  $250.00  Paid', 'Payment #PM-1047  William Chen  $45.00  Paid', 'Payment #PM-1046  Amina Rahman  $80.00  Pending']} kind="transaction" openWorkflow={(kind, action) => setWorkflow({ kind, action })} />}
          {view === 'recurring' && <Operations title="Recurring generosity" eyebrow="Healthy relationships, visible before they need attention." rows={['William Chen  $45 monthly  Next: Apr 18', 'Maya Thompson  $100 monthly  Next: Apr 21', 'Priya Shah  $30 quarterly  Payment needs attention']} kind="recurring" openWorkflow={(kind, action) => setWorkflow({ kind, action })} />}
          {view === 'donors' && <Operations title="Donor & customer context" eyebrow="A financial relationship is a story, not a row." rows={['Priya Shah  $760 lifetime  9 gifts', 'Maya Thompson  $1,850 lifetime  7 gifts', 'William Chen  $540 lifetime  12 gifts', 'Amina Rahman  $80 lifetime  New supporter']} kind="donor" openWorkflow={(kind, action) => setWorkflow({ kind, action })} />}
          {view === 'reconciliation' && <Operations title="Reconciliation, without the hunt" eyebrow="One payout needs a decision. Everything else already matches." rows={['Mar 13 payout  $4,280.65  18 payments matched', 'Mar 12 payout  $3,690.00  Reconciled', 'ACH transfer  $80.00  Waiting to settle']} kind="reconciliation" openWorkflow={(kind, action) => setWorkflow({ kind, action })} />}
          {view === 'settings' && <Settings notify={setToast} />}
        </div>
      </section>

      {checkoutOpen && <Checkout amount={amount} setAmount={setAmount} frequency={frequency} setFrequency={setFrequency} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} feeCovered={feeCovered} setFeeCovered={setFeeCovered} anonymous={anonymous} setAnonymous={setAnonymous} completed={completed} onClose={() => setCheckoutOpen(false)} onComplete={completeGift} />}
      {collectionMode && <CollectionComposer mode={collectionMode} onClose={() => setCollectionMode(null)} notify={setToast} />}
      {workflow && <WorkflowSheet workflow={workflow} onClose={() => setWorkflow(null)} notify={setToast} />}
      {toast && <div className="toast"><Check size={16} />{toast}<button aria-label="Dismiss message" onClick={() => setToast('')}><X size={15} /></button></div>}
    </main>
  )
}

function Overview({ onCollect, onCheckout, onOpenDonor, payments }: { onCollect: () => void; onCheckout: () => void; onOpenDonor: () => void; payments: typeof recentPayments }) {
  return <>
    <div className="page-intro"><div><p className="eyebrow">Monday, March 17</p><h1>Money, in good hands.</h1><p className="subtle">Your collection system is calm. One recovery deserves a glance.</p></div><button className="primary-action" onClick={onCollect}><CircleDollarSign size={18} />Collect payment</button></div>
    <section className="crm-context-strip" aria-label="Current CRM context"><div><p className="eyebrow">CRM CONTEXT · RELATIONSHIP TO WATCH</p><strong>Priya Shah <span>·</span> Monthly supporter</strong><p>One $30 renewal needs attention. Her history, preferences, and next touch stay together.</p></div><button className="outline-button" onClick={onOpenDonor}>Open customer context</button></section>
    <section className="confidence-banner"><div className="confidence-icon"><BadgeDollarSign size={26} /></div><div><p className="eyebrow">Cash confidence</p><h2>98.4% of expected revenue is on track.</h2><p>Settlements, recurring support, and receipts are running cleanly.</p></div><button className="quiet-link" onClick={onCheckout}>Try the donor checkout <ArrowRight size={16} /></button></section>
    <section className="metrics-grid"><Metric label="Collected this month" value="$42,860" detail="12.8% ahead of February" tone="green" /><Metric label="Recurring revenue" value="$16,240" detail="188 active commitments" tone="coral" /><Metric label="Ready to reconcile" value="$7,970" detail="2 payouts arrive tomorrow" tone="gold" /></section>
    <section className="dashboard-grid"><div className="panel action-panel"><div className="panel-heading"><div><p className="eyebrow">Needs a human</p><h2>One considerate recovery</h2></div><span className="count-pill">1</span></div><div className="recovery-row"><div className="person-avatar amber">PS</div><div><strong>Priya Shah</strong><p>Monthly gift of $30 did not clear.</p></div><button className="outline-button" onClick={onCheckout}>Send secure update</button></div><p className="helper-text">A gentle reminder is scheduled for tomorrow. No action is needed today.</p></div><div className="panel flow-panel"><p className="eyebrow">Today’s flow</p><div className="flow-value">$2,675<span>.00</span></div><div className="flow-bars" aria-label="Payment flow chart"><i /><i /><i /><i /><i /><i className="tall" /><i /><i className="mid" /><i /></div><div className="flow-caption"><span>9 gifts received</span><span>2 pending settlement</span></div></div></section>
    <section className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">Live activity</p><h2>Recent payments</h2></div><button className="text-button" onClick={onCollect}>View all <ArrowRight size={15} /></button></div>{payments.map((payment) => <div className="payment-row" key={`${payment.name}-${payment.source}`}><div className="person-avatar">{payment.name.split(' ').map((name) => name[0]).join('')}</div><div className="payment-info"><strong>{payment.name}</strong><span>{payment.source} · {payment.time}</span></div><strong>{payment.amount}</strong><span className={`status ${payment.status.toLowerCase()}`}>{payment.status}</span></div>)}</section>
  </>
}

function Collect({ onCheckout, onCompose }: { onCheckout: () => void; onCompose: (mode: Exclude<CollectionMode, null>) => void }) {
  return <><div className="page-intro compact"><div><p className="eyebrow">Collection studio</p><h1>Meet people where they are.</h1><p className="subtle">Start with the relationship, then choose the simplest collection path.</p></div></div><section className="collection-grid"><button className="collection-card featured" onClick={() => onCompose('donation-page')}><span className="card-icon"><Heart size={22} /></span><p className="eyebrow">Create a donation page</p><h2>A giving experience with warmth built in.</h2><span>Build a reusable page <ArrowRight size={17} /></span></button><button className="collection-card" onClick={() => onCompose('invoice')}><span className="card-icon blue"><FileText size={22} /></span><p className="eyebrow">Send an invoice</p><h2>Ask clearly, follow up gently.</h2><span>Create for a CRM record <ArrowRight size={17} /></span></button><button className="collection-card" onClick={() => onCompose('payment-link')}><span className="card-icon coral"><Link2 size={22} /></span><p className="eyebrow">Share a payment link</p><h2>One link, every channel.</h2><span>Build and copy a link <ArrowRight size={17} /></span></button><button className="collection-card" onClick={() => onCompose('manual-payment')}><span className="card-icon blue"><Landmark size={22} /></span><p className="eyebrow">Record payment</p><h2>Capture cash, check, wire, or external settlement.</h2><span>Preserve the audit trail <ArrowRight size={17} /></span></button></section><section className="panel builder-panel"><div><p className="eyebrow">Giving page, live</p><h2>Springwater restoration</h2><p>Monthly support keeps local waterways healthy year-round.</p></div><div className="builder-tags"><span>Campaign-linked</span><span>Receipts on</span><span>Attribution captured</span></div><button className="outline-button" onClick={onCheckout}>Preview donor checkout <ArrowRight size={16} /></button></section></>
}

function Operations({ title, eyebrow, rows, kind, openWorkflow }: { title: string; eyebrow: string; rows: string[]; kind: OperationKind; openWorkflow: (kind: OperationKind, action: string) => void }) {
  const [selected, setSelected] = useState(rows[0])
  const labels = {
    transaction: { action: 'Request refund', secondary: 'Open dispute case', detail: 'The receipt, CRM association, provider attempt, and event history agree.', association: 'Contact: Maya Thompson · Campaign: Springwater restoration · Receipt: RC-2026-1048', state: 'Settled · Card · 2.9% fee · Net $242.45', events: ['Provider charge succeeded', 'Receipt RC-2026-1048 issued', 'Gift allocation posted to Springwater'] },
    recurring: { action: 'Pause this gift', secondary: 'Cancel respectfully', detail: 'The donor receives control without a difficult conversation.', association: 'Contact: William Chen · Active since May 2024 · Management link issued', state: 'Active · $45 monthly · Next charge Apr 18', events: ['Welcome journey completed', 'Mar 18 renewal settled', 'Next charge scheduled for Apr 18'] },
    donor: { action: 'Open self-service', secondary: 'Send acknowledgement', detail: 'Donation history, preferences, and communication stay together.', association: 'Contact: Maya Thompson · Lifetime giving $1,850 · Preferred fund: Springwater', state: '7 gifts · 1 active recurring commitment · Email receipts', events: ['First gift: Sep 2024', 'Personal acknowledgement: Feb 19', 'Most recent receipt delivered today'] },
    reconciliation: { action: 'Confirm match', secondary: 'Mark for review', detail: 'The payment processor evidence and payout amount align.', association: 'Payout: PO-0313 · Accounting export: Ready · Owner: Nora Reed', state: '18 payments · Gross $4,405.00 · Fees $124.35 · Net $4,280.65', events: ['Processor payout created', '18 linked payments auto-matched', 'Export entry prepared for review'] },
  }[kind]
  return <><div className="page-intro compact"><div><p className="eyebrow">Operations</p><h1>{title}</h1><p className="subtle">{eyebrow}</p></div></div><section className="panel data-panel"><div className="data-header"><span>Relationship</span><span>Value</span><span>State</span></div>{rows.map((row) => <button className={`data-row ${selected === row ? 'selected-row' : ''}`} onClick={() => setSelected(row)} key={row}><span>{row}</span><ChevronRight size={18} /></button>)}</section><section className="record-focus"><div className="record-icon">{kind === 'transaction' && <CreditCard size={21} />}{kind === 'recurring' && <RefreshCw size={21} />}{kind === 'donor' && <Users size={21} />}{kind === 'reconciliation' && <Landmark size={21} />}</div><div className="record-copy"><p className="eyebrow">Focused record</p><h2>{selected.split('  ')[0]}</h2><p>{labels.detail}</p></div><div className="record-actions"><button className="outline-button" onClick={() => openWorkflow(kind, labels.secondary)}>{kind === 'recurring' ? <CircleOff size={15} /> : <FileText size={15} />}{labels.secondary}</button><button className="primary-action" onClick={() => openWorkflow(kind, labels.action)}>{kind === 'recurring' ? <PauseCircle size={16} /> : <Check size={16} />}{labels.action}</button></div></section><section className="record-depth"><div><p className="eyebrow">CRM relationships</p><strong>{labels.association}</strong><p>{labels.state}</p></div><div><p className="eyebrow">Immutable activity</p>{labels.events.map((event) => <div className="audit-event" key={event}><Check size={14} />{event}</div>)}</div></section></>
}

function WorkflowSheet({ workflow, onClose, notify }: { workflow: Exclude<Workflow, null>; onClose: () => void; notify: (message: string) => void }) {
  const copy = {
    transaction: workflow.action === 'Request refund' ? { title: 'Request a refund', detail: 'The original payment stays intact. This request creates a separate, auditable refund record.', action: 'Submit for approval', steps: ['Refundable balance: $250.00', 'Original card ending in 4242', 'Donor confirmation: send after approval'] } : { title: 'Open a dispute case', detail: 'The case locks risky changes and gives one owner a clear evidence deadline.', action: 'Assign evidence owner', steps: ['Amount at risk: $250.00', 'Evidence deadline: Mar 22', 'Receipt and provider attempt are already attached'] },
    recurring: workflow.action === 'Pause this gift' ? { title: 'Pause this recurring gift', detail: 'No future charge will run while the gift is paused. The donor can resume through their management link.', action: 'Pause through Jun 18', steps: ['Current cadence: $45 monthly', 'Next charge: Apr 18', 'Management link remains active'] } : { title: 'Respectful cancellation', detail: 'The cancellation path is clear. Pausing, lowering, and changing cadence are optional alternatives, never a barrier.', action: 'Cancel recurring gift', steps: ['Effective date: immediately', 'No future charges will run', 'Receipt history and rejoin link stay available'] },
    donor: workflow.action === 'Open self-service' ? { title: 'Donor self-service link', detail: 'A signed, time-limited link lets the supporter safely update method, amount, cadence, and preferences.', action: 'Send secure management link', steps: ['Link expires in 7 days', 'Update method through provider-hosted fields', 'Receipt history remains available'] } : { title: 'Send a personal acknowledgement', detail: 'This is separate from the financial receipt and will not alter the payment record.', action: 'Send acknowledgement', steps: ['Recipient: Maya Thompson', 'Preferred channel: email', 'Consent: stewardship communications allowed'] },
    reconciliation: workflow.action === 'Confirm match' ? { title: 'Confirm payout match', detail: 'The expected gross, fees, and net agree. Confirming prepares the accounting export.', action: 'Confirm and export', steps: ['18 payments matched', 'Variance: $0.00', 'Export target: QuickBooks clearing account'] } : { title: 'Mark reconciliation exception', detail: 'A human-owned exception preserves the source records without changing their financial state.', action: 'Create review task', steps: ['Owner: Nora Reed', 'Payout: PO-0313', 'Linked source records retained'] },
  }[workflow.kind]
  const [reason, setReason] = useState('Donor request')
  function complete() { notify(`${copy.action} completed with mock audit event`); onClose() }
  return <div className="checkout-backdrop"><section className="workflow-sheet"><button className="close-checkout" aria-label="Close workflow" onClick={onClose}><X size={20} /></button><p className="eyebrow">Guided financial action</p><h2>{copy.title}</h2><p className="subtle">{copy.detail}</p><div className="workflow-steps">{copy.steps.map((step) => <div key={step}><Check size={15} />{step}</div>)}</div><label className="select-field">Reason or policy<select value={reason} onChange={(event) => setReason(event.target.value)}><option>Donor request</option><option>Duplicate payment</option><option>Service issue</option><option>Finance review</option></select></label><label className="check-line"><input type="checkbox" defaultChecked /><span>Record this action in the CRM audit timeline</span></label><button className="primary-action full" onClick={complete}>{copy.action} <ArrowRight size={17} /></button></section></div>
}

function Settings({ notify }: { notify: (message: string) => void }) {
  const settings = [['Providers and methods', 'Stripe test workspace connected. Cards, ACH, Apple Pay, and manual records are enabled.'], ['Receipts and acknowledgements', 'Template v3 is branded, immutable after issue, and tax language is current.'], ['Respectful retry schedule', '3 attempts over 10 days. Stops for expired methods and donor action requests.'], ['Accounting export', 'QuickBooks mapping is ready; payout PO-0313 waits for reviewer approval.'], ['Team permissions', 'Refund approval, refund issue, dispute response, and export permissions stay separate.'], ['Automation and consent', '12 automations are on; every event retains its source, version, and outcome.']]
  return <><div className="page-intro compact"><div><p className="eyebrow">Control center</p><h1>Settings with restraint.</h1><p className="subtle">Only the decisions that shape trust, compliance, and operations live here.</p></div></div><section className="settings-list panel">{settings.map(([setting, detail]) => <div className="setting-row" key={setting}><div><strong>{setting}</strong><p>{detail}</p></div><button className="outline-button" onClick={() => notify(`${setting} opened in a focused editor`)}>Manage</button></div>)}</section></>
}

function CollectionComposer({ mode, onClose, notify }: { mode: Exclude<CollectionMode, null>; onClose: () => void; notify: (message: string) => void }) {
  const content = {
    'donation-page': { title: 'Create a donation page', action: 'Save page draft', detail: 'Campaign, gift choices, donor details, and sharing stay together.', target: 'Springwater restoration' },
    invoice: { title: 'Send an invoice', action: 'Create invoice draft', detail: 'Recipient, amount, due date, and reminder policy become one auditable request.', target: 'Maya Thompson · Contact' },
    'payment-link': { title: 'Build a payment link', action: 'Copy secure link', detail: 'A reusable, attributed checkout for web, email, or an event.', target: 'General fund · Public link' },
    'manual-payment': { title: 'Record payment', action: 'Record external payment', detail: 'Cash, check, wire, and already-settled payments never impersonate processor charges.', target: 'Northwind Catering · Company' },
  }[mode]
  const [amount, setAmount] = useState(mode === 'invoice' ? '480.00' : '250.00')
  function complete() { notify(`${content.action}: ${content.target} is now linked to the CRM timeline`); onClose() }
  return <div className="checkout-backdrop"><section className="collection-composer"><button className="close-checkout" aria-label="Close collection composer" onClick={onClose}><X size={20} /></button><p className="eyebrow">CRM-linked collection</p><h2>{content.title}</h2><p className="subtle">{content.detail}</p><label className="select-field">CRM relationship<select defaultValue={content.target}><option>{content.target}</option><option>New Contact</option><option>New Company</option></select></label><label className="select-field">Amount<input aria-label="Collection amount" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ''))} /></label><label className="select-field">{mode === 'invoice' ? 'Reminder policy' : mode === 'manual-payment' ? 'Payment source' : 'Purpose'}<select defaultValue="Recommended"><option>Recommended</option><option>Where needed most</option><option>Review before sending</option></select></label><div className="composer-note"><ShieldCheck size={17} />Status, association, creator, and every later event will remain in the audit trail.</div><button className="primary-action full" onClick={complete}>{content.action} <ArrowRight size={17} /></button></section></div>
}

function Metric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) { return <div className={`metric ${tone}`}><p>{label}</p><strong>{value}</strong><span>{detail}</span></div> }

function Checkout(props: { amount: string; setAmount: (value: string) => void; frequency: Frequency; setFrequency: (value: Frequency) => void; paymentMethod: PaymentMethod; setPaymentMethod: (value: PaymentMethod) => void; feeCovered: boolean; setFeeCovered: (value: boolean) => void; anonymous: boolean; setAnonymous: (value: boolean) => void; completed: boolean; onClose: () => void; onComplete: () => void }) {
  const isAch = props.paymentMethod === 'ach'
  const total = !isAch && props.feeCovered && props.amount ? (Number(props.amount) * 1.029 + 0.3).toFixed(2) : props.amount
  const annualImpact = (Number(props.amount || 0) * 12).toFixed(0)
  if (props.completed) return <div className="checkout-backdrop"><section className="checkout complete-state"><button className="close-checkout" aria-label="Close checkout" onClick={props.onClose}><X size={20} /></button><div className="success-seal">{isAch ? <Landmark size={30} /> : <Check size={34} />}</div><p className="eyebrow">{isAch ? 'Bank debit processing' : 'Gift confirmed'}</p><h2>{isAch ? 'Your support is being set in motion.' : 'Thank you for keeping the water moving.'}</h2><p>{isAch ? `Your ${props.frequency.toLowerCase()} bank debit is expected to settle in 3-5 business days. We will email a receipt when the payment clears.` : `Your ${props.frequency.toLowerCase()} support is on its way to Springwater restoration. A receipt is heading to your inbox.`}</p><div className="settlement-note"><ShieldCheck size={16} />{isAch ? 'No funds have been confirmed yet. You can review this payment in your CRM timeline.' : 'Receipt RC-2026-1051 is linked to this gift and your CRM timeline.'}</div><button className="primary-action full" onClick={props.onClose}>Return to Payments</button></section></div>
  return <div className="checkout-backdrop"><section className="checkout"><button className="close-checkout" aria-label="Close checkout" onClick={props.onClose}><X size={20} /></button><div className="checkout-story"><span className="story-mark"><Heart size={20} /></span><p className="eyebrow">Northwind Foundation</p><h2>Restore a living river.</h2><p>Small, steady gifts fund clean water at the source.</p><div className="impact-note"><strong>92%</strong><span>of every gift goes directly to restoration work.</span></div></div><div className="checkout-form"><div className="checkout-header"><p className="eyebrow">Your gift</p><h2>Choose what feels right.</h2></div><div className="frequency-toggle">{(['One time', 'Monthly', 'Quarterly', 'Annually'] as Frequency[]).map((item) => <button className={props.frequency === item ? 'selected' : ''} onClick={() => props.setFrequency(item)} key={item}>{item}</button>)}</div><div className="amount-options">{['30', '45', '100', '250'].map((value) => <button className={props.amount === value ? 'selected' : ''} onClick={() => props.setAmount(value)} key={value}>${value}</button>)}<label className="custom-amount">$<input value={props.amount} aria-label="Gift amount" onChange={(event) => props.setAmount(event.target.value.replace(/[^0-9.]/g, ''))} /></label></div><label className="select-field">Direct this gift<select defaultValue="Springwater restoration"><option>Springwater restoration</option><option>Community garden fund</option><option>Where needed most</option></select></label><div className="payment-method-choice" role="group" aria-label="Payment method"><button className={props.paymentMethod === 'card' ? 'selected' : ''} onClick={() => props.setPaymentMethod('card')}><CreditCard size={18} /><span><strong>Card</strong><small>Ending in 4242</small></span></button><button className={isAch ? 'selected' : ''} onClick={() => props.setPaymentMethod('ach')}><Landmark size={18} /><span><strong>Bank debit</strong><small>Settles in 3-5 days</small></span></button></div>{isAch ? <div className="method-detail"><Landmark size={17} /><span>Bank account ending in 1088. A receipt is sent only after settlement.</span></div> : <div className="method-detail"><CreditCard size={17} /><span>Card ending in 4242. Securely saved for this gift.</span></div>}{props.frequency !== 'One time' && <div className="recurring-consent"><Check size={15} /><span>Renews {props.frequency.toLowerCase()} until you change or cancel. Estimated annual impact: <strong>${annualImpact}</strong>.</span></div>}{!isAch && <label className="check-line"><input type="checkbox" checked={props.feeCovered} onChange={(event) => props.setFeeCovered(event.target.checked)} /><span>Cover the processing fee</span><strong>{props.feeCovered ? `$${(Number(props.amount || 0) * 0.029 + 0.3).toFixed(2)}` : ''}</strong></label>}<label className="check-line"><input type="checkbox" checked={props.anonymous} onChange={(event) => props.setAnonymous(event.target.checked)} /><span>Keep my name private</span></label><div className="checkout-total"><span>{isAch ? 'Amount submitted' : 'Today\'s total'}</span><strong>${total || '0.00'}</strong></div><button className="primary-action full" onClick={props.onComplete}>{isAch ? `Start bank debit for $${total || '0.00'}` : `Give $${total || '0.00'}`} <ArrowRight size={17} /></button><p className="secure-note"><ShieldCheck size={15} /> Secure payment. Easy changes or cancellation anytime.</p></div></section></div>
}

export default App