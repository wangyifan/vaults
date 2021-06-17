// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract VssBase {
    struct RevealedShare {
        bytes PubShare;
        bytes PubSig;
        bytes PriShare;
        bytes PriSig;
        bytes Revealed;
        address Violator;
        address Whistleblower;
    }

    mapping(address => bytes32) private vssPublicKeys;
    mapping(address => int) private vssNodeIndexs;  // value start from 0
    mapping(int => address) private reverseVSSNodeIndexs; // key start from 0, reverse of vssNodeIndexs
    mapping(address => uint) public vssNodeMemberships; // Indicates if the node is still in the vss group
    mapping(address => bytes) private vssPublicShares; // nodeID => list of public shares in json
    mapping(address => bytes) private vssPrivateShares; // nodeID => list of private shares in json

    // vote and slashing related data
    mapping(int => int) public votes; // config version => # of votes
    // config nested mapping config_version => (voter address => if voted or not for the config version)
    mapping(int => mapping(address => bool)) public voters;
    // slash index => number of slashing votes
    mapping(int => int) public slashingVotes;
    // slash index => number of reject votes
    mapping(int => int) public slashingRejects;
    // slash index => violator address  => voter => if voted
    mapping(int => mapping(address => bool)) public slashingVoters;
    // config version => number of total slashing votes
    mapping(int => int) public slashed;
    // check if share is revealed already
    mapping(bytes32 => bool) public revealed;
    // record the violator address of the revealed share
    mapping(int => address) public revealedViolator;
    // record the reporter address of the revealed share
    mapping(int => address) public revealedReporter;
    // record the actual revealed share
    mapping(int => RevealedShare) public reveals;
    // record index of last slashing voted
    mapping(address => int) public lastSlashingVoted;
    // mapping from sig sha to slash index
    mapping(bytes32 => int) public revealedSigMapping;
    // mapping from scs to the version number of its last config upload
    mapping(address => int) public lastConfigUpload;
    // mapping from scs to the block number of its last config upload
    mapping(address => int) public lastConfigUploadByBlock;
    // mapping from violator address to (inccident id => number of votes)
    mapping(address => mapping(int => uint)) public slowNodeVotes;
    // mapping from violator address to (inccident id => whether voted or not)
    mapping(address => mapping(int => mapping(address => bool))) public slowNodeVoted;

    address public owner;
    address public caller;
    address public lastSender;
    address public xeventsAddr;
    int public regStatus = 0;
    int public vssThreshold = 0;
    int public vssNodeCount = 0;
    int public vssConfigVersion = 0;
    int public revealIndex = 0;
    int public lastNodeChangeConfigVersion = 0;
    int public lastNodeChangeBlock = 0;
    int public slowNodeThreshold = 50; // number of blocks
    int constant MinThreshold = 1;

    // reserve for future usage
    mapping(bytes32 => mapping(int => bytes)) public generalAttributes;

    enum VssMembership {noreg, active, inactive} // noreg: node never seen before

    constructor(int threshold) {
        require(threshold >= MinThreshold);
        vssThreshold = threshold;
        owner = msg.sender;
    }

    function regOpen() public {
        require(owner == msg.sender);
        regStatus = 1;
    }

    function regClose() public {
        require(owner == msg.sender);
        regStatus = 0;
    }

    function setGeneralAttributes(bytes32 namespace, int key, bytes memory value) public {
        require(owner == msg.sender);
        generalAttributes[namespace][key] = value;
    }

    function setThreshold(int newThreshold) public {
        require(owner == msg.sender);
        require(newThreshold >= MinThreshold);
        vssThreshold = newThreshold;
        vssConfigVersion++;
    }

    function setCaller(address callerAddr) public {
        require(owner == msg.sender);
        caller = callerAddr;
    }

    function setOwner(address newOwner) public {
        require(owner == msg.sender);
        owner = newOwner;
    }

    function setSlowNodeThreshold(int newThreshold) public {
        require(owner == msg.sender);
        slowNodeThreshold = newThreshold;
    }

    function setXevents(address contractAddr) public {
        require(caller == msg.sender || owner == msg.sender);
        xeventsAddr = contractAddr;
    }

    function registerVSS(address sender, bytes32 publickey) public {
        require(caller == msg.sender || owner == msg.sender);
        //require(regStatus == 1);
        lastSender = msg.sender;
        vssPublicKeys[sender] = publickey;
    }

    function unregisterVSS(address sender) public {
        require(caller == msg.sender || owner == msg.sender) ;
        lastSender = msg.sender;

        if (vssNodeMemberships[sender] == uint(VssMembership.active)) {
            vssNodeMemberships[sender] = uint(VssMembership.inactive);
            lastNodeChangeConfigVersion = vssConfigVersion;
            lastNodeChangeBlock = int(block.number);
        }
    }

    function deactivateVSS(address sender) public {
        require(caller == msg.sender || owner == msg.sender) ;
        if (vssNodeMemberships[sender] == uint(VssMembership.active)) {
            vssNodeMemberships[sender] = uint(VssMembership.inactive);
            vssConfigVersion++;
        }
    }

    function activateVSS(address sender) public {
        require(caller == msg.sender || owner == msg.sender);
        //require(regStatus == 1);
        lastSender = msg.sender;

        // if it is a node we never seen before which is noreg
        if (vssNodeMemberships[sender] == uint(VssMembership.noreg)) {
            vssNodeIndexs[sender] = vssNodeCount;
            reverseVSSNodeIndexs[vssNodeCount] = sender;
            vssNodeCount++;
            vssNodeMemberships[sender] = uint(VssMembership.active);
            lastNodeChangeConfigVersion = vssConfigVersion;
            lastNodeChangeBlock = int(block.number);
        }

        // if it is a node we know before, just re-active it
        if (vssNodeMemberships[sender] == uint(VssMembership.inactive)) {
            vssNodeMemberships[sender] = uint(VssMembership.active);
            lastNodeChangeConfigVersion = vssConfigVersion;
            lastNodeChangeBlock = int(block.number);
        }
    }

    function uploadVSSConfig(bytes memory publicShares, bytes memory privateShares) public {
        // only active member can upload vss config
        if (vssNodeMemberships[msg.sender] != uint(VssMembership.active)) {
            return;
        }

        vssPublicShares[msg.sender] = publicShares;
        vssPrivateShares[msg.sender] = privateShares;
        vssConfigVersion++;
        lastConfigUpload[msg.sender] = vssConfigVersion;
        lastConfigUploadByBlock[msg.sender] = int(block.number);
    }

    // vote the vss config to be ready
    function vote(int configVersion) public {
        // must be active member and can not vote twice
        require(vssNodeMemberships[msg.sender] == uint(VssMembership.active));
        require(voters[configVersion][msg.sender] == false);

        votes[configVersion] += 1;
        voters[configVersion][msg.sender] = true;
    }

    // use reportSlowNode to report node that's slow in uploading new config after node change
    function reportSlowNode(address violator) public {
        // must be active member to report
        require(vssNodeMemberships[msg.sender] == uint(VssMembership.active));

        int currentBlockNumber = int(block.number);
        int nodeUploadBlockNumber = lastConfigUploadByBlock[violator];
        // if it's behind node change config version and is too far ( > slowNodeThreshold) away
        if (lastConfigUpload[violator] < lastNodeChangeConfigVersion && (currentBlockNumber - lastNodeChangeBlock) > slowNodeThreshold) {
            // one node can only report once for one inccident
            if (slowNodeVoted[violator][nodeUploadBlockNumber][msg.sender] == false) {
                slowNodeVotes[violator][nodeUploadBlockNumber] += 1;
                slowNodeVoted[violator][nodeUploadBlockNumber][msg.sender] = true;
            }

            // if more than threshold nodes report, then slash the violator
            if (slowNodeVotes[violator][nodeUploadBlockNumber] >= uint(vssThreshold)) {
                //SubChainBase subchainbaseContract = SubChainBase(caller);
                //subchainbaseContract.vssSlash(violator);
            }
        }
    }

    // use reveal to upload bad shares sent by other member nodes
    function reveal(address violator, bytes memory pubShare, bytes memory pubSig, bytes memory priShare, bytes memory priSig, bytes memory revealedPri) public {
        // must be active member to call reveal
        require(vssNodeMemberships[msg.sender] == uint(VssMembership.active));
        bytes32 sigSha = keccak256(abi.encodePacked(pubSig, priSig));
        require(revealed[sigSha] == false);

        revealedViolator[revealIndex] = violator;
        revealedReporter[revealIndex] = msg.sender;
        reveals[revealIndex] = RevealedShare({
            PubShare: pubShare,
            PubSig: pubSig,
            PriShare: priShare,
            PriSig: priSig,
            Revealed: revealedPri,
            Violator:violator,
            Whistleblower: msg.sender
        });
        revealed[sigSha] = true;
        revealedSigMapping[sigSha] = revealIndex;
        revealIndex += 1;

        // after reveal, at least one of the private keys is public.
        // we need to notify the whole group to run vss protocol again
    }

    function getRevealedShare(int index) public view returns(RevealedShare memory){
        return reveals[index];
    }

    // index is the id for the slashing round
    function slashing(int index, bool slash) public {
        // must be active member to call slashing
        require(vssNodeMemberships[msg.sender] == uint(VssMembership.active));
        // can not slash twice
        require(slashingVoters[index][msg.sender] == false);

        // mark we slashed
        slashingVoters[index][msg.sender] = true;
        address toBeSlashed;

        // slash in the subchainbase contract
        if (slash == true) {
            slashingVotes[index] += 1;
            if (slashingVotes[index] >= vssThreshold) {
                toBeSlashed = revealedViolator[index];
                //subchainbaseContract.vssSlash(toBeSlashed);
            }
        } else {
            slashingRejects[index] += 1;
            if (slashingRejects[index] >= vssThreshold) {
                toBeSlashed = revealedReporter[index];
                //subchainbaseContract.vssSlash(toBeSlashed);
            }
        }

        // update last slash index only if current one is higher
        if (index > lastSlashingVoted[msg.sender]) {
            lastSlashingVoted[msg.sender] = index;
        }
    }

    function getLastSlashVoted(address addr) public view returns(int) {
        return  lastSlashingVoted[addr];
    }

    function isConfigReady(int configVersion) public view returns(bool) {
        if (votes[configVersion] >= vssThreshold) {
            return true;
        }

        return false;
    }

    function isSlashed(int configVersion) public view returns(bool) {
        return slashed[configVersion] > 0;
    }

    function GetLastSender() public view returns(address) {
        return lastSender;
    }

    function GetCaller() public view returns(address) {
        return caller;
    }

    function getPublicShares(address node) public view returns(bytes memory) {
        return vssPublicShares[node];
    }

    function getPrivateShares(address node) public view returns(bytes memory) {
        return vssPrivateShares[node];
    }

    function getVSSNodesPubkey(address[] memory nodes) public view returns (bytes32[] memory) {
        uint n = nodes.length;
        bytes32[] memory publickeys = new bytes32[](n);
        for(uint i = 0; i < nodes.length; i++) {
            publickeys[i] = vssPublicKeys[nodes[i]];
        }
        return publickeys;
    }

    function getActiveVSSMemberCount() public view returns (int) {
        int result = 0;
        for(int i=0;i<vssNodeCount;i++) {
            if (vssNodeMemberships[reverseVSSNodeIndexs[i]] == uint(VssMembership.active)) {
                result++;
            }
        }

        return result;
    }

    function getActiveVSSMemberList() public view returns (address[] memory) {
        int n = getActiveVSSMemberCount();
        address[] memory addressList = new address[](uint(n));
        uint index = 0;
        for(int i = 0;i < vssNodeCount; i++) {
            if (vssNodeMemberships[reverseVSSNodeIndexs[i]] == uint(VssMembership.active)) {
                addressList[index] = reverseVSSNodeIndexs[i];
                index++;
            }
        }

        return addressList;
    }

    function getVSSNodesIndexs(address[] memory nodes) public view returns (int[] memory) {
        uint n = nodes.length;
        int[] memory indexs = new int[](n);
        for(uint i = 0; i < nodes.length; i++) {
            indexs[i] = vssNodeIndexs[nodes[i]];
        }
        return indexs;
    }

    function getVSSNodeIndex(address scs) public view returns (int) {
        return vssNodeIndexs[scs];
    }

    function resetVSSGroup() public view {
        require(owner == msg.sender);
    }
}
