pragma solidity 0.8.4;


///@title MuliSignatureContract
///@author NETI
///@dev 
contract MultiSignatureContract {
    /* ========== EVENTS ========== */
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);
    event SubmitTransaction(address indexed owner,uint256 indexed txIndex,address indexed to,bytes data);
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event MinimumConfirmationChange(uint required);

    address[] public owners;
    mapping(address => bool) public isOwner;
    mapping(uint256 => mapping(address => bool)) public isConfirmed;
    uint256 public MIN_SIGNATURES;
    Transaction[] public transactions;

    struct Transaction {
        address to;
        bool executed;
        bytes data;
        uint256 confirmations;
        string desc;
    }

    /* ========== MODIFIERS ========== */
    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "tx does not exist");
        _;
    }
    
    modifier onlyWallet() {
        require(msg.sender == address(this),"not MultiSig wallet");
        _;
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier ownerDoesNotExist(address owner) {
        require(!isOwner[owner]);
        _;
    }

    modifier ownerExists(address owner) {
        require(isOwner[owner],"owner does not exist");
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
        _;
    }

    modifier validOwnerCount(uint ownerCount, uint _required) {
        require(_required <= ownerCount
            && _required != 0
            && ownerCount != 0);
        _;
    }

    
    ///@dev Contract constructor sets initial owners and required number for transaction confirmations.
    ///@param _owners List of initial owners.
    ///@param _MIN_SIGNATURES Number of required confirmations
    constructor(address[] memory _owners, uint256 _MIN_SIGNATURES) {
        require(_owners.length > 0, "owners required");
        require(_MIN_SIGNATURES > 0 &&_MIN_SIGNATURES <= _owners.length,
            "invalid number of required confirmations"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }
        MIN_SIGNATURES = _MIN_SIGNATURES;
    }

    /* ========== TRANSACTION FUNCTIONS ========== */
    
    ///@dev Submit and confirm transaction
    ///@param _to Receiver address
    ///@param _data Transaction data
    ///@param _desc Description of transaction
     function submitTransaction(address _to, bytes memory _data, string memory _desc) public onlyOwner {
        require(_to != address(0),"address 0 provided");
        uint256 txIndex = transactions.length;
        transactions.push(
            Transaction({
                to: _to,
                data: _data,
                executed: false,
                confirmations: 0,
                desc: _desc
            })
        );
        // submitter is confirming the transaction at once
        confirmTransaction(txIndex);
        emit SubmitTransaction(msg.sender, txIndex, _to, _data);
    }
    ///@dev Confirming transaction
    ///@param _txIndex Transaction index
    function confirmTransaction(uint256 _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) notConfirmed(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];
        transaction.confirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    /// @dev Executes transaciton 
    /// @notice (minimum confirmations required to execute)
    /// @param _txIndex Transaction index
    function executeTransaction(uint256 _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];
        require(transaction.confirmations >= MIN_SIGNATURES,"not enought confirmations to execute tx");
        transaction.executed = true;
        (bool success, ) = transaction.to.call(transaction.data);
        require(success, "tx failed");
        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    /// @dev Revoking the confirmation vote
    /// @notice (transaction confirmaction required)
    /// @param _txIndex Transaction index
    function revokeConfirmation(uint256 _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];
        require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");
        transaction.confirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;
        emit RevokeConfirmation(msg.sender, _txIndex);
    }
    /// @dev Receive transaction details
    /// @param _txIndex Transaction index
    /// @return to Reciever address
    /// @return data tranasction byte data
    /// @return executed - execution bool information 
    /// @return confirmations - confirmations counter
    /// @return desc transaction description 
    function getTransaction(uint256 _txIndex)
        public
        view
        returns (
            address to,
            bytes memory data,
            bool executed,
            uint256 confirmations,
            string memory desc
        )
    {
        Transaction storage transaction = transactions[_txIndex];

        return (transaction.to,transaction.data,transaction.executed,transaction.confirmations,transaction.desc);
    }

    
    ///@dev Change required tranaction confirmation. 
    ///@notice Transaction has to be signed and send by MultiSig wallet.
    ///@param _MIN_SIGNATURES Number of required confirmations. 
    
    function changeMinConfimation(uint _MIN_SIGNATURES)
        public
        onlyWallet
        validOwnerCount(owners.length, MIN_SIGNATURES)
    {
        MIN_SIGNATURES = _MIN_SIGNATURES;
        emit MinimumConfirmationChange(_MIN_SIGNATURES);
    }
    
    /// @dev Add new Owner 
    /// @notice Transaction has to be signed and send by MultiSig wallet.
    /// @param owner Address of new owner.
    function addOwner(address owner) public onlyWallet ownerDoesNotExist(owner) validOwnerCount(owners.length + 1, MIN_SIGNATURES) {
        isOwner[owner] = true;
        owners.push(owner);
        emit OwnerAdded(owner);
    }

    /// @dev Remove owner from owners list
    /// @notice Transaction has to be signed and send by MultiSig wallet.
    /// @param owner Address of owner to remove
    function removeOwner(address owner) public onlyWallet ownerExists(owner) {
        isOwner[owner] = false;
        for (uint i=0; i<owners.length - 1; i++)
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                break;
            }
        owners.pop();
        if (MIN_SIGNATURES > owners.length)
            changeMinConfimation(owners.length);
        emit OwnerRemoved(owner);
    }

    /// @dev Returns list of owners
    /// @return owners - list
    function getOwners() public view returns (address[] memory) {
        return owners;
    }
    /// @dev Returns count of transactions
    /// @return tranasatcions.length - number
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }
}
