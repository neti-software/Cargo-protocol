export interface Factors {
    [factor: string]: number
}

export interface Filter<T = {}> {
    id: T;
    name: string;
    addon?: string;
    address?: string;
    factors?: Factors
}

export const emptyFilterValue: Filter<string> = {
    id: '',
    name: ''
}
export const sortFilterValues: Filter<SortFilterOptions>[] = [
    {
        id: 'default asc',
        name: 'Sort by'
    },
    {
        id: 'tvl dsc',
        name: 'TVL Highest'
    },
    {
        id: 'tvl asc',
        name: 'TVL Lowest'
    },
    {
        id: 'apr dsc',
        name: 'APR Highest'
    },
    {
        id: 'apr asc',
        name: 'APR Lowest'
    },
    {
        id: 'apy dsc',
        name: 'APY Highest'
    },
    {
        id: 'apy asc',
        name: 'APY Lowest'
    },
]

export type SortFilterOptions = 'default asc' | 'tvl dsc' | 'tvl asc' | 'apr dsc' | 'apr asc' | 'apy dsc' | 'apy asc'
