import { useState } from "react";
import { parseEther } from "ethers";

export default function CreateProject({ onCreate, busy }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [minutes, setMinutes] = useState("");

  const ready = name && description && goal && minutes;

  async function submit() {
    await onCreate("Creating project", (c) =>
      c.createProject(name, description, parseEther(goal), BigInt(Math.floor(Number(minutes) * 60)))
    );
    setName(""); setDescription(""); setGoal(""); setMinutes("");
  }

  return (
    <section className="panel">
      <h2>Create a project</h2>
      <input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea placeholder="What are you building?" value={description}
        onChange={(e) => setDescription(e.target.value)} />
      <div className="row">
        <input type="number" step="0.001" min="0" placeholder="Goal (ETH)"
          value={goal} onChange={(e) => setGoal(e.target.value)} />
        <input type="number" min="1" placeholder="Duration (minutes)"
          value={minutes} onChange={(e) => setMinutes(e.target.value)} />
      </div>
      <button disabled={busy || !ready} onClick={submit}>Create project</button>
    </section>
  );
}
