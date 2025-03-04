export interface Issue {
    text: string;
    uuid: string;
    description?: string;
    emoji: string;
    super?: string;
};



export interface IssueVote {
    issueUuid: string;
    numberOfVotes: number;
    creditsSpent: number;
};


export interface Participant {    
    name: string;
    userUuid: string;
    castedVotes: IssueVote[];

    created_at?: string;
    updated_at?: string;
};





export interface Vote {
    id?: number;
    uuid?: string;
    votingRoundUuid: string;

    name: string;
    remainingCredits: number;
    issues: Issue[];


    created_at?: string;
    updated_at?: string;
}




export interface IssueResult {

    issueContent: string;
    issueUuid: string;
    votes: VoteResult[];

    numVoters: number;

    nettoVotes: number;
    brutoVotes: number;

    inFavorVotes: number;
    opposedVotes: number;
    inFavorCredits: number;
    opposedCredits: number;
    totalCreditsSpent: number;
}

export interface VotingRoundOptions {
    forceSpread: boolean;
}


export interface VotingRound {

    id: number;
    uuid: string;
    name: string;
    description?: string;

    emoji: string;
    credits: number;
    issues: Issue[];
    options: VotingRoundOptions;

    participants?: Participant[];

    created_at?: string;
    updated_at?: string;

}


export interface VotingRoundResult {

    issueResults: IssueResult[];
    numVoters: number;
    creditsAvailable: number;
    creditsSpend: number;
    inFavorVotes: number;
    opposedVotes: number;
    inFavorCredits: number;
    opposedCredits: number;
    totalCreditsSpent: number;

    nettoWinner: string | null;
    nettoLoser: string | null;
    mostAttention: string | null;

}


export interface VoteResult {
    vote_uuid: string;
    votes: number;
    voted_by: string;
    credits: number;
}



export interface Flyer {
    index: number;
    show: boolean;
    direction: 'in' | 'out';
}