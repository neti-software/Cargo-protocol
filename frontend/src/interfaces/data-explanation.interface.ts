export interface DataExplanation {
    [key: string]: {    
        fieldName: string;
        text: string;
        strong?: string;
        suffix?: string;
    }
}

export const dataExplanations: DataExplanation = {
    debt: {
        fieldName: 'Debt',
        text: 'Debt shows you the total amount of debt owed for all borrowed assets of your connected wallet address including principal and accrued interest. It is expressed in your default currency (i.e. $ or €).',
    },
    deposit: {
        fieldName: "Collateral",
        text: "Collateral amount"

    },
    healthFactor: {
        fieldName: 'Health Factor',
        text: 'The Health Factor is a numeric representation of the safety of your deposited assets relative to your borrowed assets. The higher the Health Factor is, the safer your deposited funds are against a liquidation scenario. If your Health Factor reaches 1, the liquidation of your deposits will be triggered.',
        strong: 'Health Factor = (Total Collateral Deposits * Liquidation Threshold) / Total Debt'
    },
    newLTV: {
        fieldName: 'New LTV',
        suffix: "%",
        text: 'New LTV is a simulated loan-to-value ratio. It is intended to show you what your loan-to-value ratio would be if the current asset you\'ve selected and quantity you\'ve input were submitted as a transaction to the network and confirmed in a block',
        strong: 'LTV = Loan / Collateral Value * 100'
    },
    maxLTV: {
        fieldName: 'Maximum LTV',
        suffix: "%",
        text: 'The Maximum Loan-to-Value (LTV) ratio defines the maximum amount of currency that can be borrowed with a specific collateral. Maximum LTV is expressed as a percentage. For example, a Maximum LTV of 75% means that for every 1 CELO worth of collateral, borrowers will be able to borrow 0.75 CELO worth of another currency. Once a loan is taken, the LTV evolves with market conditions.',
    },
    liquidationThreshold: {
        fieldName: 'Liquidation threshold',
        suffix: "%",
        text: 'The Liquidation Threshold is the percentage at which a loan is defined as under collateralized. A liquidation threshold of 80% means that if your Loan-To-Value ratio goes above 80%, then your loan is under collateralized and some of your collateral can be liquidated. The delta between the Maximum Loan-To-Value (75%) and the Liquidation Threshold (80%) is a safety cushion for borrowers.',
    },
    debtAsset: {
        fieldName: 'Debt asset',
        text: 'A debt asset is any asset that has been borrowed from Moola.',
    },
    collateralAsset: {
        fieldName: 'Collateral asset',
        text: 'A collateral asset is any asset that is being used as collateral for a loan. This means that it can be liquidated if your Health Factor reaches 1. By default, all deposited assets are used as collateral.',
    },
    currentCollateralPrice: {
        fieldName: 'Current collateral price',
        text: 'Current prices are currency pair quotes where the \'base\' currency is your collateral asset and the \'quote\' currency is your debt asset. The prices reflect our most up-to-date information but may be different than the current mid-market price due to latency.',
    },
    collateralLiquidationPrice: {
        fieldName: 'Collateral liquidation price',
        text: 'Liquidation prices are currency pair quotes displayed to show you at what price your current loan-to-value ratio would exceed the liquidation threshold. For each price quote the \'base\' is your collateral asset and the \'quote\' is your debt asset. If you have multiple collateral assets deposited or have borrowed multiple assets, then the liquidation prices are displayed as \'or\' scenarios, not \'and\' scenarios.',
    },
    interestRateMode: {
        fieldName: 'Interest rate mode',
        text: 'Variable interest rates paid by borrowers are a function of market utilization. As the utilization of a market (i.e. borrows relative to deposits) increases, the interest rate charged to borrowers increases. As the utilization of a market decreases, the interest rate charged to borrowers decreases. Stable interest rates paid by borrowers will remain constant unless the average borrow rate is lower than 25% APY and the utilisation rate is over 95%. At which time, the borrowers interest rate will reset to the current market rate which could be substantially higher.',
    },
    interestRate: {
        suffix: "% APR",
        fieldName: 'Interest rate',
        text: 'The rate at which your total debt will compound while this loan is active. Variable interest loan rates will adjust each block in response to supply and demand for the borrowed asset. Stable interest rates paid by borrowers will remain constant unless the average borrow rate is lower than 25% APY and the utilization rate is over 95%. At which time, the borrowers interest rate will reset to the current market rate which could be substantially higher.',
    },
}
