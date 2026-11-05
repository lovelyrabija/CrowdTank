// Contract settings. Change the address here if you redeploy.
export const CONTRACT_ADDRESS = "0x48BA24A96B2f1C0D7CA4c8F75055d7b8c2FE73f2".toLowerCase();
export const ADMIN_ADDRESS = "0x06Bce163b83BfeF9C8E655FA0549DED10516b536".toLowerCase();

export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111

// Human-readable ABI (ethers v6) - matches the deployed CrowdTank.sol
export const ABI = [
  "function admin() view returns (address)",
  "function totalProjects() view returns (uint256)",
  "function approvedCreators(address) view returns (bool)",
  "function projects(uint256) view returns (uint256 id, string name, string description, uint256 goal, uint256 raised, uint256 deadline, address creator, bool successful, bool failed, bool claimed)",
  "function getUserContribution(uint256 projectId, address user) view returns (uint256)",
  "function getPlatformStats() view returns (uint256, uint256, uint256)",
  "function addCreator(address creator)",
  "function removeCreator(address creator)",
  "function createProject(string name, string description, uint256 goal, uint256 duration)",
  "function fundProject(uint256 projectId) payable",
  "function withdrawContribution(uint256 projectId)",
  "function markProjectAsFailed(uint256 projectId)",
  "function refundFailedProject(uint256 projectId)",
  "function claimSuccessfulFunds(uint256 projectId)",
];
