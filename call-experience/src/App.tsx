import { Fragment, useEffect, useState } from 'react'
import {
  ArrowUpRight, BarChart3, Bell, CalendarClock, Check, ChevronDown, CircleHelp,
  Clock3, FileText, Headphones, LayoutDashboard, ListFilter, Mail, Mic,
  MoreHorizontal, Pause, Phone, PhoneCall, PhoneOff, Play, Plus, Search,
  Settings2, ShieldCheck, SlidersHorizontal, Sparkles, UsersRound, VolumeX,
} from 'lucide-react'
import './App.css'

type CallStatus = 'ready' | 'incoming' | 'calling' | 'connected' | 'wrap-up'
type View = 'overview' | 'workspace' | 'history' | 'insights' | 'admin' | 'record' | 'operations'
type HistoryFilter = 'All' | 'Needs follow-up' | 'Meetings' | 'No answer' | 'Voicemails' | 'Softphone' | 'Uncontacted'
type ActivityKind = 'Call log' | 'Voicemail' | 'Softphone call' | 'Uncontacted'
type ReportFilter = 'All activity' | 'Connected' | 'Needs follow-up' | 'Meetings'
type CallRecord = {
  id: string
  initials: string
  name: string
  company: string
  title: string
  phone: string
  connection: string
  outcome: string
  notes: string
  duration: string
  time: string
  followUp: boolean
  direction?: 'Inbound' | 'Outbound'
  source?: 'Direct line' | 'Priority queue' | 'Sequence'
  recordingStatus?: 'Recorded' | 'No recording' | 'Consent pending'
  consent?: 'Captured' | 'Not required' | 'Pending'
  syncStatus?: 'Synced' | 'Queued' | 'Needs review'
  owner?: string
  quality?: number
  summaryApproved?: boolean
  automation?: 'Sequence paused' | 'Meeting suggested' | 'Follow-up created' | 'None'
  activityKind?: ActivityKind
}
type FollowThroughTask = {
  id: string
  contactName: string
  title: string
  due: string
  completed: boolean
}
type PolicyConfig = {
  recordingNotice: boolean
  transcriptScope: 'Restricted' | 'Team leads'
  retentionDays: 90 | 180 | 365
  routingMode: 'Assigned owner' | 'Skills match' | 'Team overflow'
}
type FinderIntent = {
  label: string
  detail: string
  filter: HistoryFilter
}

const queue = [
  { initials: 'SB', name: 'Sofia Bennett', company: 'Aster & Vale', title: 'Director of Partnerships', phone: '+1 (415) 555-0184', reason: 'Follow-up due', time: '09:30', priority: true, brief: 'Her last note said the partnership team has aligned on next steps.' },
  { initials: 'JR', name: 'Jonah Reed', company: 'Nettle Health', title: 'VP, Customer Success', phone: '+1 (628) 555-0192', reason: 'New inquiry', time: '10:00', priority: false, brief: 'Jonah asked for a concise overview before introducing the implementation team.' },
  { initials: 'MD', name: 'Maya Das', company: 'Avonwell', title: 'Operations Lead', phone: '+1 (415) 555-0168', reason: 'Callback requested', time: '10:15', priority: false, brief: 'Maya requested a callback after reviewing the revised service options.' },
  { initials: 'LC', name: 'Leo Chen', company: 'Northline', title: 'Commercial Director', phone: '+1 (510) 555-0128', reason: 'Sequence: step 3', time: '10:30', priority: false, brief: 'Leo has opened the last two follow-up emails but has not selected a meeting time.' },
]

const seedRecords: CallRecord[] = [
  { id: 'seed-sofia', initials: 'SB', name: 'Sofia Bennett', company: 'Aster & Vale', title: 'Director of Partnerships', phone: '+1 (415) 555-0184', connection: 'Connected', outcome: 'Callback due', notes: 'Sofia confirmed interest in a Q3 partner launch. Her legal team needs the mutual NDA before their internal planning meeting next Wednesday.', duration: '08:43', time: 'Yesterday, 4:12 PM', followUp: true },
  { id: 'seed-jonah', initials: 'JR', name: 'Jonah Reed', company: 'Nettle Health', title: 'VP, Customer Success', phone: '+1 (628) 555-0192', connection: 'Connected', outcome: 'Meeting booked', notes: 'Introduced the implementation team and booked a discovery session.', duration: '12:16', time: 'Yesterday, 2:03 PM', followUp: true },
  { id: 'seed-camille', initials: 'CK', name: 'Camille King', company: 'Seventeen North', title: 'Commercial Manager', phone: '+1 (510) 555-0155', connection: 'No answer', outcome: 'No follow-up', notes: '', duration: '00:31', time: 'Tuesday, 11:20 AM', followUp: false },
  { id: 'seed-priya-voicemail', initials: 'PM', name: 'Priya Mehta', company: 'Fieldwell', title: 'Procurement Lead', phone: '+1 (415) 555-0171', connection: 'Voicemail received', outcome: 'Callback requested', notes: 'Priya asked for a return call before 3:00 PM to confirm service coverage for the field team.', duration: '00:42', time: 'Today, 8:46 AM', followUp: true, direction: 'Inbound', source: 'Direct line', recordingStatus: 'Recorded', consent: 'Captured', activityKind: 'Voicemail' },
  { id: 'seed-daniel-softphone', initials: 'DO', name: 'Daniel Ortiz', company: 'Harbor & Finch', title: 'Revenue Operations', phone: '+1 (628) 555-0113', connection: 'Connected', outcome: 'Qualified', notes: 'Softphone call completed. Daniel asked to include his solutions architect in the next conversation.', duration: '06:18', time: 'Today, 8:17 AM', followUp: true, source: 'Sequence', recordingStatus: 'Recorded', consent: 'Captured', activityKind: 'Softphone call' },
  { id: 'seed-elena-uncontacted', initials: 'ES', name: 'Elena Sato', company: 'Brightmill', title: 'VP, Growth', phone: '+1 (510) 555-0146', connection: 'Not contacted', outcome: 'First touch ready', notes: 'High-fit account. No call, voicemail, or email engagement recorded yet.', duration: '—', time: 'Added today', followUp: true, source: 'Priority queue', recordingStatus: 'No recording', consent: 'Not required', activityKind: 'Uncontacted' },
]
const seedTasks: FollowThroughTask[] = [
  { id: 'task-sofia-nda', contactName: 'Sofia Bennett', title: 'Send mutual NDA', due: 'Tomorrow, 10:00 AM', completed: false },
  { id: 'task-jonah-plan', contactName: 'Jonah Reed', title: 'Confirm discovery agenda', due: 'Friday, 2:00 PM', completed: false },
]
const finderIntents: FinderIntent[] = [
  { label: 'Call logs', detail: 'Every completed or scheduled activity', filter: 'All' },
  { label: 'Follow-ups due', detail: 'Relationships that need a next action', filter: 'Needs follow-up' },
  { label: 'No answers', detail: 'Calls ready for a thoughtful retry', filter: 'No answer' },
  { label: 'Voicemails waiting', detail: 'Inbound requests that need a response', filter: 'Voicemails' },
  { label: 'Softphone calls', detail: 'Calls placed from your calling workspace', filter: 'Softphone' },
  { label: 'Uncontacted prospects', detail: 'High-fit contacts without a first touch', filter: 'Uncontacted' },
]

const secondsToClock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

const normalizeRecord = (record: CallRecord): CallRecord => ({
  ...record,
  direction: record.direction ?? 'Outbound',
  source: record.source ?? 'Priority queue',
  recordingStatus: record.recordingStatus ?? (record.connection === 'Connected' ? 'Recorded' : 'No recording'),
  consent: record.consent ?? (record.connection === 'Connected' ? 'Captured' : 'Not required'),
  syncStatus: record.syncStatus ?? 'Synced',
  owner: record.owner ?? 'Avery Ross',
  quality: record.quality ?? (record.connection === 'Connected' ? 88 : 72),
  summaryApproved: record.summaryApproved ?? false,
  automation: record.automation ?? (record.followUp ? 'Follow-up created' : 'None'),
  activityKind: record.activityKind ?? 'Call log',
})

function App() {
  const [view, setView] = useState<View>('workspace')
  const [mobileCallsMenuOpen, setMobileCallsMenuOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState(queue[0])
  const [status, setStatus] = useState<CallStatus>('ready')
  const [muted, setMuted] = useState(false)
  const [onHold, setOnHold] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [connection, setConnection] = useState('Connected')
  const [outcome, setOutcome] = useState('Follow-up required')
  const [createFollowUp, setCreateFollowUp] = useState(true)
  const [records, setRecords] = useState<CallRecord[]>(() => {
    const stored = localStorage.getItem('solace-call-records')
    return (stored ? JSON.parse(stored) as CallRecord[] : seedRecords).map(normalizeRecord)
  })
  const [tasks, setTasks] = useState<FollowThroughTask[]>(() => {
    const stored = localStorage.getItem('solace-follow-through-tasks')
    return stored ? JSON.parse(stored) as FollowThroughTask[] : seedTasks
  })
  const [selectedRecordId, setSelectedRecordId] = useState(records[0]?.id ?? '')
  const selectedRecord = records.find((record) => record.id === selectedRecordId) ?? records[0]
  const [showLogForm, setShowLogForm] = useState(false)
  const [logType, setLogType] = useState<'Completed' | 'Scheduled'>('Scheduled')
  const [logName, setLogName] = useState('')
  const [logCompany, setLogCompany] = useState('')
  const [logPhone, setLogPhone] = useState('')
  const [logNotes, setLogNotes] = useState('')
  const [timelineFilter, setTimelineFilter] = useState<'All' | 'Calls' | 'Notes'>('All')
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('All')
  const [historyQuery, setHistoryQuery] = useState('')
  const [historyOutcome, setHistoryOutcome] = useState('All')
  const [showHistoryFilters, setShowHistoryFilters] = useState(false)
  const [toast, setToast] = useState('')
  const [showTaskComposer, setShowTaskComposer] = useState(false)
  const [taskTitle, setTaskTitle] = useState('Send mutual NDA')
  const [taskDue, setTaskDue] = useState('Tomorrow, 10:00 AM')
  const [editingRelationshipNote, setEditingRelationshipNote] = useState(false)
  const [relationshipNote, setRelationshipNote] = useState('Legal review is the only remaining dependency before the joint planning session.')
  const [reportFilter, setReportFilter] = useState<ReportFilter>('All activity')
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferTarget, setTransferTarget] = useState('Maya Das')
  const [providerMode, setProviderMode] = useState<'Operational' | 'Degraded'>('Operational')
  const [availability, setAvailability] = useState<'Available' | 'Focus time'>('Available')
  const [showFinder, setShowFinder] = useState(false)
  const [finderQuery, setFinderQuery] = useState('')
  const [scheduleQuery, setScheduleQuery] = useState('')
  const [scheduleSlot, setScheduleSlot] = useState('Tomorrow, 10:00 AM')
  const [policies, setPolicies] = useState<PolicyConfig>(() => {
    const stored = localStorage.getItem('solace-call-policies')
    return stored ? JSON.parse(stored) as PolicyConfig : { recordingNotice: true, transcriptScope: 'Restricted', retentionDays: 180, routingMode: 'Assigned owner' }
  })

  useEffect(() => {
    if (status !== 'connected') return
    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(interval)
  }, [status])

  useEffect(() => {
    localStorage.setItem('solace-call-records', JSON.stringify(records))
  }, [records])

  useEffect(() => {
    localStorage.setItem('solace-follow-through-tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('solace-call-policies', JSON.stringify(policies))
  }, [policies])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const beginCall = () => {
    setStatus('calling')
    window.setTimeout(() => setStatus('connected'), 1300)
  }

  const simulateInboundCall = () => {
    const caller = queue[2]
    selectContact(caller)
    setStatus('incoming')
    setToast(`${caller.name} is calling your direct line.`)
  }

  const answerInboundCall = () => {
    setSeconds(0)
    setStatus('connected')
    setToast(`Connected with ${selectedContact.name}.`)
  }

  const declineInboundCall = () => {
    setStatus('ready')
    setToast(`${selectedContact.name} was sent to voicemail.`)
  }

  const finishCall = () => {
    setStatus('wrap-up')
    setOnHold(false)
  }

  const completeTransfer = () => {
    setShowTransfer(false)
    setStatus('ready')
    setOnHold(false)
    setToast(`${selectedContact.name} was introduced and transferred to ${transferTarget}.`)
  }

  const approveSummary = () => {
    if (!selectedRecord) return
    setRecords((current) => current.map((record) => record.id === selectedRecord.id ? { ...record, summaryApproved: true, syncStatus: 'Synced' } : record))
    setToast('Call summary approved and added to the relationship timeline.')
  }

  const recoverProvider = () => {
    setProviderMode('Operational')
    setRecords((current) => current.map((record) => record.syncStatus === 'Needs review' ? { ...record, syncStatus: 'Synced' } : record))
    setToast('Simulated provider recovery completed. Queued activities are reconciled.')
  }

  const saveWrapUp = () => {
    const record: CallRecord = {
      id: crypto.randomUUID(),
      initials: selectedContact.initials,
      name: selectedContact.name,
      company: selectedContact.company,
      title: selectedContact.title,
      phone: selectedContact.phone,
      connection,
      outcome: connection === 'Connected' ? outcome : 'No follow-up',
      notes,
      duration: secondsToClock(seconds),
      time: 'Just now',
      followUp: connection === 'Connected' && createFollowUp,
    }
    setRecords((current) => [record, ...current])
    setSelectedRecordId(record.id)
    setSaved(true)
    window.setTimeout(() => {
      setSaved(false)
      setStatus('ready')
      setSeconds(0)
      setNotes('')
    }, 1000)
  }

  const selectContact = (contact: typeof queue[number]) => {
    setSelectedContact(contact)
    setStatus('ready')
    setMuted(false)
    setOnHold(false)
    setSeconds(0)
    setNotes('')
  }

  const saveManualLog = () => {
    if (!logName.trim() || !logPhone.trim()) return
    const record: CallRecord = {
      id: crypto.randomUUID(), initials: logName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      name: logName.trim(), company: logCompany.trim() || 'Unassociated company', title: 'Contact', phone: logPhone.trim(),
      connection: logType === 'Scheduled' ? 'Scheduled' : 'Connected', outcome: logType === 'Scheduled' ? 'Call planned' : 'Follow-up required',
      notes: logNotes.trim(), duration: logType === 'Scheduled' ? 'Planned' : '00:00', time: logType === 'Scheduled' ? `Scheduled · ${scheduleSlot}` : 'Just now', followUp: logType === 'Scheduled', activityKind: 'Call log',
    }
    setRecords((current) => [record, ...current])
    setSelectedRecordId(record.id)
    setShowLogForm(false)
    setLogName('')
    setLogCompany('')
    setLogPhone('')
    setLogNotes('')
    setScheduleQuery('')
    setToast(logType === 'Scheduled' ? 'Call scheduled and added to your queue.' : 'Call log saved to the relationship timeline.')
  }

  const completeFollowUp = () => {
    if (!selectedRecord) return
    setRecords((current) => current.map((record) => record.id === selectedRecord.id ? { ...record, followUp: false } : record))
    setToast(`Follow-up for ${selectedRecord.name} marked complete.`)
  }

  const saveTask = () => {
    if (!taskTitle.trim()) return
    const task: FollowThroughTask = { id: crypto.randomUUID(), contactName: selectedContact.name, title: taskTitle.trim(), due: taskDue.trim() || 'No due date', completed: false }
    setTasks((current) => [task, ...current])
    setShowTaskComposer(false)
    setToast(`${task.title} is now owned by you and due ${task.due}.`)
  }

  const completeTask = (taskId: string) => {
    const task = tasks.find((current) => current.id === taskId)
    if (!task) return
    setTasks((current) => current.map((item) => item.id === taskId ? { ...item, completed: true } : item))
    setToast(`${task.title} marked complete.`)
  }

  const openScheduleForContact = () => {
    setLogType('Scheduled')
    setLogName(selectedContact.name)
    setLogCompany(selectedContact.company)
    setLogPhone(selectedContact.phone)
    setScheduleQuery(selectedContact.name)
    setView('workspace')
    setShowLogForm(true)
  }

  const selectScheduleContact = (record: CallRecord) => {
    setLogName(record.name)
    setLogCompany(record.company)
    setLogPhone(record.phone)
    setScheduleQuery(record.name)
    const queuedContact = queue.find((contact) => contact.name === record.name)
    if (queuedContact) setSelectedContact(queuedContact)
  }

  const openFinderIntent = (filter: HistoryFilter) => {
    setHistoryFilter(filter)
    setFinderQuery('')
    setShowFinder(false)
    setView('history')
  }

  const historyOutcomes = Array.from(new Set(records.map((record) => record.outcome))).sort()
  const visibleRecords = records.filter((record) => {
    const matchesQuery = `${record.name} ${record.company} ${record.phone} ${record.connection} ${record.outcome} ${record.notes}`.toLowerCase().includes(historyQuery.toLowerCase())
    if (!matchesQuery || (historyOutcome !== 'All' && record.outcome !== historyOutcome)) return false
    if (historyFilter === 'Needs follow-up') return record.followUp
    if (historyFilter === 'Meetings') return record.outcome === 'Meeting booked'
    if (historyFilter === 'No answer') return record.connection === 'No answer'
    if (historyFilter === 'Voicemails') return record.activityKind === 'Voicemail'
    if (historyFilter === 'Softphone') return record.activityKind === 'Softphone call'
    if (historyFilter === 'Uncontacted') return record.activityKind === 'Uncontacted'
    return true
  })
  const finderResults = finderIntents.filter((intent) => `${intent.label} ${intent.detail}`.toLowerCase().includes(finderQuery.toLowerCase()))
  const scheduleMatches = records.filter((record) => `${record.name} ${record.company}`.toLowerCase().includes(scheduleQuery.toLowerCase())).slice(0, 4)
  const contactTasks = tasks.filter((task) => task.contactName === selectedContact.name && !task.completed)
  const completedTasks = tasks.filter((task) => task.completed).length
  const connectedRecords = records.filter((record) => record.connection === 'Connected').length
  const connectionRate = records.length ? Math.round((connectedRecords / records.length) * 100) : 0
  const meetingRecords = records.filter((record) => record.outcome === 'Meeting booked').length
  const reportRecords = records.filter((record) => {
    if (reportFilter === 'Connected') return record.connection === 'Connected'
    if (reportFilter === 'Needs follow-up') return record.followUp
    if (reportFilter === 'Meetings') return record.outcome === 'Meeting booked'
    return true
  })

  return (
    <main className="app-shell">
      <aside className="rail global-rail" aria-label="CRM navigation">
        <a className="brand" href="#workspace" aria-label="Solace home"><span>S</span><strong>Solace</strong></a>
        <nav className="crm-nav">
          <button className="crm-nav-item" onClick={() => setToast('Home is outside this Calls prototype.')}><LayoutDashboard size={18} /><span>Home</span></button>
          <button className="crm-nav-item" onClick={() => setToast('Contacts is outside this Calls prototype.')}><UsersRound size={18} /><span>Contacts</span></button>
          <button className="crm-nav-item" onClick={() => setToast('Pipeline is outside this Calls prototype.')}><BarChart3 size={18} /><span>Pipeline</span></button>
          <div className={mobileCallsMenuOpen ? 'calls-module mobile-calls-menu-open' : 'calls-module'}>
            <button className="crm-nav-item active-module" onClick={() => { setView('workspace'); setMobileCallsMenuOpen((open) => !open) }} aria-expanded={mobileCallsMenuOpen} aria-controls="calls-subnav"><PhoneCall size={18} /><span>Calls</span></button>
            <nav className="calls-subnav" id="calls-subnav" aria-label="Calls navigation">
              <button className={view === 'overview' ? 'calls-subnav-item active-calls-subnav-item' : 'calls-subnav-item'} onClick={() => { setView('overview'); setMobileCallsMenuOpen(false) }}>Overview</button>
              <button className={view === 'workspace' ? 'calls-subnav-item active-calls-subnav-item' : 'calls-subnav-item'} onClick={() => { setView('workspace'); setMobileCallsMenuOpen(false) }}>Workspace</button>
              <button className={view === 'history' ? 'calls-subnav-item active-calls-subnav-item' : 'calls-subnav-item'} onClick={() => { setView('history'); setMobileCallsMenuOpen(false) }}>Call history</button>
              <button className={view === 'insights' ? 'calls-subnav-item active-calls-subnav-item' : 'calls-subnav-item'} onClick={() => { setView('insights'); setMobileCallsMenuOpen(false) }}>Insights</button>
              <button className={view === 'operations' ? 'calls-subnav-item active-calls-subnav-item' : 'calls-subnav-item'} onClick={() => { setView('operations'); setMobileCallsMenuOpen(false) }}>Live operations</button>
            </nav>
          </div>
          <button className="crm-nav-item" onClick={() => setToast('Tasks is outside this Calls prototype.')}><Check size={18} /><span>Tasks</span></button>
        </nav>
        <div className="rail-foot">
          <button className={view === 'admin' ? 'crm-nav-item active-calls-subnav-item' : 'crm-nav-item'} onClick={() => setView('admin')}><Settings2 size={18} /><span>Administration</span></button>
          <button className="profile-dot" aria-label="Open profile">AR</button>
        </div>
      </aside>

      <section className="workspace" id="workspace">
        <header className="topbar">
          <div className="crumbs"><span>Calls</span><span className="slash">/</span><strong>My workspace</strong></div>
          <div className="topbar-actions">
            <button className="availability" onClick={() => setAvailability((current) => current === 'Available' ? 'Focus time' : 'Available')}><i className={availability === 'Focus time' ? 'focus-dot' : ''}></i>{availability} <ChevronDown size={14} /></button>
            <button className="icon-button" onClick={() => setShowFinder(true)} aria-label="Open Call Finder"><Search size={18} /></button>
            <button className="icon-button notification" onClick={() => setToast('You have one follow-up due today.')} aria-label="Notifications"><Bell size={18} /><b></b></button>
            <button className="icon-button" onClick={() => setToast('Tip: use Open record to see the full relationship story.')} aria-label="Help"><CircleHelp size={18} /></button>
          </div>
        </header>

        {view === 'overview' && <section className="operations-view overview-view" aria-labelledby="overview-title">
          <div className="page-heading">
            <div><p className="eyebrow">YOUR CALLS · THURSDAY, APRIL 18</p><h1 id="overview-title">The work worth moving today</h1><p className="subtle">A single read on active relationships, commitments, and the next conversation with momentum.</p></div>
            <button className="call-button" onClick={() => setView('workspace')}><Phone size={17} />Open calling workspace</button>
          </div>
          <div className="metric-grid">
            <article><span className="metric-label">CALLS IN FOCUS</span><strong>{queue.length}</strong><p><ArrowUpRight size={14} /> Thoughtfully prioritized for today</p></article>
            <article><span className="metric-label">OPEN COMMITMENTS</span><strong>{tasks.filter((task) => !task.completed).length}</strong><p><ArrowUpRight size={14} /> Relationship follow-through to protect</p></article>
            <article><span className="metric-label">CONNECTION RATE</span><strong>{connectionRate}<span>%</span></strong><p><ArrowUpRight size={14} /> Based on your recent call records</p></article>
          </div>
          <div className="insight-detail-grid">
            <article className="trend-panel"><div className="panel-heading"><div><p className="eyebrow">NEXT CONVERSATION</p><h2>{selectedContact.name} is ready</h2></div><span className="green-chip">Best time now</span></div><div className="overview-action"><span className="large-avatar">{selectedContact.initials}<i className="presence"></i></span><div><strong>{selectedContact.company} <span className="dot">•</span> {selectedContact.title}</strong><p>{selectedContact.brief}</p></div><div className="overview-actions"><button className="outline-button" onClick={() => setView('record')}>View record</button><button className="call-button" onClick={() => setView('workspace')}><Phone size={16} />Call</button></div></div></article>
            <article className="coaching-panel"><div className="panel-heading"><div><p className="eyebrow">FOLLOW-THROUGH</p><h2>Keep promises visible</h2></div><Check className="sparkle" size={19} /></div><p>{tasks.filter((task) => !task.completed).length ? `${tasks.filter((task) => !task.completed).length} commitments are open across your relationships.` : 'Every relationship commitment is complete.'}</p><button className="text-button" onClick={() => setView('record')}>Review open work <span>→</span></button></article>
          </div>
        </section>}

        {view === 'workspace' && <><div className="page-heading">
          <div><p className="eyebrow">THURSDAY, APRIL 18</p><h1>Your calling rhythm</h1><p className="subtle">A calm, focused view of the conversations that matter today.</p></div>
          <div className="workspace-actions"><button className="outline-button inbound-trigger" onClick={simulateInboundCall}><PhoneCall size={17} />Simulate inbound</button><button className="outline-button" onClick={() => { setLogType('Scheduled'); setShowLogForm(true) }}><Clock3 size={17} />Schedule call</button></div>
        </div>

        {showLogForm && <section className={`log-form ${logType === 'Scheduled' ? 'scheduler-form' : ''}`} aria-label="Log or schedule a call"><div><p className="eyebrow">CALL ACTIVITY</p><h2>{logType === 'Scheduled' ? 'Reserve the right next moment' : 'Log a completed call'}</h2></div><div className="form-actions"><button className={logType === 'Scheduled' ? 'form-mode active-mode' : 'form-mode'} onClick={() => setLogType('Scheduled')}>Schedule</button><button className={logType === 'Completed' ? 'form-mode active-mode' : 'form-mode'} onClick={() => setLogType('Completed')}>Log completed</button><button className="quiet-button" onClick={() => setShowLogForm(false)}>Cancel</button></div>{logType === 'Scheduled' ? <><div className="scheduler-search"><label>Find the relationship<span className="finder-input"><Search size={16} /><input value={scheduleQuery} onChange={(event) => setScheduleQuery(event.target.value)} placeholder="Name, company, voicemail, or no answer" autoFocus /></span></label><div className="scheduler-results">{scheduleMatches.map((record) => <button key={record.id} className={logName === record.name ? 'schedule-contact active-schedule-contact' : 'schedule-contact'} onClick={() => selectScheduleContact(record)}><span className="avatar">{record.initials}</span><span><strong>{record.name}</strong><small>{record.company} · {record.activityKind === 'Uncontacted' ? 'First touch ready' : record.outcome}</small></span><span>{record.activityKind === 'Voicemail' ? 'Voicemail' : record.followUp ? 'Next step' : 'History'}</span></button>)}</div></div><div className="scheduler-moment"><p className="eyebrow">BEST NEXT MOMENT</p><div>{(['Tomorrow, 10:00 AM', 'Thursday, 2:30 PM'] as const).map((slot) => <button key={slot} className={scheduleSlot === slot ? 'schedule-slot active-schedule-slot' : 'schedule-slot'} onClick={() => setScheduleSlot(slot)}><Clock3 size={15} /><span>{slot}</span><small>{slot.includes('10:00') ? 'High connect likelihood' : 'Matches their local time'}</small></button>)}</div></div><label className="form-notes">Purpose or promise<textarea value={logNotes} onChange={(event) => setLogNotes(event.target.value)} placeholder="What will make this conversation worthwhile?" /></label><div className="schedule-summary"><span>{logName ? `A focused call with ${logName}` : 'Choose a relationship to continue'}</span><button className="call-button" onClick={saveManualLog} disabled={!logName.trim() || !logPhone.trim()}><CalendarClock size={16} />Reserve call</button></div></> : <><label>Contact<input value={logName} onChange={(event) => setLogName(event.target.value)} placeholder="Name" /></label><label>Company<input value={logCompany} onChange={(event) => setLogCompany(event.target.value)} placeholder="Company" /></label><label>Phone<input value={logPhone} onChange={(event) => setLogPhone(event.target.value)} placeholder="+1 (555) 000-0000" /></label><label className="form-notes">Context or notes<textarea value={logNotes} onChange={(event) => setLogNotes(event.target.value)} placeholder="What should be remembered?" /></label><button className="call-button" onClick={saveManualLog} disabled={!logName.trim() || !logPhone.trim()}>Save call log</button></>}</section>}

        <section className="focus-layout">
          <article className="queue-panel">
            <div className="panel-heading"><div><p className="eyebrow">PRIORITY QUEUE</p><h2>Thoughtfully sequenced</h2></div><button className="quiet-button" onClick={() => setToast('Your full queue is already ordered by next-best conversation.')}>View all</button></div>
            <div className="queue-rule"><span>4 contacts</span><span>Best time to call</span></div>
            <div className="queue-list">
              {queue.map((contact, index) => (
                <button className={`queue-item ${selectedContact.name === contact.name ? 'selected' : ''}`} key={contact.name} onClick={() => selectContact(contact)}>
                  <span className={`avatar avatar-${index}`}>{contact.initials}</span>
                  <span className="queue-copy"><strong>{contact.name}</strong><small>{contact.company} <b>{contact.reason}</b></small></span>
                  <span className="queue-time">{contact.priority && <i></i>}{contact.time}</span>
                </button>
              ))}
            </div>
            <div className="queue-footer"><span><Sparkles size={15} /> Prioritized for a 15% higher connect rate</span><button onClick={() => setToast('Queue is optimized for contact availability and relationship momentum.')} aria-label="More queue actions"><MoreHorizontal size={18} /></button></div>
          </article>

          <article className={`call-card ${status}`}>
            <div className="call-topline"><span className="live-indicator"><i></i>{status === 'connected' ? 'Live conversation' : status === 'calling' ? 'Connecting securely' : status === 'wrap-up' ? 'Call complete' : 'Ready when you are'}</span><button className="icon-button subtle-icon" aria-label="More call actions"><MoreHorizontal size={19} /></button></div>
            <div className="caller-hero">
              <div className="large-avatar">{selectedContact.initials}<span className="presence"></span></div>
              <div><p className="eyebrow">{selectedContact.reason.toUpperCase()}</p><h2>{selectedContact.name}</h2><p>{selectedContact.company} <span className="dot">•</span> {selectedContact.title}</p></div>
              <button className="contact-link" onClick={() => setView('record')} aria-label={`Open ${selectedContact.name} record`}>Open record</button>
            </div>
            <div className="call-context"><span><Phone size={15} />{selectedContact.phone}</span><span><Clock3 size={15} />Best time: now until {selectedContact.time}</span><span><FileText size={15} />3 prior conversations</span></div>

            {status === 'ready' && <div className="call-primary"><p>{selectedContact.brief}</p><button className="call-button" onClick={beginCall}><Phone size={19} />Call {selectedContact.name.split(' ')[0]}</button></div>}
            {status === 'incoming' && <div className="call-primary incoming-call"><span className="incoming-orbit"><PhoneCall size={20} /></span><p><strong>{selectedContact.name}</strong> is calling your direct line. Their last request was a callback after reviewing the revised service options.</p><div className="incoming-actions"><button className="outline-button" onClick={declineInboundCall}><PhoneOff size={16} />Send to voicemail</button><button className="call-button" onClick={answerInboundCall}><Phone size={17} />Answer call</button></div></div>}
            {status === 'calling' && <div className="call-primary connecting"><div className="signal"><span></span><span></span><span></span></div><p>Calling {selectedContact.name.split(' ')[0]} on their direct line</p><button className="quiet-button" onClick={() => setStatus('ready')}>Cancel</button></div>}
            {status === 'connected' && <div className="active-controls"><div className="timer">{secondsToClock(seconds)}<span>{onHold ? 'On hold' : 'Connected'}</span></div><div className="control-row"><button className={muted ? 'control-toggle engaged' : 'control-toggle'} onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}>{muted ? <VolumeX size={19} /> : <Mic size={19} />}<span>{muted ? 'Unmute' : 'Mute'}</span></button><button className={onHold ? 'control-toggle engaged' : 'control-toggle'} onClick={() => setOnHold(!onHold)}><Pause size={19} /><span>{onHold ? 'Resume' : 'Hold'}</span></button><button className="control-toggle" onClick={() => setShowTransfer(true)}><UsersRound size={19} /><span>Transfer</span></button><button className="end-call" onClick={finishCall}><PhoneOff size={19} /><span>End</span></button></div></div>}
            {status === 'wrap-up' && <div className="call-primary wrap"><div className="completion-mark">✓</div><p>Capture the outcome while the conversation is fresh.</p><div className="wrap-fields"><label>Connection<select value={connection} onChange={(event) => setConnection(event.target.value)}><option>Connected</option><option>No answer</option><option>Voicemail left</option><option>Busy</option><option>Wrong number</option></select></label>{connection === 'Connected' && <label>Outcome<select value={outcome} onChange={(event) => setOutcome(event.target.value)}><option>Follow-up required</option><option>Meeting booked</option><option>Qualified</option><option>Not interested</option><option>Issue resolved</option></select></label>}<label className="follow-up-check"><input type="checkbox" checked={createFollowUp} onChange={(event) => setCreateFollowUp(event.target.checked)} disabled={connection !== 'Connected'} />Create a linked follow-up</label></div><button className="call-button" onClick={saveWrapUp}>{saved ? 'Saved' : 'Complete wrap-up'}</button></div>}
          </article>
        </section>

        <section className="lower-grid">
          <article className="insight-panel">
            <div className="panel-heading"><div><p className="eyebrow">CONVERSATION BRIEF</p><h2>What matters today</h2></div><Sparkles className="sparkle" size={19} /></div>
            <div className="insight-item"><span className="number">01</span><div><strong>Shared commitment</strong><p>They want to confirm a joint launch window before the Q3 planning cycle.</p></div></div>
            <div className="insight-item"><span className="number">02</span><div><strong>Listen for</strong><p>Decision-maker availability and any legal review dependencies.</p></div></div>
            <button className="text-button" onClick={() => setView('record')}>View relationship timeline <span>→</span></button>
          </article>
          <article className="notes-panel">
            <div className="panel-heading"><div><p className="eyebrow">LIVE NOTES</p><h2>Keep the signal</h2></div><span className="autosave">{notes ? 'Autosaved' : 'Ready'}</span></div>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Capture only what will make the next step easier..." aria-label="Live call notes" />
            <div className="note-footer"><span>Private to your team</span><button className="icon-button" onClick={() => setToast('Voice-note capture is ready to begin.')} aria-label="Add voice note"><Headphones size={17} /></button></div>
          </article>
        </section>
        {showTransfer && <div className="composer-backdrop" role="presentation" onMouseDown={() => setShowTransfer(false)}><section className="task-composer transfer-composer" role="dialog" aria-modal="true" aria-labelledby="transfer-title" onMouseDown={(event) => event.stopPropagation()}><div className="composer-heading"><div><p className="eyebrow">WARM TRANSFER</p><h2 id="transfer-title">Keep the context intact</h2></div><button className="icon-button" onClick={() => setShowTransfer(false)} aria-label="Close transfer">×</button></div><p className="transfer-intro">{selectedContact.name}'s relationship context and live notes travel with the handoff.</p><div className="transfer-list">{['Maya Das', 'Nora Patel', 'Client Success pod'].map((target) => <button key={target} className={transferTarget === target ? 'transfer-target active-transfer' : 'transfer-target'} onClick={() => setTransferTarget(target)}><span className="avatar">{target.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span><strong>{target}</strong><small>{target === 'Client Success pod' ? 'Team overflow · 3 available' : 'Available now · relationship context ready'}</small></span><Check size={16} /></button>)}</div><div className="composer-actions"><button className="quiet-button" onClick={() => setShowTransfer(false)}>Cancel</button><button className="call-button" onClick={completeTransfer}><PhoneCall size={16} />Introduce and transfer</button></div></section></div>}
        </>}

        {view === 'history' && <section className="operations-view" aria-labelledby="history-title">
          <div className="page-heading">
            <div><p className="eyebrow">CANONICAL CALL RECORDS</p><h1 id="history-title">Every conversation, in context</h1><p className="subtle">Review outcomes, follow through on commitments, and revisit the signal behind each decision.</p></div>
            <div className="history-tools"><label className="history-search"><Search size={17} /><input value={historyQuery} onChange={(event) => setHistoryQuery(event.target.value)} placeholder="Search calls" aria-label="Search call history" /></label><button className={showHistoryFilters ? 'outline-button history-filter-button filters-open' : 'outline-button history-filter-button'} onClick={() => setShowHistoryFilters((current) => !current)}><ListFilter size={16} />Filters{historyFilter !== 'All' || historyOutcome !== 'All' ? ' • Active' : ''}</button></div>
          </div>
          {showHistoryFilters && <div className="history-filter-panel" aria-label="Optional call history filters"><div><strong>Filter calls</strong><button className="quiet-button" onClick={() => { setHistoryFilter('All'); setHistoryOutcome('All') }}>Clear</button></div><label>Activity<select value={historyFilter} onChange={(event) => setHistoryFilter(event.target.value as HistoryFilter)}>{(['All', 'Needs follow-up', 'Meetings', 'No answer', 'Voicemails', 'Softphone', 'Uncontacted'] as const).map((filter) => <option key={filter}>{filter}</option>)}</select></label><label>Outcome<select value={historyOutcome} onChange={(event) => setHistoryOutcome(event.target.value)}><option>All</option>{historyOutcomes.map((outcome) => <option key={outcome}>{outcome}</option>)}</select></label></div>}
          <div className="operations-grid">
            <article className="history-panel">
              <div className="panel-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Call history</h2></div><button className="quiet-button" onClick={() => setToast(`${visibleRecords.length} call records prepared for export.`)}>Export</button></div>
              <div className="history-list">{visibleRecords.length ? visibleRecords.map((call, index) => <button className={`history-row ${selectedRecordId === call.id ? 'selected-history' : ''}`} key={call.id} onClick={() => setSelectedRecordId(call.id)}>
                <span className={`avatar avatar-${index}`}>{call.initials}</span><span className="history-copy"><strong>{call.name}</strong><small>{call.company} <b>{call.outcome}</b></small></span><span className="history-meta">{call.time}<b>{call.duration}</b></span>
              </button>) : <div className="empty-history"><Sparkles size={19} /><strong>No calls in this view</strong><span>Try another filter to see the wider conversation history.</span></div>}</div>
            </article>
            <article className="record-panel">
              <div className="record-head"><div><p className="eyebrow">OUTBOUND CALL · {selectedRecord.time.toUpperCase()}</p><h2>{selectedRecord.name}</h2><p>{selectedRecord.company} <span className="dot">•</span> {selectedRecord.duration}</p></div><span className="result-badge">{selectedRecord.outcome}</span></div>
              <div className="record-actions"><button className="play-button" onClick={() => setToast('Simulated recording playback started at the decision moment.')}><Play size={16} fill="currentColor" />Play recording</button><button className="outline-button" onClick={() => { setSelectedContact(queue.find((contact) => contact.name === selectedRecord.name) ?? selectedContact); setView('workspace'); setToast(`Ready to call ${selectedRecord.name} again.`) }}><Phone size={16} />Call again</button><button className="icon-button" onClick={() => setToast('Record actions include share, copy link, and open contact.')} aria-label="More record actions"><MoreHorizontal size={19} /></button></div>
              <div className="record-intelligence"><div className="intelligence-topline"><span><i></i>{selectedRecord.recordingStatus} · {selectedRecord.consent}</span><b>{selectedRecord.quality}/100 quality</b></div><div className="record-wave" aria-label="Simulated recording waveform">{Array.from({ length: 34 }, (_, index) => <i key={index} style={{ height: `${22 + ((index * 23) % 58)}%` }}></i>)}</div><div className="transcript"><div className="transcript-heading"><span>DECISION MOMENT · 06:24</span><button onClick={() => setToast('Speaker transcript opened at the decision moment.')}>Search transcript</button></div><p>{selectedRecord.notes || 'No notes were captured for this call.'}</p><div className="quote"><span>“</span>{selectedRecord.connection} · {selectedRecord.outcome}</div></div><div className="intelligence-actions"><span><Sparkles size={15} />{selectedRecord.automation === 'None' ? 'No automation suggested' : selectedRecord.automation}</span><button className={selectedRecord.summaryApproved ? 'summary-approved' : 'summary-approve'} onClick={approveSummary}>{selectedRecord.summaryApproved ? <><Check size={14} />Summary approved</> : 'Approve summary'}</button></div></div>
              {selectedRecord.followUp && <div className="follow-up"><div><CalendarClock size={19} /><span><b>NEXT STEP</b><strong>Follow up with {selectedRecord.name}</strong><small>Owned by you · Due tomorrow, 10:00 AM</small></span></div><button className="complete-task" onClick={completeFollowUp}><Check size={16} />Complete</button></div>}
            </article>
          </div>
        </section>}

        {view === 'insights' && <section className="operations-view" aria-labelledby="insights-title">
          <div className="page-heading">
            <div><p className="eyebrow">APRIL 1 - 18</p><h1 id="insights-title">Momentum, without the noise</h1><p className="subtle">A concise read on quality, follow-through, and the conversations moving work forward.</p></div>
            <button className="outline-button"><Clock3 size={17} />Last 18 days</button>
          </div>
          <div className="metric-grid">
            <article><span className="metric-label">CONNECTED</span><strong>{connectionRate}<span>%</span></strong><p><ArrowUpRight size={14} /> Live from {records.length} call records</p></article>
            <article><span className="metric-label">FOLLOW-THROUGH</span><strong>{completedTasks}<span> / {tasks.length}</span></strong><p><ArrowUpRight size={14} /> Tasks completed across relationships</p></article>
            <article><span className="metric-label">MEETINGS BOOKED</span><strong>{meetingRecords}</strong><p><ArrowUpRight size={14} /> Outcomes that moved work forward</p></article>
          </div>
          <div className="report-filter-bar" aria-label="Reporting drill-down filters">{(['All activity', 'Connected', 'Needs follow-up', 'Meetings'] as const).map((filter) => <button key={filter} className={reportFilter === filter ? 'report-filter-active' : ''} onClick={() => setReportFilter(filter)}>{filter}</button>)}</div>
          <div className="insight-detail-grid">
            <article className="trend-panel"><div className="panel-heading"><div><p className="eyebrow">CALL QUALITY</p><h2>Connection is improving</h2></div><span className="green-chip">Healthy</span></div><div className="chart"><div className="chart-line"></div><span className="bar b1"></span><span className="bar b2"></span><span className="bar b3"></span><span className="bar b4"></span><span className="bar b5"></span><span className="bar b6"></span><span className="bar b7"></span></div><div className="chart-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Mon</span><span>Today</span></div></article>
            <article className="coaching-panel"><div className="panel-heading"><div><p className="eyebrow">ONE FOCUS</p><h2>Protect next steps</h2></div><BarChart3 className="sparkle" size={19} /></div><p>Four conversations have a clear commitment but no scheduled activity yet.</p><button className="text-button" onClick={() => setView('history')}>Review follow-ups <span>→</span></button></article>
          </div>
          <section className="report-drilldown" aria-live="polite"><div className="report-drilldown-heading"><div><p className="eyebrow">DRILL-DOWN · {reportFilter.toUpperCase()}</p><h2>{reportRecords.length} records behind this signal</h2></div><button className="text-button" onClick={() => { setHistoryFilter('All'); setView('history') }}>Open full history <span>→</span></button></div><div className="report-records">{reportRecords.length ? reportRecords.slice(0, 3).map((record) => <button key={record.id} className="report-record" onClick={() => { setSelectedRecordId(record.id); setView('history') }}><span className="avatar">{record.initials}</span><span><strong>{record.name}</strong><small>{record.company} · {record.outcome}</small></span><b>{record.duration}</b></button>) : <p>No records match this view yet.</p>}</div></section>
        </section>}

        {view === 'operations' && <section className="operations-view operations-console" aria-labelledby="operations-title">
          <div className="page-heading">
            <div><p className="eyebrow">LIVE OPERATIONS · SIMULATED</p><h1 id="operations-title">See the room, not the noise</h1><p className="subtle">A calm supervisor view for routing, live assistance, and exceptions that need a human decision.</p></div>
            <button className="call-button" onClick={simulateInboundCall}><PhoneCall size={17} />Place inbound call</button>
          </div>
          <div className="operations-pulse"><article><span className="metric-label">AGENTS AVAILABLE</span><strong>8<span> / 10</span></strong><p><i></i> Routing is inside target</p></article><article><span className="metric-label">CALLS WAITING</span><strong>1</strong><p><i></i> Maya Das · 00:18</p></article><article><span className="metric-label">SERVICE LEVEL</span><strong>94<span>%</span></strong><p><ArrowUpRight size={14} /> Above the 90% target</p></article></div>
          <div className="operations-grid live-operations-grid"><article className="live-room"><div className="panel-heading"><div><p className="eyebrow">LIVE FLOOR</p><h2>People, with their context</h2></div><span className="green-chip">2 live</span></div><div className="agent-list">{[{ name: 'Avery Ross', state: 'In conversation', detail: 'Sofia Bennett · 08:43' }, { name: 'Maya Das', state: 'Available', detail: 'Partnerships · West' }, { name: 'Nora Patel', state: 'Wrap-up', detail: 'Nettle Health · notes pending' }].map((agent) => <div className="agent-row" key={agent.name}><span className="avatar">{agent.name.split(' ').map((part) => part[0]).join('')}</span><span><strong>{agent.name}</strong><small>{agent.detail}</small></span><b className={agent.state === 'Available' ? 'agent-ready' : ''}>{agent.state}</b><button className="quiet-button" onClick={() => setToast(`${agent.name}'s simulated live context is ready for a private assist.`)}>Assist</button></div>)}</div></article><article className="exception-panel"><div className="panel-heading"><div><p className="eyebrow">ONE EXCEPTION</p><h2>Protect this caller</h2></div><span className="result-badge">18 sec</span></div><p>Maya Das called after a revised-service review. Her assigned owner is in focus time, so the next best route is a warm handoff to Partnerships.</p><div className="exception-actions"><button className="outline-button" onClick={() => setToast('Callback commitment created for Maya Das at 10:15 AM.')}>Commit callback</button><button className="call-button" onClick={simulateInboundCall}>Route now</button></div><small>Simulated routing decision · owner context checked · consent policy active</small></article></div>
          <section className="operations-timeline"><div><p className="eyebrow">EVENT STREAM</p><h2>Only the moments that matter</h2></div><ol><li><i></i><span><b>09:42</b> Sofia’s call summary was approved and written to the relationship timeline.</span></li><li><i></i><span><b>09:37</b> Nettle Health follow-up was assigned with a Friday service-level commitment.</span></li><li><i></i><span><b>09:31</b> Recording consent captured for the direct-line callback.</span></li></ol></section>
        </section>}

        {view === 'admin' && <section className="operations-view" aria-labelledby="admin-title">
          <div className="page-heading">
            <div><p className="eyebrow">CALLS ADMINISTRATION</p><h1 id="admin-title">Govern the experience</h1><p className="subtle">Policies are understandable in one pass and exceptions are never silent.</p></div>
            <button className="outline-button" onClick={() => setToast('Select any policy badge or routing step to change and save its setting.')}><SlidersHorizontal size={17} />Edit policies</button>
          </div>
          <div className="admin-grid">
            <article className="policy-panel"><div className="panel-heading"><div><p className="eyebrow">RECORDING &amp; PRIVACY</p><h2>Protected by policy</h2></div><ShieldCheck className="privacy-icon" size={20} /></div><div className="policy-row"><span><b>Recording notice</b><small>Automatic notice for external calls</small></span><button className="policy-control" onClick={() => setPolicies((current) => ({ ...current, recordingNotice: !current.recordingNotice }))}>{policies.recordingNotice ? 'Required' : 'Optional'}</button></div><div className="policy-row"><span><b>Transcript access</b><small>Owner, manager, and authorized QA only</small></span><button className="policy-control" onClick={() => setPolicies((current) => ({ ...current, transcriptScope: current.transcriptScope === 'Restricted' ? 'Team leads' : 'Restricted' }))}>{policies.transcriptScope}</button></div><div className="policy-row"><span><b>Retention</b><small>Sales calls archived after {policies.retentionDays} days</small></span><button className="policy-control" onClick={() => setPolicies((current) => ({ ...current, retentionDays: current.retentionDays === 90 ? 180 : current.retentionDays === 180 ? 365 : 90 }))}>{policies.retentionDays} days</button></div></article>
            <article className="policy-panel"><div className="panel-heading"><div><p className="eyebrow">WRAP-UP STANDARD</p><h2>One outcome, clearly named</h2></div><button className="quiet-button">Manage</button></div><div className="disposition-list"><span><Check size={15} />Connected <b>Required</b></span><span><Check size={15} />Business outcome <b>When connected</b></span><span><Check size={15} />Follow-up owner <b>When needed</b></span></div><p className="panel-caption">A call record is never duplicated by a correction or a provider retry.</p></article>
          </div>
          <div className="admin-grid secondary-admin">
            <article className="routing-panel"><div className="panel-heading"><div><p className="eyebrow">ROUTING TODAY</p><h2>Customer-aware routing</h2></div><span className="green-chip">Active</span></div><div className="route-flow">{(['Assigned owner', 'Skills match', 'Team overflow'] as const).map((route, index) => <Fragment key={route}><button className={policies.routingMode === route ? 'active-route' : ''} onClick={() => setPolicies((current) => ({ ...current, routingMode: route }))}>{route}</button>{index < 2 && <i></i>}</Fragment>)}</div><p className="panel-caption">Business hours, language, and customer priority are evaluated before overflow. Current first decision: {policies.routingMode}.</p></article>
            <article className={`sync-panel ${providerMode === 'Degraded' ? 'provider-alert' : ''}`}><div className="panel-heading"><div><p className="eyebrow">PROVIDER HEALTH · SIMULATED</p><h2>{providerMode === 'Operational' ? 'Everything is in sync' : 'A recoverable delay'}</h2></div><span className="sync-status"><i></i>{providerMode}</span></div><div className="sync-details"><span><b>Last event</b><small>{providerMode === 'Operational' ? '2 seconds ago' : '3 minutes ago'}</small></span><span><b>Queued retries</b><small>{providerMode === 'Operational' ? '0 calls' : '2 calls'}</small></span><span><b>Context service</b><small>{providerMode === 'Operational' ? 'Available' : 'Retrying'}</small></span></div><div className="provider-actions">{providerMode === 'Operational' ? <button className="text-button" onClick={() => setProviderMode('Degraded')}>Simulate delay <span>→</span></button> : <button className="call-button" onClick={recoverProvider}>Recover and reconcile</button>}</div></article>
          </div>
        </section>}

        {view === 'record' && <section className="record-workspace" aria-labelledby="record-title">
          <div className="record-nav"><button className="back-link" onClick={() => setView('workspace')}>Calls <span>/</span> {selectedContact.name}</button><button className="icon-button" aria-label="More record actions"><MoreHorizontal size={19} /></button></div>
          <section className="record-hero">
            <div className="record-identity"><div className="record-avatar">{selectedContact.initials}<span></span></div><div><p className="eyebrow">CONTACT · ACTIVE RELATIONSHIP</p><h1 id="record-title">{selectedContact.name}</h1><p>{selectedContact.title} <span className="dot">•</span> {selectedContact.company}</p></div></div>
            <div className="record-hero-actions"><button className="outline-button" onClick={() => setToast(`A follow-up email to ${selectedContact.name} is ready to personalize.`)}><Mail size={17} />Email</button><button className="outline-button" onClick={() => setView('workspace')}><Phone size={17} />Call</button><button className="call-button" onClick={() => setShowTaskComposer(true)}><Plus size={17} />Create</button></div>
          </section>
          <div className="record-summary"><div><span>RELATIONSHIP SIGNAL</span><strong>Aligned and moving</strong><p>The team is preparing for a Q3 launch conversation.</p></div><div><span>NEXT COMMITMENT</span><strong>Mutual NDA</strong><p>Due before Wednesday's planning session.</p></div><div><span>OWNER</span><strong>You</strong><p>Partnerships · West</p></div></div>
          <div className="record-layout">
            <article className="timeline-panel"><div className="timeline-heading"><div><p className="eyebrow">RELATIONSHIP TIMELINE</p><h2>Every signal, one story</h2></div><div className="timeline-tabs">{(['All', 'Calls', 'Notes'] as const).map((filter) => <button className={timelineFilter === filter ? 'active-tab' : ''} onClick={() => setTimelineFilter(filter)} key={filter}>{filter}</button>)}</div></div>
              {(timelineFilter === 'All' || timelineFilter === 'Calls') && <div className="timeline-event call-event"><span className="event-icon"><PhoneCall size={16} /></span><div><div className="event-topline"><strong>Outbound call completed</strong><small>Today · 09:31</small></div><p>{selectedContact.brief}</p><button className="event-link" onClick={() => setView('history')}>Open call record <span>→</span></button></div></div>}
              {(timelineFilter === 'All' || timelineFilter === 'Notes') && <div className="timeline-event note-event"><span className="event-icon"><FileText size={16} /></span><div><div className="event-topline"><strong>Relationship note</strong><small>Yesterday</small></div>{editingRelationshipNote ? <div className="inline-editor"><textarea value={relationshipNote} onChange={(event) => setRelationshipNote(event.target.value)} aria-label="Relationship note" /><div><button className="quiet-button" onClick={() => setEditingRelationshipNote(false)}>Cancel</button><button className="save-inline" onClick={() => { setEditingRelationshipNote(false); setToast('Relationship note updated.') }}>Save note</button></div></div> : <><p>{relationshipNote}</p><button className="event-link" onClick={() => setEditingRelationshipNote(true)}>Edit note</button></>}</div></div>}
              {(timelineFilter === 'All' || timelineFilter === 'Calls') && <div className="timeline-event email-event"><span className="event-icon"><Mail size={16} /></span><div><div className="event-topline"><strong>Follow-up email opened</strong><small>Monday · 4:18 PM</small></div><p>“Q3 launch alignment” was opened twice by Sofia.</p></div></div>}
            </article>
            <aside className="record-sidebar"><article className="commitment-card"><p className="eyebrow">NEXT BEST ACTION</p><h2>Keep the momentum</h2><p>Send the mutual NDA, then reserve a working session.</p><button className="call-button" onClick={() => setView('workspace')}><Phone size={17} />Call {selectedContact.name.split(' ')[0]}</button><button className="text-button" onClick={openScheduleForContact}>Draft follow-up <span>→</span></button></article><article className="task-card"><div className="task-card-heading"><div><p className="eyebrow">OPEN FOLLOW-THROUGH</p><h2>{contactTasks.length ? `${contactTasks.length} commitment${contactTasks.length > 1 ? 's' : ''}` : 'Clear for now'}</h2></div><button className="icon-button" onClick={() => setShowTaskComposer(true)} aria-label="Create follow-through"><Plus size={17} /></button></div>{contactTasks.length ? <div className="task-list">{contactTasks.map((task) => <div className="task-item" key={task.id}><button onClick={() => completeTask(task.id)} aria-label={`Complete ${task.title}`}><Check size={14} /></button><span><strong>{task.title}</strong><small>{task.due}</small></span></div>)}</div> : <p className="task-empty">No open commitments. Create one before the relationship loses momentum.</p>}</article><article className="details-card"><p className="eyebrow">CONTACT DETAILS</p><div><Phone size={15} /><span>{selectedContact.phone}<small>Direct</small></span></div><div><Mail size={15} /><span>{selectedContact.name.toLowerCase().replace(' ', '.')}@{selectedContact.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com<small>Work</small></span></div></article></aside>
          </div>
          {showTaskComposer && <div className="composer-backdrop" role="presentation" onMouseDown={() => setShowTaskComposer(false)}><section className="task-composer" role="dialog" aria-modal="true" aria-labelledby="task-title" onMouseDown={(event) => event.stopPropagation()}><div className="composer-heading"><div><p className="eyebrow">NEW FOLLOW-THROUGH</p><h2 id="task-title">Protect the commitment</h2></div><button className="icon-button" onClick={() => setShowTaskComposer(false)} aria-label="Close task composer">×</button></div><label>Next step<input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} autoFocus /></label><label>Due<input value={taskDue} onChange={(event) => setTaskDue(event.target.value)} /></label><div className="composer-actions"><button className="quiet-button" onClick={() => setShowTaskComposer(false)}>Cancel</button><button className="call-button" onClick={saveTask}><Check size={16} />Create follow-through</button></div></section></div>}
        </section>}
      </section>
      {showFinder && <div className="composer-backdrop finder-backdrop" role="presentation" onMouseDown={() => setShowFinder(false)}><section className="call-finder" role="dialog" aria-modal="true" aria-labelledby="finder-title" onMouseDown={(event) => event.stopPropagation()}><div className="finder-heading"><div><p className="eyebrow">CALL FINDER</p><h2 id="finder-title">What do you need to move?</h2></div><button className="icon-button" onClick={() => setShowFinder(false)} aria-label="Close Call Finder">×</button></div><label className="finder-input"><Search size={18} /><input value={finderQuery} onChange={(event) => setFinderQuery(event.target.value)} placeholder="Try “voicemail”, “no answer”, or a contact name" autoFocus /></label><div className="finder-results">{finderResults.length ? finderResults.map((intent) => <button className="finder-result" key={intent.label} onClick={() => openFinderIntent(intent.filter)}><span className="finder-result-icon">{intent.filter === 'Voicemails' ? <PhoneOff size={16} /> : intent.filter === 'Uncontacted' ? <UsersRound size={16} /> : intent.filter === 'Softphone' ? <Headphones size={16} /> : <PhoneCall size={16} />}</span><span><strong>{intent.label}</strong><small>{intent.detail}</small></span><span>Open</span></button>) : <div className="finder-empty"><Sparkles size={19} /><strong>No matching call view</strong><span>Try voicemail, softphone, no answer, or follow-up.</span></div>}</div><p className="finder-footnote">Every view is powered by the same canonical call activity, so a filter never loses relationship context.</p></section></div>}
      {toast && <div className="toast" role="status"><Check size={16} /><span>{toast}</span><button onClick={() => setToast('')} aria-label="Dismiss notification">×</button></div>}
    </main>
  )
}

export default App
