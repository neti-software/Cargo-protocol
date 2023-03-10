
import {AbiItem, fromWei, toBN, toWei} from 'web3-utils';
import farmRegistryAbi from './UbeswapFarmRegistry.json';
import multiRewardAbi from './MultiStakingRewards.json';

import erc20 from './ERC20.json';
import {newKit} from '@celo/contractkit';
import {ethers} from "ethers";
import converter  from "json-2-csv";
import fs from 'fs'

const CREATION_BLOCK = 9840049
const LAST_N_BLOCKS = 1440 // Last 2 hours
const unique = (farms: any) =>{
    let unique: any = {};
    farms.forEach((fs: any)=>{
        if (!unique[fs.stakingToken]) {
            unique[fs.stakingToken] = fs
          }
          const current = unique[fs.stakingToken]
          if (toBN(fs.rewardsUSDPerYear).gt(toBN(current.rewardsUSDPerYear))) {
            unique[fs.stakingToken] = fs
          }
    });

    return Object.values(unique);
}

const scan = async () =>{
    const erc20Abi = erc20 as AbiItem[];
    const multiRewardAbiItem = multiRewardAbi as AbiItem[];
  const kit = newKit('https://forno.celo.org');
        const abi = farmRegistryAbi as AbiItem[]
        const farmRegistry = new kit.web3.eth.Contract(
            abi,
            '0xa2bf67e12EeEDA23C7cA1e5a34ae2441a17789Ec' //celo
        )
        const lastBlock = await kit.web3.eth.getBlockNumber()
        const [farmInfoEvents, lpInfoEvents, farmDataEvents] = await Promise.all([
            farmRegistry.getPastEvents('FarmInfo', {
                fromBlock: CREATION_BLOCK,
                toBlock: lastBlock,
            }),
            farmRegistry.getPastEvents('LPInfo', {fromBlock: CREATION_BLOCK, toBlock: lastBlock}),
            farmRegistry.getPastEvents('FarmData', {
                fromBlock: lastBlock - LAST_N_BLOCKS,
                toBlock: lastBlock,
            }),
        ]);
        const lps: Record<string, [string, string]> = {}
        lpInfoEvents.forEach((e) => {
            lps[e.returnValues.lpAddress] = [e.returnValues.token0Address, e.returnValues.token1Address]
        });
        const farmData: Record<string, any> = {}
        farmDataEvents.forEach((e) => {
            farmData[e.returnValues.stakingAddress] = {
                tvlUSD: e.returnValues.tvlUSD,
                rewardsUSDPerYear: e.returnValues.rewardsUSDPerYear,
            }
        });
        const farmSummaries: any[] = [];
        for(const e of farmInfoEvents)
        {
            if (!farmData[e.returnValues.stakingAddress]) {
                return
            }
            
            const token0 = new kit.web3.eth.Contract(
                erc20Abi,
                lps[e.returnValues.lpAddress][0] //celo
            );
            const token1 = new kit.web3.eth.Contract(
                erc20Abi,
                lps[e.returnValues.lpAddress][1] //celo
            );
            const token0Name = await token0.methods.name().call();
            const token1Name = await token1.methods.name().call();
            let rewardTokens = 1;
            let rewardsToken = '';
            let externalRewardToken1 = '';
            let externalRewardToken2 = '';
            let stakingToken = '';
            try{
                const multiStakingContract = new kit.web3.eth.Contract(
                    multiRewardAbiItem,
                    e.returnValues.stakingAddress);
                stakingToken = await multiStakingContract.methods.stakingToken().call();
                rewardsToken = await multiStakingContract.methods.rewardsToken().call();
                const externalRewardContractAddress = await multiStakingContract.methods.externalStakingRewards().call();
                const multiStakingContractToken = new kit.web3.eth.Contract(
                    multiRewardAbiItem,
                    externalRewardContractAddress);
                externalRewardToken1 = await multiStakingContractToken.methods.rewardsToken().call();
                rewardTokens = 2;
                console.log("External 1 reward exists for "+ethers.utils.parseBytes32String(e.returnValues.farmName));
                try {
                    const externalRewrdContractAddress2 = await multiStakingContractToken.methods.externalStakingRewards().call();
                    const multiStakingContractToken2 = new kit.web3.eth.Contract(
                        multiRewardAbiItem,
                        externalRewrdContractAddress2);
    
                    externalRewardToken2 = await multiStakingContractToken2.methods.rewardsToken().call();
                    rewardTokens = 3;
                    console.log("External 2 reward exists for "+ethers.utils.parseBytes32String(e.returnValues.farmName));


                }catch(ex){
                    externalRewardToken2 = '';
                    console.log("No external 2 reward for "+ethers.utils.parseBytes32String(e.returnValues.farmName));

                }

            } catch(ex){
                externalRewardToken1 = '';
                console.log("No external 1 reward for "+ethers.utils.parseBytes32String(e.returnValues.farmName));
            }

            farmSummaries.push({
                farmName: ethers.utils.parseBytes32String(e.returnValues.farmName),
                stakingAddress: e.returnValues.stakingAddress,
                rewardToken: rewardsToken,
                stakingToken: stakingToken,
                externalRewardToken1: externalRewardToken1,
                externalRewardToken2: externalRewardToken2,
                rewardTokens: rewardTokens, 
                token0Address: lps[e.returnValues.lpAddress][0], //pair0
                token1Address: lps[e.returnValues.lpAddress][1], //pair1
                token0Name,
                token1Name,
                tvlUSD: farmData[e.returnValues.stakingAddress].tvlUSD,
                rewardsUSDPerYear: farmData[e.returnValues.stakingAddress].rewardsUSDPerYear,
                
            })
        }

        console.log("BEFORE: "+farmSummaries.length);
        const result = unique(farmSummaries);
        console.log("AFTER: "+result.length)
        converter.json2csv(result as any, (err, csv)=>{
            fs.writeFileSync('ubeswap.csv', csv);
        });
    }
 scan();

