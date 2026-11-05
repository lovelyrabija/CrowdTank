import { useState } from "react";
import { formatEther, parseEther } from "ethers";

export default function ProjectCard({ project: p, account, onAction, busy }) {
  const [amount, setAmount] = useState("");

  const now = Math.floor(Date.now() / 1000);
  const ended = now >= p.deadline;
  const percent = p.goal > 0n ? Number((p.raised * 100n) / p.goal) : 0;
  const isCreator = p.creator.toLowerCase() === account.toLowerCase();
  const hasContribution = p.mine > 0n;

  let label = "Active";
  if (p.successful) label = "Successful";
  else if (p.failed) label = "Failed";
  else if (ended) label = "Ended";

  const timeLeft = () => {
    const s = p.deadline - now;
    if (s <= 0) return "Deadline passed";
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return d > 0 ? `${d}d ${h}h left` : `${h}h ${m}m left`;
  };

  return (
    <article className="card">
      <div className="card-head">
        <h3>{p.name}</h3>
        <span className={"tag " + label.toLowerCase()}>{label}</span>
      </div>
      <p className="desc">{p.description}</p>

      <div className="bar"><div style={{ width: Math.min(percent, 100) + "%" }} /></div>
      <p className="small">
        {formatEther(p.raised)} / {formatEther(p.goal)} ETH ({percent}%) · {timeLeft()}
      </p>
      {hasContribution && <p className="small">Your contribution: {formatEther(p.mine)} ETH</p>}

      <div className="actions">
        {/* Active: fund or withdraw */}
        {!p.successful && !p.failed && !ended && (
          <>
            <input
              type="number" step="0.001" min="0" placeholder="ETH amount"
              value={amount} onChange={(e) => setAmount(e.target.value)}
            />
            <button
              disabled={busy || !amount}
              onClick={() =>
                onAction("Funding", (c) => c.fundProject(p.id, { value: parseEther(amount) }))
              }
            >Fund</button>
            {hasContribution && (
              <button className="light" disabled={busy}
                onClick={() => onAction("Withdrawing", (c) => c.withdrawContribution(p.id))}
              >Withdraw</button>
            )}
          </>
        )}

        {/* Deadline passed and goal not reached: anyone can mark as failed */}
        {!p.successful && !p.failed && ended && (
          <button disabled={busy}
            onClick={() => onAction("Marking as failed", (c) => c.markProjectAsFailed(p.id))}
          >Mark as failed</button>
        )}

        {/* Failed: contributors get a refund */}
        {p.failed && hasContribution && (
          <button disabled={busy}
            onClick={() => onAction("Refunding", (c) => c.refundFailedProject(p.id))}
          >Claim refund</button>
        )}

        {/* Successful: creator claims funds after the deadline */}
        {p.successful && isCreator && !p.claimed && (
          ended ? (
            <button disabled={busy}
              onClick={() => onAction("Claiming funds", (c) => c.claimSuccessfulFunds(p.id))}
            >Claim funds</button>
          ) : (
            <span className="small">You can claim funds after the deadline.</span>
          )
        )}
        {p.claimed && <span className="small">Funds claimed by creator.</span>}
      </div>

      <p className="small creator">Creator: {p.creator.slice(0, 6)}...{p.creator.slice(-4)}</p>
    </article>
  );
}
