export default function DesignRationale() {
  return (
    <div className="dr-root">
      <div className="dr-container">
        <div className="dr-badge">Module 4 · Leading from the Side</div>
        <h1>Conflict Resolution Simulator<br />Design Rationale</h1>
        <p className="dr-subtitle">CCA Leadership by Design · Johanna Huarachi</p>

        <h2>Purpose</h2>
        <p>
          Lateral leadership — influencing without authority — is the hardest leadership skill to
          practice because real conflicts only happen once. This simulator creates a safe space to
          rehearse decision points that design leaders face regularly, with immediate consequences
          and coaching. The goal is deliberate practice before the situation is live.
        </p>

        <h2>Frameworks Embedded</h2>
        <div className="dr-grid">
          <div className="dr-card">
            <strong>Five Conflict Styles</strong>
            <span>Fighter · Negotiator · Diplomat · Avoider · People Pleaser. Each choice is explicitly tagged so users recognize their default patterns.</span>
          </div>
          <div className="dr-card">
            <strong>AID Feedback Model</strong>
            <span>Action → Impact → Desired behavior. Woven into peer-feedback moments in the critique and intake-bypass scenarios.</span>
          </div>
          <div className="dr-card">
            <strong>SBI Feedback Model</strong>
            <span>Situation → Behavior → Impact. Used for upward/cross-functional feedback where observable specificity is key.</span>
          </div>
          <div className="dr-card">
            <strong>Radical Candor</strong>
            <span>Care personally + challenge directly. Appears at decision points where honesty without cruelty is the highest-scoring approach.</span>
          </div>
        </div>

        <h2>Scenarios and Why I Chose Them</h2>
        <table className="dr-table">
          <thead>
            <tr><th>Scenario</th><th>Core tension</th><th>Why it matters</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>The Deadline Crunch</strong></td>
              <td>PM wants to skip user research</td>
              <td>The most common design-PM conflict. Teaches interest-based negotiation: what does the PM actually need vs. what they're asking for?</td>
            </tr>
            <tr>
              <td><strong>The Public Disagreement</strong></td>
              <td>Peer challenges you in a critique</td>
              <td>Public conflict activates self-protection instincts. Teaches venue management and peer feedback using AID.</td>
            </tr>
            <tr>
              <td><strong>The Accessibility Cut</strong></td>
              <td>Engineering defers a11y scope</td>
              <td>A values conflict (equity vs. speed) plus a recurring pattern problem. Tests holding a principled line skillfully using SBI and Radical Candor.</td>
            </tr>
            <tr>
              <td><strong>The Intake Bypass</strong></td>
              <td>VP goes directly to designer</td>
              <td>Tests protecting your team first, then addressing the VP with process framed as quality, not gatekeeping.</td>
            </tr>
          </tbody>
        </table>

        <h2>Design Decisions</h2>
        <ul>
          <li><strong>Framework labels are visible on every choice</strong> — so players learn to recognize styles as they choose, not just in hindsight.</li>
          <li><strong>Consequences precede coaching</strong> — players see what happened before they get the analysis, mirroring how real life works.</li>
          <li><strong>Multiple decision points per scenario</strong> — some scenarios chain into a second decision, reinforcing that leadership situations rarely end with one choice.</li>
          <li><strong>No "right answer" gating</strong> — players can explore every branch. The simulator rewards curiosity, not just the optimal path.</li>
          <li><strong>Scores shown as effectiveness, not grades</strong> — "Highly effective" or "Mixed outcome" rather than pass/fail, reflecting the course's context-first framing.</li>
        </ul>

        <h2>What I'd Add with More Time</h2>
        <ul>
          <li>A personal debrief: which conflict style did the player use most, and what does that pattern suggest?</li>
          <li>A "replay with hindsight" mode that shows all options simultaneously after completion.</li>
          <li>A scenario for managing up — navigating when your own manager is the source of unclear direction.</li>
        </ul>

        <footer className="dr-footer">Leadership by Design · CCA · Johanna Huarachi · 2026</footer>
      </div>
    </div>
  )
}
