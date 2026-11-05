# CrowdTank - Blockchain Crowdfunding DApp

React + Vite + ethers.js v6 frontend for the CrowdTank smart contract on Ethereum Sepolia.

## Setup
1. Install Node.js 18+ and the MetaMask browser extension.
2. Get Sepolia test ETH from a faucet.
3. In this folder run:
   ```
   npm install
   npm run dev
   ```
4. Open http://localhost:5173 and click **Connect MetaMask**.

## Contract
- Address: `0x48BA24A96B2f1C0D7CA4c8F75055d7b8c2FE73f2` (Sepolia)
- Admin: `0x06Bce163b83BfeF9C8E655FA0549DED10516b536`
- Settings and ABI live in `src/contract.js`.

## Features
- Connect MetaMask (auto-switches to Sepolia)
- Platform stats and all projects with progress bars
- Fund a project, withdraw before the deadline
- Mark a project as failed after the deadline, then refund contributors
- Creator claims funds after a successful project's deadline
- Approved creators can create projects; admin can add/remove creators

## Structure
```
src/
  main.jsx            entry point
  App.jsx             wallet connection, data loading, transactions
  contract.js         address + ABI
  styles.css
  components/
    ProjectCard.jsx   project info and actions
    CreateProject.jsx create form (approved creators)
    AdminPanel.jsx    add / remove creators (admin)
```

## Notes
- The contract has no "list all projects" function, so the app loops from 1 to `totalProjects`.
- Only the admin wallet (and wallets the admin approves) can create projects.
- Only the creator can claim funds, and only after the deadline.
