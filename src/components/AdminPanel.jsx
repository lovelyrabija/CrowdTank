import { useState } from "react";

export default function AdminPanel({ onAction, busy }) {
  const [address, setAddress] = useState("");

  return (
    <section className="panel">
      <h2>Admin: manage creators</h2>
      <input placeholder="Wallet address (0x...)" value={address}
        onChange={(e) => setAddress(e.target.value.trim())} />
      <div className="row">
        <button disabled={busy || !address}
          onClick={() => onAction("Adding creator", (c) => c.addCreator(address))}
        >Add creator</button>
        <button className="light" disabled={busy || !address}
          onClick={() => onAction("Removing creator", (c) => c.removeCreator(address))}
        >Remove creator</button>
      </div>
    </section>
  );
}
