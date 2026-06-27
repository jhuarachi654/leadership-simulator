import { useState } from 'react'
import './ConflictSimulator.css'

const SCENARIOS = [
  {
    id: 'pm-deadline',
    title: 'The Deadline Crunch',
    tag: 'PM vs Design Process',
    tagColor: '#f59e0b',
    description: 'Your PM just messaged you: "We need to cut the discovery phase to ship by Friday. Can you just go straight to mockups?" The research you planned would take two weeks — but you believe skipping it risks building the wrong thing.',
    steps: [
      {
        id: 'initial',
        prompt: 'How do you respond to the PM\'s message?',
        choices: [
          {
            label: 'Fighter: Push back hard',
            style: 'fighter',
            text: '"No. Skipping research is how we build the wrong product. I\'m not cutting corners on this."',
            outcome: 'The PM feels dismissed and escalates to your manager. You get the time — but the relationship is damaged and future collaboration suffers.',
            coaching: 'The Fighter style can win battles but lose wars. Your point was valid, but the delivery triggered defensiveness rather than a conversation. Being right isn\'t enough when you need buy-in.',
            framework: 'Conflict Style: Fighter',
            score: 2,
            next: 'reflect'
          },
          {
            label: 'Avoider: Agree and move on',
            style: 'avoider',
            text: '"Sure, I can skip research and go straight to mockups."',
            outcome: 'You ship fast — but three sprints later, usability testing reveals the feature doesn\'t match how users actually work. The team has to rework it, costing more time than the research would have.',
            coaching: 'Avoidance feels safe in the moment but defers the cost. When the stakes are high (user impact, wasted eng effort), staying silent isn\'t neutral — it\'s a choice with consequences.',
            framework: 'Conflict Style: Avoider',
            score: 1,
            next: 'reflect'
          },
          {
            label: 'Negotiator: Propose a trade',
            style: 'negotiator',
            text: '"I hear you on the timeline. What if I do a 2-day lean research sprint — 5 user interviews — instead of two weeks? We reduce risk without blowing the deadline."',
            outcome: 'PM agrees. You learn two critical insights that change the direction of one key feature. The team ships on time with higher confidence.',
            coaching: 'The Negotiator finds what both parties actually need underneath their stated positions. The PM needed speed; you needed signal. A compressed research sprint served both. This is interest-based negotiation in action.',
            framework: 'Conflict Style: Negotiator',
            score: 5,
            next: 'followup'
          },
          {
            label: 'Diplomat: Reframe around shared risk',
            style: 'diplomat',
            text: '"I want to help us hit Friday. Can we spend 10 minutes looking at what we don\'t know yet? I want to make sure we\'re aligned on the risk we\'re taking if we skip research."',
            outcome: 'The conversation surfaces that neither of you knows how users currently handle this workflow. The PM agrees to a one-day research sprint.',
            coaching: 'The Diplomat doesn\'t argue positions — they make the underlying risk visible to both parties. Asking "what don\'t we know?" is a powerful question that shifts the conversation from conflict to collaboration.',
            framework: 'Conflict Style: Diplomat',
            score: 5,
            next: 'followup'
          },
          {
            label: 'People Pleaser: Agree but over-promise',
            style: 'pleaser',
            text: '"Of course! I\'ll do research AND mockups by Friday, no worries."',
            outcome: 'You burn out trying to do both. The mockups are rushed and the research is superficial. Neither deliverable is good. The PM is confused about why quality dropped.',
            coaching: 'People pleasers protect the relationship in the short term but erode trust over time when promises can\'t be kept. Saying yes to everything isn\'t leadership — it\'s conflict avoidance dressed up as enthusiasm.',
            framework: 'Conflict Style: People Pleaser',
            score: 1,
            next: 'reflect'
          }
        ]
      },
      {
        id: 'followup',
        prompt: 'Great — the PM agreed to a short research sprint. Now they\'re asking you to present findings in the all-hands on Friday. You have 30 slides but only 5 minutes.',
        choices: [
          {
            label: 'Radical Candor: Be direct with care',
            style: 'negotiator',
            text: '"I appreciate the invite. Five minutes isn\'t enough to do these findings justice — I don\'t want to rush something the whole team will rely on. Can I get 15, or present the top 3 insights only?"',
            outcome: 'PM gives you 12 minutes. You present 4 crisp insights. Eng lead flags one they hadn\'t considered — it shapes the sprint.',
            coaching: 'Radical Candor means caring enough about the outcome to be honest about constraints. You\'re not being difficult — you\'re protecting quality. Naming the tradeoff explicitly ("I don\'t want to rush something the team will rely on") shows you\'re thinking about them, not just yourself.',
            framework: 'Radical Candor',
            score: 5,
            next: null
          },
          {
            label: 'SBI Feedback: Name the situation clearly',
            style: 'diplomat',
            text: '"In situations where research is compressed (S), presenting 30 slides in 5 minutes leads to surface-level takeaways (B), which could give the team false confidence going into the sprint (I). Can we restructure the slot?"',
            outcome: 'The PM hadn\'t thought about the downstream effect on the team\'s confidence. They move your slot to Monday for a proper 20-minute session.',
            coaching: 'SBI (Situation-Behavior-Impact) is powerful because it\'s observable and non-personal. You\'re not saying "this is a bad plan" — you\'re helping the PM see cause and effect. That\'s advocacy without accusation.',
            framework: 'SBI Model',
            score: 5,
            next: null
          }
        ]
      },
      {
        id: 'reflect',
        prompt: 'After the conversation, your relationship with the PM feels strained. How do you follow up?',
        choices: [
          {
            label: 'AID Feedback: Address the pattern',
            style: 'negotiator',
            text: 'Schedule a 1:1. "When decisions about design process get made in Slack without looping me in first (A), I feel like I\'m playing catch-up (I). Going forward, can we set up a quick sync before scope changes? (D)"',
            outcome: 'PM didn\'t realize the impact of their communication style. You agree on a weekly 15-min sync. Future scope changes get flagged earlier.',
            coaching: 'AID (Action-Impact-Desired) gives feedback that\'s specific, observable, and forward-looking. It\'s not about blaming the PM for what happened — it\'s about creating a better system. This is lateral leadership at its best.',
            framework: 'AID Feedback Model',
            score: 5,
            next: null
          },
          {
            label: 'Let it go and move on',
            style: 'avoider',
            text: 'Don\'t bring it up. Just do the work and hope things improve.',
            outcome: 'The pattern repeats in the next sprint. The same tension surfaces again, now with more history behind it.',
            coaching: 'Letting small things slide is sometimes wise — but when the same issue recurs, silence becomes enabling. Peer feedback is a skill; the sooner you practice it, the easier it gets.',
            framework: 'Conflict Style: Avoider',
            score: 2,
            next: null
          }
        ]
      }
    ]
  },

  {
    id: 'critique-conflict',
    title: 'The Public Disagreement',
    tag: 'Peer Designer Conflict',
    tagColor: '#8b5cf6',
    description: 'You\'re leading a design critique with your team and two senior stakeholders. Your peer designer, Marcus, interrupts your presentation: "This direction is completely off. We talked about this last week and you\'re ignoring what we agreed on." The room goes quiet.',
    steps: [
      {
        id: 'initial',
        prompt: 'You\'re on the spot in front of stakeholders. What do you do right now?',
        choices: [
          {
            label: 'Fighter: Defend your work publicly',
            style: 'fighter',
            text: '"That\'s not what I remember from that conversation. I made the decisions I made for good reasons and I stand by them."',
            outcome: 'The room gets uncomfortable. Stakeholders disengage. Even if you\'re right, the public argument makes both of you look unprofessional.',
            coaching: 'Public fights rarely produce clarity — they produce winners and losers. Even when you\'re factually correct, defending yourself aggressively in front of stakeholders shifts attention from the work to the conflict.',
            framework: 'Conflict Style: Fighter',
            score: 1,
            next: 'private'
          },
          {
            label: 'Diplomat: Acknowledge and defer',
            style: 'diplomat',
            text: '"Marcus, thank you — I want to make sure we address your concern properly. Can we park this and connect after the session so I understand exactly what you\'re referring to?"',
            outcome: 'The session continues productively. Marcus is slightly frustrated but agrees. You both have a private conversation afterward where the actual disagreement surfaces.',
            coaching: 'Deflecting a public confrontation to a private one isn\'t avoidance — it\'s venue management. Public critiques rarely resolve disputes; they just escalate them. You protect both the relationship and the stakeholders\' time.',
            framework: 'Conflict Style: Diplomat',
            score: 5,
            next: 'private'
          },
          {
            label: 'Avoider: Gloss over it',
            style: 'avoider',
            text: '"Let\'s come back to that — anyway, the next screen shows..."',
            outcome: 'The stakeholders notice you ignored the concern. Marcus brings it up again, louder. The session derails anyway, but now it looks like you were hiding something.',
            coaching: 'You can\'t ignore a direct challenge in a room full of people — silence reads as guilt or weakness. A brief acknowledgment buys you the time to handle it properly.',
            framework: 'Conflict Style: Avoider',
            score: 1,
            next: 'private'
          },
          {
            label: 'Curious: Ask a clarifying question',
            style: 'negotiator',
            text: '"Marcus, I want to understand your concern. Can you point to the specific thing that feels off so we can look at it together?"',
            outcome: 'Marcus points to one specific pattern. It turns out there was a miscommunication — he thought you agreed to a different navigation model. The stakeholders see two designers working through a real problem together.',
            coaching: 'Curiosity disarms conflict. When you ask a question instead of defending a position, you create space for understanding. Sometimes what looks like disagreement is just misalignment — and a good question can surface that in seconds.',
            framework: 'Radical Candor: Seek to Understand',
            score: 5,
            next: 'private'
          }
        ]
      },
      {
        id: 'private',
        prompt: 'After the session, you and Marcus sit down. He says he felt blindsided — he thought the last meeting locked in a different direction. How do you handle it?',
        choices: [
          {
            label: 'AID: Give peer feedback directly',
            style: 'negotiator',
            text: '"I want to address two things: first, let\'s figure out what happened with the direction. Second — when you called out the work publicly in front of stakeholders (A), it made it hard for me to respond thoughtfully and put us both in an awkward position (I). Next time, can you flag concerns to me before a session? (D)"',
            outcome: 'Marcus is initially defensive, then admits he was frustrated from a different project and let it spill over. You agree on a pre-critique check-in process.',
            coaching: 'AID feedback works here because it separates two issues: the content disagreement (direction) and the process problem (public challenge). Addressing both — calmly and specifically — is what peer leadership looks like.',
            framework: 'AID Feedback Model',
            score: 5,
            next: null
          },
          {
            label: 'Just focus on the content disagreement',
            style: 'avoider',
            text: '"OK so what specifically did you think we agreed on? Let me pull up the notes."',
            outcome: 'You resolve the content issue but never address the public challenge. Marcus does it again in the next critique — this time with a client in the room.',
            coaching: 'Resolving the content is necessary but not sufficient. The process problem — how disagreements get surfaced — needs to be addressed too. Skipping the harder conversation means it will repeat.',
            framework: 'Conflict Style: Avoider',
            score: 2,
            next: null
          }
        ]
      }
    ]
  },

  {
    id: 'accessibility-scope',
    title: 'The Accessibility Cut',
    tag: 'Engineering Scope Conflict',
    tagColor: '#ef4444',
    description: 'Sprint planning is wrapping up when the engineering lead says: "We\'re going to defer the accessibility stories to v2. We need to hit the launch date and these are taking longer than estimated." This is the third sprint they\'ve been pushed back. The feature launches to 50,000 users.',
    steps: [
      {
        id: 'initial',
        prompt: 'The sprint planning meeting is almost over. How do you respond?',
        choices: [
          {
            label: 'Fighter: Draw a hard line',
            style: 'fighter',
            text: '"We can\'t launch without basic accessibility. This isn\'t optional — it\'s a legal requirement and an ethical one. I\'m not signing off on a launch that excludes users with disabilities."',
            outcome: 'The room respects the stance but the eng lead feels ambushed. Your manager pulls you aside and says you need to "work better with engineering." The stories get pushed again.',
            coaching: 'Being right about accessibility doesn\'t automatically win the argument — especially if you haven\'t built the relationship or established shared understanding of why it matters. The Fighter approach can backfire when the other person feels cornered.',
            framework: 'Conflict Style: Fighter',
            score: 3,
            next: 'negotiate'
          },
          {
            label: 'SBI: Name the pattern and impact',
            style: 'diplomat',
            text: '"This is the third sprint these stories have been pushed (S). When a11y work keeps getting deferred (B), we risk launching something that legally excludes users with disabilities and triggers a compliance issue for the company (I). Can we talk about what\'s making these stories harder than expected?"',
            outcome: 'The eng lead explains the stories weren\'t scoped well initially — they\'re harder than estimated. You agree to re-scope two of the three into the sprint with clearer acceptance criteria.',
            coaching: 'SBI makes the pattern visible without blame. By naming it three times and connecting it to real risk — legal, ethical, user — you shift from a design preference to a business problem. That changes the conversation.',
            framework: 'SBI Model',
            score: 5,
            next: 'negotiate'
          },
          {
            label: 'Negotiator: Find the minimum viable a11y',
            style: 'negotiator',
            text: '"I hear the timeline pressure. What if we identify the 2 highest-impact a11y fixes — keyboard navigation and alt text — and ship those now? We document the rest as known debt with a committed timeline."',
            outcome: 'Eng lead agrees. You ship with the highest-impact fixes and a written commitment to close the rest within 4 weeks. Users with screen readers can navigate the core flow.',
            coaching: 'When you can\'t get everything, get the most important things plus a documented commitment. "Known debt with a timeline" is different from "v2 maybe someday." You protected users without blowing the launch.',
            framework: 'Conflict Style: Negotiator',
            score: 5,
            next: null
          },
          {
            label: 'People Pleaser: Agree to defer',
            style: 'pleaser',
            text: '"OK, I understand. Let\'s revisit in v2."',
            outcome: 'v2 never has a committed scope for a11y. The pattern continues for two more releases. A disability advocacy org publicly criticizes the product a year later.',
            coaching: 'People-pleasing on accessibility isn\'t kindness — it\'s complicity. Some issues require holding the line. The key is learning how to hold it skillfully, not whether to hold it at all.',
            framework: 'Conflict Style: People Pleaser',
            score: 1,
            next: null
          }
        ]
      },
      {
        id: 'negotiate',
        prompt: 'The eng lead says the stories are poorly scoped and he needs clearer requirements. How do you respond?',
        choices: [
          {
            label: 'Radical Candor: Own your part',
            style: 'negotiator',
            text: '"That\'s fair feedback — I should have partnered with you earlier on scoping these. Let\'s do a 30-minute working session this week. I\'ll bring the WCAG criteria and you can tell me what\'s technically ambiguous."',
            outcome: 'The working session surfaces that three stories could be merged into one. The scoped stories get pulled into the sprint and ship.',
            coaching: 'Radical Candor means being able to receive feedback, not just give it. When you own your part of a problem, you disarm the other person\'s defensiveness and model the kind of honesty you want from them.',
            framework: 'Radical Candor',
            score: 5,
            next: null
          },
          {
            label: 'Defend the original scoping',
            style: 'fighter',
            text: '"The stories were clear. Accessibility requirements are standard — the team should know them."',
            outcome: 'The eng lead shuts down. The relationship gets worse. Stories stay out of the sprint.',
            coaching: 'When someone tells you the requirements weren\'t clear to them, arguing that they should have been doesn\'t help. Even if you\'re right, the problem still exists. Winning the argument doesn\'t solve the problem.',
            framework: 'Conflict Style: Fighter',
            score: 1,
            next: null
          }
        ]
      }
    ]
  },

  {
    id: 'stakeholder-bypass',
    title: 'The Intake Bypass',
    tag: 'Stakeholder Management',
    tagColor: '#10b981',
    description: 'You come back from lunch to find a Slack message from your designer, Priya: "Hey — the VP of Marketing just asked me directly to design a new landing page. She said it\'s urgent and to skip the intake form. She wants a draft by Thursday." No ticket. No brief. No stakeholder alignment.',
    steps: [
      {
        id: 'initial',
        prompt: 'You need to respond to Priya and to the VP. What do you do first?',
        choices: [
          {
            label: 'Support Priya first, then address the VP',
            style: 'diplomat',
            text: 'Message Priya: "Thanks for the heads up. Don\'t start anything yet — I\'ll reach out to the VP directly and get us aligned on process. I\'ve got you."',
            outcome: 'Priya feels protected. You set the tone that process exists to protect the team, not just create bureaucracy.',
            coaching: 'When someone on your team gets directly tasked by a senior stakeholder, they\'re in an impossible position. Your first job is to take it off their plate — not to manage the VP, but to remove the ambiguity for your designer.',
            framework: 'Leading from the Side: Protecting Your Team',
            score: 5,
            next: 'vp'
          },
          {
            label: 'Tell Priya to just do it',
            style: 'pleaser',
            text: '"A VP asked — you should probably just do it. We\'ll sort out the process later."',
            outcome: 'Priya does the work. The VP gives more feedback directly. Your intake process is now openly optional. Other stakeholders notice and start bypassing it too.',
            coaching: 'When you let a VP bypass process once, you\'ve just established that your process only applies to people without power. The intake system breaks down. This is a short-term yes with long-term structural cost.',
            framework: 'Conflict Style: People Pleaser',
            score: 1,
            next: null
          },
          {
            label: 'Contact the VP directly without telling Priya',
            style: 'fighter',
            text: 'DM the VP: "I heard you reached out to Priya directly. Our team has an intake process for a reason — we need a brief and proper prioritization before any work starts."',
            outcome: 'The VP feels called out and responds defensively. Priya finds out and feels like you didn\'t trust her to handle it.',
            coaching: 'Jumping to the VP without coordinating with Priya can feel like going behind her back — even if your intentions are right. When someone on your team is in the middle of a situation, loop them in before acting.',
            framework: 'Conflict Style: Fighter',
            score: 2,
            next: 'vp'
          }
        ]
      },
      {
        id: 'vp',
        prompt: 'Now you reach out to the VP. She\'s friendly but clearly expects the work to start now. How do you frame the conversation?',
        choices: [
          {
            label: 'Diplomat: Name the intent behind the process',
            style: 'diplomat',
            text: '"I\'d love to get this moving — landing pages are high-visibility and I want to make sure we nail it. Our intake process exists so we don\'t waste a cycle on the wrong direction. Can we do a quick 20-min sync this week? I\'ll come with the brief template and we can fill it in together."',
            outcome: 'The VP appreciates that you\'re focused on quality, not gatekeeping. She makes 20 minutes. The brief surfaces that she actually wants a refresh, not a net-new page — saving Priya two days of work.',
            coaching: 'Framing process as serving quality — not as a rule you\'re enforcing — changes how stakeholders experience it. You\'re not saying no to her request. You\'re saying yes to getting it right.',
            framework: 'Conflict Style: Diplomat',
            score: 5,
            next: null
          },
          {
            label: 'Radical Candor: Be direct about the impact',
            style: 'negotiator',
            text: '"I want to be straight with you: when requests come directly to designers without a brief, we\'ve found the work tends to get reworked more, not less. I know that\'s not what you want for something this urgent. Can we spend 20 minutes making sure Priya has what she needs to get it right the first time?"',
            outcome: 'The VP pauses — she hadn\'t thought of it as increasing rework. She schedules a sync and becomes one of the more diligent brief-fillers on the team.',
            coaching: 'Connecting the process problem to the VP\'s own interests (less rework, faster turnaround) makes it concrete. You\'re not defending your team\'s workflow — you\'re helping her get what she actually wants.',
            framework: 'Radical Candor',
            score: 5,
            next: null
          },
          {
            label: 'AID: Address the behavior pattern',
            style: 'fighter',
            text: '"When senior leaders reach out to individual designers directly and ask them to skip intake (A), it puts them in a position where they feel they can\'t say no (I). I\'d love to make sure that doesn\'t happen going forward — can we agree that requests come through me or the intake form? (D)"',
            outcome: 'The VP acknowledges it and agrees. She also connects you with two other VPs who\'ve been doing the same thing — you end up presenting the intake process to the leadership team.',
            coaching: 'AID works here because it\'s not personal — you\'re naming a structural pattern, not blaming the VP. And by asking for a clear agreement (D), you get something actionable rather than vague understanding.',
            framework: 'AID Feedback Model',
            score: 5,
            next: null
          }
        ]
      }
    ]
  }
]

const STYLE_META = {
  fighter: { label: 'Fighter', color: '#ef4444', bg: '#fef2f2' },
  avoider: { label: 'Avoider', color: '#6b7280', bg: '#f9fafb' },
  negotiator: { label: 'Negotiator', color: '#2563eb', bg: '#eff6ff' },
  diplomat: { label: 'Diplomat', color: '#10b981', bg: '#f0fdf4' },
  pleaser: { label: 'People Pleaser', color: '#f59e0b', bg: '#fffbeb' },
}

const SCORE_LABEL = {
  1: { text: 'Low effectiveness', color: '#ef4444' },
  2: { text: 'Mixed outcome', color: '#f59e0b' },
  3: { text: 'Situationally effective', color: '#f59e0b' },
  4: { text: 'Effective', color: '#10b981' },
  5: { text: 'Highly effective', color: '#10b981' },
}

function ScenarioCard({ scenario, onSelect }) {
  return (
    <button className="cs-scenario-card" onClick={() => onSelect(scenario)}>
      <span className="cs-scenario-tag" style={{ background: scenario.tagColor + '20', color: scenario.tagColor }}>
        {scenario.tag}
      </span>
      <h3>{scenario.title}</h3>
      <p>{scenario.description.slice(0, 120)}…</p>
      <span className="cs-start-btn">Start scenario →</span>
    </button>
  )
}

function ChoiceButton({ choice, onSelect, disabled }) {
  const meta = STYLE_META[choice.style] || STYLE_META.negotiator
  return (
    <button
      className="cs-choice-btn"
      style={{ '--choice-color': meta.color, '--choice-bg': meta.bg }}
      onClick={() => onSelect(choice)}
      disabled={disabled}
    >
      <span className="cs-choice-style-tag">{meta.label}</span>
      <span className="cs-choice-text">{choice.label.replace(/^[^:]+:\s*/, '')}</span>
      <span className="cs-choice-quote">"{choice.text}"</span>
    </button>
  )
}

function ResultCard({ choice, onNext, onRestart, hasNext }) {
  const meta = STYLE_META[choice.style] || STYLE_META.negotiator
  const score = SCORE_LABEL[choice.score] || SCORE_LABEL[3]

  return (
    <div className="cs-result-card" style={{ '--choice-color': meta.color }}>
      <div className="cs-result-header">
        <span className="cs-result-style" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
        <span className="cs-result-score" style={{ color: score.color }}>● {score.text}</span>
      </div>

      <div className="cs-result-section">
        <h4>What happens</h4>
        <p>{choice.outcome}</p>
      </div>

      <div className="cs-result-section cs-coaching">
        <h4>Coaching note</h4>
        <p>{choice.coaching}</p>
        <span className="cs-framework-tag">{choice.framework}</span>
      </div>

      <div className="cs-result-actions">
        {hasNext && (
          <button className="cs-btn-primary" onClick={onNext}>
            Continue scenario →
          </button>
        )}
        <button className="cs-btn-secondary" onClick={onRestart}>
          Try a different choice
        </button>
      </div>
    </div>
  )
}

export default function ConflictSimulator() {
  const [activeScenario, setActiveScenario] = useState(null)
  const [stepId, setStepId] = useState(null)
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [completedScenarios, setCompletedScenarios] = useState(new Set())

  const startScenario = (scenario) => {
    setActiveScenario(scenario)
    setStepId(scenario.steps[0].id)
    setSelectedChoice(null)
  }

  const currentStep = activeScenario?.steps.find(s => s.id === stepId)

  const handleChoice = (choice) => {
    setSelectedChoice(choice)
  }

  const handleNext = () => {
    if (selectedChoice?.next) {
      setStepId(selectedChoice.next)
      setSelectedChoice(null)
    }
  }

  const handleRestart = () => {
    setSelectedChoice(null)
  }

  const handleBack = () => {
    if (selectedChoice) {
      setSelectedChoice(null)
    } else {
      if (activeScenario) {
        setCompletedScenarios(prev => new Set([...prev, activeScenario.id]))
      }
      setActiveScenario(null)
      setStepId(null)
      setSelectedChoice(null)
    }
  }

  const isDone = selectedChoice && !selectedChoice.next

  if (!activeScenario) {
    return (
      <div className="cs-root">
        <div className="cs-intro">
          <div className="cs-intro-badge">Module 4 · Lateral Leadership</div>
          <h1>Conflict Resolution Simulator</h1>
          <p className="cs-intro-desc">
            Practice navigating real workplace conflicts as a design leader — without the real stakes.
            Each scenario puts you in a high-pressure moment and shows you the consequences of different approaches,
            mapped to the frameworks from this course.
          </p>
          <div className="cs-framework-legend">
            {Object.entries(STYLE_META).map(([key, meta]) => (
              <span key={key} className="cs-legend-chip" style={{ background: meta.bg, color: meta.color }}>
                {meta.label}
              </span>
            ))}
            <span className="cs-legend-chip" style={{ background: '#f0f9ff', color: '#0284c7' }}>AID Model</span>
            <span className="cs-legend-chip" style={{ background: '#fdf4ff', color: '#9333ea' }}>SBI Model</span>
            <span className="cs-legend-chip" style={{ background: '#fff7ed', color: '#ea580c' }}>Radical Candor</span>
          </div>
        </div>

        <div className="cs-scenarios-grid">
          {SCENARIOS.map(s => (
            <ScenarioCard
              key={s.id}
              scenario={s}
              onSelect={startScenario}
            />
          ))}
        </div>

        {completedScenarios.size > 0 && (
          <p className="cs-progress">
            {completedScenarios.size} of {SCENARIOS.length} scenarios explored
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="cs-root">
      <div className="cs-scenario-header">
        <button className="cs-back-btn" onClick={handleBack}>← Back to scenarios</button>
        <div>
          <span className="cs-scenario-tag" style={{ background: activeScenario.tagColor + '20', color: activeScenario.tagColor }}>
            {activeScenario.tag}
          </span>
          <h2>{activeScenario.title}</h2>
        </div>
      </div>

      <div className="cs-scenario-body">
        <div className="cs-situation-box">
          <h4>The situation</h4>
          <p>{activeScenario.description}</p>
        </div>

        {currentStep && (
          <div className="cs-step">
            <div className="cs-step-prompt">
              <span className="cs-step-label">Decision point</span>
              <h3>{currentStep.prompt}</h3>
            </div>

            {!selectedChoice ? (
              <div className="cs-choices">
                {currentStep.choices.map((c, i) => (
                  <ChoiceButton
                    key={i}
                    choice={c}
                    onSelect={handleChoice}
                    disabled={!!selectedChoice}
                  />
                ))}
              </div>
            ) : (
              <ResultCard
                choice={selectedChoice}
                onNext={handleNext}
                onRestart={handleRestart}
                hasNext={!!selectedChoice.next}
              />
            )}
          </div>
        )}

        {isDone && (
          <div className="cs-completion">
            <h3>Scenario complete</h3>
            <p>Every situation calls for a different approach — the goal isn't to always pick the same style, but to recognize what the moment needs.</p>
            <button className="cs-btn-primary" onClick={handleBack}>Try another scenario</button>
          </div>
        )}
      </div>
    </div>
  )
}
