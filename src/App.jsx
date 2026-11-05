import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { ABI, CONTRACT_ADDRESS, SEPOLIA_CHAIN_ID } from "./contract.js";
import ProjectCard from "./components/ProjectCard.jsx";
import CreateProject from "./components/CreateProject.jsx";
import AdminPanel from "./components/AdminPanel.jsx";

const short = (a) => a.slice(0, 6) + "..." + a.slice(-4);

export default function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, successful: 0, failed: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [status, setStatus] = useState(""); // info message
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Read everything we need from the contract
  async function loadData(c, user) {
    const total = Number(await c.totalProjects());
    const [t, s, f] = await c.getPlatformStats();
    setStats({ total: Number(t), successful: Number(s), failed: Number(f) });

    const list = [];
    for (let i = total; i >= 1; i--) {
      const p = await c.projects(i);
      const mine = await c.getUserContribution(i, user);
      list.push({
        id: Number(p.id),
        name: p.name,
        description: p.description,
        goal: p.goal,
        raised: p.raised,
        deadline: Number(p.deadline),
        creator: p.creator,
        successful: p.successful,
        failed: p.failed,
        claimed: p.claimed,
        mine,
      });
    }
    setProjects(list);

    const adminAddr = await c.admin();
    setIsAdmin(adminAddr.toLowerCase() === user.toLowerCase());
    setIsCreator(await c.approvedCreators(user));
  }

  async function connectWallet() {
    setError("");
    if (!window.ethereum) {
      setError("MetaMask not found. Please install the MetaMask extension.");
      return;
    }
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== SEPOLIA_CHAIN_ID) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      }
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const user = await signer.getAddress();
      const c = new Contract(CONTRACT_ADDRESS, ABI, signer);
      setAccount(user);
      setContract(c);
      await loadData(c, user);
    } catch (e) {
      setError(readError(e));
    }
  }

  // Runs any transaction, waits for it, then refreshes the data
  async function sendTx(label, action) {
    setError("");
    setStatus(label + "... confirm in MetaMask");
    setBusy(true);
    try {
      const tx = await action(contract);
      setStatus("Waiting for confirmation...");
      await tx.wait();
      setStatus(label + " done");
      await loadData(contract, account);
    } catch (e) {
      setStatus("");
      setError(readError(e));
    }
    setBusy(false);
  }

  return (
    <div className="page">
      <header className="top">
        <div>
          <h1>CrowdTank</h1>
          <p>Fund ideas on Sepolia. Get refunds if they fall short.</p>
        </div>
        {account ? (
          <span className="wallet">{short(account)}{isAdmin ? " (admin)" : ""}</span>
        ) : (
          <button onClick={connectWallet}>Connect MetaMask</button>
        )}
      </header>

      {error && <div className="msg error">{error}</div>}
      {status && !error && <div className="msg">{status}</div>}

      {!account ? (
        <p className="empty">Connect your wallet to see projects.</p>
      ) : (
        <>
          <section className="stats">
            <div><b>{stats.total}</b> projects</div>
            <div><b>{stats.successful}</b> successful</div>
            <div><b>{stats.failed}</b> failed</div>
          </section>

          {isCreator && <CreateProject onCreate={sendTx} busy={busy} />}
          {isAdmin && <AdminPanel onAction={sendTx} busy={busy} />}

          <h2>Projects</h2>
          {projects.length === 0 && <p className="empty">No projects yet.</p>}
          <div className="grid">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} account={account} onAction={sendTx} busy={busy} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function readError(e) {
  if (e.code === "ACTION_REJECTED" || e.code === 4001) return "You rejected the request in MetaMask.";
  return e.reason || e.shortMessage || e.message || "Something went wrong.";
}
