import { useEffect, useState } from 'react'
import {
  ArrowRight, BarChart3, Bell, BookOpen, CalendarClock, Check, CheckCircle2,
  ChevronDown, CircleAlert, ClipboardCheck, Code2, Compass, Copy, FileText,
  Filter, Gauge, Globe2, LayoutDashboard, Layers3, Link2, ListChecks, LockKeyhole,
  Mail, MoreHorizontal, Plus, Radar, RefreshCw, Search, Send, Settings2,
  ShieldCheck, SlidersHorizontal, Sparkles, UserCheck, UsersRound, X,
} from 'lucide-react'
import { Analytics } from '@vercel/analytics/react'
import './App.css'

type View = 'overview' | 'forms' | 'builder' | 'submissions' | 'analytics' | 'automations' | 'library' | 'settings'
type BuilderStep = 'Purpose' | 'Ask' | 'After submit' | 'Trust' | 'Review'
type SubmissionState = 'Validating' | 'Needs review' | 'Match review' | 'Ready for owner' | 'Automating' | 'Needs attention' | 'Completed'
type FormStatus = 'Live' | 'Draft' | 'Review' | 'Scheduled' | 'Paused' | 'Retired' | 'Archived'

type FormRecord = {
  id: string
  name: string
  purpose: string
  status: FormStatus
  submissions: number
  conversion: string
  owner: string
  updated: string
}

type Submission = {
  id: string
  name: string
  initials: string
  company: string
  form: string
  submitted: string
  intent: string
  state: SubmissionState
  owner: string
  score: number
  detail: string
  source: string
  consent: string
  version: string
  confidence: string
  routingReason: string
  automation: string
  idempotencyKey: string
  exception?: { title: string; detail: string; action: string }
}

const formNavigation: { label: string; view: View; icon: typeof LayoutDashboard }[] = [
  { label: 'Overview', view: 'overview', icon: LayoutDashboard },
  { label: 'Forms', view: 'forms', icon: FileText },
  { label: 'Submissions', view: 'submissions', icon: ListChecks },
  { label: 'Automations', view: 'automations', icon: Sparkles },
  { label: 'Analytics', view: 'analytics', icon: BarChart3 },
  { label: 'Library', view: 'library', icon: BookOpen },
  { label: 'Settings', view: 'settings', icon: Settings2 },
]

const initialForms: FormRecord[] = [
  { id: 'demo', name: 'Request a demo', purpose: 'Sales qualification', status: 'Live', submissions: 184, conversion: '18.6%', owner: 'Avery Ross', updated: '5 min ago' },
  { id: 'support', name: 'Support request', purpose: 'Customer service', status: 'Live', submissions: 97, conversion: '72.1%', owner: 'Service operations', updated: 'Yesterday' },
  { id: 'event', name: 'Fieldwork summit RSVP', purpose: 'Event registration', status: 'Review', submissions: 0, conversion: '—', owner: 'Maya Das', updated: 'Today' },
  { id: 'guide', name: 'Operations guide', purpose: 'Content access', status: 'Draft', submissions: 0, conversion: '—', owner: 'Avery Ross', updated: 'Tuesday' },
]

const initialSubmissions: Submission[] = [
  { id: 'priya', name: 'Priya Shah', initials: 'PS', company: 'Northline Health', form: 'Request a demo', submitted: '7 min ago', intent: 'Implementation in 90 days', state: 'Ready for owner', owner: 'Unassigned', score: 91, detail: 'Asked for a security review and selected a 200–500 person team.', source: 'Q3 operations campaign', consent: 'Marketing + product updates', version: 'v7.0', confidence: 'Exact verified email · 100%', routingReason: 'North America Enterprise is covered by Maya Das.', automation: 'Acknowledgement queued · task waiting for owner', idempotencyKey: 'frm_7f4a9' },
  { id: 'jordan', name: 'Jordan Lee', initials: 'JL', company: 'Atlas Works', form: 'Request a demo', submitted: '22 min ago', intent: 'Exploring options', state: 'Match review', owner: 'Avery Ross', score: 72, detail: 'Email is shared by two CRM contacts; confirm identity before updating the relationship.', source: 'Direct / pricing page', consent: 'Product updates only', version: 'v7.0', confidence: 'Two credible contacts · 72%', routingReason: 'Held until an identity decision is recorded.', automation: 'Paused before CRM update', idempotencyKey: 'frm_7f49c' },
  { id: 'sofia', name: 'Sofia Bennett', initials: 'SB', company: 'Aster & Vale', form: 'Support request', submitted: '41 min ago', intent: 'Billing access', state: 'Needs attention', owner: 'Service queue', score: 64, detail: 'Known customer. Ticket creation is protected until the service connection recovers.', source: 'Customer portal', consent: 'Service communication', version: 'v4.3', confidence: 'Authenticated customer · 100%', routingReason: 'Billing entitlement routes to the Service queue.', automation: 'Ticket delivery failed after 3 safe retries', idempotencyKey: 'frm_7f447', exception: { title: 'Ticket delivery needs recovery', detail: 'The original event and mapping are intact. Replay will preserve its receipt time and idempotency key.', action: 'Replay delivery' } },
  { id: 'dani', name: 'Dani Okafor', initials: 'DO', company: 'Harbor & Finch', form: 'Request a demo', submitted: 'Yesterday', intent: 'Evaluation complete', state: 'Completed', owner: 'Maya Das', score: 86, detail: 'Discovery meeting booked and campaign membership recorded.', source: 'Partner referral', consent: 'Marketing + product updates', version: 'v6.4', confidence: 'Exact verified email · 100%', routingReason: 'Partner territory maps to Maya Das.', automation: 'Acknowledgement, meeting, and campaign update complete', idempotencyKey: 'frm_7eaa1' },
]

const builderSteps: BuilderStep[] = ['Purpose', 'Ask', 'After submit', 'Trust', 'Review']

function App() {
  const [view, setView] = useState<View>('overview')
  const [mobileFormsMenuOpen, setMobileFormsMenuOpen] = useState(false)
  const [forms, setForms] = useState<FormRecord[]>(() => JSON.parse(localStorage.getItem('solace-forms') ?? 'null') ?? initialForms)
  const [submissions, setSubmissions] = useState<Submission[]>(() => JSON.parse(localStorage.getItem('solace-form-submissions') ?? 'null') ?? initialSubmissions)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('priya')
  const [builderStep, setBuilderStep] = useState<BuilderStep>('Purpose')
  const [formName, setFormName] = useState('Request a demo')
  const [formPurpose, setFormPurpose] = useState('Sales qualification')
  const [destination, setDestination] = useState('Contact + qualified lead')
  const [channel, setChannel] = useState('Embedded web form')
  const [includeTeamSize, setIncludeTeamSize] = useState(true)
  const [includeTimeline, setIncludeTimeline] = useState(true)
  const [progressiveProfile, setProgressiveProfile] = useState(true)
  const [meetingOffer, setMeetingOffer] = useState(true)
  const [consent, setConsent] = useState(true)
  const [routePolicy, setRoutePolicy] = useState('Territory + capacity')
  const [previewMode, setPreviewMode] = useState<'New visitor' | 'Known contact' | 'Mobile'>('Known contact')
  const [toast, setToast] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [filter, setFilter] = useState<'All' | SubmissionState>('All')
  const [query, setQuery] = useState('')

  const selectedSubmission = submissions.find((submission) => submission.id === selectedSubmissionId) ?? submissions[0]
  const activeForms = forms.filter((form) => form.status === 'Live').length
  const attentionCount = submissions.filter((submission) => submission.state === 'Match review' || submission.state === 'Ready for owner' || submission.state === 'Needs attention').length
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesFilter = filter === 'All' || submission.state === filter
    const matchesQuery = `${submission.name} ${submission.company} ${submission.form}`.toLowerCase().includes(query.toLowerCase())
    return matchesFilter && matchesQuery
  })

  useEffect(() => { localStorage.setItem('solace-forms', JSON.stringify(forms)) }, [forms])
  useEffect(() => { localStorage.setItem('solace-form-submissions', JSON.stringify(submissions)) }, [submissions])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const navigate = (next: View) => {
    setView(next)
    setMobileFormsMenuOpen(false)
    if (next === 'builder') setBuilderStep('Purpose')
  }

  const publishForm = () => {
    setForms((current) => current.map((form) => form.id === 'demo'
      ? { ...form, name: formName, purpose: formPurpose, status: 'Live', updated: 'Just now' }
      : form,
    ))
    setBuilderStep('Review')
    setToast('Version 7 is live. Routing, consent, and owner handoff are active.')
    setView('forms')
  }

  const createForm = () => {
    const record: FormRecord = {
      id: crypto.randomUUID(), name: 'Untitled intake', purpose: 'Choose a CRM outcome', status: 'Draft', submissions: 0, conversion: '—', owner: 'Avery Ross', updated: 'Just now',
    }
    setForms((current) => [record, ...current])
    setFormName(record.name)
    setFormPurpose(record.purpose)
    setShowNewForm(false)
    navigate('builder')
    setToast('New draft created. Start with the relationship outcome, then ask only what earns the next action.')
  }

  const assignPriya = () => {
    setSubmissions((current) => current.map((submission) => submission.id === 'priya'
      ? { ...submission, owner: 'Maya Das', state: 'Automating' }
      : submission,
    ))
    setToast('Priya is assigned to Maya Das. A 30-minute follow-up commitment and meeting handoff are now active.')
  }

  const resolveMatch = () => {
    setSubmissions((current) => current.map((submission) => submission.id === 'jordan'
      ? { ...submission, state: 'Ready for owner', owner: 'Avery Ross' }
      : submission,
    ))
    setToast('Identity confirmed. Jordan’s new details are safely ready for the relationship timeline.')
  }

  const replayDelivery = () => {
    setSubmissions((current) => current.map((submission) => submission.id === 'sofia'
      ? { ...submission, state: 'Completed', automation: 'Ticket created after replay · acknowledgement delivered', exception: undefined }
      : submission,
    ))
    setToast('The original support event was replayed safely. The ticket and acknowledgement are now complete.')
  }

  return (
    <div className="app-shell">
      <aside className="global-rail" aria-label="CRM navigation">
        <div className="brand"><span>S</span><strong>Solace</strong></div>
        <nav className="crm-nav" aria-label="CRM navigation">
          <button className="crm-nav-item" onClick={() => setToast('Home is outside this Forms prototype.')}><LayoutDashboard size={17} /><span>Home</span></button>
          <button className="crm-nav-item" onClick={() => setToast('Contacts is outside this Forms prototype.')}><UsersRound size={17} /><span>Contacts</span></button>
          <button className="crm-nav-item" onClick={() => setToast('Calls is outside this Forms prototype.')}><Compass size={17} /><span>Calls</span></button>
          <button className="crm-nav-item" onClick={() => setToast('Payments is outside this Forms prototype.')}><Gauge size={17} /><span>Payments</span></button>
          <div className={`forms-module ${mobileFormsMenuOpen ? 'mobile-forms-menu-open' : ''}`}>
            <button className="crm-nav-item active-module" onClick={() => { setView('overview'); setMobileFormsMenuOpen((open) => !open) }} aria-controls="forms-subnav"><ClipboardCheck size={17} /><span>Forms</span></button>
            <nav className="forms-subnav" id="forms-subnav" aria-label="Forms navigation">
              {formNavigation.map(({ label, view: target }) => <button className={view === target ? 'forms-subnav-item active-forms-subnav-item' : 'forms-subnav-item'} key={label} onClick={() => navigate(target)}>{label}{target === 'submissions' && attentionCount > 0 ? <b>{attentionCount}</b> : null}</button>)}
            </nav>
          </div>
          <button className="crm-nav-item" onClick={() => setToast('Reports is outside this Forms prototype.')}><BarChart3 size={17} /><span>Reports</span></button>
        </nav>
        <div className="rail-foot"><button className={view === 'settings' ? 'crm-nav-item active-forms-subnav-item' : 'crm-nav-item'} onClick={() => navigate('settings')}><Settings2 size={17} /><span>Administration</span></button><button className="avatar-button" aria-label="Open user profile">AR</button></div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="crumbs"><span>CRM</span><span>/</span><strong>Forms</strong>{view !== 'overview' ? <><span>/</span><strong>{view === 'builder' ? formName : view}</strong></> : null}</div>
          <div className="topbar-actions"><span className="live-status"><i />All systems healthy</span><a className="experience-guide-link" href={`${import.meta.env.BASE_URL}guide/`} title="Open the Forms experience guide"><BookOpen size={16} /><span>Experience guide</span></a><button className="icon-button" aria-label="Search"><Search size={17} /></button><button className="icon-button notification" aria-label="Notifications"><Bell size={17} /><b /></button></div>
        </header>

        {view === 'overview' && <Overview activeForms={activeForms} attentionCount={attentionCount} onReview={() => navigate('submissions')} onBuild={() => navigate('builder')} onOpenAnalytics={() => navigate('analytics')} />}
        {view === 'forms' && <><FormsLibrary forms={forms} onCreate={() => setShowNewForm(true)} onEdit={(form) => { setFormName(form.name); setFormPurpose(form.purpose); navigate('builder') }} /><FormLifecycle forms={forms} onChangeStatus={(id, status) => { setForms((current) => current.map((form) => form.id === id ? { ...form, status, updated: 'Just now' } : form)); setToast(`Form lifecycle updated to ${status}.`) }} /></>}
        {view === 'builder' && <><Builder
          step={builderStep} setStep={setBuilderStep} formName={formName} setFormName={setFormName}
          formPurpose={formPurpose} setFormPurpose={setFormPurpose} destination={destination} setDestination={setDestination}
          channel={channel} setChannel={setChannel} includeTeamSize={includeTeamSize} setIncludeTeamSize={setIncludeTeamSize}
          includeTimeline={includeTimeline} setIncludeTimeline={setIncludeTimeline} progressiveProfile={progressiveProfile} setProgressiveProfile={setProgressiveProfile}
          meetingOffer={meetingOffer} setMeetingOffer={setMeetingOffer} consent={consent} setConsent={setConsent}
          routePolicy={routePolicy} setRoutePolicy={setRoutePolicy} previewMode={previewMode} setPreviewMode={setPreviewMode} onPublish={publishForm}
        /><BuilderCapabilityStudio channel={channel} setChannel={setChannel} /></>}
        {view === 'submissions' && <><SubmissionsView submissions={filteredSubmissions} selected={selectedSubmission} filter={filter} setFilter={setFilter} query={query} setQuery={setQuery} onSelect={setSelectedSubmissionId} onAssign={assignPriya} onResolve={resolveMatch} onReplay={replayDelivery} /><SubmissionEvidence selected={selectedSubmission} /></>}
        {view === 'analytics' && <><AnalyticsView onOpenForm={() => navigate('builder')} /><OperationalLens /></>}
        {view === 'automations' && <AutomationsView routePolicy={routePolicy} setRoutePolicy={setRoutePolicy} />}
        {view === 'library' && <LibraryView onUseTemplate={() => setShowNewForm(true)} />}
        {view === 'settings' && <><SettingsView /><GovernanceLedger /></>}
      </main>

      {showNewForm && <div className="modal-backdrop"><section className="new-form-modal" role="dialog" aria-modal="true" aria-label="Create form"><button className="close-button" onClick={() => setShowNewForm(false)} aria-label="Close"><X size={18} /></button><span className="eyebrow">NEW CRM INTAKE</span><h2>Start with the relationship outcome.</h2><p>Solace will guide the fields, consent, routing, and follow-through from that decision.</p><div className="template-options"><button onClick={createForm}><span><UserCheck size={18} /></span><strong>Request a demo</strong><small>Qualify and route a sales conversation.</small></button><button onClick={createForm}><span><CircleAlert size={18} /></span><strong>Support request</strong><small>Give a customer one accountable service path.</small></button><button onClick={createForm}><span><CalendarClock size={18} /></span><strong>Event registration</strong><small>Capture attendance with context and consent.</small></button></div><button className="quiet-button" onClick={createForm}>Start blank instead <ArrowRight size={14} /></button></section></div>}
      {toast ? <div className="toast"><CheckCircle2 size={17} />{toast}</div> : null}
      <Analytics />
    </div>
  )
}

function Overview({ activeForms, attentionCount, onReview, onBuild, onOpenAnalytics }: { activeForms: number; attentionCount: number; onReview: () => void; onBuild: () => void; onOpenAnalytics: () => void }) {
  return <section className="overview-view">
    <div className="page-heading"><div><p className="eyebrow">FORMS · RELATIONSHIP INTAKE</p><h1>Every response should earn a thoughtful next move.</h1><p className="subtle">A calm front door for visitors. A clear, accountable CRM moment for your team.</p></div><button className="primary-button" onClick={onBuild}><Plus size={17} />Create form</button></div>
    <section className="attention-strip"><div><span className="signal-mark"><Radar size={17} /></span><div><p className="eyebrow">WORK NEXT</p><strong>Priya Shah is ready for a human owner.</strong><p>High-fit demo request from Northline Health. Implementation target: 90 days.</p></div></div><button className="outline-button" onClick={onReview}>Review submission <ArrowRight size={15} /></button></section>
    <div className="metric-grid"><Metric label="Actionable responses" value={String(attentionCount)} note="Two need a decision now" tone="gold" /><Metric label="Live forms" value={String(activeForms)} note="All destinations are healthy" tone="green" /><Metric label="Qualified conversion" value="18.6%" note="Up 2.4 points this month" tone="blue" /></div>
    <div className="overview-grid"><article className="panel performance-panel"><div className="panel-heading"><div><p className="eyebrow">ONE WATCH ITEM</p><h2>Company size is causing friction on mobile.</h2></div><button className="icon-button" aria-label="More insight options"><MoreHorizontal size={18} /></button></div><p className="panel-copy">18% of mobile starters pause at a required field before sharing their intent. Solace recommends making it progressive for known contacts.</p><div className="friction-row"><div><span>Mobile field exit</span><strong>18%</strong></div><div><span>Baseline</span><strong>9%</strong></div><button className="text-button" onClick={onOpenAnalytics}>See evidence <ArrowRight size={14} /></button></div></article>
      <article className="panel relationship-panel"><div className="panel-heading"><div><p className="eyebrow">RECENTLY COMPLETED</p><h2>A clean handoff, not just a conversion.</h2></div><CheckCircle2 className="success-icon" size={21} /></div><div className="handoff-person"><span>DO</span><div><strong>Dani Okafor · Harbor & Finch</strong><p>Demo request → Maya Das → discovery meeting</p></div></div><div className="timeline-mini"><span>Submitted</span><i /><span>Matched</span><i /><span>Meeting booked</span></div></article></div>
  </section>
}

function Metric({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) { return <article className={`metric ${tone}`}><span>{label}</span><strong>{value}</strong><p><Check size={13} />{note}</p></article> }

function FormsLibrary({ forms, onCreate, onEdit }: { forms: FormRecord[]; onCreate: () => void; onEdit: (form: FormRecord) => void }) {
  return <section><div className="page-heading compact"><div><p className="eyebrow">FORM LIBRARY</p><h1>Intent, not clutter.</h1><p className="subtle">Each form exists to advance one relationship decision.</p></div><button className="primary-button" onClick={onCreate}><Plus size={17} />Create form</button></div><div className="library-toolbar"><div className="search-field"><Search size={16} /><input placeholder="Search forms" /></div><button className="outline-button"><Filter size={15} />Live and draft</button></div><section className="form-table panel"><div className="form-table-head"><span>Form</span><span>Purpose</span><span>Performance</span><span>Owner</span><span /></div>{forms.map((form) => <button className="form-row" key={form.id} onClick={() => onEdit(form)}><span className="form-icon"><FileText size={17} /></span><span><strong>{form.name}</strong><small>Updated {form.updated}</small></span><span className="purpose-cell">{form.purpose}</span><span><b className={`status ${form.status.toLowerCase()}`}>{form.status}</b><small>{form.submissions ? `${form.submissions} responses · ${form.conversion}` : 'Not collecting yet'}</small></span><span className="owner-cell"><i>{form.owner.split(' ').map((part) => part[0]).join('').slice(0, 2)}</i>{form.owner}</span><ArrowRight className="row-arrow" size={16} /></button>)}</section></section>
}

function FormLifecycle({ forms, onChangeStatus }: { forms: FormRecord[]; onChangeStatus: (id: string, status: FormStatus) => void }) {
  const [selectedId, setSelectedId] = useState('demo')
  const selected = forms.find((form) => form.id === selectedId) ?? forms[0]
  const allowedStates: FormStatus[] = selected.status === 'Live' ? ['Paused', 'Retired'] : selected.status === 'Paused' ? ['Live', 'Retired'] : ['Review', 'Scheduled', 'Live']
  return <section className="lifecycle-section"><div className="section-kicker"><div><p className="eyebrow">VERSION CONTROL</p><h2>Publish deliberately. Preserve every response.</h2></div><span><Layers3 size={16} />Immutable evidence</span></div><div className="lifecycle-grid"><article className="panel lifecycle-panel"><div className="lifecycle-picker">{forms.slice(0, 4).map((form) => <button key={form.id} className={form.id === selected.id ? 'selected-lifecycle-form' : ''} onClick={() => setSelectedId(form.id)}><span><FileText size={15} /></span><div><strong>{form.name}</strong><small>{form.status} · updated {form.updated}</small></div><ChevronDown size={14} /></button>)}</div><div className="version-diff"><p className="eyebrow">CURRENT VERSION · {selected.name}</p><strong>v7.0 is serving new responses.</strong><p>Compared with v6.4: Company size becomes progressive for known contacts; routing and consent policy remain unchanged.</p><div><span><CheckCircle2 size={15} />Customer-visible change reviewed</span><span><CheckCircle2 size={15} />184 prior responses remain on v6.4</span></div></div></article><article className="panel lifecycle-action"><p className="eyebrow">LIFECYCLE ACTION</p><h2>{selected.status}</h2><p>{selected.status === 'Live' ? 'Collection is active and every response is pinned to v7.0.' : 'This form is not accepting new public responses.'}</p><div>{allowedStates.map((status) => <button className={status === 'Live' ? 'primary-button' : 'outline-button'} key={status} onClick={() => onChangeStatus(selected.id, status)}>{status === 'Live' ? 'Resume collection' : `${status} form`} <ArrowRight size={14} /></button>)}</div></article></div></section>
}

function Builder(props: {
  step: BuilderStep; setStep: (step: BuilderStep) => void; formName: string; setFormName: (value: string) => void; formPurpose: string; setFormPurpose: (value: string) => void; destination: string; setDestination: (value: string) => void; channel: string; setChannel: (value: string) => void; includeTeamSize: boolean; setIncludeTeamSize: (value: boolean) => void; includeTimeline: boolean; setIncludeTimeline: (value: boolean) => void; progressiveProfile: boolean; setProgressiveProfile: (value: boolean) => void; meetingOffer: boolean; setMeetingOffer: (value: boolean) => void; consent: boolean; setConsent: (value: boolean) => void; routePolicy: string; setRoutePolicy: (value: string) => void; previewMode: 'New visitor' | 'Known contact' | 'Mobile'; setPreviewMode: (value: 'New visitor' | 'Known contact' | 'Mobile') => void; onPublish: () => void
}) {
  const stepIndex = builderSteps.indexOf(props.step)
  const nextStep = () => props.setStep(builderSteps[Math.min(stepIndex + 1, builderSteps.length - 1)])
  return <section className="builder-view"><div className="builder-top"><div><button className="back-button" onClick={() => props.setStep('Purpose')}>Forms <span>/</span> {props.formName}</button><h1>{props.formName}</h1><span className="draft-state"><i />Draft · autosaved</span></div><div className="builder-actions"><button className="outline-button"><Copy size={15} />Share preview</button><button className="primary-button" onClick={props.onPublish}><Send size={16} />Publish</button></div></div>
    <div className="builder-stepper">{builderSteps.map((item, index) => <button key={item} className={`${props.step === item ? 'current-step' : ''} ${index < stepIndex ? 'complete-step' : ''}`} onClick={() => props.setStep(item)}><span>{index < stepIndex ? <Check size={13} /> : index + 1}</span>{item}</button>)}</div>
    <div className="builder-layout"><section className="builder-panel"><div className="builder-panel-head"><div><p className="eyebrow">{props.step.toUpperCase()}</p><h2>{builderHeading(props.step)}</h2></div><p>{builderHelp(props.step)}</p></div>
      {props.step === 'Purpose' && <div className="control-stack"><Field label="Form name"><input aria-label="Form name" value={props.formName} onChange={(event) => props.setFormName(event.target.value)} /></Field><Field label="Relationship outcome"><select aria-label="Relationship outcome" value={props.formPurpose} onChange={(event) => props.setFormPurpose(event.target.value)}><option>Sales qualification</option><option>Customer service</option><option>Event registration</option><option>Preference update</option></select></Field><Field label="Create or update"><select aria-label="Create or update" value={props.destination} onChange={(event) => props.setDestination(event.target.value)}><option>Contact + qualified lead</option><option>Contact + ticket</option><option>Contact + event registration</option></select></Field><div className="choice-grid"><Choice selected={props.channel === 'Embedded web form'} onClick={() => props.setChannel('Embedded web form')} icon={<Code2 size={18} />} title="Embedded" copy="On a high-intent page" /><Choice selected={props.channel === 'Standalone page'} onClick={() => props.setChannel('Standalone page')} icon={<Link2 size={18} />} title="Standalone" copy="Campaign or partner link" /></div></div>}
      {props.step === 'Ask' && <div className="question-workspace"><div className="question-card identity"><span>01</span><div><strong>Work email</strong><small>Contact identity · required</small></div><LockKeyhole size={16} /></div><div className="question-card"><span>02</span><div><strong>Company</strong><small>Company association · required</small></div><Globe2 size={16} /></div><Toggle label="Team size" copy="Helpful for routing and product context." enabled={props.includeTeamSize} onChange={props.setIncludeTeamSize} /><Toggle label="Buying timeline" copy="Shows only when the visitor is considering a purchase." enabled={props.includeTimeline} onChange={props.setIncludeTimeline} /><Toggle label="Progressive profiling" copy="Known contacts see one useful unknown question instead of repeated fields." enabled={props.progressiveProfile} onChange={props.setProgressiveProfile} /><button className="add-field"><Plus size={16} />Add approved CRM field</button></div>}
      {props.step === 'After submit' && <div className="control-stack"><div className="outcome-card"><span><UserCheck size={18} /></span><div><strong>Contact and Company update</strong><p>Match on verified email. Fill only missing profile values.</p></div><b>Safe</b></div><Field label="Owner handoff"><select aria-label="Owner handoff" value={props.routePolicy} onChange={(event) => props.setRoutePolicy(event.target.value)}><option>Territory + capacity</option><option>Existing relationship owner</option><option>Sales review queue</option></select></Field><Toggle label="Offer a meeting after acknowledgement" copy="Shows eligible team availability after the CRM event is safely received." enabled={props.meetingOffer} onChange={props.setMeetingOffer} /><div className="automation-summary"><Sparkles size={18} /><p><strong>After submit:</strong> send acknowledgement, create accountable task, associate Q3 campaign, and add to evaluation nurture if no meeting is booked.</p></div></div>}
      {props.step === 'Trust' && <div className="control-stack"><Toggle label="Purpose-specific consent" copy="Records the exact statement, locale, choice, and time shown to the visitor." enabled={props.consent} onChange={props.setConsent} /><div className="trust-check"><ShieldCheck size={19} /><div><strong>Public collection safeguards</strong><p>Rate limiting, bot protection, accessible errors, and first-party prefill reset are ready.</p></div><CheckCircle2 size={18} /></div><Field label="Data retention"><select aria-label="Data retention"><option>180 days for raw submission payload</option><option>90 days for raw submission payload</option></select></Field></div>}
      {props.step === 'Review' && <div className="review-list"><ReviewItem ok text="Identity path maps verified email to Contact and Company." /><ReviewItem ok text="Every required CRM field has a safe fallback." /><ReviewItem ok text="Owner handoff creates a 30-minute commitment." /><ReviewItem ok={props.consent} text="Consent evidence is present for marketing follow-up." /><ReviewItem ok text="Mobile, keyboard, and known-contact previews pass." /><div className="version-note"><Layers3 size={18} /><p><strong>Version 7 will be created.</strong> The currently live version stays reproducible for every existing response.</p></div></div>}
      <div className="builder-footer"><button className="quiet-button" disabled={stepIndex === 0} onClick={() => props.setStep(builderSteps[stepIndex - 1])}>Back</button><button className="primary-button" onClick={props.step === 'Review' ? props.onPublish : nextStep}>{props.step === 'Review' ? 'Publish version 7' : 'Continue'} <ArrowRight size={15} /></button></div>
    </section><RespondentPreview mode={props.previewMode} setMode={props.setPreviewMode} includeTeamSize={props.includeTeamSize} includeTimeline={props.includeTimeline} consent={props.consent} meetingOffer={props.meetingOffer} /></div>
  </section>
}

function BuilderCapabilityStudio({ channel, setChannel }: { channel: string; setChannel: (value: string) => void }) {
  const [selectedBlock, setSelectedBlock] = useState('Conditional question')
  const channels = [
    ['Embedded web form', 'High-intent page'], ['Standalone page', 'Campaign or partner link'], ['Popup / slide-in', 'Contextual capture'], ['Conversational', 'Focused mobile flow'], ['Kiosk / shared device', 'Explicit reset after each visitor'], ['Internal intake', 'Authenticated teammates'], ['External handler / API', 'Signed delivery with replay'],
  ]
  const blocks = [
    ['Conditional question', 'Show Budget when the buying timeline is within 90 days.'], ['Scheduler', 'Offer approved availability only after safe CRM receipt.'], ['File upload', 'PDF or PNG · malware scan · 180-day retention.'], ['Payment handoff', 'Tokenized provider component; no raw card data enters CRM.'], ['Calculation', 'Explain inputs and use the result only for approved routing.'], ['Hidden context', 'Signed campaign, partner, locale, and product values.'],
  ]
  const activeBlock = blocks.find(([name]) => name === selectedBlock) ?? blocks[0]
  return <section className="capability-studio"><div className="section-kicker"><div><p className="eyebrow">COLLECTION DESIGN</p><h2>Choose a channel. Add only earned capability.</h2></div><span><ShieldCheck size={16} />Governed by default</span></div><div className="capability-grid"><article className="panel channel-panel"><p className="eyebrow">DELIVERY CHANNEL</p><div className="channel-options">{channels.map(([name, detail]) => <button key={name} className={channel === name ? 'selected-channel' : ''} onClick={() => setChannel(name)}><span>{name}</span><small>{detail}</small>{channel === name ? <CheckCircle2 size={15} /> : null}</button>)}</div></article><article className="panel block-panel"><p className="eyebrow">APPROVED BLOCKS</p><div className="block-options">{blocks.map(([name]) => <button key={name} className={selectedBlock === name ? 'selected-block' : ''} onClick={() => setSelectedBlock(name)}>{name}</button>)}</div><div className="block-inspector"><span><Layers3 size={17} /></span><div><strong>{activeBlock[0]}</strong><p>{activeBlock[1]}</p></div><b>Approved</b></div></article></div></section>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label> }
function Choice({ selected, onClick, icon, title, copy }: { selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; copy: string }) { return <button className={`choice-card ${selected ? 'choice-selected' : ''}`} onClick={onClick}><span>{icon}</span><strong>{title}</strong><small>{copy}</small>{selected ? <CheckCircle2 size={16} /> : null}</button> }
function Toggle({ label, copy, enabled, onChange }: { label: string; copy: string; enabled: boolean; onChange: (value: boolean) => void }) { return <button className="toggle-row" onClick={() => onChange(!enabled)}><span><strong>{label}</strong><small>{copy}</small></span><i className={enabled ? 'toggle-on' : ''}><b /></i></button> }
function ReviewItem({ ok, text }: { ok: boolean; text: string }) { return <div className="review-item">{ok ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}<span>{text}</span>{ok ? <b>Ready</b> : <b className="review-alert">Needs attention</b>}</div> }
function builderHeading(step: BuilderStep) { return ({ Purpose: 'What relationship should this create?', Ask: 'Ask only for the next useful signal.', 'After submit': 'Make the next move accountable.', Trust: 'Make the exchange feel deserved.', Review: 'One last clear look before it goes live.' } as Record<BuilderStep, string>)[step] }
function builderHelp(step: BuilderStep) { return ({ Purpose: 'Choose the intent first. Solace uses it to recommend safe CRM behavior.', Ask: 'Your form learns what it needs without making a visitor repeat their story.', 'After submit': 'A submission is not complete until ownership and follow-through are clear.', Trust: 'Consent, safety, and accessibility are designed in, not added as footnotes.', Review: 'Publishing creates an immutable version and exposes every consequence.' } as Record<BuilderStep, string>)[step] }

function RespondentPreview({ mode, setMode, includeTeamSize, includeTimeline, consent, meetingOffer }: { mode: 'New visitor' | 'Known contact' | 'Mobile'; setMode: (value: 'New visitor' | 'Known contact' | 'Mobile') => void; includeTeamSize: boolean; includeTimeline: boolean; consent: boolean; meetingOffer: boolean }) {
  const known = mode === 'Known contact'
  return <aside className={`preview-panel ${mode === 'Mobile' ? 'mobile-preview' : ''}`}><div className="preview-head"><div><p className="eyebrow">RESPONDENT VIEW</p><strong>{mode}</strong></div><div className="preview-switch">{(['New visitor', 'Known contact', 'Mobile'] as const).map((item) => <button className={mode === item ? 'active-preview-mode' : ''} key={item} onClick={() => setMode(item)}>{item === 'New visitor' ? 'New' : item === 'Known contact' ? 'Known' : 'Mobile'}</button>)}</div></div><div className="form-preview"><span className="preview-brand"><i>S</i>Solace</span><p className="preview-eyebrow">SEE WHAT FITS</p><h2>Bring your operations into focus.</h2><p>Tell us where you are headed. We will make the next conversation useful.</p>{known ? <div className="known-contact"><CheckCircle2 size={15} />Recognized as Priya Shah <button>Not you?</button></div> : null}<PreviewInput label="Work email" value={known ? 'priya@northline.health' : 'you@company.com'} /><PreviewInput label="Company" value={known ? 'Northline Health' : 'Company name'} />{includeTeamSize && !known ? <PreviewInput label="Team size" value="Select one" /> : null}{includeTimeline ? <PreviewInput label="Buying timeline" value="Choose the best fit" /> : null}{consent ? <label className="preview-consent"><input type="checkbox" defaultChecked />Send me product updates. You can opt out anytime.</label> : null}<button className="preview-submit">Request a demo <ArrowRight size={15} /></button>{meetingOffer ? <small className="preview-note">After you submit, we will offer a relevant time with the right person.</small> : null}</div></aside>
}
function PreviewInput({ label, value }: { label: string; value: string }) { return <label className="preview-input"><span>{label}</span><b>{value}</b><ChevronDown size={14} /></label> }

function SubmissionsView({ submissions, selected, filter, setFilter, query, setQuery, onSelect, onAssign, onResolve, onReplay }: { submissions: Submission[]; selected: Submission; filter: 'All' | SubmissionState; setFilter: (value: 'All' | SubmissionState) => void; query: string; setQuery: (value: string) => void; onSelect: (id: string) => void; onAssign: () => void; onResolve: () => void; onReplay: () => void }) {
  const filters: ('All' | SubmissionState)[] = ['All', 'Match review', 'Ready for owner', 'Needs attention', 'Automating', 'Completed']
  const action = selected.id === 'priya' ? onAssign : selected.id === 'jordan' ? onResolve : selected.id === 'sofia' ? onReplay : undefined
  const actionLabel = selected.id === 'priya' ? 'Assign to Maya' : selected.id === 'jordan' ? 'Confirm identity' : selected.id === 'sofia' ? 'Replay delivery' : 'Open relationship'
  return <section className="submissions-view"><div className="page-heading compact"><div><p className="eyebrow">SUBMISSION INBOX</p><h1>Intent arrives with its context.</h1><p className="subtle">Work one CRM decision at a time. Evidence is present; noise is not.</p></div></div><div className="submission-tools"><div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, companies, or forms" /></div><div className="filter-list">{filters.map((item) => <button key={item} className={filter === item ? 'active-filter' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="submission-layout"><section className="submission-list panel">{submissions.map((submission) => <button className={`submission-row ${submission.id === selected.id ? 'selected-submission' : ''}`} key={submission.id} onClick={() => onSelect(submission.id)}><span className="person-avatar">{submission.initials}</span><span><strong>{submission.name}</strong><small>{submission.company} · {submission.submitted}</small><em>{submission.intent}</em></span><span className={`state-pill ${submission.state.toLowerCase().replaceAll(' ', '-')}`}>{submission.state}</span></button>)}{submissions.length === 0 ? <div className="empty-state"><Search size={20} /><strong>No submissions match this view.</strong><span>Try another filter or search term.</span></div> : null}</section><section className="submission-record panel"><div className="record-top"><div><p className="eyebrow">{selected.form} · {selected.submitted}</p><h2>{selected.name}</h2><p>{selected.company} · {selected.intent}</p></div><span className="score"><Gauge size={15} />{selected.score} fit</span></div><div className="record-context"><div><span>CRM identity</span><strong>{selected.id === 'jordan' ? 'Two possible contacts' : 'Verified email match'}</strong><small>{selected.id === 'jordan' ? 'Review required before update' : 'Safe to update profile'}</small></div><div><span>Source</span><strong>{selected.source}</strong><small>Campaign attribution retained</small></div><div><span>Consent</span><strong>{selected.consent}</strong><small>Statement v3.2 · en-US</small></div></div><div className="response-note"><p className="eyebrow">WHAT THEY SHARED</p><p>{selected.detail}</p></div><div className="next-action"><span><CalendarClock size={18} /></span><div><p className="eyebrow">NEXT CRM ACTION</p><strong>{selected.owner === 'Unassigned' ? 'Give Priya one accountable owner.' : selected.state === 'Needs review' ? 'Confirm the correct Jordan Lee relationship.' : 'The relationship workflow is underway.'}</strong><p>{selected.owner === 'Unassigned' ? 'Territory and capacity recommend Maya Das. The first response commitment is 30 minutes.' : `Current owner: ${selected.owner}.`}</p></div>{action ? <button className="primary-button" onClick={action}>{actionLabel} <ArrowRight size={15} /></button> : <button className="outline-button">Open contact <ArrowRight size={15} /></button>}</div><div className="record-timeline"><span><CheckCircle2 size={15} />Submission received</span><i /><span><CheckCircle2 size={15} />Identity checked</span><i /><span className={selected.owner === 'Unassigned' ? 'timeline-pending' : ''}>{selected.owner === 'Unassigned' ? <CircleAlert size={15} /> : <CheckCircle2 size={15} />}Owner handoff</span></div></section></div></section>
}

function AnalyticsView({ onOpenForm }: { onOpenForm: () => void }) { return <section className="analytics-view"><div className="page-heading compact"><div><p className="eyebrow">FORM INTELLIGENCE</p><h1>See the friction. Keep the meaning.</h1><p className="subtle">Metrics only matter when they change the next form or follow-through decision.</p></div><button className="outline-button" onClick={onOpenForm}><SlidersHorizontal size={16} />Improve Request a demo</button></div><div className="metric-grid"><Metric label="Started → submitted" value="44.8%" note="Above the 39% benchmark" tone="green" /><Metric label="Qualified response rate" value="18.6%" note="34 meetings influenced" tone="blue" /><Metric label="Owner coverage" value="96%" note="Two require a decision" tone="gold" /></div><div className="analytics-grid"><article className="panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">REQUEST A DEMO · LAST 30 DAYS</p><h2>Conversion stays healthy. Mobile friction does not.</h2></div><button className="outline-button">Mobile <ChevronDown size={14} /></button></div><div className="bar-chart">{[42, 50, 44, 61, 57, 72, 66, 80, 74, 88, 85, 94].map((height, index) => <i key={height + index} className={`chart-bar bar-${index} ${index > 8 ? 'strong-bar' : ''}`} />)}</div><div className="chart-axis"><span>May 01</span><span>May 10</span><span>May 20</span><span>May 30</span></div></article><article className="panel field-insight"><div className="panel-heading"><div><p className="eyebrow">FIELD FRICTION</p><h2>One high-confidence recommendation.</h2></div><Sparkles className="gold-icon" size={20} /></div><div className="field-drop"><span>Company size</span><strong>18%</strong><i><b /></i><small>Mobile exits after this required field</small></div><p className="panel-copy">Make Company size progressive for known contacts. It preserves qualification for new demand while removing repeated effort.</p><button className="text-button" onClick={onOpenForm}>Apply in builder <ArrowRight size={14} /></button></article></div><div className="attribution-strip panel"><span><Radar size={18} /></span><div><p className="eyebrow">OUTCOME, NOT VANITY</p><strong>Request a demo influenced $184k of qualified pipeline.</strong><p>Model: first form touch · 90-day lookback · 82% identity confidence</p></div><button className="outline-button">View attribution <ArrowRight size={15} /></button></div></section> }

function AutomationsView({ routePolicy, setRoutePolicy }: { routePolicy: string; setRoutePolicy: (value: string) => void }) { return <section><div className="page-heading compact"><div><p className="eyebrow">AUTOMATIONS</p><h1>Follow-through with a visible owner.</h1><p className="subtle">Automation handles policy. People still own the relationship.</p></div><button className="primary-button"><Plus size={17} />Add automation</button></div><div className="automation-layout"><article className="panel flow-panel"><div className="panel-heading"><div><p className="eyebrow">REQUEST A DEMO</p><h2>When a qualified response arrives</h2></div><span className="live-badge"><i />Live</span></div><div className="flow-steps"><FlowStep icon={<CheckCircle2 />} title="Validate and resolve identity" copy="Match verified email; create a review item only when evidence is ambiguous." /><FlowStep icon={<UserCheck />} title="Assign an accountable owner" copy={`${routePolicy}. Priya Shah currently recommends Maya Das.`} /><FlowStep icon={<Mail />} title="Acknowledge the request" copy="Transactional acknowledgement with the respondent’s stated intent and no marketing assumption." /><FlowStep icon={<CalendarClock />} title="Offer a relevant meeting" copy="Show Maya’s qualifying availability only after safe CRM receipt." /></div></article><article className="panel routing-panel"><div className="panel-heading"><div><p className="eyebrow">ROUTING POLICY</p><h2>One explainable path.</h2></div><ShieldCheck className="success-icon" size={21} /></div><Field label="Qualified demo requests"><select aria-label="Qualified demo requests" value={routePolicy} onChange={(event) => setRoutePolicy(event.target.value)}><option>Territory + capacity</option><option>Existing relationship owner</option><option>Sales review queue</option></select></Field><div className="routing-path"><span>North America</span><ArrowRight size={15} /><span>Enterprise team</span><ArrowRight size={15} /><strong>Maya Das</strong></div><p className="panel-copy">Every decision records the policy version, selected owner, SLA, and any human override.</p></article></div></section> }
function SubmissionEvidence({ selected }: { selected: Submission }) {
  const [showPayload, setShowPayload] = useState(false)
  const isException = selected.state === 'Needs attention'
  return <section className="submission-evidence"><div className="section-kicker"><div><p className="eyebrow">PROCESSING EVIDENCE</p><h2>One event. Every decision explainable.</h2></div><span><LockKeyhole size={15} />Immutable receipt</span></div><article className="panel evidence-panel"><div className="evidence-path"><EvidenceStep label="Received" copy={`${selected.version || 'Legacy version'} · ${selected.source}`} state="done" /><EvidenceStep label="Identity" copy={selected.confidence || 'Historical match evidence retained'} state={selected.state === 'Match review' || selected.state === 'Needs review' ? 'review' : 'done'} /><EvidenceStep label="CRM updates" copy="Fill blank only · relationship evidence retained" state={selected.state === 'Match review' || selected.state === 'Needs review' ? 'waiting' : 'done'} /><EvidenceStep label="Routing" copy={selected.routingReason || 'Existing routing evidence retained'} state={selected.owner === 'Unassigned' ? 'review' : 'done'} /><EvidenceStep label="Automation" copy={selected.automation || 'Historical automation trace retained'} state={isException ? 'review' : selected.state === 'Completed' ? 'done' : 'waiting'} /></div><div className="evidence-footer"><div><span>Consent</span><strong>{selected.consent}</strong><small>Statement v3.2 · en-US · withdrawal-ready</small></div><div><span>Idempotency key</span><strong>{selected.idempotencyKey || 'Migrated event'}</strong><small>Safe retry prevents duplicate CRM mutations</small></div><button className="outline-button" onClick={() => setShowPayload((open) => !open)}>{showPayload ? 'Hide receipt' : 'Inspect receipt'} <ArrowRight size={14} /></button></div>{showPayload ? <pre className="payload-receipt">{JSON.stringify({ event: selected.id, version: selected.version, channel: selected.source, consent: selected.consent, idempotencyKey: selected.idempotencyKey }, null, 2)}</pre> : null}</article></section>
}

function EvidenceStep({ label, copy, state }: { label: string; copy: string; state: 'done' | 'review' | 'waiting' }) { return <div className={`evidence-step ${state}`}><span>{state === 'done' ? <Check size={13} /> : state === 'review' ? <CircleAlert size={13} /> : <RefreshCw size={13} />}</span><div><strong>{label}</strong><small>{copy}</small></div></div> }

function FlowStep({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) { return <div className="flow-step"><span>{icon}</span><div><strong>{title}</strong><p>{copy}</p></div><Check size={16} /></div> }

function LibraryView({ onUseTemplate }: { onUseTemplate: () => void }) { return <section><div className="page-heading compact"><div><p className="eyebrow">APPROVED ASSETS</p><h1>Reuse what is already trusted.</h1><p className="subtle">Templates, fields, consent copy, and connections that are ready for a safe CRM moment.</p></div><button className="primary-button" onClick={onUseTemplate}><Plus size={17} />Use a template</button></div><div className="library-summary"><span><ShieldCheck size={18} /></span><p><strong>Only governed assets are shown.</strong> Field classifications, consent statements, and connection scopes remain visible before use.</p></div><div className="asset-grid"><AssetCard icon={<FileText size={19} />} eyebrow="STARTER TEMPLATES" title="Request a demo" copy="Qualification, ownership handoff, meeting offer, and consent are already mapped." action="Use template" onClick={onUseTemplate} /><AssetCard icon={<ListChecks size={19} />} eyebrow="APPROVED FIELDS" title="Company size" copy="Contact property · fill blank only · internal classification." action="Inspect policy" onClick={() => undefined} /><AssetCard icon={<ShieldCheck size={19} />} eyebrow="CONSENT COPY" title="Product updates · v3.2" copy="Localized for en-US · optional marketing purpose · withdrawal-ready." action="View statement" onClick={() => undefined} /><AssetCard icon={<Link2 size={19} />} eyebrow="CONNECTION" title="Website form handler" copy="Production · signed payloads · replay protection · healthy 2 min ago." action="Inspect connection" onClick={() => undefined} /></div></section> }
function AssetCard({ icon, eyebrow, title, copy, action, onClick }: { icon: React.ReactNode; eyebrow: string; title: string; copy: string; action: string; onClick: () => void }) { return <article className="panel asset-card"><span className="asset-icon">{icon}</span><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{copy}</p><button className="text-button" onClick={onClick}>{action} <ArrowRight size={14} /></button></article> }

function SettingsView() { return <section><div className="page-heading compact"><div><p className="eyebrow">GOVERNANCE</p><h1>Trust is part of the form.</h1><p className="subtle">Controlled fields, durable evidence, and enough clarity to move quickly.</p></div></div><div className="settings-grid"><article className="panel"><div className="panel-heading"><div><p className="eyebrow">CONSENT</p><h2>Purpose-specific by default.</h2></div><ShieldCheck className="success-icon" size={21} /></div><SettingsRow title="Marketing updates" copy="Statement v3.2 · localized · withdrawal-ready" action="Manage" /><SettingsRow title="Service communications" copy="Separate from optional marketing consent" action="Review" /></article><article className="panel"><div className="panel-heading"><div><p className="eyebrow">DATA HANDLING</p><h2>Safe by design.</h2></div><LockKeyhole className="gold-icon" size={21} /></div><SettingsRow title="Raw submission payload" copy="Encrypted · access logged · 180-day retention" action="Policy" /><SettingsRow title="Sensitive field library" copy="12 approved fields · privacy owner review required" action="Open" /></article><article className="panel"><div className="panel-heading"><div><p className="eyebrow">CONNECTIONS</p><h2>Healthy and permissioned.</h2></div><RefreshCw className="success-icon" size={21} /></div><SettingsRow title="CRM relationship mapping" copy="Connected · last delivery 2 min ago" action="Inspect" /><SettingsRow title="Website form handler" copy="Signed payloads · replay protection enabled" action="Inspect" /></article></div></section> }
function SettingsRow({ title, copy, action }: { title: string; copy: string; action: string }) { return <div className="settings-row"><div><strong>{title}</strong><p>{copy}</p></div><button className="text-button">{action} <ArrowRight size={14} /></button></div> }

function OperationalLens() {
  const [experimentLive, setExperimentLive] = useState(false)
  return <section className="operational-lens"><article className="panel experiment-panel"><div><p className="eyebrow">CONTROLLED EXPERIMENT</p><h2>Reduce mobile friction without weakening qualification.</h2><p>Variant B keeps Company size progressive for recognized contacts. Consent, required identity, and follow-through are locked guardrails.</p></div><div className="experiment-status"><span className={experimentLive ? 'live-badge' : 'draft-badge'}><i />{experimentLive ? 'Live · 50% traffic' : 'Ready to launch'}</span><button className="primary-button" onClick={() => setExperimentLive((live) => !live)}>{experimentLive ? 'Pause experiment' : 'Launch experiment'}</button></div></article><div className="evidence-strip"><span><BarChart3 size={17} /></span><p><strong>Decision evidence:</strong> 18% mobile exit rate, 95% data validity, 100% consent completion. Auto-pause if validity falls below 92% or owner coverage below 95%.</p><b>7-day window</b></div></section>
}

function GovernanceLedger() { return <section className="governance-ledger"><article className="panel audit-panel"><div className="panel-heading"><div><p className="eyebrow">AUDIT & ACCESS</p><h2>Every material decision has a durable record.</h2></div><button className="outline-button"><Search size={15} />Search audit</button></div><div className="audit-events"><span><CheckCircle2 size={16} />Version 7 published by Avery Ross · consent statement v3.2 attached</span><span><UserCheck size={16} />Jordan Lee match review assigned to Avery Ross · no CRM update applied</span><span><RefreshCw size={16} />Support handler delivery retry policy · 3 attempts, idempotent replay enabled</span></div></article><article className="panel role-panel"><p className="eyebrow">PUBLISHING POLICY</p><h2>Publisher approval required.</h2><p>Authors can draft from approved assets. Publishers activate low-risk versions. Privacy and integration administrators own protected policy changes.</p><span className="role-chip"><ShieldCheck size={14} />Current role: Publisher</span></article></section> }

export default App
