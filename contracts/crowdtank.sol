// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CrowdTank {

    address public admin;

    uint public totalProjects;
    uint public successfulProjects;
    uint public failedProjects;

    struct Project {
        uint id;
        string name;
        string description;
        uint goal;
        uint raised;
        uint deadline;
        address creator;
        bool successful;
        bool failed;
        bool claimed;
    }

    mapping(uint => Project) public projects;
    mapping(address => bool) public approvedCreators;
    mapping(uint => mapping(address => uint)) public contributions;

    event ProjectCreated(
        uint indexed projectId,
        address indexed creator,
        string name,
        uint goal,
        uint deadline
    );

    event ProjectFunded(
        uint indexed projectId,
        address indexed user,
        uint amount
    );

    event ContributionWithdrawn(
        uint indexed projectId,
        address indexed user,
        uint amount
    );

    event ProjectFailed(uint indexed projectId);

    event FundsClaimed(
        uint indexed projectId,
        address indexed creator,
        uint amount
    );

    event CreatorAdded(address indexed creator);
    event CreatorRemoved(address indexed creator);

    constructor() {
        admin = msg.sender;
        approvedCreators[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyCreator() {
        require(approvedCreators[msg.sender], "Not approved creator");
        _;
    }

    // Admin functions

    function addCreator(address creator) external onlyAdmin {
        require(creator != address(0), "Invalid address");

        approvedCreators[creator] = true;

        emit CreatorAdded(creator);
    }

    function removeCreator(address creator) external onlyAdmin {
        require(creator != admin, "Cannot remove admin");

        approvedCreators[creator] = false;

        emit CreatorRemoved(creator);
    }

    // Create a crowdfunding project

    function createProject(
        string memory name,
        string memory description,
        uint goal,
        uint duration
    ) external onlyCreator {

        require(goal > 0, "Invalid goal");
        require(duration > 0, "Invalid duration");

        totalProjects++;

        projects[totalProjects] = Project({
            id: totalProjects,
            name: name,
            description: description,
            goal: goal,
            raised: 0,
            deadline: block.timestamp + duration,
            creator: msg.sender,
            successful: false,
            failed: false,
            claimed: false
        });

        emit ProjectCreated(
            totalProjects,
            msg.sender,
            name,
            goal,
            block.timestamp + duration
        );
    }

    // Fund project

    function fundProject(uint projectId) external payable {

        Project storage project = projects[projectId];

        require(project.id != 0, "Project not found");
        require(!project.successful, "Project successful");
        require(!project.failed, "Project failed");
        require(block.timestamp < project.deadline, "Deadline passed");
        require(msg.value > 0, "Send ETH");

        uint remaining = project.goal - project.raised;

        uint acceptedAmount = msg.value;

        // Accept only the required amount
        if (acceptedAmount > remaining) {
            acceptedAmount = remaining;
        }

        project.raised += acceptedAmount;
        contributions[projectId][msg.sender] += acceptedAmount;

        // Refund extra ETH
        if (msg.value > acceptedAmount) {
            payable(msg.sender).transfer(msg.value - acceptedAmount);
        }

        // Goal reached
        if (project.raised == project.goal) {
            project.successful = true;
            successfulProjects++;
        }

        emit ProjectFunded(
            projectId,
            msg.sender,
            acceptedAmount
        );
    }

    // User can withdraw before deadline

    function withdrawContribution(uint projectId) external {

        Project storage project = projects[projectId];

        require(!project.successful, "Project successful");
        require(!project.failed, "Project failed");
        require(block.timestamp < project.deadline, "Deadline passed");

        uint amount = contributions[projectId][msg.sender];

        require(amount > 0, "No contribution");

        contributions[projectId][msg.sender] = 0;

        project.raised -= amount;

        payable(msg.sender).transfer(amount);

        emit ContributionWithdrawn(
            projectId,
            msg.sender,
            amount
        );
    }

    // Mark project as failed after deadline

    function markProjectAsFailed(uint projectId) external {

        Project storage project = projects[projectId];

        require(project.id != 0, "Project not found");
        require(!project.successful, "Project successful");
        require(!project.failed, "Already failed");
        require(block.timestamp >= project.deadline, "Deadline not passed");
        require(project.raised < project.goal, "Goal reached");

        project.failed = true;

        failedProjects++;

        emit ProjectFailed(projectId);
    }

    // Refund contributors of failed project

    function refundFailedProject(uint projectId) external {

        Project storage project = projects[projectId];

        require(project.failed, "Project not failed");

        uint amount = contributions[projectId][msg.sender];

        require(amount > 0, "No contribution");

        contributions[projectId][msg.sender] = 0;

        payable(msg.sender).transfer(amount);

        emit ContributionWithdrawn(
            projectId,
            msg.sender,
            amount
        );
    }

    // Creator claims successful project funds

    function claimSuccessfulFunds(uint projectId) external {

        Project storage project = projects[projectId];

        require(project.successful, "Project not successful");
        require(msg.sender == project.creator, "Only creator");
        require(!project.claimed, "Already claimed");
        require(block.timestamp >= project.deadline, "Deadline not passed");

        project.claimed = true;

        uint amount = project.raised;

        payable(msg.sender).transfer(amount);

        emit FundsClaimed(
            projectId,
            msg.sender,
            amount
        );
    }

    // Funding percentage

    function getFundingPercentage(uint projectId)
        external
        view
        returns (uint)
    {
        Project memory project = projects[projectId];

        require(project.id != 0, "Project not found");

        return (project.raised * 100) / project.goal;
    }

    // Remaining amount

    function getRemainingFunding(uint projectId)
        external
        view
        returns (uint)
    {
        Project memory project = projects[projectId];

        require(project.id != 0, "Project not found");

        if (project.raised >= project.goal) {
            return 0;
        }

        return project.goal - project.raised;
    }

    // User contribution

    function getUserContribution(
        uint projectId,
        address user
    )
        external
        view
        returns (uint)
    {
        return contributions[projectId][user];
    }

    // Platform statistics

    function getPlatformStats()
        external
        view
        returns (
            uint,
            uint,
            uint
        )
    {
        return (
            totalProjects,
            successfulProjects,
            failedProjects
        );
    }
}